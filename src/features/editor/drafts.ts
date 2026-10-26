import { storage } from '@/lib/storage';
import type { DesignableGameId } from '@/services/backend';

/** Esborranys: només al navegador de qui dissenya, fins que es proposen al grup. */
export interface Draft {
  id: string;
  game: DesignableGameId;
  data: unknown;
  updatedAt: string;
}

const KEY = 'editor:drafts';
const all = () => storage.get<Draft[]>(KEY) ?? [];

export const drafts = {
  list: () => all().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
  get: (id: string) => all().find((d) => d.id === id) ?? null,
  create(game: DesignableGameId, data: unknown): Draft {
    const draft = { id: crypto.randomUUID(), game, data, updatedAt: new Date().toISOString() };
    storage.set(KEY, [...all(), draft]);
    return draft;
  },
  save(id: string, data: unknown) {
    storage.set(
      KEY,
      all().map((d) => (d.id === id ? { ...d, data, updatedAt: new Date().toISOString() } : d)),
    );
  },
  remove(id: string) {
    storage.set(
      KEY,
      all().filter((d) => d.id !== id),
    );
  },
};
