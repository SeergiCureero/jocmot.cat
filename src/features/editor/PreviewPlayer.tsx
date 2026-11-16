import { Suspense } from 'react';
import Spinner from '@/components/ui/Spinner';
import { getPuzzleDate, getTodayPuzzleNumber } from '@/games/puzzles';
import { GAMES } from '@/games/registry';
import type { GameId } from '@/games/types';

/** Juga un puzle amb el component real del joc, sense desar res. */
export default function PreviewPlayer({
  game,
  puzzle,
  number,
}: {
  game: GameId;
  puzzle?: unknown;
  /** Número de puzle a provar (per defecte, el d'avui). */
  number?: number;
}) {
  const { Component } = GAMES.find((g) => g.id === game)!;
  const n = number ?? getTodayPuzzleNumber();
  return (
    <Suspense fallback={<Spinner />}>
      <Component
        key={`${n}-${JSON.stringify(puzzle ?? null)}`}
        puzzle={puzzle}
        puzzleNumber={n}
        date={getPuzzleDate(n)}
        preview
      />
    </Suspense>
  );
}
