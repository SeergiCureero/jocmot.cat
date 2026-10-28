import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import AdSlot from '@/components/ads/AdSlot';
import Button from '@/components/ui/Button';
import Confetti from '@/components/ui/Confetti';
import Modal from '@/components/ui/Modal';
import ResultModal from './ResultModal';
import { FEATURES } from '@/config/site';
import { getTodayPuzzleNumber } from '@/games/puzzles';
import type { GameMeta } from '@/games/types';
import { formatDateCa } from '@/lib/date';
import { storage } from '@/lib/storage';
import Icon from '@/components/ui/Icon';

interface Props {
  meta: GameMeta;
  puzzleNumber: number;
  date: string;
  /** Contingut del modal "Com es juga". */
  help: ReactNode;
  /** Si hi ha resultat, es mostra el panell final amb el botó de compartir. */
  result?: { title: string; body?: ReactNode; shareText: string; won?: boolean } | null;
  /** Accions extra a la capçalera (p. ex. cronòmetre). */
  headerExtra?: ReactNode;
  /** Mode prova de l'editor: sense número, data ni botó de compartir. */
  preview?: boolean;
  children: ReactNode;
}

/** Marc comú de tots els jocs: capçalera, ajuda, resultat i compartir. */
export default function GameShell({
  meta,
  puzzleNumber,
  date,
  help,
  result,
  headerExtra,
  preview,
  children,
}: Props) {
  const helpKey = `help-seen:${meta.id}`;
  const [helpOpen, setHelpOpen] = useState(() => !storage.get<boolean>(helpKey));
  // Només celebrem si la partida s'ha acabat ara, no en tornar a obrir un puzle ja resolt.
  const startedPlaying = useRef(!result);
  const [resultOpen, setResultOpen] = useState(false);
  const finished = Boolean(result);

  // En acabar, la finestra del resultat s'obre sola quan les animacions ja s'han vist.
  useEffect(() => {
    if (!finished || !startedPlaying.current) return;
    const id = setTimeout(() => setResultOpen(true), 1200);
    return () => clearTimeout(id);
  }, [finished]);

  const closeHelp = () => {
    storage.set(helpKey, true);
    setHelpOpen(false);
  };

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center py-4">
      <div className="mb-4 flex w-full items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">
            <Icon name={meta.icon} className="mr-1" /> {meta.name}{' '}
            <span className="text-base font-medium text-stone-500">
              {preview ? '· prova' : `#${puzzleNumber}`}
            </span>
          </h1>
          {!preview && (
            <p className="text-xs text-stone-500">
              {formatDateCa(date)}
              {FEATURES.archive && (
                <>
                  {' · '}
                  <Link
                    to={`/arxiu?joc=${meta.slug}`}
                    className="hover:text-stone-900 hover:underline"
                  >
                    Arxiu
                  </Link>
                </>
              )}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {headerExtra}
          <Button variant="ghost" onClick={() => setHelpOpen(true)} aria-label="Com es juga">
            ?
          </Button>
        </div>
      </div>

      {!preview && puzzleNumber !== getTodayPuzzleNumber() && (
        <p className="animate-fade-in mb-4 w-full rounded-lg bg-stone-100 px-3 py-2 text-center text-sm text-stone-600">
          Estàs jugant un puzle de l’arxiu.{' '}
          <Link to={`/${meta.slug}`} className="text-brand-700 font-semibold hover:underline">
            Juga el d’avui <Icon name="fletxa-dreta" />
          </Link>
        </p>
      )}

      {children}

      {result && (
        <section className="animate-rise mt-6 w-full rounded-2xl border border-stone-200 bg-white p-5 text-center shadow-sm">
          <h2 className="text-lg font-bold">{result.title}</h2>
          {result.body && <div className="mt-2 text-sm text-stone-600">{result.body}</div>}
          <Button className="mt-4" onClick={() => setResultOpen(true)}>
            {preview ? 'Veure el resultat' : 'Veure i compartir el resultat'}
          </Button>
        </section>
      )}

      {result?.won && startedPlaying.current && <Confetti />}

      {!preview && <AdSlot id="game-bottom" className="mt-8 w-full" />}

      {result && (
        <ResultModal
          open={resultOpen}
          onClose={() => setResultOpen(false)}
          meta={meta}
          puzzleNumber={puzzleNumber}
          result={result}
          preview={preview}
        />
      )}

      <Modal open={helpOpen} onClose={closeHelp} title={`Com es juga a ${meta.name}`}>
        {help}
      </Modal>
    </div>
  );
}
