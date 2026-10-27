import { SITE } from '@/config/site';
import { getPuzzleDate, getTodayPuzzleNumber } from '@/games/puzzles';
import { startOfDayInTimeZone } from '@/lib/date';
import { backend, BackendError, type PuzzleRecord } from '@/services/backend';

/** Aprovacions d'altres editors necessàries per publicar un puzle. */
export const APPROVALS_NEEDED = 2;

/**
 * Aprovacions vàlides: d'altres editors i posteriors a l'última modificació del puzle.
 * Un cop publicat ja no es pot modificar (publicar-lo també en canvia la data), així que totes compten.
 */
export function validApprovals(p: PuzzleRecord) {
  return p.reviews.filter(
    (r) =>
      r.approved &&
      r.author.id !== p.author.id &&
      (p.status === 'published' || r.updated >= p.updated),
  );
}

/** Primer número lliure a partir de demà (avui la gent ja pot estar jugant el del dia). */
export function firstFreeNumber(taken: number[], today: number): number {
  const used = new Set(taken);
  let n = today + 1;
  while (used.has(n)) n++;
  return n;
}

export const releaseAtFor = (number: number) =>
  startOfDayInTimeZone(getPuzzleDate(number), SITE.timeZone).toISOString();

/** Si el puzle ja té prou aprovacions, l'assigna al primer dia lliure. Retorna el puzle actualitzat. */
export async function publishIfReady(id: string): Promise<PuzzleRecord> {
  const puzzle = await backend.getPuzzle(id);
  if (puzzle.status !== 'proposed' || validApprovals(puzzle).length < APPROVALS_NEEDED)
    return puzzle;

  // Si dos editors publiquen alhora, l'índex únic en rebutja un: es torna a provar amb el següent número.
  for (let attempt = 0; attempt < 5; attempt++) {
    const taken = (await backend.listPuzzles())
      .filter((p) => p.game === puzzle.game && p.number !== null)
      .map((p) => p.number!);
    const number = firstFreeNumber(taken, getTodayPuzzleNumber());
    try {
      await backend.publishPuzzle(id, number, releaseAtFor(number));
      return backend.getPuzzle(id);
    } catch (e) {
      if (!(e instanceof BackendError && e.status === 400)) throw e;
    }
  }
  throw new BackendError('No s’ha pogut assignar un dia. Torna-ho a provar.');
}
