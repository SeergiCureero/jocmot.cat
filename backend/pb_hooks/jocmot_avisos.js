/**
 * Avís diari (notificacions Web Push) per als hooks i rutes de `jocmot.pb.js`.
 *
 * La clau privada VAPID és al servidor, fora del repositori (per defecte
 * /opt/pocketbase/vapid/private.pem; veure docs/BACKEND.md). Si no hi és, els avisos
 * queden desactivats i la web no els ofereix. Es signa amb `openssl`, perquè el JSVM
 * de PocketBase no té criptografia de corba el·líptica.
 */
const lib = require(`${__hooks}/jocmot.js`);
const push = require(`${__hooks}/jocmot_push.js`);

const SUBJECT = 'mailto:hola@jocmot.cat';
const GAMES = ['paraula', 'connexions', 'fils', 'mini'];
const MAX_PER_USER = 10;
const COLLECTION = 'push_subscriptions';

const keyPath = () => $os.getenv('JOCMOT_VAPID_KEY') || `${__hooks}/../vapid/private.pem`;

function openssl(...args) {
  return toString($os.exec('openssl', ...args).output());
}

/** Clau pública en base64url, o null si el servidor no té clau (avisos desactivats). */
function publicKey() {
  try {
    $os.stat(keyPath());
  } catch {
    return null;
  }
  return push.publicKeyFromOpensslText(openssl('pkey', '-in', keyPath(), '-text_pub', '-noout'));
}

/** JWT de VAPID per a un servei de push, vàlid 12 hores. */
function vapidJwt(audience) {
  const input = push.vapidSigningInput(
    audience,
    Math.floor(Date.now() / 1000) + 12 * 3600,
    SUBJECT,
  );
  // L'entrada només té caràcters base64url i punts: es pot passar com a argument sense risc.
  const out = toString(
    $os
      .exec(
        'sh',
        '-c',
        'printf %s "$1" | openssl dgst -sha256 -hex -sign "$2"',
        'sh',
        input,
        keyPath(),
      )
      .output(),
  );
  return input + '.' + push.derSignatureToJose(out.slice(out.lastIndexOf('=') + 1).trim());
}

/**
 * Envia un avís (sense contingut) a cada subscripció. Esborra les que el servei de push
 * diu que ja no existeixen. Retorna quantes s'han enviat bé.
 */
function sendTo(app, subscriptions) {
  const key = publicKey();
  if (!key || !subscriptions.length) return 0;
  const jwts = {};
  let sent = 0;
  for (const sub of subscriptions) {
    const endpoint = sub.getString('endpoint');
    const audience = push.pushAudience(endpoint);
    if (!audience) continue;
    try {
      jwts[audience] = jwts[audience] || vapidJwt(audience);
      const res = $http.send({
        url: endpoint,
        method: 'POST',
        headers: {
          Authorization: `vapid t=${jwts[audience]}, k=${key}`,
          TTL: '43200',
          Urgency: 'normal',
          'Content-Length': '0',
        },
        body: '',
        timeout: 15,
      });
      if (res.statusCode === 404 || res.statusCode === 410) app.delete(sub);
      else if (res.statusCode >= 200 && res.statusCode < 300) sent++;
      else app.logger().warn('Avís no enviat', 'status', res.statusCode, 'host', audience);
    } catch (err) {
      app.logger().warn('Avís no enviat', 'error', String(err), 'host', audience);
    }
  }
  return sent;
}

/** Ha acabat ja tots els jocs del dia? (llavors no cal avisar-lo) */
function playedAllToday(app, userId, number) {
  const done = app.findRecordsByFilter(
    'progress',
    "user = {:u} && puzzle = {:n} && status != 'playing'",
    '',
    10,
    0,
    { u: userId, n: number },
  );
  return GAMES.every((g) => done.some((p) => p.getString('game') === g));
}

/** Cada hora: avisa els qui han triat aquesta hora (de Madrid) i encara no han jugat avui. */
function sendDailyReminders(app) {
  if (!publicKey()) return;
  const day = lib.madridDate(Date.now());
  const number = lib.puzzleNumberForDate(day);
  const subs = app.findRecordsByFilter(COLLECTION, 'hour = {:h} && lastSent != {:d}', '', 0, 0, {
    h: lib.madridHour(Date.now()),
    d: day,
  });
  const due = [];
  const skipped = {};
  for (const sub of subs) {
    const user = sub.getString('user');
    if (!(user in skipped)) skipped[user] = playedAllToday(app, user, number);
    // Es marca com a enviat igualment: si després hi ha un error, no es torna a provar fins demà.
    sub.set('lastSent', day);
    app.save(sub);
    if (!skipped[user]) due.push(sub);
  }
  const sent = sendTo(app, due);
  if (subs.length)
    app.logger().info('Avisos diaris', 'enviats', sent, 'subscripcions', subs.length);
}

/** Desa (o actualitza) la subscripció d'aquest navegador. */
function subscribe(app, user, body) {
  const endpoint = String((body && body.endpoint) || '');
  const keys = (body && body.keys) || {};
  const hour = Number(body && body.hour);
  if (!push.pushAudience(endpoint)) throw new BadRequestError('Aquest navegador no és compatible.');
  if (!Number.isInteger(hour) || hour < 0 || hour > 23)
    throw new BadRequestError('Hora no vàlida.');

  let sub = null;
  try {
    sub = app.findFirstRecordByFilter(COLLECTION, 'endpoint = {:e}', { e: endpoint });
  } catch {
    const count = app.findRecordsByFilter(COLLECTION, 'user = {:u}', '', 0, 0, {
      u: user.id,
    }).length;
    if (count >= MAX_PER_USER)
      throw new BadRequestError('Ja tens massa dispositius amb l’avís activat.');
    sub = new Record(app.findCollectionByNameOrId(COLLECTION));
    sub.set('endpoint', endpoint);
  }
  // Si el navegador abans era d'un altre compte, ara és d'aquest.
  sub.set('user', user.id);
  sub.set('p256dh', String(keys.p256dh || '').slice(0, 200));
  sub.set('auth', String(keys.auth || '').slice(0, 100));
  sub.set('hour', hour);
  app.save(sub);
}

function unsubscribe(app, user, endpoint) {
  for (const sub of app.findRecordsByFilter(
    COLLECTION,
    'user = {:u} && endpoint = {:e}',
    '',
    0,
    0,
    {
      u: user.id,
      e: String(endpoint || ''),
    },
  ))
    app.delete(sub);
}

/** Avís de prova a tots els dispositius de l'usuari. */
function sendTest(app, user) {
  const subs = app.findRecordsByFilter(COLLECTION, 'user = {:u}', '', 0, 0, { u: user.id });
  return { sent: sendTo(app, subs), devices: subs.length };
}

module.exports = { publicKey, sendDailyReminders, subscribe, unsubscribe, sendTest };
