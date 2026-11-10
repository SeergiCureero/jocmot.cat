import { authorHint, type PuzzleHints } from '../types';
import { pickByNumber } from '../puzzles';
import { PUZZLES } from './data/puzzles';
import { buildEntries } from './logic';
import type { Entry, MiniPuzzle } from './types';

const name = (e: Entry) => `${e.number} ${e.direction === 'across' ? 'horitzontal' : 'vertical'}`;

export function hintsForPuzzle(puzzle: MiniPuzzle): PuzzleHints {
  const { entries } = buildEntries(puzzle);
  const across = entries.filter((e) => e.direction === 'across');
  const down = entries.filter((e) => e.direction === 'down');
  return {
    hints: [
      ...authorHint(puzzle),
      {
        title: 'La primera lletra de cada horitzontal',
        lines: across.map((e) => `${name(e)}: ${e.answer[0]}…`),
      },
      {
        title: 'Les horitzontals',
        lines: across.map((e) => `${name(e)}: ${e.answer}`),
      },
    ],
    solution: {
      title: 'La solució',
      lines: [...across, ...down].map((e) => `${name(e)}: ${e.answer}`),
    },
  };
}

export const buildHints = (puzzleNumber: number, groupPuzzle?: unknown): PuzzleHints =>
  hintsForPuzzle((groupPuzzle as MiniPuzzle | undefined) ?? pickByNumber(PUZZLES, puzzleNumber));
