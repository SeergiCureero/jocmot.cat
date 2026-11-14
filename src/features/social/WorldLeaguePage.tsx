import { useState } from 'react';
import { ColorIcon } from '@/components/icons/color';
import { Link } from 'react-router';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/features/auth/AuthContext';
import { backend } from '@/services/backend';
import { formatMonth, social } from './api';
import PointsHelp from './PointsHelp';
import { ErrorBox, RankingTable, RequireLogin, SocialTabs, useLoad } from './ui';

/** Lliga mundial: el top de tots els jugadors que hi participen, cada mes. */
export default function WorldLeaguePage() {
  return (
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="mb-1 text-2xl font-bold">Competició</h1>
      <p className="mb-5 text-sm text-stone-600">
        Cada mes comença una lliga nova: qui sumi més punts fins a final de mes, guanya.
      </p>
      <SocialTabs />
      <RequireLogin>
        <WorldView />
      </RequireLogin>
      <PointsHelp />
    </div>
  );
}

function WorldView() {
  const { user } = useAuth();
  const [month, setMonth] = useState<string>();
  const { data, error, reload } = useLoad(() => social.worldLeague(month), [month]);

  if (error) return <ErrorBox>{error}</ErrorBox>;
  if (!data) return <Spinner />;

  return (
    <>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">
            <ColorIcon name="globe" size={24} className="inline-block align-[-0.2em]" /> Lliga
            mundial
          </h2>
          <p className="text-sm text-stone-600">
            Els {data.size} primers de {formatMonth(data.month)}
          </p>
        </div>
        {data.months.length > 1 && (
          <select
            value={data.month}
            onChange={(e) => setMonth(e.target.value)}
            aria-label="Mes"
            className="min-h-11 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm"
          >
            {data.months.map((m) => (
              <option key={m} value={m}>
                {formatMonth(m)}
              </option>
            ))}
          </select>
        )}
      </div>

      {data.participation !== 'yes' && <Join onChosen={reload} />}

      {data.finished && (
        <div className="animate-rise mb-4 rounded-2xl bg-amber-100 p-4 text-center">
          <p className="text-sm font-semibold text-amber-900 uppercase">
            Lliga de {formatMonth(data.month)} acabada
          </p>
          <p className="mt-1 text-lg font-bold">
            {data.winner ? <>👑 Guanyador: {data.winner.name}</> : 'Ningú no hi va sumar punts'}
          </p>
        </div>
      )}

      {data.ranking.length ? (
        <>
          <RankingTable rows={data.ranking} meId={user?.id} />
          {data.me && (
            <>
              <p className="my-2 text-center text-stone-500" aria-hidden>
                ⋮
              </p>
              <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
                <RankingTable rows={[data.me]} meId={user?.id} />
              </div>
            </>
          )}
        </>
      ) : (
        <p className="rounded-2xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-600">
          Encara no hi ha ningú al rànquing d’aquest mes. Pots ser el primer!
        </p>
      )}

      {data.participation === 'yes' && (
        <p className="mt-6 text-center text-sm text-stone-600">
          Surts a la lliga mundial amb el nom d’usuari. Ho pots canviar des del{' '}
          <Link to="/compte" className="text-brand-700 font-semibold hover:underline">
            teu perfil
          </Link>
          .
        </p>
      )}
    </>
  );
}

function Join({ onChosen }: { onChosen: () => void }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function join() {
    setBusy(true);
    try {
      await backend.setWorldLeague('yes');
      onChosen();
    } catch (e) {
      toast((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="animate-rise mb-5 rounded-2xl border border-stone-200 bg-white p-4 text-center">
      <p className="text-sm text-stone-700">
        Perquè hi surtis, el teu nom d’usuari ha de ser visible per a tothom. Només hi surt qui ho
        vol.
      </p>
      <Button className="mt-3" onClick={join} disabled={busy}>
        Vull sortir a la lliga mundial
      </Button>
    </div>
  );
}
