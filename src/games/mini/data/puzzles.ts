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
    grid: ['SOM#OCA', '#N##L#L', '#AVUI#L', 'B##L##S', 'O#ALTA#', 'I#R##R#', 'GAT#CAP'],
    clues: {
      across: {
        1: 'Capacitat de dormir',
        3: 'Ocell de corral que fa «gruix»',
        5: 'Aquest dia',
        8: 'Contrari de baixa',
        10: 'Fa «miau»',
        11: 'Part del cos on tenim el cervell',
      },
      down: {
        2: 'La mou el vent al mar',
        3: 'Greix de l’oliva',
        4: 'Cabdells aromàtics de la cuina',
        6: 'Per veure-hi',
        7: 'Que ha perdut el seny',
        8: 'Pintura, escultura, música…',
        9: 'En aquest moment',
      },
    },
  },
  {
    grid: ['ALTAR', '##E#E', 'A#M#C', 'R#P##', 'TASCA'],
    clues: {
      across: {
        1: 'Taula d’església',
        5: 'Feina',
      },
      down: {
        2: 'El que marca el rellotge',
        3: 'Canal petit de reg',
        4: 'Pintura, escultura, música…',
      },
    },
  },
  {
    grid: ['VERS##', 'E##A#P', 'S#FLOR', 'PERA#O', 'A#E##V', '##DEMA'],
    clues: {
      across: {
        1: 'Línia de poema',
        4: 'Té pètals',
        5: 'Fruita que dona nom a un tipus de vi',
        6: 'El dia següent',
      },
      down: {
        1: 'Insecte que fica',
        2: 'Habitació gran',
        3: 'Examen',
        4: 'Sensació de gel',
      },
    },
  },
  {
    grid: ['LLUMS', '#L#A#', 'CUINA', '#N#T#', 'PALAU'],
    clues: {
      across: {
        1: 'Il·luminen l’arbre',
        4: 'Lloc de casa on es fa el menjar',
        5: 'Casa d’un rei',
      },
      down: {
        2: 'Satèl·lit de la Terra',
        3: 'Cobreix al llit',
      },
    },
  },
  {
    grid: ['#TRIAR#', '#I##B#T', 'TOCAR#E', 'R#OLI#L', 'U#SALTA', 'C#E##O#', '#ESTAT#'],
    clues: {
      across: {
        1: 'Escollir',
        4: 'Fer sonar un instrument',
        7: 'Greix de l’oliva',
        8: 'Fa un bot',
        10: 'Condició',
      },
      down: {
        1: 'Caga torrons',
        2: 'Mes de Sant Jordi',
        3: 'Roba sense confeccionar',
        4: 'Joc de cartes; també una trucada',
        5: 'Objectes',
        6: 'Per volar',
        9: 'Contrari de res',
      },
    },
  },
  {
    grid: ['COPES#V', 'A#I#E#E', 'GEL#MAR', 'A#OCA#D', 'NIT#F#U', 'E#E#O#R', 'R#SORRA'],
    clues: {
      across: {
        1: 'Trofeus amb forma de got',
        5: 'Aigua a menys de zero',
        6: 'Gran extensió d’aigua salada',
        7: 'Ocell de corral que fa «gruix»',
        8: 'Quan és fosc',
        9: 'Grans petits de la platja',
      },
      down: {
        1: 'Figureta del pessebre',
        2: 'Les fan servir els esportistes',
        3: 'Llum de tres colors al carrer',
        4: 'Enciam, col o bledes',
      },
    },
  },
  {
    grid: ['#GRA#', 'REI#P', 'ALTRE', 'S#MES', '#SEC#'],
    clues: {
      across: {
        1: 'Part petita d’un cereal',
        3: 'Governa un regne',
        5: 'Diferent',
        7: 'Gener, febrer, març…',
        8: 'Contrari de mullat',
      },
      down: {
        1: 'Aigua a menys de zero',
        2: 'Cadència de la música',
        3: 'Ple fins a dalt',
        4: 'El mesura la balança',
        6: 'Canal petit de reg',
      },
    },
  },
  {
    grid: ['TROPA##', 'A#NORMA', 'R#ALA#N', 'D##V##D', 'O#SOM#A', 'RIERA#N', '##CORDA'],
    clues: {
      across: {
        1: 'Conjunt de soldats',
        5: 'Regla',
        7: 'Per volar',
        8: 'Capacitat de dormir',
        10: 'Torrent',
        11: 'Fil gruixut',
      },
      down: {
        1: 'Estació de les fulles seques',
        2: 'La mou el vent al mar',
        3: 'Dolç sec que es desfà a la boca',
        4: 'En aquest moment',
        6: 'Vora de les vies, a l’estació',
        8: 'Contrari de mullat',
        9: 'Gran extensió d’aigua salada',
      },
    },
  },
  {
    grid: ['AUTOR', 'G#O#I', 'ONCLE', 'S#A#R', 'TERRA'],
    clues: {
      across: {
        1: 'Escriu llibres',
        4: 'Germà del pare',
        5: 'Planeta on vivim',
      },
      down: {
        1: 'Mes de vacances d’estiu',
        2: 'Fer sonar un instrument',
        3: 'Torrent',
      },
    },
  },
  {
    grid: ['POETA#P', 'A#S#B#A', 'GAT#RAS', 'E#AVI#T', 'SUC#G#O', 'O#I#A#R', 'S#OBRES'],
    clues: {
      across: {
        1: 'Escriu versos',
        5: 'Fa «miau»',
        6: 'Ple fins a dalt',
        7: 'Pare del pare',
        8: 'El que es treu d’una taronja',
        9: 'Treballs fets',
      },
      down: {
        1: 'Treballen el camp',
        2: 'Allà s’agafa el tren',
        3: 'Posar roba perquè no tingui fred',
        4: 'Els qui cuiden ovelles',
      },
    },
  },
  {
    grid: ['#C###L', 'ROIG#L', 'OLLA#U', 'S#LLUM', 'E#ALLS', 'S###L#'],
    clues: {
      across: {
        3: 'Color del tomàquet madur',
        6: 'Per bullir',
        7: 'Fa que hi vegem',
        9: 'Cabdells aromàtics de la cuina',
      },
      down: {
        1: 'Verdura de fulles verdes',
        2: 'Il·luminen l’arbre',
        3: 'Flors espinoses',
        4: 'Terra voltada d’aigua',
        5: 'Ocell que canta a l’alba',
        8: 'Per veure-hi',
      },
    },
  },
  {
    grid: ['#V#ROM', 'MELO#O', '#N#SET', 'PAPER#', 'I#ASE#', 'SOL#S#'],
    clues: {
      across: {
        2: 'Licor de les Antilles',
        4: 'Fruita grossa d’estiu',
        5: 'Un més que sis',
        7: 'Hi escrivim',
        9: 'Animal de les orelles llargues',
        10: 'Estrella que ens dona la llum del dia',
      },
      down: {
        1: 'Hi circula la sang',
        2: 'Flors espinoses',
        3: 'Cada una de les paraules',
        6: 'Verb ser, tu',
        7: 'Habitatge d’un bloc',
        8: 'Barra llarga de fusta',
      },
    },
  },
  {
    grid: ['#MES', 'PARE', '#TEU', 'PIS#'],
    clues: {
      across: {
        1: 'Gener, febrer, març…',
        4: 'Home amb fills',
        5: 'Possessiu de segona persona',
        6: 'Habitatge d’un bloc',
      },
      down: {
        1: 'Primera part del dia',
        2: 'Verb ser, tu',
        3: 'Església principal d’una diòcesi',
      },
    },
  },
  {
    grid: ['OBRES', '##E##', 'FUSTA', '##T##', 'PLATS'],
    clues: {
      across: {
        1: 'Treballs fets',
        3: 'Material de l’arbre',
        4: 'S’hi serveix el menjar',
      },
      down: {
        2: 'Operació contrària a la suma',
      },
    },
  },
  {
    grid: ['CANTAR', '#L#U##', '#TARTA', 'CALOR#', '##E#I#', 'GASPAR'],
    clues: {
      across: {
        1: 'Fer sonar la veu amb una melodia',
        4: 'Pastís gran',
        7: 'Contrari de fred',
        8: 'Un dels tres Reis d’Orient',
      },
      down: {
        2: 'Contrari de baixa',
        3: 'Muntanya petita',
        5: 'Les d’un ocell',
        6: 'Selecciona',
      },
    },
  },
  {
    grid: ['FULLA', 'O#L##', 'C#U#G', '##M#R', 'FUSTA'],
    clues: {
      across: {
        1: 'Part verda de la planta',
        4: 'Material de l’arbre',
      },
      down: {
        1: 'El crema tot',
        2: 'Il·luminen l’arbre',
        3: 'Part petita d’un cereal',
      },
    },
  },
  {
    grid: ['#M#P', 'VACA', 'ALES', 'S#L#'],
    clues: {
      across: {
        3: 'Dona llet',
        5: 'Les d’un ocell',
      },
      down: {
        1: 'Contrari de bé',
        2: 'Cada moviment del peu en caminar',
        3: 'Per beure aigua',
        4: 'Allà on volen els ocells',
      },
    },
  },
  {
    grid: ['NEGRE#P', 'E#A#SAL', 'U#N#T#A', '#FINAL#', 'T#V#C#C', 'ASE#I#U', 'P#TROPA'],
    clues: {
      across: {
        1: 'Color del carbó',
        5: 'Condiment blanc de la cuina',
        6: 'Fi',
        9: 'Animal de les orelles llargues',
        10: 'Conjunt de soldats',
      },
      down: {
        1: 'Cau blanca de l’hivern',
        2: 'Serveix per tallar a taula',
        3: 'Allà s’agafa el tren',
        4: 'Sense pujades ni baixades',
        7: 'Tanca l’ampolla',
        8: 'Part posterior d’un animal',
      },
    },
  },
  {
    grid: ['CARRER', '#M#A##', '#OLIVA', 'CREMA#', '##N#L#', 'RATOLI'],
    clues: {
      across: {
        1: 'Via amb cases a banda i banda',
        4: 'Fruit de l’olivera',
        7: 'Postres catalanes',
        8: 'Animal petit, o perifèric de l’ordinador',
      },
      down: {
        2: 'Sentiment molt gran',
        3: 'Fruit que es pren per Cap d’Any',
        5: 'Sense pressa',
        6: 'Terreny entre muntanyes',
      },
    },
  },
  {
    grid: ['ARC#DOS', '#I##I#E', '#URNA#D', 'T##E##A', 'R#RUTA#', 'E#O##V#', 'NOM#PIC'],
    clues: {
      across: {
        1: 'Es fa servir amb fletxes',
        3: 'Un més un',
        5: 'Hi posem el vot',
        8: 'Itinerari',
        10: 'Com et diuen',
        11: 'Cim agut',
      },
      down: {
        2: 'Corre cap al mar',
        3: 'El que va entre dues nits',
        4: 'Teixit fi i brillant',
        6: 'Cau blanca de l’hivern',
        7: 'Va sobre rails',
        8: 'Licor de les Antilles',
        9: 'Pare del pare',
      },
    },
  },
  {
    grid: ['GLOBUS', '#L#L##', 'FORAT#', '#COURE', '##I#E#', 'SEGONS'],
    clues: {
      across: {
        1: 'Bola de goma inflada amb aire',
        4: 'Obertura',
        7: 'Metall vermellós',
        8: 'Seixanta fan un minut',
      },
      down: {
        2: 'Espai concret',
        3: 'Color del cel clar',
        5: 'Color del tomàquet madur',
        6: 'Va sobre rails',
      },
    },
  },
  {
    grid: ['BOSSA', 'L#A#R', 'ARBRE', 'N#O#N', 'CARTA'],
    clues: {
      across: {
        1: 'Hi portem la compra',
        4: 'Es decora per Nadal',
        5: 'Missatge escrit',
      },
      down: {
        1: 'Color de la neu',
        2: 'Gust',
        3: 'Cobreix la platja',
      },
    },
  },
  {
    grid: ['P#R##C#', 'L#ACTOR', 'AVIA#R#', 'T#MUR#C', '#P#SALA', 'FORAT#M', '#U##A#A'],
    clues: {
      across: {
        4: 'Fa de personatge',
        6: 'Mare de la mare',
        7: 'Paret exterior',
        11: 'Habitació gran',
        12: 'Obertura',
      },
      down: {
        1: 'On s’hi serveix el menjar',
        2: 'Fruit que es pren per Cap d’Any',
        3: 'Bombeja la sang',
        5: 'Motiu',
        8: 'Rosegador gros',
        9: 'Va del genoll al peu',
        10: 'Forat per treure aigua',
      },
    },
  },
  {
    grid: ['CORRER', '#L#I##', '#LLUNA', 'SALSA#', '##A#T#', 'MERCAT'],
    clues: {
      across: {
        1: 'Anar molt de pressa a peu',
        4: 'Satèl·lit de la Terra',
        7: 'Acompanya la pasta',
        8: 'Lloc de fruites i verdures',
      },
      down: {
        2: 'Per bullir',
        3: 'Corrents d’aigua dolça',
        5: 'Casa on es viu en família',
        6: 'Part grassa de la llet',
      },
    },
  },
  {
    grid: ['MANTA', 'A#U##', 'G#V#F', '##O#A', 'DOLOR'],
    clues: {
      across: {
        1: 'Cobreix al llit',
        4: 'Mal físic',
      },
      down: {
        1: 'Un dels Reis d’Orient',
        2: 'Cotó al cel',
        3: 'Torre de llum per als vaixells',
      },
    },
  },
  {
    grid: ['MOT#', 'ANEC', 'GEL#', '#SAC'],
    clues: {
      across: {
        1: 'Cada una de les paraules',
        4: 'Ocell que neda a l’estany',
        5: 'Aigua a menys de zero',
        6: 'Bossa gran de roba o paper',
      },
      down: {
        1: 'Un dels Reis d’Orient',
        2: 'Moviment de l’aigua del mar',
        3: 'Roba sense confeccionar',
      },
    },
  },
  {
    grid: ['BROMA', 'O#L##', 'U#I#V', '##V#I', 'PLANA'],
    clues: {
      across: {
        1: 'Gràcia que es fa a algú',
        4: 'Terreny sense desnivells',
      },
      down: {
        1: 'Animal que estira l’arada',
        2: 'Fruit de l’olivera',
        3: 'Per on passa el tren',
      },
    },
  },
  {
    grid: ['#BOSCOS', 'U###U##', 'SORRA#L', 'O##E##L', 'S#VINYA', '##A###R', 'GASPAR#'],
    clues: {
      across: {
        1: 'Llocs plens d’arbres',
        4: 'Grans petits de la platja',
        7: 'Camp de ceps',
        8: 'Un dels tres Reis d’Orient',
      },
      down: {
        2: 'Part posterior d’un animal',
        3: 'Maneres d’aprofitar alguna cosa',
        5: 'Governa un regne',
        6: 'Casa on es viu en família',
        7: 'Per beure aigua',
      },
    },
  },
  {
    grid: ['#SUC#P', 'PAS##A', 'LLOC#L', 'O#SOPA', 'M##SEU', 'A#MAL#'],
    clues: {
      across: {
        1: 'El que es treu d’una taronja',
        4: 'Cada moviment del peu en caminar',
        5: 'Espai concret',
        7: 'Plat de brou',
        9: 'Església principal d’una diòcesi',
        10: 'Contrari de bé',
      },
      down: {
        1: 'Condiment blanc de la cuina',
        2: 'Maneres d’aprofitar alguna cosa',
        3: 'Casa d’un rei',
        4: 'Hi escrivim amb tinta',
        6: 'Qualsevol objecte',
        8: 'Creix a la pell',
      },
    },
  },
  {
    grid: ['#TALP', '#I##L', 'FORMA', 'I##U#', 'LLAR#'],
    clues: {
      across: {
        1: 'Mamífer que viu sota terra',
        3: 'Figura',
        5: 'Casa on es viu en família',
      },
      down: {
        1: 'Caga torrons',
        2: 'Sense pujades ni baixades',
        3: 'Hi enfiles l’agulla',
        4: 'Paret exterior',
      },
    },
  },
  {
    grid: ['NETA##', 'E##M#S', 'U#VIDA', 'LLAC#L', 'A#L##U', '##LENT'],
    clues: {
      across: {
        1: 'Filla del fill',
        4: 'Contrari de mort',
        5: 'Gran estany',
        6: 'Sense pressa',
      },
      down: {
        1: 'Galeta fina d’aquesta època',
        2: 'Qui t’estima sense ser de la família',
        3: 'Estat de qui no està malalt',
        4: 'Terreny entre muntanyes',
      },
    },
  },
  {
    grid: ['#PREDIR', 'A###I##', 'MOSCA#R', 'O##O##O', 'R#PREUS', '##O###A', 'BOTIGA#'],
    clues: {
      across: {
        1: 'Dir el que passarà',
        4: 'Insecte que fa zum',
        7: 'Allò que costen les coses',
        8: 'Lloc on es compra',
      },
      down: {
        2: 'El que va entre dues nits',
        3: 'Sentiment molt gran',
        5: 'Bombeja la sang',
        6: 'Flor amb espines',
        7: 'Recipient amb tapa',
      },
    },
  },
  {
    grid: ['#CAP', 'CAVA', '#MIL', 'VIA#'],
    clues: {
      across: {
        1: 'Part del cos on tenim el cervell',
        4: 'Beguda amb bombolles per brindar',
        5: 'Deu vegades cent',
        6: 'Per on passa el tren',
      },
      down: {
        1: 'Via per anar d’un lloc a l’altre',
        2: 'Mare de la mare',
        3: 'Barra llarga de fusta',
      },
    },
  },
  {
    grid: ['#TEMPLE', 'O###I##', 'BLANC#L', 'R##E##L', 'A#SUCRE', '##O###T', 'CULLER#'],
    clues: {
      across: {
        1: 'Edifici sagrat',
        4: 'Color de la neu',
        7: 'Endolceix el cafè',
        8: 'Serveix per prendre la sopa',
      },
      down: {
        2: 'Cim agut',
        3: 'Feina feta; llibre o quadre',
        5: 'Cau blanca de l’hivern',
        6: 'Beguda blanca',
        7: 'Estrella que ens dona la llum del dia',
      },
    },
  },
  {
    grid: ['COSA##', 'R##V#P', 'E#PELL', 'MORT#A', 'A#A##T', '##TOTS'],
    clues: {
      across: {
        1: 'Qualsevol objecte',
        4: 'La que ens cobreix el cos',
        5: 'Final de la vida',
        6: 'Contrari de ningú',
      },
      down: {
        1: 'Postres catalanes',
        2: 'Conífer típic de Nadal',
        3: 'S’hi serveix el menjar',
        4: 'Camp d’herba',
      },
    },
  },
  {
    grid: ['COLA##', 'U##V#S', 'I#VIDA', 'NOIA#L', 'A#N##U', '##SORT'],
    clues: {
      across: {
        1: 'Pasta enganxosa',
        4: 'Contrari de mort',
        5: 'Jove',
        6: 'Bona fortuna',
      },
      down: {
        1: 'Lloc de casa on es fa el menjar',
        2: 'Mare de la mare',
        3: 'Estat de qui no està malalt',
        4: 'Begudes de raïm',
      },
    },
  },
];

