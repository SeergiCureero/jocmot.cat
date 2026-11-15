import { normalizeWord } from '@/lib/text';
import type { GameStatus } from '@/services/backend';
import { CATEGORIES, type Category } from './data/categories';

export const ROUNDS = 7;
export const ROUND_SECONDS = 25;

export interface Answer {
  /** Resposta normalitzada; buida si el temps s'ha acabat o s'ha passat. */
  word: string;
  points: number;
}

export interface FondariaState {
  answers: Answer[];
  /** Quan va començar la ronda actual (ms). Es desa: en recarregar la pàgina el temps no es reinicia. */
  roundStartedAt: number;
}

export const initialState = (now = Date.now()): FondariaState => ({
  answers: [],
  roundStartedAt: now,
});

export const getStatus = (s: FondariaState): GameStatus =>
  s.answers.length >= ROUNDS ? 'won' : 'playing';

// ── Preguntes del dia ──

export interface Prompt {
  /** Text de la pregunta. */
  text: string;
  category: Category;
}

/** Generador pseudoaleatori determinista (mateixes preguntes per a tothom el mateix dia). */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Les categories del dia, de més fàcils a més difícils: com més avances, més fons.
 * Ha de donar el mateix que `backend/pb_hooks/jocmot_fondaria.js` (ho comprova un test).
 */
export function scheduleFor(
  puzzleNumber: number,
  categories: readonly Category[] = CATEGORIES,
): Category[] {
  const r = rng(puzzleNumber * 7919 + 13);
  const left = [...categories];
  const take = (pool: Category[]): Category => {
    const c = pool[Math.floor(r() * pool.length)];
    left.splice(left.indexOf(c), 1);
    return c;
  };
  const easy = () => left.filter((c) => !c.hard);
  const hard = () => left.filter((c) => c.hard);
  return [
    take(easy()),
    take(easy()),
    take(easy()),
    take(easy()),
    take(left),
    take(left),
    take(hard().length ? hard() : left),
  ];
}

export const buildPrompts = (puzzleNumber: number): Prompt[] =>
  scheduleFor(puzzleNumber).map((category) => ({
    category,
    text: `Digues ${category.prompt.charAt(0).toLowerCase()}${category.prompt.slice(1)}`,
  }));

// ── Respostes i punts ──

/** Posició (0 = la més habitual) de cada resposta d'una categoria, normalitzada. */
const rankCache = new WeakMap<Category, Map<string, number>>();
function ranks(c: Category): Map<string, number> {
  let m = rankCache.get(c);
  if (!m) {
    const fresh = new Map<string, number>();
    c.answers.forEach((a, i) => {
      const key = normalizeWord(a);
      if (!fresh.has(key)) fresh.set(key, i);
    });
    rankCache.set(c, fresh);
    m = fresh;
  }
  return m;
}

/** La resposta (normalitzada) si és de la llista de la categoria, o null. */
export function fitsPrompt(prompt: Prompt, raw: string): string | null {
  const word = normalizeWord(raw);
  return word && ranks(prompt.category).has(word) ? word : null;
}

/** Punts de partida d'una resposta: com més avall a la llista, més rara i més punts (10-100). */
export function seedPoints(rank: number, size: number): number {
  const last = Math.max(1, size - 1);
  return Math.max(10, Math.min(100, Math.round(10 + 90 * Math.pow(rank / last, 0.85))));
}

/**
 * Punts amb el que diu la comunitat: `count` jugadors han dit aquesta resposta d'un total de `total`
 * a la categoria. Com més gent la diu, menys punts. Amb poques respostes, mana la posició a la llista.
 * Ha de donar el mateix que el servidor (`jocmot_fondaria.js`).
 */
export function blendPoints(seed: number, count: number, total: number): number {
  if (total < 5) return seed;
  const share = Math.min(1, count / total / 0.25);
  const community = 100 - 90 * share;
  const weight = Math.min(1, total / 60);
  return Math.max(10, Math.min(100, Math.round((1 - weight) * seed + weight * community)));
}

/** Punts d'una resposta vàlida, només amb la llista (sense connexió o sense compte). */
export function pointsFor(prompt: Prompt, word: string): number {
  const rank = ranks(prompt.category).get(word) ?? 0;
  return seedPoints(rank, prompt.category.answers.length);
}

/** Nivell de raresa de 0 (molt habitual) a 5 (molt rara). */
export function tierFor(points: number): number {
  return points < 25
    ? 0
    : points < 40
      ? 1
      : points < 55
        ? 2
        : points < 70
          ? 3
          : points < 85
            ? 4
            : 5;
}

export const totalDepth = (s: FondariaState) => s.answers.reduce((t, a) => t + a.points, 0);

/** Segons que queden a la ronda actual. */
export const secondsLeft = (s: FondariaState, now: number) =>
  Math.max(0, ROUND_SECONDS - (now - s.roundStartedAt) / 1000);

/** Apunta una resposta (o un "passo") i comença la ronda següent. */
export function addAnswer(s: FondariaState, answer: Answer, now: number): FondariaState {
  if (s.answers.length >= ROUNDS) return s;
  return { answers: [...s.answers, answer], roundStartedAt: now };
}

/**
 * Si en tornar a la pàgina han passat rondes senceres, es donen per perdudes (el temps no s'atura
 * en tancar la pestanya).
 */
export function expireRounds(s: FondariaState, now: number): FondariaState {
  let next = s;
  while (next.answers.length < ROUNDS && secondsLeft(next, now) <= 0) {
    next = addAnswer(next, { word: '', points: 0 }, next.roundStartedAt + ROUND_SECONDS * 1000);
  }
  return next;
}

const TIER_EMOJI = ['⬜', '🟦', '🟩', '🟨', '🟧', '🟥'];

export function buildShareText(puzzleNumber: number, s: FondariaState, url: string): string {
  const row = s.answers.map((a) => (a.word ? TIER_EMOJI[tierFor(a.points)] : '⬛')).join('');
  return `Fondària #${puzzleNumber} · ${totalDepth(s)} m\n${row}\n${url}`;
}
