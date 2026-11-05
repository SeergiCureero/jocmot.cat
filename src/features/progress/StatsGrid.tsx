import { Link } from 'react-router';
import GameIcon from '@/components/game/GameIcon';
import { GAMES } from '@/games/registry';
import { cn } from '@/lib/cn';
import type { ProgressRecord } from '@/services/backend';
import { computeDistribution, computeStats, type Distribution, type GameStats } from './stats';

/** Estadístiques de cada joc. `records === null` = carregant (es reserva l'espai). */
export default function StatsGrid({ records }: { records: ProgressRecord[] | null }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {GAMES.map((game) => {
        const mine = (records ?? []).filter((r) => r.gameId === game.id);
        const stats = computeStats(mine);
        const distribution = computeDistribution(game.id, mine);
        return (
          <section key={game.id} className="rounded-xl border border-stone-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 font-semibold">
                <GameIcon id={game.id} size={32} />
                {game.name}
              </h2>
              <Link
                to={`/${game.slug}`}
                className="text-brand-700 -mr-2 inline-flex min-h-11 items-center px-2 text-sm font-semibold hover:underline"
              >
                Juga →
              </Link>
            </div>
            <StatsRow stats={records === null ? null : stats} />
            {distribution && stats.won > 0 && <DistributionChart {...distribution} />}
          </section>
        );
      })}
    </div>
  );
}

/** Partides, % encerts, ratxa i ratxa màxima. `null` = carregant. */
export function StatsRow({ stats, className }: { stats: GameStats | null; className?: string }) {
  const items: [string, number | undefined][] = [
    ['Partides', stats?.played],
    ['% encerts', stats?.winRate],
    ['Ratxa', stats?.currentStreak],
    ['Màxima', stats?.maxStreak],
  ];
  return (
    <dl className={cn('grid grid-cols-4 text-center text-sm', className)}>
      {items.map(([label, value]) => (
        <div key={label} className="flex flex-col-reverse">
          <dt className="text-xs text-stone-600">{label}</dt>
          <dd className="text-xl font-bold tabular-nums">
            {value ?? (
              <span className="inline-block h-6 w-8 animate-pulse rounded bg-stone-200 align-middle" />
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Barres horitzontals com les del Wordle. */
function DistributionChart({ title, bars, extra }: Distribution) {
  const max = Math.max(1, ...bars.map((b) => b.count));
  return (
    <div className="mt-4 text-sm">
      <p className="mb-1.5 text-xs font-semibold text-stone-600 uppercase">{title}</p>
      <ul className="space-y-1">
        {bars.map((b) => (
          <li key={b.label} className="flex items-center gap-2">
            <span className="w-12 shrink-0 text-right text-xs text-stone-600">{b.label}</span>
            <span
              className={cn(
                'animate-rise min-w-6 rounded px-1.5 py-0.5 text-right text-xs font-bold',
                b.count ? 'bg-brand-700 text-white' : 'bg-stone-200 text-stone-700',
              )}
              style={{ width: `${(b.count / max) * 100}%` }}
            >
              {b.count}
            </span>
          </li>
        ))}
      </ul>
      {extra.length > 0 && (
        <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
          {extra.map((e) => (
            <div key={e.label} className="flex gap-1.5">
              <dt className="text-stone-600">{e.label}:</dt>
              <dd className="font-semibold">{e.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
