import { useEffect, useRef, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router';
import GameIcon from '@/components/game/GameIcon';
import { CloseIcon } from '@/components/icons';
import { FEATURES, SITE } from '@/config/site';
import { useAuth } from '@/features/auth/AuthContext';
import { GAMES } from '@/games/registry';
import { ICON_BUTTON as iconButton } from '@/components/ui/styles';

const row =
  'flex min-h-12 items-center gap-3 rounded-xl px-3 py-2 font-medium text-stone-800 transition-colors hover:bg-stone-100 active:bg-stone-200';

/** Menú lateral (un <dialog>: el focus hi queda dins i es tanca amb Esc). */
export default function Menu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const { user } = useAuth();
  const { pathname } = useLocation();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    // El focus va a la finestra (no al primer botó): així no surt marcat el botó de tancar.
    dialog.setAttribute('autofocus', '');
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Si es navega (p. ex. amb un enllaç del menú), es tanca.
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => closeRef.current(), [pathname]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-label="Menú"
      className="open:animate-menu-in backdrop:animate-fade-in fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-[min(88vw,22rem)] bg-white p-0 shadow-xl outline-none backdrop:bg-black/40"
    >
      <div className="flex h-full flex-col overflow-y-auto pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex h-14 shrink-0 items-center justify-between pr-2 pl-5">
          <p className="font-bold">Menú</p>
          <button type="button" onClick={onClose} className={iconButton} aria-label="Tanca el menú">
            <CloseIcon />
          </button>
        </div>

        <nav aria-label="Jocs" className="px-2">
          <ul>
            {GAMES.map((g) => (
              <li key={g.id}>
                <Link to={`/${g.slug}`} className={row}>
                  <GameIcon id={g.id} size={36} className="rounded-[9px]" />
                  {g.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <hr className="mx-5 my-2 border-stone-200" />

        <nav aria-label="Més" className="px-2">
          <ul>
            <Item to="/estadistiques">Estadístiques</Item>
            <Item to="/configuracio">Configuració</Item>
            <Item to="/com-es-juga">Com es juga</Item>
            <li>
              <a href={`mailto:${SITE.email}`} className={row}>
                Contacte
              </a>
            </li>
          </ul>
        </nav>

        {(FEATURES.archive || FEATURES.social || FEATURES.accounts) && (
          <>
            <hr className="mx-5 my-2 border-stone-200" />
            <nav aria-label="Compte i lligues" className="px-2">
              <ul>
                {FEATURES.archive && <Item to="/arxiu">Arxiu de puzles</Item>}
                {FEATURES.social && <Item to="/lligues">Lligues</Item>}
                {FEATURES.social && <Item to="/amics">Amics</Item>}
                {FEATURES.accounts && user && (
                  <Item to="/editor">{user.editor ? 'Editor' : 'Crea un puzle'}</Item>
                )}
                {FEATURES.accounts && (
                  <Item to={user ? '/compte' : '/compte/entrar'}>
                    {user ? `El meu compte (${user.username})` : 'Entra o crea un compte'}
                  </Item>
                )}
              </ul>
            </nav>
          </>
        )}

        {SITE.donateUrl && (
          <div className="mt-auto px-5 pt-4">
            <DonateButton />
          </div>
        )}
      </div>
    </dialog>
  );
}

function Item({ to, children }: { to: string; children: ReactNode }) {
  return (
    <li>
      <Link to={to} className={row}>
        {children}
      </Link>
    </li>
  );
}

/** Botó de donatius (discret: vora, sense color de fons). */
export function DonateButton({ className }: { className?: string }) {
  if (!SITE.donateUrl) return null;
  return (
    <a
      href={SITE.donateUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex min-h-11 items-center justify-center gap-2 rounded-full border border-stone-300 px-5 text-sm font-semibold text-stone-800 transition-colors hover:bg-stone-100 ${className ?? ''}`}
    >
      ☕ Fes un donatiu
    </a>
  );
}
