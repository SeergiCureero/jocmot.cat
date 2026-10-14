import { useState, type ReactNode } from 'react';
import AdSlot from '@/components/ads/AdSlot';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import type { GameMeta } from '@/games/types';
import { formatDateCa } from '@/lib/date';
import { shareText } from '@/lib/share';
import { storage } from '@/lib/storage';

interface Props {
  meta: GameMeta;
  puzzleNumber: number;
  date: string;
  /** Contingut del modal "Com es juga". */
  help: ReactNode;
  /** Si hi ha resultat, es mostra el panell final amb el botó de compartir. */
  result?: { title: string; body?: ReactNode; shareText: string } | null;
  /** Accions extra a la capçalera (p. ex. cronòmetre). */
  headerExtra?: ReactNode;
  children: ReactNode;
}

/** Marc comú de tots els jocs: capçalera, ajuda, resultat i compartir. */
export default function GameShell({ meta, puzzleNumber, date, help, result, headerExtra, children }: Props) {
  const helpKey = `help-seen:${meta.id}`;
  const [helpOpen, setHelpOpen] = useState(() => !storage.get<boolean>(helpKey));
  const toast = useToast();

  const closeHelp = () => {
    storage.set(helpKey, true);
    setHelpOpen(false);
  };

  async function handleShare() {
    if (!result) return;
    const outcome = await shareText(result.shareText);
    if (outcome === 'copied') toast('Resultat copiat!');
    if (outcome === 'failed') toast('No s’ha pogut compartir');
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center py-4">
      <div className="mb-4 flex w-full items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">
            <span className="mr-1">{meta.icon}</span> {meta.name}{' '}
            <span className="text-base font-medium text-stone-500">#{puzzleNumber}</span>
          </h1>
          <p className="text-xs text-stone-500">{formatDateCa(date)}</p>
        </div>
        <div className="flex items-center gap-2">
          {headerExtra}
          <Button variant="ghost" onClick={() => setHelpOpen(true)} aria-label="Com es juga">
            ?
          </Button>
        </div>
      </div>

      {children}

      {result && (
        <section className="mt-6 w-full rounded-2xl border border-stone-200 bg-white p-5 text-center shadow-sm">
          <h2 className="text-lg font-bold">{result.title}</h2>
          {result.body && <div className="mt-2 text-sm text-stone-600">{result.body}</div>}
          <Button className="mt-4" onClick={handleShare}>
            Comparteix
          </Button>
        </section>
      )}

      <AdSlot id="game-bottom" className="mt-8 w-full" />

      <Modal open={helpOpen} onClose={closeHelp} title={`Com es juga a ${meta.name}`}>
        {help}
      </Modal>
    </div>
  );
}
