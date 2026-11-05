import { useEffect, useRef, useState } from 'react';
import GameShell from '@/components/game/GameShell';
import Button from '@/components/ui/Button';
import { useGameMessage } from '@/components/game/GameMessage';
import { cn } from '@/lib/cn';
import { isModalOpen, isTypingInField } from '@/lib/dom';
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
import { bestPath, pathsFor } from './typing';

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
  const { message, say } = useGameMessage();
  // Lletres escrites amb el teclat físic (la selecció és el camí que les forma).
  const [typed, setTyped] = useState('');
  const total = allWords(puzzle).length;

  const submit = async (cells: Cell[]) => {
    if (checking.current) return;
    const word = wordFromPath(puzzle, cells);
    checking.current = true;
    const inDictionary = cells.length >= MIN_WORD ? await isWord(word) : null;
    checking.current = false;
    const { state: next, feedback } = submitPath(state, puzzle, cells, inDictionary);
    setSelection([]);
    setTyped('');
    if (feedback === 'too-short')
      return say(`Ha de tenir ${MIN_WORD} lletres com a mínim`, 'error');
    if (feedback === 'already-found') return say('Aquesta ja l’has trobada', 'info');
    if (feedback === 'not-a-word') return say('Aquesta paraula no és al diccionari', 'error');
    if (feedback === 'bonus-repeated') return say('Aquesta ja l’has comptada', 'info');
    if (feedback === 'spangram') say('Has trobat el fil conductor!', 'ok');
    else if (feedback === 'theme')
      say(next.status === 'won' ? 'Ho has trobat tot!' : 'Molt bé!', 'ok');
    if (feedback === 'bonus') {
      say('No és del tema, però suma cap a la pista', 'info');
      setBonus((b) => ({ id: (b?.id ?? 0) + 1, word }));
    }
    update(() => next);
  };

  // Teclat físic: escriure la paraula, Enter per enviar, Retrocés per esborrar i Esc per deixar-ho.
  const usedCells = allWords(puzzle)
    .filter((w) => state.found.includes(w.word))
    .flatMap((w) => w.path);
  const keyState = useRef({ typed, selection, submit, usedCells, say });
  keyState.current = { typed, selection, submit, usedCells, say };
  useEffect(() => {
    if (status !== 'playing') return;
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || isModalOpen() || isTypingInField(e)) return;
      const k = keyState.current;
      if (e.key === 'Enter') {
        if (!k.selection.length) return;
        e.preventDefault();
        k.submit(k.selection);
      } else if (e.key === 'Escape') {
        setTyped('');
        setSelection([]);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        const next = k.typed.slice(0, -1);
        setTyped(next);
        setSelection(bestPath(pathsFor(puzzle, next, k.usedCells), allWords(puzzle)) ?? []);
      } else if (/^[a-zç]$/i.test(e.key)) {
        e.preventDefault();
        const next = k.typed + e.key.toUpperCase();
        const path = bestPath(pathsFor(puzzle, next, k.usedCells), allWords(puzzle));
        if (!path) return k.say(`No hi ha cap «${next}» amb lletres veïnes`, 'info', 1800);
        setTyped(next);
        setSelection(path);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [status, puzzle]);

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
      message={message}
      // Mentre se selecciona, la paraula ocupa la línia dels avisos (així la graella hi cap).
      messageFallback={
        selection.length > 0 && (
          <span className="text-xl font-bold tracking-widest">
            {wordFromPath(puzzle, selection)}
          </span>
        )
      }
      progress={state.found.length / total}
    >
      <div className="mb-1 w-full max-w-sm rounded-xl bg-sky-100 px-3 py-1.5 text-center">
        <p className="text-xs font-semibold text-sky-800 uppercase">Tema d’avui</p>
        <p className="leading-snug font-bold">{puzzle.theme}</p>
      </div>

      <LetterGrid
        puzzle={puzzle}
        found={state.found}
        hintWord={state.hintWord}
        selection={selection}
        onSelectionChange={(cells) => {
          setTyped('');
          setSelection(cells);
        }}
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
