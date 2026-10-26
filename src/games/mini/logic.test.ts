import { PUZZLES } from './data/puzzles';
import { buildEntries, initialStateFor, reveal, setLetter, validatePuzzle, wrongCells } from './logic';

describe('buildEntries', () => {
  it('numera com un mot encreuat', () => {
    const { entries } = buildEntries(PUZZLES[0]);
    const across = entries.filter((e) => e.direction === 'across').map((e) => `${e.number}:${e.answer}`);
    const down = entries.filter((e) => e.direction === 'down').map((e) => `${e.number}:${e.answer}`);
    expect(across).toEqual(['1:TAP', '4:TALL', '5:PORTA', '6:ARTS', '7:UNA']);
    expect(down).toEqual(['1:TARTA', '2:ALTS', '3:PLA', '4:TORN', '5:PAU']);
  });
});

it('cada puzle té una definició per paraula i cap de sobrant', () => {
  for (const p of PUZZLES) {
    expect(validatePuzzle(p)).toEqual([]);
    const { entries } = buildEntries(p);
    const clueCount = Object.keys(p.clues.across).length + Object.keys(p.clues.down).length;
    expect(clueCount).toBe(entries.length);
  }
});

describe('validatePuzzle', () => {
  it('detecta definicions que falten i caselles buides', () => {
    const p = { ...PUZZLES[0], grid: ['##TA ', ...PUZZLES[0].grid.slice(1)], clues: { across: {}, down: {} } };
    const errors = validatePuzzle(p);
    expect(errors.some((e) => e.includes('caselles buides'))).toBe(true);
    expect(errors.some((e) => e.includes('falta la definició'))).toBe(true);
  });
  it('detecta caselles aïllades', () => {
    const p = { grid: ['A#B', '###', 'CDE'], clues: { across: { 1: 'x' }, down: {} } };
    expect(validatePuzzle(p).some((e) => e.includes('no forma part'))).toBe(true);
  });
});

describe('joc', () => {
  const p = PUZZLES[0];
  it('detecta lletres incorrectes', () => {
    const s = setLetter(initialStateFor(p)(), p, [0, 2], 'X');
    expect(wrongCells(s, p)).toEqual([[0, 2]]);
  });
  it('guanya en omplir-ho bé', () => {
    let s = initialStateFor(p)();
    p.grid.forEach((row, r) => [...row].forEach((ch, c) => (s = setLetter(s, p, [r, c], ch))));
    expect(s.status).toBe('won');
  });
  it('revelar no compta com a victòria', () => {
    expect(reveal(initialStateFor(p)(), p).status).toBe('lost');
  });
});
