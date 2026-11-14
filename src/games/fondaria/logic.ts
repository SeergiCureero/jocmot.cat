import { normalizeWord } from '@/lib/text';
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
  /** Comprova la forma de la paraula (ja normalitzada i de 4 lletres o més). */
  test: (word: string) => boolean;
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

const EASY_START = ['CA', 'PA', 'ES', 'CO', 'MA', 'SA', 'PE', 'BA', 'AL', 'RE'];
const END = ['AR', 'ER', 'IR', 'OR', 'ES', 'AT', 'ENT', 'ITAT', 'ISME', 'ADA'];
const INSIDE = ['LL', 'NY', 'RR', 'TX', 'IG', 'QU', 'GU', 'SS'];
const RARE_INSIDE = ['X', 'Z', 'J', 'Q', 'K'];
const HARD_START = ['PR', 'TR', 'CR', 'FL', 'GR', 'BL', 'ST', 'EX', 'IN', 'DE'];

const starts = (s: string): Prompt => ({
  text: `Una paraula que comenci per «${s}»`,
  test: (w) => w.startsWith(s),
});
const ends = (s: string): Prompt => ({
  text: `Una paraula que acabi en «-${s}»`,
  test: (w) => w.endsWith(s),
});
const has = (s: string): Prompt => ({
  text: `Una paraula que tingui «${s}»`,
  test: (w) => w.includes(s),
});
const longStart = (s: string, n: number): Prompt => ({
  text: `Una paraula de ${n} lletres que comenci per «${s}»`,
  test: (w) => w.length === n && w.startsWith(s),
});
const shortEnd = (s: string, n: number): Prompt => ({
  text: `Una paraula de ${n} lletres que acabi en «-${s}»`,
  test: (w) => w.length === n && w.endsWith(s),
});
const sameEnds: Prompt = {
  text: 'Una paraula que comenci i acabi amb la mateixa lletra',
  test: (w) => w[0] === w[w.length - 1],
};

/**
 * Les set preguntes del dia, de més fàcils a més difícils: com més avances, més fons.
 * Mai es repeteix una mateixa pregunta en un dia.
 */
export function buildPrompts(puzzleNumber: number): Prompt[] {
  const r = rng(puzzleNumber * 7919 + 13);
  const pick = <T>(list: readonly T[]): T => list[Math.floor(r() * list.length)];
  const used = new Set<string>();
  const unique = (make: () => Prompt): Prompt => {
    for (let i = 0; i < 20; i++) {
      const p = make();
      if (!used.has(p.text)) {
        used.add(p.text);
        return p;
      }
    }
    return make();
  };
  return [
    unique(() => starts(pick(EASY_START))),
    unique(() => starts(pick(EASY_START))),
    unique(() => ends(pick(END))),
    unique(() => has(pick(INSIDE))),
    unique(() => longStart(pick(HARD_START), 6 + Math.floor(r() * 3))),
    unique(() => (r() < 0.5 ? sameEnds : shortEnd(pick(['AR', 'ER', 'IR', 'OR']), 4))),
    unique(() => has(pick(RARE_INSIDE))),
  ];
}

/** Una resposta és vàlida si compleix la forma de la pregunta (el diccionari es comprova a part). */
export function fitsPrompt(prompt: Prompt, raw: string): string | null {
  const word = normalizeWord(raw);
  return word.length >= MIN_LENGTH && prompt.test(word) ? word : null;
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
