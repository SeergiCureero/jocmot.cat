import { formatSeconds } from '@/lib/date';
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

export interface Distribution {
  /** Què compta cada barra (p. ex. "Intents"). */
  title: string;
  bars: { label: string; count: number }[];
  /** Dades extra del joc (p. ex. el millor temps de la Mini). */
  extra: { label: string; value: string }[];
}

// Només les parts de l'estat de cada joc que fan falta aquí (les features no importen dels jocs).
type ParaulaLike = { guesses?: string[] };
type ConnexionsLike = { mistakes?: number };
type FilsLike = { log?: string[]; bonus?: string[] };
type MiniLike = { elapsedSeconds?: number };

const count = <T>(items: T[], buckets: { label: string; test: (x: T) => boolean }[]) =>
  buckets.map(({ label, test }) => ({ label, count: items.filter(test).length }));

/** Distribució pròpia de cada joc, com la dels intents del Wordle. Només puzles guanyats. */
export function computeDistribution(
  gameId: string,
  records: ProgressRecord[],
): Distribution | null {
  const won = records.filter((r) => r.status === 'won').map((r) => r.state ?? {});
  switch (gameId) {
    case 'paraula': {
      const tries = (won as ParaulaLike[]).map((s) => s.guesses?.length ?? 0);
      return {
        title: 'Intents',
        bars: count(
          tries,
          [1, 2, 3, 4, 5, 6].map((n) => ({ label: String(n), test: (t) => t === n })),
        ),
        extra: [],
      };
    }
    case 'connexions': {
      const mistakes = (won as ConnexionsLike[]).map((s) => s.mistakes ?? 0);
      return {
        title: 'Errors',
        bars: count(
          mistakes,
          [0, 1, 2, 3].map((n) => ({ label: String(n), test: (m) => m === n })),
        ),
        extra: [{ label: 'Perfectes', value: String(mistakes.filter((m) => m === 0).length) }],
      };
    }
    case 'fils': {
      const states = won as FilsLike[];
      const hints = states.map((s) => (s.log ?? []).filter((l) => l === 'hint').length);
      const bonus = states.reduce((n, s) => n + (s.bonus?.length ?? 0), 0);
      return {
        title: 'Pistes',
        bars: count(hints, [
          { label: '0', test: (h) => h === 0 },
          { label: '1', test: (h) => h === 1 },
          { label: '2', test: (h) => h === 2 },
          { label: '3+', test: (h) => h >= 3 },
        ]),
        extra: bonus ? [{ label: 'Paraules extra', value: String(bonus) }] : [],
      };
    }
    case 'mini': {
      const times = (won as MiniLike[]).map((s) => s.elapsedSeconds ?? 0).filter((t) => t > 0);
      const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
      return {
        title: 'Temps',
        bars: count(times, [
          { label: '<30 s', test: (t) => t < 30 },
          { label: '<1 min', test: (t) => t >= 30 && t < 60 },
          { label: '<2 min', test: (t) => t >= 60 && t < 120 },
          { label: '<5 min', test: (t) => t >= 120 && t < 300 },
          { label: '5+ min', test: (t) => t >= 300 },
        ]),
        extra: times.length
          ? [
              { label: 'Millor temps', value: formatSeconds(Math.min(...times)) },
              { label: 'Mitjana', value: formatSeconds(avg) },
            ]
          : [],
      };
    }
    default:
      return null;
  }
}
