import { SITE } from '@/config/site';
import { dateForPuzzleNumber, isoDateInTimeZone, puzzleNumberForDate } from '@/lib/date';

/** Número del puzle d'avui (igual per a tots els jocs). */
export function getTodayPuzzleNumber(now = new Date()): number {
  return puzzleNumberForDate(isoDateInTimeZone(now, SITE.timeZone), SITE.launchDate);
}

export function getPuzzleDate(puzzleNumber: number): string {
  return dateForPuzzleNumber(puzzleNumber, SITE.launchDate);
}

/**
 * Últim número de puzle que continua fent servir el reciclatge antic de les llistes. Els puzles
 * d'aquests dies ja s'han jugat (el #21 és el del 15 de novembre de 2026): afegir-ne de nous no els
 * pot canviar.
 */
export const LEGACY_LAST_NUMBER = 21;

/** Data del puzle #1 en producció (la mateixa que `.env.production` i `backend/pb_hooks/jocmot.js`). */
const PRODUCTION_LAUNCH = '2026-10-26';

/** Número de puzle d'un dia concret ("2026-12-25" → 61). Per calendaritzar els puzles temàtics. */
export function numberForDate(isoDate: string): number {
  return puzzleNumberForDate(isoDate, PRODUCTION_LAUNCH);
}

interface Calendar {
  legacy: number;
  /** Puzles de dies concrets (Nadal, Cap d'any…), per número de puzle. */
  themed: Map<number, unknown>;
}

const calendars = new WeakMap<readonly unknown[], Calendar>();

/**
 * Defineix com es reparteixen els puzles d'una llista:
 * - Els `legacyLength` primers són els d'abans: fins a `LEGACY_LAST_NUMBER` es reciclen com sempre
 *   (els dies ja jugats no canvien).
 * - Després surten els nous un per dia, per ordre, **sense repetir-se mai**.
 * - Els de `themed` (clau = data "AAAA-MM-DD") surten exactament el seu dia i no formen part de l'ordre.
 * Quan s'acaben, la llista torna a començar pels nous: per això es vigila a /editor/proxims
 * fins quan hi ha puzles diferents (`uniqueUntil`).
 */
export function markLegacy<T>(
  list: readonly T[],
  legacyLength: number,
  themed: Record<string, T> = {},
): readonly T[] {
  const map = new Map<number, unknown>();
  for (const [date, puzzle] of Object.entries(themed)) map.set(numberForDate(date), puzzle);
  calendars.set(list, { legacy: legacyLength, themed: map });
  return list;
}

const themedBefore = (c: Calendar, n: number) =>
  [...c.themed.keys()].filter((k) => k > LEGACY_LAST_NUMBER && k < n).length;

/**
 * Tria el puzle d'una llista pel seu número: el temàtic d'aquell dia, si n'hi ha; fins a
 * `LEGACY_LAST_NUMBER`, els d'abans reciclats; després, els nous un per dia sense repetir.
 */
export function pickByNumber<T>(list: readonly T[], puzzleNumber: number): T {
  const c = calendars.get(list);
  const legacy = c?.legacy ?? list.length;
  const themed = c?.themed.get(puzzleNumber);
  if (themed !== undefined) return themed as T;
  if (c && puzzleNumber > LEGACY_LAST_NUMBER && list.length > legacy) {
    const fresh = list.length - legacy;
    const day = puzzleNumber - LEGACY_LAST_NUMBER - 1 - themedBefore(c, puzzleNumber);
    return list[legacy + (day % fresh)];
  }
  const index = (((puzzleNumber - 1) % legacy) + legacy) % legacy;
  return list[index];
}

/** Si el puzle d'aquest dia és temàtic (per marcar-lo a la vista de l'editor). */
export function isThemed(list: readonly unknown[], puzzleNumber: number): boolean {
  return calendars.get(list)?.themed.has(puzzleNumber) ?? false;
}

/** Últim número de puzle que té un puzle diferent de tots els anteriors (després, es reciclen). */
export function uniqueUntil(list: readonly unknown[]): number {
  const c = calendars.get(list);
  if (!c) return list.length;
  const fresh = list.length - c.legacy;
  const themed = [...c.themed.keys()].filter((k) => k > LEGACY_LAST_NUMBER).length;
  return LEGACY_LAST_NUMBER + fresh + themed;
}
