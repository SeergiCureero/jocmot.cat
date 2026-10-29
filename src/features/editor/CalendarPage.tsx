import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import Spinner from '@/components/ui/Spinner';
import { cn } from '@/lib/cn';
import { getPuzzleDate, getTodayPuzzleNumber } from '@/games/puzzles';
import { DESIGNABLE_GAMES } from '@/games/registry';
import { backend, type DesignableGameId, type PuzzleRecord } from '@/services/backend';
import MoveDay from './MoveDay';
import { GameLabel, gameMeta } from './ui';

/** Dies que es mostren com a mínim a partir d'avui. */
const MIN_DAYS = 30;

/** "dv., 30 d’oct." → "Dv. 30 d’oct." */
const formatDay = (isoDate: string) => {
  const [y, m, d] = isoDate.split('-').map(Number);
  const text = new Intl.DateTimeFormat('ca', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
    .format(new Date(Date.UTC(y, m - 1, d, 12)))
    .replace(',', '');
  return text[0].toUpperCase() + text.slice(1);
};

/** Calendari dels puzles del grup: quin surt cada dia i canviar-los de dia. */
export default function CalendarPage() {
  const [game, setGame] = useState<DesignableGameId>(DESIGNABLE_GAMES[0]);
  const [puzzles, setPuzzles] = useState<PuzzleRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    () => backend.listPuzzles().then(setPuzzles, (e: Error) => setError(e.message)),
    [],
  );
  useEffect(() => {
    load();
  }, [load]);

  const today = getTodayPuzzleNumber();
  const byNumber = new Map(
    (puzzles ?? [])
      .filter((p) => p.game === game && p.status === 'published' && p.number)
      .map((p) => [p.number!, p]),
  );
  const last = Math.max(today + MIN_DAYS, ...byNumber.keys());
  const days = Array.from({ length: last - today + 1 }, (_, i) => today + i);
  const scheduled = days.filter((n) => n > today && byNumber.has(n)).length;

  return (
    <div className="mx-auto max-w-2xl py-8">
      <Link to="/editor" className="text-brand-700 text-sm hover:underline">
        ← Editor
      </Link>
      <h1 className="mt-2 text-2xl font-bold">Calendari</h1>
      <p className="mt-1 mb-5 text-sm text-stone-600">
        Quin puzle surt cada dia. Els dies sense puzle del grup surt un de reserva. Pots canviar de
        dia qualsevol puzle programat; si el dia ja en té un, s’intercanvien.
      </p>

      <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Joc">
        {DESIGNABLE_GAMES.map((g) => (
          <button
            key={g}
            role="tab"
            aria-selected={g === game}
            onClick={() => setGame(g)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
              g === game ? 'bg-stone-900 text-white' : 'bg-stone-200 hover:bg-stone-300',
            )}
          >
            {gameMeta(g).name}
          </button>
        ))}
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {!puzzles && !error && <Spinner />}
      {puzzles && (
        <>
          <p className="mb-3 text-sm text-stone-600">
            <GameLabel game={game} /> · {scheduled}{' '}
            {scheduled === 1 ? 'puzle programat' : 'puzles programats'} als propers {last - today}{' '}
            dies
          </p>
          <ol className="divide-y divide-stone-200 overflow-hidden rounded-2xl border border-stone-200 bg-white">
            {days.map((n) => {
              const p = byNumber.get(n);
              const isToday = n === today;
              return (
                <li
                  key={n}
                  className={cn('flex items-center gap-3 px-3 py-2', isToday && 'bg-amber-50')}
                >
                  <span className="w-28 shrink-0 text-sm">
                    <span className="block font-semibold">
                      {isToday ? 'Avui' : formatDay(getPuzzleDate(n))}
                    </span>
                    <span className="text-xs text-stone-500">#{n}</span>
                  </span>
                  {p ? (
                    <>
                      <Link
                        to={`/editor/puzle/${p.id}`}
                        className="min-w-0 flex-1 truncate text-sm font-medium hover:underline"
                      >
                        de {p.author.username}
                      </Link>
                      {!isToday && <MoveDay puzzle={p} onMoved={load} />}
                    </>
                  ) : (
                    <span className="flex-1 text-sm text-stone-400">Puzle de reserva</span>
                  )}
                </li>
              );
            })}
          </ol>
        </>
      )}
    </div>
  );
}
