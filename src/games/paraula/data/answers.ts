import { markLegacy } from '../../puzzles';

/**
 * Solucions diàries (forma amb accents). L'ordre és el de publicació:
 * la posició 0 és el puzle #1. Afegir-ne de noves SEMPRE al final.
 */
export const ANSWERS: readonly string[] = [
  'terra', 'pluja', 'barca', 'festa', 'núvol', 'porta', 'salut', 'fusta', 'llamp', 'poble',
  'arbre', 'tinta', 'masia', 'vespa', 'carta', 'aigua', 'torre', 'sabor', 'ordre', 'perla',
  'fulla', 'motor', 'oncle', 'pedra', 'estiu', 'vinya', 'lluna', 'palau', 'tecla', 'sucre',
  'cinta', 'prova', 'corda', 'forat', 'ritme', 'plata', 'teula', 'manta', 'poeta', 'riera',
  'sorra', 'tarta', 'metge', 'vapor', 'paret', 'ferro', 'onada', 'pruna', 'galta', 'volta',
  'herba', 'caixa', 'broma', 'pista', 'sopar', 'tomba', 'arena', 'crema', 'banda', 'reina',
  'fruit', 'dolor', 'ploma', 'oliva', 'costa', 'norma', 'tassa', 'pasta', 'autor', 'serra',
  'taula', 'final', 'mosca', 'barra', 'dinar', 'vista', 'altar', 'tropa', 'causa', 'coure',
  'forca', 'cigró', 'aliga', 'trama', 'senda', 'mitjó', 'orgue', 'capsa', 'sitja', 'sabre',
  'rampa', 'vigor', 'xarop', 'etapa', 'ostra', 'cobra', 'tacte', 'ronda', 'zebra', 'gorra',
  'camió', 'remei', 'cartó', 'pesca', 'cigne', 'carro', 'tabac', 'illot', 'vores', 'ànima',
  'arròs', 'front', 'ungla', 'barba', 'reixa', 'violí', 'bleda', 'rosca', 'pinta', 'renda',
  'noces', 'guant', 'tauró', 'panys', 'xarxa', 'calor', 'estel', 'metro', 'joies', 'fetge',
  'placa', 'gruta', 'pèsol', 'museu', 'bassa', 'datil', 'falcó', 'tenda', 'riure', 'coixí',
  'balcó', 'conca', 'cuina', 'gelat', 'gener', 'anell', 'flama', 'canya', 'menta', 'ronyó',
  'feina', 'palma', 'vidre', 'bomba', 'gaita', 'boira', 'xicot', 'germà', 'gebre', 'gamba',
  'espai', 'gossa', 'colze', 'zenit', 'tauló', 'agost', 'massa', 'bossa', 'fanal', 'cabra',
  'bolet', 'plaça', 'abril', 'cuixa', 'marca', 'pinyó', 'tasca', 'nebot', 'somni', 'pebre',
  'pilar', 'tigre', 'hotel', 'penya', 'pulmó', 'pizza', 'corba', 'brasa', 'raval', 'opera',
  'oasis', 'fonda', 'caliu',
];

/** Les solucions d'abans d'ampliar la llista: els dies ja jugats no han de canviar (veure markLegacy). */
markLegacy(ANSWERS, 80);
