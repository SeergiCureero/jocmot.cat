import { Suspense } from 'react';
import Spinner from '@/components/ui/Spinner';
import { getPuzzleDate, getTodayPuzzleNumber } from '@/games/puzzles';
import { GAMES } from '@/games/registry';
import type { DesignableGameId } from '@/services/backend';

/** Juga un puzle amb el component real del joc, sense desar res. */
export default function PreviewPlayer({
  game,
  puzzle,
}: {
  game: DesignableGameId;
  puzzle: unknown;
}) {
  const { Component } = GAMES.find((g) => g.id === game)!;
  const today = getTodayPuzzleNumber();
  return (
    <Suspense fallback={<Spinner />}>
      <Component
        key={JSON.stringify(puzzle)}
        puzzle={puzzle}
        puzzleNumber={today}
        date={getPuzzleDate(today)}
        preview
      />
    </Suspense>
  );
}
