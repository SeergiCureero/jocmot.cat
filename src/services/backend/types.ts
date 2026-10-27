import type { GameId } from '@/games/types';

export interface User {
  id: string;
  email: string;
  username: string;
  /** Pot dissenyar i revisar puzles (ho activa un administrador). */
  editor: boolean;
}

/** Jocs amb puzles que es poden dissenyar des de l'editor. */
export type DesignableGameId = Extract<GameId, 'connexions' | 'fils' | 'mini'>;

export interface PersonRef {
  id: string;
  username: string;
}

export interface ReviewRecord {
  id: string;
  puzzleId: string;
  author: PersonRef;
  approved: boolean;
  comment: string;
  created: string;
  updated: string;
}

/** Puzle dissenyat pel grup. `data` té la mateixa forma que els puzles de `src/games/<joc>/data`. */
export interface PuzzleRecord {
  id: string;
  game: DesignableGameId;
  data: unknown;
  author: PersonRef;
  status: 'proposed' | 'published';
  /** Número de puzle assignat en publicar-lo. */
  number: number | null;
  /** ISO 8601. Moment a partir del qual el públic el pot jugar. */
  releaseAt: string | null;
  created: string;
  /** Última modificació. Les aprovacions anteriors a aquest moment no compten. */
  updated: string;
  reviews: ReviewRecord[];
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

  /** Puzle del grup publicat per a un número (null si no n'hi ha o encara no ha arribat el dia). */
  getPublishedPuzzle(game: DesignableGameId, number: number): Promise<unknown | null>;
  // Només per a editors:
  listPuzzles(): Promise<PuzzleRecord[]>;
  getPuzzle(id: string): Promise<PuzzleRecord>;
  proposePuzzle(game: DesignableGameId, data: unknown): Promise<PuzzleRecord>;
  updatePuzzle(id: string, data: unknown): Promise<void>;
  deletePuzzle(id: string): Promise<void>;
  /** Falla amb status 400 si el número ja és ocupat. */
  publishPuzzle(id: string, number: number, releaseAt: string): Promise<void>;
  saveReview(puzzleId: string, review: { approved: boolean; comment: string }): Promise<void>;

  /** Rutes pròpies del servidor (`/api/jocmot/...`: punts, amics i lligues). Sense servidor, falla. */
  call<T>(path: string, init?: { method?: 'GET' | 'POST' | 'DELETE'; body?: unknown }): Promise<T>;
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
