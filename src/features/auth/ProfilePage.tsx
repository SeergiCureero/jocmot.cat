import { useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import Button from '@/components/ui/Button';
import { FEATURES } from '@/config/site';
import RankCard from '@/features/social/RankCard';
import type { ProgressRecord } from '@/services/backend';
import StatsGrid from '@/features/progress/StatsGrid';
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
      <StatsGrid records={records} />

      {backendKind === 'pocketbase' && <DailyReminder />}

      {backendKind === 'pocketbase' && <DeleteAccount onDeleted={() => setDeleted(true)} />}
    </div>
  );
}
