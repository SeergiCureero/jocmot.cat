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
