/// <reference path="../pb_data/types.d.ts" />

/**
 * Lliga mundial: classificació pública de tots els jugadors que hi participen.
 * És opt-in: `worldLeague` buit = encara no ha triat (se li pregunta amb un avís),
 * `yes` = hi surt amb el seu nom d'usuari, `no` = no hi surt.
 */
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users');
    users.fields.add(new SelectField({ name: 'worldLeague', maxSelect: 1, values: ['yes', 'no'] }));
    app.save(users);
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users');
    users.fields.removeByName('worldLeague');
    app.save(users);
  },
);
