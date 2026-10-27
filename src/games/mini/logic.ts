import type { GameStatus } from '@/services/backend/types';
import type { Cell, Direction, Entry, MiniPuzzle } from './types';

export const BLOCK = '#';
export const EMPTY = ' ';

export interface MiniState {
  /** Lletres introduïdes, una fila per string (EMPTY = buida, BLOCK = negra). */
  letters: string[];
  elapsedSeconds: number;
  /** 'lost' = s'ha resolt amb "Revela". */
  status: GameStatus;
}

export const getStatus = (s: MiniState): GameStatus => s.status;

export const initialStateFor = (puzzle: MiniPuzzle) => (): MiniState => ({
  letters: puzzle.grid.map((row) => row.replace(/[^#]/g, EMPTY)),
  elapsedSeconds: 0,
  status: 'playing',
});

export const isBlock = (p: MiniPuzzle, [r, c]: Cell) => p.grid[r]?.[c] === undefined || p.grid[r][c] === BLOCK;

/** Numeració estàndard de mots encreuats i llista d'entrades. */
export function buildEntries(puzzle: MiniPuzzle): { numbers: (number | null)[][]; entries: Entry[] } {
  const size = puzzle.grid.length;
  const numbers: (number | null)[][] = puzzle.grid.map((row) => [...row].map(() => null));
  const entries: Entry[] = [];
  let next = 1;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < puzzle.grid[r].length; c++) {
      if (isBlock(puzzle, [r, c])) continue;
      const starts: Direction[] = [];
      if (isBlock(puzzle, [r, c - 1]) && !isBlock(puzzle, [r, c + 1])) starts.push('across');
      if (isBlock(puzzle, [r - 1, c]) && !isBlock(puzzle, [r + 1, c])) starts.push('down');
      if (!starts.length) continue;

      const number = next++;
      numbers[r][c] = number;
      for (const direction of starts) {
        const cells: Cell[] = [];
        let [rr, cc] = [r, c];
        while (!isBlock(puzzle, [rr, cc])) {
          cells.push([rr, cc]);
          if (direction === 'across') cc++;
          else rr++;
        }
        entries.push({
          number,
          direction,
          cells,
          answer: cells.map(([a, b]) => puzzle.grid[a][b]).join(''),
          clue: puzzle.clues[direction][number] ?? '',
        });
      }
    }
  }
  return { numbers, entries };
}

export function entryAt(entries: Entry[], [r, c]: Cell, direction: Direction): Entry | undefined {
  return entries.find((e) => e.direction === direction && e.cells.some(([a, b]) => a === r && b === c));
}

export function setLetter(state: MiniState, puzzle: MiniPuzzle, [r, c]: Cell, letter: string): MiniState {
  if (state.status !== 'playing' || isBlock(puzzle, [r, c])) return state;
  const letters = state.letters.map((row, i) => (i === r ? row.slice(0, c) + letter + row.slice(c + 1) : row));
  const solved = letters.every((row, i) => row === puzzle.grid[i]);
  return { ...state, letters, status: solved ? 'won' : 'playing' };
}

export const isFilled = (s: MiniState) => s.letters.every((row) => !row.includes(EMPTY));

/** Caselles plenes amb una lletra incorrecta. */
export function wrongCells(state: MiniState, puzzle: MiniPuzzle): Cell[] {
  const out: Cell[] = [];
  state.letters.forEach((row, r) =>
    [...row].forEach((ch, c) => {
      if (ch !== EMPTY && ch !== BLOCK && ch !== puzzle.grid[r][c]) out.push([r, c]);
    }),
  );
  return out;
}

export function reveal(state: MiniState, puzzle: MiniPuzzle): MiniState {
  return { ...state, letters: [...puzzle.grid], status: 'lost' };
}

export function buildShareText(puzzleNumber: number, state: MiniState, url: string, format: (s: number) => string) {
  const line = state.status === 'won' ? `resolt en ${format(state.elapsedSeconds)} ⏱️` : 'resolt amb ajuda';
  return `Mini #${puzzleNumber} ${line}\n\n${url}`;
}

/** Valida que un puzle és coherent (tests i editor). Retorna la llista d'errors. */
export function validatePuzzle(p: MiniPuzzle): string[] {
  const errors: string[] = [];
  const size = p.grid.length;
  if (size < 3 || p.grid.some((row) => row.length !== size)) errors.push('la graella ha de ser quadrada');
  if (p.grid.some((row) => /[^A-ZÇ#]/.test(row))) errors.push('hi ha caselles buides o caràcters no vàlids');

  const { entries } = buildEntries(p);
  const covered = new Set(entries.flatMap((e) => e.cells.map((c) => c.join())));
  p.grid.forEach((row, r) =>
    [...row].forEach((ch, c) => {
      if (ch !== BLOCK && !covered.has(`${r},${c}`)) errors.push(`la casella ${r + 1},${c + 1} no forma part de cap paraula`);
    }),
  );
  for (const e of entries) {
    if (!e.clue.trim()) errors.push(`${e.number}${e.direction === 'across' ? 'H' : 'V'} (${e.answer}): falta la definició`);
  }
  const clueCount = Object.keys(p.clues.across).length + Object.keys(p.clues.down).length;
  if (clueCount > entries.length) errors.push('hi ha definicions que no corresponen a cap paraula');
  if (!entries.length) errors.push('no hi ha cap paraula');
  return errors;
}
