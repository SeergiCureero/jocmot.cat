import { formatSeconds } from '@/lib/date';
import { storage } from '@/lib/storage';
import type { GameStatus } from '@/services/backend';
import type { GameId } from './types';

/** Resum breu d'una partida, per a la portada i el resum del dia. */
export interface GameSummary {
  /** De 0 a 1. Només si se sap (p. ex. Fils necessita el puzle per saber el total). */
  progress?: number;
  /** Resultat breu: "4/6", "Sense errors", "1:23"... */
  result?: string;
}

// Només les parts de l'estat que fan falta (la portada no carrega el codi dels jocs).
type AnyState = {
  guesses?: string[];
  solved?: number[];
  mistakes?: number;
  found?: string[];
  log?: string[];
  letters?: string[];
  elapsedSeconds?: number;
};

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** Progrés que el joc ha desat (quan el càlcul necessita el puzle, com a Fils). */
const summaryKey = (game: GameId, puzzle: number) => `summary:${game}:${puzzle}`;
export const saveProgressHint = (game: GameId, puzzle: number, progress: number) =>
  storage.set(summaryKey(game, puzzle), { progress });

export function summarize(
  game: GameId,
  puzzle: number,
  status: GameStatus,
  raw: unknown,
): GameSummary {
  const s = (raw ?? {}) as AnyState;
  const saved = storage.get<GameSummary>(summaryKey(game, puzzle));
  switch (game) {
    case 'paraula': {
      const n = s.guesses?.length ?? 0;
      return { progress: n / 6, result: status === 'won' ? `${n}/6` : 'X/6' };
    }
    case 'connexions': {
      const m = s.mistakes ?? 0;
      return {
        progress: (s.solved?.length ?? 0) / 4,
        result:
          status === 'lost' ? 'No resolt' : m === 0 ? 'Sense errors' : plural(m, 'error', 'errors'),
      };
    }
    case 'fils': {
      const hints = (s.log ?? []).filter((l) => l === 'hint').length;
      return {
        progress: saved?.progress,
        result: hints === 0 ? 'Sense pistes' : plural(hints, 'pista', 'pistes'),
      };
    }
    case 'mini': {
      const cells = (s.letters ?? []).join('').replace(/#/g, '');
      const filled = cells.replace(/ /g, '').length;
      return {
        progress: cells.length ? filled / cells.length : undefined,
        result: status === 'lost' ? 'Revelat' : formatSeconds(s.elapsedSeconds ?? 0),
      };
    }
  }
}

/**
 * Missatge de la finestra de resultat.
 * - "Perfecte!": sense errors (Paraula en 3 intents o menys, Connexions sense errors,
 *   Fils sense pistes, Mini resolt sense revelar).
 * - "Per poc!": guanyat a l'últim moment (Paraula 6/6, Connexions amb 3 errors) o
 *   perdut a tocar (Connexions amb 3 grups trobats).
 * - "Molt bé!": guanyat, sense ser perfecte.
 * - "Demà més!": perdut.
 */
export function headline(game: GameId, status: GameStatus, raw: unknown): string {
  const s = (raw ?? {}) as AnyState;
  const won = status === 'won';
  switch (game) {
    case 'paraula': {
      const n = s.guesses?.length ?? 0;
      if (!won) return 'Demà més!';
      return n <= 3 ? 'Perfecte!' : n === 6 ? 'Per poc!' : 'Molt bé!';
    }
    case 'connexions': {
      const m = s.mistakes ?? 0;
      if (!won) return (s.solved?.length ?? 0) >= 3 ? 'Per poc!' : 'Demà més!';
      return m === 0 ? 'Perfecte!' : m >= 3 ? 'Per poc!' : 'Molt bé!';
    }
    case 'fils': {
      const hints = (s.log ?? []).filter((l) => l === 'hint').length;
      return hints === 0 ? 'Perfecte!' : 'Molt bé!';
    }
    case 'mini':
      return won ? 'Perfecte!' : 'Demà més!';
  }
}
