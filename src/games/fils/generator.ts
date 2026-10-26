import { seededRandom, shuffle } from '@/lib/random';
import { COLS, ROWS } from './logic';
import type { Cell, FilsPuzzle } from './types';

/**
 * Generador de graelles de Fils (port de scripts/generate-fils.py).
 * Col·loca l'spangram i les paraules amb recorreguts que no s'encreuen
 * i omplen tota la graella. Retorna null si no ho aconsegueix a temps.
 */

type Key = number; // fila * COLS + columna
const key = (r: number, c: number): Key => r * COLS + c;
const cellOf = (k: Key): Cell => [Math.floor(k / COLS), k % COLS];

function neighbours(k: Key): Key[] {
  const [r, c] = cellOf(k);
  const out: Key[] = [];
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      const rr = r + dr;
      const cc = c + dc;
      if ((dr || dc) && rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS) out.push(key(rr, cc));
    }
  return out;
}

const diagKey = (a: Key, b: Key) => (a < b ? `${a}-${b}` : `${b}-${a}`);

/** Un pas en diagonal no pot creuar una diagonal ja usada al mateix quadrat 2×2. */
function crosses(a: Key, b: Key, diags: Set<string>): boolean {
  const [ar, ac] = cellOf(a);
  const [br, bc] = cellOf(b);
  if (ar === br || ac === bc) return false;
  return diags.has(diagKey(key(ar, bc), key(br, ac)));
}

function spans(path: Key[]): boolean {
  const rows = new Set(path.map((k) => cellOf(k)[0]));
  const cols = new Set(path.map((k) => cellOf(k)[1]));
  return (cols.has(0) && cols.has(COLS - 1)) || (rows.has(0) && rows.has(ROWS - 1));
}

interface Ctx {
  rand: () => number;
  deadline: number;
}

function pathFor(
  length: number,
  start: Key,
  free: Set<Key>,
  diags: Set<string>,
  spangram: boolean,
  ctx: Ctx,
) {
  const path = [start];
  const used = new Set(diags);
  const dfs = (): boolean => {
    if (Date.now() > ctx.deadline) return false;
    if (path.length === length) return !spangram || spans(path);
    const last = path[path.length - 1];
    for (const q of shuffle(neighbours(last), ctx.rand)) {
      if (!free.has(q) || path.includes(q) || crosses(last, q, used)) continue;
      const [lr, lc] = cellOf(last);
      const [qr, qc] = cellOf(q);
      const diagonal = lr !== qr && lc !== qc;
      if (diagonal) used.add(diagKey(last, q));
      path.push(q);
      if (dfs()) return true;
      path.pop();
      if (diagonal) used.delete(diagKey(last, q));
    }
    return false;
  };
  return dfs() ? { path, diags: used } : null;
}

/** Cada zona lliure ha de poder-se omplir exactament amb alguna combinació de paraules pendents. */
function componentsFit(free: Set<Key>, remaining: string[]): boolean {
  const sums = new Set([0]);
  for (const w of remaining) for (const s of [...sums]) sums.add(s + w.length);
  const seen = new Set<Key>();
  for (const start of free) {
    if (seen.has(start)) continue;
    let size = 0;
    const stack = [start];
    seen.add(start);
    while (stack.length) {
      const x = stack.pop()!;
      size++;
      for (const q of neighbours(x)) {
        if (free.has(q) && !seen.has(q)) {
          seen.add(q);
          stack.push(q);
        }
      }
    }
    if (!sums.has(size)) return false;
  }
  return true;
}

export interface GenerateInput {
  theme: string;
  spangram: string;
  words: string[];
  seed: number;
  /** Temps màxim en mil·lisegons. */
  timeLimitMs?: number;
}

export function generateFils({
  theme,
  spangram,
  words,
  seed,
  timeLimitMs = 4000,
}: GenerateInput): FilsPuzzle | null {
  const total = spangram.length + words.reduce((n, w) => n + w.length, 0);
  if (total !== ROWS * COLS) return null;
  const ctx: Ctx = { rand: seededRandom(seed), deadline: Date.now() + timeLimitMs };
  const all = Array.from({ length: ROWS * COLS }, (_, k) => k);

  while (Date.now() < ctx.deadline) {
    let free = new Set(all);
    let diags = new Set<string>();
    const placed = new Map<string, Key[]>();

    let sp: ReturnType<typeof pathFor> = null;
    for (const s of shuffle(all, ctx.rand)) {
      sp = pathFor(spangram.length, s, free, diags, true, ctx);
      if (sp) break;
    }
    if (!sp) continue;
    placed.set(spangram, sp.path);
    sp.path.forEach((k) => free.delete(k));
    diags = sp.diags;

    let remaining = shuffle(words, ctx.rand);
    if (!componentsFit(free, remaining)) continue;

    let failed = false;
    while (remaining.length) {
      // La cel·la amb menys veïns lliures és la més difícil d'aprofitar: comencem per ella.
      const freeCount = (k: Key) => neighbours(k).filter((q) => free.has(q)).length;
      const cell = [...free].reduce((best, k) => {
        const d = freeCount(k) - freeCount(best);
        return d < 0 || (d === 0 && ctx.rand() < 0.5) ? k : best;
      });
      let done = false;
      for (const w of shuffle(remaining, ctx.rand)) {
        const res = pathFor(w.length, cell, free, diags, false, ctx);
        if (!res) continue;
        const nextFree = new Set([...free].filter((k) => !res.path.includes(k)));
        const nextRemaining = remaining.filter((x) => x !== w);
        if (componentsFit(nextFree, nextRemaining)) {
          placed.set(w, res.path);
          free = nextFree;
          diags = res.diags;
          remaining = nextRemaining;
          done = true;
          break;
        }
      }
      if (!done) {
        failed = true;
        break;
      }
    }
    if (failed || free.size) continue;

    const grid = Array.from({ length: ROWS }, () => Array<string>(COLS).fill('?'));
    for (const [word, path] of placed)
      path.forEach((k, i) => {
        const [r, c] = cellOf(k);
        grid[r][c] = word[i];
      });
    const toWord = (word: string) => ({ word, path: placed.get(word)!.map(cellOf) });
    return {
      theme,
      grid: grid.map((row) => row.join('')),
      spangram: toWord(spangram),
      words: words.map(toWord),
    };
  }
  return null;
}
