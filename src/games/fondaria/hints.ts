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
      lines: [
        'Les respostes rares valen molt més que les habituals: no et quedis amb la primera que et vingui al cap.',
      ],
    },
  ],
  solution: {
    title: 'La solució',
    lines: ['Hi ha moltes respostes possibles: qualsevol de la llista de la categoria val.'],
  },
});
