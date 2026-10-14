import type { GameStatus } from '@/services/backend/types';
import { normalizeWord } from '@/lib/text';

export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;

export type LetterState = 'correct' | 'present' | 'absent';

export interface ParaulaState {
  /** Intents ja enviats (normalitzats, en majúscules). */
  guesses: string[];
  status: GameStatus;
}

export const initialState = (): ParaulaState => ({ guesses: [], status: 'playing' });
export const getStatus = (s: ParaulaState): GameStatus => s.status;

/** Avalua un intent amb el comportament clàssic de lletres repetides. */
export function evaluateGuess(guess: string, answer: string): LetterState[] {
  const g = [...normalizeWord(guess)];
  const a = [...normalizeWord(answer)];
  const result: LetterState[] = g.map(() => 'absent');
  const remaining = new Map<string, number>();

  g.forEach((ch, i) => {
    if (ch === a[i]) result[i] = 'correct';
    else remaining.set(a[i], (remaining.get(a[i]) ?? 0) + 1);
  });
  g.forEach((ch, i) => {
    if (result[i] === 'correct') return;
    const left = remaining.get(ch) ?? 0;
    if (left > 0) {
      result[i] = 'present';
      remaining.set(ch, left - 1);
    }
  });
  return result;
}

export type GuessError = 'too-short' | 'not-in-dictionary';

/** Aplica un intent. Retorna el nou estat o un error de validació. */
export function submitGuess(
  state: ParaulaState,
  rawGuess: string,
  answer: string,
  isValidWord: (word: string) => boolean,
): { state: ParaulaState } | { error: GuessError } {
  const guess = normalizeWord(rawGuess);
  if (guess.length !== WORD_LENGTH) return { error: 'too-short' };
  if (!isValidWord(guess)) return { error: 'not-in-dictionary' };

  const guesses = [...state.guesses, guess];
  const won = guess === normalizeWord(answer);
  const status: GameStatus = won ? 'won' : guesses.length >= MAX_GUESSES ? 'lost' : 'playing';
  return { state: { guesses, status } };
}

const PRIORITY: Record<LetterState, number> = { absent: 0, present: 1, correct: 2 };

/** Millor estat conegut de cada lletra, per pintar el teclat. */
export function keyboardStates(guesses: string[], answer: string): Record<string, LetterState> {
  const out: Record<string, LetterState> = {};
  for (const guess of guesses) {
    evaluateGuess(guess, answer).forEach((st, i) => {
      const ch = guess[i];
      if (!out[ch] || PRIORITY[st] > PRIORITY[out[ch]]) out[ch] = st;
    });
  }
  return out;
}

const EMOJI: Record<LetterState, string> = { correct: '🟩', present: '🟨', absent: '⬜' };

export function buildShareText(puzzleNumber: number, state: ParaulaState, answer: string, url: string): string {
  const score = state.status === 'won' ? state.guesses.length : 'X';
  const rows = state.guesses.map((g) => evaluateGuess(g, answer).map((s) => EMOJI[s]).join(''));
  return `Paraula #${puzzleNumber} ${score}/${MAX_GUESSES}\n\n${rows.join('\n')}\n\n${url}`;
}
