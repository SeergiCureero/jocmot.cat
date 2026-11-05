import { Link } from 'react-router';
import DonateButton from '@/components/ui/DonateButton';
import { SITE } from '@/config/site';

const LINKS = [
  { to: '/sobre', label: 'Sobre nosaltres' },
  { to: '/legal#privadesa', label: 'Privadesa' },
  { to: '/legal', label: 'Avís legal' },
];

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-stone-200 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center text-sm text-stone-600">
      <nav
        aria-label="Peu de pàgina"
        className="mb-2 flex flex-wrap items-center justify-center gap-x-2"
      >
        {LINKS.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="inline-flex min-h-11 items-center px-2 hover:text-stone-900 hover:underline"
          >
            {l.label}
          </Link>
        ))}
        <a
          href={`mailto:${SITE.email}`}
          className="inline-flex min-h-11 items-center px-2 hover:text-stone-900 hover:underline"
        >
          Contacte
        </a>
        <DonateButton className="mx-2" />
      </nav>
      <p className="text-xs">
        © {new Date().getFullYear()} {SITE.name} · {SITE.tagline}
      </p>
    </footer>
  );
}
