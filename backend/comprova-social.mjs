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

// ── Esborrar el compte ──
const dani = await user('dani');
const eva = await user('eva');
const shared = (await post('/jocmot/lligues', { name: 'De la Dani' }, dani.token)).body;
await post('/jocmot/lligues/unir', { code: shared.code }, eva.token);
const alone = (await post('/jocmot/lligues', { name: 'Només la Dani' }, dani.token)).body;
await post('/jocmot/amics', { username: 'eva' }, dani.token);
await finish(dani, 'paraula', today, 'won', { guesses: ['a'], status: 'won' });
const deleteAccount = (u, password) =>
  req('/jocmot/compte', { method: 'DELETE', token: u.token, body: JSON.stringify({ password }) });

r = await deleteAccount(dani, 'malament');
expect('esborrar el compte demana la contrasenya bona', r.status === 400, r);
r = await deleteAccount(dani, 'contrasenya123');
expect('esborrar el compte', r.status === 204, r);
r = await post('/collections/users/auth-with-password', {
  identity: 'dani@test.local',
  password: 'contrasenya123',
});
expect('… ja no pot entrar', r.status === 400, r);
r = await get(`/jocmot/lligues/${shared.id}`, eva.token);
expect(
  '… la seva lliga passa a l’altre membre',
  r.body.isOwner === true && r.body.ranking.length === 1,
  r.body,
);
r = await post('/jocmot/lligues/unir', { code: alone.code }, eva.token);
expect('… la lliga on era sol s’esborra', r.status === 404, r);
r = await get('/jocmot/amics', eva.token);
expect('… i la sol·licitud d’amistat desapareix', r.body.incoming.length === 0, r.body);

const admin = await post('/collections/_superusers/auth-with-password', {
  identity: 'admin@test.local',
  password: 'adminadmin123',
});
const fran = await user('fran');
await req(`/collections/users/records/${fran.id}`, {
  method: 'PATCH',
  token: admin.body.token,
  body: JSON.stringify({ editor: true }),
});
r = await deleteAccount(fran, 'contrasenya123');
expect('un editor no es pot esborrar sol', r.status === 400, r);

// ── Calendari de puzles (editors) ──
const gina = await user('gina');
for (const u of [gina, cesc])
  await req(`/collections/users/records/${u.id}`, {
    method: 'PATCH',
    token: admin.body.token,
    body: JSON.stringify({ editor: true }),
  });
// Cal tornar a entrar perquè el token reflecteixi el rol d'editor.
for (const u of [gina, cesc])
  u.token = (
    await post('/collections/users/auth-with-password', {
      identity: `${u.name}@test.local`,
      password: 'contrasenya123',
    })
  ).body.token;
const releaseAt = (n) => new Date(lib.madridMidnight(lib.puzzleDate(n))).toISOString();
async function scheduled(number) {
  const p = await post(
    '/collections/puzzles/records',
    { game: 'mini', data: { n: number }, author: gina.id, status: 'proposed' },
    gina.token,
  );
  await req(`/collections/puzzles/records/${p.body.id}`, {
    method: 'PATCH',
    token: cesc.token,
    body: JSON.stringify({ status: 'published', number, releaseAt: releaseAt(number) }),
  });
  return p.body.id;
}
const getPuzzle = async (id) => (await get(`/collections/puzzles/records/${id}`, gina.token)).body;
const moveTo = (id, number, token = gina.token) =>
  post(`/jocmot/puzles/${id}/dia`, { number }, token);

const pa = await scheduled(today + 3);
const pb = await scheduled(today + 6);
const pToday = await scheduled(today);
r = await moveTo(pa, today + 5, anna.token);
expect('només els editors poden canviar el dia', r.status === 403, r);
r = await moveTo(pa, today);
expect('no es pot moure a avui', r.status === 400, r);
r = await moveTo(pToday, today + 9);
expect('el puzle d’avui (ja publicat) no es mou', r.status === 400, r);
r = await moveTo(pa, today + 5);
let a = await getPuzzle(pa);
expect(
  'moure a un dia lliure: número i hora (mitjanit a Madrid)',
  r.status === 204 &&
    a.number === today + 5 &&
    new Date(a.releaseAt.replace(' ', 'T')).toISOString() === releaseAt(today + 5),
  { r, a },
);
r = await moveTo(pa, today + 6);
a = await getPuzzle(pa);
const b = await getPuzzle(pb);
expect(
  'moure a un dia ocupat els intercanvia',
  r.status === 204 &&
    a.number === today + 6 &&
    b.number === today + 5 &&
    new Date(b.releaseAt.replace(' ', 'T')).toISOString() === releaseAt(today + 5),
  { r, a, b },
);

