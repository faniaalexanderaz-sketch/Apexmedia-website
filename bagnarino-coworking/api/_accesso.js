/* =============================================================
   BAGNARINO COWORKING — accesso all'app di gestione (/gestione)
   Email + password una volta sola, poi il telefono resta dentro
   per 90 giorni (che ripartono a ogni utilizzo).
   - La password è salvata solo come impronta (scrypt + sale).
   - Nel cookie (HttpOnly, Secure, SameSite=Lax) c'è un gettone
     casuale; nel database solo la sua impronta. Chi legge il
     database non può entrare, chi cambia la password fa uscire
     tutti i telefoni.
   - Recupero password: link via email, valido un'ora, una volta.
   - Primo avvio: se non esiste nessun accesso, nasce quello della
     titolare con l'email di NOTIFICATION_EMAIL e la password
     dell'area riservata di prima (ADMIN_PASSWORD).
   Le pagine e le API di /gestione controllano la sessione sul
   server: senza sessione non esce nessun dato.
   ============================================================= */
const crypto = require('crypto');
const { q } = require('./_db');
const { emailTitolare, inviaEmail } = require('./_email');
const BASE = require('../config.js');

const COOKIE = 'bgn_gestione';
const GIORNI_SESSIONE = 90;
const MINUTI_RECUPERO = 60;
const PASSWORD_MINIMA = 8;

function errore(codice, messaggio) { const e = new Error(messaggio); e.codice = codice; return e; }
function impronta(v) { return crypto.createHash('sha256').update(String(v)).digest('hex'); }
function gettone() { return crypto.randomBytes(32).toString('base64url'); }

/* la tastiera del telefono "aiuta" troppo: spazi in coda, prima lettera
   maiuscola, trattino lungo al posto di quello corto. Le password si
   confrontano in forma semplice, come nell'area riservata di prima. */
function normalizza(p) {
  return String(p || '').normalize('NFKC').replace(/[‐-―−]/g, '-')
    .replace(/[\s​-‍﻿]+/g, '').toLowerCase();
}
function scrypt(password, sale) {
  return new Promise((ok, no) => crypto.scrypt(normalizza(password), sale, 32, { N: 16384, r: 8, p: 1 }, (e, k) => e ? no(e) : ok(k)));
}
async function creaImpronta(password) {
  const sale = crypto.randomBytes(16);
  return 'scrypt$' + sale.toString('base64url') + '$' + (await scrypt(password, sale)).toString('base64url');
}
async function passwordGiusta(password, salvata) {
  const p = String(salvata || '').split('$');
  if (p.length !== 3 || p[0] !== 'scrypt') { await scrypt(password, Buffer.alloc(16)); return false; }
  const attesa = Buffer.from(p[2], 'base64url');
  const calcolata = await scrypt(password, Buffer.from(p[1], 'base64url'));
  return attesa.length === calcolata.length && crypto.timingSafeEqual(attesa, calcolata);
}

function emailAccesso() { return emailTitolare() || String(BASE.azienda.email || '').toLowerCase(); }

/* primo avvio: l'accesso della titolare */
async function assicuraUtente() {
  const n = await q('SELECT COUNT(*)::int AS n FROM utenti');
  if (n[0].n > 0) return;
  const email = emailAccesso();
  if (!email) return;
  /* senza ADMIN_PASSWORD nasce con una password che nessuno conosce:
     si entra la prima volta da "Password dimenticata" */
  const iniziale = process.env.ADMIN_PASSWORD || crypto.randomBytes(24).toString('hex');
  await q('INSERT INTO utenti (email, nome, password_hash) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING',
    [email, process.env.GESTIONE_NOME || 'Marcella', await creaImpronta(iniziale)]);
}

/* ---------- cookie ---------- */
function leggiCookie(req, nome) {
  const m = String(req.headers.cookie || '').match(new RegExp('(?:^|; )' + nome + '=([^;]+)'));
  return m ? decodeURIComponent(m[1]) : null;
}
function sicuro(req) { return !/^(localhost|127\.)/.test(String(req.headers.host || '')); }
function scriviCookie(req, res, valore, secondi) {
  res.setHeader('Set-Cookie', COOKIE + '=' + valore + '; HttpOnly; Path=/; Max-Age=' + secondi + '; SameSite=Lax' + (sicuro(req) ? '; Secure' : ''));
}

/* ---------- sessioni ---------- */
async function apriSessione(req, res, utenteId) {
  const t = gettone();
  await q("INSERT INTO sessioni (token_hash, utente_id, scade_il) VALUES ($1, $2, now() + ($3::text || ' days')::interval)", [impronta(t), utenteId, String(GIORNI_SESSIONE)]);
  scriviCookie(req, res, t, GIORNI_SESSIONE * 24 * 60 * 60);
  if (Math.random() < 0.1) await q('DELETE FROM sessioni WHERE scade_il < now()');
}

