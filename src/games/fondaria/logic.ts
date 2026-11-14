import { normalizeWord } from '@/lib/text';
import { CATEGORIES, type Category } from './data/categories';
import type { GameStatus } from '@/services/backend';

export const ROUNDS = 7;
export const ROUND_SECONDS = 25;
export const MIN_LENGTH = 4;

export interface Answer {
  /** Paraula normalitzada; buit si el temps s'ha acabat o s'ha passat. */
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
  /** `category`: llista de respostes conegudes (de tot); `pattern`: paraula del diccionari amb una forma. */
  kind: 'category' | 'pattern';
  /** Només per a les de forma: comprova la paraula (ja normalitzada i de 4 lletres o més). */
  test: (word: string) => boolean;
  /** Només per a les categories. */
  category?: Category;
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

const END = ['AR', 'ER', 'IR', 'OR', 'ES', 'AT', 'ENT', 'ITAT', 'ISME', 'ADA'];
const INSIDE = ['LL', 'NY', 'RR', 'TX', 'IG', 'QU', 'GU', 'SS'];
const HARD_START = ['PR', 'TR', 'CR', 'FL', 'GR', 'BL', 'EX', 'IN', 'DE'];

const starts = (s: string): Prompt => ({
  text: `Una paraula que comenci per «${s}»`,
  kind: 'pattern',
  test: (w) => w.startsWith(s),
});
const ends = (s: string): Prompt => ({
  text: `Una paraula que acabi en «-${s}»`,
  kind: 'pattern',
  test: (w) => w.endsWith(s),
});
const has = (s: string): Prompt => ({
  text: `Una paraula que tingui «${s}»`,
  kind: 'pattern',
  test: (w) => w.includes(s),
});
const longStart = (s: string, n: number): Prompt => ({
  text: `Una paraula de ${n} lletres que comenci per «${s}»`,
  kind: 'pattern',
  test: (w) => w.length === n && w.startsWith(s),
});
const sameEnds: Prompt = {
  text: 'Una paraula que comenci i acabi amb la mateixa lletra',
  kind: 'pattern',
  test: (w) => w[0] === w[w.length - 1],
};

const asPrompt = (c: Category): Prompt => ({
  text: `Digues ${c.prompt.charAt(0).toLowerCase()}${c.prompt.slice(1)}`,
  kind: 'category',
  category: c,
  test: () => false,
});

/**
 * Les set preguntes del dia, de més fàcils a més difícils: com més avances, més fons.
 * Sis són categories de tot (animals, països, menjar, música…) i una és de paraules (amb una forma).
 * Mai es repeteix una categoria en un dia.
 */
export function buildPrompts(puzzleNumber: number): Prompt[] {
  const r = rng(puzzleNumber * 7919 + 13);
  const pick = <T>(list: readonly T[]): T => list[Math.floor(r() * list.length)];
  const left = [...CATEGORIES];
  const take = (pool: Category[]): Prompt => {
    const c = pick(pool);
    left.splice(left.indexOf(c), 1);
    return asPrompt(c);
  };
  const easy = () => left.filter((c) => !c.hard);
  const hard = () => left.filter((c) => c.hard);
  const any = () => left;
  const pattern = (): Prompt => {
    const makers = [
      () => starts(pick(HARD_START)),
      () => ends(pick(END)),
      () => has(pick(INSIDE)),
      () => longStart(pick(HARD_START), 6 + Math.floor(r() * 3)),
      () => sameEnds,
    ];
    return pick(makers)();
  };
  return [
    take(easy()),
    take(easy()),
    take(easy()),
    take(easy()),
    pattern(),
    take(any()),
    take(hard().length ? hard() : any()),
  ];
}

/** Respostes d'una categoria, normalitzades, amb la seva posició (0 = la més habitual). */
const rankCache = new WeakMap<Category, Map<string, number>>();
function ranks(c: Category): Map<string, number> {
  let m = rankCache.get(c);
  if (!m) {
    m = new Map();
    c.answers.forEach((a, i) => {
      const key = normalizeWord(a);
      if (!m!.has(key)) m!.set(key, i);
    });
    rankCache.set(c, m);
  }
  return m;
}

/**
 * La resposta (normalitzada) si compleix la pregunta, o null. Les categories només accepten el que
 * és a la llista; les de paraules, qualsevol paraula amb la forma demanada (el diccionari es comprova a part).
 */
export function fitsPrompt(prompt: Prompt, raw: string): string | null {
  const word = normalizeWord(raw);
  if (prompt.kind === 'category') return word && ranks(prompt.category!).has(word) ? word : null;
  return word.length >= MIN_LENGTH && prompt.test(word) ? word : null;
}

/** Punts d'una resposta vàlida: en una categoria, com més rara (més avall a la llista), més punts. */
export function pointsFor(prompt: Prompt, word: string): number {
  if (prompt.kind !== 'category') return wordPoints(word);
  const rank = ranks(prompt.category!).get(word) ?? 0;
  const last = Math.max(1, prompt.category!.answers.length - 1);
  return Math.max(10, Math.min(100, Math.round(10 + 90 * Math.pow(rank / last, 0.85))));
}

// ── Punts: com més rara la paraula, més fons ──

const RARE_LETTERS = 'XZJQKWY';
const TOUGH_GROUPS = /LL|NY|TX|IG|QU|GU|RR|SS|Ç/;

/**
 * Raresa estimada de la paraula (10-100). De moment es calcula amb la llargada i les lletres poc
 * habituals; quan hi hagi prou partides, la calcularà la comunitat (com més gent la diu, menys punts).
 */
export function wordPoints(word: string): number {
  const rare = Math.min(2, [...word].filter((c) => RARE_LETTERS.includes(c)).length);
  const points =
    10 + (word.length - MIN_LENGTH) * 8 + rare * 20 + (TOUGH_GROUPS.test(word) ? 10 : 0);
  return Math.max(10, Math.min(100, points));
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
