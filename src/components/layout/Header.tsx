import { useState } from 'react';
import { Link } from 'react-router';
import { ChartIcon, MenuIcon } from '@/components/icons';
import { ICON_BUTTON as iconButton } from '@/components/ui/styles';
import Menu from './Menu';

/**
 * Capçalera fixa: logo (portada) a l'esquerra; estadístiques i menú a la dreta.
 * 56 px d'alçada més la zona segura de l'iPhone (la "notch").
 */
export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 pr-[max(0.5rem,env(safe-area-inset-right))] pl-[max(1rem,env(safe-area-inset-left))]">
        <Link
          to="/"
          className="-ml-2 flex h-11 items-center rounded-lg px-2"
          aria-label="jocmot.cat, inici"
        >
          <img
            src="/logos/jocmot-text.svg"
            alt=""
            width={113}
            height={29}
            className="h-[29px] w-auto"
          />
        </Link>

        <div className="ml-auto flex items-center gap-1">
          <Link to="/estadistiques" className={iconButton} aria-label="Estadístiques">
            <ChartIcon />
          </Link>
          <button
            type="button"
            className={iconButton}
            aria-label="Menú"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <MenuIcon />
          </button>
        </div>
      </div>
      <Menu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
