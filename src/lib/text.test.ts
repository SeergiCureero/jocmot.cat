import { normalizeWord } from './text';

describe('normalizeWord', () => {
  it('treu accents i conserva la Ç', () => {
    expect(normalizeWord('núvol')).toBe('NUVOL');
    expect(normalizeWord('caçar')).toBe('CAÇAR');
    expect(normalizeWord('col·la')).toBe('COLLA');
  });
});
