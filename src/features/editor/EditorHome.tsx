import { useEffect, useState, type ReactNode } from 'react';
import GameIcon from '@/components/game/GameIcon';
import { Link, useNavigate } from 'react-router';
import Spinner from '@/components/ui/Spinner';
import { useAuth } from '@/features/auth/AuthContext';
import { cn } from '@/lib/cn';
import { DESIGNABLE_GAMES } from '@/games/registry';
import { backend, type PuzzleRecord } from '@/services/backend';
import { drafts } from './drafts';
import { PuzzleName, RenameButton, wantedText } from './PuzzleInfo';
import { KITS } from './kits';
import { publishIfReady, validApprovals, APPROVALS_NEEDED } from './schedule';
import { GameLabel, gameMeta, ROW, Section, statusText } from './ui';

export default function EditorHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [puzzles, setPuzzles] = useState<PuzzleRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const myDrafts = drafts.list();

  const isEditor = Boolean(user!.editor);

  useEffect(() => {
    (async () => {
      const all = await backend.listPuzzles();
      // Qui no és editor també rep els puzles ja publicats de tothom: només li ensenyem els seus.
      const list = isEditor ? all : all.filter((p) => p.author.id === user!.id);
      if (!isEditor) return setPuzzles(list);
      // Propostes que ja tenen prou aprovacions però no s'han programat (p. ex. si n'han calgut menys).
      const ready = list.filter(
        (p) => p.status === 'proposed' && validApprovals(p).length >= APPROVALS_NEEDED,
      );
      for (const p of ready) await publishIfReady(p.id);
      setPuzzles(ready.length ? await backend.listPuzzles() : list);
    })().catch((e: Error) => setError(e.message));
  }, [isEditor, user]);

  const rename = (id: string, title: string) =>
    setPuzzles((list) => list && list.map((p) => (p.id === id ? { ...p, title } : p)));

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
      <h1 className="text-2xl font-bold">{isEditor ? 'Editor de puzles' : 'Crea un puzle'}</h1>
      {isEditor ? (
        <p className="mt-1 mb-6 text-sm text-stone-600">
          Dissenya, prova i revisa puzles. Qualsevol persona amb compte en pot proposar. Quan un
          editor l’aprova, el puzle es programa sol al següent dia lliure, i des del calendari el
          pots canviar de dia.
        </p>
      ) : (
        <p className="mt-1 mb-6 text-sm text-stone-600">
          Dissenya el teu puzle de Connexions, Fils o Mini, prova’l i proposa’l. L’equip de jocmot
          hi jugarà i, si li agrada, el publicarà perquè hi jugui tothom.
        </p>
      )}
      {isEditor && (
        <Link
          to="/editor/calendari"
          className="mb-8 flex items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          <span>
            <span className="block font-bold">📅 Calendari</span>
            <span className="block text-sm text-stone-600">
              Quin puzle surt cada dia. Canvia’ls de dia.
            </span>
          </span>
          <span className="text-brand-700 font-semibold">→</span>
        </Link>
      )}

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
                <GameIcon id={meta.id} size={44} />
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
          <Section
            title={isEditor ? 'Pendents de revisió' : 'Les meves propostes'}
            empty={isEditor ? 'No hi ha cap proposta pendent.' : 'Encara no n’has proposat cap.'}
          >
            {proposed.map((p) => {
              const reviewed = p.reviews.some((r) => r.author.id === user!.id);
              const mine = p.author.id === user!.id;
              return (
                <PuzzleRow key={p.id} puzzle={p} onRenamed={rename}>
                  <span className="flex min-w-0 flex-col gap-1">
                    <PuzzleHeading puzzle={p} />
                    <span className="text-xs text-stone-500">
                      de {mine ? 'tu' : p.author.username} · {statusText(p)}
                      {p.wantedNumber && <> · {wantedText(p.wantedNumber)}</>}
                    </span>
                  </span>
                  {isEditor && !mine && !reviewed && (
                    <span className="bg-brand-100 text-brand-900 shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold">
                      Revisa’l
                    </span>
                  )}
                </PuzzleRow>
              );
            })}
          </Section>
          <Section
            title={isEditor ? 'Programats' : 'Aprovats (sortiran aviat)'}
            empty="Cap puzle programat."
          >
            {scheduled.map((p) => (
              <PuzzleRow key={p.id} puzzle={p} onRenamed={rename}>
                <span className="flex min-w-0 flex-col gap-1">
                  <PuzzleHeading puzzle={p} />
                  <span className="text-xs text-stone-500">
                    {statusText(p)} · de {p.author.username}
                  </span>
                </span>
              </PuzzleRow>
            ))}
          </Section>
          <Section
            title={isEditor ? 'Publicats recentment' : 'Publicats'}
            empty="Encara no se n’ha publicat cap."
          >
            {published.map((p) => (
              <PuzzleRow key={p.id} puzzle={p} onRenamed={rename}>
                <span className="flex min-w-0 flex-col gap-1">
                  <PuzzleHeading puzzle={p} />
                  <span className="text-xs text-stone-500">{statusText(p)}</span>
                </span>
              </PuzzleRow>
            ))}
          </Section>
        </>
      )}
    </div>
  );
}

/** Fila d'una llista: enllaç al puzle i, al costat, el botó per posar-hi nom. */
function PuzzleRow({
  puzzle,
  onRenamed,
  children,
}: {
  puzzle: PuzzleRecord;
  onRenamed: (id: string, title: string) => void;
  children: ReactNode;
}) {
  return (
    <li className="flex items-center gap-1">
      <Link to={`/editor/puzle/${puzzle.id}`} className={cn(ROW, 'min-w-0 flex-1')}>
        {children}
      </Link>
      <RenameButton puzzle={puzzle} onSaved={(title) => onRenamed(puzzle.id, title)} />
    </li>
  );
}

/** Icona del joc + nom del puzle. */
function PuzzleHeading({ puzzle }: { puzzle: PuzzleRecord }) {
  const meta = gameMeta(puzzle.game);
  return (
    <span className="flex min-w-0 items-center gap-1.5">
      <span title={meta.name}>
        <GameIcon id={meta.id} size={24} />
      </span>
      <span className="truncate">
        <PuzzleName puzzle={puzzle} />
      </span>
    </span>
  );
}
