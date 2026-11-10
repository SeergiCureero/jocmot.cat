/// <reference path="../pb_data/types.d.ts" />

/**
 * Likes dels puzles i xat de les lligues.
 * Igual que les lligues, només el servidor hi escriu (rutes de `pb_hooks/jocmot.pb.js`):
 * les regles de creació i edició són buides (només superusuaris).
 */
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users');
    const leagues = app.findCollectionByNameOrId('leagues');

    // ── likes: a qui li ha agradat cada puzle (joc + número, del grup o del repositori) ──
    const likes = new Collection({
      type: 'base',
      name: 'likes',
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
        { name: 'created', type: 'autodate', onCreate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_likes_unique ON likes (user, game, puzzle)',
        'CREATE INDEX idx_likes_puzzle ON likes (game, puzzle)',
      ],
      listRule: 'user = @request.auth.id',
      viewRule: 'user = @request.auth.id',
    });
    app.save(likes);

    // ── league_messages: xat de cada lliga ──
    const messages = new Collection({
      type: 'base',
      name: 'league_messages',
      fields: [
        {
          name: 'league',
          type: 'relation',
          required: true,
          maxSelect: 1,
          collectionId: leagues.id,
          cascadeDelete: true,
        },
        {
          name: 'user',
          type: 'relation',
          required: true,
          maxSelect: 1,
          collectionId: users.id,
          cascadeDelete: true,
        },
        { name: 'text', type: 'text', required: true, min: 1, max: 300 },
        { name: 'created', type: 'autodate', onCreate: true },
      ],
      indexes: ['CREATE INDEX idx_league_messages_league ON league_messages (league, created)'],
    });
    app.save(messages);
  },
  (app) => {
    for (const name of ['league_messages', 'likes']) app.delete(app.findCollectionByNameOrId(name));
  },
);
