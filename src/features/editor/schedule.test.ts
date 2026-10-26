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
  reviews,
});

describe('firstFreeNumber', () => {
  it('comença demà', () => expect(firstFreeNumber([], 5)).toBe(6));
  it('salta els ocupats i omple forats', () => expect(firstFreeNumber([6, 7, 9], 5)).toBe(8));
  it('ignora números passats', () => expect(firstFreeNumber([1, 2, 3], 5)).toBe(6));
});

describe('validApprovals', () => {
  it('compta només aprovacions d’altres editors', () => {
    const p = puzzle([review('anna', true), review('biel', true), review('cesc', false)]);
    expect(validApprovals(p).map((r) => r.author.id)).toEqual(['biel']);
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
