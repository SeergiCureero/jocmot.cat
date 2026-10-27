import { lazy } from 'react';
import { meta as connexions } from './connexions/meta';
import { meta as fils } from './fils/meta';
import { meta as mini } from './mini/meta';
import { meta as paraula } from './paraula/meta';
import type { DesignableGameId } from '@/services/backend';
import type { GameDefinition } from './types';

/**
 * Registre únic de jocs. Per afegir-ne un de nou: crear la carpeta
 * src/games/<joc>/ amb meta.ts + <Joc>Game.tsx i afegir-lo aquí.
 * Cada joc es carrega de manera diferida (code splitting).
 */
export const GAMES: GameDefinition[] = [
  { ...paraula, Component: lazy(() => import('./paraula/ParaulaGame')) },
  { ...connexions, Component: lazy(() => import('./connexions/ConnexionsGame')) },
  { ...fils, Component: lazy(() => import('./fils/FilsGame')) },
  { ...mini, Component: lazy(() => import('./mini/MiniGame')) },
];

/** Jocs amb puzles que el grup pot dissenyar des de /editor. */
export const DESIGNABLE_GAMES: readonly DesignableGameId[] = ['connexions', 'fils', 'mini'];

export const isDesignable = (id: string): id is DesignableGameId => (DESIGNABLE_GAMES as readonly string[]).includes(id);
