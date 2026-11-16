/// <reference path="../pb_data/types.d.ts" />

/**
 * Valoracions dels puzles que encara no han sortit (vista /editor/proxims): cada editor diu si un puzle
 * «mola» o «cal canviar-lo», amb una nota. Només el servidor hi escriu (rutes de `pb_hooks/jocmot.pb.js`).
 */
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users');
    app.save(
      new Collection({
        type: 'base',
        name: 'upcoming_feedback',
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
          { name: 'number', type: 'number', required: true, onlyInt: true },
          {
            name: 'verdict',
            type: 'select',
            required: true,
            maxSelect: 1,
            values: ['ok', 'change'],
          },
          { name: 'note', type: 'text', max: 500 },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE UNIQUE INDEX idx_upcoming_feedback ON upcoming_feedback (user, game, number)',
          'CREATE INDEX idx_upcoming_feedback_puzzle ON upcoming_feedback (game, number)',
        ],
      }),
    );
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('upcoming_feedback'));
  },
);
