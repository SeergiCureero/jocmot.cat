import type { ConnexionsPuzzle } from '../types';

/** Ordre de publicació: posició 0 = puzle #1. Afegir-ne SEMPRE al final. */
export const PUZZLES: readonly ConnexionsPuzzle[] = [
  {
    groups: [
      { level: 0, title: 'Rius de Catalunya', words: ['EBRE', 'TER', 'SEGRE', 'LLOBREGAT'] },
      { level: 1, title: 'Ingredients del pa amb tomàquet', words: ['PA', 'TOMÀQUET', 'OLI', 'SAL'] },
      { level: 2, title: 'Fan un castell', words: ['PINYA', 'TRONC', 'ENXANETA', 'ACOTXADOR'] },
      { level: 3, title: '___ de Sant Joan', words: ['REVETLLA', 'COCA', 'FOGUERA', 'NIT'] },
    ],
  },
  {
    groups: [
      { level: 0, title: 'Animals', words: ['GAT', 'GOS', 'LLOP', 'GUINEU'] },
      { level: 1, title: 'Fenòmens meteorològics', words: ['PLUJA', 'NEU', 'CALAMARSA', 'BOIRA'] },
      { level: 2, title: 'Muntanyes catalanes', words: ['MONTSERRAT', 'CANIGÓ', 'PEDRAFORCA', 'MONTSENY'] },
      { level: 3, title: 'Instruments de cobla', words: ['TENORA', 'TIBLE', 'FLABIOL', 'TAMBORÍ'] },
    ],
  },
  {
    groups: [
      { level: 0, title: 'Esports', words: ['FUTBOL', 'BÀSQUET', 'HANDBOL', 'HOQUEI'] },
      { level: 1, title: 'Peces de roba', words: ['CAMISA', 'JERSEI', 'FALDILLA', 'MITJONS'] },
      { level: 2, title: 'Plats catalans', words: ['ESCALIVADA', 'CALÇOTS', 'FIDEUÀ', 'ESQUEIXADA'] },
      { level: 3, title: 'Planetes', words: ['MART', 'VENUS', 'SATURN', 'JÚPITER'] },
    ],
  },
];
