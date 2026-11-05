import { addDaysIso, formatWeekdayCa } from './date';

describe('formatWeekdayCa', () => {
  it('dona el dia de la setmana amb majúscula', () => {
    expect(formatWeekdayCa('2026-11-04')).toBe('Dimecres, 4 de novembre');
    expect(formatWeekdayCa('2026-10-01')).toBe('Dijous, 1 d’octubre');
  });
});

describe('addDaysIso', () => {
  it('canvia de mes i d’any', () => {
    expect(addDaysIso('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDaysIso('2026-03-01', -1)).toBe('2026-02-28');
  });
});
