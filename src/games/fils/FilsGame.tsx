import { useRef, useState } from 'react';
import GameShell from '@/components/game/GameShell';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/cn';
import { isWord } from '@/lib/dictionary';
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
  MIN_WORD,
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
  // Última paraula extra que ha sumat cap a la pista (per animar-la).
  const [bonus, setBonus] = useState<{ id: number; word: string } | null>(null);
  const checking = useRef(false);
  const toast = useToast();
  const total = allWords(puzzle).length;

  const submit = async (cells: Cell[]) => {
    if (checking.current) return;
    const word = wordFromPath(puzzle, cells);
    checking.current = true;
    const inDictionary = cells.length >= MIN_WORD ? await isWord(word) : null;
    checking.current = false;
    const { state: next, feedback } = submitPath(state, puzzle, cells, inDictionary);
    setSelection([]);
    if (feedback === 'too-short') return toast('Massa curta');
    if (feedback === 'already-found') return toast('Ja l’has trobada');
    if (feedback === 'not-a-word') return toast('No és al diccionari');
    if (feedback === 'bonus-repeated') return toast('Aquesta ja l’has comptada');
    if (feedback === 'spangram') toast('Fil conductor! 🟡');
    if (feedback === 'bonus') {
      toast('Aquesta paraula suma cap a la pista');
      setBonus((b) => ({ id: (b?.id ?? 0) + 1, word }));
    }
    update(() => next);
  };

  const result =
    status === 'won'
      ? {
          title: 'Ho has trobat tot!',
          body: `Pistes utilitzades: ${state.log.filter((l) => l === 'hint').length} · Paraules extra: ${state.bonus?.length ?? 0}`,
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

      <div className="relative mt-4 flex w-full max-w-sm items-center justify-between">
        <p className="text-sm text-stone-600">
          <strong key={state.found.length} className="animate-pop inline-block">
            {state.found.length}
          </strong>{' '}
          de <strong>{total}</strong> paraules
        </p>
        {bonus && (
          <span
            key={bonus.id}
            aria-hidden
            onAnimationEnd={() => setBonus(null)}
            className="animate-bonus pointer-events-none absolute right-0 bottom-full mb-2 rounded-xl bg-amber-100 px-3 py-1.5 text-center text-sm font-bold whitespace-nowrap text-amber-900 shadow-md"
          >
            {bonus.word} +1 💡
            <span className="block text-xs font-medium">Suma cap a la pista</span>
          </span>
        )}
        <Button
          variant="secondary"
          disabled={!canUseHint(state)}
          className={cn(canUseHint(state) && 'animate-glow')}
          onClick={() => update((s) => applyHint(s, puzzle))}
        >
          <span key={state.hintProgress} className="animate-pop inline-block">
            Pista {state.hintProgress}/{HINT_COST}
          </span>
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
      <p>
        Les paraules del diccionari que no són del tema també compten: cada {HINT_COST} en
        desbloquegen una pista 💡.
      </p>
      <p>Les paraules omplen tota la graella sense encavalcar-se.</p>
    </>
  );
}
