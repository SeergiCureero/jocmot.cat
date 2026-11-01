/*
 * Service worker de jocmot.cat: només mostra l'avís diari (notificacions Web Push).
 * Els avisos arriben sense contingut, i per això el text és sempre el mateix.
 * No intercepta cap petició: la web funciona igual amb ell o sense.
 */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  event.waitUntil(
    self.registration.showNotification('Ja tens els puzles d’avui 🧩', {
      body: 'Paraula, Connexions, Fils i Mini t’esperen. No perdis la ratxa!',
      icon: '/icona-192.png',
      badge: '/icona-192.png',
      tag: 'puzles-del-dia',
      lang: 'ca',
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      const open = windows.find((w) => new URL(w.url).origin === self.location.origin);
      return open ? open.focus().then((w) => w.navigate('/')) : self.clients.openWindow('/');
    }),
  );
});
