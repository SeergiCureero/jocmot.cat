export type ShareOutcome = 'shared' | 'copied' | 'failed';

/** Comparteix amb l'API nativa (mòbil) o copia al porta-retalls (escriptori). */
export async function shareText(text: string): Promise<ShareOutcome> {
  const isTouch = typeof window !== 'undefined' && matchMedia('(pointer: coarse)').matches;
  if (isTouch && navigator.share) {
    try {
      await navigator.share({ text });
      return 'shared';
    } catch {
      /* cancel·lat per l'usuari: provem de copiar */
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    return 'failed';
  }
}
