import { useState } from 'react';
import GameShell from '@/components/game/GameShell';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/cn';
import { SITE } from '@/config/site';
import { useGameProgress } from '@/features/progress/useGameProgress';
import { pickByNumber } from '../puzzles';
import type { GameProps } from '../types';
import LetterGrid from './components/LetterGrid';
import { PUZZLES } from './data/puzzles';
import {
  allWords,
  applyHint,
  buildShareText,
  canUseHint,
  getStatus,
  HINT_COST,
  initialState,
  submitPath,
  wordFromPath,
} from './logic';
import { meta } from './meta';
import type { Cell, FilsPuzzle } from './types';

export default function FilsGame({ puzzleNumber, date, puzzle: groupPuzzle, preview }: GameProps) {
  const puzzle = (groupPuzzle as FilsPuzzle | undefined) ?? pickByNumber(PUZZLES, puzzleNumber);
  const { state, update, status } = useGameProgress({
    gameId: meta.id,
    puzzleId: puzzleNumber,
    initialState,
    getStatus,
    persist: !preview,
  });
  const [selection, setSelection] = useState<Cell[]>([]);
  const toast = useToast();
  const total = allWords(puzzle).length;

  const submit = (cells: Cell[]) => {
    const { state: next, feedback } = submitPath(state, puzzle, cells);
    setSelection([]);
    if (feedback === 'too-short') return toast('Massa curta');
    if (feedback === 'already-found') return toast('Ja l’has trobada');
    if (feedback === 'spangram') toast('Fil conductor! 🟡');
    if (feedback === 'not-theme') toast('No és del tema');
    update(() => next);
  };

  const result =
    status === 'won'
      ? {
          title: 'Ho has trobat tot!',
          body: `Pistes utilitzades: ${state.log.filter((l) => l === 'hint').length}`,
          shareText: buildShareText(puzzleNumber, state, puzzle, `${SITE.url}/${meta.slug}`),
          won: true,
        }
      : null;

  return (
    <GameShell
      preview={preview}
      meta={meta}
      puzzleNumber={puzzleNumber}
      date={date}
      result={result}
      help={<Help />}
    >
      <div className="mb-3 w-full max-w-sm rounded-xl bg-sky-100 p-3 text-center">
        <p className="text-xs font-semibold text-sky-800 uppercase">Tema d’avui</p>
        <p className="text-lg font-bold">{puzzle.theme}</p>
      </div>

      <p className="mb-2 h-7 text-xl font-bold tracking-widest">
        {wordFromPath(puzzle, selection)}
      </p>

      <LetterGrid
        puzzle={puzzle}
        found={state.found}
        hintWord={state.hintWord}
        selection={selection}
        onSelectionChange={setSelection}
        onSubmit={submit}
        disabled={status !== 'playing'}
      />

      <div className="mt-4 flex w-full max-w-sm items-center justify-between">
        <p className="text-sm text-stone-600">
          <strong key={state.found.length} className="animate-pop inline-block">
            {state.found.length}
          </strong>{' '}
          de <strong>{total}</strong> paraules
        </p>
        <Button
          variant="secondary"
          disabled={!canUseHint(state)}
          className={cn(canUseHint(state) && 'animate-glow')}
          onClick={() => update((s) => applyHint(s, puzzle))}
        >
          Pista {state.hintProgress}/{HINT_COST}
        </Button>
      </div>
    </GameShell>
  );
}

function Help() {
  return (
    <>
      <p>
        Troba les paraules relacionades amb el tema. Llegeix-les unint lletres veïnes (també en
        diagonal).
      </p>
      <p>
        Arrossega el dit o el ratolí, o toca les lletres una a una i torna a tocar l’última per
        enviar.
      </p>
      <p>
        El <strong>fil conductor</strong> 🟡 descriu el tema i travessa la graella d’un costat a
        l’altre.
      </p>
      <p>Cada {HINT_COST} intents que no siguin del tema desbloquegen una pista 💡.</p>
      <p>Les paraules omplen tota la graella sense encavalcar-se.</p>
    </>
  );
}
