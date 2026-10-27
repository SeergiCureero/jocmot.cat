/** Utilitats de dates. Funcions pures (reben `now`) per poder-les testejar. */

/** Retorna la data local "AAAA-MM-DD" a la zona horària indicada. */
export function isoDateInTimeZone(now: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

/** Dies entre dues dates "AAAA-MM-DD" (b - a). */
export function daysBetween(a: string, b: string): number {
  const toUtc = (s: string) => {
    const [y, m, d] = s.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUtc(b) - toUtc(a)) / 86_400_000);
}

/** Número de puzle per a una data. El dia de llançament és el #1. */
export function puzzleNumberForDate(date: string, launchDate: string): number {
  return daysBetween(launchDate, date) + 1;
}

/** Data "AAAA-MM-DD" corresponent a un número de puzle. */
export function dateForPuzzleNumber(puzzleNumber: number, launchDate: string): string {
  const [y, m, d] = launchDate.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + puzzleNumber - 1));
  return date.toISOString().slice(0, 10);
}

/** Format curt en català: "14 d’octubre de 2026". */
export function formatDateCa(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Intl.DateTimeFormat('ca', { day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(Date.UTC(y, m - 1, d, 12)),
  );
}

/** 83 -> "1:23" */
export function formatSeconds(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Instant en què comença el dia "AAAA-MM-DD" a la zona horària indicada (té en compte l'horari d'estiu). */
export function startOfDayInTimeZone(isoDate: string, timeZone: string): Date {
  const [y, m, d] = isoDate.split('-').map(Number);
  const target = Date.UTC(y, m - 1, d);
  const offsetAt = (instant: number) => {
    const parts = Object.fromEntries(
      new Intl.DateTimeFormat('en-US', {
        timeZone,
        hourCycle: 'h23',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
      })
        .formatToParts(new Date(instant))
        .map((p) => [p.type, Number(p.value)]),
    );
    return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second) - instant;
  };
  let instant = target - offsetAt(target);
  instant = target - offsetAt(instant);
  return new Date(instant);
}
