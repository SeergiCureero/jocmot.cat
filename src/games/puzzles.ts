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
 * d'aquests dies ja s'han jugat (el #20 és el del 14 de novembre de 2026) o estan a punt de sortir: afegir-ne de nous no els pot canviar.
 */
export const LEGACY_LAST_NUMBER = 22;

const legacyLengths = new WeakMap<readonly unknown[], number>();

/**
 * Marca quants puzles tenia una llista abans d'ampliar-la. Els números fins a `LEGACY_LAST_NUMBER`
 * segueixen reciclant només aquests; a partir d'allà, surten els nous un per dia, per ordre.
 */
export function markLegacy<T>(list: readonly T[], legacyLength: number): readonly T[] {
  legacyLengths.set(list, legacyLength);
  return list;
}

/**
 * Tria el puzle d'una llista pel seu número. Mentre no tinguem un puzle per dia, la llista es recicla
 * (mòdul): primer els antics (fins a `LEGACY_LAST_NUMBER`) i després els nous, un per dia.
 */
export function pickByNumber<T>(list: readonly T[], puzzleNumber: number): T {
  const legacy = legacyLengths.get(list) ?? list.length;
  if (puzzleNumber > LEGACY_LAST_NUMBER && list.length > legacy) {
    const fresh = list.length - legacy;
    return list[legacy + ((puzzleNumber - LEGACY_LAST_NUMBER - 1) % fresh)];
  }
  const index = (((puzzleNumber - 1) % legacy) + legacy) % legacy;
  return list[index];
}
