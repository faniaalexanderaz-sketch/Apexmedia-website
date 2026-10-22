/* =============================================================
   BAGNARINO COWORKING — utilità comuni delle API
   Traduce gli errori previsti in risposte chiare in italiano.
   Nei log non finisce mai un dato personale: solo il codice
   dell'errore e il messaggio tecnico.
   ============================================================= */
const STATI = {
  DB_ASSENTE: 501, DATI: 400, DATA: 400, NON_TROVATA: 404, FUORI_TEMPO: 403,
  POSTO_ESAURITO: 409, GIA_PRENOTATO: 409, GIA_FATTO: 409, CARNET_IN_USO: 409, TROPPI: 429, NON_AUTORIZZATO: 401
};

function corpo(req) {
  let b = req.body || {};
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = {}; } }
  return b;
}
function ip(req) {
  return String(req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || '').split(',')[0].trim();
}
function json(res, stato, dati) {
  res.statusCode = stato;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (!res.getHeader('Cache-Control')) res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(dati));
}
function errore(res, err) {
  const stato = STATI[err && err.codice];
  if (stato) {
    json(res, stato, Object.assign({ errore: err.codice, messaggio: err.message }, err.extra || {}));
    return;
  }
  console.error('[bagnarino]', err && err.code, err && err.message);
  json(res, 500, { errore: 'INTERNO', messaggio: 'Qualcosa non ha funzionato. Riprova tra poco o scrivici su WhatsApp.' });
}
function soloMetodo(req, res, metodo) {
  if (req.method === metodo) return true;
  res.setHeader('Allow', metodo);
  json(res, 405, { errore: 'METODO', messaggio: 'Metodo non consentito' });
  return false;
}
/* indirizzo pubblico del sito, per i link nelle email */
function sitoUrl(req) {
  if (process.env.SITO_URL) return process.env.SITO_URL.replace(/\/$/, '');
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return 'https://' + process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return 'https://' + ((req && (req.headers['x-forwarded-host'] || req.headers.host)) || 'localhost');
}
module.exports = { corpo, ip, json, errore, soloMetodo, sitoUrl };
