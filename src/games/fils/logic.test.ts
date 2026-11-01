import { PUZZLES } from './data/puzzles';
import {
  buildShareText,
  HINT_COST,
  initialState,
  submitPath,
  applyHint,
  validatePuzzle,
} from './logic';

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
  it('acumula progrés de pista amb paraules del diccionari no temàtiques', () => {
    const long = puzzle.words.filter((w) => w.word.length > 4);
    let s = initialState();
    for (let i = 0; i < HINT_COST; i++) {
      const r = submitPath(s, puzzle, long[i].path.slice(0, 4), true);
      expect(r.feedback).toBe('bonus');
      s = r.state;
    }
    expect(s.bonus).toHaveLength(HINT_COST);
    s = applyHint(s, puzzle);
    expect(s.hintWord).toBe(puzzle.words[0].word);
  });
  it('no compta paraules que no són al diccionari ni repetides', () => {
    const path = puzzle.words[0].path.slice(0, 4);
    expect(submitPath(initialState(), puzzle, path, false)).toEqual({
      state: initialState(),
      feedback: 'not-a-word',
    });
    const once = submitPath(initialState(), puzzle, path, true).state;
    const twice = submitPath(once, puzzle, path, true);
    expect(twice.feedback).toBe('bonus-repeated');
    expect(twice.state.hintProgress).toBe(1);
  });
  it('accepta estats desats abans que existissin les paraules extra', () => {
    const { bonus: _, ...old } = initialState();
    const r = submitPath(old, puzzle, puzzle.words[0].path.slice(0, 4), null);
    expect(r.feedback).toBe('bonus');
    expect(r.state.bonus).toHaveLength(1);
  });
  it('guanya en trobar-ho tot', () => {
    let s = initialState();
    [puzzle.spangram, ...puzzle.words].forEach((w) => (s = submitPath(s, puzzle, w.path).state));
    expect(s.status).toBe('won');
    expect(buildShareText(1, s, puzzle, 'x')).toContain('🟡');
  });
});
