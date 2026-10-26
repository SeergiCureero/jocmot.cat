/// <reference path="../pb_data/types.d.ts" />

/**
 * Esquema de jocmot.cat: comptes, progrés, puzles del grup i revisions.
 * PocketBase aplica les migracions automàticament en arrencar.
 */
migrate(
  (app) => {
    // ── users: afegim el rol d'editor (només el pot canviar un superusuari) ──
    const users = app.findCollectionByNameOrId('users');
    users.fields.add(new BoolField({ name: 'editor' }));
    users.createRule = '@request.body.editor:isset = false';
    users.updateRule = 'id = @request.auth.id && @request.body.editor:isset = false';
    // Els editors es veuen entre ells (per mostrar qui ha fet cada puzle). El correu continua ocult.
    users.listRule = 'id = @request.auth.id || @request.auth.editor = true';
    users.viewRule = users.listRule;
    app.save(users);

    // ── progress: progrés de cada usuari en cada puzle ──
    const progress = new Collection({
      type: 'base',
      name: 'progress',
      fields: [
        {
          name: 'user',
          type: 'relation',
          required: true,
          maxSelect: 1,
          collectionId: users.id,
          cascadeDelete: true,
        },
        { name: 'game', type: 'text', required: true },
        { name: 'puzzle', type: 'number', required: true, onlyInt: true },
        { name: 'status', type: 'text', required: true },
        { name: 'state', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_progress_unique ON progress (user, game, puzzle)'],
      listRule: 'user = @request.auth.id',
      viewRule: 'user = @request.auth.id',
      createRule: '@request.auth.id != "" && @request.body.user = @request.auth.id',
      updateRule: 'user = @request.auth.id',
      deleteRule: 'user = @request.auth.id',
    });
    app.save(progress);

    // ── puzzles: puzles dissenyats pel grup ──
    // status "proposed" → en revisió; "published" → té número i data assignats.
    // El públic només veu els publicats quan arriba el seu dia (sense espòilers).
    const editor = '@request.auth.editor = true';
    const puzzles = new Collection({
      type: 'base',
      name: 'puzzles',
      fields: [
        {
          name: 'game',
          type: 'select',
          required: true,
          maxSelect: 1,
          values: ['connexions', 'fils', 'mini'],
        },
        { name: 'data', type: 'json', required: true, maxSize: 20000 },
        { name: 'author', type: 'relation', required: true, maxSelect: 1, collectionId: users.id },
        {
          name: 'status',
          type: 'select',
          required: true,
          maxSelect: 1,
          values: ['proposed', 'published'],
        },
        { name: 'number', type: 'number', onlyInt: true, min: 0 },
        { name: 'releaseAt', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_puzzles_number ON puzzles (game, number) WHERE number > 0',
      ],
      listRule: `(status = "published" && releaseAt <= @now) || ${editor}`,
      viewRule: `(status = "published" && releaseAt <= @now) || ${editor}`,
      createRule: `${editor} && @request.body.author = @request.auth.id && @request.body.status = "proposed"`,
      // Qualsevol editor pot publicar (és un grup de confiança); un publicat ja no es pot editar.
      updateRule: `${editor} && status = "proposed" && (@request.body.author:isset = false || @request.body.author = author)`,
      deleteRule: `${editor} && author = @request.auth.id && status = "proposed"`,
    });
    app.save(puzzles);

    // ── reviews: aprovacions i comentaris dels editors ──
    const reviews = new Collection({
      type: 'base',
      name: 'reviews',
      fields: [
        {
          name: 'puzzle',
          type: 'relation',
          required: true,
          maxSelect: 1,
          collectionId: puzzles.id,
          cascadeDelete: true,
        },
        { name: 'author', type: 'relation', required: true, maxSelect: 1, collectionId: users.id },
        { name: 'approved', type: 'bool' },
        { name: 'comment', type: 'text', max: 2000 },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_reviews_unique ON reviews (puzzle, author)'],
      listRule: editor,
      viewRule: editor,
      // No es pot aprovar el propi puzle.
      createRule: `${editor} && @request.body.author = @request.auth.id && (@request.body.approved != true || @request.body.puzzle.author != @request.auth.id)`,
      updateRule: `author = @request.auth.id && (@request.body.approved != true || puzzle.author != @request.auth.id)`,
      deleteRule: 'author = @request.auth.id',
    });
    app.save(reviews);
  },
  (app) => {
    for (const name of ['reviews', 'puzzles', 'progress'])
      app.delete(app.findCollectionByNameOrId(name));
    const users = app.findCollectionByNameOrId('users');
    users.fields.removeByName('editor');
    app.save(users);
  },
);
