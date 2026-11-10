import type { ComponentType, LazyExoticComponent } from 'react';

export type GameId = 'paraula' | 'connexions' | 'fils' | 'mini';

/** Props que rep el component de qualsevol joc. */
export interface GameProps {
  /** Número de puzle (#1 = dia de llançament). */
  puzzleNumber: number;
  /** Data "AAAA-MM-DD" del puzle. */
  date: string;
  /** Puzle del grup (de la base de dades). Si no n'hi ha, el joc fa servir els del repositori. */
  puzzle?: unknown;
  /** Mode prova de l'editor: no desa el progrés. */
  preview?: boolean;
}

/** Metadades lleugeres (no carreguen el codi del joc). */
export interface GameMeta {
  id: GameId;
  /** Segment d'URL: /paraula, /connexions... */
  slug: string;
  name: string;
  /** Joc original en què s'inspira (per a la documentació interna). */
  inspiredBy: string;
  tagline: string;
  icon: string;
  /**
   * Colors del joc. `bg`, `text` i `soft` són els suaus (xips i fons);
   * `dark` és la classe del fons fosc de la icona i `darkHex` el mateix color en hex.
   */
  theme: { bg: string; text: string; soft: string; dark: string; darkHex: string };
}

export interface GameDefinition extends GameMeta {
  Component: LazyExoticComponent<ComponentType<GameProps>>;
  /** Pistes del puzle (pàgina /pistes). Es carreguen a demanda, com el joc. */
  hints: () => Promise<HintsModule>;
}

/** Una pista: un títol curt i el que diu (una o més línies). */
export interface Hint {
  title: string;
  lines: string[];
}

/** Pistes d'un puzle, de la més suau a la més clara, i la solució a part. */
export interface PuzzleHints {
  hints: Hint[];
  solution: Hint;
}

export interface HintsModule {
  /** `groupPuzzle`: puzle del grup per a aquest número; si no n'hi ha, el del repositori. */
  buildHints(puzzleNumber: number, groupPuzzle?: unknown): PuzzleHints;
}

/** Pista escrita per l'autor d'un puzle del grup (camp opcional `hint` del puzle). */
export function authorHint(puzzle: unknown): Hint[] {
  const text = (puzzle as { hint?: unknown } | null | undefined)?.hint;
  return typeof text === 'string' && text.trim()
    ? [{ title: 'Pista de l’autor', lines: [text.trim()] }]
    : [];
}
