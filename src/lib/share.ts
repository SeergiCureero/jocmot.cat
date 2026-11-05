/**
 * Comparteix un text. Als mòbils (pantalla tàctil) obre el menú de compartir del sistema;
 * si no n'hi ha, el copia. Retorna 'copied' perquè la pantalla mostri "Copiat!".
 */
export async function shareText(
  text: string,
): Promise<'shared' | 'copied' | 'cancelled' | 'failed'> {
  const touch = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
  if (touch && typeof navigator.share === 'function') {
    try {
      await navigator.share({ text });
      return 'shared';
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return 'cancelled';
      // Si el sistema falla, provem de copiar.
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    return 'failed';
  }
}
