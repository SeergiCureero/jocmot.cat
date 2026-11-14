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
    for (const f of ['daily', 'base', 'bonus', 'empenta', 'embranzida', 'points', 'streak'])
      result[f] = score.get(f);
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
        lastMessage: db.lastChatMessage(e.app, league.id),
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

/**
 * Lliga mundial d'un mes (?mes=AAAA-MM; per defecte, l'actual): el top de qui hi participa (opt-in)
 * i, si qui mira hi participa i és fora del top, la seva fila amb la posició real.
 */
routerAdd(
  'GET',
  '/api/jocmot/lligues/mundial',
  (e) => {
    const db = require(`${__hooks}/jocmot_db.js`);
    const lib = require(`${__hooks}/jocmot.js`);
    const current = db.today().slice(0, 7);
    const months = [];
    for (
      let [y, m] = current.split('-').map(Number);
      `${y}-${m < 10 ? '0' : ''}${m}` >= lib.LAUNCH_DATE.slice(0, 7);
    ) {
      months.push(`${y}-${m < 10 ? '0' : ''}${m}`);
      if (--m === 0) {
        m = 12;
        y--;
      }
    }
    const requested = e.request.url.query().get('mes');
    const month = months.indexOf(requested) >= 0 ? requested : current;
    const participation = e.auth.getString('worldLeague');
    const world = db.worldRanking(e.app, month, participation === 'yes' ? e.auth.id : '');
    const finished = month !== current;
    return e.json(200, {
      month,
      months,
      finished,
      participation: participation || null,
      size: db.WORLD_LEAGUE_SIZE,
      winner: finished && world.ranking[0] ? world.ranking[0].user : null,
      ranking: world.ranking,
      me: world.me,
    });
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

/** Xat de la lliga: últims missatges (?despres=ISO per demanar només els nous). */
routerAdd(
  'GET',
  '/api/jocmot/lligues/{id}/xat',
  (e) => {
    const db = require(`${__hooks}/jocmot_db.js`);
    const id = e.request.pathValue('id');
    db.requireMember(e.app, id, e.auth.id);
    const after = e.request.url.query().get('despres');
    return e.json(200, { messages: db.chatMessages(e.app, id, after) });
  },
  $apis.requireAuth('users'),
);

routerAdd(
  'POST',
  '/api/jocmot/lligues/{id}/xat',
  (e) => {
    const db = require(`${__hooks}/jocmot_db.js`);
    const message = db.postChatMessage(
      e.app,
      e.request.pathValue('id'),
      e.auth,
      e.requestInfo().body.text,
    );
    return e.json(200, message);
  },
  $apis.requireAuth('users'),
);

/** Esborra un missatge del xat (el seu autor o el creador de la lliga). */
routerAdd(
  'DELETE',
  '/api/jocmot/lligues/{id}/xat/{msg}',
  (e) => {
    const db = require(`${__hooks}/jocmot_db.js`);
    db.deleteChatMessage(e.app, e.request.pathValue('id'), e.request.pathValue('msg'), e.auth.id);
    return e.noContent(204);
  },
  $apis.requireAuth('users'),
);

// ── Likes dels puzles ──

/** Trànsit de l'aplicació: gent que juga, comptes nous i partides per dia (?dies=30). Només editors. */
routerAdd(
  'GET',
  '/api/jocmot/admin/transit',
  (e) => {
    if (!e.auth.getBool('editor')) throw new ForbiddenError('Només per a editors.');
    const db = require(`${__hooks}/jocmot_db.js`);
    return e.json(200, db.trafficReport(e.app, e.request.url.query().get('dies')));
  },
  $apis.requireAuth('users'),
);

/** Valoració dels puzles d'un joc: likes i partides acabades de cada dia. Només editors. */
routerAdd(
  'GET',
  '/api/jocmot/admin/valoracions/{game}',
  (e) => {
    if (!e.auth.getBool('editor')) throw new ForbiddenError('Només per a editors.');
    const db = require(`${__hooks}/jocmot_db.js`);
    return e.json(200, { puzzles: db.likesReport(e.app, e.request.pathValue('game')) });
  },
  $apis.requireAuth('users'),
);

/** Quanta gent li agrada un puzle i si t'agrada a tu (sense compte, només el recompte). */
routerAdd('GET', '/api/jocmot/likes/{game}/{puzzle}', (e) => {
  const db = require(`${__hooks}/jocmot_db.js`);
  return e.json(
    200,
    db.likesOf(
      e.app,
      e.auth ? e.auth.id : '',
      e.request.pathValue('game'),
      e.request.pathValue('puzzle'),
    ),
  );
});

/** Posa ({liked: true}) o treu ({liked: false}) el like. */
routerAdd(
  'POST',
  '/api/jocmot/likes/{game}/{puzzle}',
  (e) => {
    const db = require(`${__hooks}/jocmot_db.js`);
    return e.json(
      200,
      db.setLike(
        e.app,
        e.auth.id,
        e.request.pathValue('game'),
        e.request.pathValue('puzzle'),
        Boolean(e.requestInfo().body.liked),
      ),
    );
  },
  $apis.requireAuth('users'),
);

// ── Joc preferit (votació) ──

/** Vots de cada joc i el teu (sense compte, només el recompte). */
routerAdd('GET', '/api/jocmot/vots', (e) => {
  const db = require(`${__hooks}/jocmot_db.js`);
  return e.json(200, db.votesOf(e.app, e.auth ? e.auth.id : ''));
});

/** Vota el teu joc preferit (un sol vot per persona; el pots canviar). */
routerAdd(
  'POST',
  '/api/jocmot/vots',
  (e) => {
    const db = require(`${__hooks}/jocmot_db.js`);
    db.setVote(e.app, e.auth.id, e.requestInfo().body.game);
    return e.json(200, db.votesOf(e.app, e.auth.id));
  },
  $apis.requireAuth('users'),
);

// ── Pistes ──

/** Pistes ja mirades (abans d'acabar) dels puzles d'un número. */
routerAdd(
  'GET',
  '/api/jocmot/pistes/{puzzle}',
  (e) => {
    const db = require(`${__hooks}/jocmot_db.js`);
    return e.json(200, { games: db.hintUsesFor(e.app, e.auth.id, e.request.pathValue('puzzle')) });
  },
  $apis.requireAuth('users'),
);

/** Apunta les pistes destapades ({count, solution}). Resten punts quan s'acaba el puzle. */
routerAdd(
  'POST',
  '/api/jocmot/pistes/{game}/{puzzle}',
  (e) => {
    const db = require(`${__hooks}/jocmot_db.js`);
    return e.json(
      200,
      db.recordHintUse(
        e.app,
        e.auth.id,
        e.request.pathValue('game'),
        e.request.pathValue('puzzle'),
        e.requestInfo().body,
      ),
    );
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

// Les aprovacions valen fins que canvia el contingut del puzle (no el nom ni el dia preferit).
onRecordCreateRequest((e) => {
  // Editor obert: qui no és editor només pot tenir unes quantes propostes pendents.
  if (!e.hasSuperuserAuth() && e.auth)
    require(`${__hooks}/jocmot_db.js`).checkProposalLimit(e.app, e.auth);
  e.record.set('contentUpdated', new DateTime());
  e.next();
}, 'puzzles');

onRecordUpdateRequest((e) => {
  if (e.record.original().getString('data') !== e.record.getString('data'))
    e.record.set('contentUpdated', new DateTime());
  e.next();
}, 'puzzles');

/** Canvia el nom d'un puzle o el dia preferit d'una proposta. Editors, o l'autor mentre és una proposta. */
routerAdd(
  'POST',
  '/api/jocmot/puzles/{id}/info',
  (e) => {
    const db = require(`${__hooks}/jocmot_db.js`);
    db.updatePuzzleInfo(e.app, e.auth, e.request.pathValue('id'), e.requestInfo().body);
    return e.noContent(204);
  },
  $apis.requireAuth('users'),
);

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

/** Desaprova un puzle programat que encara no ha sortit: torna a revisió. Només editors. */
routerAdd(
  'POST',
  '/api/jocmot/puzles/{id}/desaprova',
  (e) => {
    if (!e.auth.getBool('editor')) throw new ForbiddenError('Només per a editors.');
    require(`${__hooks}/jocmot_db.js`).unpublishPuzzle(e.app, e.request.pathValue('id'));
    return e.noContent(204);
  },
  $apis.requireAuth('users'),
);

/** Corregeix el contingut de qualsevol puzle (també programat o ja sortit). Només editors. */
routerAdd(
  'POST',
  '/api/jocmot/puzles/{id}/corregeix',
  (e) => {
    if (!e.auth.getBool('editor')) throw new ForbiddenError('Només per a editors.');
    require(`${__hooks}/jocmot_db.js`).correctPuzzle(
      e.app,
      e.request.pathValue('id'),
      e.requestInfo().body.data,
    );
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

// ── Avís diari (notificacions) ──

/** Clau pública VAPID perquè el navegador es pugui subscriure (null = avisos desactivats). */
routerAdd('GET', '/api/jocmot/avisos/clau', (e) => {
  return e.json(200, { publicKey: require(`${__hooks}/jocmot_avisos.js`).publicKey() });
});

routerAdd(
  'POST',
  '/api/jocmot/avisos',
  (e) => {
    require(`${__hooks}/jocmot_avisos.js`).subscribe(e.app, e.auth, e.requestInfo().body);
    return e.noContent(204);
  },
  $apis.requireAuth('users'),
);

routerAdd(
  'POST',
  '/api/jocmot/avisos/treu',
  (e) => {
    require(`${__hooks}/jocmot_avisos.js`).unsubscribe(
      e.app,
      e.auth,
      e.requestInfo().body.endpoint,
    );
    return e.noContent(204);
  },
  $apis.requireAuth('users'),
);

routerAdd(
  'POST',
  '/api/jocmot/avisos/prova',
  (e) => e.json(200, require(`${__hooks}/jocmot_avisos.js`).sendTest(e.app, e.auth)),
  $apis.requireAuth('users'),
);

// Cada hora en punt: els avisos de l'hora (de Madrid) que toca.
cronAdd('jocmot_avisos', '0 * * * *', () => {
  require(`${__hooks}/jocmot_avisos.js`).sendDailyReminders($app);
});

/** Executa ara els avisos de l'hora actual (com el cron). Per provar-ho. */
routerAdd(
  'POST',
  '/api/jocmot/admin/avisos',
  (e) => {
    require(`${__hooks}/jocmot_avisos.js`).sendDailyReminders(e.app);
    return e.noContent(204);
  },
  $apis.requireSuperuserAuth(),
);

// ── Correu per tornar a jugar ──

// Cada hora, i només a les 18:00 de Madrid fa la tanda del dia.
cronAdd('jocmot_recorda', '30 * * * *', () => {
  require(`${__hooks}/jocmot_recorda.js`).cron($app);
});

/** Baixa amb un clic des del correu (sense compte). GET per a l'enllaç, POST per al "List-Unsubscribe". */
const unsub = (e) => {
  const ok = require(`${__hooks}/jocmot_recorda.js`).unsubscribe(
    e.app,
    e.request.pathValue('token'),
  );
  const msg = ok
    ? 'Fet! No et tornarem a escriure per això. Pots tornar-ho a activar des del teu perfil.'
    : 'Aquest enllaç no és vàlid.';
  return e.html(
    ok ? 200 : 404,
    `<!doctype html><html lang="ca"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>jocmot.cat</title><body style="font-family:system-ui,sans-serif;max-width:28rem;margin:4rem auto;padding:0 1rem;color:#1c1917"><p style="font-size:20px;font-weight:800">jocmot<span style="color:#0f766e">.cat</span></p><p>${msg}</p><p><a href="https://jocmot.cat" style="color:#0f766e">Torna a jocmot.cat</a></p></body></html>`,
  );
};
routerAdd('GET', '/api/jocmot/baixa/{token}', unsub);
routerAdd('POST', '/api/jocmot/baixa/{token}', unsub);

/** Envia un correu d'exemple a l'adreça indicada ({email}). Només superusuaris. */
routerAdd(
  'POST',
  '/api/jocmot/admin/recorda/prova',
  (e) => {
    const email = String(e.requestInfo().body.email || '').trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new BadRequestError('Adreça no vàlida.');
    require(`${__hooks}/jocmot_recorda.js`).sendSample(e.app, email);
    return e.json(200, { sent: email });
  },
  $apis.requireSuperuserAuth(),
);

/** Qui rebria el correu ara (?prova=1) o envia la tanda ara mateix. Només superusuaris. */
routerAdd(
  'POST',
  '/api/jocmot/admin/recorda',
  (e) => {
    const dry = e.request.url.query().get('prova') === '1';
    return e.json(200, require(`${__hooks}/jocmot_recorda.js`).sendReturnEmails(e.app, dry));
  },
  $apis.requireSuperuserAuth(),
);
