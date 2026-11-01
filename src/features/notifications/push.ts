import { backend } from '@/services/backend';
import { storage } from '@/lib/storage';

/**
 * Avís diari amb notificacions Web Push. El servidor (backend/pb_hooks/jocmot_avisos.js)
 * envia l'avís a l'hora triada; el service worker (public/sw.js) el mostra.
 */
const HOUR_KEY = 'avis:hora';
export const DEFAULT_HOUR = 9;

export type PushSupport =
  | 'ok'
  /** iPhone/iPad: només funciona si la web s'ha afegit a la pantalla d'inici. */
  | 'ios-needs-install'
  | 'unsupported';

export function pushSupport(): PushSupport {
  if ('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window)
    return 'ok';
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || navigator.maxTouchPoints > 1;
  return ios && /Safari/.test(navigator.userAgent) ? 'ios-needs-install' : 'unsupported';
}

/** Clau pública del servidor (null si els avisos no estan configurats). */
async function serverKey(): Promise<string | null> {
  const { publicKey } = await backend.call<{ publicKey: string | null }>('/avisos/clau');
  return publicKey;
}

export async function pushAvailable(): Promise<boolean> {
  if (backend.kind !== 'pocketbase' || pushSupport() !== 'ok') return false;
  return Boolean(await serverKey().catch(() => null));
}

const registration = () => navigator.serviceWorker.register('/sw.js');

async function currentSubscription(): Promise<PushSubscription | null> {
  const reg = await navigator.serviceWorker.getRegistration('/');
  return (await reg?.pushManager.getSubscription()) ?? null;
}

/** Hora triada si aquest navegador té l'avís activat; null si no. */
export async function enabledHour(): Promise<number | null> {
  if (Notification.permission !== 'granted') return null;
  return (await currentSubscription()) ? (storage.get<number>(HOUR_KEY) ?? DEFAULT_HOUR) : null;
}

function keyBytes(base64url: string): Uint8Array<ArrayBuffer> {
  const b64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4)), (c) =>
    c.charCodeAt(0),
  );
}

function sameKey(a: ArrayBuffer | null, b: Uint8Array): boolean {
  if (!a || a.byteLength !== b.length) return false;
  const bytes = new Uint8Array(a);
  return b.every((x, i) => x === bytes[i]);
}

/** Activa l'avís (o en canvia l'hora). Llença un Error amb el motiu si no es pot. */
export async function enablePush(hour: number): Promise<void> {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted')
    throw new Error(
      'El navegador no deixa enviar notificacions. Activa-les a la configuració del lloc.',
    );
  const key = await serverKey();
  if (!key) throw new Error('Ara mateix els avisos no estan disponibles.');
  const reg = await registration();
  await navigator.serviceWorker.ready;
  let subscription = await reg.pushManager.getSubscription();
  // Si el servidor ha canviat de clau, la subscripció antiga ja no serveix.
  if (subscription && !sameKey(subscription.options.applicationServerKey, keyBytes(key))) {
    await subscription.unsubscribe();
    subscription = null;
  }
  subscription ??= await reg.pushManager
    .subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(key) })
    .catch(() => {
      throw new Error(
        'No s’ha pogut activar l’avís en aquest navegador. Torna-ho a provar més tard.',
      );
    });
  await backend.call('/avisos', { method: 'POST', body: { ...subscription.toJSON(), hour } });
  storage.set(HOUR_KEY, hour);
}

export async function disablePush(): Promise<void> {
  const subscription = await currentSubscription();
  if (subscription) {
    await backend
      .call('/avisos/treu', { method: 'POST', body: { endpoint: subscription.endpoint } })
      .catch(() => {});
    await subscription.unsubscribe();
  }
  storage.remove(HOUR_KEY);
}

export const sendTestPush = () =>
  backend.call<{ sent: number; devices: number }>('/avisos/prova', { method: 'POST' });
