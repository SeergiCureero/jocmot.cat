import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router';
import Button from '@/components/ui/Button';
import { FEATURES } from '@/config/site';
import { cn } from '@/lib/cn';
import RankCard from '@/features/social/RankCard';
import { GAMES } from '@/games/registry';
import type { ProgressRecord } from '@/services/backend';
import { computeDistribution, computeStats, type Distribution } from '@/features/progress/stats';
import { syncLocalProgress } from '@/features/progress/useGameProgress';
import { useAuth } from './AuthContext';
import DailyReminder from '@/features/notifications/DailyReminder';
import DeleteAccount from './DeleteAccount';

export default function ProfilePage() {
  const { user, logout, backendKind } = useAuth();
  const [records, setRecords] = useState<ProgressRecord[] | null>(null);
  const [deleted, setDeleted] = useState(false);

  // Depèn de l'id i no de l'objecte: refrescar la sessió crea un objecte nou i no ha de tornar a sincronitzar.
  const userId = user?.id;
  useEffect(() => {
    if (!userId) return;
    syncLocalProgress()
      .then(setRecords)
      .catch(() => setRecords([]));
  }, [userId]);

  if (!user) return <Navigate to={deleted ? '/' : '/compte/entrar'} replace />;

  return (
    <div className="mx-auto max-w-2xl py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hola, {user.username}!</h1>
          <p className="text-sm text-stone-600">{user.email}</p>
          {backendKind === 'local' && (
            <p className="mt-1 text-xs text-amber-700">
              Mode local: el progrés només es guarda en aquest navegador.
            </p>
          )}
        </div>
        <Button variant="secondary" onClick={logout}>
          Surt
        </Button>
      </div>

      {FEATURES.social && <RankCard />}

      <h2 className="mb-3 text-lg font-semibold">Les teves estadístiques</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {GAMES.map((game) => {
          const mine = (records ?? []).filter((r) => r.gameId === game.id);
          const stats = computeStats(mine);
          const distribution = computeDistribution(game.id, mine);
          return (
            <section key={game.id} className="rounded-xl border border-stone-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 font-semibold">
                  <span
                    className={`grid size-8 place-items-center rounded-lg ${game.theme.bg} text-white`}
                  >
                    {game.icon}
                  </span>
                  {game.name}
                </span>
                <Link
                  to={`/${game.slug}`}
                  className="text-brand-700 text-sm font-semibold hover:underline"
                >
                  Juga →
                </Link>
              </div>
              {records === null ? (
                <p className="text-sm text-stone-500">Carregant…</p>
              ) : (
                <>
                  <dl className="grid grid-cols-4 text-center text-sm">
                    <Stat label="Jugats" value={stats.played} />
                    <Stat label="% encerts" value={stats.winRate} />
                    <Stat label="Ratxa" value={stats.currentStreak} />
                    <Stat label="Màxima" value={stats.maxStreak} />
                  </dl>
                  {distribution && stats.won > 0 && <DistributionChart {...distribution} />}
                </>
              )}
            </section>
          );
        })}
      </div>

      {backendKind === 'pocketbase' && <DailyReminder />}

      {backendKind === 'pocketbase' && <DeleteAccount onDeleted={() => setDeleted(true)} />}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dd className="text-xl font-bold">{value}</dd>
      <dt className="text-xs text-stone-500">{label}</dt>
    </div>
  );
}

/** Barres horitzontals com les del Wordle. */
function DistributionChart({ title, bars, extra }: Distribution) {
  const max = Math.max(1, ...bars.map((b) => b.count));
  return (
    <div className="mt-4 text-sm">
      <p className="mb-1.5 text-xs font-semibold text-stone-500 uppercase">{title}</p>
      <ul className="space-y-1">
        {bars.map((b) => (
          <li key={b.label} className="flex items-center gap-2">
            <span className="w-12 shrink-0 text-right text-xs text-stone-600">{b.label}</span>
            <span
              className={cn(
                'animate-rise min-w-6 rounded px-1.5 py-0.5 text-right text-xs font-bold text-white',
                b.count ? 'bg-brand-600' : 'bg-stone-300',
              )}
              style={{ width: `${(b.count / max) * 100}%` }}
            >
              {b.count}
            </span>
          </li>
        ))}
      </ul>
      {extra.length > 0 && (
        <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
          {extra.map((e) => (
            <div key={e.label} className="flex gap-1.5">
              <dt className="text-stone-500">{e.label}:</dt>
              <dd className="font-semibold">{e.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
