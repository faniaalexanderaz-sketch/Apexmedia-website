/* =============================================================
   BAGNARINO COWORKING — test della prenotazione su richiesta
   Fasce (mattina, pomeriggio, giornata intera), chiusure della
   titolare, richiesta "in attesa", conferma / non disponibile,
   email (catturate, mai spedite), link firmati, promemoria dopo
   due ore, notifiche sul telefono, passaggio dal vecchio database.
   ============================================================= */
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const crypto = require('node:crypto');
const { PGlite } = require('@electric-sql/pglite');
const db = require('../api/_db');
const P = require('../api/_prenotazioni');
const E = require('../api/_email');
const avvisi = require('../api/_avvisi');
const token = require('../api/_token');
const { impostazioni } = require('../api/_impostazioni');

/* lunedì 2 novembre 2026, 9:00 a Roma */
const ADESSO = new Date('2026-11-02T08:00:00Z');
const SITO = 'https://esempio.it';
process.env.NOTIFICATION_EMAIL = 'info@bagnarino.it';
process.env.LINK_SECRET = 'segreto-solo-per-i-test';

function adattatore(pg) {
  return {
    query: (t, v) => pg.query(t, v || []).then(r => r.rows),
    transazione: (lavoro) => pg.transaction(tx => lavoro((t, v) => tx.query(t, v || []).then(r => r.rows)))
  };
}
async function nuovoDb() {
  const pg = new PGlite();
  db.impostaAdattatore(adattatore(pg));
  await db.assicuraSchema();
  return pg;
}
let n = 0;
function cliente(extra) {
  n++;
  return Object.assign({
    pacchetto: 'giornata', data: '2026-11-04',
    nome: 'Prova', cognome: 'Cliente' + n, email: 'cliente' + n + '@esempio.it', telefono: '347 000 01' + String(n).padStart(2, '0'),
    consenso_privacy: true
  }, extra || {});
}
const ctx = { adesso: ADESSO };
/* cattura le email al posto di spedirle */
function posta() { const lista = []; E.impostaTrasporto(m => { lista.push(m); }); return lista; }

test('fasce: mattina e pomeriggio costano 12 euro, la giornata intera 25', async () => {
  await nuovoDb();
  const m = await P.prenota(cliente({ fascia: 'mattina' }), ctx);
  const p = await P.prenota(cliente({ fascia: 'pomeriggio' }), ctx);
  const g = await P.prenota(cliente({ fascia: 'giornata' }), ctx);
  const senza = await P.prenota(cliente(), ctx);
  assert.deepEqual([m.prezzo, p.prezzo, g.prezzo, senza.prezzo], [1200, 1200, 2500, 2500]);
  assert.deepEqual([m.nomeFascia, p.nomeFascia, g.nomeFascia, senza.fascia], ['Mattina', 'Pomeriggio', 'Giornata intera', 'giornata']);
  /* carnet e mensili valgono sempre per la giornata intera */
  const k = await P.prenota(cliente({ pacchetto: 'carnet', fascia: 'mattina', data: '2026-11-05' }), ctx);
  assert.equal(k.fascia, 'giornata');
  assert.equal(k.prezzo, 20000);
});

test('fasce: la stessa scrivania può servire una persona la mattina e un’altra il pomeriggio', async () => {
  const pg = await nuovoDb();
  const a = await P.prenota(cliente({ fascia: 'mattina' }), ctx);
  const b = await P.prenota(cliente({ fascia: 'pomeriggio' }), ctx);
  assert.equal(a.postazione, b.postazione);
  let r = await P.disponibilita('2026-11-04', 1, 'giornata', ADESSO);
  assert.deepEqual(r.fasce['2026-11-04'], { mattina: 7, pomeriggio: 7, giornata: 7, nd: [] });
  /* otto mattine riempiono la mattina e la giornata intera, non il pomeriggio */
  for (let i = 0; i < 7; i++) await P.prenota(cliente({ fascia: 'mattina' }), ctx);
  r = await P.disponibilita('2026-11-04', 1, 'giornata', ADESSO);
  assert.deepEqual(r.fasce['2026-11-04'], { mattina: 0, pomeriggio: 7, giornata: 0, nd: [] });
  assert.equal(r.giorni['2026-11-04'], 7);
  await assert.rejects(P.prenota(cliente({ fascia: 'mattina' }), ctx), e => e.codice === 'POSTO_ESAURITO');
  await assert.rejects(P.prenota(cliente({ fascia: 'giornata' }), ctx), e => e.codice === 'POSTO_ESAURITO');
  await P.prenota(cliente({ fascia: 'pomeriggio' }), ctx);
  /* una giornata intera occupa due righe, una mezza giornata una */
  const righe = (await pg.query('SELECT fascia, COUNT(*)::int AS n FROM occupazioni GROUP BY fascia ORDER BY fascia')).rows;
  assert.deepEqual(righe, [{ fascia: 'mattina', n: 8 }, { fascia: 'pomeriggio', n: 2 }]);
});

