import type { ProgressRecord } from '@/services/backend/types';

export interface GameStats {
  played: number;
  won: number;
  winRate: number;
  currentStreak: number;
  maxStreak: number;
}

/** Estadístiques a partir dels registres d'un joc (només puzles acabats). */
export function computeStats(records: ProgressRecord[]): GameStats {
  const finished = records
    .filter((r) => r.status !== 'playing')
    .sort((a, b) => a.puzzleId - b.puzzleId);

  const won = finished.filter((r) => r.status === 'won').length;

  let maxStreak = 0;
  let streak = 0;
  let prevId: number | null = null;
  for (const r of finished) {
    const consecutive = prevId !== null && r.puzzleId === prevId + 1;
    if (r.status === 'won') streak = consecutive || prevId === null ? streak + 1 : 1;
    else streak = 0;
    maxStreak = Math.max(maxStreak, streak);
    prevId = r.puzzleId;
  }

  return {
    played: finished.length,
    won,
    winRate: finished.length ? Math.round((won / finished.length) * 100) : 0,
    currentStreak: streak,
    maxStreak,
  };
}
