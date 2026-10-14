import type { GameId } from '@/games/types';

export interface User {
  id: string;
  email: string;
  username: string;
}

export type GameStatus = 'playing' | 'won' | 'lost';

/** Progrés d'un usuari en un puzle concret. `state` és propi de cada joc (JSON). */
export interface ProgressRecord<S = unknown> {
  gameId: GameId;
  puzzleId: number;
  status: GameStatus;
  state: S;
  /** ISO 8601. S'usa per decidir quina còpia (local/remota) és més nova. */
  updatedAt: string;
}

export interface RegisterInput {
  email: string;
  username: string;
  password: string;
}

/**
 * Contracte del backend. Qualsevol proveïdor (PocketBase, Supabase, API pròpia...)
 * només ha d'implementar aquesta interfície.
 */
export interface Backend {
  readonly kind: 'local' | 'pocketbase';

  getCurrentUser(): User | null;
  register(input: RegisterInput): Promise<User>;
  login(email: string, password: string): Promise<User>;
  logout(): void;
  onAuthChange(callback: (user: User | null) => void): () => void;

  getProgress(gameId: GameId, puzzleId: number): Promise<ProgressRecord | null>;
  saveProgress(record: ProgressRecord): Promise<void>;
  listProgress(gameId?: GameId): Promise<ProgressRecord[]>;
}

export class BackendError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'BackendError';
  }
}
