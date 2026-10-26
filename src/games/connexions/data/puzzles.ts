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
  {
    groups: [
      { level: 0, title: 'Fruites', words: ['POMA', 'PERA', 'PRÉSSEC', 'CIRERA'] },
      { level: 1, title: 'Mobles', words: ['CADIRA', 'TAULA', 'ARMARI', 'LLIT'] },
      { level: 2, title: 'Peixos', words: ['SARDINA', 'LLUÇ', 'TONYINA', 'BACALLÀ'] },
      { level: 3, title: 'Comencen amb un nombre', words: ['TRESOR', 'SETRILL', 'DOSSIER', 'UNGLA'] },
    ],
  },
  {
    groups: [
      { level: 0, title: 'Estacions de l’any', words: ['PRIMAVERA', 'ESTIU', 'TARDOR', 'HIVERN'] },
      { level: 1, title: 'Eines', words: ['MARTELL', 'SERRA', 'TORNAVÍS', 'ALICATS'] },
      { level: 2, title: 'Comarques', words: ['OSONA', 'GARROTXA', 'PRIORAT', 'ANOIA'] },
      { level: 3, title: '___ de mar', words: ['CAVALLET', 'ESTRELLA', 'ERIÇÓ', 'LLOP'] },
    ],
  },
  {
    groups: [
      { level: 0, title: 'Parts d’una casa', words: ['CUINA', 'MENJADOR', 'LAVABO', 'DORMITORI'] },
      { level: 1, title: 'Begudes', words: ['AIGUA', 'LLET', 'CAFÈ', 'VI'] },
      { level: 2, title: 'Ocells', words: ['ORENETA', 'PARDAL', 'MERLA', 'GAVINA'] },
      { level: 3, title: 'Grups de música en català', words: ['MANEL', 'MISHIMA', 'BLAUMUT', 'TXARANGO'] },
    ],
  },
  {
    groups: [
      { level: 0, title: 'Mesos', words: ['GENER', 'MARÇ', 'JUNY', 'OCTUBRE'] },
      { level: 1, title: 'Ciutats catalanes', words: ['GIRONA', 'LLEIDA', 'TARRAGONA', 'REUS'] },
      { level: 2, title: 'Embotits', words: ['FUET', 'BOTIFARRA', 'LLONGANISSA', 'SOBRASSADA'] },
      { level: 3, title: 'Nadal a Catalunya', words: ['CAGANER', 'TIÓ', 'NEULES', 'TORRONS'] },
    ],
  },
];
