import bank from './categories.json';

/**
 * Categories de Fondària. Cada resposta va de la més habitual a la més rara: la posició a la llista
 * dona els punts de partida (la primera ~10, l'última 100). Es comparen sense accents ni majúscules.
 *
 * El fitxer `categories.json` el comparteixen la web i el servidor (que el copia a `pb_hooks/`).
 * Pendent de revisió de l'equip; les respostes noves que proposin els jugadors, un cop aprovades
 * pels editors, es desen a la base de dades.
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

export const CATEGORIES: Category[] = bank;
