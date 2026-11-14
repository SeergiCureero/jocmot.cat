/// <reference path="../pb_data/types.d.ts" />

/**
 * Votació del joc preferit: un sol vot per persona (es pot canviar).
 * Només el servidor hi escriu (rutes /api/jocmot/vots de `pb_hooks/jocmot.pb.js`).
 */
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users');
    const votes = new Collection({
      type: 'base',
      name: 'game_votes',
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
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_game_votes_user ON game_votes (user)'],
    });
    app.save(votes);
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('game_votes'));
  },
);
