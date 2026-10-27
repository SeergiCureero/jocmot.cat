import { cn } from '@/lib/cn';
import { BLOCK, EMPTY } from '../logic';
import type { Cell, Entry } from '../types';

interface Props {
  letters: string[];
  numbers: (number | null)[][];
  cursor: Cell;
  activeEntry?: Entry;
  wrong: Cell[];
  solved: boolean;
  onCellClick: (cell: Cell) => void;
}

const has = (list: Cell[], [r, c]: Cell) => list.some(([a, b]) => a === r && b === c);

export default function CrosswordGrid({
  letters,
  numbers,
  cursor,
  activeEntry,
  wrong,
  solved,
  onCellClick,
}: Props) {
  const size = letters.length;
  return (
    <div
      className="grid w-full max-w-sm border-2 border-stone-900"
      style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      role="grid"
      aria-label="Mot encreuat"
    >
      {letters.flatMap((row, r) =>
        [...row].map((ch, c) => {
          if (ch === BLOCK) return <div key={`${r}-${c}`} className="aspect-square bg-stone-900" />;
          const isCursor = cursor[0] === r && cursor[1] === c;
          const inEntry = activeEntry ? has(activeEntry.cells, [r, c]) : false;
          return (
            <button
              key={`${r}-${c}`}
              role="gridcell"
              onClick={() => onCellClick([r, c])}
              // En resoldre'l, una ona travessa la graella en diagonal.
              style={solved ? { animationDelay: `${(r + c) * 70}ms` } : undefined}
              className={cn(
                'relative aspect-square border border-stone-400 text-2xl font-bold uppercase transition-colors duration-150 sm:text-3xl',
                solved
                  ? 'animate-wave bg-sky-100'
                  : isCursor
                    ? 'bg-amber-300'
                    : inEntry
                      ? 'bg-sky-100'
                      : 'bg-white',
                has(wrong, [r, c]) && 'animate-shake text-red-600',
              )}
            >
              {numbers[r][c] && (
                <span className="absolute top-0.5 left-1 text-[10px] font-semibold">
                  {numbers[r][c]}
                </span>
              )}
              {ch !== EMPTY && (
                <span key={ch} className="animate-pop inline-block">
                  {ch}
                </span>
              )}
            </button>
          );
        }),
      )}
    </div>
  );
}
