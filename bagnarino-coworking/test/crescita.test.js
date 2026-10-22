/* =============================================================
   BAGNARINO COWORKING — test della scheda "Crescita"
   Numeri di marketing inseriti a mano (validazione e salvataggio),
   numeri automatici mese per mese, frase riassuntiva e permessi:
   la titolare legge, solo Apex Media modifica.
   ============================================================= */
const test = require('node:test');
const assert = require('node:assert/strict');
const { PGlite } = require('@electric-sql/pglite');
const db = require('../api/_db');
const P = require('../api/_prenotazioni');
const G = require('../api/_crescita');

/* lunedì 2 novembre 2026, 9:00 a Roma */
const ADESSO = new Date('2026-11-02T08:00:00Z');

async function nuovoDb() {
  const pg = new PGlite();
  db.impostaAdattatore({
    query: (t, v) => pg.query(t, v || []).then(r => r.rows),
    transazione: (lavoro) => pg.transaction(tx => lavoro((t, v) => tx.query(t, v || []).then(r => r.rows)))
  });
  await db.assicuraSchema();
  return pg;
}

let n = 0;
async function prenota(email, data, creato, origine) {
  n++;
  const p = await P.prenota({
    pacchetto: 'giornata', data, nome: 'Prova', cognome: 'C' + n, email, telefono: '347 100 00' + String(n).padStart(2, '0'),
    consenso_privacy: true, origine: origine || {}
  }, { adesso: ADESSO });
  /* la data di creazione decide il mese in cui la prenotazione conta */
  await db.q('UPDATE prenotazioni SET creato_il = $2 WHERE codice = $1', [p.codice, creato + 'T10:00:00Z']);
  await db.q('UPDATE clienti SET creato_il = LEAST(creato_il, $2) WHERE email = $1', [email, creato + 'T10:00:00Z']);
  return p;
}

test('marketing: numeri all’italiana, campi vuoti ignorati, errori chiari', () => {
  const v = G.validaMarketing({ mese: '2026-10', dati: { instagram_follower: '1.234', recensioni_media: '4,6', spesa_meta: '€ 49,90', visite_sito: '' }, note: '  Campagna studenti  ' }, ADESSO);
  assert.equal(v.mese, '2026-10-01');
  assert.deepEqual(v.dati, { instagram_follower: 1234, recensioni_media: 4.6, spesa_meta: 49.9 });
  assert.equal(v.note, 'Campagna studenti');
  assert.throws(() => G.validaMarketing({ mese: '2026-10', dati: { instagram_follower: -3 } }, ADESSO), /Follower Instagram/);
  assert.throws(() => G.validaMarketing({ mese: '2026-10', dati: { recensioni_media: 6 } }, ADESSO), /Voto medio/);
  assert.throws(() => G.validaMarketing({ mese: '2026-10', dati: { google_chiamate: 'tante' } }, ADESSO), /Chiamate/);
  assert.throws(() => G.validaMarketing({ mese: '2026-12', dati: {} }, ADESSO), /Mese non valido/);
  assert.throws(() => G.validaMarketing({ mese: '2026-10', dati: {}, note: 'x'.repeat(1001) }, ADESSO), /nota/);
});

test('marketing: un solo record per mese, il secondo salvataggio sostituisce il primo', async () => {
  await nuovoDb();
  await G.salvaMarketing({ mese: '2026-10', dati: { instagram_follower: 120, facebook_follower: 80 }, note: 'Prima' }, ADESSO);
  const r = await G.salvaMarketing({ mese: '2026-10-01', dati: { instagram_follower: 138 }, note: '' }, ADESSO);
  assert.deepEqual(r.dati, { instagram_follower: 138 });
  assert.equal(r.note, null);
  const righe = await db.q('SELECT COUNT(*)::int AS n FROM marketing_mesi');
  assert.equal(righe[0].n, 1);
});