// ── Nom i dia preferit dels puzles ──
const prop = (
  await post(
    '/collections/puzzles/records',
    {
      game: 'fils',
      data: { v: 1 },
      author: gina.id,
      status: 'proposed',
      title: 'Rius',
      wantedNumber: today + 4,
    },
    gina.token,
  )
).body;
expect(
  'proposar amb nom i dia preferit',
  prop.title === 'Rius' && prop.wantedNumber === today + 4 && prop.contentUpdated !== '',
  prop,
);
const info = (id, body, token = cesc.token) => post(`/jocmot/puzles/${id}/info`, body, token);
r = await info(prop.id, { title: '  Rius i muntanyes ' });
let q = await getPuzzle(prop.id);
expect(
  'un altre editor hi posa nom, sense tocar contentUpdated',
  r.status === 204 && q.title === 'Rius i muntanyes' && q.contentUpdated === prop.contentUpdated,
  { r, q },
);
r = await info(prop.id, { title: 'x' }, anna.token);
expect('qui no és editor no pot posar nom al puzle d’un altre', r.status === 403, r);
// Editor obert: qui no és editor també proposa (amb un límit de propostes pendents).
const proposeAs = (u, n) =>
  post(
    '/collections/puzzles/records',
    { game: 'mini', data: { n }, author: u.id, status: 'proposed' },
    u.token,
  );
const own = [];
for (let n = 0; n < 5; n++) own.push((await proposeAs(anna, n)).body.id);
expect('qui no és editor pot proposar puzles', own.every(Boolean), own);
r = await proposeAs(anna, 99);
expect('com a màxim 5 propostes pendents', r.status === 400, r);
r = await info(own[0], { title: 'La meva' }, anna.token);
expect('l’autor posa nom a la seva proposta', r.status === 204, r);
r = await info(prop.id, { wantedNumber: today });
expect('el dia preferit ha de ser a partir de demà', r.status === 400, r);
r = await info(prop.id, { wantedNumber: null });
q = await getPuzzle(prop.id);
expect('treure el dia preferit', r.status === 204 && q.wantedNumber === 0, q);
await req(`/collections/puzzles/records/${prop.id}`, {
  method: 'PATCH',
  token: gina.token,
  body: JSON.stringify({ data: { v: 2 } }),
});
q = await getPuzzle(prop.id);
expect(
  'canviar el contingut sí que actualitza contentUpdated',
  q.contentUpdated > prop.contentUpdated,
  q,
);
r = await info(pa, { title: 'Programat' });
expect('es pot posar nom a un puzle programat', r.status === 204, r);
r = await info(pa, { wantedNumber: today + 9 });
expect('però no dia preferit (es mou des del calendari)', r.status === 400, r);
// ── Avís diari ──
r = await get('/jocmot/avisos/clau');
expect(
  'la clau dels avisos és pública (null si el servidor no en té)',
  r.status === 200 && (r.body.publicKey === null || /^B[A-Za-z0-9_-]{86}$/.test(r.body.publicKey)),
  r,
);
const endpoint = 'https://updates.push.services.mozilla.com/wpush/v2/prova-' + Date.now();
const subscription = { endpoint, keys: { p256dh: 'x', auth: 'y' }, hour: 9 };
r = await post('/jocmot/avisos', subscription);
expect('activar l’avís demana sessió', r.status === 401, r);
r = await post(
  '/jocmot/avisos',
  { ...subscription, endpoint: 'https://127.0.0.1:8090/api/' },
  anna.token,
);
expect('només s’accepten serveis de push dels navegadors', r.status === 400, r);
r = await post('/jocmot/avisos', { ...subscription, hour: 24 }, anna.token);
expect('l’hora ha de ser de 0 a 23', r.status === 400, r);
r = await post('/jocmot/avisos', subscription, anna.token);
expect('activar l’avís', r.status === 204, r);
r = await post('/jocmot/avisos', { ...subscription, hour: 20 }, anna.token);
expect('canviar-ne l’hora', r.status === 204, r);
const su = await post('/collections/_superusers/auth-with-password', {
  identity: 'admin@test.local',
  password: 'adminadmin123',
});
const subsOf = async (u) =>
  (await get(`/collections/push_subscriptions/records?filter=(user='${u.id}')`, su.body.token)).body
    .items ?? [];
