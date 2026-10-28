/// <reference path="../pb_data/types.d.ts" />

/**
 * Correus en català i remitent de jocmot.cat.
 * El servidor SMTP (Brevo) es configura des del panell (Settings → Mail settings),
 * perquè la contrasenya no ha de quedar al repositori.
 */
const SITE = 'https://jocmot.cat';

const layout = (title, body) => `
<div style="font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; color: #1c1917;">
  <p style="font-size: 20px; font-weight: 800; margin: 0 0 24px;">jocmot<span style="color: #0f766e;">.cat</span></p>
  <h1 style="font-size: 20px; margin: 0 0 16px;">${title}</h1>
  ${body}
  <p style="margin-top: 32px; font-size: 13px; color: #78716c;">Jocs de paraules diaris en català · <a href="${SITE}" style="color: #78716c;">jocmot.cat</a></p>
</div>`;

const button = (href, text) =>
  `<p style="margin: 24px 0;"><a href="${href}" target="_blank" rel="noopener" style="background: #0f766e; color: #ffffff; padding: 12px 24px; border-radius: 9999px; text-decoration: none; font-weight: 600; display: inline-block;">${text}</a></p>`;

const ignore = (text) => `<p style="font-size: 14px; color: #57534e;"><i>${text}</i></p>`;

migrate(
  (app) => {
    const settings = app.settings();
    settings.meta.senderName = 'jocmot.cat';
    settings.meta.senderAddress = 'hola@jocmot.cat';
    app.save(settings);

    const users = app.findCollectionByNameOrId('users');

    users.resetPasswordTemplate.subject = 'Canvia la contrasenya de jocmot.cat';
    users.resetPasswordTemplate.body = layout(
      'Hola, {RECORD:name}!',
      `<p>Has demanat canviar la contrasenya del teu compte. Prem el botó per triar-ne una de nova:</p>
       ${button(`${SITE}/compte/nova-contrasenya/{TOKEN}`, 'Tria una contrasenya nova')}
       ${ignore('Si no ho has demanat tu, ignora aquest correu: la contrasenya no canviarà.')}`,
    );

    users.verificationTemplate.subject = 'Confirma el teu correu a jocmot.cat';
    users.verificationTemplate.body = layout(
      'Hola, {RECORD:name}!',
      `<p>Prem el botó per confirmar que aquest correu és teu:</p>
       ${button('{APP_URL}/_/#/auth/confirm-verification/{TOKEN}', 'Confirma el correu')}
       ${ignore('Si no t’has registrat a jocmot.cat, ignora aquest correu.')}`,
    );

    users.confirmEmailChangeTemplate.subject = 'Confirma el correu nou de jocmot.cat';
    users.confirmEmailChangeTemplate.body = layout(
      'Hola, {RECORD:name}!',
      `<p>Prem el botó per confirmar que vols fer servir aquest correu al teu compte:</p>
       ${button('{APP_URL}/_/#/auth/confirm-email-change/{TOKEN}', 'Confirma el correu nou')}
       ${ignore('Si no ho has demanat tu, ignora aquest correu.')}`,
    );

    users.otp.emailTemplate.subject = 'El teu codi de jocmot.cat';
    users.otp.emailTemplate.body = layout(
      'Hola, {RECORD:name}!',
      `<p>El teu codi per entrar és:</p>
       <p style="font-size: 28px; font-weight: 800; letter-spacing: 6px;">{OTP}</p>
       ${ignore('Si no l’has demanat tu, ignora aquest correu.')}`,
    );

    users.authAlert.emailTemplate.subject = 'Nou inici de sessió a jocmot.cat';
    users.authAlert.emailTemplate.body = layout(
      'Hola, {RECORD:name}!',
      `<p>Algú ha entrat al teu compte des d’un dispositiu nou:</p>
       <p style="font-size: 14px; color: #57534e;">{ALERT_INFO}</p>
       <p>Si has estat tu, no cal que facis res. Si no, canvia la contrasenya:</p>
       ${button(`${SITE}/compte/recupera`, 'Canvia la contrasenya')}`,
    );

    app.save(users);
  },
  () => {
    // Les plantilles anteriors eren les de PocketBase per defecte; no cal desfer res.
  },
);
