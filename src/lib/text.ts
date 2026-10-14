/**
 * Normalitza text per comparar paraules en català:
 * majúscules, sense accents ni dièresis, conserva la Ç, treu el punt volat (l·l → ll).
 */
export function normalizeWord(input: string): string {
  return input
    .trim()
    .toUpperCase()
    .replace(/Ç/g, '\u0000')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0000/g, 'Ç')
    .replace(/[·.\-\s']/g, '');
}

/** Primera lletra en majúscula. */
export function capitalize(input: string): string {
  return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
}
