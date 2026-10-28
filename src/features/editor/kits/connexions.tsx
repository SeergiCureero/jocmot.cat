import { validatePuzzle } from '@/games/connexions/logic';
import type { ConnexionsGroup, ConnexionsPuzzle, Level } from '@/games/connexions/types';
import { cn } from '@/lib/cn';
import { INPUT, result, type EditorKit, type FormProps } from './types';
import { Swatch } from '@/components/ui/Icon';

const LEVELS: { level: Level; label: string; bg: string; swatch: string }[] = [
  { level: 0, label: 'Fàcil', bg: 'bg-level-0/30', swatch: 'bg-level-0' },
  { level: 1, label: 'Mitjà', bg: 'bg-level-1/30', swatch: 'bg-level-1' },
  { level: 2, label: 'Difícil', bg: 'bg-level-2/30', swatch: 'bg-level-2' },
  { level: 3, label: 'Molt difícil', bg: 'bg-level-3/30', swatch: 'bg-level-3' },
];

const clean = (p: ConnexionsPuzzle): ConnexionsPuzzle => ({
  groups: p.groups.map((g) => ({
    ...g,
    title: g.title.trim(),
    words: g.words.map((w) => w.trim().toUpperCase()) as ConnexionsGroup['words'],
  })) as ConnexionsPuzzle['groups'],
});

function Form({ value, onChange, readOnly }: FormProps<ConnexionsPuzzle>) {
  const setGroup = (i: number, group: ConnexionsGroup) =>
    onChange({
      groups: value.groups.map((g, j) => (j === i ? group : g)) as ConnexionsPuzzle['groups'],
    });

  return (
    <div className="space-y-4">
      <p className="text-sm text-stone-600">
        Quatre grups de quatre paraules. Les millors connexions tenen paraules que semblen encaixar
        en més d’un grup.
      </p>
      {value.groups.map((group, i) => (
        <fieldset key={group.level} className={cn('rounded-xl p-4', LEVELS[i].bg)}>
          <legend className="sr-only">Grup {i + 1}</legend>
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-sm font-semibold">
              <Swatch className={LEVELS[i].swatch} /> {LEVELS[i].label}
            </span>
          </div>
          <input
            aria-label={`Títol del grup ${i + 1}`}
            placeholder="Què tenen en comú? (p. ex. Rius de Catalunya)"
            value={group.title}
            disabled={readOnly}
            onChange={(e) => setGroup(i, { ...group, title: e.target.value })}
            className={cn(INPUT, 'mb-2 font-semibold')}
          />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {group.words.map((word, k) => (
              <input
                key={k}
                aria-label={`Paraula ${k + 1} del grup ${i + 1}`}
                placeholder={`Paraula ${k + 1}`}
                value={word}
                disabled={readOnly}
                onChange={(e) => {
                  const words = [...group.words] as ConnexionsGroup['words'];
                  words[k] = e.target.value.toUpperCase();
                  setGroup(i, { ...group, words });
                }}
                className={cn(INPUT, 'uppercase')}
              />
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

export const connexionsKit: EditorKit<ConnexionsPuzzle> = {
  game: 'connexions',
  empty: () => ({
    groups: LEVELS.map(({ level }) => ({
      level,
      title: '',
      words: ['', '', '', ''],
    })) as ConnexionsPuzzle['groups'],
  }),
  fromPuzzle: (p) => structuredClone(p as ConnexionsPuzzle),
  build(draft) {
    const puzzle = clean(draft);
    return result(puzzle, validatePuzzle(puzzle));
  },
  Form,
};
