import type { DesignableGameId } from '@/services/backend';
import { connexionsKit } from './connexions';
import { filsKit } from './fils';
import { miniKit } from './mini';
import type { EditorKit } from './types';

/** Kit d'edició de cada joc. L'esborrany és opac per a les pàgines: només el kit en coneix la forma. */
export const KITS = {
  connexions: connexionsKit,
  fils: filsKit,
  mini: miniKit,
} as unknown as Record<DesignableGameId, EditorKit<unknown>>;
