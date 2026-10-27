import { useRef, type PointerEvent } from 'react';
import { cn } from '@/lib/cn';
import { COLS, isAdjacent, ROWS, sameCell } from '../logic';
import type { Cell, FilsPuzzle } from '../types';

interface Props {
  puzzle: FilsPuzzle;
  found: string[];
  hintWord: string | null;
  selection: Cell[];
  onSelectionChange: (cells: Cell[]) => void;
  onSubmit: (cells: Cell[]) => void;
  disabled: boolean;
}

/** Centre d'una cel·la al viewBox de l'SVG (cada cel·la = 10 unitats). */
const center = ([r, c]: Cell) => ({ x: c * 10 + 5, y: r * 10 + 5 });
const toPoints = (path: Cell[]) => path.map((p) => `${center(p).x},${center(p).y}`).join(' ');

/**
 * Graella interactiva. Suporta:
 * - arrossegar (ratolí/dit) per seleccionar i deixar anar per enviar;
 * - tocar lletres una a una i tornar a tocar l'última per enviar.
 */
export default function LetterGrid({
  puzzle,
  found,
  hintWord,
  selection,
  onSelectionChange,
  onSubmit,
  disabled,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, moved: false });
  // Les paraules que ja hi eren en obrir la graella no s'animen; les noves sí.
  const foundAtStart = useRef(found.length);
  const isNew = (word: string) => found.indexOf(word) >= foundAtStart.current;

  const foundWords = [puzzle.spangram, ...puzzle.words].filter((w) => found.includes(w.word));
  const usedCells = foundWords.flatMap((w) => w.path);
  const hintCells = hintWord
    ? ([puzzle.spangram, ...puzzle.words].find((w) => w.word === hintWord)?.path ?? [])
    : [];

  const isUsed = (cell: Cell) => usedCells.some((u) => sameCell(u, cell));
  const indexInSelection = (cell: Cell) => selection.findIndex((s) => sameCell(s, cell));

  /** Cel·la sota el punter. `strict` exigeix estar a prop del centre (facilita diagonals). */
  function cellAt(e: PointerEvent, strict: boolean): Cell | null {
    const rect = ref.current!.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * COLS;
    const y = ((e.clientY - rect.top) / rect.height) * ROWS;
    const c = Math.floor(x);
    const r = Math.floor(y);
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return null;
    if (strict && Math.hypot(x - c - 0.5, y - r - 0.5) > 0.38) return null;
    return [r, c];
  }

  function handleDown(e: PointerEvent<HTMLDivElement>) {
    if (disabled) return;
    const cell = cellAt(e, false);
    if (!cell || isUsed(cell)) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { active: true, moved: false };

    const last = selection[selection.length - 1];
    const idx = indexInSelection(cell);
    if (last && sameCell(last, cell)) {
      drag.current.active = false;
      onSubmit(selection);
    } else if (idx >= 0) onSelectionChange(selection.slice(0, idx + 1));
    else if (last && isAdjacent(last, cell)) onSelectionChange([...selection, cell]);
    else onSelectionChange([cell]);
  }

  function handleMove(e: PointerEvent<HTMLDivElement>) {
    if (!drag.current.active) return;
    const cell = cellAt(e, true);
    if (!cell || isUsed(cell)) return;
    const last = selection[selection.length - 1];
    if (!last || sameCell(last, cell)) return;

    const prev = selection[selection.length - 2];
    if (prev && sameCell(prev, cell)) {
      onSelectionChange(selection.slice(0, -1));
      drag.current.moved = true;
    } else if (isAdjacent(last, cell) && indexInSelection(cell) < 0) {
      onSelectionChange([...selection, cell]);
      drag.current.moved = true;
    }
  }

  function handleUp() {
    const { active, moved } = drag.current;
    drag.current = { active: false, moved: false };
    if (active && moved && selection.length > 1) onSubmit(selection);
  }

  return (
    <div
      ref={ref}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerCancel={handleUp}
      className="relative aspect-[6/8] w-full max-w-sm touch-none select-none"
    >
      <svg
        viewBox={`0 0 ${COLS * 10} ${ROWS * 10}`}
        className="pointer-events-none absolute inset-0 size-full"
      >
        {foundWords.map((w) => (
          <polyline
            key={w.word}
            points={toPoints(w.path)}
            fill="none"
            strokeWidth={3.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            // Les noves es dibuixen d'un extrem a l'altre.
            pathLength={1}
            strokeDasharray={isNew(w.word) ? 1 : undefined}
            className={cn(
              w.word === puzzle.spangram.word ? 'stroke-amber-300' : 'stroke-sky-300',
              isNew(w.word) && 'animate-draw',
            )}
          />
        ))}
        {selection.length > 1 && (
          <polyline
            points={toPoints(selection)}
            fill="none"
            strokeWidth={3.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-stone-300"
          />
        )}
      </svg>

      <div className="relative grid size-full grid-cols-6 grid-rows-8">
        {puzzle.grid.flatMap((row, r) =>
          [...row].map((letter, c) => {
            const cell: Cell = [r, c];
            const word = foundWords.find((w) => w.path.some((p) => sameCell(p, cell)));
            const selected = indexInSelection(cell) >= 0;
            const hinted = hintCells.some((h) => sameCell(h, cell));
            const step = word ? word.path.findIndex((p) => sameCell(p, cell)) : -1;
            return (
              <div key={`${r}-${c}`} className="grid place-items-center">
                <span
                  style={
                    word && isNew(word.word) ? { animationDelay: `${step * 50}ms` } : undefined
                  }
                  className={cn(
                    'grid size-[78%] place-items-center rounded-full text-lg font-bold transition duration-200 sm:text-xl',
                    word && (word.word === puzzle.spangram.word ? 'bg-amber-300' : 'bg-sky-300'),
                    word && isNew(word.word) && 'animate-pop',
                    !word && selected && 'scale-110 bg-stone-300',
                    !word &&
                      !selected &&
                      hinted &&
                      'animate-glow outline-2 outline-sky-500 outline-dashed',
                  )}
                >
                  {letter}
                </span>
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}
