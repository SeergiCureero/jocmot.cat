import { createRequire } from 'node:module';

const lib = createRequire(import.meta.url)('./jocmot.js');

// 27/10/2026 a les 12:00 de Madrid (hivern, UTC+1) → 11:00 UTC.
const NOON_27_OCT = Date.UTC(2026, 9, 27, 11);

describe('madridDate', () => {
  it('fa servir UTC+2 a l’estiu i UTC+1 a l’hivern', () => {
    expect(lib.madridDate(Date.UTC(2026, 6, 1, 22, 30))).toBe('2026-07-02');
    expect(lib.madridDate(Date.UTC(2026, 11, 31, 22, 30))).toBe('2026-12-31');
    expect(lib.madridDate(Date.UTC(2026, 11, 31, 23, 30))).toBe('2027-01-01');
  });
  it('canvia d’hora l’últim diumenge d’octubre i de març', () => {
    // 25/10/2026: a les 00:30 UTC encara és horari d'estiu (02:30 a Madrid).
    expect(lib.madridDate(Date.UTC(2026, 9, 24, 22, 30))).toBe('2026-10-25');
    expect(lib.madridDate(Date.UTC(2026, 9, 25, 22, 30))).toBe('2026-10-25');
    expect(lib.madridDate(Date.UTC(2027, 2, 27, 22, 30))).toBe('2027-03-27');
    expect(lib.madridDate(Date.UTC(2027, 2, 28, 22, 30))).toBe('2027-03-29');
  });
});

describe('madridMidnight', () => {
  it('coincideix amb el frontend (startOfDayInTimeZone), també els dies de canvi d’hora', async () => {
    const { startOfDayInTimeZone } = await import('../../src/lib/date');
    for (const iso of [
      '2026-10-25',
      '2026-10-26',
      '2026-12-31',
      '2027-03-28',
      '2027-03-29',
      '2027-07-01',
    ])
      expect(new Date(lib.madridMidnight(iso)).toISOString()).toBe(
        startOfDayInTimeZone(iso, 'Europe/Madrid').toISOString(),
      );
  });
});

describe('basePoints', () => {
  it('Paraula: menys intents, més punts', () => {
    expect(lib.basePoints('paraula', 'won', { guesses: ['a'] })).toBe(15);
    expect(lib.basePoints('paraula', 'won', { guesses: Array(6).fill('a') })).toBe(5);
    expect(lib.basePoints('paraula', 'lost', { guesses: Array(6).fill('a') })).toBe(0);
  });
  it('Connexions, Fils i Mini', () => {
    expect(lib.basePoints('connexions', 'won', { mistakes: 0 })).toBe(15);
    expect(lib.basePoints('connexions', 'won', { mistakes: 3 })).toBe(6);
    expect(lib.basePoints('fils', 'won', { log: ['theme', 'hint', 'hint'] })).toBe(9);
    expect(lib.basePoints('fils', 'won', { log: Array(9).fill('hint') })).toBe(5);
    expect(lib.basePoints('mini', 'won', { elapsedSeconds: 45 })).toBe(15);
    expect(lib.basePoints('mini', 'won', { elapsedSeconds: 600 })).toBe(8);
    expect(lib.basePoints('mini', 'lost', { elapsedSeconds: 10 })).toBe(0);
    const dive = (points: number[]) => ({ answers: points.map((p) => ({ word: 'x', points: p })) });
    expect(lib.basePoints('fondaria', 'won', dive([0, 0, 0, 0, 0, 0, 0]))).toBe(5);
    expect(lib.basePoints('fondaria', 'won', dive([50, 50, 50, 50, 50, 50, 50]))).toBe(10);
    expect(lib.basePoints('fondaria', 'won', dive([100, 100, 100, 100, 100, 100, 100]))).toBe(15);
    expect(lib.basePoints('fondaria', 'lost', dive([100]))).toBe(0);
  });
});

