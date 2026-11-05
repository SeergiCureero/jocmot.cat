import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { FEATURES } from '@/config/site';
import { useAuth } from '@/features/auth/AuthContext';
import StatsGrid from '@/features/progress/StatsGrid';
import { localProgressRecords, syncLocalProgress } from '@/features/progress/useGameProgress';
import type { ProgressRecord } from '@/services/backend';

/** Estadístiques de tots els jocs. Sense compte, les d'aquest dispositiu. */
export default function StatsPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<ProgressRecord[] | null>(() =>
    user ? null : localProgressRecords(),
  );

  const userId = user?.id;
  useEffect(() => {
    if (!userId) {
      setRecords(localProgressRecords());
      return;
    }
    let cancelled = false;
    syncLocalProgress()
      .then((r) => !cancelled && setRecords(r))
      .catch(() => !cancelled && setRecords(localProgressRecords()));
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <div className="mx-auto max-w-2xl py-6">
      <h1 className="mb-1 text-2xl font-bold">Estadístiques</h1>
      <p className="mb-5 text-sm text-stone-600">
        {user
          ? 'Totes les teves partides, de tots els dispositius.'
          : 'Les partides que has jugat en aquest dispositiu.'}
        {!user && FEATURES.accounts && (
          <>
            {' '}
            <Link to="/compte/registre" className="text-brand-700 font-semibold underline">
              Crea un compte
            </Link>{' '}
            per tenir-les a tots els mòbils.
          </>
        )}
      </p>
      <StatsGrid records={records} />
    </div>
  );
}
