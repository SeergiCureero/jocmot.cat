import { createLocalBackend } from './local';
import { createPocketBaseBackend } from './pocketbase';
import type { Backend } from './types';

export * from './types';

/** Instància única del backend, escollida segons l'entorn. */
const pocketBaseUrl = import.meta.env.VITE_POCKETBASE_URL;

export const backend: Backend = pocketBaseUrl
  ? createPocketBaseBackend(pocketBaseUrl)
  : createLocalBackend();