describe('currentStreak', () => {
  it('compta dies seguits fins avui, o fins ahir si avui encara no s’ha jugat', () => {
    expect(lib.currentStreak(['2026-10-25', '2026-10-26', '2026-10-27'], '2026-10-27')).toBe(3);
    expect(lib.currentStreak(['2026-10-25', '2026-10-26'], '2026-10-27')).toBe(2);
    expect(lib.currentStreak(['2026-10-24', '2026-10-26'], '2026-10-27')).toBe(1);
    expect(lib.currentStreak(['2026-10-24'], '2026-10-27')).toBe(0);
  });
});

describe('scoreFor', () => {
  const won = { game: 'paraula', status: 'won', state: { guesses: ['a', 'b'] } };

  it('puzle del dia: punts base + bonus de ratxa', () => {
    const s = lib.scoreFor({
      ...won,
      puzzle: 2,
      finishedAt: NOON_27_OCT,
      dailyDays: ['2026-10-26'],
    });
    expect(s).toMatchObject({
      day: '2026-10-27',
      month: '2026-10',
      daily: true,
      base: 12,
      bonus: 1,
      points: 13,
      streak: 2,
    });
  });
  it('les pistes de /pistes resten 3 punts cadascuna i la solució ho deixa sense punts ni bonus', () => {
    const base = { ...won, puzzle: 2, finishedAt: NOON_27_OCT, dailyDays: ['2026-10-26'] };
    expect(lib.scoreFor({ ...base, hints: { count: 1, solution: false } })).toMatchObject({
      base: 9,
      points: 10,
    });
    const solved = lib.scoreFor({ ...base, hints: { count: 2, solution: true } });
    expect(solved).toMatchObject({ base: 0, bonus: 0, points: 0, daily: true });
  });
  it('withHints: mínim de 3 punts, però no en dona si no n’hi havia', () => {
    expect(lib.withHints(15, null)).toBe(15);
    expect(lib.withHints(15, { count: 2, solution: false })).toBe(9);
    expect(lib.withHints(8, { count: 5, solution: false })).toBe(3);
    expect(lib.withHints(2, { count: 1, solution: false })).toBe(2);
    expect(lib.withHints(0, { count: 1, solution: false })).toBe(0);
    expect(lib.withHints(15, { count: 0, solution: true })).toBe(0);
  });
  it('el bonus de ratxa té un màxim', () => {
    const days = Array.from({ length: 20 }, (_, i) => lib.addDays('2026-10-26', -i));
    const s = lib.scoreFor({ ...won, puzzle: 2, finishedAt: NOON_27_OCT, dailyDays: days });
    expect(s.bonus).toBe(lib.MAX_STREAK_BONUS);
  });
  it('arxiu: meitat de punts i sense bonus', () => {
    const s = lib.scoreFor({
      ...won,
      puzzle: 1,
      finishedAt: NOON_27_OCT,
      dailyDays: ['2026-10-26'],
    });
    expect(s).toMatchObject({ daily: false, base: 6, bonus: 0, points: 6 });
  });
  it('perdre el del dia manté la ratxa però no dona punts', () => {
    const s = lib.scoreFor({
      game: 'paraula',
      status: 'lost',
      state: {},
      puzzle: 2,
      finishedAt: NOON_27_OCT,
      dailyDays: ['2026-10-26'],
    });
    expect(s).toMatchObject({ daily: true, points: 0, streak: 2 });
  });
  it('ni partides a mitges ni puzles del futur', () => {
    expect(
      lib.scoreFor({
        ...won,
        status: 'playing',
        puzzle: 2,
        finishedAt: NOON_27_OCT,
        dailyDays: [],
      }),
    ).toBeNull();
    expect(lib.scoreFor({ ...won, puzzle: 3, finishedAt: NOON_27_OCT, dailyDays: [] })).toBeNull();
  });
});

describe('rankFor', () => {
  it('assigna el rang i el següent', () => {
    expect(lib.rankFor(0)).toMatchObject({
      name: 'Aprenent',
      next: { name: 'Lletraferit', min: 150 },
    });
    expect(lib.rankFor(150).name).toBe('Lletraferit');
    expect(lib.rankFor(99999)).toMatchObject({ name: 'Gran Mestre', next: null });
  });
});

