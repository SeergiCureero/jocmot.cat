import { markLegacy } from '../../puzzles';
import type { MiniPuzzle } from '../types';

/**
 * Ordre de publicació: posició 0 = puzle #1. Afegir-ne SEMPRE al final.
 * La numeració es calcula automàticament; els tests comproven que cada
 * paraula de la graella té definició i a l'inrevés.
 */
const FIRST: readonly MiniPuzzle[] = [
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

/** Més difícils: graelles més plenes (moltes paraules de 5 lletres) i definicions menys directes. */
const HARDER: readonly MiniPuzzle[] = [
  {
    grid: ['#CAL#', 'COLLA', 'ALTAR', 'SORRA', '#RES#'],
    clues: {
      across: {
        1: 'No ___: no fa falta',
        4: 'Grup d’amics, o de castellers',
        6: 'Taula de l’església',
        7: 'N’hi ha molta al desert',
        8: 'Zero coses',
      },
      down: {
        1: 'El blau n’és un',
        2: 'Un ___ cop: de nou',
        3: 'Cases, dit amb afecte',
        4: 'En ___ de pluja, no sortim',
        5: 'En aquest precís moment',
      },
    },
  },
  {
    grid: ['#CAMA', 'TELES', 'ALTRE', 'LLACS', 'PARE#'],
    clues: {
      across: {
        1: 'Extremitat amb genoll',
        5: 'Les d’aranya atrapen mosques',
        6: 'No aquest, sinó l’___',
        7: 'Masses d’aigua dolça envoltades de terra',
        8: 'Progenitor',
      },
      down: {
        1: 'Arc de pèls damunt de l’ull',
        2: 'Hi celebra la missa el capellà',
        3: 'Festa major de Barcelona, al setembre',
        4: 'Rucs',
        5: 'Mamífer que excava galeries',
      },
    },
  },
  {
    grid: ['#SAP#', 'COLLA', 'UNTAR', 'CARTA', '#RES#'],
    clues: {
      across: {
        1: 'No ho ___ ningú: és un secret',
        4: 'Grup de diables o de geganters',
        6: 'Posar mantega al pa',
        7: 'S’envia dins d’un sobre',
        8: 'No en queda ___',
      },
      down: {
        1: 'Fer soroll el despertador',
        2: 'Ni aquest ni l’___',
        3: 'Primer i segon, al menú',
        4: 'Viu dins la poma',
        5: '___ o mai',
      },
    },
  },
];

/**
 * Els dies que ja havien passat (o estaven programats) quan es van afegir els HARDER
 * repetien els primers puzles perquè la llista donava la volta. Es conserven igual:
 * canviar-los canviaria puzles que la gent ja ha jugat.
 */
/**
 * Puzles de reserva afegits després: surten a partir del número 22, un per dia i sense repetir-se
 * (veure `markLegacy`), quan el grup no n'ha programat cap. Fets amb scripts/generate-mini.py i un
 * banc de definicions. Pendents de revisió de l'equip (vista /editor/proxims).
 */
const MORE: readonly MiniPuzzle[] = [
  {
    grid: ['TAPA#', 'OLI#V', 'TASCA', 'S#TOC', '#CARA'],
    clues: {
      across: {
        1: 'Tanca una olla',
        4: 'Greix de l’oliva',
        6: 'Feina',
        8: 'Cop lleuger a la porta',
        9: 'Part davantera del cap',
      },
      down: {
        1: 'Contrari de ningú',
        2: 'Per volar',
        3: 'Camp d’esport; també, indici',
        5: 'Dona llet',
        7: 'Bombeja la sang',
      },
    },
  },
  {
    grid: ['CARES', 'L#I#O', 'ACTOR', 'ROM#R', 'ARENA'],
    clues: {
      across: {
        1: 'Les del dau',
        4: 'Fa de personatge',
        6: 'Licor de les Antilles',
        7: 'Cobreix la platja',
      },
      down: {
        1: 'De la gema de l’ou',
        2: 'Cadència de la música',
        3: 'Grans petits de la platja',
        5: 'Bombeja la sang',
      },
    },
  },
  {
    grid: ['TURRO', '#L##N', 'OLIVA', 'C##E#', 'AIGUA'],
    clues: {
      across: { 1: 'Dolç de neules i ametlles', 4: 'Fruit de l’olivera', 6: 'H2O' },
      down: {
        2: 'Per veure-hi',
        3: 'La mou el vent al mar',
        4: 'Ocell de corral que fa «gruix»',
        5: 'Amb ella parlem',
      },
    },
  },
  {
    grid: ['RUTES', 'O####', 'MANTA', '####R', 'BLANC'],
    clues: {
      across: { 1: 'Camins', 2: 'Cobreix al llit', 4: 'Color de la neu' },
      down: { 1: 'Licor de les Antilles', 3: 'Es fa servir amb fletxes' },
    },
  },
  {
    grid: ['MOSCA', 'O####', 'TOTES', '####O', 'NADAL'],
    clues: {
      across: { 1: 'Insecte que fa zum', 2: 'Totes elles', 4: 'El 25 de desembre' },
      down: { 1: 'Cada una de les paraules', 3: 'Estrella que ens dona la llum del dia' },
    },
  },
  {
    grid: ['##VAS', '#PALA', 'C#PEL', 'USOS#', 'A#R##'],
    clues: {
      across: {
        1: 'Per beure aigua',
        4: 'Eina per cavar',
        6: 'Creix a la pell',
        7: 'Maneres d’aprofitar alguna cosa',
      },
      down: {
        1: 'Aigua en forma de gas',
        2: 'Les d’un ocell',
        3: 'Condiment blanc de la cuina',
        5: 'Part posterior d’un animal',
      },
    },
  },
  {
    grid: ['PORTA', 'A#O#R', 'POBLE', 'E#E#N', 'RESTA'],
    clues: {
      across: { 1: 'Per entrar a casa', 4: 'Municipi petit', 5: 'Operació contrària a la suma' },
      down: { 1: 'Hi escrivim', 2: 'Peces de vestir', 3: 'Cobreix la platja' },
    },
  },
  {
    grid: ['##TOS', '#SALA', 'A#ULL', 'VELA#', 'I#A##'],
    clues: {
      across: {
        1: 'Reflex de la gola',
        4: 'Habitació gran',
        6: 'Per veure-hi',
        7: 'Teixit del vaixell',
      },
      down: {
        1: 'Hi mengem',
        2: 'Per bullir',
        3: 'Condiment blanc de la cuina',
        5: 'Pare del pare',
      },
    },
  },
  {
    grid: ['TASCA', 'I#A##', 'OLLES', '##U#E', 'ESTAT'],
    clues: {
      across: { 1: 'Feina', 3: 'Més d’un estri de cuina', 5: 'Condició' },
      down: { 1: 'Caga torrons', 2: 'Estat de qui no té malalties', 4: 'Un més que sis' },
    },
  },
  {
    grid: ['#TRUC', 'A#U#A', 'NOTES', 'E#E#A', 'COSA#'],
    clues: {
      across: { 1: 'Joc de cartes; també una trucada', 5: 'Dò, re, mi…', 6: 'Qualsevol objecte' },
      down: { 2: 'Camins', 3: 'Allà on vivim', 4: 'Ocell que neda a l’estany' },
    },
  },
  {
    grid: ['##PAS', '#CAMA', 'M#PIC', 'ANEC#', 'L#R##'],
    clues: {
      across: {
        1: 'Cada moviment del peu en caminar',
        4: 'Va del genoll al peu',
        6: 'Cim agut',
        7: 'Ocell que neda a l’estany',
      },
      down: {
        1: 'Hi escrivim',
        2: 'Qui t’estima sense ser de la família',
        3: 'Bossa gran de roba o paper',
        5: 'Contrari de bé',
      },
    },
  },
  {
    grid: ['NORMA', 'E#I##', 'TRENS', '##R#A', 'BLANC'],
    clues: {
      across: { 1: 'Regla', 3: 'Els que van per via', 5: 'Color de la neu' },
      down: { 1: 'Contrari de brut', 2: 'Torrent', 4: 'Bossa gran de roba o paper' },
    },
  },
  {
    grid: ['METGE', 'U####', 'ROSES', '####E', 'PARET'],
    clues: {
      across: { 1: 'Ens cura', 2: 'Flors espinoses', 4: 'Separa habitacions' },
      down: { 1: 'Paret exterior', 3: 'Un més que sis' },
    },
  },
  {
    grid: ['FRED#', '#I#O#', 'NEULA', '#R#O#', '#AGRE'],
    clues: {
      across: {
        1: 'Sensació de gel',
        4: 'Galeta fina d’aquesta època',
        5: 'Gust com el del vinagre',
      },
      down: { 2: 'Torrent', 3: 'Mal físic' },
    },
  },
  {
    grid: ['PLATS', 'R#U#A', 'ESTEL', 'U#O#T', 'SORRA'],
    clues: {
      across: { 1: 'On menges', 4: 'Va guiar els Reis', 5: 'Grans petits de la platja' },
      down: { 1: 'Allò que costen les coses', 2: 'Escriu llibres', 3: 'Fa un bot' },
    },
  },
  {
    grid: ['#AMIC', 'C#O#E', 'ALTAR', 'N#O#A', 'TURO#'],
    clues: {
      across: {
        1: 'Qui t’estima sense ser de la família',
        5: 'Taula d’església',
        6: 'Muntanya petita',
      },
      down: {
        2: 'Fa moure una màquina',
        3: 'La fan les abelles; serveix per a espelmes',
        4: 'Cançó de Nadal',
      },
    },
  },
  {
    grid: ['#PEUS', 'RAS#O', 'ALTAR', 'S#ART', 'ALTA#'],
    clues: {
      across: {
        1: 'Els de sota la cama',
        4: 'Ple fins a dalt',
        5: 'Taula d’església',
        7: 'Pintura, escultura, música…',
        8: 'Contrari de baixa',
      },
      down: {
        1: 'Barra llarga de fusta',
        2: 'Condició',
        3: 'Bona fortuna',
        4: 'Plana',
        6: 'En aquest moment',
      },
    },
  },
  {
    grid: ['##MAR', '#MOLI', 'S#TEU', 'USOS#', 'C#R##'],
    clues: {
      across: {
        1: 'Gran extensió d’aigua salada',
        4: 'Mol el gra',
        6: 'Possessiu de segona persona',
        7: 'Maneres d’aprofitar alguna cosa',
      },
      down: {
        1: 'Fa moure una màquina',
        2: 'Les d’un ocell',
        3: 'Corre cap al mar',
        5: 'El que es treu d’una taronja',
      },
    },
  },
  {
    grid: ['TOTES', '#N##E', 'PALAU', 'I##R#', 'SANTA'],
    clues: {
      across: { 1: 'Totes elles', 4: 'Casa d’un rei', 6: 'Dona venerada' },
      down: {
        2: 'La mou el vent al mar',
        3: 'Església principal d’una diòcesi',
        4: 'Habitatge d’un bloc',
        5: 'Pintura, escultura, música…',
      },
    },
  },
  {
    grid: ['#AMOR', 'O#E#O', 'NOTES', 'Z#G#A', 'ERES#'],
    clues: {
      across: { 1: 'Sentiment molt gran', 5: 'Dò, re, mi…', 6: 'Verb ser, tu' },
      down: { 2: 'Ens cura', 3: 'Flor amb espines', 4: 'Deu més un' },
    },
  },
  {
    grid: ['##PES', '#MARE', 'P#REC', 'ALLS#', 'S#A##'],
    clues: {
      across: {
        1: 'El mesura la balança',
        4: 'Qui ens ha parit',
        6: 'Canal petit de reg',
        7: 'Cabdells aromàtics de la cuina',
      },
      down: {
        1: 'Diu paraules',
        2: 'Verb ser, tu',
        3: 'Contrari de mullat',
        5: 'Cada moviment del peu en caminar',
      },
    },
  },
  {
    grid: ['PREUS', 'L#S#E', 'AUTOR', 'T#E#R', 'SALTA'],
    clues: {
      across: { 1: 'Allò que costen les coses', 4: 'Escriu llibres', 5: 'Fa un bot' },
      down: { 1: 'On menges', 2: 'Va guiar els Reis', 3: 'Cadena de muntanyes' },
    },
  },
  {
    grid: ['FLOR#', 'R#R#P', 'E#DOL', 'D#R#A', '#NEU#'],
    clues: {
      across: { 1: 'Té pètals', 4: 'Tristesa per una pèrdua', 5: 'Cau blanca de l’hivern' },
      down: { 1: 'Sensació de gel', 2: 'Contrari de desordre', 3: 'Sense pujades ni baixades' },
    },
  },
  {
    grid: ['TARTA', '#R##L', 'CANTA', 'O##O#', 'SALSA'],
    clues: {
      across: { 1: 'Pastís gran', 4: 'Fa música amb la veu', 6: 'Acompanya la pasta' },
      down: {
        2: 'En aquest moment',
        3: 'Per volar',
        4: 'El tenim de cap a peus',
        5: 'Reflex de la gola',
      },
    },
  },
  {
    grid: ['DOLOR', 'I####', 'TEMPS', '####O', 'ESTIU'],
    clues: {
      across: { 1: 'Mal físic', 2: 'El que marca el rellotge', 4: 'Estació calorosa' },
      down: { 1: 'N’hi ha cinc a cada mà', 3: 'El que es cobra a la feina' },
    },
  },
  {
    grid: ['FLOR#', 'R#N#M', 'U#C#O', 'I#L#T', 'TRENS'],
    clues: {
      across: { 1: 'Té pètals', 4: 'Els que van per via' },
      down: { 1: 'El produeix un arbre', 2: 'Germà del pare', 3: 'Paraules' },
    },
  },
  {
    grid: ['COS##', 'A#O#T', 'VAPOR', 'A#A#U', '##ROC'],
    clues: {
      across: { 1: 'El tenim de cap a peus', 4: 'Aigua en forma de gas', 5: 'Pedra gran' },
      down: { 1: 'Brindis de festa', 2: 'Àpat de la nit', 3: 'Joc de cartes; també una trucada' },
    },
  },
  {
    grid: ['TOTS#', 'E#O#A', 'L#MES', 'A#B#E', '#NAS#'],
    clues: {
      across: { 1: 'Contrari de ningú', 4: 'Gener, febrer, març…', 5: 'Serveix per olorar' },
      down: {
        1: 'Roba sense confeccionar',
        2: 'Lloc on s’enterra algú',
        3: 'Animal de les orelles llargues',
      },
    },
  },
  {
    grid: ['MAG#M', '#R##U', 'ACTOR', 'V##C#', 'I#GAT'],
    clues: {
      across: { 1: 'Un dels Reis d’Orient', 4: 'Fa de personatge', 6: 'Fa «miau»' },
      down: {
        2: 'Es fa servir amb fletxes',
        3: 'Paret exterior',
        4: 'Pare del pare',
        5: 'Ocell de corral que fa «gruix»',
      },
    },
  },
  {
    grid: ['MARES', 'A####', 'ROSES', '####E', 'PALAU'],
    clues: {
      across: { 1: 'Elles tenen fills', 2: 'Flors espinoses', 4: 'Casa d’un rei' },
      down: { 1: 'Gran extensió d’aigua salada', 3: 'Església principal d’una diòcesi' },
    },
  },
  {
    grid: ['VESPA', 'A#A##', 'SALSA', '##U#S', 'ALTRE'],
    clues: {
      across: { 1: 'Insecte que fica', 3: 'Acompanya la pasta', 5: 'Diferent' },
      down: {
        1: 'Per beure aigua',
        2: 'Estat de qui no té malalties',
        4: 'Animal de les orelles llargues',
      },
    },
  },
  {
    grid: ['NITS#', 'E#E#P', 'N#COL', 'A#L#A', '#NAS#'],
    clues: {
      across: { 1: 'Moments sense sol', 4: 'Verdura de fulles verdes', 5: 'Serveix per olorar' },
      down: { 1: 'Filla petita', 2: 'Es prem al piano', 3: 'Sense pujades ni baixades' },
    },
  },
  {
    grid: ['SEDA#', 'O#I#S', 'R#NOU', 'T#A#C', '#GRA#'],
    clues: {
      across: { 1: 'Teixit fi i brillant', 4: 'Contrari de vell', 5: 'Part petita d’un cereal' },
      down: { 1: 'Bona fortuna', 2: 'Àpat del migdia', 3: 'El que es treu d’una taronja' },
    },
  },
  {
    grid: ['SOPAR', 'O#A##', 'MARES', '##E#O', 'ESTIU'],
    clues: {
      across: { 1: 'Àpat de la nit', 3: 'Elles tenen fills', 5: 'Estació calorosa' },
      down: { 1: 'Capacitat de dormir', 2: 'Separa habitacions', 4: 'El que es cobra a la feina' },
    },
  },
  {
    grid: ['#ANYS', 'B#O#E', 'O#T#D', 'S#E#A', 'CASA#'],
    clues: {
      across: { 1: 'Els fas cada aniversari', 5: 'Allà on vivim' },
      down: { 2: 'Dò, re, mi…', 3: 'Teixit fi i brillant', 4: 'Lloc ple d’arbres' },
    },
  },
  {
    grid: ['#RAS#', 'GEL#S', 'RITME', 'A#REC', '#PES#'],
    clues: {
      across: {
        1: 'Ple fins a dalt',
        3: 'Aigua a menys de zero',
        5: 'Cadència de la música',
        7: 'Canal petit de reg',
        8: 'El mesura la balança',
      },
      down: {
        1: 'Governa un regne',
        2: 'Diferent',
        3: 'Part petita d’un cereal',
        4: 'Contrari de mullat',
        6: 'Gener, febrer, març…',
      },
    },
  },
];

/** Puzles temàtics: surten exactament el seu dia (Advent, Santa Llúcia, Nadal, Sant Esteve, Cap d'Any…). */
const THEMED: Record<string, MiniPuzzle> = {
  '2026-12-25': {
    grid: ['#CANT', 'G#N#A', 'REGAL', 'I#E#L', 'SALA#'],
    clues: {
      across: { 1: 'Cançó de Nadal', 5: 'Es dona per Nadal', 6: 'Habitació gran' },
      down: { 2: 'Missatger amb ales', 3: 'Incisió', 4: 'Color del cendrer' },
    },
  },
  '2026-12-24': {
    grid: ['BOCA#', 'O#A#C', 'L#NEU', 'A#T#A', '#MAG#'],
    clues: {
      across: { 1: 'Per on mengem', 4: 'Cau blanca de l’hivern', 5: 'Un dels Reis d’Orient' },
      down: { 1: 'Es penja a l’arbre', 2: 'Fa música amb la veu', 3: 'Part posterior d’un animal' },
    },
  },
  '2026-12-31': {
    grid: ['#TRIA', 'R#E#L', 'ANGEL', 'I#A#S', 'MOLT#'],
    clues: {
      across: { 1: 'Selecciona', 5: 'Missatger amb ales', 6: 'Gran quantitat' },
      down: {
        2: 'Es dona per Nadal',
        3: 'Cabdells aromàtics de la cuina',
        4: 'Es fa servir per al vi i al cap d’any',
      },
    },
  },
  '2026-12-13': {
    grid: ['#CAMP', 'R#N#L', 'AIGUA', 'I#E#T', 'MELO#'],
    clues: {
      across: { 1: 'Terreny de cultiu', 5: 'H2O', 6: 'Fruita grossa d’estiu' },
      down: {
        2: 'Missatger amb ales',
        3: 'On s’hi serveix el menjar',
        4: 'Es fa servir per al vi i al cap d’any',
      },
    },
  },
  '2026-12-20': {
    grid: ['POU#V', '#L##I', 'TINTA', 'E##I#', 'U#FOC'],
    clues: {
      across: { 1: 'Forat per treure aigua', 4: 'Líquid per escriure', 6: 'El crema tot' },
      down: {
        2: 'Greix de l’oliva',
        3: 'Per on passa el tren',
        4: 'Possessiu de segona persona',
        5: 'Caga torrons',
      },
    },
  },
  '2026-12-26': {
    grid: ['FRUIT', '#I##I', 'TURRO', 'O##O#', 'TANCA'],
    clues: {
      across: { 1: 'El produeix un arbre', 4: 'Dolç de neules i ametlles', 6: 'Tapa l’entrada' },
      down: { 2: 'Corre cap al mar', 3: 'Caga torrons', 4: 'Contrari de res', 5: 'Pedra gran' },
    },
  },
  '2026-12-22': {
    grid: ['##MAG', '#CAVA', 'D#NIT', 'ALTA#', 'U#A##'],
    clues: {
      across: {
        1: 'Un dels Reis d’Orient',
        4: 'Brindis de festa',
        6: 'Quan és fosc',
        7: 'Contrari de baixa',
      },
      down: { 1: 'Cobreix al llit', 2: 'Mare de la mare', 3: 'Fa «miau»', 5: 'Cub de sis cares' },
    },
  },
  '2026-11-29': {
    grid: ['NADAL', 'I####', 'TEMPS', '####O', 'REGAL'],
    clues: {
      across: { 1: 'El 25 de desembre', 2: 'El que marca el rellotge', 4: 'Es dona per Nadal' },
      down: { 1: 'Quan és fosc', 3: 'Estrella que ens dona la llum del dia' },
    },
  },
  '2026-12-08': {
    grid: ['NOTA#', 'E#U#N', 'T#REI', 'A#R#T', '#FOC#'],
    clues: {
      across: { 1: 'Qualificació d’un examen', 4: 'Governa un regne', 5: 'El crema tot' },
      down: { 1: 'Filla del fill', 2: 'Dolç de neules i ametlles', 3: 'Quan és fosc' },
    },
  },
  '2026-12-28': {
    grid: ['#D#T#', 'FINAL', 'ONES#', 'CAUSA', '#R#A#'],
    clues: {
      across: { 3: 'Fi', 5: 'Moviment de l’aigua del mar', 6: 'Motiu' },
      down: {
        1: 'Àpat del migdia',
        2: 'Hi bevem el cafè',
        3: 'El crema tot',
        4: 'Cau blanca de l’hivern',
      },
    },
  },
};

const LEGACY = [...FIRST, FIRST[0], FIRST[1], ...HARDER];

export const PUZZLES: readonly MiniPuzzle[] = markLegacy(
  [...LEGACY, ...MORE],
  LEGACY.length,
  THEMED,
);
