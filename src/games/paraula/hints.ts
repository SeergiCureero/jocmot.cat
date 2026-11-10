import type { PuzzleHints } from '../types';
import { pickByNumber } from '../puzzles';
import { ANSWERS } from './data/answers';
import { normalizeWord } from '@/lib/text';

const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);

export function hintsForWord(word: string): PuzzleHints {
  const shown = word.toUpperCase();
  const letters = [...normalizeWord(word).toUpperCase()];
  const vowels = letters.filter((l) => VOWELS.has(l)).length;
  const repeated = new Set(letters).size < letters.length;
  return {
    hints: [
      {
        title: 'Una pista suau',
        lines: [
          `Té ${vowels} ${vowels === 1 ? 'vocal' : 'vocals'} i ${repeated ? 'alguna lletra repetida' : 'cap lletra repetida'}.`,
        ],
      },
      {
        title: 'Una pista més clara',
        lines: [`Comença per «${shown[0]}» i acaba per «${shown.at(-1)}».`],
      },
    ],
    solution: { title: 'La solució', lines: [`La paraula és ${shown}.`] },
  };
}

export const buildHints = (puzzleNumber: number): PuzzleHints =>
  hintsForWord(pickByNumber(ANSWERS, puzzleNumber));
