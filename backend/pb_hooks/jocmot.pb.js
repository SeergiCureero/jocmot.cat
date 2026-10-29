/// <reference path="../pb_data/types.d.ts" />

/**
 * Punts, amistats i lligues de jocmot.cat.
 * - En acabar una partida (registre de `progress`), el servidor en calcula els punts.
 * - Les rutes /api/jocmot/* donen al frontend el perfil, els amics i les lligues.
 * Recordatori: cada handler és aïllat; el codi compartit es carrega amb `require` a dins.
 */

// ── Punts en acabar una partida ──

onRecordAfterCreateSuccess((e) => {
  require(`${__hooks}/jocmot_db.js`).recordScore(e.app, e.record);
  e.next();
}, 'progress');

onRecordAfterUpdateSuccess((e) => {
  require(`${__hooks}/jocmot_db.js`).recordScore(e.app, e.record);
  e.next();
}, 'progress');

// ── Noms d'usuari: obligatoris i únics (els amics es busquen pel nom) ──

onRecordCreateRequest((e) => {
  require(`${__hooks}/jocmot_db.js`).checkUsername(e);
  e.next();
}, 'users');

onRecordUpdateRequest((e) => {
  if (e.record.original().getString('name') !== e.record.getString('name'))
    require(`${__hooks}/jocmot_db.js`).checkUsername(e);
  e.next();
}, 'users');

// ── Perfil ──

routerAdd(
  'GET',
  '/api/jocmot/perfil',
  (e) => {
    const db = require(`${__hooks}/jocmot_db.js`);
    const month = db.today().slice(0, 7);
    const stats = db.statsFor(e.app, [e.auth.id], month)[e.auth.id];
    return e.json(200, Object.assign({ user: db.person(e.auth), month }, stats));
  },
  $apis.requireAuth('users'),
);

/** Punts d'un puzle concret (per a la finestra de resultat). */
routerAdd(
  'GET',
  '/api/jocmot/puntuacio/{game}/{puzzle}',
  (e) => {
    const db = require(`${__hooks}/jocmot_db.js`);
    const score = db.findFirst(e.app, 'scores', 'user = {:u} && game = {:g} && puzzle = {:p}', {
      u: e.auth.id,
      g: e.request.pathValue('game'),
      p: Number(e.request.pathValue('puzzle')),
    });
    if (!score) throw new NotFoundError('Encara no hi ha puntuació');
    const result = {};
    for (const f of ['daily', 'base', 'bonus', 'points', 'streak']) result[f] = score.get(f);
    return e.json(200, result);
  },
  $apis.requireAuth('users'),
);

// ── Amistats ──

routerAdd(
  'GET',
  '/api/jocmot/amics',
  (e) => {
    const db = require(`${__hooks}/jocmot_db.js`);
    const me = e.auth.id;
    const friends = [];
    const incoming = [];
    const outgoing = [];
    for (const f of db.friendshipsOf(e.app, me)) {
      const otherId = f.getString('from') === me ? f.getString('to') : f.getString('from');
      const other = db.person(e.app.findRecordById('users', otherId));
      if (f.getString('status') === 'accepted') friends.push(other);
      else (f.getString('to') === me ? incoming : outgoing).push({ id: f.id, user: other });
    }
    const month = db.today().slice(0, 7);
    const people = friends.concat([db.person(e.auth)]);
    const stats = db.statsFor(
      e.app,
      people.map((p) => p.id),
      month,
    );
    return e.json(200, { month, ranking: db.ranking(people, stats), incoming, outgoing });
  },
  $apis.requireAuth('users'),
);

/** Cerca d'usuaris per afegir com a amics (?q=, mínim 2 lletres). */
routerAdd(
  'GET',
  '/api/jocmot/usuaris',
  (e) => {
    const db = require(`${__hooks}/jocmot_db.js`);
    const q = e.request.url.query().get('q');
    return e.json(200, { users: db.searchUsers(e.app, e.auth.id, q) });
  },
  $apis.requireAuth('users'),
);

routerAdd(
  'POST',
  '/api/jocmot/amics',
  (e) => {
    const db = require(`${__hooks}/jocmot_db.js`);
    const me = e.auth.id;
    const found = db.findUserByName(e.app, e.requestInfo().body.username);
    if (found.error === 'not-found') throw new NotFoundError('No hi ha cap usuari amb aquest nom');
    if (found.error) throw new BadRequestError('Hi ha més d’un usuari amb aquest nom');
    const other = found.user.id;
    if (other === me) throw new BadRequestError('No pots afegir-te a tu mateix');
    if (db.friendshipsOf(e.app, me).length >= db.MAX_FRIENDS)
      throw new BadRequestError('Has arribat al màxim d’amics');

    const mine = db.findFirst(e.app, 'friendships', 'from = {:a} && to = {:b}', {
      a: me,
      b: other,
    });
    const theirs = db.findFirst(e.app, 'friendships', 'from = {:a} && to = {:b}', {
      a: other,
      b: me,
    });
    const existing = mine || theirs;
    if (existing && existing.getString('status') === 'accepted')
      throw new BadRequestError('Ja sou amics');
    if (mine) throw new BadRequestError('Ja li has enviat una sol·licitud');
    if (theirs) {
      // L'altra persona ja te l'havia enviada: l'acceptem directament.
      theirs.set('status', 'accepted');
      e.app.save(theirs);
      return e.json(200, { status: 'accepted' });
    }
    const record = new Record(e.app.findCollectionByNameOrId('friendships'));
    record.set('from', me);
    record.set('to', other);
    record.set('status', 'pending');
    e.app.save(record);
    return e.json(200, { status: 'pending' });
  },
  $apis.requireAuth('users'),
);

