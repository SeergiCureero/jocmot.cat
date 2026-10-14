import { Navigate, useParams } from 'react-router';
import { FEATURES } from '@/config/site';
import { getPuzzleDate, getTodayPuzzleNumber } from './puzzles';
import type { GameDefinition } from './types';

/**
 * Resol quin puzle s'ha de mostrar i munta el joc.
 * - /joc            → puzle d'avui
 * - /joc/:puzzleId  → arxiu (només si FEATURES.archive i no és futur)
 */
export default function GameRoute({ game }: { game: GameDefinition }) {
  const { puzzleId } = useParams();
  const today = getTodayPuzzleNumber();
  const requested = puzzleId ? Number(puzzleId) : today;

  const isValid =
    Number.isInteger(requested) &&
    requested >= 1 &&
    requested <= today &&
    (requested === today || FEATURES.archive);

  if (!isValid) return <Navigate to={`/${game.slug}`} replace />;

  const { Component } = game;
  // La `key` força un estat net en canviar de puzle.
  return <Component key={`${game.id}-${requested}`} puzzleNumber={requested} date={getPuzzleDate(requested)} />;
}
