import type { GameId } from '@/games/types';
import { storage } from '@/lib/storage';
import { createAuthEmitter } from './emitter';
import { BackendError, type Backend, type ProgressRecord, type User } from './types';

/**
 * Backend amb PocketBase (https://pocketbase.io) via REST, sense SDK.
 * Un sol binari, autoallotjable (p. ex. a Hetzner). Esquema a docs/BACKEND.md.
 */
interface PbAuth {
  token: string;
  user: User;
}

interface PbUserRecord {
  id: string;
  email: string;
  username?: string;
  name?: string;
}

interface PbProgressRecord {
  id: string;
  game: GameId;
  puzzle: number;
  status: ProgressRecord['status'];
  state: unknown;
  updated: string;
}

const AUTH_KEY = 'pb:auth';

export function createPocketBaseBackend(baseUrl: string): Backend {
  const emitter = createAuthEmitter();
  let auth: PbAuth | null = storage.get<PbAuth>(AUTH_KEY);
  /** Cache clau → id de registre per fer PATCH en lloc de POST. */
  const recordIds = new Map<string, string>();
  const cacheKey = (g: string, p: number) => `${g}:${p}`;

  const setAuth = (next: PbAuth | null) => {
    auth = next;
    if (next) storage.set(AUTH_KEY, next);
    else storage.remove(AUTH_KEY);
    recordIds.clear();
    emitter.emit(next?.user ?? null);
  };

  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/api${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { Authorization: auth.token } : {}),
        ...init.headers,
      },
    });
    if (res.status === 401) setAuth(null);
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { message?: string };
      throw new BackendError(body.message ?? `Error ${res.status}`, res.status);
    }
    return (res.status === 204 ? undefined : await res.json()) as T;
  }

  const toUser = (r: PbUserRecord): User => ({
    id: r.id,
    email: r.email,
    username: r.username ?? r.name ?? r.email.split('@')[0],
  });

  const toProgress = (r: PbProgressRecord): ProgressRecord => {
    recordIds.set(cacheKey(r.game, r.puzzle), r.id);
    return { gameId: r.game, puzzleId: r.puzzle, status: r.status, state: r.state, updatedAt: new Date(r.updated.replace(' ', 'T')).toISOString() };
  };

  const requireUser = () => {
    if (!auth) throw new BackendError('Cal iniciar sessió', 401);
    return auth.user;
  };

  const filter = (expr: string) => `filter=${encodeURIComponent(expr)}`;

  const api: Backend = {
    kind: 'pocketbase',
    getCurrentUser: () => auth?.user ?? null,
    onAuthChange: emitter.subscribe,

    async register({ email, username, password }) {
      await request('/collections/users/records', {
        method: 'POST',
        body: JSON.stringify({ email, name: username, password, passwordConfirm: password }),
      });
      return api.login(email, password);
    },

    async login(email, password) {
      const res = await request<{ token: string; record: PbUserRecord }>(
        '/collections/users/auth-with-password',
        { method: 'POST', body: JSON.stringify({ identity: email, password }) },
      );
      const user = toUser(res.record);
      setAuth({ token: res.token, user });
      return user;
    },

    logout: () => setAuth(null),

    async getProgress(gameId, puzzleId) {
      const user = requireUser();
      const q = filter(`user="${user.id}" && game="${gameId}" && puzzle=${puzzleId}`);
      const res = await request<{ items: PbProgressRecord[] }>(
        `/collections/progress/records?${q}&perPage=1`,
      );
      return res.items[0] ? toProgress(res.items[0]) : null;
    },

    async saveProgress(record) {
      const user = requireUser();
      const body = JSON.stringify({
        user: user.id,
        game: record.gameId,
        puzzle: record.puzzleId,
        status: record.status,
        state: record.state,
      });
      const key = cacheKey(record.gameId, record.puzzleId);
      let id = recordIds.get(key);
      if (!id) id = (await api.getProgress(record.gameId, record.puzzleId)) ? recordIds.get(key) : undefined;

      const saved = id
        ? await request<PbProgressRecord>(`/collections/progress/records/${id}`, { method: 'PATCH', body })
        : await request<PbProgressRecord>('/collections/progress/records', { method: 'POST', body });
      recordIds.set(key, saved.id);
    },

    async listProgress(gameId?: GameId) {
      const user = requireUser();
      const expr = gameId ? `user="${user.id}" && game="${gameId}"` : `user="${user.id}"`;
      const res = await request<{ items: PbProgressRecord[] }>(
        `/collections/progress/records?${filter(expr)}&perPage=500&sort=-puzzle`,
      );
      return res.items.map(toProgress);
    },
  };

  return api;
}
