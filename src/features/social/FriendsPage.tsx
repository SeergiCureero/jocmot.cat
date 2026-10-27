import { useEffect, useState, type KeyboardEvent, type ReactNode } from 'react';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { INPUT } from '@/components/ui/styles';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/features/auth/AuthContext';
import { cn } from '@/lib/cn';
import { formatMonth, social, type FriendRequest, type UserMatch } from './api';
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

const RELATION: Record<NonNullable<UserMatch['relation']>, string> = {
  friend: 'Ja sou amics',
  sent: 'Sol·licitud enviada',
  received: 'T’ha enviat una sol·licitud',
};

/** Cercador d'usuaris amb desplegable: es filtra mentre escrius i s'afegeix amb un clic. */
function AddFriend({ onAdded }: { onAdded: () => Promise<void> }) {
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState<UserMatch[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cerca mentre s'escriu (amb una petita espera per no fer una petició per lletra).
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setMatches([]);
      return;
    }
    let cancelled = false;
    const id = setTimeout(() => {
      social.searchUsers(q).then(
        ({ users }) => {
          if (cancelled) return;
          setMatches(users);
          setActive(0);
          setOpen(true);
        },
        () => !cancelled && setMatches([]),
      );
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [query]);

  async function add(user: UserMatch) {
    if (user.relation === 'friend' || user.relation === 'sent') return;
    setBusy(true);
    setError(null);
    try {
      const { status } = await social.addFriend(user.name);
      toast(status === 'accepted' ? `Ara ets amic de ${user.name}!` : 'Sol·licitud enviada!');
      setQuery('');
      setOpen(false);
      await onAdded();
    } catch (err) {
      setError((err as Error).message);
    }
    setBusy(false);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!open || !matches.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const step = e.key === 'ArrowDown' ? 1 : -1;
      setActive((i) => (i + step + matches.length) % matches.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      void add(matches[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  const showList = open && query.trim().length >= 2;

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4">
      <label htmlFor="friend-name" className="mb-2 block font-semibold">
        Afegeix un amic
      </label>
      <div className="relative">
        <input
          id="friend-name"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setError(null);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={onKeyDown}
          placeholder="Escriu el seu nom d’usuari…"
          autoComplete="off"
          role="combobox"
          aria-expanded={showList}
          aria-controls="friend-matches"
          aria-autocomplete="list"
          disabled={busy}
          className={INPUT}
        />
        {showList && (
          <ul
            id="friend-matches"
            role="listbox"
            className="animate-fade-in absolute inset-x-0 top-full z-20 mt-1 max-h-72 overflow-auto rounded-xl border border-stone-200 bg-white py-1 shadow-lg"
          >
            {matches.length ? (
              matches.map((u, i) => {
                const blocked = u.relation === 'friend' || u.relation === 'sent';
                return (
                  <li
                    key={u.id}
                    role="option"
                    aria-selected={i === active}
                    aria-disabled={blocked}
                    onMouseEnter={() => setActive(i)}
                    // mousedown (i no click) perquè no es tanqui abans pel blur del camp.
                    onMouseDown={(e) => {
                      e.preventDefault();
                      void add(u);
                    }}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 px-3 py-2',
                      i === active && 'bg-stone-100',
                      blocked && 'cursor-default',
                    )}
                  >
                    <span className="bg-brand-100 text-brand-900 grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold uppercase">
                      {u.name[0]}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{u.name}</span>
                      {u.relation && (
                        <span className="block text-xs text-stone-500">{RELATION[u.relation]}</span>
                      )}
                    </span>
                    {!blocked && (
                      <span className="text-brand-700 text-sm font-semibold">
                        {u.relation === 'received' ? 'Accepta' : '+ Afegeix'}
                      </span>
                    )}
                  </li>
                );
              })
            ) : (
              <li className="px-3 py-2 text-sm text-stone-500">Cap usuari amb aquest nom</li>
            )}
          </ul>
        )}
      </div>
      {error && (
        <div className="mt-2">
          <ErrorBox>{error}</ErrorBox>
        </div>
      )}
    </div>
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
