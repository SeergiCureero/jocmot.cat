import type { FilsPuzzle } from '../types';

/**
 * Ordre de publicació: posició 0 = puzle #1. Afegir-ne SEMPRE al final.
 * Les graelles es poden generar amb scripts/generate-fils.py i es validen als tests.
 */
export const PUZZLES: readonly FilsPuzzle[] = [
  {
    theme: 'Al mercat',
    grid: ['ARAPAM', 'XIEDUR', 'SEUIFC', 'NATEPI', 'LATSRR', 'PESNEP', 'CAOJRO', 'TRAAAM'],
    spangram: { word: 'FRUITES', path: [[2, 4], [1, 5], [1, 4], [2, 3], [3, 2], [2, 1], [2, 0]] },
    words: [
      { word: 'MADUIXA', path: [[0, 5], [0, 4], [1, 3], [2, 2], [1, 1], [1, 0], [0, 0]] },
      { word: 'PERA', path: [[0, 3], [1, 2], [0, 1], [0, 2]] },
      { word: 'CIRERA', path: [[2, 5], [3, 5], [4, 5], [5, 4], [6, 4], [7, 3]] },
      { word: 'POMA', path: [[5, 5], [6, 5], [7, 5], [7, 4]] },
      { word: 'PRESSEC', path: [[3, 4], [4, 4], [3, 3], [4, 3], [5, 2], [5, 1], [6, 0]] },
      { word: 'TARONJA', path: [[7, 0], [6, 1], [7, 1], [6, 2], [5, 3], [6, 3], [7, 2]] },
      { word: 'PLATAN', path: [[5, 0], [4, 0], [4, 1], [4, 2], [3, 1], [3, 0]] },
    ],
  },
  {
    theme: 'Fan soroll de bon matí',
    grid: ['AJNACV', 'LLCARA', 'IOLAGG', 'ANLCAL', 'CNIVAL', 'BALAEV', 'ARCLNO', 'PORECA'],
    spangram: { word: 'GRANJA', path: [[2, 5], [1, 4], [1, 3], [0, 2], [0, 1], [0, 0]] },
    words: [
      { word: 'VACA', path: [[0, 5], [1, 5], [0, 4], [0, 3]] },
      { word: 'ANEC', path: [[7, 5], [6, 4], [7, 3], [7, 4]] },
      { word: 'OVELLA', path: [[6, 5], [5, 5], [5, 4], [4, 5], [3, 5], [4, 4]] },
      { word: 'GALLINA', path: [[2, 4], [2, 3], [2, 2], [3, 2], [4, 2], [4, 1], [3, 0]] },
      { word: 'CAVALL', path: [[3, 3], [3, 4], [4, 3], [5, 3], [5, 2], [6, 3]] },
      { word: 'CONILL', path: [[1, 2], [2, 1], [3, 1], [2, 0], [1, 0], [1, 1]] },
      { word: 'CABRA', path: [[4, 0], [5, 1], [5, 0], [6, 1], [6, 0]] },
      { word: 'PORC', path: [[7, 0], [7, 1], [7, 2], [6, 2]] },
    ],
  },
  {
    theme: 'Fan música',
    grid: ['SAXOFN', 'STNIOO', 'IPELRI', 'NAMUTV', 'AOPASN', 'GRTRMI', 'UTAAOP', 'IRRATE'],
    spangram: { word: 'INSTRUMENTS', path: [[5, 5], [4, 5], [4, 4], [3, 4], [2, 4], [3, 3], [3, 2], [2, 2], [1, 2], [1, 1], [1, 0]] },
    words: [
      { word: 'VIOLI', path: [[3, 5], [2, 5], [1, 4], [2, 3], [1, 3]] },
      { word: 'SAXOFON', path: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [1, 5], [0, 5]] },
      { word: 'PIANO', path: [[2, 1], [2, 0], [3, 1], [3, 0], [4, 1]] },
      { word: 'ARPA', path: [[4, 0], [5, 1], [4, 2], [4, 3]] },
      { word: 'GUITARRA', path: [[5, 0], [6, 0], [7, 0], [6, 1], [6, 2], [7, 1], [7, 2], [6, 3]] },
      { word: 'TROMPETA', path: [[5, 2], [5, 3], [6, 4], [5, 4], [6, 5], [7, 5], [7, 4], [7, 3]] },
    ],
  },
  {
    theme: 'D’un lloc a l’altre',
    grid: ['OOMERT', 'TPNRTS', 'NSOLEA', 'CALAXV', 'ORVIIB', 'MTTOIC', 'EXECIT', 'TROLEA'],
    spangram: { word: 'TRANSPORTS', path: [[5, 2], [4, 1], [3, 1], [2, 0], [2, 1], [1, 1], [2, 2], [1, 3], [1, 4], [1, 5]] },
    words: [
      { word: 'TREN', path: [[0, 5], [0, 4], [0, 3], [1, 2]] },
      { word: 'MOTO', path: [[0, 2], [0, 1], [1, 0], [0, 0]] },
      { word: 'COTXE', path: [[3, 0], [4, 0], [5, 1], [6, 1], [6, 2]] },
      { word: 'METRO', path: [[5, 0], [6, 0], [7, 0], [7, 1], [7, 2]] },
      { word: 'AVIO', path: [[2, 5], [3, 5], [4, 4], [5, 3]] },
      { word: 'BICICLETA', path: [[4, 5], [5, 4], [5, 5], [6, 4], [6, 3], [7, 3], [7, 4], [6, 5], [7, 5]] },
      { word: 'VAIXELL', path: [[4, 2], [3, 3], [4, 3], [3, 4], [2, 4], [2, 3], [3, 2]] },
    ],
  },
  {
    theme: 'De cap a peus',
    grid: ['ENATPA', 'UQSSRC', 'SOLEDA', 'TLCENL', 'APLAEL', 'XASZLC', 'NLEOEO', 'PALNEG'],
    spangram: { word: 'PARTSDELCOS', path: [[0, 4], [0, 5], [1, 4], [0, 3], [1, 3], [2, 4], [3, 3], [2, 2], [3, 2], [2, 1], [2, 0]] },
    words: [
      { word: 'CANELL', path: [[1, 5], [2, 5], [3, 4], [4, 4], [3, 5], [4, 5]] },
      { word: 'ESQUENA', path: [[2, 3], [1, 2], [1, 1], [1, 0], [0, 0], [0, 1], [0, 2]] },
      { word: 'COLZE', path: [[5, 5], [6, 5], [5, 4], [5, 3], [6, 4]] },
      { word: 'GENOLL', path: [[7, 5], [7, 4], [7, 3], [6, 3], [7, 2], [6, 1]] },
      { word: 'PANXA', path: [[7, 0], [7, 1], [6, 0], [5, 0], [5, 1]] },
      { word: 'ESPATLLA', path: [[6, 2], [5, 2], [4, 1], [4, 0], [3, 0], [3, 1], [4, 2], [4, 3]] },
    ],
  },
  {
    theme: 'Al mes d’agost',
    grid: ['GBAYDO', 'LENATR', 'RATLOV', 'AASORA', 'PCSRAL', 'AVAOLL', 'JTLNAO', 'AAPCES'],
    spangram: { word: 'VACANCES', path: [[5, 1], [5, 0], [4, 1], [5, 2], [6, 3], [7, 3], [7, 4], [7, 5]] },
    words: [
      { word: 'PARASOL', path: [[4, 0], [3, 0], [2, 0], [3, 1], [3, 2], [3, 3], [2, 3]] },
      { word: 'SORRA', path: [[4, 2], [5, 3], [4, 3], [3, 4], [4, 4]] },
      { word: 'GELAT', path: [[0, 0], [1, 1], [1, 0], [2, 1], [2, 2]] },
      { word: 'BANYADOR', path: [[0, 1], [0, 2], [1, 2], [0, 3], [1, 3], [0, 4], [0, 5], [1, 5]] },
      { word: 'TOVALLOLA', path: [[1, 4], [2, 4], [2, 5], [3, 5], [4, 5], [5, 5], [6, 5], [5, 4], [6, 4]] },
      { word: 'PLATJA', path: [[7, 2], [6, 2], [7, 1], [6, 1], [6, 0], [7, 0]] },
    ],
  },
];
