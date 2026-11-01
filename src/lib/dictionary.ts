/**
 * Diccionari de paraules vàlides (formes normalitzades, de 4 lletres o més).
 * Les llistes són a public/diccionari/v1 i es generen amb scripts/build-dictionary.py
 * a partir del diccionari de Softcatalà. Es descarreguen a trossos quan calen.
 */
const BASE = '/diccionari/v1';

/** Descodifica una llista: cada línia és "<prefix compartit en base 36><resta>". */
export function decodeList(text: string): Set<string> {
  const out = new Set<string>();
  let prev = '';
  for (const line of text.split('\n')) {
    if (!line) continue;
    const word = prev.slice(0, parseInt(line[0], 36)) + line.slice(1);
    out.add(word);
    prev = word;
  }
  return out;
}

const cache = new Map<string, Promise<Set<string> | null>>();

/** Retorna null si no s'ha pogut descarregar (sense connexió, etc.). */
function loadList(file: string): Promise<Set<string> | null> {
  let list = cache.get(file);
  if (!list) {
    list = fetch(`${BASE}/${file}`)
      .then(async (res) => {
        if (res.status === 404) return new Set<string>();
        if (!res.ok) throw new Error(String(res.status));
        return decodeList(await res.text());
      })
      .catch(() => {
        cache.delete(file); // ho tornarem a provar la propera vegada
        return null;
      });
    cache.set(file, list);
  }
  return list;
}

const fileFor = (word: string) => (word[0] === 'Ç' ? 'cc' : word[0].toLowerCase()) + '.txt';

/**
 * La paraula (ja normalitzada) és al diccionari? Si no s'ha pogut descarregar,
 * retorna null perquè qui crida decideixi (els jocs no han de bloquejar-se).
 */
export async function isWord(word: string): Promise<boolean | null> {
  if (!word) return false;
  const list = await loadList(fileFor(word));
  return list ? list.has(word) : null;
}

/** Totes les paraules de 5 lletres (per a Paraula). */
export const loadFiveLetterWords = () => loadList('5-lletres.txt');
