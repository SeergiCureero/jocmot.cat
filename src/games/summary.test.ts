import { headline, summarize } from './summary';

describe('headline', () => {
  it('Paraula', () => {
    expect(headline('paraula', 'won', { guesses: ['a', 'b'] })).toBe('Perfecte!');
    expect(headline('paraula', 'won', { guesses: ['a', 'b', 'c', 'd'] })).toBe('Molt bé!');
    expect(headline('paraula', 'won', { guesses: Array(6).fill('a') })).toBe('Per poc!');
    expect(headline('paraula', 'lost', { guesses: Array(6).fill('a') })).toBe('Demà més!');
  });
  it('Connexions', () => {
    expect(headline('connexions', 'won', { mistakes: 0, solved: [0, 1, 2, 3] })).toBe('Perfecte!');
    expect(headline('connexions', 'won', { mistakes: 3, solved: [0, 1, 2, 3] })).toBe('Per poc!');
    expect(headline('connexions', 'lost', { mistakes: 4, solved: [0, 1, 2] })).toBe('Per poc!');
    expect(headline('connexions', 'lost', { mistakes: 4, solved: [0] })).toBe('Demà més!');
  });
});

describe('summarize', () => {
  it('dona el resultat breu', () => {
    expect(summarize('paraula', 1, 'won', { guesses: ['a', 'b', 'c', 'd'] }).result).toBe('4/6');
    expect(summarize('connexions', 1, 'won', { mistakes: 0 }).result).toBe('Sense errors');
    expect(summarize('connexions', 1, 'won', { mistakes: 1 }).result).toBe('1 error');
    expect(summarize('mini', 1, 'won', { letters: ['AB#'], elapsedSeconds: 83 }).result).toBe(
      '1:23',
    );
    expect(summarize('mini', 1, 'playing', { letters: ['A #'] }).progress).toBe(0.5);
  });
});
