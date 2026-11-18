/* =============================================================
   BAGNARINO COWORKING — notifiche sul telefono (Web Push)
   Chiavi VAPID in VAPID_PUBLIC_KEY e VAPID_PRIVATE_KEY (su Vercel).
   Ogni telefono su cui la titolare tocca "Attiva le notifiche"
   lascia un'iscrizione nella tabella push_iscrizioni; a ogni
   avviso il messaggio parte, cifrato, verso tutte le iscrizioni.
   Un'iscrizione scaduta (il telefono non la riconosce più) viene
   tolta da sola. Senza chiavi non parte nulla e nulla si rompe.
   ============================================================= */
const { q, disponibile } = require('./_db');
const { emailTitolare } = require('./_email');

function chiavePubblica() { return (process.env.VAPID_PUBLIC_KEY || '').trim(); }
function configurato() { return !!(chiavePubblica() && (process.env.VAPID_PRIVATE_KEY || '').trim()); }

/* l'indirizzo a cui il telefono manda il messaggio: solo https
   (in prova si ammette il computer locale) */
function endpointValido(url) {
  if (typeof url !== 'string' || url.length > 1000) return false;
  if (/^https:\/\/[^\s]+$/.test(url)) return true;
  return process.env.PUSH_PROVA === '1' && /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?\//.test(url);
}

async function iscrivi(utenteId, iscrizione) {
  const k = iscrizione && iscrizione.keys;
  if (!iscrizione || !endpointValido(iscrizione.endpoint) || !k || typeof k.p256dh !== 'string' || typeof k.auth !== 'string' ||
      k.p256dh.length > 200 || k.auth.length > 100) return false;
  await q(
    `INSERT INTO push_iscrizioni (endpoint, utente_id, p256dh, auth) VALUES ($1, $2, $3, $4)
     ON CONFLICT (endpoint) DO UPDATE SET utente_id = EXCLUDED.utente_id, p256dh = EXCLUDED.p256dh, auth = EXCLUDED.auth`,
    [iscrizione.endpoint, utenteId, k.p256dh, k.auth]);
  return true;
}
async function disiscrivi(endpoint) { await q('DELETE FROM push_iscrizioni WHERE endpoint = $1', [String(endpoint || '')]); }

/* messaggio: { titolo, corpo, url, tag } → { telefoni, inviate } */
async function inviaPush(messaggio, soloEndpoint) {
  if (!configurato() || !disponibile()) return { telefoni: 0, inviate: 0 };
  let iscrizioni;
  try {
    iscrizioni = soloEndpoint
      ? await q('SELECT endpoint, p256dh, auth FROM push_iscrizioni WHERE endpoint = $1', [soloEndpoint])
      : await q('SELECT endpoint, p256dh, auth FROM push_iscrizioni');
  } catch (e) { return { telefoni: 0, inviate: 0 }; }
  if (!iscrizioni.length) return { telefoni: 0, inviate: 0 };

  const webpush = require('web-push');
  const corpo = JSON.stringify(messaggio);
  const opzioni = {
    vapidDetails: {
      subject: 'mailto:' + (emailTitolare() || 'info@bagnarino.it'),
      publicKey: chiavePubblica(), privateKey: process.env.VAPID_PRIVATE_KEY.trim()
    },
    TTL: 12 * 60 * 60, urgency: 'high'
  };
  let inviate = 0;
  await Promise.all(iscrizioni.map(async (s) => {
    try {
      const d = webpush.generateRequestDetails({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, corpo, opzioni);
      const intestazioni = Object.assign({}, d.headers);
      delete intestazioni['Content-Length'];
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 8000);
      const r = await fetch(d.endpoint, { method: d.method, headers: intestazioni, body: d.body, signal: ctrl.signal });
      clearTimeout(t);
      if (r.status === 404 || r.status === 410) await q('DELETE FROM push_iscrizioni WHERE endpoint = $1', [s.endpoint]);
      else if (r.ok) inviate++;
      else console.error('[bagnarino] push', r.status);
    } catch (e) { console.error('[bagnarino] push', e.message); }
  }));
  return { telefoni: iscrizioni.length, inviate };
}

module.exports = { inviaPush, iscrivi, disiscrivi, configurato, chiavePubblica };