it('la data de llançament coincideix amb la del frontend', async () => {
  const { readFileSync } = await import('node:fs');
  const env = readFileSync(new URL('../../.env.production', import.meta.url), 'utf8');
  expect(env).toContain(`VITE_LAUNCH_DATE=${lib.LAUNCH_DATE}`);
});

it('els rangs que explica la web són els que calcula el servidor', async () => {
  const { RANKS } = await import('../../src/features/social/PointsHelp');
  expect(RANKS).toEqual(lib.RANKS);
});

describe('madridHour', () => {
  it('té en compte l’horari d’estiu i d’hivern', () => {
    expect(lib.madridHour(Date.UTC(2026, 6, 1, 6, 59))).toBe(8);
    expect(lib.madridHour(Date.UTC(2026, 10, 2, 7, 0))).toBe(8);
    expect(lib.madridHour(Date.UTC(2026, 11, 31, 23, 30))).toBe(0);
  });
});

describe('Empenta de bentornats', () => {
  const won = { game: 'paraula', status: 'won', state: { guesses: ['a', 'b'] } };
  const at = (day: string, dailyDays: string[]) =>
    lib.scoreFor({
      ...won,
      puzzle: lib.puzzleNumberForDate(day),
      finishedAt: lib.madridMidnight(day) + 12 * 3600000,
      dailyDays,
    });

  it('si fa 5 dies o més que no puntues, el dia que tornes sumes +3 per joc', () => {
    expect(at('2026-11-10', ['2026-11-05'])).toMatchObject({ empenta: 3, points: 12 + 3 });
  });
  it('i també els dos dies següents, però no el quart', () => {
    const before = ['2026-11-05', '2026-11-10'];
    expect(at('2026-11-11', before).empenta).toBe(3);
    expect(at('2026-11-12', before.concat('2026-11-11')).empenta).toBe(3);
    expect(at('2026-11-13', before.concat('2026-11-11', '2026-11-12')).empenta).toBe(0);
  });
  it('amb 4 dies de pausa no n’hi ha, ni el primer cop que jugues', () => {
    expect(at('2026-11-10', ['2026-11-06']).empenta).toBe(0);
    expect(at('2026-11-10', []).empenta).toBe(0);
  });
  it('l’arxiu i les partides sense punts no el donen', () => {
    const archive = lib.scoreFor({
      ...won,
      puzzle: 2,
      finishedAt: lib.madridMidnight('2026-11-10') + 12 * 3600000,
      dailyDays: ['2026-11-01'],
    });
    expect(archive.empenta).toBe(0);
  });
});

describe('Embranzida de remuntada', () => {
  const won = { game: 'paraula', status: 'won', state: { guesses: ['a', 'b'] } };
  const score = (day: string, monthStats: unknown) =>
    lib.scoreFor({
      ...won,
      puzzle: lib.puzzleNumberForDate(day),
      finishedAt: lib.madridMidnight(day) + 12 * 3600000,
      dailyDays: [],
      monthStats,
    });

  it('dona +2 si portes menys de la meitat de la mitjana', () => {
    expect(score('2026-11-12', { players: 20, average: 100, mine: 40 })).toMatchObject({
      embranzida: 2,
      points: 14,
    });
  });
  it('no en dona si estàs a la meitat o per sobre', () => {
    expect(score('2026-11-12', { players: 20, average: 100, mine: 50 }).embranzida).toBe(0);
  });
  it('no en dona els primers dies del mes ni amb pocs jugadors', () => {
    expect(score('2026-11-03', { players: 20, average: 100, mine: 0 }).embranzida).toBe(0);
    expect(score('2026-11-12', { players: 9, average: 100, mine: 0 }).embranzida).toBe(0);
    expect(score('2026-11-12', null).embranzida).toBe(0);
  });
});
