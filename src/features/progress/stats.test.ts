import type { ProgressRecord } from '@/services/backend/types';
import { computeStats } from './stats';

const rec = (puzzleId: number, status: ProgressRecord['status']): ProgressRecord => ({
  gameId: 'paraula',
  puzzleId,
  status,
  state: null,
  updatedAt: '',
});

describe('computeStats', () => {
  it('calcula ratxes i percentatge', () => {
    const s = computeStats([rec(1, 'won'), rec(2, 'won'), rec(3, 'lost'), rec(4, 'won'), rec(5, 'won'), rec(6, 'won')]);
    expect(s).toMatchObject({ played: 6, won: 5, winRate: 83, currentStreak: 3, maxStreak: 3 });
  });
  it('trenca la ratxa si falta un dia', () => {
    expect(computeStats([rec(1, 'won'), rec(3, 'won')]).currentStreak).toBe(1);
  });
});
