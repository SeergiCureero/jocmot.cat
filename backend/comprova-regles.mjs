// Comprova les regles d'API de PocketBase (seguretat) contra un servidor LOCAL i BUIT.
// Ús: crear un superusuari admin@test.local / adminadmin123 i executar `node backend/comprova-regles.mjs`.
// ⚠️ Crea usuaris i puzles de prova: no l'executeu mai contra el servidor de producció.
const B = process.env.PB_URL ?? 'http://127.0.0.1:8090/api';
let fails = 0;
async function req(path, { token, ...init } = {}) {
  const res = await fetch(B + path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: token } : {}) },
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}
const expect = (name, cond, extra = '') => {
  console.log(`${cond ? 'OK  ' : 'FAIL'} ${name} ${cond ? '' : extra}`);
  if (!cond) fails++;
};
const post = (path, data, token) => req(path, { method: 'POST', body: JSON.stringify(data), token });
const patch = (path, data, token) => req(path, { method: 'PATCH', body: JSON.stringify(data), token });

const su = (await post('/collections/_superusers/auth-with-password', { identity: 'admin@test.local', password: 'adminadmin123' })).body.token;

async function user(name, editor) {
  const email = `${name}@test.local`;
  const r = await post('/collections/users/records', { email, name, password: 'contrasenya123', passwordConfirm: 'contrasenya123' });
  if (r.status !== 200) throw new Error(JSON.stringify(r.body));
  if (editor) await patch(`/collections/users/records/${r.body.id}`, { editor: true }, su);
  const a = await post('/collections/users/auth-with-password', { identity: email, password: 'contrasenya123' });
  return { id: r.body.id, token: a.body.token };
}

const anna = await user('anna', true);
const biel = await user('biel', true);
const cesc = await user('cesc', true);
const pau = await user('pau', false);

// Registre i rol
let r = await post('/collections/users/records', { email: 'x@test.local', password: 'contrasenya123', passwordConfirm: 'contrasenya123', editor: true });
expect('no es pot registrar ja com a editor', r.status !== 200);
r = await patch(`/collections/users/records/${pau.id}`, { editor: true }, pau.token);
expect('un usuari no es pot fer editor', r.status !== 200);
r = await patch(`/collections/users/records/${pau.id}`, { name: 'pau2' }, pau.token);
expect('un usuari pot canviar el seu nom', r.status === 200, JSON.stringify(r.body));

// Puzles
const data = { groups: [] };
r = await post('/collections/puzzles/records', { game: 'connexions', data, author: pau.id, status: 'proposed' }, pau.token);
expect('no editor no pot proposar', r.status !== 200);
r = await post('/collections/puzzles/records', { game: 'connexions', data, author: biel.id, status: 'proposed' }, anna.token);
expect('no es pot proposar en nom d’un altre', r.status !== 200);
r = await post('/collections/puzzles/records', { game: 'connexions', data, author: anna.id, status: 'published', number: 1 }, anna.token);
expect('no es pot crear ja publicat', r.status !== 200);
r = await post('/collections/puzzles/records', { game: 'connexions', data, author: anna.id, status: 'proposed' }, anna.token);
expect('editor pot proposar', r.status === 200, JSON.stringify(r.body));
const pz = r.body.id;

r = await req('/collections/puzzles/records');
expect('el públic no veu propostes', r.body.items?.length === 0, JSON.stringify(r.body));
r = await req('/collections/puzzles/records', { token: biel.token });
expect('un editor veu les propostes', r.body.items?.length === 1);

// Revisions
r = await post('/collections/reviews/records', { puzzle: pz, author: anna.id, approved: true }, anna.token);
expect('no es pot aprovar el propi puzle', r.status !== 200);
r = await post('/collections/reviews/records', { puzzle: pz, author: anna.id, approved: false, comment: 'nota' }, anna.token);
expect("l'autor pot comentar", r.status === 200, JSON.stringify(r.body));
r = await post('/collections/reviews/records', { puzzle: pz, author: biel.id, approved: true }, biel.token);
expect('un altre editor pot aprovar', r.status === 200, JSON.stringify(r.body));
r = await post('/collections/reviews/records', { puzzle: pz, author: biel.id, approved: true }, biel.token);
expect('no es pot revisar dues vegades', r.status !== 200);
r = await post('/collections/reviews/records', { puzzle: pz, author: pau.id, approved: true }, pau.token);
expect('no editor no pot revisar', r.status !== 200);

// Publicació
r = await patch(`/collections/puzzles/records/${pz}`, { author: cesc.id }, anna.token);
expect("no es pot canviar l'autor", r.status !== 200);
const future = new Date(Date.now() + 86400000).toISOString().replace('T', ' ');
r = await patch(`/collections/puzzles/records/${pz}`, { status: 'published', number: 2, releaseAt: future }, cesc.token);
expect('un editor pot publicar', r.status === 200, JSON.stringify(r.body));
r = await req('/collections/puzzles/records');
expect('el públic no veu un publicat del futur', r.body.items?.length === 0);
r = await patch(`/collections/puzzles/records/${pz}`, { data: { x: 1 } }, anna.token);
expect('un publicat ja no es pot editar', r.status !== 200);

const r2 = await post('/collections/puzzles/records', { game: 'connexions', data, author: biel.id, status: 'proposed' }, biel.token);
r = await patch(`/collections/puzzles/records/${r2.body.id}`, { status: 'published', number: 2, releaseAt: future }, anna.token);
expect('no hi pot haver dos puzles amb el mateix número', r.status !== 200);
const past = new Date(Date.now() - 3600000).toISOString().replace('T', ' ');
r = await patch(`/collections/puzzles/records/${r2.body.id}`, { status: 'published', number: 1, releaseAt: past }, anna.token);
r = await req(`/collections/puzzles/records?filter=${encodeURIComponent('game="connexions" && number=1')}`);
expect('el públic veu el puzle del dia', r.body.items?.length === 1, JSON.stringify(r.body));

// Usuaris visibles entre editors, sense correu
r = await req(`/collections/users/records/${anna.id}`, { token: biel.token });
expect('un editor veu el nom d’un altre', r.status === 200 && r.body.name === 'anna' && !r.body.email, JSON.stringify(r.body));
r = await req(`/collections/users/records/${anna.id}`, { token: pau.token });
expect('un no editor no veu altres usuaris', r.status !== 200);

// Progrés
r = await post('/collections/progress/records', { user: pau.id, game: 'paraula', puzzle: 1, status: 'won', state: {} }, pau.token);
expect('desa progrés propi', r.status === 200 && r.body.updated, JSON.stringify(r.body));
r = await post('/collections/progress/records', { user: anna.id, game: 'paraula', puzzle: 1, status: 'won', state: {} }, pau.token);
expect('no desa progrés d’un altre', r.status !== 200);

console.log(fails ? `${fails} FALLADES` : 'Tot correcte');
