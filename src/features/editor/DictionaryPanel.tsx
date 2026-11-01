import { useEffect, useState, type FormEvent } from 'react';
import Button from '@/components/ui/Button';
import { INPUT } from '@/components/ui/styles';
import { cn } from '@/lib/cn';
import { isWord } from '@/lib/dictionary';
import { normalizeWord } from '@/lib/text';

/** Mida mínima de les llistes del diccionari (les paraules més curtes no es poden comprovar). */
const MIN_CHECK = 4;

const DIEC = (w: string) => `https://dlc.iec.cat/Results?DecEntradaText=${encodeURIComponent(w)}`;
const VICCIONARI = (w: string) => `https://ca.wiktionary.org/wiki/${encodeURIComponent(w)}`;
const SINONIMS = (w: string) =>
  `https://www.softcatala.org/sinonims/paraula/${encodeURIComponent(w)}/`;

interface Meaning {
  pos: string;
  definitions: string[];
}

type Lookup =
  | { status: 'loading' }
  | {
      status: 'done';
      word: string;
      inDictionary: boolean | null;
      meanings: Meaning[];
      suggestions: string[];
    }
  | { status: 'error'; word: string; inDictionary: boolean | null };

const API = 'https://ca.wiktionary.org/w/api.php?format=json&formatversion=2&origin=*';

/** Categories gramaticals que mostrem (títols de secció del Viccionari). */
const POS =
  /^(Nom|Verb|Adjectiu|Adverbi|Pronom|Preposició|Conjunció|Interjecció|Locució|Article|Numeral|Determinant)/;

/** Extreu les definicions catalanes d'una pàgina del Viccionari (només text, sense HTML). */
export function parseDefinitions(html: string): Meaning[] {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const meanings: Meaning[] = [];
  let inCatalan = false;
  let pos: string | null = null;
  for (const el of Array.from(doc.querySelector('.mw-parser-output')?.children ?? [])) {
    const heading = el.querySelector('h2, h3, h4') ?? (/^H[234]$/.test(el.tagName) ? el : null);
    if (heading?.tagName === 'H2') {
      if (inCatalan) break;
      inCatalan = heading.id === 'Català';
      continue;
    }
    if (!inCatalan) continue;
    if (heading) {
      const title = heading.textContent?.trim() ?? '';
      pos = POS.test(title) ? title : null;
      continue;
    }
    if (pos && el.tagName === 'OL') {
      const definitions = Array.from(el.children)
        .filter((li) => li.tagName === 'LI')
        .map((li) => {
          const copy = li.cloneNode(true) as Element;
          copy.querySelectorAll('dl, ul, ol, sup, .citacio').forEach((n) => n.remove());
          return copy.textContent?.replace(/\s+/g, ' ').trim() ?? '';
        })
        .filter(Boolean)
        .slice(0, 6);
      if (definitions.length) meanings.push({ pos, definitions });
      pos = null;
    }
  }
  return meanings;
}

async function lookup(word: string): Promise<Lookup> {
  const normalized = normalizeWord(word);
  const inDictionary = normalized.length >= MIN_CHECK ? await isWord(normalized) : null;
  try {
    const res = await fetch(
      `${API}&action=parse&prop=text&redirects=1&page=${encodeURIComponent(word)}`,
    );
    const json = await res.json();
    if (json.parse) {
      return {
        status: 'done',
        word,
        inDictionary,
        meanings: parseDefinitions(json.parse.text),
        suggestions: [],
      };
    }
    // No hi ha pàgina amb aquesta grafia (p. ex. sense accents): suggerim títols semblants.
    const search = await fetch(
      `${API}&action=query&list=search&srnamespace=0&srlimit=6&srsearch=${encodeURIComponent(word)}`,
    ).then((r) => r.json());
    const suggestions: string[] = (search.query?.search ?? []).map(
      (x: { title: string }) => x.title,
    );
    return { status: 'done', word, inDictionary, meanings: [], suggestions };
  } catch {
    return { status: 'error', word, inDictionary };
  }
}

/**
 * Consulta de paraules per a l'editor: comprova les paraules del puzle al diccionari de
 * jocmot i en mostra les definicions del Viccionari, amb enllaços al DIEC i als sinònims.
 */