routerAdd(
  'POST',
  '/api/jocmot/amics/{id}/accepta',
  (e) => {
    const db = require(`${__hooks}/jocmot_db.js`);
    const f = db.findFirst(e.app, 'friendships', 'id = {:id} && to = {:me} && status = "pending"', {
      id: e.request.pathValue('id'),
      me: e.auth.id,
    });
    if (!f) throw new NotFoundError('Sol·licitud no trobada');
    f.set('status', 'accepted');
    e.app.save(f);
    return e.json(200, { status: 'accepted' });
  },
  $apis.requireAuth('users'),
);

/** Rebutjar, cancel·lar o deixar de ser amics. */
routerAdd(
  'DELETE',
  '/api/jocmot/amics/{id}',
  (e) => {
    const db = require(`${__hooks}/jocmot_db.js`);
    const f = db.findFirst(e.app, 'friendships', 'id = {:id} && (from = {:me} || to = {:me})', {
      id: e.request.pathValue('id'),
      me: e.auth.id,
    });
    if (!f) throw new NotFoundError('Amistat no trobada');
    e.app.delete(f);
    return e.noContent(204);
  },
  $apis.requireAuth('users'),
);

/** Deixar de ser amic d'algú pel seu id d'usuari (des del rànquing d'amics). */
routerAdd(
  'DELETE',
  '/api/jocmot/amics/usuari/{userId}',
  (e) => {
    const db = require(`${__hooks}/jocmot_db.js`);
    const other = e.request.pathValue('userId');
    const f = db.findFirst(
      e.app,
      'friendships',
      '(from = {:me} && to = {:o}) || (from = {:o} && to = {:me})',
      { me: e.auth.id, o: other },
    );
    if (!f) throw new NotFoundError('Amistat no trobada');
    e.app.delete(f);
    return e.noContent(204);
  },
  $apis.requireAuth('users'),
);

// ── Lligues ──

routerAdd(
  'GET',
  '/api/jocmot/lligues',
  (e) => {
    const db = require(`${__hooks}/jocmot_db.js`);
    const month = db.today().slice(0, 7);
    const leagues = db.membershipsOf(e.app, e.auth.id).map((m) => {
      const league = e.app.findRecordById('leagues', m.getString('league'));
      const people = db
        .membersOf(e.app, league.id)
        .map((x) => db.person(e.app.findRecordById('users', x.getString('user'))));
      const rows = db.ranking(
        people,
        db.statsFor(
          e.app,
          people.map((p) => p.id),
          month,
        ),
      );
      const me = rows.find((r) => r.user.id === e.auth.id);
      return {
        id: league.id,
        name: league.getString('name'),
        code: league.getString('code'),
        members: rows.length,
        position: me ? me.position : null,
        leader: rows[0] && rows[0].monthPoints > 0 ? rows[0].user : null,
      };
    });
    return e.json(200, { month, leagues });
  },
  $apis.requireAuth('users'),
);

routerAdd(
  'POST',
  '/api/jocmot/lligues',
  (e) => {
    const db = require(`${__hooks}/jocmot_db.js`);
    const name = String(e.requestInfo().body.name || '').trim();
    if (!name || name.length > 40)
      throw new BadRequestError('El nom ha de tenir entre 1 i 40 caràcters');
    if (db.membershipsOf(e.app, e.auth.id).length >= db.MAX_LEAGUES_PER_USER)
      throw new BadRequestError('Ja ets a massa lligues');

    let league;
    e.app.runInTransaction((tx) => {
      league = new Record(tx.findCollectionByNameOrId('leagues'));
      league.set('name', name);
      league.set('code', db.newLeagueCode(tx));
      league.set('owner', e.auth.id);
      tx.save(league);
      const member = new Record(tx.findCollectionByNameOrId('league_members'));
      member.set('league', league.id);
      member.set('user', e.auth.id);
      tx.save(member);
    });
    return e.json(200, { id: league.id, code: league.getString('code') });
  },
  $apis.requireAuth('users'),
);