test('chiusure della titolare: giorno intero, solo mattina, solo pomeriggio', async () => {
  const pg = await nuovoDb();
  await pg.query("INSERT INTO chiusure (data, motivo, fascia) VALUES ('2026-11-05', 'Chiuso', 'giorno'), ('2026-11-06', 'Chiuso', 'mattina'), ('2026-11-07', 'Chiuso', 'pomeriggio')");
  const r = await P.disponibilita('2026-11-05', 3, 'giornata', ADESSO);
  assert.deepEqual(r.fasce['2026-11-05'], { mattina: 0, pomeriggio: 0, giornata: 0, nd: ['mattina', 'pomeriggio', 'giornata'] });
  assert.deepEqual(r.fasce['2026-11-06'], { mattina: 0, pomeriggio: 8, giornata: 0, nd: ['mattina', 'giornata'] });
  assert.deepEqual(r.fasce['2026-11-07'], { mattina: 8, pomeriggio: 0, giornata: 0, nd: ['pomeriggio', 'giornata'] });
  await assert.rejects(P.prenota(cliente({ data: '2026-11-05', fascia: 'pomeriggio' }), ctx), e => e.codice === 'DATA');
  await assert.rejects(P.prenota(cliente({ data: '2026-11-06', fascia: 'mattina' }), ctx), e => e.codice === 'DATA');
  await assert.rejects(P.prenota(cliente({ data: '2026-11-06', fascia: 'giornata' }), ctx), e => e.codice === 'DATA');
  const ok = await P.prenota(cliente({ data: '2026-11-06', fascia: 'pomeriggio' }), ctx);
  assert.equal(ok.stato, 'in_attesa');
  /* un mese non occupa i giorni chiusi per intero, ma parte lo stesso */
  const mese = await P.prenota(cliente({ pacchetto: 'mese_flessibile', data: '2026-11-03' }), ctx);
  const giorni = (await pg.query('SELECT COUNT(DISTINCT data)::int AS n FROM occupazioni WHERE prenotazione_id = $1', [mese.id])).rows[0].n;
  assert.equal(giorni, 29);
});

test('richieste per oggi: ogni fascia si chiude a una certa ora, mai mostrata sul sito', async () => {
  await nuovoDb();
  const alle = ora => new Date('2026-11-02T' + ora + ':00Z'); /* Roma = UTC+1 */
  let r = await P.disponibilita('2026-11-02', 1, 'giornata', alle('08:00'));
  assert.deepEqual(r.fasce['2026-11-02'].nd, []);
  r = await P.disponibilita('2026-11-02', 1, 'giornata', alle('10:30')); /* 11:30 a Roma */
  assert.deepEqual(r.fasce['2026-11-02'].nd, ['mattina', 'giornata']);
  assert.equal(r.giorni['2026-11-02'], 8);
  r = await P.disponibilita('2026-11-02', 2, 'giornata', alle('15:30')); /* 16:30 a Roma */
  assert.deepEqual(r.fasce['2026-11-02'].nd, ['mattina', 'pomeriggio', 'giornata']);
  assert.equal(r.giorni['2026-11-02'], 0);
  assert.equal(r.giorni['2026-11-03'], 8);
  await assert.rejects(P.prenota(cliente({ data: '2026-11-02', fascia: 'mattina' }), { adesso: alle('10:30') }), e => e.codice === 'DATA');
  await P.prenota(cliente({ data: '2026-11-02', fascia: 'pomeriggio' }), { adesso: alle('10:30') });
});

