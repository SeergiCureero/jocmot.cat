import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { DonateButton } from '@/components/layout/Menu';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { FEATURES } from '@/config/site';
import { useAuth } from '@/features/auth/AuthContext';
import { StatsRow } from '@/features/progress/StatsGrid';
import { computeStats } from '@/features/progress/stats';
import {
  localProgress,
  localProgressRecords,
  syncLocalProgress,
} from '@/features/progress/useGameProgress';
import PointsEarned from '@/features/social/PointsEarned';
import { getTodayPuzzleNumber } from '@/games/puzzles';
import { GAMES } from '@/games/registry';
import { headline, summarize } from '@/games/summary';
import type { GameMeta } from '@/games/types';
import { shareText } from '@/lib/share';
import type { ProgressRecord } from '@/services/backend';
import Countdown from './Countdown';
import GameIcon from './GameIcon';

interface Props {
  open: boolean;
  onClose: () => void;
  meta: GameMeta;
  puzzleNumber: number;
  result: { title: string; body?: ReactNode; shareText: string; won?: boolean };
  /** Mode prova de l'editor: sense compartir ni estadístiques. */
  preview?: boolean;
}

/** Finestra final, igual a tots els jocs. */
export default function ResultModal({ open, onClose, meta, puzzleNumber, result, preview }: Props) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [records, setRecords] = useState<ProgressRecord[] | null>(null);
  const isToday = puzzleNumber === getTodayPuzzleNumber();

  // Estadístiques: primer les del dispositiu; amb compte, les de tots els dispositius.
  const userId = user?.id;
  useEffect(() => {
    if (!open || preview) return;
    setRecords(localProgressRecords());
    if (!userId) return;
    let cancelled = false;
    syncLocalProgress()
      .then((r) => !cancelled && setRecords(r))
      .catch(() => {
        /* ens quedem amb les locals */
      });
    return () => {
      cancelled = true;
    };
  }, [open, preview, userId]);

  const record = preview ? null : localProgress(meta.id, puzzleNumber);
  const title = record ? headline(meta.id, record.status, record.state) : result.title;
  const score = record
    ? summarize(meta.id, puzzleNumber, record.status, record.state).result
    : null;

  // Proper joc d'avui que encara no s'ha acabat.
  const today = getTodayPuzzleNumber();
  const next = GAMES.find((g) => {
    if (g.id === meta.id) return false;
    const r = localProgress(g.id, today);
    return !r || r.status === 'playing';
  });

  async function share() {
    const outcome = await shareText(result.shareText);
    if (outcome === 'copied') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const stats = records ? computeStats(records.filter((r) => r.gameId === meta.id)) : null;

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="-mt-2 flex items-center gap-2 text-base text-stone-700">
        <GameIcon id={meta.id} size={28} />
        <span>
          <strong>
            {meta.name} #{puzzleNumber}
          </strong>
          {score && <> · {score}</>}
        </span>
      </div>
      {result.body && <div className="text-stone-700">{result.body}</div>}

      {!preview && (
        <>
          {FEATURES.social && user && <PointsEarned game={meta.id} puzzle={puzzleNumber} />}

          <pre
            aria-label="Resultat per compartir"
            className="rounded-xl bg-stone-100 px-4 py-3 font-sans text-sm leading-relaxed whitespace-pre-wrap text-stone-800"
          >
            {result.shareText}
          </pre>
          <Button className="min-h-12 w-full text-base" onClick={share}>
            {copied ? 'Copiat!' : 'Compartir'}
          </Button>
          <p className="sr-only" aria-live="polite">
            {copied ? 'Resultat copiat' : ''}
          </p>

          {next ? (
            <Link
              to={`/${next.slug}`}
              onClick={onClose}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-stone-300 bg-white px-5 text-sm font-semibold text-stone-800 transition-colors hover:bg-stone-100"
            >
              <GameIcon id={next.id} size={24} />
              Següent joc: {next.name}
            </Link>
          ) : (
            <Link
              to="/"
              onClick={onClose}
              className="flex min-h-12 w-full items-center justify-center rounded-full border border-stone-300 bg-white px-5 text-sm font-semibold text-stone-800 transition-colors hover:bg-stone-100"
            >
              Tornar a l’inici
            </Link>
          )}

          <div className="border-t border-stone-200 pt-3">
            <StatsRow stats={stats} />
          </div>

          {isToday && <Countdown label="Proper puzle en" />}

          {FEATURES.accounts && !user && result.won && (
            <p className="text-center text-sm text-stone-600">
              <Link
                to="/compte/registre"
                onClick={onClose}
                className="underline underline-offset-2"
              >
                Crea un compte
              </Link>{' '}
              per no perdre la ratxa si canvies de mòbil.
            </p>
          )}

          <div className="flex justify-center pt-1">
            <DonateButton className="border-stone-200 text-stone-600" />
          </div>
        </>
      )}
    </Modal>
  );
}