/** Puzles temàtics: surten exactament el seu dia (Advent, Santa Llúcia, Nadal, Sant Esteve, Cap d'Any…). */
const THEMED: Record<string, MiniPuzzle> = {
  '2026-11-29': {
    grid: ['NINOT', '####O', 'FRUIT', 'O####', 'COSES'],
    clues: {
      across: {
        1: 'Figura de neu amb nas de pastanaga',
        3: 'El produeix un arbre',
        4: 'Objectes',
      },
      down: {
        2: 'Contrari de res',
        3: 'El crema tot',
      },
    },
  },
  '2026-12-08': {
    grid: ['##LLUM', 'PEL##U', 'A#ANYS', 'ROCA#E', 'E##TEU', 'SEDA#S'],
    clues: {
      across: {
        1: 'Fa que hi vegem',
        3: 'Creix a la pell',
        4: 'Els fas cada aniversari',
        6: 'Pedra enorme',
        7: 'Possessiu de segona persona',
        8: 'Teixit fi i brillant',
      },
      down: {
        1: 'Gran estany',
        2: 'Hi ha obres d’art o objectes antics',
        3: 'Els dos, mare i…',
        5: 'Part grassa de la llet',
      },
    },
  },
  '2026-12-13': {
    grid: ['#CLARA', 'MAL##L', '#SALSA', 'PARLA#', 'O##ULL', 'CREMA#'],
    clues: {
      across: {
        1: 'De la gema de l’ou',
        4: 'Contrari de bé',
        5: 'Acompanya la pasta',
        8: 'Diu paraules',
        9: 'Per veure-hi',
        10: 'Postres catalanes',
      },
      down: {
        1: 'Allà on vivim',
        2: 'Casa on es viu en família',
        3: 'Per volar',
        6: 'Fa que hi vegem',
        7: 'Habitació gran',
        8: 'Contrari de molt',
      },
    },
  },
  '2026-12-20': {
    grid: ['TORRO', '#C##N', 'MANTA', 'A##O#', 'GALTA'],
    clues: {
      across: {
        1: 'Dolç típic de Nadal',
        4: 'Cobreix al llit',
        6: 'Part tova de la cara',
      },
      down: {
        2: 'Ocell de corral que fa «gruix»',
        3: 'La mou el vent al mar',
        4: 'Un dels Reis d’Orient',
        5: 'Contrari de res',
      },
    },
  },
  '2026-12-22': {
    grid: ['GROSSA', '#O#O##', '#BARCA', 'CANTA#', '##E#V#', 'TECLAT'],
    clues: {
      across: {
        1: 'Loteria de Nadal',
        4: 'Embarcació petita',
        7: 'Fa música amb la veu',
        8: 'Conjunt de tecles de l’ordinador',
      },
      down: {
        2: 'Vestits en general',
        3: 'Bona fortuna',
        5: 'Ocell que neda a l’estany',
        6: 'Beguda amb bombolles per brindar',
      },
    },
  },
  '2026-12-24': {
    grid: ['#FORNER', 'C###I##', 'AGOST#P', 'N##O##L', 'T#FULLA', '##O###T', 'ESCALA#'],
    clues: {
      across: {
        1: 'Fa el pa',
        4: 'Mes de vacances d’estiu',
        7: 'Part verda de la planta',
        8: 'Graons per pujar',
      },
      down: {
        2: 'Quan és fosc',
        3: 'Cançó de Nadal',
        5: 'El que es cobra a la feina',
        6: 'On s’hi serveix el menjar',
        7: 'El crema tot',
      },
    },
  },
  '2026-12-25': {
    grid: ['B#T##A#', 'L#ORDRE', 'AGRE#C#', 'U#NIT#C', '#C#NATA', 'REGAL#V', '#L##L#A'],
    clues: {
      across: {
        4: 'Contrari de desordre',
        6: 'Gust com el del vinagre',
        7: 'Quan és fosc',
        11: 'Part grassa de la llet',
        12: 'Es dona per Nadal',
      },
      down: {
        1: 'Color del cel clar',
        2: 'Ordre per fer una cosa',
        3: 'Es fa servir amb fletxes',
        5: 'Dona que governa',
        8: 'Incisió',
        9: 'Beguda amb bombolles per brindar',
        10: 'Allà on volen els ocells',
      },
    },
  },
  '2026-12-26': {
    grid: ['NETA##', 'E##V#J', 'U#VENA', 'LLET#R', 'A#L##D', '##AVUI'],
    clues: {
      across: {
        1: 'Filla del fill',
        4: 'Hi circula la sang',
        5: 'Beguda blanca',
        6: 'Aquest dia',
      },
      down: {
        1: 'Galeta fina d’aquesta època',
        2: 'Conífer típic de Nadal',
        3: 'Espai amb flors i arbres',
        4: 'Teixit del vaixell',
      },
    },
  },
  '2026-12-28': {
    grid: ['NETA##', 'E##V#P', 'U#VELL', 'LLIT#A', 'A#E##N', '##SOPA'],
    clues: {
      across: {
        1: 'Filla del fill',
        4: 'Que té molts anys',
        5: 'Hi dormim',
        6: 'Plat de brou',
      },
      down: {
        1: 'Galeta fina d’aquesta època',
        2: 'Conífer típic de Nadal',
        3: 'Terreny sense desnivells',
        4: 'Les del tren, per exemple',
      },
    },
  },
  '2026-12-31': {
    grid: ['#FRED', '#A##O', 'TRENS', 'O##E#', 'CANT#'],
    clues: {
      across: {
        1: 'Sensació de gel',
        3: 'Els que van per via',
        5: 'Cançó de Nadal',
      },
      down: {
        1: 'Torre de llum per als vaixells',
        2: 'Un més un',
        3: 'Cop lleuger a la porta',
        4: 'Contrari de brut',
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
