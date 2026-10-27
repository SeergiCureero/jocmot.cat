import type { ComponentType } from 'react';
import type { DesignableGameId } from '@/services/backend';

export interface FormProps<D> {
  value: D;
  onChange: (next: D) => void;
  /** Només lectura (per revisar la solució d'un altre). */
  readOnly?: boolean;
}

export type BuildResult = { puzzle: unknown; errors: [] } | { puzzle: null; errors: string[] };

/** Tot el que l'editor necessita saber d'un joc. `D` és l'estat del formulari (pot estar a mig fer). */
export interface EditorKit<D> {
  game: DesignableGameId;
  empty(): D;
  fromPuzzle(puzzle: unknown): D;
  /** Converteix l'esborrany en un puzle jugable, o retorna què hi falta. */
  build(draft: D): BuildResult;
  Form: ComponentType<FormProps<D>>;
}

export const INPUT =
  'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 disabled:bg-stone-50 disabled:text-stone-700';

export const result = (puzzle: unknown, errors: string[]): BuildResult =>
  errors.length ? { puzzle: null, errors } : { puzzle, errors: [] };
