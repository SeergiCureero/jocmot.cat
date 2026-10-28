import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useAuth } from '@/features/auth/AuthContext';
import { getPuzzleDate, getTodayPuzzleNumber } from '@/games/puzzles';
import { GAMES } from '@/games/registry';
import { cn } from '@/lib/cn';
import { storage } from '@/lib/storage';
import { backend, type GameStatus, type ProgressRecord } from '@/services/backend';
import Icon from '@/components/ui/Icon';

const STATUS: Record<GameStatus, { label: string; className: string; icon?: 'fet' }> = {
  won: { label: 'Resolt', icon: 'fet', className: 'bg-green-100 text-green-800' },
  lost: { label: 'No resolt', className: 'bg-stone-200 text-stone-600' },
  playing: { label: 'A mitges', className: 'bg-amber-100 text-amber-800' },
};

const formatDay = (isoDate: string) => {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Intl.DateTimeFormat('ca', { weekday: 'long', day: 'numeric', month: 'long' }).format(
    new Date(Date.UTC(y, m - 1, d, 12)),
  );
};

/** Tots els puzles publicats fins avui, per tornar a jugar els que t'has perdut. */
export default function ArchivePage() {
  const [params, setParams] = useSearchParams();
  const game = GAMES.find((g) => g.slug === params.get('joc')) ?? GAMES[0];
  const today = getTodayPuzzleNumber();
  const numbers = Array.from({ length: today }, (_, i) => today - i);
  const statuses = useStatuses(game.id);

  return (
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="text-2xl font-bold">Arxiu</h1>
      <p className="mt-1 text-sm text-stone-600">Juga els puzles dels dies anteriors.</p>

      <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Joc">
        {GAMES.map((g) => (
          <button
            key={g.id}
            role="tab"
            aria-selected={g.id === game.id}
            onClick={() => setParams({ joc: g.slug }, { replace: true })}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
              g.id === game.id ? 'bg-stone-900 text-white' : 'bg-stone-200 hover:bg-stone-300',
            )}
          >
            <Icon name={g.icon} /> {g.name}
          </button>
        ))}
      </div>

      <ul key={game.id} className="mt-6 grid gap-2 sm:grid-cols-2">
        {numbers.map((n, i) => {
          const status = statuses[n];
          return (
            <li
              key={n}
              className="animate-rise"
              style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
            >
              <Link
                to={n === today ? `/${game.slug}` : `/${game.slug}/${n}`}
                className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-3 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span
                  className={cn(
                    'grid size-11 shrink-0 place-items-center rounded-lg text-sm font-bold',
                    game.theme.bg,
                  )}
                >
                  #{n}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold first-letter:uppercase">
                    {formatDay(getPuzzleDate(n))}
                  </span>
                  {n === today && (
                    <span className="text-brand-700 text-xs font-semibold">Avui</span>
                  )}
                </span>
                {status && (
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
                      STATUS[status].className,
                    )}
                  >
                    {STATUS[status].icon && <Icon name={STATUS[status].icon} />}
                    {STATUS[status].label}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Estat de cada puzle d'un joc: el del navegador i, amb sessió, el del servidor (el més recent guanya). */
function useStatuses(gameId: string): Record<number, GameStatus> {
  const { user } = useAuth();
  const [remote, setRemote] = useState<ProgressRecord[]>([]);
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return setRemote([]);
    let cancelled = false;
    backend
      .listProgress()
      .then((records) => !cancelled && setRemote(records))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const latest = new Map<number, ProgressRecord>();
  const consider = (r: ProgressRecord | null) => {
    if (!r || r.gameId !== gameId) return;
    const current = latest.get(r.puzzleId);
    if (!current || r.updatedAt > current.updatedAt) latest.set(r.puzzleId, r);
  };
  storage.keys(`progress:${gameId}:`).forEach((key) => consider(storage.get<ProgressRecord>(key)));
  remote.forEach(consider);
  return Object.fromEntries([...latest].map(([n, r]) => [n, r.status]));
}
