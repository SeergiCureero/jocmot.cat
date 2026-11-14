import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import GameIcon from '@/components/game/GameIcon';
import Spinner from '@/components/ui/Spinner';
import { GAMES } from '@/games/registry';
import type { GameId } from '@/games/types';
import { formatDateCa } from '@/lib/date';
import { cn } from '@/lib/cn';
import { backend } from '@/services/backend';

interface Row {
  puzzle: number;
  date: string;
  title: string;
  grouped: boolean;
  likes: number;
  finished: number;
  won: number;
}

type Sort = 'rate' | 'likes' | 'day';

/** Sota d'aquest nombre de partides, el percentatge de likes encara no és fiable. */
const MIN_PLAYED = 5;

const rate = (r: Row) => (r.finished ? r.likes / r.finished : 0);
const percent = (r: Row) => (r.finished ? `${Math.round(rate(r) * 100)} %` : '—');

/** Quins puzles agraden i quins no: likes, partides acabades i % de likes, per joc. Només editors. */
export default function RatingsPage() {
  const [game, setGame] = useState<GameId>(GAMES[0].id);
  const [sort, setSort] = useState<Sort>('rate');
  const [data, setData] = useState<{ game: GameId; rows: Row[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    backend.call<{ puzzles: Row[] }>(`/admin/valoracions/${game}`).then(
      (d) => !cancelled && (setData({ game, rows: d.puzzles }), setError(null)),
      (e: Error) => !cancelled && setError(e.message),
    );
    return () => {
      cancelled = true;
    };
  }, [game]);

  const rows = data?.game === game ? data.rows : null;
  const sorted = useMemo(() => {
    if (!rows) return [];
    const list = [...rows];
    if (sort === 'day') return list.sort((a, b) => b.puzzle - a.puzzle);
    const reliable = (r: Row) => (r.finished >= MIN_PLAYED ? 1 : 0);
    return list.sort(
      (a, b) =>
        reliable(b) - reliable(a) ||
        (sort === 'likes' ? b.likes - a.likes : rate(b) - rate(a)) ||
        b.finished - a.finished,
    );
  }, [rows, sort]);

  const totals = rows?.reduce(
    (t, r) => ({ likes: t.likes + r.likes, finished: t.finished + r.finished }),
    { likes: 0, finished: 0 },
  );

  return (
    <div className="mx-auto max-w-2xl py-8">
      <Link to="/editor" className="text-brand-700 text-sm hover:underline">
        ← Editor
      </Link>
      <h1 className="mt-2 text-2xl font-bold">Valoracions</h1>
      <p className="mt-1 mb-5 text-sm text-stone-600">
        Quins puzles agraden. El % és els likes sobre les partides acabades; amb menys de{' '}
        {MIN_PLAYED} partides no és fiable i queden al final.
      </p>

      <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Joc">
        {GAMES.map((g) => (
          <button
            key={g.id}
            role="tab"
            aria-selected={g.id === game}
            onClick={() => setGame(g.id)}
            className={cn(
              'inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
              g.id === game ? 'bg-stone-900 text-white' : 'bg-stone-200 hover:bg-stone-300',
            )}
          >
            <GameIcon id={g.id} size={20} />
            {g.name}
          </button>
        ))}
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {!rows && !error && <Spinner />}

      {rows && totals && (
        <>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-stone-600">
              {totals.likes} likes · {totals.finished} partides acabades
            </p>
            <label className="flex items-center gap-2 text-sm">
              Ordena per
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="min-h-11 rounded-lg border border-stone-300 bg-white px-3 py-1.5"
              >
                <option value="rate">% de likes</option>
                <option value="likes">Likes</option>
                <option value="day">Dia (més nou primer)</option>
              </select>
            </label>
          </div>
          <ol className="divide-y divide-stone-100 overflow-hidden rounded-2xl border border-stone-200 bg-white">
            {sorted.map((r) => (
              <li key={r.puzzle} className="flex items-center gap-3 px-4 py-3">
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">
                    #{r.puzzle}
                    {r.title && <span className="font-normal"> · {r.title}</span>}
                  </span>
                  <span className="block text-xs text-stone-500">
                    {formatDateCa(r.date)}
                    {game !== 'paraula' && <> · {r.grouped ? 'del grup' : 'de reserva'}</>}
                  </span>
                </span>
                <span className="text-right text-sm tabular-nums">
                  <span className="block text-lg font-bold">{percent(r)}</span>
                  <span
                    className={cn(
                      'block text-xs text-stone-500',
                      r.finished < MIN_PLAYED && 'italic',
                    )}
                  >
                    ♥ {r.likes} · {r.finished} partides
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}
