/// <reference path="../pb_data/types.d.ts" />

/**
 * Fondària: respostes de cada jugador (els punts els calcula el servidor), comptadors de la
 * comunitat per categoria i resposta, i respostes noves proposades pels jugadors que revisen els editors.
 * Només el servidor hi escriu (rutes /api/jocmot/fondaria de `pb_hooks/jocmot.pb.js`).
 */
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users');

    app.save(
      new Collection({
        type: 'base',
        name: 'fondaria_picks',
        fields: [
          {
            name: 'user',
            type: 'relation',
            required: true,
            maxSelect: 1,
            collectionId: users.id,
            cascadeDelete: true,
          },
          { name: 'puzzle', type: 'number', required: true, onlyInt: true },
          { name: 'round', type: 'number', onlyInt: true },
          { name: 'category', type: 'text' },
          { name: 'word', type: 'text' },
          { name: 'points', type: 'number', onlyInt: true },
          { name: 'created', type: 'autodate', onCreate: true },
        ],
        indexes: ['CREATE UNIQUE INDEX idx_fondaria_picks ON fondaria_picks (user, puzzle, round)'],
      }),
    );

    app.save(
      new Collection({
        type: 'base',
        name: 'fondaria_stats',
        fields: [
          { name: 'category', type: 'text', required: true },
          { name: 'key', type: 'text', required: true },
          { name: 'count', type: 'number', onlyInt: true },
        ],
        indexes: ['CREATE UNIQUE INDEX idx_fondaria_stats ON fondaria_stats (category, key)'],
      }),
    );

    app.save(
      new Collection({
        type: 'base',
        name: 'fondaria_suggestions',
        fields: [
          { name: 'category', type: 'text', required: true },
          { name: 'key', type: 'text', required: true },
          { name: 'text', type: 'text' },
          { name: 'count', type: 'number', onlyInt: true },
          {
            name: 'status',
            type: 'select',
            required: true,
            maxSelect: 1,
            values: ['pending', 'approved', 'rejected'],
          },
          { name: 'created', type: 'autodate', onCreate: true },
        ],
        indexes: [
          'CREATE UNIQUE INDEX idx_fondaria_suggestions ON fondaria_suggestions (category, key)',
          'CREATE INDEX idx_fondaria_suggestions_status ON fondaria_suggestions (status, count)',
        ],
      }),
    );
  },
  (app) => {
    for (const name of ['fondaria_suggestions', 'fondaria_stats', 'fondaria_picks'])
      app.delete(app.findCollectionByNameOrId(name));
  },
);
