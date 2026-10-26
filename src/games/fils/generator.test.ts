import { generateFils } from './generator';
import { validatePuzzle } from './logic';

const CASES = [
  {
    theme: 'Fan música',
    spangram: 'INSTRUMENTS',
    words: ['PIANO', 'GUITARRA', 'VIOLI', 'ARPA', 'SAXOFON', 'TROMPETA'],
  },
  {
    theme: 'Al mercat',
    spangram: 'FRUITES',
    words: ['POMA', 'PERA', 'PRESSEC', 'TARONJA', 'MADUIXA', 'CIRERA', 'PLATAN'],
  },
];

describe('generateFils', () => {
  it.each(CASES)('genera una graella vàlida per a "$theme"', (input) => {
    const puzzle = generateFils({ ...input, seed: 1, timeLimitMs: 10_000 });
    expect(puzzle).not.toBeNull();
    expect(validatePuzzle(puzzle!)).toEqual([]);
    expect(puzzle!.words.map((w) => w.word)).toEqual(input.words);
  });

  it('és determinista per a una mateixa llavor', () => {
    const a = generateFils({ ...CASES[0], seed: 7, timeLimitMs: 10_000 });
    const b = generateFils({ ...CASES[0], seed: 7, timeLimitMs: 10_000 });
    expect(a).toEqual(b);
  });

  it('rebutja si les lletres no sumen 48', () => {
    expect(generateFils({ theme: 'x', spangram: 'CURT', words: ['POMA'], seed: 1 })).toBeNull();
  });
});