let subs = await subsOf(anna);
expect('una sola subscripció per navegador', subs.length === 1 && subs[0].hour === 20, subs);
r = await get('/collections/push_subscriptions/records', anna.token);
expect(
  'els usuaris no poden llegir les subscripcions',
  r.status === 403 || (r.body.items ?? []).length === 0,
  r,
);
r = await post('/jocmot/avisos/treu', { endpoint }, biel.token);
expect('no pots treure l’avís d’un altre', (await subsOf(anna)).length === 1, r);
r = await post('/jocmot/avisos/treu', { endpoint }, anna.token);
expect('desactivar l’avís', r.status === 204 && (await subsOf(anna)).length === 0, r);

// ── Recalcular (administració) ──
r = await post('/jocmot/admin/recalcula', {}, anna.token);
expect('recalcular és només per a superusuaris', r.status === 401 || r.status === 403, r);

// ── Esborrar el compte d'algú que ha proposat puzles ──
r = await req(`/collections/puzzles/records/${own[1]}`, {
  method: 'PATCH',
  token: gina.token,
  body: JSON.stringify({
    status: 'published',
    number: today + 30,
    releaseAt: new Date(Date.now() + 30 * 86400000).toISOString().replace('T', ' '),
  }),
});
expect('un editor publica la proposta d’una altra persona', r.status === 200, r);
r = await req('/jocmot/compte', {
  method: 'DELETE',
  token: anna.token,
  body: JSON.stringify({ password: 'contrasenya123' }),
});
expect('pot esborrar el compte encara que tingui puzles', r.status === 204, r);
const after = (await get(`/collections/puzzles/records/${own[1]}`, gina.token)).body;
expect('… el publicat es queda, sense autor', after.id === own[1] && after.author === '', after);
r = await get(`/collections/puzzles/records/${own[0]}`, gina.token);
expect('… les propostes s’esborren', r.status === 404, r);

// ── Desaprovar i corregir (editors) ──
r = await post(`/jocmot/puzles/${pb}/desaprova`, {}, eva.token);
expect('només els editors poden desaprovar', r.status === 403, r);
r = await post(`/jocmot/puzles/${pToday}/desaprova`, {}, gina.token);
expect('el puzle que ja ha sortit no es pot desaprovar', r.status === 400, r);
const pbBefore = await getPuzzle(pb);
r = await post(`/jocmot/puzles/${pb}/desaprova`, {}, cesc.token);
let un = await getPuzzle(pb);
expect(
  'desaprovar el torna a revisió, sense dia i amb el dia d’abans com a preferit',
  r.status === 204 &&
    un.status === 'proposed' &&
    !un.number &&
    !un.releaseAt &&
    un.wantedNumber === pbBefore.number &&
    un.contentUpdated > pbBefore.contentUpdated,
  { r, un },
);
r = await post(`/jocmot/puzles/${pa}/corregeix`, { data: { n: 'corregit' } }, eva.token);
expect('només els editors poden corregir', r.status === 403, r);
r = await post(`/jocmot/puzles/${pa}/corregeix`, { data: { n: 'corregit' } }, cesc.token);
a = await getPuzzle(pa);
expect(
  'un editor corregeix un programat d’un altre: es queda al seu dia',
  r.status === 204 && a.data.n === 'corregit' && a.status === 'published' && a.number === today + 6,
  { r, a },
);
r = await post(`/jocmot/puzles/${pToday}/corregeix`, { data: { n: 'avui' } }, cesc.token);
expect(
  '… també un que ja ha sortit',
  r.status === 204 && (await getPuzzle(pToday)).data.n === 'avui',
  r,
);
r = await post(`/jocmot/puzles/${pb}/corregeix`, { data: null }, cesc.token);
expect('… però no el pot deixar buit', r.status === 400, r);

// ── Likes ──
const hugo = await user('hugo');
const iris = await user('iris');
r = await get(`/jocmot/likes/mini/${today}`);
expect(
  'sense compte es veu el recompte',
  r.status === 200 && r.body.count === 0 && !r.body.liked,
  r,
);
r = await post(`/jocmot/likes/mini/${today}`, { liked: true });
expect('sense compte no es pot fer like', r.status === 401, r);
r = await post(`/jocmot/likes/mini/${today}`, { liked: true }, hugo.token);
await post(`/jocmot/likes/mini/${today}`, { liked: true }, hugo.token);
expect('fer like (dues vegades compta una)', r.body.count === 1 && r.body.liked, r);
await post(`/jocmot/likes/mini/${today}`, { liked: true }, iris.token);
r = await get(`/jocmot/likes/mini/${today}`, hugo.token);
expect('recompte i like propi', r.body.count === 2 && r.body.liked, r);
r = await post(`/jocmot/likes/mini/${today}`, { liked: false }, hugo.token);
expect('treure el like', r.body.count === 1 && !r.body.liked, r);
r = await post(`/jocmot/likes/mini/${today + 1}`, { liked: true }, hugo.token);
expect('no es pot fer like a un puzle futur', r.status === 400, r);
r = await get('/jocmot/likes/escacs/1');
expect('joc inexistent', r.status === 404, r);

