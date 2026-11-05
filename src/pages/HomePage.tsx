import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import AdSlot from '@/components/ads/AdSlot';
import Countdown from '@/components/game/Countdown';
import GameIcon from '@/components/game/GameIcon';
import Button from '@/components/ui/Button';
import { FEATURES, SITE } from '@/config/site';
import { useAuth } from '@/features/auth/AuthContext';
import { dailyStreak } from '@/features/progress/daily';
import { localProgressRecords, syncLocalProgress } from '@/features/progress/useGameProgress';
import { social } from '@/features/social/api';
import { getPuzzleDate, getTodayPuzzleNumber } from '@/games/puzzles';
import { GAMES } from '@/games/registry';
import { summarize, type GameSummary } from '@/games/summary';
import type { GameDefinition } from '@/games/types';
import { cn } from '@/lib/cn';
import { formatWeekdayCa } from '@/lib/date';
import { shareText } from '@/lib/share';
import type { ProgressRecord } from '@/services/backend';

type Status = 'todo' | 'playing' | 'done';
interface Card {
  game: GameDefinition;
  status: Status;
  summary: GameSummary;
}

/** Dades de la portada. Sense compte, tot és local i instantani; amb compte, es porten del servidor. */
function useHomeData() {
  const { user } = useAuth();
  const userId = user?.id;
  const [records, setRecords] = useState<ProgressRecord[] | null>(() =>
    userId ? null : localProgressRecords(),
  );
  const [serverStreak, setServerStreak] = useState<{ streak: number; playedToday: boolean }>();
  const [failed, setFailed] = useState(false);

  const load = useCallback(() => {
    if (!userId) {
      setRecords(localProgressRecords());
      return () => {};
    }
    let cancelled = false;
    setFailed(false);
    setRecords(null);
    syncLocalProgress()
      .then((r) => !cancelled && setRecords(r))
      .catch(() => !cancelled && setFailed(true));
    if (FEATURES.social)
      social
        .profile()
        .then(
          (p) => !cancelled && setServerStreak({ streak: p.streak, playedToday: p.playedToday }),
        )
        .catch(() => {
          /* la ratxa local ja serveix */
        });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => load(), [load]);

  return { records, serverStreak, failed, retry: load, loggedIn: Boolean(userId) };
}

export default function HomePage() {
  const today = getTodayPuzzleNumber();
  const todayDate = getPuzzleDate(today);
  const { records, serverStreak, failed, retry } = useHomeData();

  const cards: Card[] | null = records
    ? GAMES.map((game) => {
        const r = records.find((x) => x.gameId === game.id && x.puzzleId === today);
        const status: Status = !r ? 'todo' : r.status === 'playing' ? 'playing' : 'done';
        return { game, status, summary: r ? summarize(game.id, today, r.status, r.state) : {} };
      })
        // Primer els pendents (en l'ordre de sempre) i al final els fets.
        .sort((a, b) => Number(a.status === 'done') - Number(b.status === 'done'))
    : null;

  const streak = records ? (serverStreak ?? dailyStreak(records, todayDate)) : null;
  const allDone = cards?.every((c) => c.status === 'done') ?? false;

  return (
    <div className="mx-auto max-w-2xl pt-5 pb-8 sm:pt-8">
      <AdSlot id="home-top" className="mb-6" />

      <section className="mb-5 text-center">
        <h1>
          <img
            src="/logos/jocmot-fitxes.svg"
            alt="jocmot.cat"
            width={520}
            height={84}
            className="mx-auto h-auto w-[min(15rem,70vw)] sm:w-80"
          />
        </h1>
        <p className="mt-2 font-semibold text-stone-700">{formatWeekdayCa(todayDate)}</p>
        {/* La línia de la ratxa sempre ocupa el mateix espai (no salta en carregar). */}
        <p className="mt-1 min-h-6 text-sm text-stone-700" aria-live="polite">
          {streak && streak.streak > 0 && (
            <>
              <span aria-hidden>🔥 </span>
              <strong>
                {streak.streak} {streak.streak === 1 ? 'dia seguit' : 'dies seguits'}
              </strong>
              {!streak.playedToday && <> · Juga avui per mantenir-la</>}
            </>
          )}
        </p>
      </section>

      {failed ? (
        <ErrorCard onRetry={retry} />
      ) : (
        <>
          {allDone && cards && <AllDone cards={cards} date={todayDate} />}
          <ul className="grid gap-3 sm:grid-cols-2" aria-busy={!cards}>
            {cards
              ? cards.map((c) => (
                  <li key={c.game.id}>
                    <GameCard card={c} />
                  </li>
                ))
              : GAMES.map((g) => (
                  <li key={g.id}>
                    <SkeletonCard />
                  </li>
                ))}
          </ul>
        </>
      )}

      {FEATURES.archive && today > 1 && (
        <p className="mt-6 text-center">
          <Link
            to="/arxiu"
            className="text-brand-700 inline-flex min-h-11 items-center px-2 text-sm font-semibold hover:underline"
          >
            T’has perdut algun dia? Juga els puzles anteriors →
          </Link>
        </p>
      )}

      <AdSlot id="home-bottom" className="mt-8" />
    </div>
  );
}

const CARD = 'flex min-h-24 items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4';

function GameCard({ card }: { card: Card }) {
  const { game, status, summary } = card;
  return (
    <Link
      to={`/${game.slug}`}
      className={cn(
        CARD,
        'group h-full transition duration-150 hover:border-stone-300 hover:shadow-md active:scale-[0.98]',
        status === 'done' && 'bg-stone-50',
      )}
    >
      <GameIcon id={game.id} size={56} />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className="text-lg font-bold group-hover:underline">{game.name}</span>
          <StatusChip status={status} summary={summary} game={game} />
        </span>
        <span className="block text-sm text-stone-600">{game.tagline}</span>
        {status === 'playing' && summary.progress !== undefined && (
          <ProgressBar value={summary.progress} color={game.theme.darkHex} name={game.name} />
        )}
      </span>
    </Link>
  );
}

function StatusChip({
  status,
  summary,
  game,
}: {
  status: Status;
  summary: GameSummary;
  game: GameDefinition;
}) {
  if (status === 'todo')
    return (
      <span className="shrink-0 rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-semibold text-stone-700">
        Per jugar
      </span>
    );
  if (status === 'playing')
    return (
      <span className="shrink-0 rounded-full border border-stone-300 px-2.5 py-0.5 text-xs font-semibold text-stone-800">
        A mitges
      </span>
    );
  return (
    <span
      className={cn(
        'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold',
        game.theme.bg,
        game.theme.text,
      )}
    >
      Fet ✓{summary.result && <> · {summary.result}</>}
    </span>
  );
}

function ProgressBar({ value, color, name }: { value: number; color: string; name: string }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <span
      role="progressbar"
      aria-label={`Progrés de ${name}`}
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className="mt-2 block h-1.5 overflow-hidden rounded-full bg-stone-200"
    >
      <span
        className="block h-full rounded-full transition-[width] duration-500"
        style={{ width: `${Math.max(pct, 6)}%`, backgroundColor: color }}
      />
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className={cn(CARD, 'animate-pulse')} aria-hidden>
      <span className="size-14 shrink-0 rounded-[14px] bg-stone-200" />
      <span className="flex-1 space-y-2">
        <span className="block h-5 w-28 rounded bg-stone-200" />
        <span className="block h-4 w-full max-w-56 rounded bg-stone-100" />
      </span>
    </div>
  );
}

