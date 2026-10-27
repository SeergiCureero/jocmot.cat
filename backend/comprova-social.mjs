// Comprova punts, amistats i lligues (pb_hooks/jocmot.pb.js) contra un servidor LOCAL i BUIT.
// Ús: crear un superusuari admin@test.local / adminadmin123 i executar `node backend/comprova-social.mjs`.
// ⚠️ Crea usuaris, partides i lligues de prova: no l'executeu mai contra el servidor de producció.
import { createRequire } from 'node:module';

const lib = createRequire(import.meta.url)('./pb_hooks/jocmot.js');
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
  console.log(`${cond ? 'OK  ' : 'FAIL'} ${name} ${cond ? '' : JSON.stringify(extra)}`);
  if (!cond) fails++;
};
const get = (path, token) => req(path, { token });
const post = (path, data, token) =>
  req(path, { method: 'POST', body: JSON.stringify(data), token });
const del = (path, token) => req(path, { method: 'DELETE', token });

async function user(name) {
  const email = `${name}@test.local`;
  const r = await post('/collections/users/records', {
    email,
    name,
    password: 'contrasenya123',
    passwordConfirm: 'contrasenya123',
  });
  if (r.status !== 200) throw new Error(JSON.stringify(r.body));
  const a = await post('/collections/users/auth-with-password', {
    identity: email,
    password: 'contrasenya123',
  });
  return { id: r.body.id, name, token: a.body.token };
}

const finish = (u, game, puzzle, status, state) =>
  post('/collections/progress/records', { user: u.id, game, puzzle, status, state }, u.token);

const today = lib.puzzleNumberForDate(lib.madridDate(Date.now()));
const anna = await user('anna');
const biel = await user('Biel');
const cesc = await user('cesc');

// ── Punts ──
await finish(anna, 'paraula', today, 'won', { guesses: ['a', 'b', 'c'], status: 'won' });
let r = await get(`/jocmot/puntuacio/paraula/${today}`, anna.token);
expect(
  'Paraula del dia en 3 intents = 10 punts',
  r.body.points === 10 && r.body.daily === true,
  r.body,
);

await finish(anna, 'mini', today, 'playing', { elapsedSeconds: 10 });
r = await get(`/jocmot/puntuacio/mini/${today}`, anna.token);
expect('una partida a mitges no puntua', r.status === 404, r);

r = await get(
  '/collections/progress/records?filter=' + encodeURIComponent(`game="mini"`),
  anna.token,
);
await req(`/collections/progress/records/${r.body.items[0].id}`, {
  method: 'PATCH',
  token: anna.token,
  body: JSON.stringify({ status: 'won', state: { elapsedSeconds: 50, status: 'won' } }),
});
r = await get(`/jocmot/puntuacio/mini/${today}`, anna.token);
expect('en acabar-la (PATCH) sí que puntua: Mini en 50 s = 15', r.body.points === 15, r.body);

await finish(biel, 'connexions', today, 'won', { mistakes: 1, status: 'won' });
r = await get(`/jocmot/puntuacio/connexions/${today}`, biel.token);
expect('Connexions amb 1 error = 12', r.body.points === 12, r.body);

if (today > 1) {
  await finish(biel, 'paraula', today - 1, 'won', { guesses: ['a'], status: 'won' });
  r = await get(`/jocmot/puntuacio/paraula/${today - 1}`, biel.token);
  expect('arxiu: la meitat (15 → 7) i sense bonus', r.body.points === 7 && !r.body.daily, r.body);
}
await finish(cesc, 'paraula', today + 1, 'won', { guesses: ['a'], status: 'won' });
r = await get(`/jocmot/puntuacio/paraula/${today + 1}`, cesc.token);
expect('un puzle del futur no puntua', r.status === 404, r);

r = await post(
  '/collections/scores/records',
  { user: cesc.id, game: 'fils', puzzle: today, day: 'x', month: 'x', points: 999 },
  cesc.token,
);
expect('ningú es pot crear punts a mà', r.status !== 200, r);
r = await get(`/jocmot/puntuacio/paraula/${today}`, biel.token);
expect('no es veuen els punts d’un altre amb la ruta (només els propis)', r.status === 404, r);

r = await get('/jocmot/perfil', anna.token);
expect(
  'perfil: total, mes, ratxa i rang',
  r.body.total === 25 &&
    r.body.monthPoints === 25 &&
    r.body.streak === 1 &&
    r.body.rank.name === 'Aprenent' &&
    r.body.playedToday,
  r.body,
);
r = await get('/jocmot/perfil');
expect('perfil sense sessió: 401', r.status === 401, r);

// ── Amistats ──
r = await post('/jocmot/amics', { username: 'BIEL ' }, anna.token);
expect('sol·licitud per nom (sense distingir majúscules)', r.body.status === 'pending', r.body);
r = await post('/jocmot/amics', { username: 'biel' }, anna.token);
expect('no es pot repetir', r.status === 400, r);
r = await post('/jocmot/amics', { username: 'anna' }, anna.token);
expect('no et pots afegir a tu mateix', r.status === 400, r);
r = await post('/jocmot/amics', { username: 'ningu' }, anna.token);
expect('usuari inexistent: 404', r.status === 404, r);

r = await get('/jocmot/amics', biel.token);
expect(
  'en Biel té una sol·licitud entrant',
  r.body.incoming.length === 1 && r.body.incoming[0].user.name === 'anna',
  r.body,
);
const requestId = r.body.incoming[0].id;
r = await post(`/jocmot/amics/${requestId}/accepta`, {}, cesc.token);
expect('un tercer no la pot acceptar', r.status === 404, r);
r = await post(`/jocmot/amics/${requestId}/accepta`, {}, biel.token);
expect('en Biel l’accepta', r.body.status === 'accepted', r.body);

