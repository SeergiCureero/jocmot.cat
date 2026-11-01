import type { ConnexionsPuzzle } from '../types';

/** Ordre de publicació: posició 0 = puzle #1. Afegir-ne SEMPRE al final. */
const FIRST: readonly ConnexionsPuzzle[] = [
  {
    groups: [
      { level: 0, title: 'Rius de Catalunya', words: ['EBRE', 'TER', 'SEGRE', 'LLOBREGAT'] },
      {
        level: 1,
        title: 'Ingredients del pa amb tomàquet',
        words: ['PA', 'TOMÀQUET', 'OLI', 'SAL'],
      },
      { level: 2, title: 'Fan un castell', words: ['PINYA', 'TRONC', 'ENXANETA', 'ACOTXADOR'] },
      { level: 3, title: '___ de Sant Joan', words: ['REVETLLA', 'COCA', 'FOGUERA', 'NIT'] },
    ],
  },
  {
    groups: [
      { level: 0, title: 'Animals', words: ['GAT', 'GOS', 'LLOP', 'GUINEU'] },
      { level: 1, title: 'Fenòmens meteorològics', words: ['PLUJA', 'NEU', 'CALAMARSA', 'BOIRA'] },
      {
        level: 2,
        title: 'Muntanyes catalanes',
        words: ['MONTSERRAT', 'CANIGÓ', 'PEDRAFORCA', 'MONTSENY'],
      },
      { level: 3, title: 'Instruments de cobla', words: ['TENORA', 'TIBLE', 'FLABIOL', 'TAMBORÍ'] },
    ],
  },
  {
    groups: [
      { level: 0, title: 'Esports', words: ['FUTBOL', 'BÀSQUET', 'HANDBOL', 'HOQUEI'] },
      { level: 1, title: 'Peces de roba', words: ['CAMISA', 'JERSEI', 'FALDILLA', 'MITJONS'] },
      {
        level: 2,
        title: 'Plats catalans',
        words: ['ESCALIVADA', 'CALÇOTS', 'FIDEUÀ', 'ESQUEIXADA'],
      },
      { level: 3, title: 'Planetes', words: ['MART', 'VENUS', 'SATURN', 'JÚPITER'] },
    ],
  },
  {
    groups: [
      { level: 0, title: 'Fruites', words: ['POMA', 'PERA', 'PRÉSSEC', 'CIRERA'] },
      { level: 1, title: 'Mobles', words: ['CADIRA', 'TAULA', 'ARMARI', 'LLIT'] },
      { level: 2, title: 'Peixos', words: ['SARDINA', 'LLUÇ', 'TONYINA', 'BACALLÀ'] },
      {
        level: 3,
        title: 'Comencen amb un nombre',
        words: ['TRESOR', 'SETRILL', 'DOSSIER', 'UNGLA'],
      },
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
      {
        level: 3,
        title: 'Grups de música en català',
        words: ['MANEL', 'MISHIMA', 'BLAUMUT', 'TXARANGO'],
      },
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

/**
 * Més difícils: grups amb paraules trampa que semblen encaixar en més d'un lloc i jocs de
 * paraules (nombres o animals amagats, palíndroms…). Cada puzle té una sola solució.
 */
const HARDER: readonly ConnexionsPuzzle[] = [
  {
    groups: [
      { level: 0, title: 'Unitats de temps', words: ['DIA', 'HORA', 'MINUT', 'SEGON'] },
      { level: 1, title: 'Peces d’escacs', words: ['ALFIL', 'TORRE', 'CAVALL', 'PEÓ'] },
      { level: 2, title: 'Ordinals', words: ['PRIMER', 'TERCER', 'CINQUÈ', 'NOVÈ'] },
      { level: 3, title: 'Amaguen un nombre', words: ['CENTRE', 'MILLOR', 'DEUTE', 'SETMANA'] },
    ],
  },
  {
    groups: [
      { level: 0, title: 'Tenen fulles', words: ['LLIBRE', 'ARBRE', 'ENCIAM', 'CARXOFA'] },
      { level: 1, title: 'Tenen dents', words: ['PINTA', 'SERRA', 'RASTELL', 'ENGRANATGE'] },
      { level: 2, title: 'Tenen agulles', words: ['RELLOTGE', 'BRÚIXOLA', 'XERINGA', 'PI'] },
      { level: 3, title: 'Tenen ulls', words: ['PATATA', 'HURACÀ', 'FORMATGE', 'PAÓ'] },
    ],
  },
  {
    groups: [
      { level: 0, title: 'Parts d’un avió', words: ['MOTOR', 'CUA', 'CABINA', 'FUSELATGE'] },
      { level: 1, title: 'Diuen quan', words: ['AVUI', 'DEMÀ', 'AHIR', 'SOVINT'] },
      { level: 2, title: 'Personatges de conte', words: ['BRUIXA', 'FADA', 'GEGANT', 'OGRE'] },
      { level: 3, title: 'Es llegeixen igual al revés', words: ['RADAR', 'ALA', 'NAN', 'ARA'] },
    ],
  },
  {
    groups: [
      { level: 0, title: 'Fruites d’estiu', words: ['CIRERA', 'MELÓ', 'PRÉSSEC', 'ALBERCOC'] },
      { level: 1, title: 'Oficis', words: ['FUSTER', 'PALETA', 'FERRER', 'PESCADOR'] },
      { level: 2, title: 'Pa de ___', words: ['PESSIC', 'MOTLLO', 'PAGÈS', 'FIGA'] },
      {
        level: 3,
        title: 'Comencen amb una nota musical',
        words: ['SOLDAT', 'MIRALL', 'FAROLA', 'DOMINÓ'],
      },
    ],
  },
  {
    groups: [
      {
        level: 0,
        title: 'Dies de la setmana',
        words: ['DILLUNS', 'DIMARTS', 'DIJOUS', 'DIUMENGE'],
      },
      { level: 1, title: 'Fruites tropicals', words: ['MANGO', 'PAPAIA', 'COCO', 'LITXI'] },
      {
        level: 2,
        title: 'Instruments de percussió',
        words: ['TIMBAL', 'BOMBO', 'XILÒFON', 'CASTANYOLES'],
      },
      { level: 3, title: 'Fer ___', words: ['CAMPANA', 'PINYA', 'DISSABTE', 'FIGA'] },
    ],
  },
  {
    groups: [
      { level: 0, title: 'Paisatges', words: ['DESERT', 'TUNDRA', 'SABANA', 'ESTEPA'] },
      { level: 1, title: 'Rius', words: ['FLUVIÀ', 'MUGA', 'TER', 'FOIX'] },
      { level: 2, title: 'Comarques', words: ['SELVA', 'BAGES', 'NOGUERA', 'GARRAF'] },
      {
        level: 3,
        title: 'Amaguen un animal',
        words: ['OCASIÓ', 'PORCELLANA', 'RATAFIA', 'MOSCATELL'],
      },
    ],
  },
  {
    groups: [
      { level: 0, title: 'Colors', words: ['VERMELL', 'GROC', 'BLAU', 'VERD'] },
      { level: 1, title: 'Flors', words: ['CLAVELL', 'GESSAMÍ', 'TULIPA', 'LLIRI'] },
      { level: 2, title: 'Noms de dona', words: ['LAIA', 'JÚLIA', 'ROSA', 'MARTA'] },
      { level: 3, title: 'Santuaris', words: ['MONTSERRAT', 'QUERALT', 'LLUC', 'NÚRIA'] },
    ],
  },
];

/**
 * Els dies que ja havien passat (o estaven programats) quan es van afegir els HARDER
 * repetien els primers puzles perquè la llista donava la volta. Es conserven igual:
 * canviar-los canviaria puzles que la gent ja ha jugat.
 */
export const PUZZLES: readonly ConnexionsPuzzle[] = [...FIRST, FIRST[0], ...HARDER];
