import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import GameIcon from '@/components/game/GameIcon';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { FEATURES } from '@/config/site';
import { useAuth } from '@/features/auth/AuthContext';
import {
  HINT_PENALTY,
  localHintUse,
  mergeUse,
  saveHintUse,
  serverHintUses,
  type HintUse,
} from '@/features/hints/usage';
import { localProgress } from '@/features/progress/useGameProgress';
import { getPuzzleDate, getTodayPuzzleNumber } from '@/games/puzzles';
import { GAMES, isDesignable } from '@/games/registry';
import type { GameDefinition, GameId, Hint, PuzzleHints } from '@/games/types';
import { cn } from '@/lib/cn';
import { formatWeekdayCa } from '@/lib/date';
import { backend } from '@/services/backend';

/** Pistes dels puzles d'avui: es destapen una a una, de la més suau a la solució. */
export default function HintsPage() {
  const today = getTodayPuzzleNumber();
  const { user } = useAuth();
  const [params] = useSearchParams();
  const focus = params.get('joc');
  const [sets, setSets] = useState<Partial<Record<GameId, PuzzleHints | 'error'>>>({});
  const [uses, setUses] = useState<Record<GameId, HintUse>>(
    () =>
      Object.fromEntries(GAMES.map((g) => [g.id, localHintUse(g.id, today)])) as Record<
        GameId,
        HintUse
      >,
  );

  // Pistes de cada joc (el puzle del grup, si n'hi ha, o el del repositori).
  useEffect(() => {
    let cancelled = false;
    for (const game of GAMES) {
      const group = isDesignable(game.id)
        ? backend.getPublishedPuzzle(game.id, today).catch(() => null)
        : Promise.resolve(null);
      Promise.all([game.hints(), group])
        .then(([mod, puzzle]) => mod.buildHints(today, puzzle ?? undefined))
        .then(
          (set) => !cancelled && setSets((s) => ({ ...s, [game.id]: set })),
          () => !cancelled && setSets((s) => ({ ...s, [game.id]: 'error' })),
        );
    }
    return () => {
      cancelled = true;
    };
  }, [today]);

  // Amb compte, el servidor recorda les pistes mirades des d'altres dispositius.
  const userId = user?.id;
  useEffect(() => {
    if (!userId || !FEATURES.social) return;
    let cancelled = false;
    serverHintUses(today).then(
      (server) =>
        !cancelled &&
        setUses((prev) => {
          const next = { ...prev };
          for (const [id, use] of Object.entries(server))
            next[id as GameId] = mergeUse(next[id as GameId], use!);
          return next;
        }),
      () => {
        /* ens quedem amb les del dispositiu */
      },
    );
    return () => {
      cancelled = true;
    };
  }, [userId, today]);

  // Si s'hi arriba des d'un joc, es va directament a les seves pistes.
  const focusGame = GAMES.find((g) => g.slug === focus);
  const ready = Boolean(focusGame && sets[focusGame.id]);
  useEffect(() => {
    if (ready) document.getElementById(`pistes-${focus}`)?.scrollIntoView({ block: 'start' });
  }, [ready, focus]);

  return (
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="text-2xl font-bold">
        <span aria-hidden>💡 </span>Pistes del dia
      </h1>
      <p className="mt-1 text-sm font-semibold text-stone-700">
        {formatWeekdayCa(getPuzzleDate(today))}
      </p>
      <p className="mt-3 mb-6 text-sm text-stone-700">
        T’has encallat? Destapa les pistes una a una, de la més suau a la més clara.
        {FEATURES.social && (
          <>
            {' '}
            Si jugues amb compte, cada pista que mires abans d’acabar el puzle resta {
              HINT_PENALTY
            }{' '}
            punts, i la solució el deixa sense punts.
          </>
        )}
      </p>

      <div className="space-y-4">
        {GAMES.map((game) => (
          <GameHints
            key={game.id}
            game={game}
            puzzle={today}
            set={sets[game.id]}
            use={uses[game.id]}
            highlighted={focus === game.slug}
            onUse={(use) => setUses((u) => ({ ...u, [game.id]: mergeUse(u[game.id], use) }))}
          />
        ))}
      </div>
    </div>
  );
}