function ErrorCard({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 text-center" role="alert">
      <p className="font-semibold">Ara no podem carregar les teves partides.</p>
      <p className="mt-1 text-sm text-stone-600">
        Pot ser la connexió. Torna-ho a provar d’aquí a una estona.
      </p>
      <Button className="mt-4" onClick={onRetry}>
        Torna-ho a provar
      </Button>
    </div>
  );
}

/** Tots fets: felicitació, compte enrere i resum del dia per compartir. */
function AllDone({ cards, date }: { cards: Card[]; date: string }) {
  const [copied, setCopied] = useState(false);
  const text = [
    `jocmot.cat · ${formatWeekdayCa(date)}`,
    ...GAMES.map((g) => {
      const c = cards.find((x) => x.game.id === g.id);
      return `${g.icon} ${g.name}: ${c?.summary.result ?? '✓'}`;
    }),
    SITE.url,
  ].join('\n');

  async function share() {
    const result = await shareText(text);
    if (result === 'copied') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <section className="animate-rise mb-4 rounded-2xl border border-stone-200 bg-white p-5 text-center">
      <p className="text-lg font-bold">
        <span aria-hidden>🎉 </span>Avui ja els has fet tots!
      </p>
      <div className="mt-1">
        <Countdown />
      </div>
      <Button className="mt-4 w-full sm:w-auto" onClick={share}>
        {copied ? 'Copiat!' : 'Comparteix el resum del dia'}
      </Button>
      <p className="sr-only" aria-live="polite">
        {copied ? 'Resum copiat' : ''}
      </p>
    </section>
  );
}
