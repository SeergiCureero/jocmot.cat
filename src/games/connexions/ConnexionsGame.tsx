import { useState, type KeyboardEvent } from 'react';
import GameShell from '@/components/game/GameShell';
import Button from '@/components/ui/Button';
import { useGameMessage } from '@/components/game/GameMessage';
import { SITE } from '@/config/site';
import { useGameProgress } from '@/features/progress/useGameProgress';
import { cn } from '@/lib/cn';
import { prefersReducedMotion } from '@/lib/dom';
import { shuffle } from '@/lib/random';
import { pickByNumber } from '../puzzles';
import type { GameProps } from '../types';
import type { ConnexionsPuzzle } from './types';
import GroupBar from './components/GroupBar';
import { PUZZLES } from './data/puzzles';
import {
  buildShareText,
  getStatus,
  GROUP_SIZE,
  groupOf,
  initialOrder,
  initialState,
  MAX_MISTAKES,
  submitSelection,
} from './logic';
import { meta } from './meta';

export default function ConnexionsGame({
  puzzleNumber,
  date,
  puzzle: groupPuzzle,
  preview,
}: GameProps) {
  const puzzle =
    (groupPuzzle as ConnexionsPuzzle | undefined) ?? pickByNumber(PUZZLES, puzzleNumber);
  const { state, update, status } = useGameProgress({
    gameId: meta.id,
    puzzleId: puzzleNumber,
    initialState,
    getStatus,
    persist: !preview,
  });
  const [order, setOrder] = useState(() => initialOrder(puzzle, puzzleNumber));
  const [selected, setSelected] = useState<string[]>([]);
  const [shake, setShake] = useState(false);
  // Encert: les fitxes fan un saltet abans de convertir-se en la franja del grup.
  const [jumping, setJumping] = useState(false);
  // Canvia en barrejar, perquè les fitxes tornin a entrar animades.
  const [shuffles, setShuffles] = useState(0);
  const { message, say } = useGameMessage();

  const remaining = order.filter((w) => !state.solved.includes(groupOf(puzzle, w)));
  // Si s'ha perdut, es revelen els grups que faltaven.
  const shownGroups =
    status === 'lost'
      ? [
          ...state.solved,
          ...puzzle.groups.map((_, i) => i).filter((i) => !state.solved.includes(i)),
        ]
      : state.solved;

  const toggle = (word: string) => {
    if (status !== 'playing' || jumping) return;
    setSelected((sel) =>
      sel.includes(word)
        ? sel.filter((w) => w !== word)
        : sel.length < GROUP_SIZE
          ? [...sel, word]
          : sel,
    );
  };

  const submit = () => {
    const { state: next, feedback } = submitSelection(state, puzzle, selected);
    if (feedback === 'already-guessed') return say('Aquesta combinació ja l’has provada', 'info');
    if (feedback === 'incomplete') return;
    if (feedback === 'correct') {
      say(next.status === 'won' ? 'Perfecte! Tots els grups!' : 'Molt bé!', 'ok');
      setJumping(true);
      setTimeout(
        () => {
          update(() => next);
          setSelected([]);
          setJumping(false);
        },
        prefersReducedMotion() ? 0 : 100 * GROUP_SIZE + 350,
      );
    } else {
      update(() => next);
      if (next.status === 'lost') say('No queden més intents', 'error');
      else if (feedback === 'one-away') say('Gairebé! Només en falla una', 'error');
      else say('No és un grup', 'error');
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  };

  /** Teclat: fletxes per moure's entre paraules, Espai per triar i Enter per enviar quan n'hi ha 4. */
  const onTileKey = (e: KeyboardEvent<HTMLButtonElement>, n: number) => {
    const cols = 4;
    const moves: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -cols,
      ArrowDown: cols,
    };
    if (e.key in moves) {
      e.preventDefault();
      const target = n + moves[e.key];
      if (target >= 0 && target < remaining.length)
        e.currentTarget.parentElement?.parentElement
          ?.querySelector<HTMLButtonElement>(`[data-tile="${target}"]`)
          ?.focus();
    } else if (e.key === 'Enter' && selected.length === GROUP_SIZE) {
      e.preventDefault();
      submit();
    }
  };

  const result =
    status === 'playing'
      ? null
      : {
          title: status === 'won' ? 'Perfecte!' : 'La propera vegada!',
          body: status === 'won' ? `Errors: ${state.mistakes}/${MAX_MISTAKES}` : undefined,
          shareText: buildShareText(puzzleNumber, state, puzzle, `${SITE.url}/${meta.slug}`),
          won: status === 'won',
        };

  return (
    <GameShell
      preview={preview}
      meta={meta}
      puzzleNumber={puzzleNumber}
      date={date}
      result={result}
      message={message}
    >
      <div className="grid w-full gap-2">
        {shownGroups.map((i, n) => (
          <GroupBar
            key={i}
            group={puzzle.groups[i]}
            // En perdre, els grups que faltaven apareixen d'un en un.
            delayMs={Math.max(0, n - state.solved.length) * 350}
          />
        ))}

        {status === 'playing' && (
          <div key={shuffles} className="grid grid-cols-4 gap-2">
            {remaining.map((word, n) => {
              const isSelected = selected.includes(word);
              return (
                // L'entrada va a l'embolcall perquè no es repeteixi quan la fitxa tremola o salta.
                <div
                  key={word}
                  className="animate-tile-in"
                  style={{ animationDelay: `${n * 20}ms` }}
                >
                  <button
                    type="button"
                    data-tile={n}
                    onClick={() => toggle(word)}
                    onKeyDown={(e) => onTileKey(e, n)}
                    aria-pressed={isSelected}
                    style={
                      jumping && isSelected
                        ? { animationDelay: `${selected.indexOf(word) * 100}ms` }
                        : undefined
                    }
                    className={cn(
                      'flex h-16 w-full items-center justify-center rounded-lg px-1 text-center text-[11px] font-bold uppercase transition duration-150 active:scale-95 sm:h-20 sm:text-sm',
                      isSelected ? 'bg-stone-700 text-white' : 'bg-stone-200 hover:bg-stone-300',
                      isSelected && shake && 'animate-shake',
                      isSelected && jumping && 'animate-jump',
                    )}
                  >
                    {word}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {status === 'playing' && (
        <>
          <div className="mt-4 flex items-center gap-2 text-sm text-stone-600">
            Errors restants:
            {Array.from({ length: MAX_MISTAKES }, (_, i) => (
              <span
                key={i}
                className={cn(
                  'size-3 rounded-full transition duration-500',
                  i < MAX_MISTAKES - state.mistakes ? 'bg-stone-600' : 'scale-50 bg-stone-200',
                )}
              />
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setOrder((o) => shuffle(o));
                setShuffles((n) => n + 1);
              }}
            >
              Barreja
            </Button>
            <Button variant="secondary" onClick={() => setSelected([])} disabled={!selected.length}>
              Desselecciona
            </Button>
            <Button onClick={submit} disabled={selected.length !== GROUP_SIZE || jumping}>
              Envia
            </Button>
          </div>
        </>
      )}
    </GameShell>
  );
}
