import { useRef, useState, type KeyboardEvent } from 'react';
import { BLOCK, buildEntries, EMPTY, validatePuzzle } from '@/games/mini/logic';
import type { Direction, Entry, MiniPuzzle } from '@/games/mini/types';
import { cn } from '@/lib/cn';
import { normalizeWord } from '@/lib/text';
import { INPUT, result, type EditorKit, type FormProps } from './types';

export interface MiniDraft {
  /** Files de la graella: lletra, EMPTY (buida) o BLOCK (negra). */
  grid: string[];
  /**
   * Definicions per casella inicial i direcció ("across:0,2"). Així no es perden
   * si en afegir o treure caselles negres canvia la numeració.
   */
  clues: Record<string, string>;
}

const SIZE = 5;
const clueKey = (e: Pick<Entry, 'direction' | 'cells'>) => `${e.direction}:${e.cells[0].join(',')}`;
const LABEL: Record<Direction, string> = { across: 'Horitzontals', down: 'Verticals' };

function toPuzzle(d: MiniDraft): MiniPuzzle {
  const { entries } = buildEntries({ grid: d.grid, clues: { across: {}, down: {} } });
  const clues: MiniPuzzle['clues'] = { across: {}, down: {} };
  for (const e of entries) {
    const text = d.clues[clueKey(e)]?.trim();
    if (text) clues[e.direction][e.number] = text;
  }
  return { grid: d.grid, clues };
}

function Form({ value, onChange, readOnly }: FormProps<MiniDraft>) {
  const [blockMode, setBlockMode] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const { numbers, entries } = buildEntries({ grid: value.grid, clues: { across: {}, down: {} } });

  const setCell = (r: number, c: number, ch: string) =>
    onChange({
      ...value,
      grid: value.grid.map((row, i) => (i === r ? row.slice(0, c) + ch + row.slice(c + 1) : row)),
    });
  const focus = (index: number) =>
    refs.current[Math.max(0, Math.min(SIZE * SIZE - 1, index))]?.focus();

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>, r: number, c: number) => {
    const i = r * SIZE + c;
    const moves: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -SIZE,
      ArrowDown: SIZE,
    };
    if (e.key in moves) {
      e.preventDefault();
      focus(i + moves[e.key]);
    } else if (e.key === 'Backspace' && value.grid[r][c] === EMPTY) {
      e.preventDefault();
      focus(i - 1);
    } else if (e.key === '#' || e.key === '.') {
      e.preventDefault();
      setCell(r, c, value.grid[r][c] === BLOCK ? EMPTY : BLOCK);
      focus(i + 1);
    }
  };

  return (
    <div className="space-y-5">
      {!readOnly && (
        <div className="space-y-2 text-sm text-stone-600">
          <p>
            Escriu les lletres de la solució. Per posar o treure caselles negres, activa el mode de
            caselles negres o prem <kbd className="rounded border px-1">#</kbd> o{' '}
            <kbd className="rounded border px-1">.</kbd> a la casella.
          </p>
          <label className="inline-flex items-center gap-2 font-medium text-stone-800">
            <input
              type="checkbox"
              checked={blockMode}
              onChange={(e) => setBlockMode(e.target.checked)}
            />
            Mode caselles negres
          </label>
        </div>
      )}

      <div
        className="mx-auto grid w-full max-w-xs grid-cols-5 border-2 border-stone-900"
        role="grid"
        aria-label="Graella"
      >
        {value.grid.flatMap((row, r) =>
          [...row].map((ch, c) => {
            const i = r * SIZE + c;
            const isBlock = ch === BLOCK;
            const common = 'relative aspect-square border border-stone-400';
            if (isBlock || blockMode || readOnly) {
              return (
                <button
                  key={i}
                  type="button"
                  disabled={readOnly}
                  aria-label={`Casella ${r + 1},${c + 1}${isBlock ? ' (negra)' : ''}`}
                  onClick={() =>
                    blockMode
                      ? setCell(r, c, isBlock ? EMPTY : BLOCK)
                      : (setCell(r, c, EMPTY), setTimeout(() => focus(i)))
                  }
                  className={cn(
                    common,
                    'text-2xl font-bold',
                    isBlock ? 'bg-stone-900' : 'bg-white',
                  )}
                >
                  {numbers[r][c] && (
                    <span className="absolute top-0.5 left-1 text-[10px] font-semibold">
                      {numbers[r][c]}
                    </span>
                  )}
                  {!isBlock && ch !== EMPTY && ch}
                </button>
              );
            }
            return (
              <div key={i} className={cn(common, 'bg-white')}>
                {numbers[r][c] && (
                  <span className="pointer-events-none absolute top-0.5 left-1 text-[10px] font-semibold">
                    {numbers[r][c]}
                  </span>
                )}
                <input
                  ref={(el) => {
                    refs.current[i] = el;
                  }}
                  aria-label={`Casella ${r + 1},${c + 1}`}
                  value={ch === EMPTY ? '' : ch}
                  onKeyDown={(e) => onKeyDown(e, r, c)}
                  onChange={(e) => {
                    const letter = normalizeWord(e.target.value).slice(-1);
                    if (!/^[A-ZÇ]?$/.test(letter)) return;
                    setCell(r, c, letter || EMPTY);
                    if (letter) focus(i + 1);
                  }}
                  className="size-full bg-transparent text-center text-2xl font-bold uppercase outline-none focus:bg-amber-200"
                />
              </div>
            );
          }),
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {(['across', 'down'] as Direction[]).map((dir) => (
          <section key={dir}>
            <h3 className="mb-2 text-sm font-bold text-stone-500 uppercase">{LABEL[dir]}</h3>
            <ol className="space-y-2">
              {entries
                .filter((e) => e.direction === dir)
                .map((e) => (
                  <li key={clueKey(e)}>
                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold text-stone-600">
                        {e.number}
                        {dir === 'across' ? 'H' : 'V'} ·{' '}
                        <span className="font-mono tracking-widest">
                          {e.answer.replaceAll(EMPTY, '·')}
                        </span>
                      </span>
                      <input
                        value={value.clues[clueKey(e)] ?? ''}
                        disabled={readOnly}
                        placeholder="Definició"
                        onChange={(ev) =>
                          onChange({
                            ...value,
                            clues: { ...value.clues, [clueKey(e)]: ev.target.value },
                          })
                        }
                        className={INPUT}
                      />
                    </label>
                  </li>
                ))}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}

export const miniKit: EditorKit<MiniDraft> = {
  game: 'mini',
  empty: () => ({ grid: Array.from({ length: SIZE }, () => EMPTY.repeat(SIZE)), clues: {} }),
  fromPuzzle: (raw) => {
    const p = raw as MiniPuzzle;
    const { entries } = buildEntries(p);
    return {
      grid: [...p.grid],
      clues: Object.fromEntries(entries.map((e) => [clueKey(e), e.clue])),
    };
  },
  build(draft) {
    const puzzle = toPuzzle(draft);
    return result(puzzle, validatePuzzle(puzzle));
  },
  Form,
};
