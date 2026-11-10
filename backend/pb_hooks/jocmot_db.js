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

/**
 * Cerca d'usuaris pel nom (per afegir amics): primer els que hi comencen, després els que el contenen.
 * Retorna també la relació amb qui cerca: 'friend', 'sent', 'received' o null.
 */
function searchUsers(app, me, query) {
  const q = lib.normalizeName(query).replace(/[\\%_]/g, (c) => '\\' + c);
  if (q.length < 2) return [];
  const rows = arrayOf(new DynamicModel({ id: '', name: '' }));
  app
    .db()
    .newQuery(
      `SELECT id, name FROM users
       WHERE LOWER(name) LIKE {:contains} ESCAPE '\\' AND id != {:me}
       ORDER BY CASE WHEN LOWER(name) LIKE {:prefix} ESCAPE '\\' THEN 0 ELSE 1 END, LENGTH(name), name
       LIMIT 8`,
    )
    .bind({ contains: '%' + q + '%', prefix: q + '%', me })
    .all(rows);

  const relation = {};
  for (const f of friendshipsOf(app, me)) {
    const sent = f.getString('from') === me;
    const other = sent ? f.getString('to') : f.getString('from');
    relation[other] = f.getString('status') === 'accepted' ? 'friend' : sent ? 'sent' : 'received';
  }
  return rows.map((r) => ({ id: r.id, name: r.name, relation: relation[r.id] || null }));
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

/** Treu un membre de la seva lliga. Si en surt el creador, passa a ser-ho el membre més antic; si queda buida, s'esborra. */
function leaveLeague(app, membership) {
  const leagueId = membership.getString('league');
  const userId = membership.getString('user');
  app.delete(membership);
  const league = app.findRecordById('leagues', leagueId);
  const rest = membersOf(app, leagueId);
  if (!rest.length) app.delete(league);
  else if (league.getString('owner') === userId) {
    league.set('owner', rest[0].getString('user'));
    app.save(league);
  }
}

/**
 * Esborra el compte i totes les seves dades. Progrés, punts, amistats i membres de lligues
 * s'esborren en cascada; abans, cada lliga on és passa a un altre membre (o s'esborra si queda buida).
 * Els editors no es poden esborrar sols: els puzles publicats necessiten autor.
 */
function deleteAccount(app, user, password) {
  if (!user.validatePassword(password || ''))
    throw new BadRequestError('La contrasenya no és correcta.');
  if (user.getBool('editor'))
    throw new BadRequestError(
      'Ets editor de puzles: escriu a hola@jocmot.cat i esborrarem el compte a mà.',
    );
  app.runInTransaction((tx) => {
    for (const m of membershipsOf(tx, user.id)) leaveLeague(tx, m);
    // Lligues creades on ja no és membre (no hauria de passar): en traiem el creador.
    for (const l of tx.findRecordsByFilter('leagues', 'owner = {:u}', '', 0, 0, { u: user.id })) {
      l.set('owner', '');
      tx.save(l);
    }
    // Editor obert: les propostes i els comentaris s'esborren; els puzles publicats es queden sense autor.
    for (const r of tx.findRecordsByFilter('reviews', 'author = {:u}', '', 0, 0, { u: user.id }))
      tx.delete(r);
    for (const p of tx.findRecordsByFilter('puzzles', 'author = {:u}', '', 0, 0, { u: user.id })) {
      if (p.getString('status') === 'proposed') tx.delete(p);
      else {
        p.set('author', '');
        tx.saveNoValidate(p);
      }
    }
    tx.delete(tx.findRecordById('users', user.id));
  });
}

/**
 * Canvia el dia d'un puzle programat (`number` = número del dia nou). Només dies a partir de demà,
 * i només puzles que encara no han sortit. Si el dia ja té un puzle del mateix joc, s'intercanvien.
 */
function movePuzzle(app, id, number) {
  const todayNumber = lib.puzzleNumberForDate(today());
  if (!Number.isInteger(number) || number <= todayNumber)
    throw new BadRequestError('Tria un dia a partir de demà.');
  const releaseAt = (n) =>
    new Date(lib.madridMidnight(lib.puzzleDate(n))).toISOString().replace('T', ' ');

  app.runInTransaction((tx) => {
    const puzzle = tx.findRecordById('puzzles', id);
    const from = puzzle.getInt('number');
    if (puzzle.getString('status') !== 'published' || from <= todayNumber)
      throw new BadRequestError(
        'Només es poden moure els puzles programats que encara no han sortit.',
      );
    if (from === number) return;
    const other = findFirst(tx, 'puzzles', 'game = {:g} && number = {:n}', {
      g: puzzle.getString('game'),
      n: number,
    });
    // L'índex únic (joc, número) no deixa tenir-ne dos al mateix dia: un passa pel 0 mentre s'intercanvien.
    if (other) {
      other.set('number', 0);
      tx.save(other);
    }
    puzzle.set('number', number);
    puzzle.set('releaseAt', releaseAt(number));
    tx.save(puzzle);
    if (other) {
      other.set('number', from);
      other.set('releaseAt', releaseAt(from));
      tx.save(other);
    }
  });
}

/** Nom (`title`) i dia preferit (`wantedNumber`, null per treure'l) d'un puzle. */
function updatePuzzleInfo(app, user, id, body) {
  const puzzle = app.findRecordById('puzzles', id);
  const own = puzzle.getString('author') === user.id && puzzle.getString('status') === 'proposed';
  if (!user.getBool('editor') && !own)
    throw new ForbiddenError('Només en pots canviar el nom mentre és una proposta teva.');
  if (body.title !== undefined) {
    const title = String(body.title || '').trim();
    if (title.length > 80) throw new BadRequestError('El nom pot tenir com a màxim 80 caràcters.');
    puzzle.set('title', title);
  }
  if (body.wantedNumber !== undefined) {
    if (puzzle.getString('status') !== 'proposed')
      throw new BadRequestError(
        'Aquest puzle ja està programat: canvia’l de dia des del calendari.',
      );
    const n = body.wantedNumber;
    if (n !== null && (!Number.isInteger(n) || n <= lib.puzzleNumberForDate(today())))
      throw new BadRequestError('Tria un dia a partir de demà.');
    puzzle.set('wantedNumber', n || 0);
  }
  app.save(puzzle);
}

/** Propostes pendents com a màxim per persona (els editors no en tenen límit). */
const MAX_PENDING_PROPOSALS = 5;

function checkProposalLimit(app, user) {
  if (user.getBool('editor')) return;
  const pending = app.findRecordsByFilter(
    'puzzles',
    "author = {:u} && status = 'proposed'",
    '',
    MAX_PENDING_PROPOSALS,
    0,
    { u: user.id },
  ).length;
  if (pending >= MAX_PENDING_PROPOSALS)
    throw new BadRequestError(
      `Ja tens ${MAX_PENDING_PROPOSALS} propostes pendents de revisar. Espera que te’n revisin alguna.`,
    );
}

/**
 * Desaprova un puzle programat que encara no ha sortit: torna a ser una proposta, perd el dia
 * i les aprovacions que tenia deixen de comptar (s'ha de tornar a aprovar).
 */
function unpublishPuzzle(app, id) {
  const puzzle = app.findRecordById('puzzles', id);
  if (puzzle.getString('status') !== 'published')
    throw new BadRequestError('Aquest puzle no està programat.');
  if (puzzle.getInt('number') <= lib.puzzleNumberForDate(today()))
    throw new BadRequestError('Aquest puzle ja ha sortit: ja no es pot desaprovar.');
  puzzle.set('status', 'proposed');
  // Es queda amb el dia que tenia com a dia preferit, per si es torna a aprovar.
  puzzle.set('wantedNumber', puzzle.getInt('number'));
  puzzle.set('number', 0);
  puzzle.set('releaseAt', '');
  puzzle.set('contentUpdated', new DateTime());
  app.save(puzzle);
}

/**
 * Un editor corregeix el contingut de qualsevol puzle (proposta, programat o ja sortit).
 * En una proposta, les aprovacions s'han de repetir; un programat es queda al seu dia.
 */
function correctPuzzle(app, id, data) {
  if (!data || typeof data !== 'object') throw new BadRequestError('Falta el puzle.');
  if (JSON.stringify(data).length > 20000) throw new BadRequestError('El puzle és massa gran.');
  const puzzle = app.findRecordById('puzzles', id);
  puzzle.set('data', data);
  if (puzzle.getString('status') === 'proposed') puzzle.set('contentUpdated', new DateTime());
  app.save(puzzle);
}

// ── Likes ──

const LIKE_GAMES = ['paraula', 'connexions', 'fils', 'mini'];

/** Joc i número d'un puzle que ja ha sortit (no es pot fer like a un de futur). */
function likeTarget(game, puzzle) {
  const n = Number(puzzle);
  if (LIKE_GAMES.indexOf(game) < 0 || !Number.isInteger(n) || n < 1)
    throw new NotFoundError('Puzle no trobat');
  if (n > lib.puzzleNumberForDate(today()))
    throw new BadRequestError('Aquest puzle encara no ha sortit.');
  return { g: game, p: n };
}

function likeCount(app, game, puzzle) {
  const rows = arrayOf(new DynamicModel({ n: 0 }));
  app
    .db()
    .newQuery('SELECT COUNT(*) AS n FROM likes WHERE game = {:g} AND puzzle = {:p}')
    .bind({ g: game, p: puzzle })
    .all(rows);
  return rows.length ? rows[0].n : 0;
}

/** Nombre de likes d'un puzle i si a qui ho demana (`userId`, pot ser buit) li agrada. */
function likesOf(app, userId, game, puzzle) {
  const t = likeTarget(game, puzzle);
  const liked = Boolean(
    userId &&
    findFirst(app, 'likes', 'user = {:u} && game = {:g} && puzzle = {:p}', {
      u: userId,
      g: t.g,
      p: t.p,
    }),
  );
  return { count: likeCount(app, t.g, t.p), liked };
}

/** Posa o treu el like. Retorna el recompte nou. */
function setLike(app, userId, game, puzzle, liked) {
  const t = likeTarget(game, puzzle);
  const existing = findFirst(app, 'likes', 'user = {:u} && game = {:g} && puzzle = {:p}', {
    u: userId,
    g: t.g,
    p: t.p,
  });
  if (liked && !existing) {
    const record = new Record(app.findCollectionByNameOrId('likes'));
    record.set('user', userId);
    record.set('game', t.g);
    record.set('puzzle', t.p);
    try {
      app.save(record);
    } catch {
      // Dos tocs alhora: l'índex únic ja l'ha desat l'altre.
    }
  } else if (!liked && existing) app.delete(existing);
  return { count: likeCount(app, t.g, t.p), liked: Boolean(liked) };
}

// ── Xat de les lligues ──

const CHAT_PAGE = 50;
const CHAT_KEEP = 300;
const CHAT_MAX_LENGTH = 300;

function membershipOf(app, leagueId, userId) {
  return findFirst(app, 'league_members', 'league = {:l} && user = {:u}', {
    l: leagueId,
    u: userId,
  });
}

function requireMember(app, leagueId, userId) {
  if (!membershipOf(app, leagueId, userId)) throw new NotFoundError('Lliga no trobada');
}

function chatMessage(app, m, names) {
  const userId = m.getString('user');
  if (!(userId in names)) {
    const u = findFirst(app, 'users', 'id = {:id}', { id: userId });
    names[userId] = u ? person(u) : { id: userId, name: 'Anònim' };
  }
  return {
    id: m.id,
    user: names[userId],
    text: m.getString('text'),
    created: String(m.getString('created')).replace(' ', 'T'),
  };
}

/** Últims missatges (del més antic al més nou). Amb `after` (ISO), només els posteriors. */
function chatMessages(app, leagueId, after) {
  const filter = after ? 'league = {:l} && created > {:after}' : 'league = {:l}';
  const params = { l: leagueId };
  if (after) params.after = String(after).replace('T', ' ');
  const rows = app.findRecordsByFilter('league_messages', filter, '-created', CHAT_PAGE, 0, params);
  const names = {};
  return rows.reverse().map((m) => chatMessage(app, m, names));
}

/** Últim missatge d'una lliga (per al resum de les lligues), o null. */
function lastChatMessage(app, leagueId) {
  const rows = app.findRecordsByFilter('league_messages', 'league = {:l}', '-created', 1, 0, {
    l: leagueId,
  });
  return rows.length ? chatMessage(app, rows[0], {}) : null;
}

function postChatMessage(app, leagueId, user, text) {
  requireMember(app, leagueId, user.id);
  const clean = String(text || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!clean) throw new BadRequestError('Escriu alguna cosa.');
  if (clean.length > CHAT_MAX_LENGTH)
    throw new BadRequestError(`Com a màxim ${CHAT_MAX_LENGTH} caràcters.`);
  // Sense inundar el xat: un missatge cada 2 segons com a molt.
  const last = app.findRecordsByFilter(
    'league_messages',
    'league = {:l} && user = {:u}',
    '-created',
    1,
    0,
    { l: leagueId, u: user.id },
  )[0];
  if (last && Date.now() - toMs(last.getString('created')) < 2000)
    throw new BadRequestError('Vas massa de pressa. Espera un moment.');

  const record = new Record(app.findCollectionByNameOrId('league_messages'));
  record.set('league', leagueId);
  record.set('user', user.id);
  record.set('text', clean);
  app.save(record);

  // Només es guarden els últims missatges de cada lliga.
  const old = app.findRecordsByFilter(
    'league_messages',
    'league = {:l}',
    '-created',
    100,
    CHAT_KEEP,
    {
      l: leagueId,
    },
  );
  for (const m of old) app.delete(m);

  return chatMessage(app, record, { [user.id]: person(user) });
}

/** Esborra un missatge: el seu autor o el creador de la lliga. */
function deleteChatMessage(app, leagueId, messageId, userId) {
  requireMember(app, leagueId, userId);
  const m = findFirst(app, 'league_messages', 'id = {:id} && league = {:l}', {
    id: messageId,
    l: leagueId,
  });
  if (!m) throw new NotFoundError('Missatge no trobat');
  const league = app.findRecordById('leagues', leagueId);
  if (m.getString('user') !== userId && league.getString('owner') !== userId)
    throw new ForbiddenError('Només pots esborrar els teus missatges.');
  app.delete(m);
}

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
  searchUsers,
  newLeagueCode,
  membersOf,
  membershipsOf,
  leaveLeague,
  deleteAccount,
  movePuzzle,
  checkProposalLimit,
  updatePuzzleInfo,
  unpublishPuzzle,
  correctPuzzle,
  likesOf,
  setLike,
  requireMember,
  chatMessages,
  lastChatMessage,
  postChatMessage,
  deleteChatMessage,
  leagueMonths,
};
