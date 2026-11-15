/**
 * Fondària al servidor: les preguntes del dia, la validació de les respostes i els punts, que
 * s'ajusten amb el que diu la comunitat. Les llistes de respostes són a `fondaria_categories.json`
 * (és el mateix fitxer que fa servir la web: `src/games/fondaria/data/categories.json`).
 * Les preguntes del dia i els punts han de coincidir amb `src/games/fondaria/logic.ts` (hi ha un test).
 */
const lib = require(`${__hooks}/jocmot.js`);

const ROUNDS = 7;

let loaded = null;
/** Les categories (es llegeixen la primera vegada que cal: així el mòdul es pot carregar als tests). */
function bank() {
  if (!loaded) {
    const list = JSON.parse(toString($os.readFile(`${__hooks}/fondaria_categories.json`)));
    const byId = {};
    for (const c of list) byId[c.id] = c;
    loaded = { list, byId };
  }
  return loaded;
}

/** Igual que `normalizeWord` de la web (src/lib/text.ts). */
function normalize(input) {
  return String(input)
    .trim()
    .toUpperCase()
    .replace(/Ç/g, '\u0000')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\u0000/g, 'Ç')
    .replace(/[·.\-\s']/g, '');
}

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Les categories del dia (mateix algorisme que la web). */
function scheduleFor(puzzleNumber, categories) {
  const list = categories || bank().list;
  const r = rng(puzzleNumber * 7919 + 13);
  const left = list.slice();
  const take = (pool) => {
    const c = pool[Math.floor(r() * pool.length)];
    left.splice(left.indexOf(c), 1);
    return c;
  };
  const easy = () => left.filter((c) => !c.hard);
  const hard = () => left.filter((c) => c.hard);
  return [
    take(easy()),
    take(easy()),
    take(easy()),
    take(easy()),
    take(left),
    take(left),
    take(hard().length ? hard() : left),
  ];
}

function seedPoints(rank, size) {
  const last = Math.max(1, size - 1);
  return Math.max(10, Math.min(100, Math.round(10 + 90 * Math.pow(rank / last, 0.85))));
}

function blendPoints(seed, count, total) {
  if (total < 5) return seed;
  const share = Math.min(1, count / total / 0.25);
  const community = 100 - 90 * share;
  const weight = Math.min(1, total / 60);
  return Math.max(10, Math.min(100, Math.round((1 - weight) * seed + weight * community)));
}

/** Posició de cada resposta (normalitzada) d'una categoria. */
const rankCache = {};
function ranksOf(category) {
  if (!rankCache[category.id]) {
    const m = {};
    category.answers.forEach((a, i) => {
      const k = normalize(a);
      if (!(k in m)) m[k] = i;
    });
    rankCache[category.id] = m;
  }
  return rankCache[category.id];
}

const first = (app, collection, filter, params) => {
  try {
    return app.findFirstRecordByFilter(collection, filter, params);
  } catch {
    return null;
  }
};

/** Respostes ja apuntades d'aquest usuari en aquest puzle, per ordre de ronda. */
function picksFor(app, userId, puzzle) {
  return app
    .findRecordsByFilter('fondaria_picks', 'user = {:u} && puzzle = {:p}', 'round', 0, 0, {
      u: userId,
      p: puzzle,
    })
    .map((r) => ({ word: r.getString('word'), points: r.getInt('points') }));
}

function checkTurn(app, userId, puzzle, round) {
  const n = Number(puzzle);
  const r = Number(round);
  const todayNumber = lib.puzzleNumberForDate(lib.madridDate(Date.now()));
  if (!Number.isInteger(n) || n < 1 || n > todayNumber)
    throw new BadRequestError('Puzle no vàlid.');
  if (!Number.isInteger(r) || r < 0 || r >= ROUNDS)
    throw new BadRequestError('Pregunta no vàlida.');
  const done = picksFor(app, userId, n);
  if (r !== done.length) throw new BadRequestError('Aquesta pregunta ja no es pot respondre.');
  return { puzzle: n, round: r, done };
}

function savePick(app, userId, puzzle, round, category, word, points) {
  const rec = new Record(app.findCollectionByNameOrId('fondaria_picks'));
  rec.set('user', userId);
  rec.set('puzzle', puzzle);
  rec.set('round', round);
  rec.set('category', category);
  rec.set('word', word);
  rec.set('points', points);
  app.save(rec);
}

/**
 * Respon la pregunta `round` del puzle. Si la resposta és de la llista (o una de les aprovades pels
 * editors), apunta el punt i diu quants punts val segons el que ha dit la comunitat. Si no la
 * coneixem, la desa perquè la revisin els editors i no compta.
 */
function answer(app, userId, body) {
  const { puzzle, round, done } = checkTurn(app, userId, body.puzzle, body.round);
  const category = scheduleFor(puzzle)[round];
  const raw = String(body.word || '')
    .trim()
    .slice(0, 60);
  const word = normalize(raw);
  if (!word) throw new BadRequestError('Escriu una resposta.');
  if (done.some((d) => d.word === word)) throw new BadRequestError('Aquesta ja l’has dit.');

  const ranks = ranksOf(category);
  const extra = first(
    app,
    'fondaria_suggestions',
    'category = {:c} && key = {:k} && status = "approved"',
    {
      c: category.id,
      k: word,
    },
  );
  if (!(word in ranks) && !extra) {
    // No la tenim: la guardem perquè els editors decideixin.
    const s = first(app, 'fondaria_suggestions', 'category = {:c} && key = {:k}', {
      c: category.id,
      k: word,
    });
    if (!s) {
      const rec = new Record(app.findCollectionByNameOrId('fondaria_suggestions'));
      rec.set('category', category.id);
      rec.set('key', word);
      rec.set('text', raw);
      rec.set('count', 1);
      rec.set('status', 'pending');
      app.save(rec);
    } else if (s.getString('status') === 'pending') {
      s.set('count', s.getInt('count') + 1);
      app.save(s);
    }
    return { known: false };
  }

  // Comptador de la comunitat per categoria i resposta.
  let stat = first(app, 'fondaria_stats', 'category = {:c} && key = {:k}', {
    c: category.id,
    k: word,
  });
  if (!stat) {
    stat = new Record(app.findCollectionByNameOrId('fondaria_stats'));
    stat.set('category', category.id);
    stat.set('key', word);
    stat.set('count', 0);
  }
  stat.set('count', stat.getInt('count') + 1);
  app.save(stat);
  const total = app
    .findRecordsByFilter('fondaria_stats', 'category = {:c}', '', 0, 0, { c: category.id })
    .reduce((t, r) => t + r.getInt('count'), 0);
  const seed = word in ranks ? seedPoints(ranks[word], category.answers.length) : 60;
  const points = blendPoints(seed, stat.getInt('count'), total);
  savePick(app, userId, puzzle, round, category.id, word, points);
  return { known: true, points, count: stat.getInt('count'), total };
}

/** Passa la pregunta (s'ha acabat el temps): compta zero. */
function skip(app, userId, body) {
  const { puzzle, round } = checkTurn(app, userId, body.puzzle, body.round);
  savePick(app, userId, puzzle, round, scheduleFor(puzzle)[round].id, '', 0);
  return { skipped: true };
}

/** Respostes noves pendents de revisar, de més a menys dites. */
function pendingSuggestions(app) {
  return app
    .findRecordsByFilter('fondaria_suggestions', 'status = "pending"', '-count', 100, 0)
    .map((r) => ({
      id: r.id,
      category: r.getString('category'),
      categoryName: bank().byId[r.getString('category')]
        ? bank().byId[r.getString('category')].prompt
        : r.getString('category'),
      text: r.getString('text'),
      count: r.getInt('count'),
    }));
}

function decideSuggestion(app, id, action) {
  if (action !== 'approve' && action !== 'reject') throw new BadRequestError('Acció no vàlida.');
  const r = app.findRecordById('fondaria_suggestions', id);
  r.set('status', action === 'approve' ? 'approved' : 'rejected');
  app.save(r);
}

module.exports = {
  bank,
  normalize,
  scheduleFor,
  seedPoints,
  blendPoints,
  picksFor,
  answer,
  skip,
  pendingSuggestions,
  decideSuggestion,
};
