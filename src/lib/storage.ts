/** Accés segur a localStorage (pot fallar en mode privat o SSR). */
const PREFIX = 'jocmot:v1:';

export const storage = {
  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  set(key: string, value: unknown): void {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      /* quota plena o mode privat: ho ignorem */
    }
  },
  remove(key: string): void {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch {
      /* ignorem */
    }
  },
  /** Claus (sense prefix) que comencen per `startsWith`. */
  keys(startsWith = ''): string[] {
    try {
      return Object.keys(localStorage)
        .filter((k) => k.startsWith(PREFIX + startsWith))
        .map((k) => k.slice(PREFIX.length));
    } catch {
      return [];
    }
  },
};
