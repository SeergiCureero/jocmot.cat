/// <reference path="../pb_data/types.d.ts" />

/**
 * Editor obert: qualsevol persona amb compte pot dissenyar i proposar puzles.
 * Només els editors (camp `editor` de `users`) els revisen, els aproven i els programen.
 * - Cada autor veu i edita les seves propostes (mentre no estiguin programades) i els
 *   comentaris que hi han fet els editors, i hi pot respondre (sense aprovar-les).
 * - Els editors continuen veient-ho tot.
 * - Els noms dels editors són visibles per a tothom (signen les revisions). El correu no.
 * - Si l'autor esborra el compte, els seus puzles publicats es queden (sense autor).
 */
const OLD = {
  users: { listRule: 'id = @request.auth.id || @request.auth.editor = true' },
  puzzles: {
    listRule: '(status = "published" && releaseAt <= @now) || @request.auth.editor = true',
    createRule:
      '@request.auth.editor = true && @request.body.author = @request.auth.id && @request.body.status = "proposed"',
    updateRule:
      '@request.auth.editor = true && status = "proposed" && (@request.body.author:isset = false || @request.body.author = author)',
    deleteRule: '@request.auth.editor = true && author = @request.auth.id && status = "proposed"',
  },
  reviews: {
    listRule: '@request.auth.editor = true',
    createRule:
      '@request.auth.editor = true && @request.body.author = @request.auth.id && (@request.body.approved != true || @request.body.puzzle.author != @request.auth.id)',
  },
};

const editor = '@request.auth.editor = true';
// L'autor només pot tocar el contingut: ni l'estat, ni el dia, ni l'autor.
const authorEdit =
  'author = @request.auth.id && status = "proposed" && @request.body.status:isset = false && ' +
  '@request.body.number:isset = false && @request.body.releaseAt:isset = false && @request.body.author:isset = false';

const NEW = {
  users: {
    listRule: `id = @request.auth.id || ${editor} || (@request.auth.id != "" && editor = true)`,
  },
  puzzles: {
    listRule: `(status = "published" && releaseAt <= @now) || ${editor} || author = @request.auth.id`,
    createRule:
      '@request.auth.id != "" && @request.body.author = @request.auth.id && @request.body.status = "proposed" && ' +
      '@request.body.number:isset = false && @request.body.releaseAt:isset = false',
    updateRule: `(${editor} && status = "proposed" && (@request.body.author:isset = false || @request.body.author = author)) || (${authorEdit})`,
    deleteRule: 'author = @request.auth.id && status = "proposed"',
  },
  reviews: {
    listRule: `${editor} || puzzle.author = @request.auth.id`,
    createRule:
      `(${editor} || @request.body.puzzle.author = @request.auth.id) && @request.body.author = @request.auth.id && ` +
      '(@request.body.approved != true || @request.body.puzzle.author != @request.auth.id)',
  },
};

function apply(app, rules) {
  for (const [name, r] of Object.entries(rules)) {
    const c = app.findCollectionByNameOrId(name);
    for (const [key, value] of Object.entries(r)) {
      c[key] = value;
      if (key === 'listRule') c.viewRule = value;
    }
    app.save(c);
  }
}

// Qualsevol persona pot esborrar el compte: els seus puzles publicats es queden sense autor.
function authorRequired(app, required) {
  const puzzles = app.findCollectionByNameOrId('puzzles');
  puzzles.fields.getByName('author').required = required;
  app.save(puzzles);
}

migrate(
  (app) => {
    apply(app, NEW);
    authorRequired(app, false);
  },
  (app) => {
    authorRequired(app, true);
    apply(app, OLD);
  },
);
