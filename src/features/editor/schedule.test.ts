import type { PuzzleRecord, ReviewRecord } from '@/services/backend';
import { firstFreeNumber, validApprovals } from './schedule';

const review = (
  author: string,
  approved: boolean,
  updated = '2026-10-27T10:00:00.000Z',
): ReviewRecord => ({
  id: author,
  puzzleId: 'p',
  author: { id: author, username: author },
  approved,
  comment: '',
  created: updated,
  updated,
});

const puzzle = (reviews: ReviewRecord[], updated = '2026-10-27T09:00:00.000Z'): PuzzleRecord => ({
  id: 'p',
  game: 'connexions',
  data: {},
  author: { id: 'anna', username: 'anna' },
  status: 'proposed',
  number: null,
  releaseAt: null,
  created: updated,
  updated,
  contentUpdated: updated,
  title: '',
  wantedNumber: null,
  reviews,
});

describe('firstFreeNumber', () => {
  it('comença demà', () => expect(firstFreeNumber([], 5)).toBe(6));
  it('salta els ocupats i omple forats', () => expect(firstFreeNumber([6, 7, 9], 5)).toBe(8));
  it('ignora números passats', () => expect(firstFreeNumber([1, 2, 3], 5)).toBe(6));
  it('fa servir el dia preferit si és lliure', () => expect(firstFreeNumber([6], 5, 9)).toBe(9));
  it('si el dia preferit és ocupat, el següent lliure', () =>
    expect(firstFreeNumber([9, 10], 5, 9)).toBe(11));
  it('si el dia preferit ja ha passat, a partir de demà', () =>
    expect(firstFreeNumber([], 5, 3)).toBe(6));
});

describe('validApprovals', () => {
  it('compta només aprovacions d’altres editors', () => {
    const p = puzzle([review('anna', true), review('biel', true), review('cesc', false)]);
    expect(validApprovals(p).map((r) => r.author.id)).toEqual(['biel']);
  });
  it('canviar el nom (updated) no invalida les aprovacions; canviar el contingut sí', () => {
    const renamed = { ...puzzle([review('biel', true)]), updated: '2026-10-27T11:00:00.000Z' };
    expect(validApprovals(renamed)).toHaveLength(1);
    const edited = { ...renamed, contentUpdated: '2026-10-27T11:00:00.000Z' };
    expect(validApprovals(edited)).toHaveLength(0);
  });
  it('descarta aprovacions anteriors a una modificació', () => {
    const p = puzzle([review('biel', true, '2026-10-27T08:00:00.000Z'), review('cesc', true)]);
    expect(validApprovals(p).map((r) => r.author.id)).toEqual(['cesc']);
  });
  it('en un puzle publicat compten totes (publicar també el modifica)', () => {
    const p = {
      ...puzzle([review('biel', true, '2026-10-27T08:00:00.000Z'), review('cesc', true)]),
      status: 'published' as const,
    };
    expect(validApprovals(p)).toHaveLength(2);
  });
});
