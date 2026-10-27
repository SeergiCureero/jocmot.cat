import { useCallback, useEffect, useMemo, useState } from 'react';
import GameShell from '@/components/game/GameShell';
import Keyboard, { BACKSPACE, ENTER } from '@/components/game/Keyboard';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { SITE } from '@/config/site';
import { useGameProgress } from '@/features/progress/useGameProgress';
import { formatSeconds } from '@/lib/date';
import { cn } from '@/lib/cn';
import { isModalOpen, isTypingInField } from '@/lib/dom';
import { pickByNumber } from '../puzzles';
import type { GameProps } from '../types';
import CrosswordGrid from './components/CrosswordGrid';
import { PUZZLES } from './data/puzzles';
import {
  buildEntries,
  buildShareText,
  EMPTY,
  entryAt,
  getStatus,
  initialStateFor,
  isFilled,
  reveal,
  setLetter,
  wrongCells,
} from './logic';
import { meta } from './meta';
import type { Cell, Direction, Entry, MiniPuzzle } from './types';

export default function MiniGame({ puzzleNumber, date, puzzle: groupPuzzle, preview }: GameProps) {
  const puzzle = (groupPuzzle as MiniPuzzle | undefined) ?? pickByNumber(PUZZLES, puzzleNumber);
  const { numbers, entries } = useMemo(() => buildEntries(puzzle), [puzzle]);
  const initialState = useMemo(() => initialStateFor(puzzle), [puzzle]);
  const { state, update, status } = useGameProgress({
    gameId: meta.id,
    puzzleId: puzzleNumber,
    initialState,
    getStatus,
    persist: !preview,
  });

  const [cursor, setCursor] = useState<Cell>(entries[0].cells[0]);
  const [direction, setDirection] = useState<Direction>('across');
  const [seconds, setSeconds] = useState(state.elapsedSeconds);
  const [wrong, setWrong] = useState<Cell[]>([]);
  const toast = useToast();

  const active = entryAt(entries, cursor, direction) ?? entryAt(entries, cursor, other(direction));

  // Cronòmetre: només compta mentre es juga i la pestanya és visible.
  useEffect(() => {
    if (status !== 'playing') return;
    const id = setInterval(() => !document.hidden && setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  const goToEntry = useCallback(
    (entry: Entry) => {
      setDirection(entry.direction);
      setCursor(entry.cells.find(([r, c]) => state.letters[r][c] === EMPTY) ?? entry.cells[0]);
    },
    [state.letters],
  );

  const moveEntry = useCallback(
    (step: 1 | -1) => {
      if (!active) return;
      const i = entries.indexOf(active);
      goToEntry(entries[(i + step + entries.length) % entries.length]);
    },
    [active, entries, goToEntry],
  );

  const onKey = useCallback(
    (key: string) => {
      if (status !== 'playing' || !active) return;
      const idx = active.cells.findIndex(([r, c]) => r === cursor[0] && c === cursor[1]);

      if (key === ENTER) return moveEntry(1);
      if (key === BACKSPACE) {
        const [r, c] = cursor;
        if (state.letters[r][c] !== EMPTY) update((s) => setLetter(s, puzzle, cursor, EMPTY));
        else if (idx > 0) {
          const prev = active.cells[idx - 1];
          setCursor(prev);
          update((s) => setLetter(s, puzzle, prev, EMPTY));
        }
        return;
      }

      setWrong([]);
      const next = setLetter({ ...state, elapsedSeconds: seconds }, puzzle, cursor, key);
      update(() => next);
      if (next.status === 'playing' && isFilled(next))
        toast('Gairebé! Hi ha alguna lletra malament');
      // Avança a la següent casella buida de la paraula (o a la següent).
      const after = active.cells.slice(idx + 1);
      const nextCell = after.find(([r, c]) => state.letters[r][c] === EMPTY) ?? after[0];
      if (nextCell) setCursor(nextCell);
    },
    [status, active, cursor, state, update, puzzle, seconds, moveEntry, toast],
  );

  // Fletxes per moure's per la graella.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isModalOpen() || isTypingInField(e)) return;
      const moves: Record<string, [number, number, Direction]> = {
        ArrowUp: [-1, 0, 'down'],
        ArrowDown: [1, 0, 'down'],
        ArrowLeft: [0, -1, 'across'],
        ArrowRight: [0, 1, 'across'],
      };
      if (e.key === 'Tab') {
        e.preventDefault();
        return moveEntry(e.shiftKey ? -1 : 1);
      }
      const move = moves[e.key];
      if (!move) return;
      e.preventDefault();
      if (direction !== move[2]) return setDirection(move[2]);
      let [r, c] = cursor;
      do {
        r += move[0];
        c += move[1];
      } while (puzzle.grid[r]?.[c] === '#');
      if (puzzle.grid[r]?.[c] !== undefined) setCursor([r, c]);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [cursor, direction, puzzle, moveEntry]);

  const onCellClick = (cell: Cell) => {
    if (cell[0] === cursor[0] && cell[1] === cursor[1]) {
      if (entryAt(entries, cell, other(direction))) setDirection(other(direction));
    } else {
      setCursor(cell);
      if (!entryAt(entries, cell, direction)) setDirection(other(direction));
    }
  };

  const finished = status !== 'playing';
  const result = finished
    ? {
        title:
          status === 'won'
            ? `Resolt en ${formatSeconds(state.elapsedSeconds)}!`
            : 'Solució revelada',
        shareText: buildShareText(puzzleNumber, state, `${SITE.url}/${meta.slug}`, formatSeconds),
        won: status === 'won',
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
      headerExtra={
        <span className="font-mono text-sm tabular-nums">
          {formatSeconds(finished ? state.elapsedSeconds : seconds)}
        </span>
      }
    >
      {active && !finished && (
        <div className="mb-3 flex w-full max-w-sm items-center gap-2 rounded-lg bg-sky-100 p-2">
          <button
            onClick={() => moveEntry(-1)}
            aria-label="Definició anterior"
            className="px-2 text-xl"
          >
            ‹
          </button>
          <p
            key={`${active.direction}-${active.number}`}
            className="animate-fade-in flex-1 text-sm"
          >
            <strong>
              {active.number}
              {active.direction === 'across' ? 'H' : 'V'}
            </strong>{' '}
            {active.clue}
          </p>
          <button
            onClick={() => moveEntry(1)}
            aria-label="Definició següent"
            className="px-2 text-xl"
          >
            ›
          </button>
        </div>
      )}

      <CrosswordGrid
        letters={state.letters}
        numbers={numbers}
        cursor={cursor}
        activeEntry={finished ? undefined : active}
        wrong={wrong}
        solved={status === 'won'}
        onCellClick={onCellClick}
      />

      {!finished && (
        <>
          <div className="mt-4 flex gap-2">
            <Button variant="secondary" onClick={() => setWrong(wrongCells(state, puzzle))}>
              Comprova
            </Button>
            <Button
              variant="secondary"
              onClick={() => update((s) => reveal({ ...s, elapsedSeconds: seconds }, puzzle))}
            >
              Revela
            </Button>
          </div>
          <Keyboard onKey={onKey} />
        </>
      )}

      <ClueList entries={entries} active={finished ? undefined : active} onSelect={goToEntry} />
    </GameShell>
  );
}

const other = (d: Direction): Direction => (d === 'across' ? 'down' : 'across');

function ClueList({
  entries,
  active,
  onSelect,
}: {
  entries: Entry[];
  active?: Entry;
  onSelect: (e: Entry) => void;
}) {
  const groups: [Direction, string][] = [
    ['across', 'Horitzontals'],
    ['down', 'Verticals'],
  ];
  return (
    <div className="mt-6 grid w-full gap-6 sm:grid-cols-2">
      {groups.map(([dir, label]) => (
        <section key={dir}>
          <h2 className="mb-2 text-sm font-bold text-stone-500 uppercase">{label}</h2>
          <ol className="space-y-1 text-sm">
            {entries
              .filter((e) => e.direction === dir)
              .map((e) => (
                <li key={`${dir}-${e.number}`}>
                  <button
                    onClick={() => onSelect(e)}
                    className={cn(
                      'w-full rounded px-2 py-1 text-left transition-colors hover:bg-stone-100',
                      e === active && 'bg-sky-100',
                    )}
                  >
                    <strong className="mr-2">{e.number}</strong>
                    {e.clue}
                  </button>
                </li>
              ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

function Help() {
  return (
    <>
      <p>Omple el mot encreuat a partir de les definicions horitzontals (H) i verticals (V).</p>
      <p>
        Toca una casella per triar-la; torna-la a tocar per canviar de direcció. Amb teclat:
        fletxes, Tab i Enter.
      </p>
      <p>
        El cronòmetre s’atura quan ho tens tot bé. <strong>Comprova</strong> marca les lletres
        errònies i <strong>Revela</strong> mostra la solució.
      </p>
    </>
  );
}
