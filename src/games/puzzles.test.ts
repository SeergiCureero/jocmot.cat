import { LEGACY_LAST_NUMBER, markLegacy, pickByNumber } from './puzzles';

describe('pickByNumber', () => {
  const old = ['a', 'b', 'c'];

  it('recicla la llista com sempre si no s’ha ampliat', () => {
    expect(pickByNumber(old, 1)).toBe('a');
    expect(pickByNumber(old, 4)).toBe('a');
    expect(pickByNumber(old, 100)).toBe('a');
  });

  it('en ampliar-la, els dies ja jugats no canvien', () => {
    const list = markLegacy([...old, 'x', 'y'], old.length);
    for (let n = 1; n <= LEGACY_LAST_NUMBER; n++) expect(pickByNumber(list, n)).toBe(pickByNumber(old, n));
  });

  it('després surten els nous, un per dia, i quan s’acaben tornen a començar', () => {
    const list = markLegacy([...old, 'x', 'y'], old.length);
    const first = LEGACY_LAST_NUMBER + 1;
    expect([0, 1, 2, 3].map((i) => pickByNumber(list, first + i))).toEqual(['x', 'y', 'x', 'y']);
  });
});
