import { authorHint, type PuzzleHints } from '../types';
import { pickByNumber } from '../puzzles';
import { PUZZLES } from './data/puzzles';
import type { FilsPuzzle } from './types';

export function hintsForPuzzle(puzzle: FilsPuzzle): PuzzleHints {
  const spangram = puzzle.spangram.word.toUpperCase();
  const words = puzzle.words.map((w) => w.word.toUpperCase());
  return {
    hints: [
      ...authorHint(puzzle),
      {
        title: 'Una pista suau',
        lines: [
          `Hi ha ${words.length} paraules del tema, a més del fil conductor.`,
          `El fil conductor té ${spangram.length} lletres i comença per «${spangram[0]}».`,
        ],
      },
      {
        title: 'El fil conductor',
        lines: [`És ${spangram}.`],
      },
    ],
    solution: {
      title: 'La solució',
      lines: [`Fil conductor: ${spangram}`, `Paraules: ${words.join(', ')}`],
    },
  };
}

export const buildHints = (puzzleNumber: number, groupPuzzle?: unknown): PuzzleHints =>
  hintsForPuzzle((groupPuzzle as FilsPuzzle | undefined) ?? pickByNumber(PUZZLES, puzzleNumber));
