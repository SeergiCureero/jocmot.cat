import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import GameIcon from '@/components/game/GameIcon';
import Spinner from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/features/auth/AuthContext';
import { GAMES } from '@/games/registry';
import type { GameId } from '@/games/types';
import { cn } from '@/lib/cn';
import { backend } from '@/services/backend';

interface Votes {
  counts: Record<GameId, number>;
  mine: GameId | null;
}

/** Votació: quin és el teu joc preferit? Un vot per compte, que es pot canviar. */
export default function VotePage() {
  const { user } = useAuth();
  const toast = useToast();
  const [votes, setVotes] = useState<Votes | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const userId = user?.id;

  useEffect(() => {
    let cancelled = false;
    backend.call<Votes>('/vots').then(
      (v) => !cancelled && setVotes(v),
      (e: Error) => !cancelled && setError(e.message),
    );
    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function vote(game: GameId) {
    setBusy(true);
    try {
      setVotes(await backend.call<Votes>('/vots', { method: 'POST', body: { game } }));
      toast('Gràcies pel teu vot!');
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const total = votes ? GAMES.reduce((t, g) => t + votes.counts[g.id], 0) : 0;
  const ranked = votes ? [...GAMES].sort((a, b) => votes.counts[b.id] - votes.counts[a.id]) : [];

  return (
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="text-2xl font-bold">Quin joc t’agrada més?</h1>
      <p className="mt-1 mb-6 text-sm text-stone-600">
        Vota el teu preferit: ens ajuda a decidir en quins jocs invertim més temps.
      </p>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
      {!votes && !error && <Spinner />}

      {votes && (
        <ul className="grid gap-3">
          {ranked.map((g) => {
            const n = votes.counts[g.id];
            const mine = votes.mine === g.id;
            return (
              <li
                key={g.id}
                className={cn(
                  'rounded-2xl border bg-white p-4',
                  mine ? 'border-brand-600 ring-brand-100 ring-2' : 'border-stone-200',
                )}
              >
                <div className="flex items-center gap-3">
                  <GameIcon id={g.id} size={44} className="rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{g.name}</p>
                    <p className="text-sm text-stone-600">
                      {n} {n === 1 ? 'vot' : 'vots'}
                      {total > 0 && ` · ${Math.round((n / total) * 100)} %`}
                    </p>
                  </div>
                  {user ? (
                    <button
                      type="button"
                      disabled={busy || mine}
                      onClick={() => vote(g.id)}
                      className={cn(
                        'min-h-11 rounded-full px-5 text-sm font-semibold transition',
                        mine
                          ? 'bg-brand-50 text-brand-700'
                          : 'bg-brand-700 hover:bg-brand-900 text-white enabled:active:scale-95',
                      )}
                    >
                      {mine ? 'El teu vot' : 'Voto aquest'}
                    </button>
                  ) : null}
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-100" aria-hidden>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: total ? `${(n / total) * 100}%` : 0,
                      background: g.theme.darkHex,
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {!user && votes && (
        <p className="mt-5 text-center text-sm text-stone-600">
          Per votar cal un compte.{' '}
          <Link
            to="/compte/registre?seguent=%2Fvota"
            className="text-brand-700 font-semibold hover:underline"
          >
            Crea’n un
          </Link>{' '}
          o{' '}
          <Link
            to="/compte/entrar?seguent=%2Fvota"
            className="text-brand-700 font-semibold hover:underline"
          >
            entra
          </Link>
          .
        </p>
      )}
    </div>
  );
}
