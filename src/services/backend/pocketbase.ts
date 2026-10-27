import type { GameId } from '@/games/types';
import { storage } from '@/lib/storage';
import { createAuthEmitter } from './emitter';
import {
  BackendError,
  type Backend,
  type PersonRef,
  type ProgressRecord,
  type PuzzleRecord,
  type ReviewRecord,
  type User,
} from './types';

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
  editor?: boolean;
}

interface PbReviewRecord {
  id: string;
  puzzle: string;
  approved: boolean;
  comment: string;
  created: string;
  updated: string;
  expand?: { author?: PbUserRecord };
}

interface PbPuzzleRecord {
  id: string;
  game: PuzzleRecord['game'];
  data: unknown;
  author: string;
  status: PuzzleRecord['status'];
  number: number;
  releaseAt: string;
  created: string;
  updated: string;
  expand?: { author?: PbUserRecord; reviews_via_puzzle?: PbReviewRecord[] };
}

/** PocketBase escriu les dates amb un espai ("2026-10-26 12:00:00.000Z"). */
const toIso = (pbDate: string) => new Date(pbDate.replace(' ', 'T')).toISOString();
const PUZZLE_EXPAND = 'expand=author,reviews_via_puzzle.author';

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
    editor: Boolean(r.editor),
  });

  const toPerson = (id: string, r?: PbUserRecord): PersonRef => ({
    id,
    username: r?.name || r?.username || '?',
  });

  const toReview = (r: PbReviewRecord): ReviewRecord => ({
    id: r.id,
    puzzleId: r.puzzle,
    author: toPerson(r.expand?.author?.id ?? '', r.expand?.author),
    approved: r.approved,
    comment: r.comment,
    created: toIso(r.created),
    updated: toIso(r.updated),
  });

  const toPuzzle = (r: PbPuzzleRecord): PuzzleRecord => ({
    id: r.id,
    game: r.game,
    data: r.data,
    author: toPerson(r.author, r.expand?.author),
    status: r.status,
    number: r.number || null,
    releaseAt: r.releaseAt ? toIso(r.releaseAt) : null,
    created: toIso(r.created),
    updated: toIso(r.updated),
    reviews: (r.expand?.reviews_via_puzzle ?? []).map(toReview),
  });

  const toProgress = (r: PbProgressRecord): ProgressRecord => {
    recordIds.set(cacheKey(r.game, r.puzzle), r.id);
    return {
      gameId: r.game,
      puzzleId: r.puzzle,
      status: r.status,
      state: r.state,
      updatedAt: toIso(r.updated),
    };
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
      if (!id)
        id = (await api.getProgress(record.gameId, record.puzzleId))
          ? recordIds.get(key)
          : undefined;

      const saved = id
        ? await request<PbProgressRecord>(`/collections/progress/records/${id}`, {
            method: 'PATCH',
            body,
          })
        : await request<PbProgressRecord>('/collections/progress/records', {
            method: 'POST',
            body,
          });
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

    async getPublishedPuzzle(game, number) {
      const q = filter(
        `game="${game}" && number=${number} && status="published" && releaseAt <= @now`,
      );
      const res = await request<{ items: Pick<PbPuzzleRecord, 'data'>[] }>(
        `/collections/puzzles/records?${q}&perPage=1&fields=data`,
      );
      return res.items[0]?.data ?? null;
    },

    async listPuzzles() {
      requireUser();
      const res = await request<{ items: PbPuzzleRecord[] }>(
        `/collections/puzzles/records?${PUZZLE_EXPAND}&perPage=500&sort=-created`,
      );
      return res.items.map(toPuzzle);
    },

    async getPuzzle(id) {
      requireUser();
      return toPuzzle(
        await request<PbPuzzleRecord>(`/collections/puzzles/records/${id}?${PUZZLE_EXPAND}`),
      );
    },

    async proposePuzzle(game, data) {
      const user = requireUser();
      const created = await request<PbPuzzleRecord>(
        `/collections/puzzles/records?${PUZZLE_EXPAND}`,
        {
          method: 'POST',
          body: JSON.stringify({ game, data, author: user.id, status: 'proposed' }),
        },
      );
      return toPuzzle(created);
    },

    async updatePuzzle(id, data) {
      await request(`/collections/puzzles/records/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ data }),
      });
    },

    async deletePuzzle(id) {
      await request(`/collections/puzzles/records/${id}`, { method: 'DELETE' });
    },

    async publishPuzzle(id, number, releaseAt) {
      await request(`/collections/puzzles/records/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'published', number, releaseAt }),
      });
    },

    async saveReview(puzzleId, { approved, comment }) {
      const user = requireUser();
      const q = filter(`puzzle="${puzzleId}" && author="${user.id}"`);
      const existing = await request<{ items: PbReviewRecord[] }>(
        `/collections/reviews/records?${q}&perPage=1`,
      );
      const id = existing.items[0]?.id;
      await request(id ? `/collections/reviews/records/${id}` : '/collections/reviews/records', {
        method: id ? 'PATCH' : 'POST',
        body: JSON.stringify({ puzzle: puzzleId, author: user.id, approved, comment }),
      });
    },

    call(path, { method = 'GET', body } = {}) {
      return request(`/jocmot${path}`, {
        method,
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    },
  };

  // Refresca la sessió en obrir l'app (p. ex. per saber si ara és editor).
  if (auth) {
    request<{ token: string; record: PbUserRecord }>('/collections/users/auth-refresh', {
      method: 'POST',
    })
      .then((res) => setAuth({ token: res.token, user: toUser(res.record) }))
      .catch(() => {
        /* sense connexió: mantenim la sessió desada; un 401 ja la tanca */
      });
  }

  return api;
}
