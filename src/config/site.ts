/** Configuració general del lloc. */
export const SITE = {
  name: 'jocmot.cat',
  url: 'https://jocmot.cat',
  tagline: 'Jocs de paraules diaris en català',
  /** Data del puzle #1 de tots els jocs (zona horària de Madrid). */
  launchDate: import.meta.env.VITE_LAUNCH_DATE ?? '2026-10-14',
  timeZone: 'Europe/Madrid',
  /** Adreça de contacte (Cloudflare Email Routing la reenvia). */
  email: 'hola@jocmot.cat',
  /** Responsable del lloc i de les dades personals (pàgina /legal). */
  owner: 'Sergi Curero',
  /** Data de l'última revisió dels textos legals. */
  legalUpdated: '28 d’octubre de 2026',
} as const;

/** Funcionalitats que es poden activar o desactivar. */
export const FEATURES = {
  /** Permet jugar puzles anteriors a /joc/:puzzleId. */
  archive: true,
  /**
   * Comptes d'usuari. Calen un backend real (VITE_POCKETBASE_URL); sense, només
   * s'activen en desenvolupament (mode local) i en producció s'amaguen.
   */
  accounts: Boolean(import.meta.env.VITE_POCKETBASE_URL) || import.meta.env.DEV,
  /** Punts, amics i lligues: els calcula el servidor, així que només funcionen amb PocketBase. */
  social: Boolean(import.meta.env.VITE_POCKETBASE_URL),
} as const;
