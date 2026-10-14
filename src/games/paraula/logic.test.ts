import { normalizeWord } from '@/lib/text';
import { ANSWERS } from './data/answers';
import { buildShareText, evaluateGuess, initialState, keyboardStates, submitGuess } from './logic';

const always = () => true;

describe('evaluateGuess', () => {
  it('marca correctes, presents i absents', () => {
    expect(evaluateGuess('TERRA', 'TARTA')).toEqual(['correct', 'absent', 'correct', 'absent', 'correct']);
    expect(evaluateGuess('RATES', 'TERRA')).toEqual(['present', 'present', 'present', 'present', 'absent']);
  });
  it('no compta dues vegades una lletra repetida', () => {
    expect(evaluateGuess('AAAAA', 'PLATA')).toEqual(['absent', 'absent', 'correct', 'absent', 'correct']);
  });
  it('ignora accents', () => {
    expect(evaluateGuess('NUVOL', 'núvol').every((s) => s === 'correct')).toBe(true);
  });
});

describe('submitGuess', () => {
  it('rebutja paraules curtes', () => {
    expect(submitGuess(initialState(), 'CASA', 'TERRA', always)).toEqual({ error: 'too-short' });
  });
  it('guanya en encertar', () => {
    const r = submitGuess(initialState(), 'terra', 'TERRA', always);
    expect('state' in r && r.state.status).toBe('won');
  });
  it('perd al sisè intent fallit', () => {
    let s = initialState();
    for (let i = 0; i < 6; i++) {
      const r = submitGuess(s, 'PLATA', 'TERRA', always);
      if ('state' in r) s = r.state;
    }
    expect(s.status).toBe('lost');
  });
});

it('el teclat guarda el millor estat', () => {
  expect(keyboardStates(['TARTA', 'TERRA'], 'TERRA').A).toBe('correct');
});

it('genera el text per compartir', () => {
  const text = buildShareText(3, { guesses: ['PLATA', 'TERRA'], status: 'won' }, 'TERRA', 'jocmot.cat');
  expect(text.startsWith('Paraula #3 2/6')).toBe(true);
});

it('totes les solucions tenen 5 lletres i no es repeteixen', () => {
  const norm = ANSWERS.map(normalizeWord);
  expect(norm.every((w) => w.length === 5)).toBe(true);
  expect(new Set(norm).size).toBe(norm.length);
});
