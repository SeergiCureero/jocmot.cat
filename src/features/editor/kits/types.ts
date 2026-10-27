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

export { INPUT } from '@/components/ui/styles';

export const result = (puzzle: unknown, errors: string[]): BuildResult =>
  errors.length ? { puzzle: null, errors } : { puzzle, errors: [] };
