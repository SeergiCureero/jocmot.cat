import { allWords } from './logic';
import { bestPath, pathsFor } from './typing';
import { PUZZLES } from './data/puzzles';

const puzzle = PUZZLES[0];

describe('pathsFor', () => {
  it('troba cada paraula del tema escrivint-la', () => {
    for (const w of allWords(puzzle)) {
      const paths = pathsFor(puzzle, w.word, []);
      expect(bestPath(paths, allWords(puzzle))).toEqual(w.path);
    }
  });
  it('no fa servir les caselles ja trobades', () => {
    const w = puzzle.words[0];
    const paths = pathsFor(puzzle, w.word, w.path);
    expect(
      paths.some((p) => p.every((c, i) => c[0] === w.path[i][0] && c[1] === w.path[i][1])),
    ).toBe(false);
  });
  it('no troba res si les lletres no hi són seguides', () => {
    expect(pathsFor(puzzle, 'QQQQ', [])).toEqual([]);
  });
});
