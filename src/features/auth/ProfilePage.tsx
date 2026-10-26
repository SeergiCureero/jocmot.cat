import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router';
import Button from '@/components/ui/Button';
import { GAMES } from '@/games/registry';
import type { ProgressRecord } from '@/services/backend';
import { computeStats } from '@/features/progress/stats';
import { syncLocalProgress } from '@/features/progress/useGameProgress';
import { useAuth } from './AuthContext';

export default function ProfilePage() {
  const { user, logout, backendKind } = useAuth();
  const [records, setRecords] = useState<ProgressRecord[] | null>(null);

  // Depèn de l'id i no de l'objecte: refrescar la sessió crea un objecte nou i no ha de tornar a sincronitzar.
  const userId = user?.id;
  useEffect(() => {
    if (!userId) return;
    syncLocalProgress().then(setRecords).catch(() => setRecords([]));
  }, [userId]);

  if (!user) return <Navigate to="/compte/entrar" replace />;

  return (
    <div className="mx-auto max-w-2xl py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hola, {user.username}!</h1>
          <p className="text-sm text-stone-600">{user.email}</p>
          {backendKind === 'local' && (
            <p className="mt-1 text-xs text-amber-700">Mode local: el progrés només es guarda en aquest navegador.</p>
          )}
        </div>
        <Button variant="secondary" onClick={logout}>
          Surt
        </Button>
      </div>

      <h2 className="mb-3 text-lg font-semibold">Les teves estadístiques</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {GAMES.map((game) => {
          const stats = computeStats((records ?? []).filter((r) => r.gameId === game.id));
          return (
            <Link
              key={game.id}
              to={`/${game.slug}`}
              className="rounded-xl border border-stone-200 bg-white p-4 transition hover:shadow-md"
            >
              <div className="mb-2 flex items-center gap-2 font-semibold">
                <span className={`grid size-8 place-items-center rounded-lg ${game.theme.bg} text-white`}>
                  {game.icon}
                </span>
                {game.name}
              </div>
              {records === null ? (
                <p className="text-sm text-stone-500">Carregant…</p>
              ) : (
                <dl className="grid grid-cols-3 text-center text-sm">
                  <Stat label="Jugats" value={stats.played} />
                  <Stat label="% encerts" value={stats.winRate} />
                  <Stat label="Ratxa" value={stats.currentStreak} />
                </dl>
              )}
            </Link>
          );
        })}
      </div>
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
