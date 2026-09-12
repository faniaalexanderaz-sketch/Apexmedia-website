/* =============================================================
   ARABESQUE BUSALLA — accesso al pannello interno
   Un solo account: la password vive come variabile d'ambiente
   ADMIN_PASSWORD su Vercel. Nel cookie finisce solo un'impronta.
   ============================================================= */
const crypto = require('crypto');

function impronta(v) {
  return crypto.createHash('sha256').update(String(v) + '::arb-admin').digest('hex');
}
function confrontoSicuro(a, b) {
  var ba = Buffer.from(String(a));
  var bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}
function leggiCookie(req, nome) {
  var raw = req.headers.cookie || '';
  var m = raw.match(new RegExp('(?:^|; )' + nome + '=([^;]+)'));
  return m ? decodeURIComponent(m[1]) : null;
}
function sessioneValida(req) {
  if (!process.env.ADMIN_PASSWORD) return false;
  var c = leggiCookie(req, 'arb_admin');
  return !!c && confrontoSicuro(c, impronta(process.env.ADMIN_PASSWORD));
}
function impostaCookieSessione(res) {
  res.setHeader('Set-Cookie',
    'arb_admin=' + encodeURIComponent(impronta(process.env.ADMIN_PASSWORD)) +
    '; HttpOnly; Secure; Path=/; Max-Age=' + (60 * 60 * 24 * 14) + '; SameSite=Lax');
}
module.exports = { sessioneValida, impostaCookieSessione, confrontoSicuro };
