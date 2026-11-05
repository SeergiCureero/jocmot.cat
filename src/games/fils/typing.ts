import { COLS, isAdjacent, ROWS, sameCell } from './logic';
import type { Cell, FilsPuzzle, FilsWord } from './types';

const MAX_PATHS = 200;

/**
 * Camins de la graella que formen `typed` (lletres veïnes, sense repetir casella ni fer
 * servir les ja trobades). Serveix per jugar a Fils escrivint amb el teclat.
 */
export function pathsFor(puzzle: FilsPuzzle, typed: string, used: Cell[]): Cell[][] {
  const letters = typed.toUpperCase();
  if (!letters) return [];
  const out: Cell[][] = [];
  const isUsed = (c: Cell) => used.some((u) => sameCell(u, c));
  const letterAt = ([r, c]: Cell) => puzzle.grid[r][c].toUpperCase();

  const walk = (path: Cell[]) => {
    if (out.length >= MAX_PATHS) return;
    if (path.length === letters.length) {
      out.push(path);
      return;
    }
    const last = path[path.length - 1];
    for (let r = last[0] - 1; r <= last[0] + 1; r++)
      for (let c = last[1] - 1; c <= last[1] + 1; c++) {
        const cell: Cell = [r, c];
        if (r < 0 || r >= ROWS || c < 0 || c >= COLS) continue;
        if (!isAdjacent(last, cell) || isUsed(cell) || path.some((p) => sameCell(p, cell)))
          continue;
        if (letterAt(cell) === letters[path.length]) walk([...path, cell]);
      }
  };

  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      const cell: Cell = [r, c];
      if (!isUsed(cell) && letterAt(cell) === letters[0]) walk([cell]);
    }
  return out;
}

/** Entre els camins possibles, el que coincideix amb una paraula del tema (si n'hi ha cap). */
export function bestPath(paths: Cell[][], words: FilsWord[]): Cell[] | undefined {
  const same = (a: Cell[], b: Cell[]) =>
    a.length === b.length && a.every((x, i) => sameCell(x, b[i]));
  return paths.find((p) => words.some((w) => same(w.path, p))) ?? paths[0];
}
