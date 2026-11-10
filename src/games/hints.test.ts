import { describe, expect, it } from 'vitest';
import { GAMES } from './registry';
import { hintsForWord } from './paraula/hints';
import { hintsForPuzzle as connexionsHints } from './connexions/hints';

describe('pistes', () => {
  it('tots els jocs en generen per als 120 primers puzles, amb text a cada pista', async () => {
    for (const game of GAMES) {
      const { buildHints } = await game.hints();
      for (let n = 1; n <= 120; n++) {
        const { hints, solution } = buildHints(n);
        expect(hints.length, `${game.id} #${n}`).toBeGreaterThanOrEqual(2);
        for (const h of [...hints, solution]) {
          expect(h.title).toBeTruthy();
          expect(h.lines.length).toBeGreaterThan(0);
          for (const line of h.lines) expect(line.trim()).not.toBe('');
        }
      }
    }
  });

  it('Paraula: la primera pista no diu la paraula', () => {
    const { hints, solution } = hintsForWord('núvol');
    expect(hints[0].lines[0]).toBe('Té 2 vocals i cap lletra repetida.');
    expect(hints[0].lines.join(' ')).not.toContain('NÚVOL');
    expect(hints[1].lines[0]).toBe('Comença per «N» i acaba per «L».');
    expect(solution.lines[0]).toBe('La paraula és NÚVOL.');
  });

  it('la pista de l’autor va primer', () => {
    const groups = [0, 1, 2, 3].map((level) => ({
      title: `Tema ${level}`,
      words: ['A', 'B', 'C', 'D'],
      level,
    }));
    const { hints } = connexionsHints({ groups, hint: ' Pensa en el mar ' } as never);
    expect(hints[0]).toEqual({ title: 'Pista de l’autor', lines: ['Pensa en el mar'] });
    expect(hints).toHaveLength(3);
  });
});