routerAdd(
  'POST',
  '/api/jocmot/lligues/unir',
  (e) => {
    const db = require(`${__hooks}/jocmot_db.js`);
    const code = String(e.requestInfo().body.code || '')
      .trim()
      .toUpperCase();
    const league = db.findFirst(e.app, 'leagues', 'code = {:c}', { c: code });
    if (!league) throw new NotFoundError('No hi ha cap lliga amb aquest codi');
    if (
      db.findFirst(e.app, 'league_members', 'league = {:l} && user = {:u}', {
        l: league.id,
        u: e.auth.id,
      })
    )
      return e.json(200, { id: league.id, already: true });
    if (db.membersOf(e.app, league.id).length >= db.MAX_LEAGUE_MEMBERS)
      throw new BadRequestError('Aquesta lliga ja és plena');
    if (db.membershipsOf(e.app, e.auth.id).length >= db.MAX_LEAGUES_PER_USER)
      throw new BadRequestError('Ja ets a massa lligues');
    const member = new Record(e.app.findCollectionByNameOrId('league_members'));
    member.set('league', league.id);
    member.set('user', e.auth.id);
    e.app.save(member);
    return e.json(200, { id: league.id });
  },
  $apis.requireAuth('users'),
);

/** Classificació d'una lliga per a un mes (?mes=AAAA-MM; per defecte, l'actual). */
routerAdd(
  'GET',
  '/api/jocmot/lligues/{id}',
  (e) => {
    const db = require(`${__hooks}/jocmot_db.js`);
    const id = e.request.pathValue('id');
    if (
      !db.findFirst(e.app, 'league_members', 'league = {:l} && user = {:u}', {
        l: id,
        u: e.auth.id,
      })
    )
      throw new NotFoundError('Lliga no trobada');
    const league = e.app.findRecordById('leagues', id);
    const months = db.leagueMonths(league);
    const requested = e.request.url.query().get('mes');
    const month = months.indexOf(requested) >= 0 ? requested : months[0];
    const people = db
      .membersOf(e.app, id)
      .map((m) => db.person(e.app.findRecordById('users', m.getString('user'))));
    const rows = db.ranking(
      people,
      db.statsFor(
        e.app,
        people.map((p) => p.id),
        month,
      ),
    );
    const finished = month !== months[0];
    return e.json(200, {
      id,
      name: league.getString('name'),
      code: league.getString('code'),
      isOwner: league.getString('owner') === e.auth.id,
      month,
      months,
      finished,
      winner: finished && rows[0] && rows[0].monthPoints > 0 ? rows[0].user : null,
      ranking: rows,
    });
  },
  $apis.requireAuth('users'),
);

/** Sortir d'una lliga. Si en surt el creador, passa a ser-ho el membre més antic; si queda buida, s'esborra. */
routerAdd(
  'DELETE',
  '/api/jocmot/lligues/{id}/membre',
  (e) => {
    const db = require(`${__hooks}/jocmot_db.js`);
    const id = e.request.pathValue('id');
    const membership = db.findFirst(e.app, 'league_members', 'league = {:l} && user = {:u}', {
      l: id,
      u: e.auth.id,
    });
    if (!membership) throw new NotFoundError('Lliga no trobada');
    e.app.runInTransaction((tx) => db.leaveLeague(tx, membership));
    return e.noContent(204);
  },
  $apis.requireAuth('users'),
);

// ── Compte ──

/** Esborra el compte de qui fa la petició, amb totes les seves dades. Cal la contrasenya. */
routerAdd(
  'DELETE',
  '/api/jocmot/compte',
  (e) => {
    const db = require(`${__hooks}/jocmot_db.js`);
    db.deleteAccount(e.app, e.auth, e.requestInfo().body.password);
    return e.noContent(204);
  },
  $apis.requireAuth('users'),
);

// ── Editor ──

/** Canvia el dia d'un puzle programat (o l'intercanvia amb el que hi hagi). Només editors. */
routerAdd(
  'POST',
  '/api/jocmot/puzles/{id}/dia',
  (e) => {
    if (!e.auth.getBool('editor')) throw new ForbiddenError('Només per a editors.');
    const db = require(`${__hooks}/jocmot_db.js`);
    db.movePuzzle(e.app, e.request.pathValue('id'), e.requestInfo().body.number);
    return e.noContent(204);
  },
  $apis.requireAuth('users'),
);

// ── Administració ──

/** Calcula les puntuacions que faltin a partir del progrés ja desat (p. ex. partides d'abans d'aquesta funció). */
routerAdd(
  'POST',
  '/api/jocmot/admin/recalcula',
  (e) => {
    const db = require(`${__hooks}/jocmot_db.js`);
    const finished = e.app.findRecordsByFilter('progress', 'status != "playing"', 'updated', 0, 0);
    let created = 0;
    for (const p of finished)
      if (db.recordScore(e.app, p, db.toMs(p.getString('updated')))) created++;
    return e.json(200, { checked: finished.length, created });
  },
  $apis.requireSuperuserAuth(),
);
