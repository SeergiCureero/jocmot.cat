import { Link } from 'react-router';
import { SITE } from '@/config/site';

const LINKS = [
  { to: '/sobre', label: 'Sobre nosaltres' },
  { to: '/legal#privadesa', label: 'Privadesa' },
  { to: '/legal', label: 'Avís legal' },
];

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-stone-200 py-6 text-center text-xs text-stone-500">
      <nav
        aria-label="Peu de pàgina"
        className="mb-2 flex flex-wrap justify-center gap-x-4 gap-y-1"
      >
        {LINKS.map((l) => (
          <Link key={l.to} to={l.to} className="hover:text-stone-800 hover:underline">
            {l.label}
          </Link>
        ))}
        <a href={`mailto:${SITE.email}`} className="hover:text-stone-800 hover:underline">
          Contacte
        </a>
      </nav>
      © {new Date().getFullYear()} {SITE.name} · {SITE.tagline}
    </footer>
  );
}
