import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { FEATURES, SITE } from '@/config/site';
import PointsEarned from '@/features/social/PointsEarned';
import { getPuzzleDate, getTodayPuzzleNumber } from '@/games/puzzles';
import { GAMES } from '@/games/registry';
import type { GameMeta } from '@/games/types';
import { startOfDayInTimeZone } from '@/lib/date';
import Icon from '@/components/ui/Icon';

interface Props {
  open: boolean;
  onClose: () => void;
  meta: GameMeta;
  puzzleNumber: number;
  result: { title: string; body?: ReactNode; shareText: string };
  /** Mode prova de l'editor: sense compartir. */
  preview?: boolean;
}

const canNativeShare = () =>
  typeof navigator !== 'undefined' &&
  Boolean(navigator.share) &&
  matchMedia('(pointer: coarse)').matches;

/** Finestra final (com la del NYT): resultat, text per compartir, compte enrere i altres jocs. */
export default function ResultModal({ open, onClose, meta, puzzleNumber, result, preview }: Props) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(result.shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast('No s’ha pogut copiar');
    }
  }

  async function share() {
    try {
      await navigator.share({ text: result.shareText });
    } catch {
      /* cancel·lat per l'usuari */
    }
  }

  const others = GAMES.filter((g) => g.id !== meta.id);

  return (
    <Modal open={open} onClose={onClose} title={result.title}>
      {result.body && <div className="text-base text-stone-700">{result.body}</div>}

      {!preview && (
        <>
          {FEATURES.social && <PointsEarned game={meta.id} puzzle={puzzleNumber} />}
          <pre className="rounded-xl bg-stone-100 p-4 font-sans text-sm leading-relaxed whitespace-pre-wrap text-stone-800 select-all">
            {result.shareText}
          </pre>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={copy}>
              {copied ? 'Copiat! ✓' : 'Copia el resultat'}
            </Button>
            {canNativeShare() && (
              <Button variant="secondary" className="flex-1" onClick={share}>
                Comparteix
              </Button>
            )}
          </div>
          {puzzleNumber === getTodayPuzzleNumber() && <Countdown />}
        </>
      )}

      <div className="border-t border-stone-200 pt-3">
        <p className="mb-2 text-xs font-semibold text-stone-500 uppercase">Juga també</p>
        <div className="flex flex-wrap gap-2">
          {others.map((g) => (
            <Link
              key={g.id}
              to={`/${g.slug}`}
              onClick={onClose}
              className="rounded-full bg-stone-100 px-3 py-1.5 text-sm font-semibold transition-colors hover:bg-stone-200"
            >
              <Icon name={g.icon} /> {g.name}
            </Link>
          ))}
        </div>
      </div>
    </Modal>
  );
}

/** Temps que falta per al puzle de demà (mitjanit a Madrid). */
function Countdown() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const next = startOfDayInTimeZone(getPuzzleDate(getTodayPuzzleNumber() + 1), SITE.timeZone);
  const left = Math.max(0, Math.floor((next.getTime() - now) / 1000));
  const pad = (n: number) => String(n).padStart(2, '0');
  const time = `${Math.floor(left / 3600)}:${pad(Math.floor(left / 60) % 60)}:${pad(left % 60)}`;

  return (
    <p className="text-center text-sm text-stone-600">
      Proper puzle en <strong className="font-mono tabular-nums">{time}</strong>
    </p>
  );
}
