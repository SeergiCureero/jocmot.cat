/// <reference path="../pb_data/types.d.ts" />

/**
 * Punts, amistats i lligues.
 * Només el servidor escriu en aquestes col·leccions (hooks i rutes de `pb_hooks/jocmot.pb.js`):
 * per això les regles de creació i edició són buides (només superusuaris).
 */
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users');
    // Els amics es busquen pel nom d'usuari: ha de ser únic (sense distingir majúscules).
    users.addIndex('idx_users_name_unique', true, 'LOWER(TRIM(name))', "TRIM(name) != ''");
    app.save(users);

    const userField = (name) => ({
      name,
      type: 'relation',
      required: true,
      maxSelect: 1,
      collectionId: users.id,
      cascadeDelete: true,
    });

    // ── scores: una puntuació per usuari i puzle, calculada pel servidor en acabar ──
    const scores = new Collection({
      type: 'base',
      name: 'scores',
      fields: [
        userField('user'),
        { name: 'game', type: 'text', required: true },
        { name: 'puzzle', type: 'number', required: true, onlyInt: true },
        // Dia (Madrid) en què es va acabar, i el mes per a les lligues.
        { name: 'day', type: 'text', required: true },
        { name: 'month', type: 'text', required: true },
        // true = puzle del dia jugat el seu dia; false = arxiu.
        { name: 'daily', type: 'bool' },
        { name: 'base', type: 'number', onlyInt: true },
        { name: 'bonus', type: 'number', onlyInt: true },
        { name: 'points', type: 'number', onlyInt: true },
        { name: 'streak', type: 'number', onlyInt: true },
        { name: 'created', type: 'autodate', onCreate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_scores_unique ON scores (user, game, puzzle)',
        'CREATE INDEX idx_scores_month ON scores (month, user)',
        'CREATE INDEX idx_scores_day ON scores (user, daily, day)',
      ],
      listRule: 'user = @request.auth.id',
      viewRule: 'user = @request.auth.id',
    });
    app.save(scores);

    // ── friendships: sol·licituds d'amistat (from → to) ──
    const friendships = new Collection({
      type: 'base',
      name: 'friendships',
      fields: [
        userField('from'),
        userField('to'),
        {
          name: 'status',
          type: 'select',
          required: true,
          maxSelect: 1,
          values: ['pending', 'accepted'],
        },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_friendships_unique ON friendships (`from`, `to`)',
        'CREATE INDEX idx_friendships_to ON friendships (`to`)',
      ],
    });
    app.save(friendships);

    // ── leagues: lligues privades; s'hi entra amb el codi ──
    const leagues = new Collection({
      type: 'base',
      name: 'leagues',
      fields: [
        { name: 'name', type: 'text', required: true, min: 1, max: 40 },
        { name: 'code', type: 'text', required: true, min: 6, max: 6 },
        { name: 'owner', type: 'relation', maxSelect: 1, collectionId: users.id },
        { name: 'created', type: 'autodate', onCreate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_leagues_code ON leagues (code)'],
    });
    app.save(leagues);

    const members = new Collection({
      type: 'base',
      name: 'league_members',
      fields: [
        {
          name: 'league',
          type: 'relation',
          required: true,
          maxSelect: 1,
          collectionId: leagues.id,
          cascadeDelete: true,
        },
        userField('user'),
        { name: 'created', type: 'autodate', onCreate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_league_members_unique ON league_members (league, user)',
        'CREATE INDEX idx_league_members_user ON league_members (user)',
      ],
    });
    app.save(members);
  },
  (app) => {
    for (const name of ['league_members', 'leagues', 'friendships', 'scores'])
      app.delete(app.findCollectionByNameOrId(name));
    const users = app.findCollectionByNameOrId('users');
    users.removeIndex('idx_users_name_unique');
    app.save(users);
  },
);
