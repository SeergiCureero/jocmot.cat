/// <reference path="../pb_data/types.d.ts" />

/** Bonus extra de cada puntuació: Empenta de bentornats i Embranzida de remuntada. */
migrate(
  (app) => {
    const scores = app.findCollectionByNameOrId('scores');
    scores.fields.add(new NumberField({ name: 'empenta', onlyInt: true }));
    scores.fields.add(new NumberField({ name: 'embranzida', onlyInt: true }));
    app.save(scores);
  },
  (app) => {
    const scores = app.findCollectionByNameOrId('scores');
    scores.fields.removeByName('empenta');
    scores.fields.removeByName('embranzida');
    app.save(scores);
  },
);
