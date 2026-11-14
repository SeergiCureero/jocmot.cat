import type { PuzzleHints } from '../types';
import { buildPrompts } from './logic';

export const buildHints = (puzzleNumber: number): PuzzleHints => ({
  hints: [
    {
      title: 'Les preguntes d’avui',
      lines: buildPrompts(puzzleNumber).map((p, i) => `${i + 1}. ${p.text}`),
    },
    {
      title: 'Una idea per puntuar més',
      lines: ['Les paraules llargues i amb X, Z, J, Q o K valen més punts.'],
    },
  ],
  solution: {
    title: 'La solució',
    lines: [
      'Aquí no hi ha una sola resposta: qualsevol paraula del diccionari que compleixi la pregunta val.',
    ],
  },
});
