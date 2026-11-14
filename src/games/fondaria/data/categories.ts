/**
 * Categories de Fondària. Cada resposta va de la més habitual a la més rara: la posició a la llista
 * dona els punts (la primera ~10, l'última 100). Es comparen sense accents ni majúscules ni espais.
 * Pendents de revisió de l'equip i d'ampliar-se amb el que proposin els jugadors.
 */
export interface Category {
  id: string;
  /** Pregunta que es mostra. */
  prompt: string;
  /** Les més difícils només surten a les últimes preguntes. */
  hard?: boolean;
  /** Respostes vàlides, de la més habitual a la més rara. */
  answers: string[];
}

const list = (text: string) => [
  ...new Set(
    text
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  ),
];

export const CATEGORIES: Category[] = [
  {
    id: 'animal',
    prompt: 'Un animal',
    answers: list(
      'gat, gos, vaca, cavall, porc, ovella, gallina, conill, ànec, lleó, elefant, girafa, tigre, zebra, ós, llop, guineu, ratolí, rata, cabra, burro, mico, gorila, dofí, balena, tauró, foca, pingüí, àguila, mussol, pardal, colom, gavina, serp, tortuga, granota, cargol, formiga, abella, papallona, aranya, cangur, koala, camell, hipopòtam, rinoceront, pantera, lleopard, hiena, nutria, castor, esquirol, ratpenat, eriçó, teixó, isard, senglar, daina, cérvol, flamenc, pelicà, tucà, lloro, cigne, falcó, voltor, escurçó, camaleó, iguana, cocodril, caiman, salamandra, tritó, escorpí, libèl·lula, escarabat, narval, orca, morsa, okapi, pangolí, ornitorinc, axolot, quokka, aie-aie',
    ),
  },
  {
    id: 'pais',
    prompt: 'Un país',
    answers: list(
      'Espanya, França, Itàlia, Alemanya, Portugal, Anglaterra, Estats Units, Mèxic, Argentina, Brasil, Xina, Japó, Rússia, Índia, Canadà, Austràlia, Grècia, Suïssa, Holanda, Bèlgica, Irlanda, Escòcia, Turquia, Egipte, Marroc, Cuba, Colòmbia, Xile, Perú, Andorra, Noruega, Suècia, Dinamarca, Finlàndia, Polònia, Hongria, Croàcia, Àustria, Ucraïna, Tailàndia, Vietnam, Corea, Indonèsia, Nigèria, Kenya, Sud-àfrica, Etiòpia, Nova Zelanda, Equador, Uruguai, Bolívia, Veneçuela, Islàndia, Estònia, Letònia, Lituània, Eslovènia, Eslovàquia, Bulgària, Romania, Sèrbia, Albània, Mongòlia, Nepal, Bhutan, Kirguizistan, Eritrea, Vanuatu, Moçambic, Madagascar, Botswana, Laos, Brunei',
    ),
  },
  {
    id: 'ciutat-cat',
    prompt: 'Una ciutat o poble de Catalunya',
    answers: list(
      "Barcelona, Girona, Lleida, Tarragona, Reus, Sabadell, Terrassa, Mataró, Badalona, Vic, Olot, Figueres, Manresa, Granollers, Cambrils, Salou, Sitges, Tortosa, Berga, Igualada, Vilanova i la Geltrú, Blanes, Lloret de Mar, Cadaqués, Tossa de Mar, Banyoles, Ripoll, Puigcerdà, La Seu d'Urgell, Balaguer, Tàrrega, Cervera, Montblanc, Valls, Amposta, Falset, Solsona, Cardona, Vielha, Tremp, Flix, Artesa de Segre, Besalú, Peralada, Santa Pau, Rupit, Siurana, Prades, Escaló",
    ),
  },
  {
    id: 'menjar',
    prompt: 'Un plat o menjar',
    answers: list(
      'pizza, paella, macarrons, croquetes, truita, amanida, pa amb tomàquet, hamburguesa, espaguetis, lasanya, fideuà, escudella, canelons, calçots, escalivada, botifarra, esqueixada, mongetes, fricandó, suquet, arròs negre, cassola, xuixo, crema catalana, brandada, trinxat, escalivada, coca, panellets, torrada, truita de patates, gaspatxo, sushi, tacos, kebab, curri, falafel, pad thai, ramen, paella, fabada, cocido, sopa, bunyols, cargols a la llauna, mel i mató, romesco, allioli, xató, samfaina, ous ferrats, peus de porc, caracols, oliada, carquinyolis, ensaïmada',
    ),
  },
  {
    id: 'fruita',
    prompt: 'Una fruita',
    answers: list(
      'poma, pera, taronja, llimona, plàtan, maduixa, raïm, cirera, préssec, meló, síndria, pruna, figa, nespla, kiwi, pinya, mandarina, albercoc, magrana, codony, mango, papaia, coco, litxi, aranja, nabiu, gerd, móra, aguacat, caqui, pomelo, nectarina, melicotó, xirimoia, carambola, pitaia, maracujà, grosella, tamarinde, durian, mangostà, kumquat',
    ),
  },
  {
    id: 'verdura',
    prompt: 'Una verdura o hortalissa',
    answers: list(
      'tomàquet, ceba, patata, pastanaga, enciam, carbassó, pebrot, albergínia, all, cogombre, mongeta, bròquil, coliflor, espinacs, bleda, col, pèsol, carbassa, api, porro, remolatxa, rave, espàrrec, fonoll, carxofa, nap, ceba tendra, bolets, cigrons, mongetes tendres, pastanaga, escarola, endívia, ruca, romanesco, xirivia, salsifí, escaiola, naps, bledes, cardo, col arrissada, créixens, tupinambo, nyàmera, moniato',
    ),
  },
  {
    id: 'instrument',
    prompt: 'Un instrument musical',
    answers: list(
      'guitarra, piano, violí, bateria, flauta, trompeta, saxo, trombó, violoncel, contrabaix, clarinet, arpa, acordió, orgue, tuba, tambor, pandereta, castanyoles, maraques, xilòfon, timbal, ukelele, banjo, mandolina, harmònica, gralla, tenora, tible, flabiol, tamborí, sac de gemecs, cornamusa, oboè, fagot, corn, trompa, bombo, triangle, platerets, djembé, sitar, zamfoña, theremin, clavicèmbal, ocarina, didjeridú, kalimba, bandúrria, llaüt, viola, tiorba, serpentí, ocarina',
    ),
  },
  {
    id: 'esport',
    prompt: 'Un esport',
    answers: list(
      'futbol, bàsquet, tennis, natació, ciclisme, atletisme, handbol, voleibol, rugbi, golf, esquí, boxa, judo, karate, hoquei, pàdel, surf, gimnàstica, equitació, rem, vela, escalada, triatló, marató, waterpolo, esgrima, tir amb arc, halterofília, bàdminton, ping-pong, bitlles, petanca, billar, dards, patinatge, snowboard, bobsleigh, curling, biatló, piragüisme, caiac, pelota, hípica, lluita, taekwondo, sumo, cricket, beisbol, softbol, lacrosse, pentatló, ràfting, parkour, skateboard, castellers',
    ),
  },
  {
    id: 'riu',
    prompt: 'Un riu',
    answers: list(
      'Ebre, Ter, Segre, Llobregat, Sena, Danubi, Nil, Amazones, Tàmesi, Besòs, Francolí, Muga, Fluvià, Noguera, Cardener, Gaià, Tajo, Duero, Guadalquivir, Rin, Roine, Po, Tíber, Volga, Mississipí, Ganges, Iang-Tsé, Mekong, Eufrates, Tigris, Jordà, Congo, Níger, Zambezi, Orinoco, Paranà, Yukon, Loira, Garona, Elba, Vístula, Dnièper, Ob, Lena, Indus, Brahmaputra, Salado, Júcar, Túria, Segura, Miño',
    ),
  },
  {
    id: 'color',
    prompt: 'Un color',
    answers: list(
      'blau, vermell, verd, groc, negre, blanc, rosa, taronja, lila, gris, marró, morat, violeta, beix, turquesa, granat, bordeus, magenta, cian, sèpia, índigo, carmesí, safrà, ocre, maragda, ambre, escarlata, esmeralda, fúcsia, celest, cru, corall, mostassa, lavanda, malva, terracota, salmó, topazi, cobalt, anyil',
    ),
  },
  {
    id: 'professio',
    prompt: 'Una professió',
    answers: list(
      'metge, mestre, professor, infermer, enginyer, advocat, arquitecte, bomber, policia, cuiner, fuster, paleta, electricista, fontaner, pagès, pescador, forner, carnisser, pintor, escriptor, periodista, actor, músic, cantant, dentista, veterinari, farmacèutic, psicòleg, pilot, conductor, taxista, cambrer, perruquer, barber, sastre, ferrer, jardiner, pastor, guàrdia, jutge, notari, bibliotecari, traductor, fotògraf, dissenyador, programador, astrònom, arqueòleg, geòleg, biòleg, botànic, cartògraf, apicultor, rellotger, rajoler, sabater, orfebre, vidrier, tornejador, farmacèutica',
    ),
  },
  {
    id: 'transport',
    prompt: 'Un mitjà de transport',
    answers: list(
      'cotxe, tren, avió, bicicleta, autobús, moto, metro, tramvia, vaixell, camió, taxi, barca, patinet, helicòpter, globus, furgoneta, ambulància, tractor, funicular, telefèric, monopatí, ferri, creuer, caiac, canoa, veler, zepelí, submarí, hidroplà, carro, carreta, trineu, segway, cremallera, hovercraft, rickshaw, tuc-tuc, gòndola, diligència, cabriolet, locomotora, aeroplà, planador, parapent',
    ),
  },
  {
    id: 'planeta',
    prompt: 'Un astre o cos celeste',
    hard: true,
    answers: list(
      'Sol, Lluna, Terra, Mart, Venus, Júpiter, Saturn, Mercuri, Neptú, Urà, Plutó, cometa, estrella, galàxia, Via Làctia, asteroide, satèl·lit, Sírius, Orió, Polar, Andròmeda, Fobos, Deimos, Tità, Europa, Ganimedes, Cal·listo, Ceres, Eris, Halley, Betelgeuse, Aldebaran, Rigel, Vega, Cassiopea, Escorpí, Taure, nebulosa, quàsar, púlsar',
    ),
  },
  {
    id: 'escriptor',
    prompt: 'Un escriptor o escriptora',
    hard: true,
    answers: list(
      'Verdaguer, Rodoreda, Pla, Fuster, Espriu, Foix, Calders, Monzó, Sagarra, Ausiàs March, Ramon Llull, Martorell, Cervantes, Shakespeare, Orwell, Dickens, Tolstoi, Dostoievski, Kafka, Borges, García Márquez, Neruda, Lorca, Machado, Hemingway, Twain, Austen, Dante, Homer, Goethe, Victor Hugo, Camus, Sartre, Proust, Joyce, Woolf, Tolkien, Rowling, Saramago, Pessoa, Quevedo, Calderón, Lope de Vega, Maragall, Oller, Villalonga, Moncada, Sales, Aurora Bertrana, Víctor Català, Clementina Arderiu, Maria-Mercè Marçal, Salvat-Papasseit, Josep Carner, Joan Maragall, Narcís Oller, Ferrater, Vinyoli, Brossa, Perucho, Rosselló-Pòrcel, Joan Brossa, Quim Monzó, Jaume Cabré',
    ),
  },
  {
    id: 'lloc-bcn',
    prompt: 'Un lloc o monument de Barcelona',
    hard: true,
    answers: list(
      "Sagrada Família, Park Güell, Rambles, Barceloneta, Montjuïc, Tibidabo, Camp Nou, Casa Batlló, La Pedrera, Catedral, Plaça Catalunya, Born, Raval, Gràcia, Eixample, Poblenou, Parc de la Ciutadella, Palau de la Música, Liceu, Mercat de la Boqueria, Sant Pau, Torre Glòries, Estació de Sants, Port Vell, Poble Espanyol, Palau Güell, Casa Milà, Hospital de Sant Pau, Parc Joan Miró, Laberint d'Horta, Bunkers del Carmel, Fossar de la Pedrera, Museu Picasso, MNAC, CCCB, MACBA, Fundació Miró, Colom, Arc de Triomf, Santa Maria del Mar, Barri Gòtic",
    ),
  },
  {
    id: 'eina',
    prompt: 'Una eina',
    answers: list(
      'martell, serra, tornavís, alicates, clau anglesa, tenalles, burí, llima, cisell, destral, pala, rampí, forca, aixada, mall, trepant, nivell, metre, llapis, pinzell, tisores, ganivet, falç, tirafons, maça, picot, raspall, escarpra, garlopa, ribot, compàs, escaire, plomada, balança, regle',
    ),
  },
  {
    id: 'mar',
    prompt: 'Un animal marí o de riu',
    answers: list(
      'sardina, tonyina, llobarro, dorada, salmó, truita, bacallà, lluç, anxova, calamar, pop, sípia, gamba, llagosta, cranc, musclo, ostra, escamarlà, cigala, escopinya, rap, orada, besuc, serrà, moll, rèmora, llampuga, peix espasa, peix lluna, morena, congre, anguila, carpa, barbell, llúcera, tenca, esturió, piranya, medusa, estrella de mar, eriçó de mar, cavallet de mar, mantarraia, tauró martell, peix pallasso, peix globus, dragó marí',
    ),
  },
];
