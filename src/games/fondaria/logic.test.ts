import { normalizeWord } from '@/lib/text';
import { CATEGORIES } from './data/categories';
import {
  addAnswer,
  buildPrompts,
  buildShareText,
  expireRounds,
  fitsPrompt,
  getStatus,
  initialState,
  ROUNDS,
  pointsFor,
  ROUND_SECONDS,
  tierFor,
  totalDepth,
  wordPoints,
} from './logic';

describe('preguntes del dia', () => {
  it('són set, iguals per a tothom i no es repeteixen', () => {
    const a = buildPrompts(32);
    expect(a).toHaveLength(ROUNDS);
    expect(buildPrompts(32).map((p) => p.text)).toEqual(a.map((p) => p.text));
    expect(new Set(a.map((p) => p.text)).size).toBe(ROUNDS);
  });
  it('canvien de dia en dia', () => {
    const days = new Set(Array.from({ length: 20 }, (_, i) => buildPrompts(i + 1)[0].text));
    expect(days.size).toBeGreaterThan(3);
  });
});

describe('fitsPrompt', () => {
  const prompts = buildPrompts(1);
  const category = prompts.find((p) => p.kind === 'category')!;
  const pattern = prompts.find((p) => p.kind === 'pattern')!;

  it('les categories accepten la llista, sense accents ni majúscules', () => {
    const first = category.category!.answers[0];
    expect(fitsPrompt(category, first.toUpperCase())).toBe(normalizeWord(first));
    expect(fitsPrompt(category, 'zzzzzz')).toBeNull();
    expect(fitsPrompt(category, '')).toBeNull();
  });
  it('les de paraules demanen la forma i 4 lletres o més', () => {
    const prefix = pattern.text.match(/«(.+?)»/)?.[1];
    if (prefix) {
      expect(fitsPrompt(pattern, `${prefix.toLowerCase()}xxx`)).toBe(`${prefix}XXX`);
      expect(fitsPrompt(pattern, prefix)).toBeNull();
    }
    expect(fitsPrompt(pattern, 'ZZZZZ')).toBeNull();
  });
});

describe('punts per categoria', () => {
  const animal = buildPrompts(1)
    .concat(buildPrompts(2), buildPrompts(3))
    .find((p) => p.category?.id === 'animal');
  it('la primera resposta de la llista val poc i l’última molt', () => {
    const prompt = animal ?? { ...buildPrompts(1)[0] };
    const answers = prompt.category!.answers;
    const common = pointsFor(prompt, normalizeWord(answers[0]));
    const rare = pointsFor(prompt, normalizeWord(answers.at(-1)!));
    expect(common).toBe(10);
    expect(rare).toBe(100);
  });
  it('totes les categories tenen prou respostes i cap duplicada', () => {
    for (const c of CATEGORIES) {
      expect(c.answers.length, c.id).toBeGreaterThan(25);
      const keys = c.answers.map(normalizeWord);
      expect(new Set(keys).size, c.id).toBe(keys.length);
    }
  });
});

describe('punts', () => {
  it('les paraules llargues i amb lletres rares valen més', () => {
    expect(wordPoints('CASA')).toBe(10);
    expect(wordPoints('CASERNA')).toBeGreaterThan(wordPoints('CASA'));
    expect(wordPoints('XIXA')).toBeGreaterThan(wordPoints('CASA'));
    expect(wordPoints('EXTRAORDINARIAMENT')).toBe(100);
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
  it('el text per compartir porta el resultat, sense paraules', () => {
    let s = initialState(0);
    s = addAnswer(s, { word: 'CASA', points: 10 }, 1);
    s = addAnswer(s, { word: '', points: 0 }, 2);
    const text = buildShareText(5, s, 'https://jocmot.cat/fondaria');
    expect(text).toBe('Fondària #5 · 10 m\n⬜⬛\nhttps://jocmot.cat/fondaria');
    expect(text).not.toMatch(/CASA/);
  });
});
