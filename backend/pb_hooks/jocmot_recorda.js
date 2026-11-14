/**
 * Correu per tornar a jugar. Un de sol quan fa 5 dies que algú no juga, i mai més de un cada 30 dies.
 * Cada dia a les 18:00 (Madrid), com a màxim DAILY_LIMIT correus: Brevo gratuït en permet 300 al dia
 * i la resta (contrasenyes, avisos d'inici de sessió) no s'han de quedar sense lloc.
 */
const lib = require(`${__hooks}/jocmot.js`);

const SITE = 'https://jocmot.cat';
const API = 'https://api.jocmot.cat';
const AFTER_DAYS = 5; // dies sense jugar
const GIVE_UP_DAYS = 30; // passat això, ja no insistim
const MIN_GAP_DAYS = 30; // entre dos correus a la mateixa persona
const DAILY_LIMIT = 100;
const SEND_HOUR = 18;

const toMs = (pbDate) => new Date(String(pbDate).replace(' ', 'T')).getTime();
const escape = (t) =>
  String(t).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );

/** Qui toca avisar avui: [{id, email, name, last}] (`last` = últim dia d'activitat). */
function candidates(app, day) {
  const rows = arrayOf(
    new DynamicModel({
      id: '',
      email: '',
      name: '',
      last: '',
      nudgedFor: '',
      lastNudge: '',
    }),
  );
  app
    .db()
    .newQuery(
      `SELECT u.id AS id, u.email AS email, u.name AS name, u.nudgedFor AS nudgedFor, u.lastNudge AS lastNudge,
              COALESCE(MAX(p.updated), u.created) AS last
       FROM users u LEFT JOIN progress p ON p.user = u.id
       WHERE u.noReturnEmail != TRUE AND u.email != ''
       GROUP BY u.id`,
    )
    .all(rows);
  const oldest = lib.addDays(day, -GIVE_UP_DAYS);
  const newest = lib.addDays(day, -AFTER_DAYS);
  const gap = lib.addDays(day, -MIN_GAP_DAYS);
  const out = [];
  for (const r of rows) {
    const last = lib.madridDate(toMs(r.last));
    if (last > newest || last < oldest) continue;
    if (r.nudgedFor === last) continue; // ja se li va avisar per aquesta absència
    if (r.lastNudge && r.lastNudge > gap) continue;
    out.push({ id: r.id, email: r.email, name: r.name, last });
    if (out.length >= DAILY_LIMIT) break;
  }
  return out;
}

/** Token de baixa de l'usuari (es crea la primera vegada que cal). */
function unsubToken(app, user) {
  let token = user.getString('unsubToken');
  if (!token) {
    token = $security.randomString(32);
    user.set('unsubToken', token);
    app.saveNoValidate(user);
  }
  return token;
}

function render(name, days, link) {
  const hi = escape(name || 'Hola');
  const html = `
<div style="font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; color: #1c1917;">
  <p style="font-size: 20px; font-weight: 800; margin: 0 0 24px;">jocmot<span style="color: #0f766e;">.cat</span></p>
  <h1 style="font-size: 20px; margin: 0 0 16px;">Hola, ${hi}! Et trobem a faltar</h1>
  <p>Fa ${days} dies que no jugues. Avui hi ha quatre puzles nous esperant-te: Paraula, Connexions, Fils i Mini.</p>
  <p><strong>Torna avui i et donem un cop de mà:</strong> amb l’<em>Empenta de bentornats</em>, cada joc del dia et suma +3 punts extra durant tres dies.</p>
  <p style="margin: 24px 0;"><a href="${SITE}" target="_blank" rel="noopener" style="background: #0f766e; color: #ffffff; padding: 12px 24px; border-radius: 9999px; text-decoration: none; font-weight: 600; display: inline-block;">Juga els puzles d’avui</a></p>
  <p style="margin-top: 32px; font-size: 13px; color: #78716c;">Només t’escrivim una vegada, quan fa uns dies que no hi ets. Si no vols rebre aquests correus, <a href="${link}" style="color: #78716c;">dona’t de baixa aquí</a> (sense haver d’entrar al compte) o desactiva’ls des del perfil.</p>
</div>`;
  const text = `Hola, ${name || ''}! Et trobem a faltar a jocmot.cat.\n\nFa ${days} dies que no jugues. Avui hi ha quatre puzles nous: ${SITE}\nTorna avui i, amb l'Empenta de bentornats, cada joc del dia et suma +3 punts extra durant tres dies.\n\nSi no vols rebre aquests correus: ${link}`;
  return { html, text };
}

function deliver(app, address, name, days, link) {
  const { html, text } = render(name, days, link);
  const meta = app.settings().meta;
  app.newMailClient().send(
    new MailerMessage({
      from: { address: meta.senderAddress, name: meta.senderName },
      to: [{ address }],
      subject: 'Et trobem a faltar a jocmot.cat',
      html,
      text,
      headers: {
        'List-Unsubscribe': `<${link}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    }),
  );
}

function sendOne(app, user, days) {
  const link = `${API}/api/jocmot/baixa/${unsubToken(app, user)}`;
  deliver(app, user.getString('email'), user.getString('name'), days, link);
}

/** Correu d'exemple a una adreça (per provar-ne l'aspecte i que arriba). L'enllaç de baixa no és vàlid. */
function sendSample(app, address) {
  deliver(app, address, 'Prova', 6, `${API}/api/jocmot/baixa/enllac-de-prova-no-valid`);
}

/**
 * Envia els correus d'avui. Si `dry`, només diu a qui s'enviarien. Si falla un enviament no es marca
 * com a fet (es tornarà a provar demà) i s'atura la tanda per no insistir amb un servidor de correu caigut.
 */
function sendReturnEmails(app, dry) {
  const day = lib.madridDate(Date.now());
  const list = candidates(app, day);
  if (dry) return { day, sent: 0, would: list.map((c) => ({ name: c.name, last: c.last })) };
  let sent = 0;
  for (const c of list) {
    const user = app.findRecordById('users', c.id);
    try {
      sendOne(app, user, lib.puzzleNumberForDate(day) - lib.puzzleNumberForDate(c.last));
    } catch (err) {
      app.logger().warn('Correu de tornada no enviat', 'error', String(err));
      break;
    }
    user.set('nudgedFor', c.last);
    user.set('lastNudge', day);
    app.saveNoValidate(user);
    sent++;
  }
  if (list.length)
    app.logger().info('Correus de tornada', 'enviats', sent, 'candidats', list.length);
  return { day, sent };
}

/** Cron horari: només actua a les SEND_HOUR de Madrid. */
function cron(app) {
  if (lib.madridHour(Date.now()) === SEND_HOUR) sendReturnEmails(app, false);
}

/** Donar-se de baixa amb el token del correu. Retorna true si s'ha trobat l'usuari. */
function unsubscribe(app, token) {
  if (!token || token.length < 16) return false;
  let user;
  try {
    user = app.findFirstRecordByFilter('users', 'unsubToken = {:t}', { t: token });
  } catch {
    return false;
  }
  user.set('noReturnEmail', true);
  app.saveNoValidate(user);
  return true;
}

module.exports = { candidates, sendReturnEmails, sendSample, cron, unsubscribe };
