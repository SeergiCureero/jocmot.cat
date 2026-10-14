import type { GameStatus } from '@/services/backend/types';
import type { Cell, FilsPuzzle, FilsWord } from './types';

export const ROWS = 8;
export const COLS = 6;
export const MIN_WORD = 4;
/** Intents no temàtics necessaris per desbloquejar una pista. */
export const HINT_COST = 3;

export type LogEntry = 'theme' | 'spangram' | 'hint';

export interface FilsState {
  found: string[];
  /** Ordre d'esdeveniments, per al resultat compartit. */
  log: LogEntry[];
  hintProgress: number;
  hintWord: string | null;
  status: GameStatus;
}

export const initialState = (): FilsState => ({
  found: [],
  log: [],
  hintProgress: 0,
  hintWord: null,
  status: 'playing',
});
export const getStatus = (s: FilsState): GameStatus => s.status;

export const sameCell = (a: Cell, b: Cell) => a[0] === b[0] && a[1] === b[1];
export const isAdjacent = (a: Cell, b: Cell) =>
  !sameCell(a, b) && Math.abs(a[0] - b[0]) <= 1 && Math.abs(a[1] - b[1]) <= 1;

export const allWords = (p: FilsPuzzle): FilsWord[] => [p.spangram, ...p.words];

export function wordFromPath(puzzle: FilsPuzzle, path: Cell[]): string {
  return path.map(([r, c]) => puzzle.grid[r][c]).join('');
}

const samePath = (a: Cell[], b: Cell[]) => a.length === b.length && a.every((cell, i) => sameCell(cell, b[i]));

export type Feedback = 'theme' | 'spangram' | 'already-found' | 'too-short' | 'not-theme';

export function submitPath(
  state: FilsState,
  puzzle: FilsPuzzle,
  path: Cell[],
): { state: FilsState; feedback: Feedback } {
  if (path.length < MIN_WORD) return { state, feedback: 'too-short' };

  const match = allWords(puzzle).find((w) => samePath(w.path, path));
  if (!match) {
    return { state: { ...state, hintProgress: Math.min(HINT_COST, state.hintProgress + 1) }, feedback: 'not-theme' };
  }
  if (state.found.includes(match.word)) return { state, feedback: 'already-found' };

  const isSpangram = match.word === puzzle.spangram.word;
  const found = [...state.found, match.word];
  return {
    feedback: isSpangram ? 'spangram' : 'theme',
    state: {
      ...state,
      found,
      log: [...state.log, isSpangram ? 'spangram' : 'theme'],
      hintWord: state.hintWord === match.word ? null : state.hintWord,
      status: found.length === allWords(puzzle).length ? 'won' : 'playing',
    },
  };
}

export const canUseHint = (s: FilsState) => s.status === 'playing' && s.hintProgress >= HINT_COST && !s.hintWord;

/** Marca la següent paraula temàtica pendent (mai l'spangram). */
export function applyHint(state: FilsState, puzzle: FilsPuzzle): FilsState {
  if (!canUseHint(state)) return state;
  const next = puzzle.words.find((w) => !state.found.includes(w.word)) ?? puzzle.spangram;
  if (state.found.includes(next.word)) return state;
  return { ...state, hintWord: next.word, hintProgress: 0, log: [...state.log, 'hint'] };
}

const EMOJI: Record<LogEntry, string> = { theme: '🔵', spangram: '🟡', hint: '💡' };

export function buildShareText(puzzleNumber: number, state: FilsState, puzzle: FilsPuzzle, url: string) {
  const emojis = state.log.map((e) => EMOJI[e]);
  const rows: string[] = [];
  for (let i = 0; i < emojis.length; i += 4) rows.push(emojis.slice(i, i + 4).join(''));
  return `Fils #${puzzleNumber}\n“${puzzle.theme}”\n${rows.join('\n')}\n\n${url}`;
}

/** Valida que un puzle és coherent (s'usa als tests). Retorna la llista d'errors. */
export function validatePuzzle(p: FilsPuzzle): string[] {
  const errors: string[] = [];
  if (p.grid.length !== ROWS || p.grid.some((r) => r.length !== COLS)) errors.push('mida de graella incorrecta');
  const used = new Set<string>();
  for (const w of allWords(p)) {
    if (wordFromPath(p, w.path) !== w.word) errors.push(`${w.word}: les lletres no coincideixen`);
    w.path.forEach((cell, i) => {
      const k = cell.join(',');
      if (used.has(k)) errors.push(`${w.word}: cel·la ${k} repetida`);
      used.add(k);
      if (i > 0 && !isAdjacent(w.path[i - 1], cell)) errors.push(`${w.word}: salt no adjacent a ${k}`);
    });
  }
  if (used.size !== ROWS * COLS) errors.push(`no cobreix tota la graella (${used.size}/${ROWS * COLS})`);
  const rows = new Set(p.spangram.path.map((c) => c[0]));
  const cols = new Set(p.spangram.path.map((c) => c[1]));
  const spans = (rows.has(0) && rows.has(ROWS - 1)) || (cols.has(0) && cols.has(COLS - 1));
  if (!spans) errors.push("l'spangram no travessa la graella");
  return errors;
}
