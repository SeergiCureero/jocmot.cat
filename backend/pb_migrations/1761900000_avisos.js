/// <reference path="../pb_data/types.d.ts" />

/**
 * Avís diari: subscripcions Web Push de cada navegador.
 * Només el servidor hi llegeix i hi escriu (rutes /api/jocmot/avisos de `pb_hooks/jocmot.pb.js`).
 */
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users');
    const subs = new Collection({
      type: 'base',
      name: 'push_subscriptions',
      fields: [
        {
          name: 'user',
          type: 'relation',
          required: true,
          maxSelect: 1,
          collectionId: users.id,
          cascadeDelete: true,
        },
        // Adreça del servei de push del navegador (Google, Mozilla, Apple o Microsoft).
        { name: 'endpoint', type: 'text', required: true, max: 1000 },
        // Claus per xifrar el contingut. Ara no es fan servir (els avisos van sense contingut).
        { name: 'p256dh', type: 'text', max: 200 },
        { name: 'auth', type: 'text', max: 100 },
        // Hora de Madrid (0-23) a què vol l'avís.
        { name: 'hour', type: 'number', onlyInt: true, min: 0, max: 23 },
        // Últim dia (AAAA-MM-DD, Madrid) en què s'ha avisat.
        { name: 'lastSent', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_push_endpoint ON push_subscriptions (endpoint)',
        'CREATE INDEX idx_push_hour ON push_subscriptions (hour, lastSent)',
        'CREATE INDEX idx_push_user ON push_subscriptions (user)',
      ],
    });
    app.save(subs);
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('push_subscriptions'));
  },
);
