import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import type { GameId } from '@/games/types';
import { storage } from '@/lib/storage';
import { backend, type GameStatus, type ProgressRecord } from '@/services/backend';

interface Options<S> {
  gameId: GameId;
  puzzleId: number;
  initialState: () => S;
  getStatus: (state: S) => GameStatus;
  /** false = mode prova (editor): no es desa enlloc. */
  persist?: boolean;
}

const REMOTE_DEBOUNCE_MS = 1500;
const localKey = (gameId: string, puzzleId: number) => `progress:${gameId}:${puzzleId}`;

/**
 * Estat persistent d'un puzle.
 * - Sempre es guarda al navegador (funciona sense compte).
 * - Si hi ha sessió, se sincronitza amb el backend: guanya la còpia més recent.
 *
 * El component del joc s'ha de muntar amb `key` per puzle (ho fa GameRoute).
 */
export function useGameProgress<S>({
  gameId,
  puzzleId,
  initialState,
  getStatus,
  persist = true,
}: Options<S>) {
  const { user: sessionUser } = useAuth();
  const user = persist ? sessionUser : null;
  const [state, setState] = useState<S>(
    () =>
      (persist ? storage.get<ProgressRecord<S>>(localKey(gameId, puzzleId))?.state : null) ??
      initialState(),
  );
  const [syncing, setSyncing] = useState(false);

  const pendingRemote = useRef<ProgressRecord<S> | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const flushRemote = useCallback(() => {
    clearTimeout(timer.current);
    const record = pendingRemote.current;
    pendingRemote.current = null;
    if (record && backend.getCurrentUser()) backend.saveProgress(record).catch(console.error);
  }, []);

  // Sincronització inicial amb el servidor quan hi ha sessió (per id: refrescar la sessió no la repeteix).
  const userId = user?.id;
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setSyncing(true);
    backend
      .getProgress(gameId, puzzleId)
      .then((remote) => {
        if (cancelled) return;
        const local = storage.get<ProgressRecord<S>>(localKey(gameId, puzzleId));
        if (remote && (!local || remote.updatedAt > local.updatedAt)) {
          storage.set(localKey(gameId, puzzleId), remote);
          setState(remote.state as S);
        } else if (local) {
          backend.saveProgress(local).catch(console.error);
        }
      })
      .catch(console.error)
      .finally(() => !cancelled && setSyncing(false));
    return () => {
      cancelled = true;
    };
  }, [userId, gameId, puzzleId]);

  // Envia el que quedi pendent en sortir de la pàgina o desmuntar.
  useEffect(() => {
    window.addEventListener('pagehide', flushRemote);
    return () => {
      window.removeEventListener('pagehide', flushRemote);
      flushRemote();
    };
  }, [flushRemote]);

  const update = useCallback(
    (updater: (prev: S) => S) => {
      setState((prev) => {
        const next = updater(prev);
        if (next === prev || !persist) return next;
        const record: ProgressRecord<S> = {
          gameId,
          puzzleId,
          status: getStatus(next),
          state: next,
          updatedAt: new Date().toISOString(),
        };
        storage.set(localKey(gameId, puzzleId), record);
        pendingRemote.current = record;
        clearTimeout(timer.current);
        // En acabar la partida s'envia de seguida: el servidor en calcula els punts.
        timer.current = setTimeout(
          flushRemote,
          record.status === 'playing' ? REMOTE_DEBOUNCE_MS : 0,
        );
        return next;
      });
    },
    [gameId, puzzleId, getStatus, flushRemote, persist],
  );

  return { state, update, status: getStatus(state), syncing };
}

/**
 * Puja al servidor el progrés local que hi falti o sigui més nou (p. ex. puzles
 * jugats abans d'iniciar sessió) i retorna tots els registres de l'usuari.
 */
export async function syncLocalProgress(): Promise<ProgressRecord[]> {
  const remote = new Map(
    (await backend.listProgress()).map((r) => [localKey(r.gameId, r.puzzleId), r]),
  );
  for (const key of storage.keys('progress:')) {
    const local = storage.get<ProgressRecord>(key);
    const current = remote.get(key);
    if (local && (!current || local.updatedAt > current.updatedAt)) {
      // Si un registre falla, la resta continua (i el local es torna a provar el proper cop).
      await backend.saveProgress(local).then(
        () => remote.set(key, local),
        (e) => console.warn('No s’ha pogut pujar el progrés', key, e),
      );
    }
  }
  return [...remote.values()];
}