// ── Xat de la lliga ──
const chatLeague = (await post('/jocmot/lligues', { name: 'Xerrada' }, hugo.token)).body;
await post('/jocmot/lligues/unir', { code: chatLeague.code }, iris.token);
const chat = `/jocmot/lligues/${chatLeague.id}/xat`;
r = await post(chat, { text: 'hola' }, eva.token);
expect('qui no és de la lliga no hi pot escriure', r.status === 404, r);
r = await get(chat, eva.token);
expect('… ni llegir-lo', r.status === 404, r);
r = await post(chat, { text: '   ' }, hugo.token);
expect('no es pot enviar un missatge buit', r.status === 400, r);
r = await post(chat, { text: 'x'.repeat(301) }, hugo.token);
expect('ni massa llarg', r.status === 400, r);
const m1 = (await post(chat, { text: '  Bon dia!  ' }, hugo.token)).body;
expect('enviar un missatge', m1.text === 'Bon dia!' && m1.user.name === 'hugo', m1);
r = await post(chat, { text: 'un altre' }, hugo.token);
expect('no es poden enviar dos missatges seguits tan de pressa', r.status === 400, r);
const m2 = (await post(chat, { text: 'Hola!' }, iris.token)).body;
r = await get(chat, iris.token);
expect(
  'llegir el xat, del més antic al més nou',
  r.body.messages.length === 2 &&
    r.body.messages[0].id === m1.id &&
    r.body.messages[1].id === m2.id,
  r.body,
);
r = await get(`${chat}?despres=${encodeURIComponent(m1.created)}`, iris.token);
expect('només els nous', r.body.messages.length === 1 && r.body.messages[0].id === m2.id, r.body);
r = await get('/jocmot/lligues', iris.token);
const summary = r.body.leagues.find((l) => l.id === chatLeague.id);
expect('el resum de lligues porta l’últim missatge', summary?.lastMessage?.id === m2.id, summary);
r = await del(`${chat}/${m1.id}`, iris.token);
expect('no pots esborrar el missatge d’un altre', r.status === 403, r);
r = await del(`${chat}/${m2.id}`, hugo.token);
expect('el creador de la lliga sí que pot', r.status === 204, r);
r = await del(`${chat}/${m1.id}`, hugo.token);
r = await get(chat, hugo.token);
expect('… i cadascú els seus', r.body.messages.length === 0, r.body);

// ── Pistes del dia ──
const jan = await user('jan');
r = await post(`/jocmot/pistes/paraula/${today}`, { count: 1 });
expect('sense compte no s’apunten pistes', r.status === 401, r);
r = await post(`/jocmot/pistes/paraula/${today + 1}`, { count: 1 }, jan.token);
expect('no hi ha pistes de puzles futurs', r.status === 400, r);
r = await post(`/jocmot/pistes/paraula/${today}`, { count: 2 }, jan.token);
await post(`/jocmot/pistes/paraula/${today}`, { count: 1 }, jan.token);
r = await get(`/jocmot/pistes/${today}`, jan.token);
expect(
  'les pistes es queden amb el màxim',
  r.body.games?.paraula?.count === 2 && r.body.games.paraula.solution === false,
  r.body,
);
await finish(jan, 'paraula', today, 'won', { guesses: ['a'], status: 'won' });
r = await get(`/jocmot/puntuacio/paraula/${today}`, jan.token);
expect('2 pistes resten 6 punts (15 → 9)', r.body.base === 9 && r.body.points === 9, r.body);
await post(`/jocmot/pistes/connexions/${today}`, { count: 0, solution: true }, jan.token);
await finish(jan, 'connexions', today, 'won', { mistakes: 0, status: 'won' });
r = await get(`/jocmot/puntuacio/connexions/${today}`, jan.token);
expect('veure la solució deixa el puzle sense punts', r.body.points === 0, r.body);
r = await post(`/jocmot/pistes/paraula/${today}`, { count: 3 }, jan.token);
expect('un cop acabat, les pistes ja no compten', r.status === 200 && r.body.counted === false, r);

console.log(fails ? `\n${fails} comprovacions han fallat` : '\nTot correcte');
process.exit(fails ? 1 : 0);
