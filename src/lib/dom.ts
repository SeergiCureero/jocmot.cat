/** Hi ha un <dialog> modal obert? (els jocs ignoren el teclat físic mentrestant) */
export const isModalOpen = () => document.querySelector('dialog[open]') !== null;

/** L'esdeveniment ve d'un camp de text? (llavors els jocs no l'han de capturar) */
export const isTypingInField = (e: KeyboardEvent) =>
  e.target instanceof HTMLElement &&
  (e.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName));

/**
 * Menys animacions? (per escurçar esperes fetes amb JS). Té en compte la preferència
 * del sistema i la de Configuració.
 */
export { prefersReducedMotion } from '@/features/settings/settings';
