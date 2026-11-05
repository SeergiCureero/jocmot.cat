import { useSyncExternalStore } from 'react';
import { storage } from '@/lib/storage';

/** Preferències del dispositiu (es desen al navegador i s'apliquen a l'instant). */
export interface Settings {
  /** Colors per a daltonisme: taronja/blau a Paraula i símbols a Connexions. */
  highContrast: boolean;
  /** Vibració curta en encertar o fallar (als mòbils que ho permeten). */
  vibration: boolean;
  /** 'system' = el que digui el sistema; 'reduce' = menys animacions; 'full' = totes. */
  motion: 'system' | 'reduce' | 'full';
}

const KEY = 'settings';
const DEFAULTS: Settings = { highContrast: false, vibration: true, motion: 'system' };

let current: Settings = { ...DEFAULTS, ...storage.get<Partial<Settings>>(KEY) };
const listeners = new Set<() => void>();

/** Posa les preferències a <html> perquè el CSS les apliqui (data-contrast, data-motion). */
export function applySettings(s: Settings = current) {
  const root = document.documentElement;
  if (s.highContrast) root.dataset.contrast = 'high';
  else delete root.dataset.contrast;
  if (s.motion === 'system') delete root.dataset.motion;
  else root.dataset.motion = s.motion;
}

export function getSettings(): Settings {
  return current;
}

export function updateSettings(patch: Partial<Settings>) {
  current = { ...current, ...patch };
  storage.set(KEY, current);
  applySettings(current);
  listeners.forEach((l) => l());
}

export function useSettings(): Settings {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
  );
}

/** Animacions reduïdes ara mateix (preferència forçada o la del sistema). */
export function prefersReducedMotion(): boolean {
  if (current.motion === 'reduce') return true;
  if (current.motion === 'full') return false;
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Vibració curta: 'ok' en encertar, 'error' en fallar. Només si l'usuari no l'ha desactivada
 * i el dispositiu ho permet (els iPhone no tenen navigator.vibrate: no hi fa res).
 */
export function vibrate(kind: 'ok' | 'error') {
  if (!current.vibration) return;
  try {
    navigator.vibrate?.(kind === 'ok' ? 30 : [40, 60, 40]);
  } catch {
    /* alguns navegadors ho bloquegen sense interacció: no passa res */
  }
}
