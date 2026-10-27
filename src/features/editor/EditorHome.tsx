import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import Spinner from '@/components/ui/Spinner';
import { useAuth } from '@/features/auth/AuthContext';
import { DESIGNABLE_GAMES } from '@/games/registry';
import { backend, type PuzzleRecord } from '@/services/backend';
import { drafts } from './drafts';
import { KITS } from './kits';
import { APPROVALS_NEEDED } from './schedule';
import { GameLabel, gameMeta, ROW, Section, statusText } from './ui';

export default function EditorHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [puzzles, setPuzzles] = useState<PuzzleRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const myDrafts = drafts.list();

  useEffect(() => {
    backend.listPuzzles().then(setPuzzles, (e: Error) => setError(e.message));
  }, []);

  const startDraft = (game: (typeof DESIGNABLE_GAMES)[number]) =>
    navigate(`/editor/esborrany/${drafts.create(game, KITS[game].empty()).id}`);

  const now = new Date();
  const proposed = puzzles?.filter((p) => p.status === 'proposed') ?? [];
  const scheduled = (puzzles ?? [])
    .filter((p) => p.status === 'published' && new Date(p.releaseAt!) > now)
    .sort((a, b) => a.releaseAt!.localeCompare(b.releaseAt!));
  const published = (puzzles ?? [])
    .filter((p) => p.status === 'published' && new Date(p.releaseAt!) <= now)
    .sort((a, b) => b.releaseAt!.localeCompare(a.releaseAt!))
    .slice(0, 10);

  return (
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="text-2xl font-bold">Editor de puzles</h1>
      <p className="mt-1 mb-6 text-sm text-stone-600">
        Dissenya, prova i revisa puzles amb el grup. Amb {APPROVALS_NEEDED} aprovacions d’altres
        editors, el puzle es programa sol al següent dia lliure.
      </p>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Nou puzle</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {DESIGNABLE_GAMES.map((game) => {
            const meta = gameMeta(game);
            return (
              <button
                key={game}
                onClick={() => startDraft(game)}
                className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <span
                  className={`grid size-11 shrink-0 place-items-center rounded-xl text-xl ${meta.theme.bg}`}
                >
                  {meta.icon}
                </span>
                <span className="font-bold">{meta.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      <Section
        title="Els meus esborranys"
        empty="Cap esborrany. Els esborranys només es guarden en aquest navegador."
      >
        {myDrafts.map((d) => (
          <li key={d.id}>
            <Link to={`/editor/esborrany/${d.id}`} className={ROW}>
              <GameLabel game={d.game} />
              <span className="text-xs text-stone-500">
                {new Date(d.updatedAt).toLocaleString('ca')}
              </span>
            </Link>
          </li>
        ))}
      </Section>

      {error && <p className="mb-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {!puzzles && !error && <Spinner />}
      {puzzles && (
        <>
          <Section title="Pendents de revisió" empty="No hi ha cap proposta pendent.">
            {proposed.map((p) => {
              const reviewed = p.reviews.some((r) => r.author.id === user!.id);
              const mine = p.author.id === user!.id;
              return (
                <li key={p.id}>
                  <Link to={`/editor/puzle/${p.id}`} className={ROW}>
                    <span className="flex flex-col gap-1">
                      <GameLabel game={p.game} />
                      <span className="text-xs text-stone-500">
                        de {mine ? 'tu' : p.author.username} · {statusText(p)}
                      </span>
                    </span>
                    {!mine && !reviewed && (
                      <span className="bg-brand-100 text-brand-900 rounded-full px-2 py-0.5 text-xs font-semibold">
                        Revisa’l
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </Section>
          <Section title="Programats" empty="Cap puzle programat.">
            {scheduled.map((p) => (
              <li key={p.id}>
                <Link to={`/editor/puzle/${p.id}`} className={ROW}>
                  <GameLabel game={p.game} />
                  <span className="text-right text-xs text-stone-500">
                    {statusText(p)}
                    <br />
                    de {p.author.username}
                  </span>
                </Link>
              </li>
            ))}
          </Section>
          <Section title="Publicats recentment" empty="Encara no se n’ha publicat cap.">
            {published.map((p) => (
              <li key={p.id}>
                <Link to={`/editor/puzle/${p.id}`} className={ROW}>
                  <GameLabel game={p.game} />
                  <span className="text-right text-xs text-stone-500">{statusText(p)}</span>
                </Link>
              </li>
            ))}
          </Section>
        </>
      )}
    </div>
  );
}
