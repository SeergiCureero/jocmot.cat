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
 * Tria el puzle d'una llista pel seu número. Mentre no tinguem un puzle per dia,
 * la llista es recicla (mòdul). Quan hi hagi arxiu real, substituir per una cerca per `id`.
 */
export function pickByNumber<T>(list: readonly T[], puzzleNumber: number): T {
  const index = (((puzzleNumber - 1) % list.length) + list.length) % list.length;
  return list[index];
}
