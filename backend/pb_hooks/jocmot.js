/**
 * Lògica de punts, ratxes i rangs de jocmot.cat.
 *
 * Funcions pures (sense res de PocketBase) perquè les puguin fer servir tant els
 * hooks del servidor (`jocmot.pb.js`, amb `require`) com els tests (Vitest).
 * El servidor és qui calcula els punts: el navegador només diu com ha anat la partida.
 */

/** Data del puzle #1. Ha de coincidir amb VITE_LAUNCH_DATE de `.env.production`. */
const LAUNCH_DATE = '2026-10-26';
const DAY_MS = 86400000;

/** Bonus de ratxa: +1 punt per joc per cada dia seguit (a partir del segon), fins a +5. */
const MAX_STREAK_BONUS = 5;

const RANKS = [
  { name: 'Aprenent', icon: '🌱', min: 0 },
  { name: 'Lletraferit', icon: '📖', min: 150 },
  { name: 'Paraulaire', icon: '✒️', min: 500 },
  { name: 'Erudit', icon: '🎓', min: 1200 },
  { name: 'Mestre de mots', icon: '🏛️', min: 2500 },
  { name: 'Gran Mestre', icon: '👑', min: 5000 },
];

// ── Dates (zona horària de Madrid, sense dependre d'Intl) ──

const pad = (n) => (n < 10 ? '0' : '') + n;
const isoFromUtc = (ms) => {
  const d = new Date(ms);
  return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate());
};
const utcFromIso = (iso) => {
  const p = iso.split('-').map(Number);
  return Date.UTC(p[0], p[1] - 1, p[2]);
};

/** Últim diumenge d'un mes, a la 1:00 UTC (canvi d'hora a la UE). */
function lastSundayAt1Utc(year, month) {
  const lastDay = Date.UTC(year, month + 1, 0);
  return lastDay - new Date(lastDay).getUTCDay() * DAY_MS + 3600000;
}

/** Data "AAAA-MM-DD" a Madrid per a un instant (ms). */
function madridDate(ms) {
  const year = new Date(ms).getUTCFullYear();
  const summer = ms >= lastSundayAt1Utc(year, 2) && ms < lastSundayAt1Utc(year, 9);
  return isoFromUtc(ms + (summer ? 2 : 1) * 3600000);
}

/** Instant (ms) en què comença el dia "AAAA-MM-DD" a Madrid: les 00:00 són les 22:00 o 23:00 UTC del dia abans. */
function madridMidnight(iso) {
  const utc = utcFromIso(iso);
  return madridDate(utc - 2 * 3600000) === iso ? utc - 2 * 3600000 : utc - 3600000;
}

const addDays = (iso, n) => isoFromUtc(utcFromIso(iso) + n * DAY_MS);
const puzzleDate = (number) => addDays(LAUNCH_DATE, number - 1);
const puzzleNumberForDate = (iso) =>
  Math.round((utcFromIso(iso) - utcFromIso(LAUNCH_DATE)) / DAY_MS) + 1;

// ── Punts ──

/** Punts base d'una partida acabada, segons com s'ha resolt (0 si no s'ha resolt). */
function basePoints(game, status, state) {
  if (status !== 'won' || !state) return 0;
  switch (game) {
    case 'paraula': {
      const table = [15, 12, 10, 8, 6, 5];
      return table[(state.guesses || []).length - 1] || 0;
    }
    case 'connexions':
      return Math.max(6, 15 - 3 * (state.mistakes || 0));
    case 'fils': {
      const hints = (state.log || []).filter((l) => l === 'hint').length;
      return Math.max(5, 15 - 3 * hints);
    }
    case 'mini': {
      const s = state.elapsedSeconds || 0;
      return s <= 60 ? 15 : s <= 120 ? 12 : s <= 240 ? 10 : 8;
    }
    default:
      return 0;
  }
}

/**
 * Ratxa: dies seguits amb algun puzle del dia acabat, comptant fins a `today`.
 * Si avui encara no s'ha jugat, compta fins ahir (la ratxa no es perd fins que acaba el dia).
 */
function currentStreak(days, today) {
  const set = new Set(days);
  let day = set.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (set.has(day)) {
    streak++;
    day = addDays(day, -1);
  }
  return streak;
}

/**
 * Puntuació d'una partida acabada.
 * - Puzle del dia (acabat el mateix dia, hora de Madrid): punts base + bonus de ratxa.
 * - Puzle de l'arxiu: la meitat dels punts base, sense bonus.
 * Retorna null si la partida no ha acabat o el puzle és del futur.
 * `dailyDays`: dies en què l'usuari ja havia acabat algun puzle del dia.
 */
function scoreFor({ game, puzzle, status, state, finishedAt, dailyDays }) {
  if (status !== 'won' && status !== 'lost') return null;
  const day = madridDate(finishedAt);
  const date = puzzleDate(puzzle);
  if (puzzle < 1 || date > day) return null;

  const daily = date === day;
  const full = basePoints(game, status, state);
  const base = daily ? full : Math.floor(full / 2);
  const streak = currentStreak(daily ? dailyDays.concat([day]) : dailyDays, day);
  const bonus = daily && base > 0 ? Math.min(streak - 1, MAX_STREAK_BONUS) : 0;
  return { day, month: day.slice(0, 7), daily, base, bonus, points: base + bonus, streak };
}

/** Rang segons els punts totals, amb el següent per mostrar el progrés. */
function rankFor(total) {
  let i = 0;
  while (i + 1 < RANKS.length && total >= RANKS[i + 1].min) i++;
  const next = RANKS[i + 1];
  return {
    name: RANKS[i].name,
    icon: RANKS[i].icon,
    min: RANKS[i].min,
    next: next ? { name: next.name, icon: next.icon, min: next.min } : null,
  };
}

/** Normalitza un nom d'usuari per cercar-lo (sense majúscules ni espais als extrems). */
const normalizeName = (name) =>
  String(name || '')
    .trim()
    .toLowerCase();

module.exports = {
  LAUNCH_DATE,
  MAX_STREAK_BONUS,
  RANKS,
  madridDate,
  madridMidnight,
  addDays,
  puzzleDate,
  puzzleNumberForDate,
  basePoints,
  currentStreak,
  scoreFor,
  rankFor,
  normalizeName,
};
