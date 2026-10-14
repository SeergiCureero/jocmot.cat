/**
 * Paraules acceptades com a intent (a més de les solucions).
 * Llista mínima de mostra: per a producció, carregar un diccionari complet
 * (p. ex. el de Softcatalà, revisant-ne la llicència) i activar STRICT_DICTIONARY.
 */
export const EXTRA_VALID: readonly string[] = [
  'abans', 'actes', 'actor', 'altre', 'amics', 'armes', 'boscs', 'brava', 'cames', 'camps',
  'carro', 'cases', 'clara', 'colla', 'coses', 'dones', 'estat', 'flors', 'fonts', 'forma',
  'gener', 'gotes', 'illes', 'lleig', 'llarg', 'mares', 'metre', 'nedar', 'obres', 'olles',
  'pares', 'parla', 'plats', 'preus', 'punts', 'resta', 'roses', 'santa', 'sense', 'temps',
];

/** Si és true, només s'accepten paraules del diccionari. */
export const STRICT_DICTIONARY = false;
