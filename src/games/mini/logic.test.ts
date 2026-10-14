import { PUZZLES } from './data/puzzles';
import { buildEntries, initialStateFor, reveal, setLetter, wrongCells } from './logic';

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
    const { entries } = buildEntries(p);
    expect(entries.every((e) => e.clue.length > 0)).toBe(true);
    const clueCount = Object.keys(p.clues.across).length + Object.keys(p.clues.down).length;
    expect(clueCount).toBe(entries.length);
  }
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
