import type { ComponentType } from 'react';
import ConnexionsHelp from './connexions/help';
import FilsHelp from './fils/help';
import MiniHelp from './mini/help';
import ParaulaHelp from './paraula/help';
import type { GameId } from './types';

/** Instruccions de cada joc (finestra del joc i pàgina "Com es juga"). */
export const HELP: Record<GameId, ComponentType> = {
  paraula: ParaulaHelp,
  connexions: ConnexionsHelp,
  fils: FilsHelp,
  mini: MiniHelp,
};
