import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import Spinner from '@/components/ui/Spinner';
import { useGames } from '@/games/useGames';
import { cn } from '@/lib/cn';
import { backend } from '@/services/backend';

interface Day {
  date: string;
  active: number;
  newUsers: number;
  games: Record<string, number>;
}

interface Traffic {
  today: string;
  totals: {
    users: number;
    worldLeague: number;
    noReturnEmail: number;
    active7: number;
    active30: number;
    newUsers7: number;
    activeToday: number;
    activeYesterday: number;
  };
  days: Day[];
}

const RANGES = [7, 30, 90];

/** "2026-11-14" → "dis. 14/11" */
const label = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  const wd = new Intl.DateTimeFormat('ca', { weekday: 'short' }).format(
    new Date(Date.UTC(y, m - 1, d, 12)),
  );
  return `${wd} ${d}/${m}`;
};

function Stat({ title, value, hint }: { title: string; value: number; hint?: string }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4">
      <p className="text-xs font-semibold text-stone-500 uppercase">{title}</p>
      <p className="mt-1 text-2xl font-extrabold tabular-nums">{value}</p>
      {hint && <p className="text-xs text-stone-500">{hint}</p>}
    </div>
  );
}

/** Trànsit de l'aplicació per als editors: quanta gent juga cada dia. Només es veu qui té compte. */
export default function TrafficPage() {
  const games = useGames();
  const [range, setRange] = useState(30);
  const [data, setData] = useState<Traffic | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    backend.call<Traffic>(`/admin/transit?dies=${range}`).then(
      (d) => !cancelled && (setData(d), setError(null)),
      (e: Error) => !cancelled && setError(e.message),
    );
    return () => {
      cancelled = true;
    };
  }, [range]);

  const days = data ? [...data.days].reverse() : [];
  const max = Math.max(1, ...days.map((d) => d.active));
  const finished = (d: Day) => Object.values(d.games).reduce((t, n) => t + n, 0);
  const t = data?.totals;

  return (
    <div className="mx-auto max-w-2xl py-8">
      <Link to="/editor" className="text-brand-700 text-sm hover:underline">
        ← Editor
      </Link>
      <h1 className="mt-2 text-2xl font-bold">Trànsit</h1>
      <p className="mt-1 mb-5 text-sm text-stone-600">
        Gent amb compte que ha jugat cada dia. Qui juga sense compte no hi surt: no fem servir
        galetes ni analítica, i per això no se’l pot comptar.
      </p>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {!data && !error && <Spinner />}

      {data && t && (
        <>
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat title="Avui" value={t.activeToday} hint="han jugat" />
            <Stat title="Ahir" value={t.activeYesterday} hint="van jugar" />
            <Stat title="Últims 7 dies" value={t.active7} hint="persones diferents" />
            <Stat title="Últims 30 dies" value={t.active30} hint="persones diferents" />
            <Stat title="Comptes nous" value={t.newUsers7} hint="aquesta setmana" />
            <Stat
              title="Comptes en total"
              value={t.users}
              hint={`${t.worldLeague} a la lliga mundial`}
            />
          </div>

          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Dia a dia</h2>
            <div className="flex gap-1" role="tablist" aria-label="Període">
              {RANGES.map((r) => (
                <button
                  key={r}
                  role="tab"
                  aria-selected={r === range}
                  onClick={() => setRange(r)}
                  className={cn(
                    'min-h-11 rounded-full px-4 text-sm font-semibold transition-colors',
                    r === range ? 'bg-stone-900 text-white' : 'bg-stone-200 hover:bg-stone-300',
                  )}
                >
                  {r} dies
                </button>
              ))}
            </div>
          </div>

          <ol className="divide-y divide-stone-100 overflow-hidden rounded-2xl border border-stone-200 bg-white">
            {days.map((d) => (
              <li key={d.date} className="px-4 py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-semibold">
                    {label(d.date)}
                    {d.date === data.today && (
                      <span className="ml-1 text-xs font-normal text-stone-500">(avui)</span>
                    )}
                  </span>
                  <span className="text-sm tabular-nums">
                    <strong>{d.active}</strong> {d.active === 1 ? 'persona' : 'persones'}
                  </span>
                </div>
                <div className="my-1.5 h-2 overflow-hidden rounded-full bg-stone-100" aria-hidden>
                  <div
                    className="bg-brand-700 h-full rounded-full"
                    style={{ width: `${(d.active / max) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-stone-500">
                  {finished(d)} {finished(d) === 1 ? 'partida acabada' : 'partides acabades'}
                  {games
                    .filter((g) => d.games[g.id])
                    .map((g) => ` · ${g.name} ${d.games[g.id]}`)
                    .join('')}
                  {d.newUsers > 0 &&
                    ` · ${d.newUsers} ${d.newUsers === 1 ? 'compte nou' : 'comptes nous'}`}
                </p>
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}
