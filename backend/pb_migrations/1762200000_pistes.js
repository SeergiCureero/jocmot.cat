/// <reference path="../pb_data/types.d.ts" />

/**
 * Pistes mirades a /pistes abans d'acabar un puzle (resten punts en acabar-lo).
 * Només el servidor hi escriu (rutes de `pb_hooks/jocmot.pb.js`).
 */
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users');
    const hints = new Collection({
      type: 'base',
      name: 'hint_uses',
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
        // Pistes destapades (sense comptar la solució) i si s'ha vist la solució.
        { name: 'count', type: 'number', onlyInt: true, min: 0 },
        { name: 'solution', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_hint_uses_unique ON hint_uses (user, game, puzzle)'],
      listRule: 'user = @request.auth.id',
      viewRule: 'user = @request.auth.id',
    });
    app.save(hints);
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('hint_uses'));
  },
);