/* chi sta usando l'app (null = nessuno). Con res, i 90 giorni ripartono
   da oggi quando ne è passato più di uno dall'ultimo rinnovo. */
async function sessione(req, res) {
  const t = leggiCookie(req, COOKIE);
  if (!t || t.length < 20 || t.length > 100) return null;
  let r;
  try {
    r = await q(
      `SELECT u.id, u.email, u.nome, s.scade_il < now() + ($2::text || ' days')::interval AS da_rinnovare
       FROM sessioni s JOIN utenti u ON u.id = s.utente_id WHERE s.token_hash = $1 AND s.scade_il > now()`, [impronta(t), String(GIORNI_SESSIONE - 1)]);
  } catch (e) { if (e && e.codice === 'DB_ASSENTE') return null; throw e; }
  if (!r.length) return null;
  if (res && r[0].da_rinnovare) {
    await q("UPDATE sessioni SET scade_il = now() + ($2::text || ' days')::interval, ultimo_uso = now() WHERE token_hash = $1", [impronta(t), String(GIORNI_SESSIONE)]);
    scriviCookie(req, res, t, GIORNI_SESSIONE * 24 * 60 * 60);
  }
  return { id: r[0].id, email: r[0].email, nome: r[0].nome };
}

async function chiudiSessione(req, res) {
  const t = leggiCookie(req, COOKIE);
  if (t) await q('DELETE FROM sessioni WHERE token_hash = $1', [impronta(t)]);
  scriviCookie(req, res, '', 0);
}

/* ---------- accesso ---------- */
async function accedi(req, res, email, password) {
  await assicuraUtente();
  email = String(email || '').trim().toLowerCase();
  const u = (await q('SELECT id, password_hash FROM utenti WHERE email = $1', [email]))[0];
  /* si calcola sempre, così il tempo di risposta non dice se l'email esiste */
  const ok = await passwordGiusta(password, u ? u.password_hash : '');
  if (!u || !ok) throw errore('PASSWORD', 'Email o password non corrette. Riprova.');
  await apriSessione(req, res, u.id);
  return { ok: true };
}

/* ---------- recupero password ---------- */
async function chiediRecupero(email, sito) {
  await assicuraUtente();
  email = String(email || '').trim().toLowerCase();
  const u = (await q('SELECT id, email FROM utenti WHERE email = $1', [email]))[0];
  if (!u) return { ok: true };   /* stessa risposta: non si rivela se l'email esiste */
  const t = gettone();
  await q("INSERT INTO recuperi (token_hash, utente_id, scade_il) VALUES ($1, $2, now() + ($3::text || ' minutes')::interval)", [impronta(t), u.id, String(MINUTI_RECUPERO)]);
  const T = require('./_email-template');
  const m = T.recuperoPassword(sito + '/gestione/password?t=' + t);
  const e = await inviaEmail({ to: u.email, subject: m.oggetto, html: m.html });
  return { ok: true, inviata: !!e.inviata };
}

async function recuperoValido(token) {
  const r = await q('SELECT utente_id FROM recuperi WHERE token_hash = $1 AND NOT usato AND scade_il > now()', [impronta(String(token || ''))]);
  return r.length ? r[0].utente_id : null;
}

async function nuovaPassword(req, res, token, password) {
  const utenteId = await recuperoValido(token);
  if (!utenteId) throw errore('LINK_SCADUTO', 'Questo link non vale più. Chiedine uno nuovo da "Password dimenticata".');
  if (normalizza(password).length < PASSWORD_MINIMA) throw errore('DATI', 'La password deve avere almeno ' + PASSWORD_MINIMA + ' caratteri.');
  await q('UPDATE utenti SET password_hash = $2, password_il = now() WHERE id = $1', [utenteId, await creaImpronta(password)]);
  await q('UPDATE recuperi SET usato = true WHERE utente_id = $1', [utenteId]);
  /* escono tutti i telefoni che erano dentro; questo entra subito */
  await q('DELETE FROM sessioni WHERE utente_id = $1', [utenteId]);
  await apriSessione(req, res, utenteId);
  return { ok: true };
}

module.exports = {
  sessione, accedi, chiudiSessione, chiediRecupero, recuperoValido, nuovaPassword, assicuraUtente,
  normalizza, creaImpronta, passwordGiusta, COOKIE, GIORNI_SESSIONE, PASSWORD_MINIMA
};
