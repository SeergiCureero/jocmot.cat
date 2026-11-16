import {
  LEGACY_LAST_NUMBER,
  isThemed,
  markLegacy,
  numberForDate,
  pickByNumber,
  uniqueUntil,
} from './puzzles';

describe('numberForDate', () => {
  it('compta des del llançament de producció', () => {
    expect(numberForDate('2026-10-26')).toBe(1);
    expect(numberForDate('2026-11-15')).toBe(21);
    expect(numberForDate('2026-12-25')).toBe(61);
  });
});

describe('pickByNumber', () => {
  const old = ['a', 'b', 'c'];

  it('recicla la llista com sempre si no s’ha ampliat', () => {
    expect(pickByNumber(old, 1)).toBe('a');
    expect(pickByNumber(old, 4)).toBe('a');
    expect(pickByNumber(old, 100)).toBe('a');
  });

  it('en ampliar-la, els dies ja jugats no canvien', () => {
    const list = markLegacy([...old, 'x', 'y'], old.length);
    for (let n = 1; n <= LEGACY_LAST_NUMBER; n++)
      expect(pickByNumber(list, n)).toBe(pickByNumber(old, n));
  });

  it('després surten els nous, un per dia i sense repetir fins que s’acaben', () => {
    const list = markLegacy([...old, 'x', 'y', 'z'], old.length);
    const first = LEGACY_LAST_NUMBER + 1;
    expect([0, 1, 2, 3].map((i) => pickByNumber(list, first + i))).toEqual(['x', 'y', 'z', 'x']);
    expect(uniqueUntil(list)).toBe(LEGACY_LAST_NUMBER + 3);
  });

  it('els temàtics surten el seu dia i no desplacen els altres', () => {
    // El 2026-11-18 és el #24: el tercer dia nou.
    const list = markLegacy([...old, 'x', 'y', 'z'], old.length, { '2026-11-18': 'NADAL' });
    const first = LEGACY_LAST_NUMBER + 1; // #22
    expect([0, 1, 2, 3, 4].map((i) => pickByNumber(list, first + i))).toEqual([
      'x', // #22
      'y', // #23
      'NADAL', // #24
      'z', // #25
      'x', // #26 (s'han acabat)
    ]);
    expect(isThemed(list, 24)).toBe(true);
    expect(isThemed(list, 23)).toBe(false);
    expect(uniqueUntil(list)).toBe(LEGACY_LAST_NUMBER + 4);
  });
});
