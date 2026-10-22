/* =============================================================
   BAGNARINO COWORKING — accesso all'area riservata
   Due ruoli, due password (variabili su Vercel):
   - ADMIN_PASSWORD → "titolare" (Marcella): tutto, tranne
     modificare i numeri di social e Google della scheda Crescita;
   - APEX_PASSWORD  → "apex" (Apex Media): tutto, compresi i numeri
     di marketing. Se la variabile manca, questo accesso non esiste.
   Nel cookie (HttpOnly, Secure, 30 giorni) finisce solo un'impronta
   della password, diversa per ruolo: chi lo legge non può fingersi
   l'altro ruolo, e cambiando una password escono tutti quelli che
   la usavano. I cookie già emessi prima dei ruoli valgono come
   "titolare" (stessa impronta di prima).
   Tentativi limitati: 10 all'ora per indirizzo (in api/admin.js).
   ============================================================= */
const crypto = require('crypto');

const SALE = { titolare: '::bgn-admin', apex: '::bgn-apex' };
const VARIABILE = { titolare: 'ADMIN_PASSWORD', apex: 'APEX_PASSWORD' };

function impronta(v, ruolo) { return crypto.createHash('sha256').update(String(v) + SALE[ruolo || 'titolare']).digest('hex'); }
function confrontoSicuro(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}
function leggiCookie(req, nome) {
  const m = String(req.headers.cookie || '').match(new RegExp('(?:^|; )' + nome + '=([^;]+)'));
  return m ? decodeURIComponent(m[1]) : null;
}
function passwordDi(ruolo) { return process.env[VARIABILE[ruolo]] || ''; }

/* la tastiera del telefono "aiuta" troppo: spazi in coda, prima lettera
   maiuscola, trattino lungo al posto di quello corto. Le password sono
   frasi lunghe, quindi le confrontiamo in forma semplice. */
function normalizza(p) {
  return String(p || '').normalize('NFKC').replace(/[\u2010-\u2015\u2212]/g, '-')
    .replace(/[\s\u200B-\u200D\uFEFF]+/g, '').toLowerCase();
}

/* quale ruolo ha chi presenta questa password (null = nessuno) */
function ruoloPassword(password) {
  let trovato = null;
  /* si controllano sempre entrambe, così il tempo di risposta non dice nulla */
  ['titolare', 'apex'].forEach(r => {
    const giusta = normalizza(passwordDi(r));
    const ok = confrontoSicuro(normalizza(password), giusta || crypto.randomBytes(16).toString('hex'));
    if (ok && giusta && !trovato) trovato = r;
  });
  return trovato;
}

/* ruolo della sessione in corso, dal cookie (null = non entrato) */
function ruoloSessione(req) {
  const c = leggiCookie(req, 'bgn_admin');
  if (!c) return null;
  let trovato = null;
  ['titolare', 'apex'].forEach(r => {
    const pw = passwordDi(r);
    if (pw && confrontoSicuro(c, impronta(pw, r)) && !trovato) trovato = r;
  });
  return trovato;
}
function sessioneValida(req) { return !!ruoloSessione(req); }
function accessoConfigurato() { return !!(passwordDi('titolare') || passwordDi('apex')); }

function sicuro(req) { return !/^(localhost|127\.)/.test(String(req.headers.host || '')); }
function apriSessione(req, res, ruolo) {
  ruolo = ruolo || 'titolare';
  res.setHeader('Set-Cookie', 'bgn_admin=' + impronta(passwordDi(ruolo), ruolo) +
    '; HttpOnly; Path=/; Max-Age=' + (60 * 60 * 24 * 30) + '; SameSite=Strict' + (sicuro(req) ? '; Secure' : ''));
}
function chiudiSessione(req, res) {
  res.setHeader('Set-Cookie', 'bgn_admin=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict' + (sicuro(req) ? '; Secure' : ''));
}
module.exports = { sessioneValida, ruoloSessione, ruoloPassword, accessoConfigurato, apriSessione, chiudiSessione, confrontoSicuro };
