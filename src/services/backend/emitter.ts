import type { User } from './types';

/** Petit emissor per notificar canvis de sessió. */
export function createAuthEmitter() {
  const listeners = new Set<(user: User | null) => void>();
  return {
    subscribe(cb: (user: User | null) => void) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    emit(user: User | null) {
      listeners.forEach((cb) => cb(user));
    },
  };
}
