import { Link } from 'react-router';
import AdSlot from '@/components/ads/AdSlot';
import { SITE } from '@/config/site';
import { GAMES } from '@/games/registry';
import { getTodayPuzzleNumber } from '@/games/puzzles';

export default function HomePage() {
  const today = getTodayPuzzleNumber();

  return (
    <div className="py-8">
      <AdSlot id="home-top" className="mb-6" />

      <section className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{SITE.name}</h1>
        <p className="mt-2 text-stone-600">{SITE.tagline}. Puzles nous cada dia.</p>
      </section>

      <ul className="grid gap-4 sm:grid-cols-2">
        {GAMES.map((game) => (
          <li key={game.id}>
            <Link
              to={`/${game.slug}`}
              className="group flex h-full items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <span className={`grid size-14 shrink-0 place-items-center rounded-xl text-2xl ${game.theme.bg}`}>
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

      <AdSlot id="home-bottom" className="mt-8" />
    </div>
  );
}
