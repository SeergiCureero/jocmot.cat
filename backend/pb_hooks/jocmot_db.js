/**
 * Accés a dades per als hooks i rutes de `jocmot.pb.js`.
 * Cada handler de PocketBase s'executa aïllat: s'ha de fer `require` d'aquest fitxer dins del handler.
 */
const lib = require(`${__hooks}/jocmot.js`);

const MAX_LEAGUES_PER_USER = 20;
const MAX_LEAGUE_MEMBERS = 50;
const MAX_FRIENDS = 200;
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sense 0/O ni 1/I

const today = () => lib.madridDate(Date.now());
/** Data de PocketBase ("2026-10-27 18:55:42.640Z") → ms. */
const toMs = (pbDate) => new Date(String(pbDate).replace(' ', 'T')).getTime();
const person = (user) => ({ id: user.id, name: user.getString('name') || 'Anònim' });

function findFirst(app, collection, filter, params) {
  try {
    return app.findFirstRecordByFilter(collection, filter, params);
  } catch {
    return null;
  }
}

/** Placeholders per a un `IN (...)` amb paràmetres: {sql: "{:u0},{:u1}", params: {u0, u1}}. */
function inList(prefix, values) {
  const params = {};
  const sql = values
    .map((v, i) => {
      params[prefix + i] = v;
      return `{:${prefix}${i}}`;
    })
    .join(',');
  return { sql, params };
}

/** Valida el nom d'usuari d'un registre de `users` (obligatori, 2-24 caràcters, únic). */
function checkUsername(e) {
  const name = String(e.record.getString('name')).trim();
  if (name.length < 2 || name.length > 24)
    throw new BadRequestError('El nom d’usuari ha de tenir entre 2 i 24 caràcters');
  if (/[@\s]/.test(name)) throw new BadRequestError('El nom d’usuari no pot tenir espais ni @');
  const rows = arrayOf(new DynamicModel({ id: '' }));
  e.app
    .db()
    .newQuery('SELECT id FROM users WHERE LOWER(TRIM(name)) = {:n} AND id != {:id} LIMIT 1')
    .bind({ n: name.toLowerCase(), id: e.record.id })
    .all(rows);
  if (rows.length) throw new BadRequestError('Aquest nom d’usuari ja existeix');
  e.record.set('name', name);
}

// ── Puntuacions ──

/**
 * Calcula i desa la puntuació d'una partida acabada (una sola vegada per puzle).
 * `finishedAt` (ms): per defecte ara; per recalcular partides antigues, quan es van desar.
 */
function recordScore(app, progress, finishedAt) {
  const status = progress.getString('status');
  if (status !== 'won' && status !== 'lost') return null;
  const user = progress.getString('user');
  const game = progress.getString('game');
  const puzzle = progress.getInt('puzzle');
  const key = { u: user, g: game, p: puzzle };
  if (findFirst(app, 'scores', 'user = {:u} && game = {:g} && puzzle = {:p}', key)) return null;

  let state = null;
  try {
    state = JSON.parse(progress.getString('state') || 'null');
  } catch {
    /* estat il·legible: compta com a partida sense punts */
  }
  const dailyDays = dailyDaysFor(app, [user], lib.addDays(today(), -400))[user] || [];
  const score = lib.scoreFor({
    game,
    puzzle,
    status,
    state,
    finishedAt: finishedAt || Date.now(),
    dailyDays,
  });
  if (!score) return null;

  const record = new Record(app.findCollectionByNameOrId('scores'));
  record.set('user', user);
  record.set('game', game);
  record.set('puzzle', puzzle);
  for (const field of ['day', 'month', 'daily', 'base', 'bonus', 'points', 'streak'])
    record.set(field, score[field]);
  try {
    app.save(record);
  } catch {
    // Dues peticions alhora: l'índex únic ja l'ha desat l'altra.
    return null;
  }
  return record;
}

/** Dies (Madrid) amb algun puzle del dia acabat, per usuari, des de `since`. */
function dailyDaysFor(app, userIds, since) {
  const out = {};
  if (!userIds.length) return out;
  const ids = inList('u', userIds);
  const rows = arrayOf(new DynamicModel({ user: '', day: '' }));
  app
    .db()
    .newQuery(
      `SELECT DISTINCT user, day FROM scores WHERE daily = TRUE AND day >= {:since} AND user IN (${ids.sql})`,
    )
    .bind(Object.assign({ since }, ids.params))
    .all(rows);
  for (const r of rows) (out[r.user] = out[r.user] || []).push(r.day);
  return out;
}