export default function DictionaryPanel({ words }: { words: string[] }) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<Lookup | null>(null);

  const search = async (word: string) => {
    const w = word.trim().toLowerCase();
    if (!w) return;
    setQuery(w);
    setResult({ status: 'loading' });
    setResult(await lookup(w));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    search(query);
  };

  return (
    <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-4">
      <h2 className="mb-2 font-semibold">📖 Diccionari</h2>
      <WordCheck words={words} onPick={search} />
      <form onSubmit={submit} className="mt-3 flex gap-2">
        <input
          className={INPUT}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Busca una paraula…"
          aria-label="Paraula per buscar"
        />
        <Button type="submit" variant="secondary" disabled={!query.trim()}>
          Busca
        </Button>
      </form>
      {result && <LookupResult result={result} onPick={search} />}
    </section>
  );
}

/** Marca les paraules del puzle que no són al diccionari. */
function WordCheck({ words, onPick }: { words: string[]; onPick: (w: string) => void }) {
  const key = words
    .map(normalizeWord)
    .filter((w) => w.length >= MIN_CHECK)
    .join(',');
  const [missing, setMissing] = useState<string[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    const list = key ? [...new Set(key.split(','))] : [];
    // Esperem una mica perquè no es consulti a cada tecla.
    const id = setTimeout(async () => {
      const checks = await Promise.all(list.map(async (w) => [w, await isWord(w)] as const));
      if (!cancelled) setMissing(checks.filter(([, ok]) => ok === false).map(([w]) => w));
    }, 500);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [key]);

  if (!key || missing === null) return null;
  if (!missing.length) {
    return (
      <p className="text-sm text-green-800">✓ Totes les paraules del puzle són al diccionari.</p>
    );
  }
  return (
    <div className="text-sm text-amber-900">
      <p>
        No trobem aquestes paraules al diccionari. Pot ser correcte si són noms propis o
        expressions, però revisa-les:
      </p>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {missing.map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => onPick(w)}
            className="rounded-full bg-amber-100 px-2.5 py-0.5 font-semibold hover:bg-amber-200"
          >
            {w}
          </button>
        ))}
      </div>
    </div>
  );
}

function LookupResult({ result, onPick }: { result: Lookup; onPick: (w: string) => void }) {
  if (result.status === 'loading') return <p className="mt-3 text-sm text-stone-500">Buscant…</p>;
  const { word, inDictionary } = result;
  return (
    <div className="mt-3 space-y-3 text-sm">
      <p className="flex flex-wrap items-center gap-2">
        <strong className="text-base">{word}</strong>
        {inDictionary !== null && (
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-semibold',
              inDictionary ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-900',
            )}
          >
            {inDictionary ? 'Al diccionari de jocmot' : 'No és al diccionari de jocmot'}
          </span>
        )}
      </p>
      <p className="flex flex-wrap gap-3">
        <a
          className="text-brand-700 font-semibold hover:underline"
          href={DIEC(word)}
          target="_blank"
          rel="noreferrer"
        >
          Obre al DIEC ↗
        </a>
        <a
          className="text-brand-700 font-semibold hover:underline"
          href={VICCIONARI(word)}
          target="_blank"
          rel="noreferrer"
        >
          Viccionari ↗
        </a>
        <a
          className="text-brand-700 font-semibold hover:underline"
          href={SINONIMS(word)}
          target="_blank"
          rel="noreferrer"
        >
          Sinònims ↗
        </a>
      </p>
      {result.status === 'error' && (
        <p className="text-stone-500">No s’ha pogut consultar el Viccionari.</p>
      )}
      {result.status === 'done' && (
        <>
          {result.meanings.map((m, i) => (
            <div key={i}>
              <p className="font-semibold text-stone-700">{m.pos}</p>
              <ol className="list-decimal space-y-0.5 pl-5">
                {m.definitions.map((d, j) => (
                  <li key={j}>{d}</li>
                ))}
              </ol>
            </div>
          ))}
          {!result.meanings.length && !result.suggestions.length && (
            <p className="text-stone-500">El Viccionari no en té definicions en català.</p>
          )}
          {result.suggestions.length > 0 && (
            <p className="text-stone-600">
              Potser volies:{' '}
              {result.suggestions.map((s, i) => (
                <span key={s}>
                  {i > 0 && ', '}
                  <button
                    type="button"
                    className="text-brand-700 hover:underline"
                    onClick={() => onPick(s)}
                  >
                    {s}
                  </button>
                </span>
              ))}
            </p>
          )}
          {result.meanings.length > 0 && (
            <p className="text-xs text-stone-500">
              Definicions del{' '}
              <a className="underline" href={VICCIONARI(word)} target="_blank" rel="noreferrer">
                Viccionari
              </a>{' '}
              (CC BY-SA). Per a la norma, consulta sempre el DIEC.
            </p>
          )}
        </>
      )}
    </div>
  );
}