test('conferma: la richiesta diventa prenotazione, una volta sola', async () => {
  await nuovoDb();
  const p = await P.prenota(cliente(), ctx);
  const s0 = await P.stato(p.codice, p.email, ADESSO);
  assert.equal(s0.stato, 'in_attesa');
  assert.equal(s0.annullabile, true);
  const c = await P.rispondi(p.id, 'conferma');
  assert.equal(c.stato, 'confermata');
  assert.equal((await db.q('SELECT stato, accettata, risposta_il IS NOT NULL AS risposto FROM prenotazioni WHERE id = $1', [p.id]))[0].risposto, true);
  /* la seconda risposta non cambia niente e dice com'è andata */
  await assert.rejects(P.rispondi(p.id, 'non_disponibile'), e => e.codice === 'GIA_FATTO' && e.extra.stato === 'confermata');
  await assert.rejects(P.rispondi(p.id, 'conferma'), e => e.codice === 'GIA_FATTO');
  await assert.rejects(P.rispondi(p.id, 'boh'), e => e.codice === 'DATI');
  await assert.rejects(P.rispondi(99999, 'conferma'), e => e.codice === 'NON_TROVATA');
  assert.equal((await P.disponibilita('2026-11-04', 1, 'giornata', ADESSO)).giorni['2026-11-04'], 7);
});

test('non disponibile: il posto si libera e l’ingresso del carnet torna indietro', async () => {
  await nuovoDb();
  const dati = cliente({ pacchetto: 'carnet', data: '2026-11-03' });
  const carnet = await P.prenota(dati, ctx);
  await P.rispondi(carnet.id, 'conferma');
  const g = await P.prenota(Object.assign({}, dati, { pacchetto: 'giornata', data: '2026-11-10' }), ctx);
  assert.equal(g.carnet.residui, 8);
  const no = await P.rispondi(g.id, 'non_disponibile');
  assert.equal(no.stato, 'annullata');
  assert.equal(no.motivo_annullamento, 'non_disponibile');
  assert.equal((await P.vantaggi(dati.email, dati.telefono, '2026-11-12')).carnet.residui, 9);
  assert.equal((await P.disponibilita('2026-11-10', 1, 'giornata', ADESSO)).giorni['2026-11-10'], 8);
  assert.equal((await P.stato(g.codice, dati.email, ADESSO)).motivo, 'non_disponibile');
  await assert.rejects(P.rispondi(g.id, 'conferma'), e => e.codice === 'GIA_FATTO' && e.extra.stato === 'annullata' && e.extra.motivo === 'non_disponibile');
});

test('il cliente ritira una richiesta in attesa quando vuole; la titolare annulla con il motivo giusto', async () => {
  await nuovoDb();
  const d = cliente({ data: '2026-11-12' });
  const p = await P.prenota(d, ctx);
  /* fuori dal termine della disdetta, ma è ancora una richiesta: si può */
  const a = await P.annulla(p.codice, d.email, new Date('2026-11-11T22:00:00Z'));
  assert.equal(a.eraInAttesa, true);
  assert.equal(a.motivo_annullamento, 'cliente');
  const inAttesa = await P.prenota(cliente({ data: '2026-11-12' }), ctx);
  const confermata = await P.prenota(cliente({ data: '2026-11-12' }), ctx);
  await P.rispondi(confermata.id, 'conferma');
  assert.equal((await P.annullaDaAdmin(inAttesa.id)).motivo_annullamento, 'non_disponibile');
  assert.equal((await P.annullaDaAdmin(confermata.id)).motivo_annullamento, 'titolare');
  await assert.rejects(P.annullaDaAdmin(confermata.id), e => e.codice === 'GIA_FATTO');
});

test('timbro della Card: vale per la giornata intera, non per la mezza giornata', async () => {
  await nuovoDb();
  const base = cliente();
  const mezza = await P.prenota(Object.assign({}, base, { data: '2026-11-03', fascia: 'mattina' }), ctx);
  const intera = await P.prenota(Object.assign({}, base, { data: '2026-11-04' }), ctx);
  const a = await P.segnaPresenza(mezza.id, 'presente');
  assert.deepEqual([a.timbro, a.timbri], [false, 0]);
  const b = await P.segnaPresenza(intera.id, 'presente');
  assert.deepEqual([b.timbro, b.timbri], [true, 1]);
});

