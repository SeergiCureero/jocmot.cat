import { SITE } from '@/config/site';
import { getPuzzleDate } from '@/games/puzzles';
import { addDaysIso, isoDateInTimeZone } from '@/lib/date';
import type { ProgressRecord } from '@/services/backend';

/**
 * Ratxa de dies seguits amb algun puzle del dia acabat (el mateix dia), com la del servidor.
 * Si avui encara no s'ha jugat, compta fins ahir: la ratxa no es perd fins que acaba el dia.
 */
export function dailyStreak(records: ProgressRecord[], today: string) {
  const days = new Set(
    records
      .filter((r) => r.status !== 'playing')
      .filter(
        (r) =>
          isoDateInTimeZone(new Date(r.updatedAt), SITE.timeZone) === getPuzzleDate(r.puzzleId),
      )
      .map((r) => getPuzzleDate(r.puzzleId)),
  );
  const playedToday = days.has(today);
  let day = playedToday ? today : addDaysIso(today, -1);
  let streak = 0;
  while (days.has(day)) {
    streak++;
    day = addDaysIso(day, -1);
  }
  return { streak, playedToday };
}
