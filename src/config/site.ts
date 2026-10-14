/** Configuració general del lloc. */
export const SITE = {
  name: 'jocmot.cat',
  url: 'https://jocmot.cat',
  tagline: 'Jocs de paraules diaris en català',
  /** Data del puzle #1 de tots els jocs (zona horària de Madrid). */
  launchDate: import.meta.env.VITE_LAUNCH_DATE ?? '2026-10-14',
  timeZone: 'Europe/Madrid',
} as const;

/** Funcionalitats que s'activaran més endavant. */
export const FEATURES = {
  /** Permet jugar puzles anteriors a /joc/:puzzleId. */
  archive: false,
} as const;
