import { Link, NavLink } from 'react-router';
import { FEATURES } from '@/config/site';
import { useAuth } from '@/features/auth/AuthContext';
import { GAMES } from '@/games/registry';
import { cn } from '@/lib/cn';

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-4">
        <Link to="/" className="text-lg font-extrabold tracking-tight">
          jocmot<span className="text-brand-700">.cat</span>
        </Link>

        <nav className="hidden flex-1 items-center gap-1 sm:flex" aria-label="Jocs">
          {GAMES.map((game) => (
            <NavLink
              key={game.id}
              to={`/${game.slug}`}
              className={({ isActive }) =>
                cn('rounded-full px-3 py-1 text-sm font-medium', isActive ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100')
              }
            >
              {game.name}
            </NavLink>
          ))}
        </nav>

        {FEATURES.accounts && (
          <div className="ml-auto flex items-center gap-2">
            {user?.editor && (
              <NavLink
                to="/editor"
                className={({ isActive }) =>
                  cn('rounded-full px-3 py-1 text-sm font-medium', isActive ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100')
                }
              >
                ✏️ Editor
              </NavLink>
            )}
            <Link
              to={user ? '/compte' : '/compte/entrar'}
              className="rounded-full border border-stone-300 px-3 py-1 text-sm font-medium hover:bg-stone-100"
            >
              {user ? user.username : 'Entra'}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
