import { useState } from 'react';
import GameShell from '@/components/game/GameShell';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { SITE } from '@/config/site';
import { useGameProgress } from '@/features/progress/useGameProgress';
import { cn } from '@/lib/cn';
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

export default function ConnexionsGame({ puzzleNumber, date, puzzle: groupPuzzle, preview }: GameProps) {
  const puzzle = (groupPuzzle as ConnexionsPuzzle | undefined) ?? pickByNumber(PUZZLES, puzzleNumber);
  const { state, update, status } = useGameProgress({
    gameId: meta.id,
    puzzleId: puzzleNumber,
    initialState,
    getStatus, persist: !preview,
  });
  const [order, setOrder] = useState(() => initialOrder(puzzle, puzzleNumber));
  const [selected, setSelected] = useState<string[]>([]);
  const [shake, setShake] = useState(false);
  const toast = useToast();

  const remaining = order.filter((w) => !state.solved.includes(groupOf(puzzle, w)));
  // Si s'ha perdut, es revelen els grups que faltaven.
  const shownGroups =
    status === 'lost'
      ? [...state.solved, ...puzzle.groups.map((_, i) => i).filter((i) => !state.solved.includes(i))]
      : state.solved;

  const toggle = (word: string) => {
    if (status !== 'playing') return;
    setSelected((sel) =>
      sel.includes(word) ? sel.filter((w) => w !== word) : sel.length < GROUP_SIZE ? [...sel, word] : sel,
    );
  };

  const submit = () => {
    const { state: next, feedback } = submitSelection(state, puzzle, selected);
    if (feedback === 'already-guessed') return toast('Ja ho has provat');
    if (feedback === 'incomplete') return;
    update(() => next);
    if (feedback === 'correct') setSelected([]);
    else {
      if (feedback === 'one-away') toast('Només en falla una!');
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  };

  const result =
    status === 'playing'
      ? null
      : {
          title: status === 'won' ? 'Perfecte!' : 'La propera vegada!',
          body: status === 'won' ? `Errors: ${state.mistakes}/${MAX_MISTAKES}` : undefined,
          shareText: buildShareText(puzzleNumber, state, puzzle, `${SITE.url}/${meta.slug}`),
        };

  return (
    <GameShell preview={preview} meta={meta} puzzleNumber={puzzleNumber} date={date} result={result} help={<Help />}>
      <p className="mb-3 text-sm text-stone-600">Fes quatre grups de quatre!</p>

      <div className="grid w-full gap-2">
        {shownGroups.map((i) => (
          <GroupBar key={i} group={puzzle.groups[i]} />
        ))}

        {status === 'playing' && (
          <div className="grid grid-cols-4 gap-2">
            {remaining.map((word) => {
              const isSelected = selected.includes(word);
              return (
                <button
                  key={word}
                  onClick={() => toggle(word)}
                  aria-pressed={isSelected}
                  className={cn(
                    'flex h-16 items-center justify-center rounded-lg px-1 text-center text-[11px] font-bold uppercase transition sm:h-20 sm:text-sm',
                    isSelected ? 'bg-stone-700 text-white' : 'bg-stone-200 hover:bg-stone-300',
                    isSelected && shake && 'animate-shake',
                  )}
                >
                  {word}
                </button>
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
              <span key={i} className={cn('size-3 rounded-full', i < MAX_MISTAKES - state.mistakes ? 'bg-stone-600' : 'bg-stone-200')} />
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="secondary" onClick={() => setOrder((o) => shuffle(o))}>
              Barreja
            </Button>
            <Button variant="secondary" onClick={() => setSelected([])} disabled={!selected.length}>
              Desselecciona
            </Button>
            <Button onClick={submit} disabled={selected.length !== GROUP_SIZE}>
              Envia
            </Button>
          </div>
        </>
      )}
    </GameShell>
  );
}

function Help() {
  return (
    <>
      <p>Troba grups de quatre paraules que tinguin alguna cosa en comú.</p>
      <p>Selecciona quatre paraules i prem <strong>Envia</strong>. Pots fallar {MAX_MISTAKES} vegades.</p>
      <p>Cada puzle té una sola solució. Compte amb les paraules que semblen encaixar en més d’un grup!</p>
      <p>Dificultat: 🟨 fàcil · 🟩 · 🟦 · 🟪 difícil.</p>
    </>
  );
}
