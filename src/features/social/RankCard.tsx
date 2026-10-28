import { Link } from 'react-router';
import { social } from './api';
import { StreakBadge, useLoad } from './ui';
import Icon from '@/components/ui/Icon';
import { rankIcon } from './PointsHelp';

/** Rang, punts i ratxa de l'usuari, amb el progrés cap al rang següent (per al perfil). */
export default function RankCard() {
  const { data: p } = useLoad(() => social.profile(), []);
  if (!p) return <div className="mb-8 h-36 animate-pulse rounded-2xl bg-stone-100" />;

  const { rank } = p;
  const progress = rank.next ? (p.total - rank.min) / (rank.next.min - rank.min) : 1;

  return (
    <section className="animate-rise mb-8 rounded-2xl border border-stone-200 bg-white p-5">
      <div className="flex items-center gap-4">
        <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-amber-100 text-4xl">
          <Icon name={rankIcon(rank.name)} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-stone-500 uppercase">El teu rang</p>
          <p className="text-xl font-bold">{rank.name}</p>
          <p className="text-sm text-stone-600">
            {p.total} punts en total
            {p.streak > 0 && (
              <>
                {' · '}
                <StreakBadge days={p.streak} />
              </>
            )}
          </p>
        </div>
      </div>
      {rank.next && (
        <div className="mt-4">
          <div className="h-2 overflow-hidden rounded-full bg-stone-100">
            <div
              className="h-full rounded-full bg-amber-400 transition-[width] duration-700"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-stone-500">
            {rank.next.min - p.total} punts per arribar a <Icon name={rankIcon(rank.next.name)} />{' '}
            {rank.next.name}
          </p>
        </div>
      )}
      <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3 text-sm">
        <span>
          Aquest mes: <strong>{p.monthPoints} punts</strong>
          {!p.playedToday && p.streak > 0 && (
            <span className="ml-2 text-orange-600">Juga avui per no perdre la ratxa!</span>
          )}
        </span>
        <Link to="/lligues" className="text-brand-700 font-semibold hover:underline">
          Lligues <Icon name="fletxa-dreta" />
        </Link>
      </div>
    </section>
  );
}
