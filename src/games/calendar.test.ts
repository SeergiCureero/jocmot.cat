import { PUZZLES as CONNEXIONS } from './connexions/data/puzzles';
import { PUZZLES as FILS } from './fils/data/puzzles';
import { PUZZLES as MINI } from './mini/data/puzzles';
import { isThemed, numberForDate, pickByNumber, uniqueUntil } from './puzzles';

/** Últim dia amb puzles diferents garantit (31 de desembre de 2026). */
const END = numberForDate('2026-12-31');
const SHOWN = 21; // els puzles #1-#21 ja han sortit

const games = { connexions: CONNEXIONS, fils: FILS, mini: MINI };

describe.each(Object.entries(games))('%s: calendari fins a final d’any', (_name, list) => {
  const key = (n: number) => JSON.stringify(pickByNumber(list as readonly unknown[], n));

  it('té un puzle diferent cada dia, fins al 31 de desembre', () => {
    expect(uniqueUntil(list)).toBeGreaterThanOrEqual(END);
    const days = Array.from({ length: END - SHOWN }, (_, i) => key(SHOWN + 1 + i));
    expect(new Set(days).size).toBe(days.length);
  });

  it('no repeteix cap puzle dels que ja han sortit', () => {
    const before = new Set(Array.from({ length: SHOWN }, (_, i) => key(i + 1)));
    const after = Array.from({ length: END - SHOWN }, (_, i) => key(SHOWN + 1 + i));
    expect(after.filter((k) => before.has(k))).toEqual([]);
  });

  it('els dies de Nadal tenen el puzle temàtic', () => {
    for (const date of ['2026-12-24', '2026-12-25', '2026-12-26', '2026-12-31'])
      expect(isThemed(list, numberForDate(date)), date).toBe(true);
  });

  it('no canvia cap dels dies ja jugats', () => {
    // El #1 continua sent el primer de la llista, etc.
    expect(key(1)).toBe(JSON.stringify((list as readonly unknown[])[0]));
  });
});

describe('mini: tots els puzles són vàlids', () => {
  it('cada paraula té definició i la graella és coherent', async () => {
    const { validatePuzzle } = await import('./mini/logic');
    for (const [i, p] of MINI.entries()) expect(validatePuzzle(p), `mini #${i}`).toEqual([]);
  });
});
