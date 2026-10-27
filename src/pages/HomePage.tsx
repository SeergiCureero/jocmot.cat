import { Link } from 'react-router';
import AdSlot from '@/components/ads/AdSlot';
import { FEATURES, SITE } from '@/config/site';
import { GAMES } from '@/games/registry';
import { getTodayPuzzleNumber } from '@/games/puzzles';

export default function HomePage() {
  const today = getTodayPuzzleNumber();

  return (
    <div className="py-8">
      <AdSlot id="home-top" className="mb-6" />

      <section className="animate-rise mb-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{SITE.name}</h1>
        <p className="mt-2 text-stone-600">{SITE.tagline}. Puzles nous cada dia.</p>
      </section>

      <ul className="grid gap-4 sm:grid-cols-2">
        {GAMES.map((game, i) => (
          <li
            key={game.id}
            className="animate-rise"
            style={{ animationDelay: `${100 + i * 70}ms` }}
          >
            <Link
              to={`/${game.slug}`}
              className="group flex h-full items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5 transition duration-200 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98]"
            >
              <span
                className={`grid size-14 shrink-0 place-items-center rounded-xl text-2xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 ${game.theme.bg}`}
              >
                {game.icon}
              </span>
              <span>
                <span className="block text-lg font-bold group-hover:underline">{game.name}</span>
                <span className="block text-sm text-stone-600">{game.tagline}</span>
                <span className="mt-1 block text-xs text-stone-400">Puzle #{today}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {FEATURES.archive && today > 1 && (
        <p className="animate-rise mt-6 text-center" style={{ animationDelay: '400ms' }}>
          <Link to="/arxiu" className="text-brand-700 text-sm font-semibold hover:underline">
            📅 T’has perdut algun dia? Juga els puzles anteriors →
          </Link>
        </p>
      )}

      <AdSlot id="home-bottom" className="mt-8" />
    </div>
  );
}
