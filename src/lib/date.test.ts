import { dateForPuzzleNumber, daysBetween, formatSeconds, puzzleNumberForDate } from './date';

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
