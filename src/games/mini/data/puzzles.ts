import type { MiniPuzzle } from '../types';

/**
 * Ordre de publicació: posició 0 = puzle #1. Afegir-ne SEMPRE al final.
 * La numeració es calcula automàticament; els tests comproven que cada
 * paraula de la graella té definició i a l'inrevés.
 */
export const PUZZLES: readonly MiniPuzzle[] = [
  {
    grid: ['##TAP', '#TALL', 'PORTA', 'ARTS#', 'UNA##'],
    clues: {
      across: {
        1: 'Serveix per tancar una ampolla',
        4: 'Ferida feta amb un ganivet',
        5: 'Per aquí s’entra a casa',
        6: 'Pintura, música i dansa, per exemple',
        7: 'Ni dues ni tres',
      },
      down: {
        1: 'Pastís d’aniversari',
        2: 'Contrari de baixos',
        3: 'Terreny sense muntanyes',
        4: 'A la carnisseria cal esperar el teu ___',
        5: 'Contrari de guerra',
      },
    },
  },
  {
    grid: ['##MAR', '#PARE', 'CARES', 'ALES#', 'PAS##'],
    clues: {
      across: {
        1: 'La Mediterrània, per exemple',
        4: 'Progenitor',
        5: 'Rostres',
        6: 'Les tenen els ocells',
        7: '___ de zebra',
      },
      down: {
        1: 'Celebren el seu dia el primer diumenge de maig',
        2: 'Espais on es batia el blat',
        3: 'Cap cosa',
        4: 'Eina per cavar',
        5: 'Part del cos on hi ha el cervell',
      },
    },
  },
  {
    grid: ['##FAR', '#VELA', 'CASES', 'ALTS#', 'PLA##'],
    clues: {
      across: {
        1: 'Torre que guia els vaixells',
        4: 'La d’un veler s’infla amb el vent',
        5: 'Habitatges',
        6: 'Contrari de baixos',
        7: 'Terreny sense muntanyes',
      },
      down: {
        1: 'Celebració',
        2: 'Les tenen els ocells',
        3: 'Al ___: a l’aire lliure',
        4: 'Terreny entre muntanyes',
        5: 'Barret, gorra… es posen al ___',
      },
    },
  },
  {
    grid: ['##PEU', '#TORN', 'CARES', 'ALTS#', 'PLA##'],
    clues: {
      across: {
        1: 'Hi portem la sabata',
        4: 'Ara és el meu ___: em toca a mi',
        5: 'Que costen molts diners',
        6: 'Com els gegants de la festa major',
        7: 'El ___ de l’Estany, comarca gironina',
      },
      down: {
        1: 'S’obre, es tanca i s’hi truca',
        2: 'Llargs períodes de la història',
        3: '___ quants: alguns',
        4: 'Llesca de pernil o de formatge',
        5: 'No en queda ni un: no en queda ___',
      },
    },
  },
  {
    grid: ['##RAS', '#MOLI', 'CASES', 'ARES#', 'PES##'],
    clues: {
      across: {
        1: 'Cel ___: sense ni un núvol',
        4: 'El de vent té aspes',
        5: 'Edificis on viu la gent',
        6: 'Unitats de superfície de cent metres quadrats',
        7: 'El mesura la bàscula',
      },
      down: {
        1: 'Flors de Sant Jordi',
        2: 'Les d’un avió el sostenen a l’aire',
        3: 'Les cares d’un dau',
        4: 'Progenitora',
        5: '___ de setmana',
      },
    },
  },
  {
    grid: ['#POTA', '#LLAR', 'SALSA', 'ANEC#', 'CASA#'],
    clues: {
      across: {
        1: 'Una taula en té quatre',
        5: 'La ___ de foc: on es crema la llenya',
        6: 'El romesco n’és una',
        7: 'Ocell que fa «cuac»',
        8: 'Edifici on viu una família',
      },
      down: {
        1: 'La de Vic és famosa per la boira',
        2: 'Recipients per fer escudella',
        3: 'Feina que cal fer',
        4: 'En aquest moment',
        6: 'Bossa gran per portar patates',
      },
    },
  },
];