/** Punts totals, del mes, partides del mes, ratxa i rang de cada usuari. */
function statsFor(app, userIds, month) {
  const out = {};
  const now = today();
  for (const id of userIds) out[id] = { total: 0, monthPoints: 0, monthGames: 0 };
  if (userIds.length) {
    const ids = inList('u', userIds);
    const rows = arrayOf(new DynamicModel({ user: '', total: 0, monthPoints: 0, monthGames: 0 }));
    app
      .db()
      .newQuery(
        `SELECT user, SUM(points) AS total,
                SUM(CASE WHEN month = {:m} THEN points ELSE 0 END) AS monthPoints,
                SUM(CASE WHEN month = {:m} THEN 1 ELSE 0 END) AS monthGames
         FROM scores WHERE user IN (${ids.sql}) GROUP BY user`,
      )
      .bind(Object.assign({ m: month }, ids.params))
      .all(rows);
    for (const r of rows)
      out[r.user] = { total: r.total, monthPoints: r.monthPoints, monthGames: r.monthGames };
  }
  const days = dailyDaysFor(app, userIds, lib.addDays(now, -400));
  for (const id of userIds) {
    out[id].streak = lib.currentStreak(days[id] || [], now);
    out[id].playedToday = (days[id] || []).indexOf(now) >= 0;
    out[id].rank = lib.rankFor(out[id].total);
  }
  return out;
}

/** Ordena per punts del mes i hi posa la posició (empats = mateixa posició). */
function ranking(people, stats) {
  const rows = people.map((p) => Object.assign({ user: p }, stats[p.id]));
  rows.sort(
    (a, b) =>
      b.monthPoints - a.monthPoints ||
      b.monthGames - a.monthGames ||
      a.user.name.localeCompare(b.user.name),
  );
  rows.forEach((r, i) => {
    const prev = rows[i - 1];
    r.position = prev && prev.monthPoints === r.monthPoints ? prev.position : i + 1;
  });
  return rows;
}

// ── Amistats ──

function friendshipsOf(app, userId) {
  return app.findRecordsByFilter('friendships', 'from = {:u} || to = {:u}', '-created', 0, 0, {
    u: userId,
  });
}

/** Usuari pel nom (sense distingir majúscules). */
function findUserByName(app, name) {
  const rows = arrayOf(new DynamicModel({ id: '' }));
  app
    .db()
    .newQuery('SELECT id FROM users WHERE LOWER(TRIM(name)) = {:n} LIMIT 2')
    .bind({ n: lib.normalizeName(name) })
    .all(rows);
  if (rows.length !== 1) return { error: rows.length ? 'ambiguous' : 'not-found' };
  return { user: app.findRecordById('users', rows[0].id) };
}

// ── Lligues ──

function newLeagueCode(app) {
  for (let i = 0; i < 20; i++) {
    const code = $security.randomStringWithAlphabet(6, CODE_ALPHABET);
    if (!findFirst(app, 'leagues', 'code = {:c}', { c: code })) return code;
  }
  throw new InternalServerError('No s’ha pogut generar un codi');
}

const membersOf = (app, leagueId) =>
  app.findRecordsByFilter('league_members', 'league = {:l}', 'created', 0, 0, { l: leagueId });

const membershipsOf = (app, userId) =>
  app.findRecordsByFilter('league_members', 'user = {:u}', 'created', 0, 0, { u: userId });

/** Mesos (AAAA-MM) des que existeix la lliga fins ara, del més recent al més antic. */
function leagueMonths(league) {
  const first = lib.madridDate(toMs(league.getString('created')));
  const months = [];
  let [y, m] = today().split('-').map(Number);
  const [fy, fm] = first.split('-').map(Number);
  while (y > fy || (y === fy && m >= fm)) {
    months.push(`${y}-${m < 10 ? '0' : ''}${m}`);
    if (--m === 0) {
      m = 12;
      y--;
    }
  }
  return months;
}

module.exports = {
  lib,
  checkUsername,
  MAX_LEAGUES_PER_USER,
  MAX_LEAGUE_MEMBERS,
  MAX_FRIENDS,
  today,
  toMs,
  person,
  findFirst,
  recordScore,
  statsFor,
  ranking,
  friendshipsOf,
  findUserByName,
  newLeagueCode,
  membersOf,
  membershipsOf,
  leagueMonths,
};
