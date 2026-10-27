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
  theme: { bg: string; text: string; soft: string };
}

export interface GameDefinition extends GameMeta {
  Component: LazyExoticComponent<ComponentType<GameProps>>;
}
