/* =============================================================
   BAGNARINO — service worker dell'app di gestione (/gestione)
   Fa tre cose:
   1. rende l'app installabile e veloce: stili, script, caratteri e
      icone restano sul telefono;
   2. riceve le notifiche e le mostra, anche con l'app chiusa;
   3. al tocco sulla notifica apre la richiesta giusta.
   Le pagine e i dati passano sempre dal server (sono protetti
   dalla sessione): senza rete compare un messaggio chiaro.
   ============================================================= */
const VERSIONE = 'bgn-gestione-3';
const FERMI = [
  '/gestione-app.css', '/gestione-app.js',
  '/fonts/hanken-grotesk-latin-wght-normal.woff2', '/fonts/fraunces-latin-standard-normal.woff2',
  '/img/app/icona-192.png', '/img/app/icona-180.png', '/img/app/distintivo-96.png'
];
const SENZA_RETE = '<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
  '<title>Bagnarino</title></head><body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#FAF6EE;color:#111922;' +
  'font:20px/1.5 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;text-align:center;padding:24px;box-sizing:border-box">' +
  '<div><p style="font-size:30px;font-weight:700;margin:0 0 12px">Non c’è connessione</p>' +
  '<p style="margin:0 0 24px">Controlla il Wi-Fi o i dati del telefono, poi riprova.</p>' +
  '<a href="/gestione" style="display:block;padding:18px;border-radius:10px;background:#1B2A3A;color:#fff;font-weight:700;text-decoration:none">Riprova</a></div></body></html>';

self.addEventListener('install', (ev) => {
  ev.waitUntil(caches.open(VERSIONE).then(c => c.addAll(FERMI)).catch(() => null).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (ev) => {
  ev.waitUntil(caches.keys().then(nomi => Promise.all(nomi.filter(n => n.indexOf('bgn-gestione-') === 0 && n !== VERSIONE).map(n => caches.delete(n))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (ev) => {
  const req = ev.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || url.pathname.indexOf('/api/') === 0) return;
  /* pagine: sempre dal server; senza rete, il messaggio */
  if (req.mode === 'navigate') {
    ev.respondWith(fetch(req).catch(() => new Response(SENZA_RETE, { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } })));
    return;
  }
  /* file fermi: subito dal telefono, e intanto si aggiornano */
  if (FERMI.indexOf(url.pathname) !== -1) {
    ev.respondWith(caches.open(VERSIONE).then(c => c.match(url.pathname).then(salvato => {
      const fresco = fetch(req).then(r => { if (r.ok) c.put(url.pathname, r.clone()); return r; }).catch(() => salvato);
      return salvato || fresco;
    })));
  }
});

/* ---------- notifiche ---------- */
self.addEventListener('push', (ev) => {
  let m = {};
  try { m = ev.data ? ev.data.json() : {}; } catch (e) { m = { corpo: ev.data ? ev.data.text() : '' }; }
  ev.waitUntil(self.registration.showNotification(m.titolo || 'Bagnarino', {
    body: m.corpo || '',
    icon: '/img/app/icona-192.png',
    badge: '/img/app/distintivo-96.png',
    tag: m.tag || undefined,
    renotify: !!m.tag,
    data: { url: m.url || '/gestione' }
  }));
});

/* tocco sulla notifica: si apre direttamente la richiesta */
self.addEventListener('notificationclick', (ev) => {
  ev.notification.close();
  const url = new URL((ev.notification.data && ev.notification.data.url) || '/gestione', self.location.origin).href;
  ev.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((aperte) => {
    const app = aperte.find(c => new URL(c.url).pathname.indexOf('/gestione') === 0);
    if (app) return (app.navigate ? app.navigate(url).catch(() => null) : Promise.resolve(null)).then(c => (c || app).focus());
    return self.clients.openWindow(url);
  }));
});
