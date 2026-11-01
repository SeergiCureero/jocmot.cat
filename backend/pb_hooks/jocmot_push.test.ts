import { createRequire } from 'node:module';
import { createPublicKey, generateKeyPairSync, sign, verify } from 'node:crypto';

const push = createRequire(import.meta.url)('./jocmot_push.js');

// Sortida de `openssl pkey -in clau.pem -text_pub -noout` d'una clau de prova.
const OPENSSL_TEXT = `Public-Key: (256 bit)
pub:
    04:1f:50:81:e3:c8:d1:f4:8d:86:0c:6c:a1:88:56:
    25:c6:fd:69:9a:c3:91:a5:6a:91:c7:b7:cb:95:57:
    c8:5d:92:c6:f2:b3:35:b2:7d:0d:07:ca:e5:bd:40:
    7d:20:3b:94:3f:25:45:3b:57:b7:a7:16:d2:c4:6f:
    46:08:e4:a8:25
ASN1 OID: prime256v1
NIST CURVE: P-256
`;

describe('base64url', () => {
  it('coincideix amb Node', () => {
    for (const len of [0, 1, 2, 3, 4, 31, 32, 64, 65]) {
      const bytes = Array.from({ length: len }, (_, i) => (i * 37 + 11) & 255);
      expect(push.base64url(bytes)).toBe(Buffer.from(bytes).toString('base64url'));
    }
  });
});

describe('VAPID', () => {
  it('converteix una signatura DER en una de JOSE que es pot verificar', () => {
    const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
    const input = push.vapidSigningInput(
      'https://fcm.googleapis.com',
      1800000000,
      'mailto:hola@jocmot.cat',
    );
    // Moltes signatures perquè surtin r i s amb zeros al davant o amb el bit alt.
    for (let i = 0; i < 50; i++) {
      const der = sign('sha256', Buffer.from(input), { key: privateKey, dsaEncoding: 'der' });
      const jose = Buffer.from(push.derSignatureToJose(der.toString('hex')), 'base64url');
      expect(jose).toHaveLength(64);
      expect(
        verify('sha256', Buffer.from(input), { key: publicKey, dsaEncoding: 'ieee-p1363' }, jose),
      ).toBe(true);
    }
    const [header, claims] = input
      .split('.')
      .map((p: string) => JSON.parse(Buffer.from(p, 'base64url').toString()));
    expect(header).toEqual({ typ: 'JWT', alg: 'ES256' });
    expect(claims).toEqual({
      aud: 'https://fcm.googleapis.com',
      exp: 1800000000,
      sub: 'mailto:hola@jocmot.cat',
    });
  });

  it('llegeix la clau pública de la sortida d’openssl', () => {
    const key = push.publicKeyFromOpensslText(OPENSSL_TEXT);
    expect(key).toBe(
      'BB9QgePI0fSNhgxsoYhWJcb9aZrDkaVqkce3y5VXyF2SxvKzNbJ9DQfK5b1AfSA7lD8lRTtXt6cW0sRvRgjkqCU',
    );
    // És un punt vàlid de P-256.
    const raw = Buffer.from(key, 'base64url');
    const jwk = {
      kty: 'EC',
      crv: 'P-256',
      x: raw.subarray(1, 33).toString('base64url'),
      y: raw.subarray(33).toString('base64url'),
    };
    expect(() => createPublicKey({ key: jwk, format: 'jwk' })).not.toThrow();
  });
});

describe('pushAudience', () => {
  it('accepta els serveis de push dels navegadors', () => {
    expect(push.pushAudience('https://fcm.googleapis.com/fcm/send/abc')).toBe(
      'https://fcm.googleapis.com',
    );
    expect(push.pushAudience('https://updates.push.services.mozilla.com/wpush/v2/x')).toBe(
      'https://updates.push.services.mozilla.com',
    );
    expect(push.pushAudience('https://web.push.apple.com/QGx')).toBe('https://web.push.apple.com');
    expect(push.pushAudience('https://wns2-par02p.notify.windows.com/w/?token=1')).toBe(
      'https://wns2-par02p.notify.windows.com',
    );
  });
  it('rebutja qualsevol altra adreça', () => {
    for (const url of [
      'http://fcm.googleapis.com/fcm/send/abc',
      'https://evil.com/fcm.googleapis.com/',
      'https://fcm.googleapis.com.evil.com/x',
      'https://127.0.0.1/x',
      'https://localhost:8090/api/',
      'javascript:alert(1)',
      '',
    ]) {
      expect(push.pushAudience(url), url).toBeNull();
    }
  });
});
