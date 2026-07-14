/* =============================================================
   ANTICA FIORERIA DEL CENTRO — autenticazione del pannello interno
   Un solo account (la titolare), niente registrazione: la password
   vive come variabile d'ambiente ADMIN_PASSWORD su Vercel. Il
   cookie non contiene mai la password, solo un'impronta calcolata
   da essa — così anche leggendo il cookie non si risale alla chiave.
   ============================================================= */
const crypto = require('crypto');

function impronta(valore) {
  return crypto.createHash('sha256').update(String(valore) + '::afc-admin').digest('hex');
}

function leggiCookie(req, nome) {
  var raw = req.headers.cookie || '';
  var m = raw.match(new RegExp('(?:^|; )' + nome + '=([^;]+)'));
  return m ? decodeURIComponent(m[1]) : null;
}

function sessioneValida(req) {
  if (!process.env.ADMIN_PASSWORD) return false;
  var cookie = leggiCookie(req, 'afc_admin');
  return !!cookie && cookie === impronta(process.env.ADMIN_PASSWORD);
}

function impostaCookieSessione(res) {
  var valore = impronta(process.env.ADMIN_PASSWORD);
  res.setHeader('Set-Cookie',
    'afc_admin=' + encodeURIComponent(valore) +
    '; HttpOnly; Secure; Path=/; Max-Age=' + (60 * 60 * 24 * 14) + '; SameSite=Lax');
}

module.exports = { sessioneValida, impostaCookieSessione };
