import type { ProgressRecord } from '@/services/backend/types';
import { computeDistribution, computeStats } from './stats';

const rec = (puzzleId: number, status: ProgressRecord['status']): ProgressRecord => ({
  gameId: 'paraula',
  puzzleId,
  status,
  state: null,
  updatedAt: '',
});

describe('computeStats', () => {
  it('calcula ratxes i percentatge', () => {
    const s = computeStats([
      rec(1, 'won'),
      rec(2, 'won'),
      rec(3, 'lost'),
      rec(4, 'won'),
      rec(5, 'won'),
      rec(6, 'won'),
    ]);
    expect(s).toMatchObject({ played: 6, won: 5, winRate: 83, currentStreak: 3, maxStreak: 3 });
  });
  it('trenca la ratxa si falta un dia', () => {
    expect(computeStats([rec(1, 'won'), rec(3, 'won')]).currentStreak).toBe(1);
  });
});

describe('computeDistribution', () => {
  const won = (gameId: string, state: unknown): ProgressRecord =>
    ({ gameId, puzzleId: 1, status: 'won', state, updatedAt: '' }) as ProgressRecord;

  it('Paraula: intents dels puzles guanyats', () => {
    const d = computeDistribution('paraula', [
      won('paraula', { guesses: ['A', 'B', 'C'] }),
      won('paraula', { guesses: ['A', 'B', 'C'] }),
      won('paraula', { guesses: ['A'] }),
      { ...won('paraula', { guesses: ['A', 'B'] }), status: 'lost' },
    ])!;
    expect(d.bars.map((b) => b.count)).toEqual([1, 0, 2, 0, 0, 0]);
  });
  it('Mini: millor temps i mitjana', () => {
    const d = computeDistribution('mini', [
      won('mini', { elapsedSeconds: 45 }),
      won('mini', { elapsedSeconds: 75 }),
    ])!;
    expect(d.extra).toEqual([
      { label: 'Millor temps', value: '0:45' },
      { label: 'Mitjana', value: '1:00' },
    ]);
  });
  it('Fils: pistes i paraules extra', () => {
    const d = computeDistribution('fils', [
      won('fils', { log: ['theme', 'hint', 'hint'], bonus: ['CASA', 'COSA'] }),
      won('fils', { log: ['theme'] }),
    ])!;
    expect(d.bars.map((b) => b.count)).toEqual([1, 0, 1, 0]);
    expect(d.extra).toEqual([{ label: 'Paraules extra', value: '2' }]);
  });
});
