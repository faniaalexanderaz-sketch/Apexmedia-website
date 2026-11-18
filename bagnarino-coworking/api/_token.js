/* =============================================================
   BAGNARINO COWORKING — link firmati con scadenza
   I pulsanti "Conferma" e "Non disponibile" nelle email alla
   titolare funzionano senza accesso: il link contiene cosa fare,
   su quale richiesta e fino a quando, più una firma (HMAC-SHA256)
   che solo il server sa calcolare. Cambiare anche un carattere lo
   rende nullo. Segreto: LINK_SECRET (in mancanza, CRON_SECRET).
   ============================================================= */
const crypto = require('crypto');

function segreto() { return process.env.LINK_SECRET || process.env.CRON_SECRET || ''; }
function attivo() { return segreto().length >= 8; }
function hmac(testo) { return crypto.createHmac('sha256', segreto()).update(testo).digest('base64url'); }

/* dati: oggetto piccolo (es. { a: 'conferma', id: 12 }); durata in secondi */
function firma(dati, durata, adesso) {
  if (!attivo()) return null;
  const corpo = Buffer.from(JSON.stringify(Object.assign({}, dati, {
    exp: Math.floor((adesso ? +adesso : Date.now()) / 1000) + durata
  }))).toString('base64url');
  return corpo + '.' + hmac(corpo);
}

/* torna i dati se la firma è giusta e il link non è scaduto, altrimenti null */
function leggi(token, adesso) {
  if (!attivo()) return null;
  const parti = String(token || '').split('.');
  if (parti.length !== 2) return null;
  const a = Buffer.from(hmac(parti[0])), b = Buffer.from(parti[1]);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  let dati;
  try { dati = JSON.parse(Buffer.from(parti[0], 'base64url').toString('utf8')); } catch (e) { return null; }
  if (!dati || typeof dati.exp !== 'number' || dati.exp < Math.floor((adesso ? +adesso : Date.now()) / 1000)) return null;
  return dati;
}

module.exports = { firma, leggi, attivo };
