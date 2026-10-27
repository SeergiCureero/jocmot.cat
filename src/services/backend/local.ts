import type { GameId } from '@/games/types';
import { storage } from '@/lib/storage';
import { createAuthEmitter } from './emitter';
import {
  BackendError,
  type Backend,
  type DesignableGameId,
  type ProgressRecord,
  type PuzzleRecord,
  type ReviewRecord,
  type User,
} from './types';

/**
 * ⚠️ NOMÉS PER A DESENVOLUPAMENT.
 * Simula comptes i progrés dins del navegador perquè es pugui provar tot el flux
 * sense servidor. No és segur ni sincronitza entre dispositius.
 */
interface StoredUser extends Omit<User, 'editor'> {
  passwordHash: string;
}

interface StoredPuzzle extends Omit<PuzzleRecord, 'author' | 'reviews'> {
  authorId: string;
}

interface StoredReview extends Omit<ReviewRecord, 'author'> {
  authorId: string;
}

const USERS_KEY = 'dev:users';
const PUZZLES_KEY = 'dev:puzzles';
const REVIEWS_KEY = 'dev:reviews';
const SESSION_KEY = 'dev:session';
const progressKey = (userId: string, gameId: string, puzzleId: number) =>
  `dev:progress:${userId}:${gameId}:${puzzleId}`;

async function hash(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

// En mode local tothom és editor, per poder provar l'editor sense servidor.
const toPublic = ({ id, email, username }: StoredUser): User => ({
  id,
  email,
  username,
  editor: true,
});

export function createLocalBackend(): Backend {
  const emitter = createAuthEmitter();
  const users = () => storage.get<StoredUser[]>(USERS_KEY) ?? [];
  let current: User | null = storage.get<User>(SESSION_KEY);
  if (current) current = { ...current, editor: true };

  const puzzles = () => storage.get<StoredPuzzle[]>(PUZZLES_KEY) ?? [];
  const reviews = () => storage.get<StoredReview[]>(REVIEWS_KEY) ?? [];
  const person = (id: string) => ({
    id,
    username: users().find((u) => u.id === id)?.username ?? '?',
  });
  const toRecord = ({ authorId, ...p }: StoredPuzzle): PuzzleRecord => ({
    ...p,
    author: person(authorId),
    reviews: reviews()
      .filter((r) => r.puzzleId === p.id)
      .map(({ authorId: a, ...r }) => ({ ...r, author: person(a) })),
  });
  const findPuzzle = (id: string) => {
    const p = puzzles().find((x) => x.id === id);
    if (!p) throw new BackendError('No existeix', 404);
    return p;
  };
  const writePuzzle = (id: string, patch: Partial<StoredPuzzle>) =>
    storage.set(
      PUZZLES_KEY,
      puzzles().map((p) => (p.id === id ? { ...p, ...patch } : p)),
    );

  const setSession = (user: User | null) => {
    current = user;
    if (user) storage.set(SESSION_KEY, user);
    else storage.remove(SESSION_KEY);
    emitter.emit(user);
  };

  const requireUser = () => {
    if (!current) throw new BackendError('Cal iniciar sessió', 401);
    return current;
  };

  return {
    kind: 'local',
    getCurrentUser: () => current,
    onAuthChange: emitter.subscribe,

    async register({ email, username, password }) {
      const all = users();
      if (all.some((u) => u.email === email.toLowerCase())) {
        throw new BackendError('Ja existeix un compte amb aquest correu', 400);
      }
      const user: StoredUser = {
        id: crypto.randomUUID(),
        email: email.toLowerCase(),
        username,
        passwordHash: await hash(password),
      };
      storage.set(USERS_KEY, [...all, user]);
      setSession(toPublic(user));
      return toPublic(user);
    },

    async login(email, password) {
      const passwordHash = await hash(password);
      const user = users().find((u) => u.email === email.toLowerCase());
      if (!user || user.passwordHash !== passwordHash) {
        throw new BackendError('Correu o contrasenya incorrectes', 400);
      }
      setSession(toPublic(user));
      return toPublic(user);
    },

    logout: () => setSession(null),

    async getProgress(gameId, puzzleId) {
      const user = requireUser();
      return storage.get<ProgressRecord>(progressKey(user.id, gameId, puzzleId));
    },

    async saveProgress(record) {
      const user = requireUser();
      storage.set(progressKey(user.id, record.gameId, record.puzzleId), record);
    },

    async listProgress(gameId?: GameId) {
      const user = requireUser();
      const prefix = `dev:progress:${user.id}:${gameId ?? ''}`;
      return storage
        .keys(prefix)
        .map((k) => storage.get<ProgressRecord>(k))
        .filter((r): r is ProgressRecord => r !== null);
    },

    async getPublishedPuzzle(game, number) {
      const now = new Date().toISOString();
      const p = puzzles().find(
        (x) =>
          x.game === game && x.number === number && x.status === 'published' && x.releaseAt! <= now,
      );
      return p?.data ?? null;
    },

    async listPuzzles() {
      requireUser();
      return puzzles().map(toRecord);
    },

    async getPuzzle(id) {
      requireUser();
      return toRecord(findPuzzle(id));
    },

    async proposePuzzle(game: DesignableGameId, data) {
      const user = requireUser();
      const p: StoredPuzzle = {
        id: crypto.randomUUID(),
        game,
        data,
        authorId: user.id,
        status: 'proposed',
        number: null,
        releaseAt: null,
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      };
      storage.set(PUZZLES_KEY, [...puzzles(), p]);
      return toRecord(p);
    },

    async updatePuzzle(id, data) {
      requireUser();
      if (findPuzzle(id).status !== 'proposed') throw new BackendError('Ja està publicat', 403);
      writePuzzle(id, { data, updated: new Date().toISOString() });
    },

    async deletePuzzle(id) {
      const user = requireUser();
      const p = findPuzzle(id);
      if (p.authorId !== user.id || p.status !== 'proposed')
        throw new BackendError('No permès', 403);
      storage.set(
        PUZZLES_KEY,
        puzzles().filter((x) => x.id !== id),
      );
      storage.set(
        REVIEWS_KEY,
        reviews().filter((r) => r.puzzleId !== id),
      );
    },

    async publishPuzzle(id, number, releaseAt) {
      requireUser();
      const p = findPuzzle(id);
      if (puzzles().some((x) => x.game === p.game && x.number === number)) {
        throw new BackendError('Número ocupat', 400);
      }
      writePuzzle(id, {
        status: 'published',
        number,
        releaseAt,
        updated: new Date().toISOString(),
      });
    },

    async saveReview(puzzleId, { approved, comment }) {
      const user = requireUser();
      if (approved && findPuzzle(puzzleId).authorId === user.id) {
        throw new BackendError('No pots aprovar el teu puzle', 403);
      }
      const others = reviews().filter((r) => !(r.puzzleId === puzzleId && r.authorId === user.id));
      const review: StoredReview = {
        id: crypto.randomUUID(),
        puzzleId,
        authorId: user.id,
        approved,
        comment,
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      };
      storage.set(REVIEWS_KEY, [...others, review]);
    },

    async call() {
      throw new BackendError('Cal el servidor', 503);
    },
  };
}
