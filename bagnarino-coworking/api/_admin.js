/* =============================================================
   BAGNARINO COWORKING — accesso all'area riservata
   Un solo account: la password è la variabile ADMIN_PASSWORD su
   Vercel. Nel cookie (HttpOnly, Secure, 30 giorni) finisce solo
   un'impronta della password: cambiandola, tutti escono.
   Tentativi limitati: 10 all'ora per indirizzo.
   ============================================================= */
const crypto = require('crypto');

function impronta(v) { return crypto.createHash('sha256').update(String(v) + '::bgn-admin').digest('hex'); }
function confrontoSicuro(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}
function leggiCookie(req, nome) {
  const m = String(req.headers.cookie || '').match(new RegExp('(?:^|; )' + nome + '=([^;]+)'));
  return m ? decodeURIComponent(m[1]) : null;
}
function sessioneValida(req) {
  if (!process.env.ADMIN_PASSWORD) return false;
  const c = leggiCookie(req, 'bgn_admin');
  return !!c && confrontoSicuro(c, impronta(process.env.ADMIN_PASSWORD));
}
function sicuro(req) { return !/^(localhost|127\.)/.test(String(req.headers.host || '')); }
function apriSessione(req, res) {
  res.setHeader('Set-Cookie', 'bgn_admin=' + impronta(process.env.ADMIN_PASSWORD) +
    '; HttpOnly; Path=/; Max-Age=' + (60 * 60 * 24 * 30) + '; SameSite=Strict' + (sicuro(req) ? '; Secure' : ''));
}
function chiudiSessione(req, res) {
  res.setHeader('Set-Cookie', 'bgn_admin=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict' + (sicuro(req) ? '; Secure' : ''));
}
module.exports = { sessioneValida, apriSessione, chiudiSessione, confrontoSicuro };
