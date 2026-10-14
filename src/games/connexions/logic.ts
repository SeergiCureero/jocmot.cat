import type { GameStatus } from '@/services/backend/types';
import { seededRandom, shuffle } from '@/lib/random';
import type { ConnexionsPuzzle, Level } from './types';

export const GROUP_SIZE = 4;
export const MAX_MISTAKES = 4;

export interface ConnexionsState {
  /** Índexs dels grups resolts, en ordre de resolució. */
  solved: number[];
  /** Tots els intents enviats (per al resultat compartit). */
  attempts: string[][];
  mistakes: number;
  status: GameStatus;
}

export const initialState = (): ConnexionsState => ({ solved: [], attempts: [], mistakes: 0, status: 'playing' });
export const getStatus = (s: ConnexionsState): GameStatus => s.status;

export const groupOf = (puzzle: ConnexionsPuzzle, word: string): number =>
  puzzle.groups.findIndex((g) => g.words.includes(word));

/** Ordre inicial de les paraules: el mateix per a tothom (llavor = número de puzle). */
export function initialOrder(puzzle: ConnexionsPuzzle, seed: number): string[] {
  return shuffle(puzzle.groups.flatMap((g) => g.words), seededRandom(seed));
}

export type Feedback = 'correct' | 'one-away' | 'wrong' | 'already-guessed' | 'incomplete';

const attemptKey = (words: string[]) => [...words].sort().join('|');

export function submitSelection(
  state: ConnexionsState,
  puzzle: ConnexionsPuzzle,
  selection: string[],
): { state: ConnexionsState; feedback: Feedback } {
  if (state.status !== 'playing' || selection.length !== GROUP_SIZE) return { state, feedback: 'incomplete' };
  if (state.attempts.some((a) => attemptKey(a) === attemptKey(selection))) {
    return { state, feedback: 'already-guessed' };
  }

  const attempts = [...state.attempts, [...selection]];
  const counts = new Map<number, number>();
  selection.forEach((w) => {
    const g = groupOf(puzzle, w);
    counts.set(g, (counts.get(g) ?? 0) + 1);
  });
  const [bestGroup, bestCount] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];

  if (bestCount === GROUP_SIZE) {
    const solved = [...state.solved, bestGroup];
    const status: GameStatus = solved.length === puzzle.groups.length ? 'won' : 'playing';
    return { state: { ...state, solved, attempts, status }, feedback: 'correct' };
  }

  const mistakes = state.mistakes + 1;
  const status: GameStatus = mistakes >= MAX_MISTAKES ? 'lost' : 'playing';
  return {
    state: { ...state, attempts, mistakes, status },
    feedback: bestCount === GROUP_SIZE - 1 ? 'one-away' : 'wrong',
  };
}

const EMOJI: Record<Level, string> = { 0: '🟨', 1: '🟩', 2: '🟦', 3: '🟪' };

export function buildShareText(puzzleNumber: number, state: ConnexionsState, puzzle: ConnexionsPuzzle, url: string) {
  const rows = state.attempts.map((a) => a.map((w) => EMOJI[puzzle.groups[groupOf(puzzle, w)].level]).join(''));
  return `Connexions #${puzzleNumber}\n${rows.join('\n')}\n\n${url}`;
}
