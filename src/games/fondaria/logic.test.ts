import {
  addAnswer,
  buildPrompts,
  buildShareText,
  expireRounds,
  fitsPrompt,
  getStatus,
  initialState,
  ROUNDS,
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
  const [first] = buildPrompts(1);
  it('ignora accents i majúscules, i demana 4 lletres o més', () => {
    const prefix = first.text.match(/«(.+?)»/)![1];
    expect(fitsPrompt(first, `${prefix.toLowerCase()}xxx`)).toBe(`${prefix}XXX`);
    expect(fitsPrompt(first, prefix)).toBeNull();
    expect(fitsPrompt(first, 'ZZZZZ')).toBeNull();
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
