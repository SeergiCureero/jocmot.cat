import { FEATURES } from '@/config/site';
import type { GameId } from '@/games/types';
import { storage } from '@/lib/storage';
import { backend } from '@/services/backend';

/** Pistes destapades d'un puzle: quantes (sense la solució) i si s'ha vist la solució. */
export interface HintUse {
  count: number;
  solution: boolean;
}

export const NO_HINTS: HintUse = { count: 0, solution: false };

/** Punts que resta cada pista (ha de coincidir amb HINT_PENALTY de backend/pb_hooks/jocmot.js). */
export const HINT_PENALTY = 3;

const key = (game: GameId, puzzle: number) => `pistes:${game}:${puzzle}`;

export const localHintUse = (game: GameId, puzzle: number): HintUse =>
  storage.get<HintUse>(key(game, puzzle)) ?? NO_HINTS;

export const mergeUse = (a: HintUse, b: HintUse): HintUse => ({
  count: Math.max(a.count, b.count),
  solution: a.solution || b.solution,
});

/** Desa al dispositiu i, amb compte, al servidor (que la té en compte en calcular els punts). */
export async function saveHintUse(game: GameId, puzzle: number, use: HintUse, loggedIn: boolean) {
  storage.set(key(game, puzzle), mergeUse(localHintUse(game, puzzle), use));
  if (FEATURES.social && loggedIn)
    await backend.call(`/pistes/${game}/${puzzle}`, { method: 'POST', body: use });
}

/** Pistes que el servidor té apuntades per a un número de puzle (per a tots els jocs). */
export async function serverHintUses(puzzle: number): Promise<Partial<Record<GameId, HintUse>>> {
  const { games } = await backend.call<{ games: Partial<Record<GameId, HintUse>> }>(
    `/pistes/${puzzle}`,
  );
  return games;
}
