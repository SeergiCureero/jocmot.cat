import { PUZZLES } from './data/puzzles';
import { buildShareText, HINT_COST, initialState, submitPath, applyHint, validatePuzzle } from './logic';

const puzzle = PUZZLES[0];

it('tots els puzles són vàlids', () => {
  PUZZLES.forEach((p) => expect(validatePuzzle(p)).toEqual([]));
});

describe('submitPath', () => {
  it('troba una paraula temàtica', () => {
    const r = submitPath(initialState(), puzzle, puzzle.words[0].path);
    expect(r.feedback).toBe('theme');
  });
  it("troba l'spangram", () => {
    expect(submitPath(initialState(), puzzle, puzzle.spangram.path).feedback).toBe('spangram');
  });
  it('acumula progrés de pista amb intents no temàtics', () => {
    let s = initialState();
    for (let i = 0; i < HINT_COST; i++) s = submitPath(s, puzzle, puzzle.words[0].path.slice(0, 4).reverse()).state;
    s = applyHint(s, puzzle);
    expect(s.hintWord).toBe(puzzle.words[0].word);
  });
  it('guanya en trobar-ho tot', () => {
    let s = initialState();
    [puzzle.spangram, ...puzzle.words].forEach((w) => (s = submitPath(s, puzzle, w.path).state));
    expect(s.status).toBe('won');
    expect(buildShareText(1, s, puzzle, 'x')).toContain('🟡');
  });
});