r = await get('/jocmot/amics', anna.token);
const names = r.body.ranking.map((x) => `${x.user.name}:${x.monthPoints}:${x.position}`);
expect(
  'rànquing d’amics amb tu inclòs, ordenat',
  names.join() === `anna:25:1,Biel:${today > 1 ? 19 : 12}:2`,
  names,
);
expect('el rànquing no exposa correus', !JSON.stringify(r.body).includes('@'), r.body);

await post('/jocmot/amics', { username: 'cesc' }, biel.token);
r = await post('/jocmot/amics', { username: 'Biel' }, cesc.token);
expect('si l’altre ja te l’havia enviada, s’accepta sola', r.body.status === 'accepted', r.body);
r = await del(`/jocmot/amics/usuari/${biel.id}`, cesc.token);
expect('deixar de ser amics', r.status === 204, r);
r = await get('/jocmot/amics', cesc.token);
expect('… i ja no surt al rànquing', r.body.ranking.length === 1, r.body);

// ── Cerca d'usuaris ──
r = await get('/jocmot/usuaris?q=bi', anna.token);
expect(
  'la cerca troba en Biel i diu que ja sou amics',
  r.body.users?.[0]?.name === 'Biel' && r.body.users[0].relation === 'friend',
  r.body,
);
r = await get('/jocmot/usuaris?q=e', anna.token);
expect('cal escriure com a mínim 2 lletres', r.body.users?.length === 0, r.body);
r = await get('/jocmot/usuaris?q=ann', anna.token);
expect('no et trobes a tu mateix', r.body.users?.length === 0, r.body);
r = await get('/jocmot/usuaris?q=%25%25', anna.token);
expect('els comodins de SQL no ho troben tot', r.body.users?.length === 0, r.body);
expect('la cerca no exposa correus', !JSON.stringify(r.body).includes('@'), r.body);
r = await get('/jocmot/usuaris?q=bi');
expect('cal sessió per cercar', r.status === 401, r);

// ── Lligues ──
r = await post('/jocmot/lligues', { name: '  Els de la colla  ' }, anna.token);
expect('crear una lliga dona un codi', /^[A-Z2-9]{6}$/.test(r.body.code), r.body);
const league = r.body;
r = await post('/jocmot/lligues', { name: '' }, anna.token);
expect('cal un nom', r.status === 400, r);

r = await get(`/jocmot/lligues/${league.id}`, biel.token);
expect('qui no hi és no la veu', r.status === 404, r);
r = await post('/jocmot/lligues/unir', { code: league.code.toLowerCase() }, biel.token);
expect('unir-s’hi amb el codi (minúscules també)', r.body.id === league.id, r.body);
r = await post('/jocmot/lligues/unir', { code: 'ZZZZZZ' }, cesc.token);
expect('codi incorrecte: 404', r.status === 404, r);
await post('/jocmot/lligues/unir', { code: league.code }, cesc.token);

r = await get(`/jocmot/lligues/${league.id}`, biel.token);
expect(
  'classificació del mes',
  r.body.name === 'Els de la colla' &&
    r.body.ranking.length === 3 &&
    r.body.ranking[0].user.name === 'anna' &&
    !r.body.finished &&
    !r.body.isOwner,
  r.body,
);
expect('la classificació no exposa correus', !JSON.stringify(r.body).includes('@'), r.body);
r = await get(`/jocmot/lligues/${league.id}?mes=1999-01`, biel.token);
expect('un mes fora de rang torna el mes actual', r.body.month === r.body.months[0], r.body);

r = await get('/jocmot/lligues', cesc.token);
expect(
  'llista de les meves lligues',
  r.body.leagues.length === 1 &&
    r.body.leagues[0].members === 3 &&
    r.body.leagues[0].leader?.name === 'anna',
  r.body,
);

r = await del(`/jocmot/lligues/${league.id}/membre`, anna.token);
expect('la creadora en surt', r.status === 204, r);
r = await get(`/jocmot/lligues/${league.id}`, biel.token);
expect(
  '… i en Biel passa a ser-ne el creador',
  r.body.isOwner === true && r.body.ranking.length === 2,
  r.body,
);
await del(`/jocmot/lligues/${league.id}/membre`, biel.token);
await del(`/jocmot/lligues/${league.id}/membre`, cesc.token);
r = await post('/jocmot/lligues/unir', { code: league.code }, anna.token);
expect('una lliga buida s’esborra', r.status === 404, r);

// ── Noms d'usuari ──
r = await post('/collections/users/records', {
  email: 'altra@test.local',
  name: 'ANNA',
  password: 'contrasenya123',
  passwordConfirm: 'contrasenya123',
});
expect('no es pot repetir un nom (sense distingir majúscules)', r.status === 400, r);
r = await post('/collections/users/records', {
  email: 'sense@test.local',
  password: 'contrasenya123',
  passwordConfirm: 'contrasenya123',
});
expect('el nom és obligatori', r.status === 400, r);
r = await req(`/collections/users/records/${cesc.id}`, {
  method: 'PATCH',
  token: cesc.token,
  body: JSON.stringify({ name: 'biel' }),
});
expect('no es pot canviar el nom pel d’un altre', r.status === 400, r);

// ── Recalcular (administració) ──
r = await post('/jocmot/admin/recalcula', {}, anna.token);
expect('recalcular és només per a superusuaris', r.status === 401 || r.status === 403, r);

console.log(fails ? `\n${fails} comprovacions han fallat` : '\nTot correcte');
process.exit(fails ? 1 : 0);
