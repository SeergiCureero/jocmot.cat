import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import AdSlot from '@/components/ads/AdSlot';
import { BackIcon, HelpIcon } from '@/components/icons';
import Button from '@/components/ui/Button';
import { ICON_BUTTON } from '@/components/ui/styles';
import Confetti from '@/components/ui/Confetti';
import Modal from '@/components/ui/Modal';
import GameIcon from './GameIcon';
import { GameMessageLine, type GameMessageState } from './GameMessage';
import ResultModal from './ResultModal';
import { FEATURES } from '@/config/site';
import { HELP } from '@/games/help';
import { getTodayPuzzleNumber } from '@/games/puzzles';
import { saveProgressHint } from '@/games/summary';
import type { GameMeta } from '@/games/types';
import { formatDateCa } from '@/lib/date';
import { storage } from '@/lib/storage';

interface Props {
  meta: GameMeta;
  puzzleNumber: number;
  date: string;
  /** Avís actual (useGameMessage): es mostra a sobre del tauler, en un espai reservat. */
  message?: GameMessageState | null;
  /** Què es mostra a la línia dels avisos quan no n'hi ha cap (p. ex. la paraula de Fils). */
  messageFallback?: ReactNode;
  /** Progrés de 0 a 1, per a la portada (només cal si no es pot treure de l'estat, com a Fils). */
  progress?: number;
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
  message = null,
  messageFallback,
  progress,
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

  useEffect(() => {
    if (!preview && progress !== undefined) saveProgressHint(meta.id, puzzleNumber, progress);
  }, [preview, progress, meta.id, puzzleNumber]);

  const Help = HELP[meta.id];
  const closeHelp = () => {
    storage.set(helpKey, true);
    setHelpOpen(false);
  };

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center pt-2 pb-4">
      <div className="flex w-full items-center gap-1">
        {!preview && (
          <Link to="/" className={`${ICON_BUTTON} -ml-3`} aria-label="Torna a l’inici">
            <BackIcon />
          </Link>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="flex items-center gap-2 text-lg leading-tight font-bold">
            <GameIcon id={meta.id} size={28} />
            {meta.name}
            <span className="text-sm font-medium text-stone-600">
              {preview ? '· prova' : `#${puzzleNumber}`}
            </span>
          </h1>
          {!preview && (
            <p className="truncate text-xs text-stone-600">
              {formatDateCa(date)}
              {FEATURES.archive && (
                <>
                  {' · '}
                  <Link
                    to={`/arxiu?joc=${meta.slug}`}
                    className="underline-offset-2 hover:text-stone-900 hover:underline"
                  >
                    Arxiu
                  </Link>
                </>
              )}
            </p>
          )}
        </div>
        {headerExtra}
        <button
          type="button"
          className={`${ICON_BUTTON} -mr-2`}
          onClick={() => setHelpOpen(true)}
          aria-label="Com es juga"
        >
          <HelpIcon />
        </button>
      </div>

      <GameMessageLine message={message} fallback={messageFallback} />

      {!preview && puzzleNumber !== getTodayPuzzleNumber() && (
        <p className="animate-fade-in mb-4 w-full rounded-lg bg-stone-100 px-3 py-2 text-center text-sm text-stone-600">
          Estàs jugant un puzle de l’arxiu.{' '}
          <Link to={`/${meta.slug}`} className="text-brand-700 font-semibold hover:underline">
            Juga el d’avui →
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
        <Help />
        <Button className="mt-2 w-full" onClick={closeHelp}>
          Som-hi!
        </Button>
      </Modal>
    </div>
  );
}
