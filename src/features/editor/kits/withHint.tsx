import { INPUT, type EditorKit, type FormProps } from './types';

/** Llargada màxima de la pista de l'autor. */
export const HINT_MAX = 200;

/** Esborrany d'un kit amb la pista opcional de l'autor (es mostra a /pistes). */
interface WithHint<D> {
  inner: D;
  hint: string;
}

const isWrapped = <D,>(d: unknown): d is WithHint<D> =>
  typeof d === 'object' && d !== null && 'inner' in d && 'hint' in d;

/**
 * Afegeix a un kit el camp "Pista per a qui s'encalli". Accepta esborranys desats abans
 * que existís (sense embolcallar).
 */
export function withHint<D>(kit: EditorKit<D>): EditorKit<WithHint<D>> {
  const unwrap = (d: unknown): WithHint<D> => (isWrapped<D>(d) ? d : { inner: d as D, hint: '' });

  function Form({ value, onChange, readOnly }: FormProps<WithHint<D>>) {
    const v = unwrap(value);
    const Inner = kit.Form;
    return (
      <div className="space-y-4">
        <Inner
          value={v.inner}
          readOnly={readOnly}
          onChange={(inner) => onChange({ ...v, inner })}
        />
        <label className="block rounded-xl border border-stone-200 bg-white p-3">
          <span className="block text-sm font-medium text-stone-700">
            💡 Pista per a qui s’encalli (opcional)
          </span>
          <span className="mb-2 block text-xs text-stone-600">
            Surt la primera a la pàgina de pistes. Que ajudi sense dir la solució.
          </span>
          <input
            value={v.hint}
            disabled={readOnly}
            maxLength={HINT_MAX}
            onChange={(e) => onChange({ ...v, hint: e.target.value })}
            placeholder="p. ex. Pensa en coses que trobaries a la platja"
            className={INPUT}
          />
        </label>
      </div>
    );
  }

  return {
    game: kit.game,
    empty: () => ({ inner: kit.empty(), hint: '' }),
    fromPuzzle: (puzzle) => {
      const hint = (puzzle as { hint?: unknown } | null)?.hint;
      return { inner: kit.fromPuzzle(puzzle), hint: typeof hint === 'string' ? hint : '' };
    },
    build: (draft) => {
      const d = unwrap(draft);
      const built = kit.build(d.inner);
      const hint = d.hint.trim();
      if (!built.puzzle || !hint) return built;
      return { puzzle: { ...(built.puzzle as object), hint }, errors: [] };
    },
    words: (draft) => kit.words(unwrap(draft).inner),
    Form,
  };
}
