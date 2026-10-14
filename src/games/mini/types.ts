export type Direction = 'across' | 'down';
export type Cell = [number, number];

export interface MiniPuzzle {
  /** Files de la solució. '#' = casella negra. */
  grid: string[];
  /** Definicions indexades pel número de la casella inicial. */
  clues: Record<Direction, Record<number, string>>;
}

export interface Entry {
  number: number;
  direction: Direction;
  cells: Cell[];
  answer: string;
  clue: string;
}
