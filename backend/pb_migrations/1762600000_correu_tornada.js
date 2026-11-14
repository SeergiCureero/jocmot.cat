/// <reference path="../pb_data/types.d.ts" />

/**
 * Correu per tornar a jugar: un de sol quan fa 5 dies que no jugues.
 * - `noReturnEmail`: la persona no en vol rebre (el posa ella al perfil o amb l'enllaç de baixa del correu).
 * - `unsubToken`, `nudgedFor`, `lastNudge`: només del servidor (ocults a l'API, i ningú no els pot escriure).
 */
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users');
    users.fields.add(new BoolField({ name: 'noReturnEmail' }));
    users.fields.add(new TextField({ name: 'unsubToken', hidden: true }));
    // Últim dia d'activitat pel qual ja s'ha avisat, i quan es va enviar l'últim correu.
    users.fields.add(new TextField({ name: 'nudgedFor', hidden: true }));
    users.fields.add(new TextField({ name: 'lastNudge', hidden: true }));
    users.updateRule =
      'id = @request.auth.id && @request.body.editor:isset = false && ' +
      '@request.body.unsubToken:isset = false && @request.body.nudgedFor:isset = false && ' +
      '@request.body.lastNudge:isset = false';
    users.createRule =
      '@request.body.editor:isset = false && @request.body.unsubToken:isset = false && ' +
      '@request.body.nudgedFor:isset = false && @request.body.lastNudge:isset = false';
    app.save(users);
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users');
    for (const name of ['noReturnEmail', 'unsubToken', 'nudgedFor', 'lastNudge'])
      users.fields.removeByName(name);
    users.updateRule = 'id = @request.auth.id && @request.body.editor:isset = false';
    users.createRule = '@request.body.editor:isset = false';
    app.save(users);
  },
);
