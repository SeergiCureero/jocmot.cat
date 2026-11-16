/// <reference path="../pb_data/types.d.ts" />

/**
 * Puzles rebutjats: un editor pot rebutjar una proposta (en lloc de només aprovar-la). El puzle
 * surt de «Pendents de revisió», l'autor el veu amb el motiu als comentaris, el pot corregir
 * (mentre és rebutjat edita i esborra igual que una proposta) i tornar-lo a proposar.
 * Passar de «proposed» a «rejected» i tornar enrere ho fan les rutes de `pb_hooks/jocmot.pb.js`.
 */
const editor = '@request.auth.editor = true';
const authorEdit = (status) =>
  `author = @request.auth.id && ${status} && @request.body.status:isset = false && ` +
  '@request.body.number:isset = false && @request.body.releaseAt:isset = false && @request.body.author:isset = false';

const OPEN = 'status = "proposed"';
const OPEN_OR_REJECTED = '(status = "proposed" || status = "rejected")';

const rules = (status) => ({
  updateRule: `(${editor} && status = "proposed" && (@request.body.author:isset = false || @request.body.author = author)) || (${authorEdit(status)})`,
  deleteRule: `author = @request.auth.id && ${status}`,
});

function apply(app, values, status) {
  const puzzles = app.findCollectionByNameOrId('puzzles');
  puzzles.fields.getByName('status').values = values;
  Object.assign(puzzles, rules(status));
  app.save(puzzles);
}

migrate(
  (app) => apply(app, ['proposed', 'published', 'rejected'], OPEN_OR_REJECTED),
  (app) => {
    // Els rebutjats tornen a ser propostes abans de treure el valor del camp.
    for (const p of app.findRecordsByFilter('puzzles', 'status = "rejected"', '', 0, 0)) {
      p.set('status', 'proposed');
      app.saveNoValidate(p);
    }
    apply(app, ['proposed', 'published'], OPEN);
  },
);
