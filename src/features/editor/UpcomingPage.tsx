import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import GameIcon from '@/components/game/GameIcon';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/features/auth/AuthContext';
import { getPuzzleDate, getTodayPuzzleNumber } from '@/games/puzzles';
import { GAMES } from '@/games/registry';
import { loadRepository, type Repository } from '@/games/repository';
import type { GameId } from '@/games/types';
import { cn } from '@/lib/cn';
import { backend } from '@/services/backend';
import PreviewPlayer from './PreviewPlayer';

type Verdict = 'ok' | 'change';
interface Feedback {
  game: GameId;
  number: number;
  verdict: Verdict;
  note: string;
  user: { id: string; name: string };
}

const REPO_GAMES: GameId[] = ['paraula', 'connexions', 'fils', 'mini'];

const dayLabel = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat('ca', { weekday: 'long', day: 'numeric', month: 'long' }).format(
    new Date(Date.UTC(y, m - 1, d, 12)),
  );
};

/**
 * Els puzles que encara no han sortit: de quin dia és cadascun, de què va, el pots provar i dir si
 * «mola» o «cal canviar-lo». Els editors es veuen les valoracions entre ells.
 */
export default function UpcomingPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [repos, setRepos] = useState<Record<string, Repository> | null>(null);
  const [grouped, setGrouped] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [onlyChange, setOnlyChange] = useState(false);
  const [preview, setPreview] = useState<{ game: GameId; number: number } | null>(null);

  const today = getTodayPuzzleNumber();

  useEffect(() => {
    let cancelled = false;
    Promise.all(REPO_GAMES.map((g) => loadRepository(g))).then(
      (list) => !cancelled && setRepos(Object.fromEntries(REPO_GAMES.map((g, i) => [g, list[i]]))),
      (e: Error) => !cancelled && setError(e.message),
    );
    // Puzles del grup ja programats: tenen prioritat sobre els de reserva.
    backend.listPuzzles().then(
      (all) =>
        !cancelled &&
        setGrouped(
          new Set(
            all
              .filter((p) => p.status === 'published' && p.number)
              .map((p) => `${p.game}:${p.number}`),
          ),
        ),
      () => {},
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const last = repos ? Math.max(...REPO_GAMES.map((g) => repos[g].uniqueUntil)) : today;
  const first = today + 1;

  const loadFeedback = useCallback(
    () =>
      backend
        .call<{ items: Feedback[] }>(`/admin/proxims-valoracions?des=${first}&fins=${last}`)
        .then(
          (d) => setFeedback(d.items),
          (e: Error) => setError(e.message),
        ),
    [first, last],
  );
  useEffect(() => {
    if (repos) void loadFeedback();
  }, [repos, loadFeedback]);

  const fbFor = (game: GameId, n: number) =>
    feedback.filter((f) => f.game === game && f.number === n);

  async function vote(game: GameId, number: number, verdict: Verdict | '', note?: string) {
    const mine = fbFor(game, number).find((f) => f.user.id === user?.id);
    try {
      await backend.call('/admin/proxims-valoracions', {
        method: 'POST',
        body: { game, number, verdict, note: note ?? mine?.note ?? '' },
      });
      await loadFeedback();
    } catch (e) {
      toast((e as Error).message);
    }
  }

  const days = useMemo(
    () => (repos ? Array.from({ length: Math.max(0, last - today) }, (_, i) => first + i) : []),
    [repos, last, today, first],
  );

  const change = (n: number) =>
    REPO_GAMES.some((g) => fbFor(g, n).some((f) => f.verdict === 'change'));
  const shown = onlyChange ? days.filter(change) : days;

  return (
    <div className="mx-auto max-w-2xl py-8">
      <Link to="/editor" className="text-brand-700 text-sm hover:underline">
        ← Editor
      </Link>
      <h1 className="mt-2 text-2xl font-bold">Propers puzles</h1>
      <p className="mt-1 mb-4 text-sm text-stone-600">
        Tot el que encara no ha sortit, dia a dia. Prova’l i digues si mola o si cal canviar-lo. Els
        puzles que programa el grup (editor) tenen prioritat sobre els de reserva.
      </p>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {!repos && !error && <Spinner />}

      {repos && (
        <>
          <ul className="mb-4 grid gap-1.5 rounded-2xl border border-stone-200 bg-white p-4 text-sm">
            {REPO_GAMES.map((g) => {
              const until = repos[g].uniqueUntil;
              const meta = GAMES.find((x) => x.id === g)!;
              return (
                <li key={g} className="flex items-center gap-2">
                  <GameIcon id={g} size={22} className="rounded-md" />
                  <span className="font-semibold">{meta.name}</span>
                  <span className="text-stone-600">
                    sense repetir fins al {dayLabel(getPuzzleDate(until))} (#{until})
                  </span>
                </li>
              );
            })}
          </ul>

          <label className="mb-4 flex min-h-11 cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={onlyChange}
              onChange={(e) => setOnlyChange(e.target.checked)}
              className="accent-brand-700 size-5"
            />
            Només els dies amb algun «cal canviar»
          </label>

          <ol className="space-y-4">
            {shown.map((n) => (
              <li key={n} className="rounded-2xl border border-stone-200 bg-white">
                <h2 className="border-b border-stone-100 px-4 py-2 text-sm font-bold first-letter:uppercase">
                  {dayLabel(getPuzzleDate(n))}{' '}
                  <span className="font-normal text-stone-500">#{n}</span>
                </h2>
                <ul className="divide-y divide-stone-100">
                  {REPO_GAMES.map((g) => (
                    <Row
                      key={g}
                      game={g}
                      n={n}
                      repo={repos[g]}
                      isGroup={grouped.has(`${g}:${n}`)}
                      feedback={fbFor(g, n)}
                      meId={user?.id}
                      onPreview={() => setPreview({ game: g, number: n })}
                      onVote={(v, note) => vote(g, n, v, note)}
                    />
                  ))}
                </ul>
              </li>
            ))}
            {!shown.length && (
              <p className="rounded-2xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-600">
                No hi ha cap dia amb «cal canviar».
              </p>
            )}
          </ol>
        </>
      )}

      <Modal
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
        title={
          preview
            ? `Prova: ${GAMES.find((g) => g.id === preview.game)?.name} #${preview.number}`
            : ''
        }
      >
        {preview && (
          <PreviewPlayer
            game={preview.game}
            number={preview.number}
            puzzle={repos?.[preview.game].pick(preview.number)}
          />
        )}
      </Modal>
    </div>
  );
}

function Row({
  game,
  n,
  repo,
  isGroup,
  feedback,
  meId,
  onPreview,
  onVote,
}: {
  game: GameId;
  n: number;
  repo: Repository;
  isGroup: boolean;
  feedback: Feedback[];
  meId?: string;
  onPreview: () => void;
  onVote: (verdict: Verdict | '', note?: string) => void;
}) {
  const meta = GAMES.find((g) => g.id === game)!;
  const lines = useMemo(() => repo.summarize(repo.pick(n)), [repo, n]);
  const mine = feedback.find((f) => f.user.id === meId);
  const [note, setNote] = useState(mine?.note ?? '');
  const themed = repo.themed(n);

  const btn = (v: Verdict, text: string, on: string) => (
    <button
      type="button"
      aria-pressed={mine?.verdict === v}
      onClick={() => onVote(mine?.verdict === v ? '' : v, note)}
      className={cn(
        'min-h-11 rounded-full border px-4 text-sm font-semibold transition-colors',
        mine?.verdict === v ? on : 'border-stone-300 bg-white hover:bg-stone-100',
      )}
    >
      {text}
    </button>
  );

  return (
    <li className="space-y-2 px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <GameIcon id={game} size={24} className="rounded-md" />
        <span className="font-semibold">{meta.name}</span>
        {themed && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
            Temàtic
          </span>
        )}
        {isGroup && (
          <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-900">
            Del grup (substitueix el de reserva)
          </span>
        )}
      </div>
      <div className="space-y-0.5 text-sm text-stone-700">
        {lines.map((l, i) => (
          <p key={i} className="break-words">
            {l}
          </p>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onPreview}
          className="min-h-11 rounded-full bg-stone-900 px-4 text-sm font-semibold text-white hover:bg-stone-700"
        >
          Prova
        </button>
        {btn('ok', 'Mola', 'border-green-700 bg-green-100 text-green-900')}
        {btn('change', 'Cal canviar', 'border-red-700 bg-red-100 text-red-900')}
      </div>
      {mine?.verdict && (
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={() => note !== (mine.note ?? '') && onVote(mine.verdict, note)}
          maxLength={500}
          aria-label="Nota"
          placeholder="Per què? (opcional)"
          className="focus:border-brand-600 min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm outline-none"
        />
      )}
      {feedback
        .filter((f) => f.user.id !== meId)
        .map((f) => (
          <p
            key={f.user.id}
            className={cn('text-xs', f.verdict === 'change' ? 'text-red-800' : 'text-green-800')}
          >
            <strong>{f.user.name}</strong>: {f.verdict === 'ok' ? 'mola' : 'cal canviar'}
            {f.note && ` — ${f.note}`}
          </p>
        ))}
    </li>
  );
}
