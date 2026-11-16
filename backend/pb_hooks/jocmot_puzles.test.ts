import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Els hooks de PocketBase fan servir globals del servidor: aquí es simulen.
class BadRequestError extends Error {}
class ForbiddenError extends Error {}
class DateTime {}
Object.assign(globalThis, {
  __hooks: dirname(fileURLToPath(import.meta.url)),
  BadRequestError,
  ForbiddenError,
  DateTime,
});

const db = createRequire(import.meta.url)('./jocmot_db.js');

type Fields = Record<string, unknown>;

function record(fields: Fields) {
  return {
    fields,
    id: String(fields.id ?? ''),
    getString: (k: string) => String(fields[k] ?? ''),
    getBool: (k: string) => Boolean(fields[k]),
    set: (k: string, v: unknown) => {
      fields[k] = v;
    },
  };
}

const editor = (id = 'ed') => record({ id, editor: true });
const person = (id = 'ana') => record({ id, editor: false });

function app(puzzle: ReturnType<typeof record>, pendingOfUser = 0) {
  const saved: unknown[] = [];
  return {
    saved,
    findRecordById: () => puzzle,
    save: (r: unknown) => saved.push(r),
    findRecordsByFilter: () => Array(pendingOfUser).fill({}),
  };
}

describe('rejectPuzzle', () => {
  it('un editor rebutja la proposta d’un altre', () => {
    const puzzle = record({ status: 'proposed', author: 'ana' });
    const server = app(puzzle);
    db.rejectPuzzle(server, editor(), 'p1');
    expect(puzzle.fields.status).toBe('rejected');
    expect(server.saved).toEqual([puzzle]);
  });

  it('qui no és editor no pot rebutjar', () => {
    const puzzle = record({ status: 'proposed', author: 'ana' });
    expect(() => db.rejectPuzzle(app(puzzle), person('biel'), 'p1')).toThrow(ForbiddenError);
    expect(puzzle.fields.status).toBe('proposed');
  });

  it('un editor no pot rebutjar el seu puzle', () => {
    const puzzle = record({ status: 'proposed', author: 'ed' });
    expect(() => db.rejectPuzzle(app(puzzle), editor('ed'), 'p1')).toThrow(BadRequestError);
    expect(puzzle.fields.status).toBe('proposed');
  });

  it('només es rebutgen les propostes en revisió', () => {
    for (const status of ['published', 'rejected']) {
      const puzzle = record({ status, author: 'ana' });
      expect(() => db.rejectPuzzle(app(puzzle), editor(), 'p1')).toThrow(BadRequestError);
      expect(puzzle.fields.status).toBe(status);
    }
  });
});

describe('reopenPuzzle', () => {
  it('l’autor torna a proposar el seu puzle i les aprovacions antigues deixen de comptar', () => {
    const puzzle = record({ status: 'rejected', author: 'ana' });
    const server = app(puzzle);
    db.reopenPuzzle(server, person('ana'), 'p1');
    expect(puzzle.fields.status).toBe('proposed');
    expect(puzzle.fields.contentUpdated).toBeInstanceOf(DateTime);
    expect(server.saved).toEqual([puzzle]);
  });

  it('un editor el pot reobrir encara que no sigui seu', () => {
    const puzzle = record({ status: 'rejected', author: 'ana' });
    db.reopenPuzzle(app(puzzle), editor(), 'p1');
    expect(puzzle.fields.status).toBe('proposed');
  });

  it('una altra persona no el pot reobrir', () => {
    const puzzle = record({ status: 'rejected', author: 'ana' });
    expect(() => db.reopenPuzzle(app(puzzle), person('biel'), 'p1')).toThrow(ForbiddenError);
    expect(puzzle.fields.status).toBe('rejected');
  });

  it('només es reobren els rebutjats', () => {
    for (const status of ['proposed', 'published']) {
      const puzzle = record({ status, author: 'ana' });
      expect(() => db.reopenPuzzle(app(puzzle), person('ana'), 'p1')).toThrow(BadRequestError);
    }
  });

  it('l’autor no pot passar del límit de propostes pendents, però un editor sí', () => {
    const puzzle = record({ status: 'rejected', author: 'ana' });
    expect(() => db.reopenPuzzle(app(puzzle, 5), person('ana'), 'p1')).toThrow(BadRequestError);
    expect(puzzle.fields.status).toBe('rejected');
    db.reopenPuzzle(app(puzzle, 5), editor(), 'p1');
    expect(puzzle.fields.status).toBe('proposed');
  });
});
