import { useCallback, useEffect, useMemo, useState } from 'react';
import GameShell from '@/components/game/GameShell';
import Keyboard, { BACKSPACE, ENTER } from '@/components/game/Keyboard';
import Button from '@/components/ui/Button';
import { useGameMessage } from '@/components/game/GameMessage';
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
  const { message, say } = useGameMessage();

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
      if (next.status === 'won') say('Resolt!', 'ok');
      else if (isFilled(next)) say('Gairebé! Hi ha alguna lletra malament', 'error');
      // Avança a la següent casella buida de la paraula (o a la següent).
      const after = active.cells.slice(idx + 1);
      const nextCell = after.find(([r, c]) => state.letters[r][c] === EMPTY) ?? after[0];
      if (nextCell) setCursor(nextCell);
    },
    [status, active, cursor, state, update, puzzle, seconds, moveEntry, say],
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
      message={message}
      headerExtra={
        <span className="font-mono text-sm tabular-nums">
          {formatSeconds(finished ? state.elapsedSeconds : seconds)}
        </span>
      }
    >
      {active && !finished && (
        <div className="mb-2 flex min-h-14 w-full max-w-sm items-center gap-1 rounded-lg bg-sky-100 px-1 py-1">
          <button
            onClick={() => moveEntry(-1)}
            aria-label="Definició anterior"
            className="grid size-11 shrink-0 place-items-center rounded-full text-2xl hover:bg-sky-200"
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
            className="grid size-11 shrink-0 place-items-center rounded-full text-2xl hover:bg-sky-200"
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
          <Keyboard onKey={onKey} />
          <div className="mt-4 flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                const bad = wrongCells(state, puzzle);
                setWrong(bad);
                if (bad.length)
                  say(
                    bad.length === 1
                      ? 'Hi ha 1 lletra malament'
                      : `Hi ha ${bad.length} lletres malament`,
                    'error',
                  );
                else say('De moment, tot bé!', 'ok');
              }}
            >
              Comprova
            </Button>
            <Button
              variant="secondary"
              onClick={() => update((s) => reveal({ ...s, elapsedSeconds: seconds }, puzzle))}
            >
              Revela
            </Button>
          </div>
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
          <ol className="space-y-0.5 text-sm">
            {entries
              .filter((e) => e.direction === dir)
              .map((e) => (
                <li key={`${dir}-${e.number}`}>
                  <button
                    onClick={() => onSelect(e)}
                    className={cn(
                      'min-h-11 w-full rounded-lg px-2 py-2 text-left transition-colors hover:bg-stone-100',
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
