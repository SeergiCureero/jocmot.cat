import { Link } from 'react-router';
import GameIcon from '@/components/game/GameIcon';
import { HELP } from '@/games/help';
import { GAMES } from '@/games/registry';

export default function HowToPlayPage() {
  return (
    <div className="mx-auto max-w-2xl py-6">
      <h1 className="mb-1 text-2xl font-bold">Com es juga</h1>
      <p className="mb-5 text-sm text-stone-600">
        Cada dia, a mitjanit, surten puzles nous. Són els mateixos per a tothom.
      </p>
      <div className="space-y-4">
        {GAMES.map((g) => {
          const Help = HELP[g.id];
          return (
            <section
              key={g.id}
              id={g.slug}
              className="rounded-2xl border border-stone-200 bg-white p-5"
            >
              <h2 className="mb-4 flex items-center gap-3 text-lg font-bold">
                <GameIcon id={g.id} size={40} />
                {g.name}
              </h2>
              <div className="text-sm">
                <Help />
              </div>
              <Link
                to={`/${g.slug}`}
                className="bg-brand-700 hover:bg-brand-900 mt-4 inline-flex min-h-11 items-center rounded-full px-5 text-sm font-semibold text-white"
              >
                Juga a {g.name}
              </Link>
            </section>
          );
        })}
      </div>
    </div>
  );
}
