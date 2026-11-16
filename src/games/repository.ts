import type { GameId } from './types';
import { isThemed, pickByNumber, uniqueUntil } from './puzzles';

/** El que la vista de l'editor necessita saber dels puzles de reserva d'un joc. */
export interface Repository {
  /** El puzle de reserva d'aquest número (dades pròpies de cada joc). */
  pick: (n: number) => unknown;
  /** És un puzle temàtic d'aquest dia? */
  themed: (n: number) => boolean;
  /** Últim número amb un puzle diferent de tots els anteriors. */
  uniqueUntil: number;
  /** Text curt per veure d'un cop d'ull de què va. */
  summarize: (puzzle: unknown) => string[];
}

type Mini = {
  grid: string[];
  clues: { across: Record<number, string>; down: Record<number, string> };
};
type Fils = { theme: string; spangram: { word: string }; words: { word: string }[] };
type Connexions = { groups: { level: number; title: string; words: string[] }[] };

const LEVEL = ['🟨', '🟩', '🟦', '🟪'];

/** Carrega (a demanda) les dades d'un joc. Es fa servir només a la vista /editor/proxims. */
export async function loadRepository(game: GameId): Promise<Repository> {
  switch (game) {
    case 'paraula': {
      const { ANSWERS } = await import('./paraula/data/answers');
      return {
        pick: (n) => pickByNumber(ANSWERS, n),
        themed: (n) => isThemed(ANSWERS, n),
        uniqueUntil: uniqueUntil(ANSWERS),
        summarize: (p) => [String(p).toUpperCase()],
      };
    }
    case 'connexions': {
      const { PUZZLES } = await import('./connexions/data/puzzles');
      return {
        pick: (n) => pickByNumber(PUZZLES, n),
        themed: (n) => isThemed(PUZZLES, n),
        uniqueUntil: uniqueUntil(PUZZLES),
        summarize: (p) =>
          [...(p as Connexions).groups]
            .sort((a, b) => a.level - b.level)
            .map((g) => `${LEVEL[g.level]} ${g.title}: ${g.words.join(', ')}`),
      };
    }
    case 'fils': {
      const { PUZZLES } = await import('./fils/data/puzzles');
      return {
        pick: (n) => pickByNumber(PUZZLES, n),
        themed: (n) => isThemed(PUZZLES, n),
        uniqueUntil: uniqueUntil(PUZZLES),
        summarize: (p) => {
          const f = p as Fils;
          return [
            `Tema: ${f.theme}`,
            `Spangram: ${f.spangram.word}`,
            `Paraules: ${f.words.map((w) => w.word).join(', ')}`,
          ];
        },
      };
    }
    case 'mini': {
      const { PUZZLES } = await import('./mini/data/puzzles');
      return {
        pick: (n) => pickByNumber(PUZZLES, n),
        themed: (n) => isThemed(PUZZLES, n),
        uniqueUntil: uniqueUntil(PUZZLES),
        summarize: (p) => {
          const m = p as Mini;
          return [
            m.grid.map((r) => r.replace(/#/g, '▪')).join(' / '),
            ...Object.entries(m.clues.across)
              .slice(0, 3)
              .map(([n, c]) => `${n}H: ${c}`),
          ];
        },
      };
    }
    default:
      throw new Error(`Aquest joc no té puzles de reserva: ${game}`);
  }
}
