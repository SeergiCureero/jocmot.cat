import { markLegacy } from '../../puzzles';
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

/**
 * Puzles de reserva afegits després: surten a partir del número 23 (veure `markLegacy`), un per dia,
 * quan el grup no n'ha programat cap. Pendents de revisió de l'equip.
 */
const MORE: readonly ConnexionsPuzzle[] = [
  {
    groups: [
      { level: 0, title: 'Fruits secs', words: ['AMETLLA', 'AVELLANA', 'PINYÓ', 'NOU'] },
      { level: 1, title: 'Ocells', words: ['PARDAL', 'GAVINA', 'MUSSOL', 'ÀNEC'] },
      { level: 2, title: 'Festes', words: ['CARNAVAL', 'NADAL', 'PASQUA', 'REIS'] },
      {
        level: 3,
        title: 'Comencen per PARA-',
        words: ['PARASOL', 'PARAXOCS', 'PARALLAMPS', 'PARAIGÜES'],
      },
    ],
  },
  {
    groups: [
      { level: 0, title: 'Ciutats de Catalunya', words: ['GIRONA', 'LLEIDA', 'TARRAGONA', 'REUS'] },
      { level: 1, title: 'Parts del cos', words: ['GENOLL', 'COLZE', 'TURMELL', 'ESPATLLA'] },
      { level: 2, title: 'Eines', words: ['MARTELL', 'SERRA', 'TENALLES', 'DESTRAL'] },
      {
        level: 3,
        title: 'Comencen per PORTA-',
        words: ['PORTAVEU', 'PORTAAVIONS', 'PORTAMONEDES', 'PORTAEQUIPATGES'],
      },
    ],
  },
  {
    groups: [
      { level: 0, title: 'Mamífers marins', words: ['BALENA', 'DOFÍ', 'FOCA', 'MORSA'] },
      { level: 1, title: 'Peixos', words: ['SARDINA', 'ANXOVA', 'TONYINA', 'LLUÇ'] },
      { level: 2, title: 'Marisc', words: ['GAMBA', 'ESCOPINYA', 'CIGALA', 'LLAGOSTA'] },
      {
        level: 3,
        title: 'Comencen per TRENCA-',
        words: ['TRENCACLOSQUES', 'TRENCANOUS', 'TRENCAPINYES', 'TRENCAGLAÇ'],
      },
    ],
  },
  {
    groups: [
      { level: 0, title: 'Planetes', words: ['MERCURI', 'MART', 'SATURN', 'NEPTÚ'] },
      { level: 1, title: 'Elements químics', words: ['OXIGEN', 'FERRO', 'COURE', 'HIDROGEN'] },
      { level: 2, title: 'L’aigua en altres formes', words: ['GEL', 'VAPOR', 'NEU', 'BOIRA'] },
      {
        level: 3,
        title: 'Comencen per GIRA-',
        words: ['GIRASOL', 'GIRAVOLT', 'GIRADISC', 'GIRAFA'],
      },
    ],
  },
  {
    groups: [
      { level: 0, title: 'Verdures', words: ['CARBASSÓ', 'PASTANAGA', 'ALBERGÍNIA', 'CEBA'] },
      { level: 1, title: 'Productes lactis', words: ['IOGURT', 'MATÓ', 'MANTEGA', 'NATA'] },
      { level: 2, title: 'Dolços tradicionals', words: ['TURRÓ', 'XURRO', 'PANELLET', 'BUNYOL'] },
      {
        level: 3,
        title: 'Comencen per RENTA-',
        words: ['RENTAPLATS', 'RENTAMANS', 'RENTADORA', 'RENTAVAIXELLES'],
      },
    ],
  },
  {
    groups: [
      { level: 0, title: 'Illes Balears', words: ['MALLORCA', 'MENORCA', 'EIVISSA', 'FORMENTERA'] },
      { level: 1, title: 'Oceans', words: ['ATLÀNTIC', 'PACÍFIC', 'ÍNDIC', 'ÀRTIC'] },
      { level: 2, title: 'Rius d’Europa', words: ['SENA', 'DANUBI', 'RIN', 'TÀMESI'] },
      {
        level: 3,
        title: 'Muntanyes del món',
        words: ['EVEREST', 'ACONCAGUA', 'KILIMANJARO', 'FUJI'],
      },
    ],
  },
  {
    groups: [
      { level: 0, title: 'Termes de futbol', words: ['CÒRNER', 'PENALTI', 'FALTA', 'GOL'] },
      { level: 1, title: 'Esports de raqueta', words: ['TENNIS', 'PÀDEL', 'BÀDMINTON', 'SQUASH'] },
      { level: 2, title: 'Esports d’aigua', words: ['NATACIÓ', 'WATERPOLO', 'PIRAGÜISME', 'SURF'] },
      {
        level: 3,
        title: 'Esports de muntanya',
        words: ['ESQUÍ', 'ALPINISME', 'ESCALADA', 'SNOWBOARD'],
      },
    ],
  },
  {
    groups: [
      { level: 0, title: 'Gèneres literaris', words: ['POESIA', 'ASSAIG', 'TEATRE', 'CONTE'] },
      { level: 1, title: 'Escriptors catalans', words: ['RODOREDA', 'VERDAGUER', 'FUSTER', 'PLA'] },
      { level: 2, title: 'Instruments de vent', words: ['FLAUTA', 'TROMPETA', 'CLARINET', 'TUBA'] },
      { level: 3, title: 'Signes de puntuació', words: ['COMA', 'PUNT', 'GUIÓ', 'PARÈNTESI'] },
    ],
  },
  {
    groups: [
      { level: 0, title: 'Parts d’una casa', words: ['SALA', 'CUINA', 'BANY', 'BALCÓ'] },
      { level: 1, title: 'Mobles', words: ['ARMARI', 'CADIRA', 'SOFÀ', 'CAIXONER'] },
      { level: 2, title: 'Electrodomèstics', words: ['NEVERA', 'FORN', 'LLAVADORA', 'TOSTADORA'] },
      {
        level: 3,
        title: 'Comencen per TIRA-',
        words: ['TIRABUIXÓ', 'TIRALLONGUES', 'TIRADOR', 'TIRAMISÚ'],
      },
    ],
  },
  {
    groups: [
      { level: 0, title: 'Arbres', words: ['PI', 'ALZINA', 'OLIVERA', 'FIGUERA'] },
      { level: 1, title: 'Flors', words: ['VIOLETA', 'MARGARIDA', 'ORQUÍDIA', 'TULIPA'] },
      { level: 2, title: 'Herbes aromàtiques', words: ['ROMANÍ', 'MENTA', 'ORENGA', 'FARIGOLA'] },
      { level: 3, title: 'Vents', words: ['TRAMUNTANA', 'GARBÍ', 'LLEVANT', 'MIGJORN'] },
    ],
  },
  {
    groups: [
      { level: 0, title: 'Família', words: ['AVI', 'NETA', 'ONCLE', 'COSÍ'] },
      { level: 1, title: 'Professions', words: ['METGE', 'FORNER', 'PAGÈS', 'BARBER'] },
      { level: 2, title: 'Cognoms catalans', words: ['FUSTER', 'PUIG', 'SERRA', 'VIDAL'] },
      { level: 3, title: 'Dits de la mà', words: ['POLZE', 'ÍNDEX', 'MIG', 'ANULAR'] },
    ],
  },
  {
    groups: [
      { level: 0, title: 'Capitals europees', words: ['LISBOA', 'ROMA', 'BERLÍN', 'VIENA'] },
      { level: 1, title: 'Monedes', words: ['EURO', 'DÒLAR', 'LLIURA', 'YEN'] },
      { level: 2, title: 'Idiomes', words: ['CATALÀ', 'ANGLÈS', 'ALEMANY', 'RUS'] },
      {
        level: 3,
        title: 'Comencen per CONTRA-',
        words: ['CONTRAPES', 'CONTRAST', 'CONTRAPUNT', 'CONTRABAIX'],
      },
    ],
  },
  {
    groups: [
      { level: 0, title: 'Llegums', words: ['LLENTIA', 'CIGRÓ', 'MONGETA', 'FESOL'] },
      { level: 1, title: 'Cereals', words: ['BLAT', 'ORDI', 'CIVADA', 'SÈGOL'] },
      { level: 2, title: 'Pasta', words: ['MACARRÓ', 'ESPAGUETI', 'RAVIOLI', 'FIDEU'] },
      {
        level: 3,
        title: 'Comencen per SOBRE-',
        words: ['SOBRETAULA', 'SOBREPES', 'SOBRESOU', 'SOBRENOM'],
      },
    ],
  },
  {
    groups: [
      { level: 0, title: 'Animals de granja', words: ['VACA', 'PORC', 'OVELLA', 'GALLINA'] },
      { level: 1, title: 'Sons d’animals', words: ['UDOLAR', 'RAGLAR', 'MIAGOLAR', 'GRUNYIR'] },
      {
        level: 2,
        title: 'On viuen els animals',
        words: ['COLMENA', 'FORMIGUER', 'NIU', 'GOSSERA'],
      },
      {
        level: 3,
        title: 'Comencen per ENTRE-',
        words: ['ENTRESOL', 'ENTREMÈS', 'ENTRECOT', 'ENTREACTE'],
      },
    ],
  },
  {
    groups: [
      { level: 0, title: 'Gèneres musicals', words: ['ROCK', 'JAZZ', 'RUMBA', 'FOLK'] },
      { level: 1, title: 'Danses', words: ['SARDANA', 'CONTRADANSA', 'GAVOTA', 'JOTA'] },
      { level: 2, title: 'Al teatre', words: ['ACTE', 'ESCENA', 'DECORAT', 'TELÓ'] },
      {
        level: 3,
        title: 'Comencen per GUARDA-',
        words: ['GUARDAROBA', 'GUARDAPOLS', 'GUARDABOSC', 'GUARDAESPATLLES'],
      },
    ],
  },
  {
    groups: [
      { level: 0, title: 'Mesos', words: ['GENER', 'MARÇ', 'JUNY', 'AGOST'] },
      { level: 1, title: 'Estacions', words: ['ESTIU', 'TARDOR', 'HIVERN', 'PRIMAVERA'] },
      { level: 2, title: 'Moments del dia', words: ['ALBA', 'MATÍ', 'TARDA', 'NIT'] },
      {
        level: 3,
        title: 'Comencen per MIG-',
        words: ['MIGDIA', 'MIGJORN', 'MIGNIT', 'MIGMETRATGE'],
      },
    ],
  },
  {
    groups: [
      { level: 0, title: 'Parts d’un arbre', words: ['ARREL', 'TRONC', 'BRANCA', 'FULLA'] },
      { level: 1, title: 'Parts d’un ocell', words: ['BEC', 'ALA', 'CUA', 'PLUMA'] },
      { level: 2, title: 'Parts d’una flor', words: ['PÈTAL', 'TIGE', 'SÈPAL', 'ESTAMBRE'] },
      { level: 3, title: 'Parts d’un llibre', words: ['PORTADA', 'CAPÍTOL', 'ÍNDEX', 'PRÒLEG'] },
    ],
  },
  {
    groups: [
      { level: 0, title: 'Metalls', words: ['FERRO', 'COURE', 'OR', 'PLATA'] },
      { level: 1, title: 'Pedres precioses', words: ['RUBÍ', 'DIAMANT', 'ESMERALDA', 'SAFIR'] },
      { level: 2, title: 'Materials de construcció', words: ['MAÓ', 'CIMENT', 'VIDRE', 'GUIX'] },
      {
        level: 3,
        title: 'Comencen per PASSA-',
        words: ['PASSAPORT', 'PASSAMÀ', 'PASSADÍS', 'PASSATEMPS'],
      },
    ],
  },
  {
    groups: [
      { level: 0, title: 'A la cuina', words: ['OLLA', 'CASSOLA', 'PAELLA', 'COLADOR'] },
      { level: 1, title: 'Coberts', words: ['GANIVET', 'FORQUILLA', 'CULLERA', 'PALETES'] },
      { level: 2, title: 'Vaixella', words: ['PLAT', 'TASSA', 'GOT', 'JARRA'] },
      {
        level: 3,
        title: 'Comencen per CAP-',
        words: ['CAPGROS', 'CAPVESPRE', 'CAPBUSSAR', 'CAPICUA'],
      },
    ],
  },
  {
    groups: [
      { level: 0, title: 'Fruits vermells', words: ['CIRERA', 'MADUIXA', 'GERD', 'MAGRANA'] },
      { level: 1, title: 'Fruita d’estiu', words: ['MELÓ', 'SÍNDRIA', 'PRÉSSEC', 'ALBERCOC'] },
      { level: 2, title: 'Cítrics', words: ['LLIMONA', 'TARONJA', 'MANDARINA', 'POMELO'] },
      {
        level: 3,
        title: 'Comencen per BEN-',
        words: ['BENESTAR', 'BENVINGUDA', 'BENAURAT', 'BENEFICI'],
      },
    ],
  },
  {
    groups: [
      { level: 0, title: 'Salut', words: ['METGE', 'INFERMER', 'DENTISTA', 'FARMACÈUTIC'] },
      { level: 1, title: 'Oficis antics', words: ['SABATER', 'FERRER', 'TEIXIDOR', 'BOTER'] },
      { level: 2, title: 'A l’escola', words: ['MESTRE', 'DIRECTOR', 'CONSERGE', 'BEDELL'] },
      { level: 3, title: 'Comencen per MAL-', words: ['MALSON', 'MALENTÈS', 'MALTEMPS', 'MALEÏT'] },
    ],
  },
  {
    groups: [
      { level: 0, title: 'Esmorzar', words: ['CAFÈ', 'CROISSANT', 'TORRADA', 'XOCOLATA'] },
      { level: 1, title: 'Postres', words: ['FLAM', 'GELAT', 'PASTÍS', 'NATILLES'] },
      { level: 2, title: 'Begudes', words: ['AIGUA', 'SUC', 'LLET', 'REFRESC'] },
      { level: 3, title: 'Amaguen un número', words: ['SETMANA', 'DEURE', 'ESTRES', 'CENTENAR'] },
    ],
  },
  {
    groups: [
      { level: 0, title: 'Gèneres de cinema', words: ['TERROR', 'COMÈDIA', 'WÈSTERN', 'DRAMA'] },
      { level: 1, title: 'En una pel·lícula', words: ['GUIÓ', 'MUNTATGE', 'ESCENA', 'FOTOGRAMA'] },
      { level: 2, title: 'Premis', words: ['OSCAR', 'GOYA', 'GAUDÍ', 'CÈSAR'] },
      {
        level: 3,
        title: 'Comencen per SUB-',
        words: ['SUBMARÍ', 'SUBTÍTOL', 'SUBSTITUT', 'SUBALTERN'],
      },
    ],
  },
  {
    groups: [
      { level: 0, title: 'A l’escriptori', words: ['LLAPIS', 'GOMA', 'REGLE', 'TISORES'] },
      {
        level: 1,
        title: 'Assignatures',
        words: ['MATEMÀTIQUES', 'HISTÒRIA', 'GEOGRAFIA', 'LLENGUA'],
      },
      { level: 2, title: 'Figures', words: ['CERCLE', 'TRIANGLE', 'QUADRAT', 'ROMBE'] },
      {
        level: 3,
        title: 'Comencen per AUTO-',
        words: ['AUTOBÚS', 'AUTOPISTA', 'AUTORETRAT', 'AUTOMÀTIC'],
      },
    ],
  },
  {
    groups: [
      {
        level: 0,
        title: 'Transport públic',
        words: ['METRO', 'TRAMVIA', 'AUTOCAR', 'FERROCARRIL'],
      },
      { level: 1, title: 'A la carretera', words: ['SEMÀFOR', 'ROTONDA', 'STOP', 'PEATGE'] },
      { level: 2, title: 'Parts d’un cotxe', words: ['VOLANT', 'MOTOR', 'RODA', 'PARAXOCS'] },
      {
        level: 3,
        title: 'Comencen per EXTRA-',
        words: ['EXTRAORDINARI', 'EXTRAPLA', 'EXTRATERRESTRE', 'EXTRACTE'],
      },
    ],
  },
  {
    groups: [
      { level: 0, title: 'Joguines', words: ['PILOTA', 'MUNYECA', 'PATINET', 'PEÇA'] },
      { level: 1, title: 'Jocs de taula', words: ['PARXÍS', 'OCA', 'DAMES', 'ESCACS'] },
      { level: 2, title: 'Jocs de cartes', words: ['TRUC', 'MUS', 'BRISCA', 'POQUER'] },
      {
        level: 3,
        title: 'Comencen per MATA-',
        words: ['MATAFOC', 'MATARATES', 'MATAMOSQUES', 'MATADOR'],
      },
    ],
  },
  {
    groups: [
      {
        level: 0,
        title: 'Esports d’hivern',
        words: ['ESQUÍ', 'SNOWBOARD', 'PATINATGE', 'BOBSLEIGH'],
      },
      { level: 1, title: 'Roba d’abric', words: ['BUFANDA', 'GUANTS', 'GORRA', 'ABRIC'] },
      { level: 2, title: 'Fred', words: ['GEBRE', 'NEU', 'GEL', 'CALAMARSA'] },
      {
        level: 3,
        title: 'Comencen per CAMP-',
        words: ['CAMPANA', 'CAMPIONAT', 'CAMPAMENT', 'CAMPESTRE'],
      },
    ],
  },
  {
    groups: [
      { level: 0, title: 'Rapinyaires', words: ['ÀGUILA', 'FALCÓ', 'VOLTOR', 'GAVILÀ'] },
      { level: 1, title: 'Ocells marins', words: ['GAVINA', 'PELICÀ', 'CORMORÀ', 'ALBATROS'] },
      { level: 2, title: 'Ocells de corral', words: ['GALLINA', 'POLLASTRE', 'GALL', 'OCA'] },
      {
        level: 3,
        title: 'Comencen per PICA-',
        words: ['PICAPEDRER', 'PICAPORT', 'PICADURA', 'PICADOR'],
      },
    ],
  },
  {
    groups: [
      {
        level: 0,
        title: 'Comunitats autònomes',
        words: ['CATALUNYA', 'ANDALUSIA', 'GALÍCIA', 'ARAGÓ'],
      },
      {
        level: 1,
        title: 'Illes de la Mediterrània',
        words: ['CÒRSEGA', 'SARDENYA', 'SICÍLIA', 'XIPRE'],
      },
      { level: 2, title: 'Mars', words: ['CANTÀBRIC', 'ADRIÀTIC', 'EGEU', 'JÒNIC'] },
      {
        level: 3,
        title: 'Comencen per MAR-',
        words: ['MARGARIDA', 'MARINADA', 'MARTELL', 'MARMOTA'],
      },
    ],
  },
  {
    groups: [
      { level: 0, title: 'Embotits', words: ['BOTIFARRA', 'LLONGANISSA', 'FUET', 'SOBRASSADA'] },
      { level: 1, title: 'Salses', words: ['ALLIOLI', 'ROMESCO', 'SAMFAINA', 'PICADA'] },
      { level: 2, title: 'Sopes', words: ['ESCUDELLA', 'GASPATXO', 'CONSOMÉ', 'SOPA'] },
      {
        level: 3,
        title: 'Comencen per CARN-',
        words: ['CARNAVAL', 'CARNISSER', 'CARNET', 'CARNÍVOR'],
      },
    ],
  },
  {
    groups: [
      { level: 0, title: 'Dispositius', words: ['MÒBIL', 'TAULETA', 'ORDINADOR', 'CÀMERA'] },
      { level: 1, title: 'Parts d’un ordinador', words: ['TECLAT', 'PANTALLA', 'DISC', 'ALTAVEU'] },
      { level: 2, title: 'A internet', words: ['CORREU', 'ENLLAÇ', 'NAVEGADOR', 'CONTRASENYA'] },
      {
        level: 3,
        title: 'Comencen per TELE-',
        words: ['TELÈFON', 'TELEVISIÓ', 'TELESCOPI', 'TELEFÈRIC'],
      },
    ],
  },
  {
    groups: [
      { level: 0, title: 'Insectes', words: ['FORMIGA', 'ABELLA', 'MOSCA', 'VESPA'] },
      { level: 1, title: 'Aràcnids', words: ['ARANYA', 'ESCORPÍ', 'ÀCAR', 'GARRAPATA'] },
      { level: 2, title: 'Rèptils', words: ['SERP', 'LLAGARTA', 'TORTUGA', 'CAMALEÓ'] },
      { level: 3, title: 'Comencen per COLL-', words: ['COLLAR', 'COLLITA', 'COLLIR', 'COLLADA'] },
    ],
  },
];