function GameHints({
  game,
  puzzle,
  set,
  use,
  highlighted,
  onUse,
}: {
  game: GameDefinition;
  puzzle: number;
  set: PuzzleHints | 'error' | undefined;
  use: HintUse;
  highlighted: boolean;
  onUse: (use: HintUse) => void;
}) {
  const { user } = useAuth();
  const toast = useToast();
  const progress = localProgress(game.id, puzzle);
  const finished = Boolean(progress && progress.status !== 'playing');
  // Les pistes només resten punts amb compte i si el puzle encara no s'ha acabat.
  const costs = FEATURES.social && Boolean(user) && !finished;

  function reveal(next: HintUse, question?: string) {
    if (question && !confirm(question)) return;
    onUse(next);
    saveHintUse(game.id, puzzle, next, Boolean(user)).catch(() =>
      toast('No s’ha pogut desar al servidor, però la pista ja és teva.'),
    );
  }

  return (
    <section
      id={`pistes-${game.slug}`}
      aria-labelledby={`pistes-${game.slug}-titol`}
      className={cn(
        'scroll-mt-20 rounded-2xl border bg-white p-4',
        highlighted ? 'border-stone-400 shadow-md' : 'border-stone-200',
      )}
    >
      <div className="mb-3 flex items-center gap-3">
        <GameIcon id={game.id} size={40} />
        <div className="min-w-0 flex-1">
          <h2 id={`pistes-${game.slug}-titol`} className="text-lg font-bold">
            {game.name} <span className="text-sm font-medium text-stone-600">#{puzzle}</span>
          </h2>
          <p className="text-xs text-stone-600">
            {finished
              ? 'Ja l’has acabat: mirar-ne les pistes no resta punts.'
              : progress
                ? 'A mitges'
                : 'Per jugar'}
          </p>
        </div>
        <Link
          to={`/${game.slug}`}
          className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-stone-300 px-4 text-sm font-semibold text-stone-800 hover:bg-stone-100"
        >
          Juga-hi
        </Link>
      </div>

      {set === 'error' ? (
        <p className="text-sm text-red-800">Ara no podem carregar aquestes pistes.</p>
      ) : !set ? (
        <div className="space-y-2" aria-hidden>
          <div className="h-11 animate-pulse rounded-xl bg-stone-100" />
          <div className="h-11 animate-pulse rounded-xl bg-stone-100" />
        </div>
      ) : (
        <ol className="space-y-2">
          {set.hints.map((hint, i) => (
            <li key={i}>
              {i < use.count || use.solution ? (
                <Revealed hint={hint} label={`Pista ${i + 1}`} />
              ) : i === use.count ? (
                <RevealButton
                  label={`Pista ${i + 1}: ${hint.title}`}
                  cost={costs ? `−${HINT_PENALTY} punts` : null}
                  onClick={() => reveal({ count: i + 1, solution: false })}
                />
              ) : (
                <p className="flex min-h-11 items-center rounded-xl border border-dashed border-stone-300 px-3 text-sm text-stone-600">
                  Pista {i + 1}: {hint.title}
                </p>
              )}
            </li>
          ))}
          <li>
            {use.solution ? (
              <Revealed hint={set.solution} label="Solució" />
            ) : (
              <RevealButton
                label="Mostra la solució"
                cost={costs ? 'Sense punts' : null}
                solution
                onClick={() =>
                  reveal(
                    { count: use.count, solution: true },
                    costs
                      ? `Si mires la solució abans d’acabar ${game.name}, no en guanyaràs punts. Segur?`
                      : `Segur que vols veure la solució de ${game.name}?`,
                  )
                }
              />
            )}
          </li>
        </ol>
      )}
    </section>
  );
}

function RevealButton({
  label,
  cost,
  solution,
  onClick,
}: {
  label: string;
  cost: string | null;
  solution?: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant={solution ? 'ghost' : 'secondary'}
      onClick={onClick}
      className={cn(
        'w-full justify-between rounded-xl text-left',
        solution && 'border border-stone-200',
      )}
    >
      <span>
        <span aria-hidden>{solution ? '🔓 ' : '💡 '}</span>
        {label}
      </span>
      {cost && <span className="shrink-0 text-xs font-medium text-stone-600">{cost}</span>}
    </Button>
  );
}

function Revealed({ hint, label }: { hint: Hint; label: string }) {
  return (
    <div className="animate-rise rounded-xl bg-stone-100 px-3 py-2" aria-live="polite">
      <p className="text-xs font-semibold text-stone-600 uppercase">
        {label} · {hint.title}
      </p>
      <ul className="mt-1 space-y-0.5 text-sm text-stone-900">
        {hint.lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}
