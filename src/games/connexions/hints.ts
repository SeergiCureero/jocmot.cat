import { authorHint, type PuzzleHints } from '../types';
import { pickByNumber } from '../puzzles';
import { PUZZLES } from './data/puzzles';
import type { ConnexionsPuzzle } from './types';

const COLORS = ['🟨', '🟩', '🟦', '🟪'];

export function hintsForPuzzle(puzzle: ConnexionsPuzzle): PuzzleHints {
  const groups = [...puzzle.groups].sort((a, b) => a.level - b.level);
  return {
    hints: [
      ...authorHint(puzzle),
      {
        title: 'Una paraula de cada grup',
        lines: groups.map((g) => `${COLORS[g.level]} ${g.words[0]}`),
      },
      {
        title: 'Els quatre temes',
        lines: groups.map((g) => `${COLORS[g.level]} ${g.title}`),
      },
    ],
    solution: {
      title: 'La solució',
      lines: groups.map((g) => `${COLORS[g.level]} ${g.title}: ${g.words.join(', ')}`),
    },
  };
}

export const buildHints = (puzzleNumber: number, groupPuzzle?: unknown): PuzzleHints =>
  hintsForPuzzle(
    (groupPuzzle as ConnexionsPuzzle | undefined) ?? pickByNumber(PUZZLES, puzzleNumber),
  );