test('crescita: numeri automatici del mese, clienti che tornano, canali e frase riassuntiva', async () => {
  await nuovoDb();
  /* settembre: 2 prenotazioni (Anna da Instagram, Bruno diretto) */
  await prenota('anna@esempio.it', '2026-11-03', '2026-09-10', { utm_source: 'instagram' });
  await prenota('bruno@esempio.it', '2026-11-03', '2026-09-12');
  /* ottobre: Anna torna (Instagram), Carla da Facebook, Dario diretto; una annullata non conta */
  await prenota('anna@esempio.it', '2026-11-04', '2026-10-05', { utm_source: 'instagram' });
  const carla = await prenota('carla@esempio.it', '2026-11-04', '2026-10-06', { utm_source: 'facebook' });
  await prenota('dario@esempio.it', '2026-11-05', '2026-10-07');
  const ann = await prenota('elena@esempio.it', '2026-11-05', '2026-10-08');
  await db.q("UPDATE prenotazioni SET stato = 'annullata' WHERE codice = $1", [ann.codice]);
  await db.q("UPDATE prenotazioni SET stato = 'presente', pagato = true, pagato_il = '2026-10-20T10:00:00Z' WHERE codice = $1", [carla.codice]);
  await G.salvaMarketing({ mese: '2026-09', dati: { instagram_follower: 100 } }, ADESSO);
  await G.salvaMarketing({ mese: '2026-10', dati: { instagram_follower: 138, instagram_copertura: 4000, visite_sito: 300, spesa_meta: 50, google_chiamate: 4, google_indicazioni: 6 }, note: 'Post sulle stampanti' }, ADESSO);

  const c = await G.crescita('2026-10', ADESSO);
  assert.equal(c.mese, '2026-10-01');
  assert.equal(c.mesi.length, 12);
  assert.equal(c.mesi[0].mese, '2025-11-01');
  const ott = c.mesi[11];
  assert.equal(ott.prenotazioni, 3);
  assert.equal(ott.clienti, 3);
  assert.equal(ott.ritorni, 1);
  assert.equal(ott.quotaRitorni, 33);
  assert.equal(ott.presenti, 1);
  assert.equal(ott.incassato, 2500);
  assert.deepEqual(ott.canali, { Instagram: 1, Facebook: 1, Diretto: 1 });
  assert.equal(c.kpi.prenotazioni.prima, 2);
  assert.deepEqual(c.kpi.followerInstagram, { valore: 138, prima: 100 });
  assert.equal(c.kpi.azioniGoogle.valore, 10);
  /* €50 di pubblicità ÷ 3 prenotazioni = €16,67 a prenotazione */
  assert.equal(c.kpi.costoPrenotazione.valore, 1667);
  /* Instagram + Facebook hanno portato €50 di prenotazioni su €50 spesi */
  assert.equal(c.kpi.ritornoPubblicita.valore, 1);
  assert.match(c.riassunto, /^Ottobre: 3 prenotazioni, \+50% rispetto a settembre\./);
  assert.match(c.riassunto, /Instagram \+38 follower\./);
  assert.match(c.riassunto, /Ogni €1 speso in pubblicità ha portato €1,00 di prenotazioni\./);
  assert.deepEqual(c.imbuto.map(x => [x.nome, x.valore, x.quota]), [
    ['Persone raggiunte sui social', 4000, null], ['Visite al sito', 300, 7.5], ['Prenotazioni', 3, 1], ['Arrivati in sede', 1, 33.3]
  ]);
  assert.equal(c.note, 'Post sulle stampanti');

  /* mese senza dati di marketing: la frase parla solo di prenotazioni */
  const ago = await G.crescita('2026-08', ADESSO);
  assert.equal(ago.riassunto, 'Agosto: ancora nessuna prenotazione.');
  assert.equal(ago.marketing, null);
});

/* ---------- permessi: chiamate vere alla funzione /api/admin ---------- */
function chiama(handler, metodo, azione, corpo, cookie) {
  return new Promise(ok => {
    const res = {
      intestazioni: {}, statusCode: 200,
      setHeader(k, v) { this.intestazioni[k.toLowerCase()] = v; }, getHeader(k) { return this.intestazioni[k.toLowerCase()]; },
      end(b) { ok({ stato: this.statusCode, dati: b ? JSON.parse(b) : null, cookie: (this.intestazioni['set-cookie'] || '').split(';')[0] }); }
    };
    handler({ method: metodo, query: { azione }, headers: { host: 'localhost', cookie: cookie || '' }, body: corpo || {} }, res);
  });
}

test('permessi: la titolare legge Crescita ma non può modificare i numeri di marketing; Apex sì', async () => {
  await nuovoDb();
  process.env.ADMIN_PASSWORD = 'marcella-segreta';
  process.env.APEX_PASSWORD = 'apex-segreta';
  const admin = require('../api/admin');

  const t = await chiama(admin, 'POST', 'login', { password: 'marcella-segreta' });
  assert.equal(t.stato, 200); assert.equal(t.dati.ruolo, 'titolare');
  const a = await chiama(admin, 'POST', 'login', { password: 'apex-segreta' });
  assert.equal(a.dati.ruolo, 'apex');
  assert.notEqual(t.cookie, a.cookie);
  assert.equal((await chiama(admin, 'POST', 'login', { password: 'sbagliata' })).stato, 401);

  assert.equal((await chiama(admin, 'GET', 'chi', null, t.cookie)).dati.ruolo, 'titolare');
  const lettura = await chiama(admin, 'GET', 'crescita', null, t.cookie);
  assert.equal(lettura.stato, 200); assert.equal(lettura.dati.ruolo, 'titolare');

  const vietato = await chiama(admin, 'POST', 'marketing', { mese: '2026-10', dati: { instagram_follower: 5 } }, t.cookie);
  assert.equal(vietato.stato, 403);
  const salvato = await chiama(admin, 'POST', 'marketing', { mese: '2026-10', dati: { instagram_follower: 5 } }, a.cookie);
  assert.equal(salvato.stato, 200); assert.deepEqual(salvato.dati.dati, { instagram_follower: 5 });
  assert.equal((await chiama(admin, 'POST', 'marketing', { mese: '2026-10', dati: { instagram_follower: -1 } }, a.cookie)).stato, 400);

  /* senza APEX_PASSWORD l'accesso Apex non esiste e il vecchio cookie non vale più */
  delete process.env.APEX_PASSWORD;
  assert.equal((await chiama(admin, 'POST', 'login', { password: 'apex-segreta' })).stato, 401);
  assert.equal((await chiama(admin, 'GET', 'chi', null, a.cookie)).stato, 401);
  /* la sessione della titolare resta valida */
  assert.equal((await chiama(admin, 'GET', 'chi', null, t.cookie)).stato, 200);
  delete process.env.ADMIN_PASSWORD;
});
