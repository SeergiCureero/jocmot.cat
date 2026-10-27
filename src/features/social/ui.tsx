import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { useAuth } from '@/features/auth/AuthContext';
import { cn } from '@/lib/cn';
import type { Rank, RankingRow } from './api';

export function RankBadge({
  rank,
  className,
}: {
  rank: Pick<Rank, 'name' | 'icon'>;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5 text-xs font-semibold text-stone-700',
        className,
      )}
      title={`Rang: ${rank.name}`}
    >
      {rank.icon} {rank.name}
    </span>
  );
}

export function StreakBadge({ days }: { days: number }) {
  if (!days) return null;
  return (
    <span className="text-sm font-semibold text-orange-600" title={`Ratxa de ${days} dies seguits`}>
      🔥 {days}
    </span>
  );
}

const MEDALS = ['🥇', '🥈', '🥉'];

/** Classificació del mes: posició, nom, rang, ratxa i punts. */
export function RankingTable({
  rows,
  meId,
  action,
}: {
  rows: RankingRow[];
  meId?: string;
  /** Acció per fila (p. ex. deixar de ser amics). */
  action?: (row: RankingRow) => ReactNode;
}) {
  return (
    <ol className="divide-y divide-stone-100 overflow-hidden rounded-2xl border border-stone-200 bg-white">
      {rows.map((row, i) => {
        const me = row.user.id === meId;
        return (
          <li
            key={row.user.id}
            className={cn('animate-rise flex items-center gap-3 px-4 py-3', me && 'bg-brand-50')}
            style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}
          >
            <span className="w-7 text-center text-lg font-bold text-stone-500 tabular-nums">
              {row.monthPoints > 0 && MEDALS[row.position - 1]
                ? MEDALS[row.position - 1]
                : row.position}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold">
                {row.user.name}
                {me && <span className="ml-1 text-sm font-normal text-stone-500">(tu)</span>}
              </span>
              <span className="flex flex-wrap items-center gap-2">
                <RankBadge rank={row.rank} />
                <StreakBadge days={row.streak} />
              </span>
            </span>
            <span className="text-right">
              <span className="block text-lg font-bold tabular-nums">{row.monthPoints}</span>
              <span className="block text-xs text-stone-500">punts</span>
            </span>
            {action?.(row)}
          </li>
        );
      })}
    </ol>
  );
}

export function SocialTabs() {
  const tab = ({ isActive }: { isActive: boolean }) =>
    cn(
      'rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
      isActive ? 'bg-stone-900 text-white' : 'bg-stone-200 hover:bg-stone-300',
    );
  return (
    <nav className="mb-6 flex gap-2" aria-label="Competició">
      <NavLink to="/lligues" end className={tab}>
        🏆 Lligues
      </NavLink>
      <NavLink to="/amics" className={tab}>
        👥 Amics
      </NavLink>
    </nav>
  );
}

/** Mostra el contingut només amb sessió; si no, convida a entrar (i hi torna després). */
export function RequireLogin({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  if (user) return children;
  const next = `?seguent=${encodeURIComponent(pathname)}`;
  return (
    <div className="animate-rise rounded-2xl border border-stone-200 bg-white p-6 text-center">
      <p className="text-4xl">🏆</p>
      <h2 className="mt-2 text-lg font-bold">Competeix amb els teus amics</h2>
      <p className="mt-1 text-sm text-stone-600">
        Amb un compte sumes punts cada dia, mantens la ratxa i puges de rang.
      </p>
      <div className="mt-4 flex justify-center gap-2">
        <Link
          to={`/compte/registre${next}`}
          className="bg-brand-700 hover:bg-brand-900 rounded-full px-5 py-2 text-sm font-semibold text-white"
        >
          Crea un compte
        </Link>
        <Link
          to={`/compte/entrar${next}`}
          className="rounded-full border border-stone-300 bg-white px-5 py-2 text-sm font-semibold hover:bg-stone-100"
        >
          Entra
        </Link>
      </div>
    </div>
  );
}

/** Carrega dades asíncrones; `reload` les torna a demanar. */
export function useLoad<T>(load: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const run = useCallback(load, deps);

  const reload = useCallback(
    () =>
      run().then(
        (d) => {
          setData(d);
          setError(null);
        },
        (e: Error) => setError(e.message),
      ),
    [run],
  );

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, error, reload };
}

export function ErrorBox({ children }: { children: ReactNode }) {
  return <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{children}</p>;
}
