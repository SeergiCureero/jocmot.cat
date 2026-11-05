import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { vibrate } from '@/features/settings/settings';
import { cn } from '@/lib/cn';

export type MessageKind = 'error' | 'ok' | 'info';
export interface GameMessageState {
  id: number;
  text: string;
  kind: MessageKind;
}

/**
 * Avisos curts dels jocs ("Aquesta paraula no és al diccionari"). Es mostren al costat del
 * tauler, en un espai reservat (no tapen res ni fan saltar res), i els lectors de pantalla
 * els llegeixen. En encertar o fallar, vibra (si està activat a Configuració).
 */
export function useGameMessage() {
  const [message, setMessage] = useState<GameMessageState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const say = useCallback((text: string, kind: MessageKind = 'info', ms = 2500) => {
    clearTimeout(timer.current);
    setMessage((m) => ({ id: (m?.id ?? 0) + 1, text, kind }));
    timer.current = setTimeout(() => setMessage(null), ms);
    if (kind !== 'info') vibrate(kind);
  }, []);

  return { message, say };
}

/** Línia de l'avís. Sempre ocupa el mateix espai, hi hagi avís o no. */
export function GameMessageLine({
  message,
  fallback,
  className,
}: {
  message: GameMessageState | null;
  fallback?: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn('flex h-9 w-full items-center justify-center', className)}
    >
      {!message && fallback}
      {message && (
        <span
          key={message.id}
          className={cn(
            'animate-fade-in rounded-full px-3 py-1 text-center text-sm font-semibold',
            message.kind === 'error' && 'bg-red-50 text-red-800',
            message.kind === 'ok' && 'bg-stone-900 text-white',
            message.kind === 'info' && 'bg-stone-100 text-stone-800',
          )}
        >
          {message.text}
        </span>
      )}
    </div>
  );
}
