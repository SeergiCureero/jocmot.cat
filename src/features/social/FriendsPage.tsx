import { useState, type FormEvent, type ReactNode } from 'react';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { INPUT } from '@/components/ui/styles';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/features/auth/AuthContext';
import { formatMonth, social, type FriendRequest } from './api';
import PointsHelp from './PointsHelp';
import { ErrorBox, RankingTable, RequireLogin, SocialTabs, useLoad } from './ui';

/** Amics: afegir-ne pel nom d'usuari, sol·licituds i rànquing del mes. */
export default function FriendsPage() {
  return (
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="mb-1 text-2xl font-bold">Competició</h1>
      <p className="mb-5 text-sm text-stone-600">
        Afegeix amics pel seu nom d’usuari i compareu punts i ratxes.
      </p>
      <SocialTabs />
      <RequireLogin>
        <Friends />
      </RequireLogin>
      <PointsHelp />
    </div>
  );
}

function Friends() {
  const { user } = useAuth();
  const toast = useToast();
  const { data, error, reload } = useLoad(() => social.friends(), []);

  const act = async (action: Promise<unknown>, message: string) => {
    try {
      await action;
      toast(message);
      await reload();
    } catch (e) {
      toast((e as Error).message);
    }
  };

  if (error) return <ErrorBox>{error}</ErrorBox>;
  if (!data) return <Spinner />;

  const alone = data.ranking.length === 1;

  return (
    <>
      <AddFriend onAdded={reload} />

      {data.incoming.length > 0 && (
        <Requests
          title="Sol·licituds rebudes"
          requests={data.incoming}
          actions={(r) => (
            <>
              <Button
                onClick={() => act(social.acceptFriend(r.id), `Ara ets amic de ${r.user.name}!`)}
              >
                Accepta
              </Button>
              <Button
                variant="ghost"
                onClick={() => act(social.removeRequest(r.id), 'Sol·licitud rebutjada')}
              >
                Rebutja
              </Button>
            </>
          )}
        />
      )}

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">
          Rànquing d’amics{' '}
          <span className="text-sm font-normal text-stone-500">· {formatMonth(data.month)}</span>
        </h2>
        {alone ? (
          <p className="rounded-2xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-600">
            Encara no tens amics aquí. Afegeix-ne pel seu nom d’usuari!
          </p>
        ) : (
          <RankingTable
            rows={data.ranking}
            meId={user?.id}
            action={(row) =>
              row.user.id !== user?.id && (
                <button
                  onClick={() =>
                    confirm(`Vols deixar de ser amic de ${row.user.name}?`) &&
                    act(social.removeFriend(row.user.id), 'Amic eliminat')
                  }
                  aria-label={`Elimina ${row.user.name}`}
                  className="text-stone-400 hover:text-red-700"
                >
                  ×
                </button>
              )
            }
          />
        )}
      </section>

      {data.outgoing.length > 0 && (
        <Requests
          title="Sol·licituds enviades"
          requests={data.outgoing}
          actions={(r) => (
            <Button
              variant="ghost"
              onClick={() => act(social.removeRequest(r.id), 'Sol·licitud cancel·lada')}
            >
              Cancel·la
            </Button>
          )}
        />
      )}
    </>
  );
}

function AddFriend({ onAdded }: { onAdded: () => Promise<void> }) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { status } = await social.addFriend(name);
      toast(status === 'accepted' ? 'Ara sou amics!' : 'Sol·licitud enviada!');
      setName('');
      await onAdded();
    } catch (err) {
      setError((err as Error).message);
    }
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-stone-200 bg-white p-4">
      <label htmlFor="friend-name" className="mb-2 block font-semibold">
        Afegeix un amic
      </label>
      <div className="flex gap-2">
        <input
          id="friend-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom d’usuari"
          autoComplete="off"
          className={INPUT}
        />
        <Button type="submit" disabled={!name.trim() || busy}>
          Afegeix
        </Button>
      </div>
      {error && (
        <div className="mt-2">
          <ErrorBox>{error}</ErrorBox>
        </div>
      )}
    </form>
  );
}

function Requests({
  title,
  requests,
  actions,
}: {
  title: string;
  requests: FriendRequest[];
  actions: (r: FriendRequest) => ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      <ul className="divide-y divide-stone-100 rounded-2xl border border-stone-200 bg-white">
        {requests.map((r) => (
          <li key={r.id} className="animate-rise flex items-center gap-3 px-4 py-3">
            <span className="flex-1 font-semibold">{r.user.name}</span>
            {actions(r)}
          </li>
        ))}
      </ul>
    </section>
  );
}
