import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { normalizeWord } from '@/lib/text';
import { CATEGORIES } from './data/categories';
import {
  addAnswer,
  blendPoints,
  buildPrompts,
  buildShareText,
  expireRounds,
  fitsPrompt,
  getStatus,
  initialState,
  pointsFor,
  ROUND_SECONDS,
  ROUNDS,
  scheduleFor,
  seedPoints,
  tierFor,
  totalDepth,
} from './logic';

// Els hooks de PocketBase esperen la variable global `__hooks` (la carpeta dels hooks).
(globalThis as { __hooks?: string }).__hooks = resolve('backend/pb_hooks');
const server = createRequire(import.meta.url)('../../../backend/pb_hooks/jocmot_fondaria.js');

describe('preguntes del dia', () => {
  it('són set, iguals per a tothom i no es repeteixen', () => {
    const a = buildPrompts(32);
    expect(a).toHaveLength(ROUNDS);
    expect(buildPrompts(32).map((p) => p.text)).toEqual(a.map((p) => p.text));
    expect(new Set(a.map((p) => p.category.id)).size).toBe(ROUNDS);
  });
  it('canvien de dia en dia i les últimes són les difícils', () => {
    const days = new Set(Array.from({ length: 20 }, (_, i) => buildPrompts(i + 1)[0].text));
    expect(days.size).toBeGreaterThan(3);
    for (let n = 1; n <= 50; n++) {
      const s = scheduleFor(n);
      expect(s.slice(0, 4).every((c) => !c.hard)).toBe(true);
      expect(s[6].hard).toBe(true);
    }
  });
});

describe('categories', () => {
  it('totes tenen prou respostes i cap duplicada', () => {
    for (const c of CATEGORIES) {
      expect(c.answers.length, c.id).toBeGreaterThan(25);
      const keys = c.answers.map(normalizeWord);
      expect(new Set(keys).size, c.id).toBe(keys.length);
    }
  });
});

describe('respostes i punts', () => {
  const prompt = buildPrompts(1)[0];
  it('accepta les de la llista, sense accents ni majúscules', () => {
    const first = prompt.category.answers[0];
    expect(fitsPrompt(prompt, first.toUpperCase())).toBe(normalizeWord(first));
    expect(fitsPrompt(prompt, 'zzzzzz')).toBeNull();
    expect(fitsPrompt(prompt, '')).toBeNull();
  });
  it('la primera de la llista val poc i l’última molt', () => {
    const answers = prompt.category.answers;
    expect(pointsFor(prompt, normalizeWord(answers[0]))).toBe(10);
    expect(pointsFor(prompt, normalizeWord(answers.at(-1)!))).toBe(100);
  });
  it('amb poca gent mana la llista; amb molta, el que diu la comunitat', () => {
    expect(blendPoints(80, 2, 3)).toBe(80);
    // Molt dita (la meitat de la gent): poc, encara que la llista digués que és rara.
    expect(blendPoints(80, 100, 200)).toBeLessThan(40);
    // Dita per una sola persona entre molta gent: molt.
    expect(blendPoints(10, 1, 200)).toBeGreaterThan(90);
  });
  it('els nivells van de 0 a 5', () => {
    expect([10, 30, 45, 60, 75, 100].map(tierFor)).toEqual([0, 1, 2, 3, 4, 5]);
  });
});

describe('partida', () => {
  it('acaba a la setena resposta i suma la fondària', () => {
    let s = initialState(0);
    for (let i = 0; i < ROUNDS; i++) s = addAnswer(s, { word: 'CASA', points: 10 }, i);
    expect(getStatus(s)).toBe('won');
    expect(totalDepth(s)).toBe(70);
    expect(addAnswer(s, { word: 'X', points: 50 }, 99)).toBe(s);
  });
  it('en tornar tard, les rondes passades es donen per perdudes', () => {
    const s = expireRounds(initialState(0), (ROUND_SECONDS * 2 + 5) * 1000);
    expect(s.answers).toHaveLength(2);
    expect(s.answers.every((a) => a.word === '')).toBe(true);
    expect(expireRounds(initialState(0), 1000).answers).toHaveLength(0);
  });
  it('el text per compartir porta el resultat, sense respostes', () => {
    let s = initialState(0);
    s = addAnswer(s, { word: 'CASA', points: 10 }, 1);
    s = addAnswer(s, { word: '', points: 0 }, 2);
    const text = buildShareText(5, s, 'https://jocmot.cat/fondaria');
    expect(text).toBe('Fondària #5 · 10 m\n⬜⬛\nhttps://jocmot.cat/fondaria');
    expect(text).not.toMatch(/CASA/);
  });
});

describe('servidor (ha de coincidir amb la web)', () => {
  it('fa servir exactament les mateixes llistes', () => {
    const a = readFileSync('src/games/fondaria/data/categories.json', 'utf8');
    const b = readFileSync('backend/pb_hooks/fondaria_categories.json', 'utf8');
    expect(JSON.parse(b)).toEqual(JSON.parse(a));
  });
  it('tria les mateixes preguntes cada dia', () => {
    for (let n = 1; n <= 200; n++) {
      expect(server.scheduleFor(n, CATEGORIES).map((c: { id: string }) => c.id)).toEqual(
        scheduleFor(n).map((c) => c.id),
      );
    }
  });
  it('normalitza i puntua igual', () => {
    for (const w of ['Pangolí', ' Sant Joan', "L'Hospitalet", 'ça va', 'Aie-Aie', 'Park Güell']) {
      expect(server.normalize(w)).toBe(normalizeWord(w));
    }
    for (const [rank, size] of [
      [0, 40],
      [10, 40],
      [39, 40],
      [3, 85],
    ]) {
      expect(server.seedPoints(rank, size)).toBe(seedPoints(rank, size));
    }
    for (const [seed, c, t] of [
      [80, 2, 3],
      [80, 100, 200],
      [10, 1, 200],
      [50, 7, 30],
    ]) {
      expect(server.blendPoints(seed, c, t)).toBe(blendPoints(seed, c, t));
    }
  });
});
