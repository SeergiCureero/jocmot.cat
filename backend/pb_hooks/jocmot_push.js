/**
 * Utilitats pures per a les notificacions Web Push (VAPID, RFC 8292).
 * Sense res de PocketBase perquè les puguin provar els tests (Vitest).
 *
 * Els avisos s'envien sense contingut (només "hi ha novetats"): així no cal xifrar
 * res i el service worker (public/sw.js) mostra sempre el mateix text.
 */

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

/** Bytes → base64url sense farciment. */
function base64url(bytes) {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const n = (bytes[i] << 16) | ((bytes[i + 1] || 0) << 8) | (bytes[i + 2] || 0);
    out += B64[(n >> 18) & 63] + B64[(n >> 12) & 63];
    if (i + 1 < bytes.length) out += B64[(n >> 6) & 63];
    if (i + 2 < bytes.length) out += B64[n & 63];
  }
  return out;
}

/** Text ASCII (el JSON dels JWT) → bytes. */
const asciiBytes = (text) => Array.from(String(text), (c) => c.charCodeAt(0) & 255);

const hexBytes = (hex) => {
  const clean = String(hex).replace(/[^0-9a-f]/gi, '');
  const out = [];
  for (let i = 0; i + 1 < clean.length; i += 2) out.push(parseInt(clean.slice(i, i + 2), 16));
  return out;
};

/** Primera part del JWT de VAPID (capçalera.dades), la que s'ha de signar amb ES256. */
function vapidSigningInput(audience, expiresAtSeconds, subject) {
  const header = base64url(asciiBytes(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const claims = base64url(
    asciiBytes(JSON.stringify({ aud: audience, exp: expiresAtSeconds, sub: subject })),
  );
  return header + '.' + claims;
}

/**
 * Signatura ECDSA en DER (el que dona `openssl dgst -sign`, en hex) → format JOSE:
 * r i s de 32 bytes cadascun, en base64url.
 */
function derSignatureToJose(derHex) {
  const der = hexBytes(derHex);
  if (der[0] !== 0x30) throw new Error('Signatura DER no vàlida');
  let i = der[1] & 0x80 ? 2 + (der[1] & 0x7f) : 2;
  const ints = [];
  for (let k = 0; k < 2; k++) {
    if (der[i] !== 0x02) throw new Error('Signatura DER no vàlida');
    const len = der[i + 1];
    let n = der.slice(i + 2, i + 2 + len);
    while (n.length > 32 && n[0] === 0) n = n.slice(1);
    if (n.length > 32) throw new Error('Signatura DER no vàlida');
    while (n.length < 32) n.unshift(0);
    ints.push(n);
    i += 2 + len;
  }
  return base64url(ints[0].concat(ints[1]));
}

/**
 * Clau pública (punt sense comprimir, 65 bytes) a partir de la sortida de
 * `openssl pkey -in clau.pem -text_pub -noout`.
 */
function publicKeyFromOpensslText(text) {
  const m = String(text).match(/pub:\s*([0-9a-f:\s]+?)\s*ASN1 OID/i);
  if (!m) throw new Error('No trobo la clau pública');
  const bytes = hexBytes(m[1]);
  if (bytes.length !== 65 || bytes[0] !== 4) throw new Error('Clau pública inesperada');
  return base64url(bytes);
}

/**
 * Només s'envien avisos als serveis de push dels navegadors (Chrome, Firefox, Safari,
 * Edge): l'adreça la dona el navegador, i així el servidor no fa peticions a llocs qualssevol.
 */
const PUSH_HOSTS =
  /(^|\.)(fcm\.googleapis\.com|push\.services\.mozilla\.com|push\.apple\.com|notify\.windows\.com)$/;

function pushAudience(endpoint) {
  const m = String(endpoint || '').match(/^https:\/\/([a-z0-9.-]+)(:\d+)?\//i);
  if (!m || String(endpoint).length > 1000 || !PUSH_HOSTS.test(m[1].toLowerCase())) return null;
  return 'https://' + m[1].toLowerCase() + (m[2] || '');
}

module.exports = {
  base64url,
  asciiBytes,
  vapidSigningInput,
  derSignatureToJose,
  publicKeyFromOpensslText,
  pushAudience,
};
