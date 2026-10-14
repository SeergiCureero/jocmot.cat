import type { GameId } from '@/games/types';
import { storage } from '@/lib/storage';
import { createAuthEmitter } from './emitter';
import { BackendError, type Backend, type ProgressRecord, type User } from './types';

/**
 * ⚠️ NOMÉS PER A DESENVOLUPAMENT.
 * Simula comptes i progrés dins del navegador perquè es pugui provar tot el flux
 * sense servidor. No és segur ni sincronitza entre dispositius.
 */
interface StoredUser extends User {
  passwordHash: string;
}

const USERS_KEY = 'dev:users';
const SESSION_KEY = 'dev:session';
const progressKey = (userId: string, gameId: string, puzzleId: number) =>
  `dev:progress:${userId}:${gameId}:${puzzleId}`;

async function hash(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

const toPublic = ({ id, email, username }: StoredUser): User => ({ id, email, username });

export function createLocalBackend(): Backend {
  const emitter = createAuthEmitter();
  const users = () => storage.get<StoredUser[]>(USERS_KEY) ?? [];
  let current: User | null = storage.get<User>(SESSION_KEY);

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
  };
}
