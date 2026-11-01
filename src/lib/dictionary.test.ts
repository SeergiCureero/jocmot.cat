import { readdirSync, readFileSync } from 'node:fs';
import { ANSWERS } from '@/games/paraula/data/answers';
import { PUZZLES as FILS } from '@/games/fils/data/puzzles';
import { decodeList } from './dictionary';
import { normalizeWord } from './text';

const DIR = 'public/diccionari/v1';
const read = (file: string) => decodeList(readFileSync(`${DIR}/${file}`, 'utf8'));

describe('decodeList', () => {
  it('reconstrueix les paraules a partir del prefix compartit', () => {
    expect([...decodeList('0CASA\n3S\n2RRO\n')]).toEqual(['CASA', 'CASS', 'CARRO']);
  });
});

describe('fitxers del diccionari', () => {
  const five = read('5-lletres.txt');
  const all = new Set(
    readdirSync(DIR)
      .filter((f) => f !== '5-lletres.txt')
      .flatMap((f) => [...read(f)]),
  );

  it('té les paraules habituals i no els noms propis', () => {
    for (const w of ['CASA', 'CASES', 'SALUT', 'AMICS', 'COLLA', 'NUVOL', 'CANTAVEM']) {
      expect(all.has(w), w).toBe(true);
    }
    expect(all.has('BARCELONA')).toBe(false);
  });

  it('la llista de 5 lletres coincideix amb la general', () => {
    expect([...five].every((w) => w.length === 5 && all.has(w))).toBe(true);
  });

  it('totes les solucions de Paraula hi són', () => {
    expect(ANSWERS.map(normalizeWord).filter((w) => !five.has(w))).toEqual([]);
  });

  it('les paraules temàtiques de Fils hi són (l’spangram pot ser una expressió)', () => {
    const missing = FILS.flatMap((p) => p.words.map((w) => w.word)).filter((w) => !all.has(w));
    expect(missing).toEqual([]);
  });
});
