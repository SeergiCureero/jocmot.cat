/// <reference path="../pb_data/types.d.ts" />

/**
 * Puzles del grup: nom per identificar-los, dia preferit en proposar-los i
 * `contentUpdated` (última modificació del contingut). Les aprovacions es comparen amb
 * aquest camp: canviar el nom o el dia preferit no obliga a tornar a aprovar.
 */
migrate(
  (app) => {
    const puzzles = app.findCollectionByNameOrId('puzzles');
    puzzles.fields.add(new TextField({ name: 'title', max: 80 }));
    puzzles.fields.add(new NumberField({ name: 'wantedNumber', onlyInt: true, min: 0 }));
    puzzles.fields.add(new DateField({ name: 'contentUpdated' }));
    app.save(puzzles);

    // Fins ara, l'última modificació del contingut era `updated`.
    for (const p of app.findAllRecords('puzzles')) {
      p.set('contentUpdated', p.getDateTime('updated'));
      app.saveNoValidate(p);
    }
  },
  (app) => {
    const puzzles = app.findCollectionByNameOrId('puzzles');
    for (const name of ['title', 'wantedNumber', 'contentUpdated'])
      puzzles.fields.removeByName(name);
    app.save(puzzles);
  },
);
