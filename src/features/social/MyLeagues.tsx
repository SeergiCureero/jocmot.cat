import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '@/features/auth/AuthContext';
import { cn } from '@/lib/cn';
import { hasUnread, social, type LeagueSummary } from './api';

/** Les teves lligues a la portada: posició, líder i l'últim missatge del xat, a un toc. */
export default function MyLeagues() {
  const { user } = useAuth();
  const [leagues, setLeagues] = useState<LeagueSummary[] | null>(null);
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    social.leagues().then(
      (d) => !cancelled && setLeagues(d.leagues),
      () => !cancelled && setLeagues([]),
    );
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (!user) return null;

  return (
    <section aria-labelledby="lligues-titol" className="mt-8">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 id="lligues-titol" className="text-lg font-bold">
          Les teves lligues
        </h2>
        <Link
          to="/lligues"
          className="text-brand-700 inline-flex min-h-11 items-center px-2 text-sm font-semibold hover:underline"
        >
          Totes →
        </Link>
      </div>

      {!leagues ? (
        <div className="h-[4.5rem] animate-pulse rounded-2xl bg-stone-100" aria-hidden />
      ) : leagues.length === 0 ? (
        <Link
          to="/lligues"
          className="flex min-h-[4.5rem] items-center gap-4 rounded-2xl border border-dashed border-stone-300 bg-white p-4 text-sm text-stone-700 hover:border-stone-400"
        >
          <span aria-hidden className="text-2xl">
            🏆
          </span>
          <span>
            <strong className="block text-stone-900">Competeix amb els amics</strong>
            Crea una lliga o entra-hi amb un codi.
          </span>
        </Link>
      ) : (
        <ul className="grid gap-2">
          {leagues.map((l) => {
            const unread = hasUnread(l, user.id);
            return (
              <li key={l.id}>
                <Link
                  to={`/lligues/${l.id}`}
                  className="flex min-h-[4.5rem] items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3 transition hover:border-stone-300 hover:shadow-md active:scale-[0.98]"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-amber-100 text-xl">
                    🏆
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate font-bold">{l.name}</span>
                      {unread && (
                        <span className="bg-brand-700 shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold text-white">
                          💬 Nou
                        </span>
                      )}
                    </span>
                    <span
                      className={cn(
                        'block truncate text-sm',
                        unread ? 'font-medium text-stone-800' : 'text-stone-600',
                      )}
                    >
                      {l.lastMessage ? (
                        <>
                          {l.lastMessage.user.id === user.id ? 'Tu' : l.lastMessage.user.name}:{' '}
                          {l.lastMessage.text}
                        </>
                      ) : l.leader ? (
                        <>Lidera {l.leader.name}</>
                      ) : (
                        <>
                          {l.members} {l.members === 1 ? 'membre' : 'membres'}
                        </>
                      )}
                    </span>
                  </span>
                  {l.position && (
                    <span className="shrink-0 text-right">
                      <span className="block text-lg font-bold tabular-nums">{l.position}a</span>
                      <span className="block text-xs text-stone-600">posició</span>
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