/**
 * Puzles temàtics: surten exactament el seu dia (Advent, Santa Llúcia, Nadal, Sant Esteve, Cap d'Any…)
 * i no formen part de l'ordre dels altres. Pendents de revisió de l'equip (vista /editor/proxims).
 */
const THEMED: Record<string, ConnexionsPuzzle> = {
  '2026-11-29': {
    groups: [
      { level: 0, title: 'Colors de Nadal', words: ['VERMELL', 'VERD', 'OR', 'BLANC'] },
      { level: 1, title: 'Decoració', words: ['GARLANDA', 'BOLA', 'ESTRELLA', 'PUNXA'] },
      { level: 2, title: 'Arbres', words: ['ABET', 'PI', 'ALZINA', 'CIPRER'] },
      {
        level: 3,
        title: 'Comencen per PES-',
        words: ['PESSEBRE', 'PESSETA', 'PESSIC', 'PESSIMISME'],
      },
    ],
  },
  '2026-12-08': {
    groups: [
      { level: 0, title: 'Un dia de pont', words: ['PONT', 'FESTA', 'VACANCES', 'ESCAPADA'] },
      { level: 1, title: 'Equipatge', words: ['MALETA', 'MOTXILLA', 'BOSSA', 'NECESSER'] },
      { level: 2, title: 'On anar', words: ['MUNTANYA', 'PLATJA', 'BALNEARI', 'CAMPING'] },
      { level: 3, title: 'Comencen per TUR-', words: ['TURRÓ', 'TURISTA', 'TURBINA', 'TURMELL'] },
    ],
  },
  '2026-12-13': {
    groups: [
      {
        level: 0,
        title: 'A la fira de Santa Llúcia',
        words: ['ABET', 'MOLSA', 'FIGURETA', 'CAGANER'],
      },
      { level: 1, title: 'Animals del pessebre', words: ['MULA', 'BOU', 'OVELLA', 'CAMELL'] },
      { level: 2, title: 'Llums', words: ['ESPELMA', 'BOMBETA', 'FANALET', 'LLANTERNA'] },
      {
        level: 3,
        title: 'Comencen per PASTOR-',
        words: ['PASTORET', 'PASTORA', 'PASTORAL', 'PASTORELLA'],
      },
    ],
  },
  '2026-12-20': {
    groups: [
      { level: 0, title: 'Dolços de Nadal', words: ['TURRÓ', 'NEULES', 'POLVORONS', 'MAÇAPÀ'] },
      { level: 1, title: 'Per brindar', words: ['CAVA', 'SIDRA', 'XAMPANY', 'VERMUT'] },
      { level: 2, title: 'Per cantar', words: ['VILLANCET', 'CANÇÓ', 'COR', 'PANDERETA'] },
      { level: 3, title: 'Comencen per CANT-', words: ['CANTAR', 'CANTANT', 'CANTATA', 'CANTERA'] },
    ],
  },
  '2026-12-21': {
    groups: [
      {
        level: 0,
        title: 'Fenòmens del cel',
        words: ['SOLSTICI', 'EQUINOCCI', 'ECLIPSI', 'COMETA'],
      },
      { level: 1, title: 'Fa fred', words: ['GEL', 'GEBRE', 'VENTADA', 'GLAÇ'] },
      { level: 2, title: 'Calor de casa', words: ['XEMENEIA', 'ESTUFA', 'MANTA', 'FOC'] },
      {
        level: 3,
        title: 'Comencen per LLAR-',
        words: ['LLARG', 'LLARGUESA', 'LLARGMETRATGE', 'LLARGAVISTA'],
      },
    ],
  },
  '2026-12-22': {
    groups: [
      { level: 0, title: 'La loteria', words: ['GROSSA', 'DÈCIM', 'BOMBO', 'PREMI'] },
      { level: 1, title: 'Diners', words: ['BITLLET', 'MONEDA', 'CARTERA', 'CAIXER'] },
      { level: 2, title: 'Sort', words: ['AZAR', 'RIFA', 'SORTEIG', 'FORTUNA'] },
      { level: 3, title: 'Comencen per REI-', words: ['REINA', 'REIAL', 'REINAR', 'REIXA'] },
    ],
  },
  '2026-12-23': {
    groups: [
      { level: 0, title: 'Menú de festa', words: ['CANELONS', 'ESCUDELLA', 'GALETS', 'ROSTIT'] },
      { level: 1, title: 'Fer la compra', words: ['MERCAT', 'CARRO', 'LLISTA', 'CISTELLA'] },
      { level: 2, title: 'Preparatius', words: ['REGALS', 'DECORACIÓ', 'MENÚ', 'INVITATS'] },
      {
        level: 3,
        title: 'Comencen per CAL-',
        words: ['CALENDARI', 'CALÇOTS', 'CALDERA', 'CALAMARSA'],
      },
    ],
  },
  '2026-12-24': {
    groups: [
      { level: 0, title: 'Personatges del pessebre', words: ['PASTOR', 'ÀNGEL', 'MAG', 'JOSEP'] },
      { level: 1, title: 'La nit de Nadal', words: ['MISSA', 'SOPAR', 'NADÓ', 'LLUM'] },
      { level: 2, title: 'Regals dels Reis', words: ['OR', 'INCENS', 'MIRRA', 'CARBÓ'] },
      {
        level: 3,
        title: 'Comencen per CAGA-',
        words: ['CAGATIÓ', 'CAGANER', 'CAGARRUTA', 'CAGADUBTES'],
      },
    ],
  },
  '2026-12-25': {
    groups: [
      { level: 0, title: 'Regals', words: ['PAPER', 'LLAÇ', 'CAIXA', 'ETIQUETA'] },
      { level: 1, title: 'Dinar de Nadal', words: ['ESCUDELLA', 'GALETS', 'PULARDA', 'TURRÓ'] },
      { level: 2, title: 'Família', words: ['AVI', 'NETA', 'ONCLE', 'COSÍ'] },
      { level: 3, title: 'Comencen per NA-', words: ['NADAL', 'NADÓ', 'NADIU', 'NAIXEMENT'] },
    ],
  },
  '2026-12-26': {
    groups: [
      { level: 0, title: 'Per als canelons', words: ['CARN', 'BEXAMEL', 'FORMATGE', 'PASTA'] },
      { level: 1, title: 'Les restes', words: ['RESTES', 'SOBRES', 'BOCINS', 'MIGUES'] },
      {
        level: 2,
        title: 'Cuinar amb restes',
        words: ['CROQUETES', 'CANELONS', 'SOPA', 'MACARRONS'],
      },
      {
        level: 3,
        title: 'Comencen per TRINX-',
        words: ['TRINXAT', 'TRINXERA', 'TRINXAR', 'TRINXANT'],
      },
    ],
  },
  '2026-12-27': {
    groups: [
      { level: 0, title: 'Després de Nadal', words: ['DIETA', 'GIMNÀS', 'REBAIXES', 'PROPÒSITS'] },
      { level: 1, title: 'Per llegir', words: ['LLIBRE', 'CONTE', 'POEMA', 'ASSAIG'] },
      { level: 2, title: 'Cinema de festes', words: ['COMÈDIA', 'DRAMA', 'ANIMACIÓ', 'MUSICAL'] },
      { level: 3, title: 'Comencen per VAG-', words: ['VAGAR', 'VAGABUND', 'VAGÓ', 'VAGAMENT'] },
    ],
  },
  '2026-12-28': {
    groups: [
      { level: 0, title: 'Sinònims de broma', words: ['BROMA', 'BURLA', 'FARSA', 'ENGANY'] },
      { level: 1, title: 'Fer riure', words: ['HUMOR', 'GRÀCIA', 'RISSA', 'XISTE'] },
      { level: 2, title: 'Ninots', words: ['PAPER', 'NEU', 'TRAPS', 'FUSTA'] },
      {
        level: 3,
        title: 'Comencen per INNO-',
        words: ['INNOCENT', 'INNOVAR', 'INNOVACIÓ', 'INNOCU'],
      },
    ],
  },
  '2026-12-30': {
    groups: [
      { level: 0, title: 'Els Reis Mags', words: ['MELCIOR', 'GASPAR', 'BALTASAR', 'ESTEL'] },
      { level: 1, title: 'Sopar de festa', words: ['GAMBES', 'OSTRES', 'CAVIAR', 'FOIE'] },
      { level: 2, title: 'Roba de festa', words: ['VESTIT', 'CORBATA', 'TACONS', 'SMOKING'] },
      {
        level: 3,
        title: 'Comencen per CAMPAN-',
        words: ['CAMPANA', 'CAMPANADES', 'CAMPANAR', 'CAMPANER'],
      },
    ],
  },
  '2026-12-31': {
    groups: [
      {
        level: 0,
        title: 'Per a la nit de Cap d’Any',
        words: ['RAÏM', 'CAVA', 'CONFETI', 'SERPENTINA'],
      },
      { level: 1, title: 'Els dotze…', words: ['CAMPANADES', 'DESITJOS', 'BRINDIS', 'PROPÒSITS'] },
      { level: 2, title: 'Tancar l’any', words: ['BALANÇ', 'RESUM', 'FINAL', 'ÚLTIM'] },
      { level: 3, title: 'Comencen per GEN-', words: ['GENER', 'GENT', 'GENIAL', 'GENERÓS'] },
    ],
  },
};

const LEGACY = [...FIRST, FIRST[0], ...HARDER];

export const PUZZLES: readonly ConnexionsPuzzle[] = markLegacy(
  [...LEGACY, ...MORE],
  LEGACY.length,
  THEMED,
);