test('email al cliente: ricevuta, confermata, non disponibile, annullata con scuse', async () => {
  await nuovoDb();
  const cfg = await impostazioni();
  const inviate = posta();
  const d = cliente({ data: '2026-11-10', fascia: 'mattina' });
  const p = await P.prenota(d, ctx);
  await avvisi.richiesta(p, cfg, SITO);
  const ricevuta = inviate.find(m => m.to === d.email);
  assert.match(ricevuta.subject, /^Richiesta ricevuta BGN-/);
  assert.match(ricevuta.html, /Abbiamo ricevuto la tua richiesta, ti confermiamo a breve/);
  assert.doesNotMatch(ricevuta.html, /Prenotazione confermata/);
  assert.equal(ricevuta.rispondiA, 'info@bagnarino.it');
  assert.equal(ricevuta.allegati, undefined);

  await avvisi.esito(await P.rispondi(p.id, 'conferma'), cfg, SITO);
  const conferma = inviate[inviate.length - 1];
  assert.equal(conferma.to, d.email);
  assert.match(conferma.html, /Prenotazione confermata, ti aspettiamo martedì 10 novembre, mattina\./);
  assert.match(conferma.html, /Corso Lamarmora 46/);
  assert.match(conferma.html, /Come arrivare/);
  assert.match(conferma.html, /google\.com\/maps/);
  assert.equal(conferma.rispondiA, 'info@bagnarino.it');
  assert.match(conferma.allegati[0].contenuto, /DTSTART;VALUE=DATE:20261110/);

  await avvisi.esito(await P.annullaDaAdmin(p.id), cfg, SITO);
  const scuse = inviate[inviate.length - 1];
  assert.match(scuse.subject, /^Ci scusiamo/);
  assert.match(scuse.html, /esempio\.it\/prenota\?pacchetto=giornata#giorno/);
  assert.equal(scuse.rispondiA, 'info@bagnarino.it');

  const p2 = await P.prenota(cliente({ data: '2026-11-11', fascia: 'pomeriggio' }), ctx);
  await avvisi.esito(await P.rispondi(p2.id, 'non_disponibile'), cfg, SITO);
  const no = inviate[inviate.length - 1];
  assert.match(no.html, /Purtroppo in quella fascia lo spazio non è disponibile\. Scegli un altro momento, ti confermiamo subito:/);
  assert.match(no.html, /esempio\.it\/prenota\?pacchetto=giornata#giorno/);
  /* nessun orario fisso e nessuna frase che mette ansia, in nessuna email */
  inviate.forEach(m => {
    assert.doesNotMatch(m.html, /\b\d{1,2}:\d{2}\s*[–-]\s*\d{1,2}:\d{2}\b|Lun–Ven|dalle \d/, m.subject);
    assert.doesNotMatch(m.html, /salvo imprevisti|potremmo essere chiusi|subire variazioni|non garantit/i, m.subject);
  });
  E.impostaTrasporto(null);
});

test('email alla titolare: va a NOTIFICATION_EMAIL, con due pulsanti che funzionano senza accesso', async () => {
  await nuovoDb();
  const cfg = await impostazioni();
  const inviate = posta();
  const p = await P.prenota(cliente({ data: '2026-11-10', fascia: 'mattina', nome: 'Giulia', cognome: 'Rossi' }), ctx);
  await avvisi.richiesta(p, cfg, SITO);
  const m = inviate.find(x => x.to === 'info@bagnarino.it');
  assert.equal(m.subject, 'Nuova richiesta: Giulia Rossi, martedì 10 novembre, mattina');
  assert.equal(m.rispondiA, undefined);
  const link = [...m.html.matchAll(/href="(https:\/\/esempio\.it\/gestione\/risposta\?t=[^"]+)"/g)].map(x => x[1]);
  assert.equal(link.length, 2);
  assert.match(m.html, />Conferma</);
  assert.match(m.html, />Non disponibile</);
  /* ogni email parte per uno solo di questi due indirizzi: il cliente o la titolare */
  assert.deepEqual([...new Set(inviate.map(x => x.to))].sort(), [p.email, 'info@bagnarino.it'].sort());

  const si = token.leggi(new URL(link[0]).searchParams.get('t'));
  const no = token.leggi(new URL(link[1]).searchParams.get('t'));
  assert.deepEqual([si.a, si.id, no.a, no.id], ['conferma', p.id, 'non_disponibile', p.id]);
  /* scade dopo 7 giorni e non si può ritoccare */
  const t = new URL(link[0]).searchParams.get('t');
  assert.equal(token.leggi(t, Date.now() + 8 * 24 * 60 * 60 * 1000), null);
  assert.equal(token.leggi(t.slice(0, -2) + 'xx'), null);
  const falso = Buffer.from(JSON.stringify({ a: 'conferma', id: p.id + 1, exp: si.exp })).toString('base64url') + '.' + t.split('.')[1];
  assert.equal(token.leggi(falso), null);
  E.impostaTrasporto(null);
});

test('promemoria dopo due ore: una volta sola, mai di notte, mai per richieste già risolte', async () => {
  await nuovoDb();
  const cfg = await impostazioni();
  const inviate = posta();
  const vecchia = await P.prenota(cliente({ data: '2026-11-10' }), ctx);
  const risolta = await P.prenota(cliente({ data: '2026-11-10' }), ctx);
  const recente = await P.prenota(cliente({ data: '2026-11-10' }), ctx);
  await P.rispondi(risolta.id, 'conferma');
  const mezzogiorno = new Date('2026-11-02T11:00:00Z'), notte = new Date('2026-11-02T23:30:00Z');
  await db.q('UPDATE prenotazioni SET creato_il = $2 WHERE id = ANY($1::int[])', [[vecchia.id, risolta.id], '2026-11-02T08:30:00Z']);
  await db.q('UPDATE prenotazioni SET creato_il = $2 WHERE id = $1', [recente.id, '2026-11-02T10:00:00Z']);

  assert.deepEqual(await avvisi.solleciti(cfg, SITO, notte), { fuoriOrario: true, sollecitate: 0 });
  assert.deepEqual(await avvisi.solleciti(cfg, SITO, mezzogiorno), { sollecitate: 1 });
  assert.equal(inviate.length, 1);
  assert.equal(inviate[0].to, 'info@bagnarino.it');
  assert.match(inviate[0].subject, /^Aspetta la tua risposta: /);
  assert.match(inviate[0].html, />Conferma</);
  /* la seconda chiamata non manda niente */
  assert.deepEqual(await avvisi.solleciti(cfg, SITO, mezzogiorno), { sollecitate: 0 });
  assert.equal(inviate.length, 1);
  E.impostaTrasporto(null);
});

test('notifica sul telefono: messaggio cifrato per quel telefono, firmato con le chiavi VAPID', async () => {
  await nuovoDb();
  const webpush = require('web-push');
  const ece = require('http_ece');
  const chiavi = webpush.generateVAPIDKeys();
  process.env.VAPID_PUBLIC_KEY = chiavi.publicKey;
  process.env.VAPID_PRIVATE_KEY = chiavi.privateKey;
  process.env.PUSH_PROVA = '1';
  const push = require('../api/_push');

  /* un finto "telefono": le sue chiavi e un indirizzo che riceve il messaggio */
  const telefono = crypto.createECDH('prime256v1');
  telefono.generateKeys();
  const auth = crypto.randomBytes(16).toString('base64url');
  const ricevute = [];
  let risposta = 201;
  const server = http.createServer((req, res) => {
    const pezzi = [];
    req.on('data', p => pezzi.push(p));
    req.on('end', () => { ricevute.push({ intestazioni: req.headers, corpo: Buffer.concat(pezzi) }); res.statusCode = risposta; res.end(); });
  });
  await new Promise(ok => server.listen(0, '127.0.0.1', ok));
  const endpoint = 'http://127.0.0.1:' + server.address().port + '/telefono';
  try {
    assert.equal(await push.iscrivi(null, { endpoint: 'ftp://no', keys: { p256dh: 'x', auth: 'y' } }), false);
    assert.equal(await push.iscrivi(null, { endpoint, keys: { p256dh: telefono.getPublicKey().toString('base64url'), auth } }), true);

    const cfg = await impostazioni();
    posta();
    const p = await P.prenota(cliente({ data: '2026-11-10', fascia: 'pomeriggio', nome: 'Marco', cognome: 'Bianchi' }), ctx);
    const esito = await avvisi.richiesta(p, cfg, SITO);
    assert.deepEqual(esito.avviso.push, { telefoni: 1, inviate: 1 });

    const r = ricevute[0];
    assert.equal(r.intestazioni['content-encoding'], 'aes128gcm');
    const chiaro = JSON.parse(ece.decrypt(r.corpo, { version: 'aes128gcm', privateKey: telefono, authSecret: auth }).toString('utf8'));
    assert.deepEqual(chiaro, { titolo: 'Nuova richiesta', corpo: 'Marco Bianchi, martedì 10 novembre, pomeriggio', url: '/gestione?richiesta=' + p.id, tag: 'richiesta-' + p.id });
    /* la firma VAPID è quella della chiave pubblica dichiarata */
    const m = /^vapid t=([^,]+), k=(.+)$/.exec(r.intestazioni.authorization);
    assert.equal(m[2], chiavi.publicKey);
    const [h, c, f] = m[1].split('.');
    const punto = Buffer.from(m[2], 'base64url');
    const pubblica = crypto.createPublicKey({ format: 'jwk', key: { kty: 'EC', crv: 'P-256', x: punto.subarray(1, 33).toString('base64url'), y: punto.subarray(33).toString('base64url') } });
    assert.equal(crypto.verify('sha256', Buffer.from(h + '.' + c), { key: pubblica, dsaEncoding: 'ieee-p1363' }, Buffer.from(f, 'base64url')), true);
    const dichiarato = JSON.parse(Buffer.from(c, 'base64url').toString('utf8'));
    assert.equal(dichiarato.sub, 'mailto:info@bagnarino.it');

    /* il telefono non riconosce più l'iscrizione: viene tolta */
    risposta = 410;
    assert.deepEqual(await push.inviaPush({ titolo: 'x', corpo: 'y' }), { telefoni: 1, inviate: 0 });
    assert.deepEqual(await push.inviaPush({ titolo: 'x', corpo: 'y' }), { telefoni: 0, inviate: 0 });
  } finally {
    server.close();
    E.impostaTrasporto(null);
    delete process.env.VAPID_PUBLIC_KEY; delete process.env.VAPID_PRIVATE_KEY; delete process.env.PUSH_PROVA;
  }
});

test('passaggio dal database precedente: le prenotazioni esistenti restano valide', async () => {
  const pg = new PGlite();
  /* tabelle come erano prima della prenotazione su richiesta */
  await pg.exec(`
    CREATE TABLE postazioni (id SERIAL PRIMARY KEY, nome TEXT NOT NULL, tipo TEXT NOT NULL DEFAULT 'flessibile' CHECK (tipo IN ('flessibile','fissa')), attiva BOOLEAN NOT NULL DEFAULT true);
    CREATE TABLE clienti (id SERIAL PRIMARY KEY, nome TEXT NOT NULL, cognome TEXT NOT NULL, email TEXT NOT NULL UNIQUE, telefono TEXT NOT NULL, piva_cf TEXT,
      consenso_marketing BOOLEAN NOT NULL DEFAULT false, creato_il TIMESTAMPTZ NOT NULL DEFAULT now());
    CREATE TABLE carnet (id SERIAL PRIMARY KEY, cliente_id INTEGER NOT NULL REFERENCES clienti(id), ingressi_totali INTEGER NOT NULL DEFAULT 10,
      ingressi_usati INTEGER NOT NULL DEFAULT 0, scadenza DATE, creato_il TIMESTAMPTZ NOT NULL DEFAULT now());
    CREATE TABLE prenotazioni (id SERIAL PRIMARY KEY, codice TEXT NOT NULL UNIQUE, cliente_id INTEGER NOT NULL REFERENCES clienti(id),
      pacchetto TEXT NOT NULL CHECK (pacchetto IN ('giornata','carnet','mese_flessibile','mese_fisso','sala')),
      data_inizio DATE NOT NULL, data_fine DATE NOT NULL, postazione_id INTEGER REFERENCES postazioni(id), prezzo_centesimi INTEGER NOT NULL DEFAULT 0,
      stato TEXT NOT NULL DEFAULT 'confermata' CHECK (stato IN ('confermata','annullata','presente','assente')),
      pagato BOOLEAN NOT NULL DEFAULT false, metodo_pagamento TEXT, note TEXT, origine JSONB, carnet_id INTEGER REFERENCES carnet(id),
      omaggio BOOLEAN NOT NULL DEFAULT false, promemoria_inviato BOOLEAN NOT NULL DEFAULT false, creato_il TIMESTAMPTZ NOT NULL DEFAULT now(),
      accettata BOOLEAN NOT NULL DEFAULT true);
    CREATE TABLE occupazioni (postazione_id INTEGER NOT NULL REFERENCES postazioni(id), data DATE NOT NULL,
      prenotazione_id INTEGER NOT NULL REFERENCES prenotazioni(id) ON DELETE CASCADE, PRIMARY KEY (postazione_id, data));
    CREATE TABLE chiusure (data DATE PRIMARY KEY, motivo TEXT);
    CREATE TABLE impostazioni (chiave TEXT PRIMARY KEY, valore JSONB NOT NULL, aggiornato_il TIMESTAMPTZ NOT NULL DEFAULT now());
    INSERT INTO postazioni (nome) SELECT 'Postazione ' || g FROM generate_series(1, 8) g;
    INSERT INTO clienti (nome, cognome, email, telefono) VALUES ('Anna', 'Vecchia', 'anna@esempio.it', '3470000001');
    INSERT INTO prenotazioni (codice, cliente_id, pacchetto, data_inizio, data_fine, postazione_id, prezzo_centesimi, accettata)
      VALUES ('BGN-AAAA', 1, 'giornata', '2026-11-04', '2026-11-04', 1, 2500, false);
    INSERT INTO occupazioni (postazione_id, data, prenotazione_id) VALUES (1, '2026-11-04', 1);
    INSERT INTO chiusure (data, motivo) VALUES ('2026-11-05', 'Ferie');
    INSERT INTO impostazioni (chiave, valore) VALUES ('config', '{"orari":{"apertura":"9:00","chiusura":"18:00","testoBreve":"Lun–Ven 9:00–18:00"},"postazioni":8}');
  `);
  db.impostaAdattatore(adattatore(pg));
  await db.assicuraSchema();

  /* la giornata già prenotata occupa mattina e pomeriggio e resta confermata */
  const occ = (await pg.query("SELECT fascia FROM occupazioni WHERE prenotazione_id = 1 ORDER BY fascia")).rows.map(r => r.fascia);
  assert.deepEqual(occ, ['mattina', 'pomeriggio']);
  assert.deepEqual((await pg.query('SELECT stato, fascia FROM prenotazioni WHERE id = 1')).rows[0], { stato: 'confermata', fascia: 'giornata' });
  let r = await P.disponibilita('2026-11-04', 2, 'giornata', ADESSO);
  assert.deepEqual(r.fasce['2026-11-04'], { mattina: 7, pomeriggio: 7, giornata: 7, nd: [] });
  /* la chiusura già inserita vale per tutto il giorno */
  assert.deepEqual(r.fasce['2026-11-05'].nd, ['mattina', 'pomeriggio', 'giornata']);
  /* le nuove richieste funzionano e il doppio posto resta impossibile */
  const nuova = await P.prenota(cliente({ data: '2026-11-04', fascia: 'mattina' }), ctx);
  assert.equal(nuova.stato, 'in_attesa');
  await assert.rejects(pg.query("INSERT INTO occupazioni (postazione_id, data, prenotazione_id, fascia) VALUES (1, '2026-11-04', 1, 'pomeriggio')"));
  /* un inserimento fatto dal codice di prima (senza fascia) è ancora accettato e ancora protetto */
  await pg.query("INSERT INTO occupazioni (postazione_id, data, prenotazione_id) VALUES (5, '2026-11-06', 1)");
  await assert.rejects(pg.query("INSERT INTO occupazioni (postazione_id, data, prenotazione_id) VALUES (5, '2026-11-06', 1)"));
  /* gli orari fissi salvati in passato non tornano nelle impostazioni */
  const cfg = await impostazioni();
  assert.equal(cfg.orari, undefined);
  assert.equal(cfg.apertura.testo, 'Aperto tutti i giorni su prenotazione');
  /* rifare il passaggio non cambia niente */
  await db.migra(adattatore(pg));
  assert.equal((await pg.query('SELECT COUNT(*)::int AS n FROM occupazioni WHERE prenotazione_id = 1')).rows[0].n, 3);
});
