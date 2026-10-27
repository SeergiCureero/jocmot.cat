import { dateForPuzzleNumber, daysBetween, formatSeconds, puzzleNumberForDate, startOfDayInTimeZone } from './date';

describe('date', () => {
  it('compta dies entre dates', () => {
    expect(daysBetween('2026-10-14', '2026-10-15')).toBe(1);
    expect(daysBetween('2026-10-14', '2027-10-14')).toBe(365);
  });
  it('el dia de llançament és el puzle #1', () => {
    expect(puzzleNumberForDate('2026-10-14', '2026-10-14')).toBe(1);
    expect(dateForPuzzleNumber(3, '2026-10-14')).toBe('2026-10-16');
  });
  it('formata segons', () => {
    expect(formatSeconds(83)).toBe('1:23');
  });
});

describe('startOfDayInTimeZone', () => {
  it('mitjanit de Madrid a l’hivern i a l’estiu', () => {
    expect(startOfDayInTimeZone('2026-12-01', 'Europe/Madrid').toISOString()).toBe('2026-11-30T23:00:00.000Z');
    expect(startOfDayInTimeZone('2026-07-01', 'Europe/Madrid').toISOString()).toBe('2026-06-30T22:00:00.000Z');
  });
  it('el dia del canvi d’hora', () => {
    expect(startOfDayInTimeZone('2026-10-25', 'Europe/Madrid').toISOString()).toBe('2026-10-24T22:00:00.000Z');
    expect(startOfDayInTimeZone('2026-03-29', 'Europe/Madrid').toISOString()).toBe('2026-03-28T23:00:00.000Z');
  });
});
