import { PUZZLES } from './data/puzzles';
import { buildShareText, initialOrder, initialState, submitSelection, validatePuzzle } from './logic';

const puzzle = PUZZLES[0];
const [g0, g1] = puzzle.groups;

describe('submitSelection', () => {
  it('resol un grup correcte', () => {
    const r = submitSelection(initialState(), puzzle, [...g0.words]);
    expect(r.feedback).toBe('correct');
    expect(r.state.solved).toEqual([0]);
  });
  it('avisa quan en falta una', () => {
    const r = submitSelection(initialState(), puzzle, [...g0.words.slice(0, 3), g1.words[0]]);
    expect(r.feedback).toBe('one-away');
    expect(r.state.mistakes).toBe(1);
  });
  it('no penalitza un intent repetit', () => {
    const sel = [...g0.words.slice(0, 2), ...g1.words.slice(0, 2)];
    const first = submitSelection(initialState(), puzzle, sel).state;
    const again = submitSelection(first, puzzle, [...sel].reverse());
    expect(again.feedback).toBe('already-guessed');
    expect(again.state.mistakes).toBe(1);
  });
  it('guanya en resoldre els quatre grups', () => {
    let s = initialState();
    puzzle.groups.forEach((g) => (s = submitSelection(s, puzzle, [...g.words]).state));
    expect(s.status).toBe('won');
    expect(buildShareText(1, s, puzzle, 'x').split('\n')).toHaveLength(7);
  });
});

it("l'ordre inicial és determinista", () => {
  expect(initialOrder(puzzle, 5)).toEqual(initialOrder(puzzle, 5));
});

it('cada puzle té 16 paraules úniques i un grup per nivell', () => {
  for (const p of PUZZLES) {
    const words = p.groups.flatMap((g) => g.words);
    expect(new Set(words).size).toBe(16);
    expect(validatePuzzle(p)).toEqual([]);
  }
});

it('validatePuzzle detecta repetides i camps buits', () => {
  const groups = puzzle.groups.map((g) => ({ ...g, words: [...g.words] as typeof g.words }));
  groups[1].words[0] = groups[0].words[0];
  groups[2].title = ' ';
  const errors = validatePuzzle({ groups: groups as typeof puzzle.groups });
  expect(errors).toContain(`paraules repetides: ${groups[0].words[0]}`);
  expect(errors).toContain('grup 3: falta el títol');
});
