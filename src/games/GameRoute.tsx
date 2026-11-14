import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router';
import Spinner from '@/components/ui/Spinner';
import { FEATURES } from '@/config/site';
import { useAuth } from '@/features/auth/AuthContext';
import NotFoundPage from '@/pages/NotFoundPage';
import { backend } from '@/services/backend';
import { getPuzzleDate, getTodayPuzzleNumber } from './puzzles';
import { isDesignable } from './registry';
import type { GameDefinition } from './types';

/**
 * Resol quin puzle s'ha de mostrar i munta el joc.
 * - /joc            → puzle d'avui
 * - /joc/:puzzleId  → arxiu (només si FEATURES.archive i no és futur)
 * Si el grup n'ha publicat un per a aquell número, té prioritat sobre els del repositori.
 */
export default function GameRoute({ game }: { game: GameDefinition }) {
  const { puzzleId } = useParams();
  const { user } = useAuth();
  const hidden = Boolean(game.editorsOnly && !user?.editor);
  const today = getTodayPuzzleNumber();
  const requested = puzzleId ? Number(puzzleId) : today;

  const isValid =
    Number.isInteger(requested) &&
    requested >= 1 &&
    requested <= today &&
    (requested === today || FEATURES.archive);

  const groupPuzzle = useGroupPuzzle(game.id, isValid ? requested : null);

  // Un joc en proves només es veu amb un compte d'editor: per a la resta, la pàgina no existeix.
  if (hidden) return <NotFoundPage />;
  if (!isValid) return <Navigate to={`/${game.slug}`} replace />;
  if (groupPuzzle === undefined) return <Spinner />;

  const { Component } = game;
  // La `key` força un estat net en canviar de puzle.
  return (
    <Component
      key={`${game.id}-${requested}`}
      puzzleNumber={requested}
      date={getPuzzleDate(requested)}
      puzzle={groupPuzzle ?? undefined}
    />
  );
}

/** undefined = carregant; null = no n'hi ha (o error): es fa servir el del repositori. */
function useGroupPuzzle(gameId: string, number: number | null): unknown | null | undefined {
  const designable = isDesignable(gameId) && number !== null;
  const [result, setResult] = useState<{ key: string; puzzle: unknown | null }>();
  const key = `${gameId}-${number}`;

  useEffect(() => {
    if (!designable) return;
    let cancelled = false;
    backend
      .getPublishedPuzzle(gameId, number)
      .catch(() => null)
      .then((puzzle) => !cancelled && setResult({ key, puzzle }));
    return () => {
      cancelled = true;
    };
  }, [designable, gameId, number, key]);

  if (!designable) return null;
  return result?.key === key ? result.puzzle : undefined;
}
