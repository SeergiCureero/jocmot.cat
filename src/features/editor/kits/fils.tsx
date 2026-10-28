import { useState } from 'react';
import Button from '@/components/ui/Button';
import LetterGrid from '@/games/fils/components/LetterGrid';
import { generateFils } from '@/games/fils/generator';
import { allWords, COLS, MIN_WORD, ROWS, validatePuzzle } from '@/games/fils/logic';
import type { FilsPuzzle } from '@/games/fils/types';
import { cn } from '@/lib/cn';
import { normalizeWord } from '@/lib/text';
import { INPUT, result, type EditorKit, type FormProps } from './types';
import { Swatch } from '@/components/ui/Icon';

export interface FilsDraft {
  theme: string;
  spangram: string;
  /** Paraules separades per comes o salts de línia. */
  words: string;
  /** Graella generada per a les paraules actuals (null si encara no n'hi ha). */
  grid: FilsPuzzle | null;
}

const LETTERS = ROWS * COLS;
const parseWords = (text: string) =>
  text
    .split(/[\s,;]+/)
    .map(normalizeWord)
    .filter(Boolean);

function inputErrors(d: FilsDraft): string[] {
  const errors: string[] = [];
  const spangram = normalizeWord(d.spangram);
  const words = parseWords(d.words);
  if (!d.theme.trim()) errors.push('falta el tema');
  if (spangram.length < MIN_WORD)
    errors.push(`el fil conductor ha de tenir com a mínim ${MIN_WORD} lletres`);
  const short = words.filter((w) => w.length < MIN_WORD);
  if (short.length) errors.push(`paraules massa curtes (mínim ${MIN_WORD}): ${short.join(', ')}`);
  const all = [spangram, ...words];
  const repeated = all.filter((w, i) => w && all.indexOf(w) !== i);
  if (repeated.length) errors.push(`paraules repetides: ${[...new Set(repeated)].join(', ')}`);
  if (all.some((w) => /[^A-ZÇ]/.test(w))) errors.push('només es poden fer servir lletres');
  const total = all.join('').length;
  if (total !== LETTERS) errors.push(`les lletres han de sumar ${LETTERS} (ara n’hi ha ${total})`);
  return errors;
}

/** La graella generada correspon a les paraules actuals? */
const gridMatches = (d: FilsDraft) =>
  d.grid !== null &&
  d.grid.spangram.word === normalizeWord(d.spangram) &&
  d.grid.words.map((w) => w.word).join() === parseWords(d.words).join();

function Form({ value, onChange, readOnly }: FormProps<FilsDraft>) {
  const [generating, setGenerating] = useState(false);
  const [failed, setFailed] = useState(false);
  const total = [normalizeWord(value.spangram), ...parseWords(value.words)].join('').length;
  const canGenerate = inputErrors(value).filter((e) => !e.startsWith('falta el tema')).length === 0;
  const fresh = gridMatches(value);

  const generate = () => {
    setGenerating(true);
    setFailed(false);
    // Deixem pintar el "Generant…" abans de bloquejar el fil principal.
    setTimeout(() => {
      const grid = generateFils({
        theme: value.theme,
        spangram: normalizeWord(value.spangram),
        words: parseWords(value.words),
        seed: Math.floor(Math.random() * 2 ** 31),
      });
      setGenerating(false);
      if (grid) onChange({ ...value, grid });
      else setFailed(true);
    }, 30);
  };

  return (
    <div className="space-y-4">
      {!readOnly && (
        <p className="text-sm text-stone-600">
          El <strong>fil conductor</strong> descriu el tema i travessa la graella. Entre totes les
          paraules han de sumar exactament {LETTERS} lletres (sense accents; la Ç compta com a
          lletra).
        </p>
      )}
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-stone-700">
          Tema (la pista que veu el jugador)
        </span>
        <input
          value={value.theme}
          disabled={readOnly}
          placeholder="p. ex. Al mercat"
          onChange={(e) =>
            onChange({
              ...value,
              theme: e.target.value,
              grid: value.grid && { ...value.grid, theme: e.target.value },
            })
          }
          className={INPUT}
        />
      </label>
      {!readOnly && (
        <>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-stone-700">
              Fil conductor <Swatch className="rounded-full bg-amber-300" />
            </span>
            <input
              value={value.spangram}
              placeholder="p. ex. FRUITES"
              onChange={(e) => onChange({ ...value, spangram: e.target.value.toUpperCase() })}
              className={cn(INPUT, 'uppercase')}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-stone-700">
              Paraules del tema <Swatch className="rounded-full bg-sky-300" /> (separades per comes)
            </span>
            <textarea
              value={value.words}
              rows={3}
              placeholder="POMA, PERA, PRESSEC, TARONJA…"
              onChange={(e) => onChange({ ...value, words: e.target.value.toUpperCase() })}
              className={cn(INPUT, 'uppercase')}
            />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={cn(
                'text-sm font-semibold',
                total === LETTERS ? 'text-correct' : 'text-stone-600',
              )}
            >
              {total} / {LETTERS} lletres
            </span>
            <Button variant="secondary" disabled={!canGenerate || generating} onClick={generate}>
              {generating ? 'Generant…' : value.grid ? 'Genera’n una altra' : 'Genera la graella'}
            </Button>
          </div>
          {failed && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              No he trobat cap graella a temps. Torna-ho a provar, o canvia alguna paraula (les molt
              llargues ho fan més difícil).
            </p>
          )}
        </>
      )}
      {value.grid && (
        <div className={cn('flex flex-col items-center', !fresh && 'opacity-40')}>
          {!fresh && (
            <p className="mb-2 text-sm text-amber-800">
              Has canviat les paraules: torna a generar la graella.
            </p>
          )}
          <LetterGrid
            puzzle={value.grid}
            found={allWords(value.grid).map((w) => w.word)}
            hintWord={null}
            selection={[]}
            onSelectionChange={() => {}}
            onSubmit={() => {}}
            disabled
          />
        </div>
      )}
    </div>
  );
}

export const filsKit: EditorKit<FilsDraft> = {
  game: 'fils',
  empty: () => ({ theme: '', spangram: '', words: '', grid: null }),
  fromPuzzle: (raw) => {
    const p = raw as FilsPuzzle;
    return {
      theme: p.theme,
      spangram: p.spangram.word,
      words: p.words.map((w) => w.word).join(', '),
      grid: p,
    };
  },
  build(draft) {
    const errors = inputErrors(draft);
    if (errors.length) return result(null, errors);
    if (!gridMatches(draft)) return result(null, ['genera la graella']);
    const puzzle: FilsPuzzle = { ...draft.grid!, theme: draft.theme.trim() };
    return result(puzzle, validatePuzzle(puzzle));
  },
  Form,
};
