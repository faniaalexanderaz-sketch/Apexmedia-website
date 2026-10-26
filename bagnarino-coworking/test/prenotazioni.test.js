/* =============================================================
   BAGNARINO COWORKING — test del motore di prenotazione
   Eseguire con: npm test
   Usa un Postgres vero ma in memoria (PGlite): stesso SQL del
   sito, nessun database esterno, nessuna email inviata.
   ============================================================= */
const test = require('node:test');
const assert = require('node:assert/strict');
const { PGlite } = require('@electric-sql/pglite');
const db = require('../api/_db');
const P = require('../api/_prenotazioni');

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
function cliente(extra) {
  n++;
  return Object.assign({
    pacchetto: 'giornata', data: '2026-11-04',
    nome: 'Prova', cognome: 'Cliente' + n, email: 'cliente' + n + '@esempio.it', telefono: '347 000 00' + String(n).padStart(2, '0'),
    consenso_privacy: true
  }, extra || {});
}
const ctx = { adesso: ADESSO };

test('disponibilità: weekend e festivi chiusi, giorni feriali con tutti i posti', async () => {
  await nuovoDb();
  const r = await P.disponibilita('2026-11-02', 14, 'giornata', ADESSO);
  assert.equal(r.postazioni, 8);
  assert.equal(r.giorni['2026-11-03'], 8);      // martedì
  assert.equal(r.giorni['2026-11-07'], 0);      // sabato
  assert.equal(r.giorni['2026-11-08'], 0);      // domenica
  const dic = await P.disponibilita('2026-12-07', 3, 'giornata', new Date('2026-12-01T08:00:00Z'));
  assert.equal(dic.giorni['2026-12-08'], 0);    // Immacolata
  assert.equal(dic.giorni['2026-12-09'], 8);
});

test('prenotazione: assegna un posto e lo toglie dalla disponibilità', async () => {
  await nuovoDb();
  const p = await P.prenota(cliente(), ctx);
  assert.match(p.codice, /^BGN-[A-Z0-9]{4}$/);
  assert.equal(p.prezzo, 2500);
  const r = await P.disponibilita('2026-11-04', 1, 'giornata', ADESSO);
  assert.equal(r.giorni['2026-11-04'], 7);
});

test('doppia prenotazione bloccata: con il giorno pieno la nona fallisce', async () => {
  await nuovoDb();
  for (let i = 0; i < 8; i++) await P.prenota(cliente({ data: '2026-11-05' }), ctx);
  await assert.rejects(P.prenota(cliente({ data: '2026-11-05' }), ctx), e => e.codice === 'POSTO_ESAURITO');
  const r = await P.disponibilita('2026-11-05', 1, 'giornata', ADESSO);
  assert.equal(r.giorni['2026-11-05'], 0);
});

test('doppia prenotazione bloccata anche con richieste nello stesso istante', async () => {
  await nuovoDb();
  for (let i = 0; i < 7; i++) await P.prenota(cliente({ data: '2026-11-06' }), ctx);
  const esiti = await Promise.allSettled([
    P.prenota(cliente({ data: '2026-11-06' }), ctx),
    P.prenota(cliente({ data: '2026-11-06' }), ctx)
  ]);
  assert.equal(esiti.filter(e => e.status === 'fulfilled').length, 1);
  assert.equal(esiti.filter(e => e.status === 'rejected' && e.reason.codice === 'POSTO_ESAURITO').length, 1);
});

test('la stessa persona non può occupare due scrivanie lo stesso giorno', async () => {
  await nuovoDb();
  const d = cliente({ data: '2026-11-10' });
  await P.prenota(d, ctx);
  await assert.rejects(P.prenota(Object.assign({}, d), ctx), e => e.codice === 'GIA_PRENOTATO');
  await assert.rejects(P.prenota(Object.assign({}, d, { pacchetto: 'mese_flessibile', data: '2026-11-09' }), ctx), e => e.codice === 'GIA_PRENOTATO');
});

test('il database rifiuta comunque due occupazioni dello stesso posto nello stesso giorno', async () => {
  const pg = await nuovoDb();
  const p = await P.prenota(cliente({ data: '2026-11-09' }), ctx);
  await assert.rejects(pg.query('INSERT INTO occupazioni (postazione_id, data, prenotazione_id) VALUES ($1, $2, $3)', [p.postazione, '2026-11-09', p.id]));
});

test('mese fisso: stessa scrivania per tutti i giorni di apertura del mese', async () => {
  const pg = await nuovoDb();
  const p = await P.prenota(cliente({ pacchetto: 'mese_fisso', data: '2026-11-03' }), ctx);
  assert.equal(p.data_fine, '2026-12-02');
  const occ = (await pg.query('SELECT DISTINCT postazione_id FROM occupazioni WHERE prenotazione_id = $1', [p.id])).rows;
  assert.equal(occ.length, 1);
  const giorni = (await pg.query('SELECT COUNT(*)::int AS n FROM occupazioni WHERE prenotazione_id = $1', [p.id])).rows[0].n;
  assert.equal(giorni, 22); /* giorni feriali dal 3/11 al 2/12 */
  const r = await P.disponibilita('2026-11-03', 1, 'mese_fisso', ADESSO);
  assert.equal(r.giorni['2026-11-03'], 7);
});

test('carnet: 10 ingressi, ogni giornata ne scala uno ed è già pagata', async () => {
  await nuovoDb();
  const dati = cliente({ pacchetto: 'carnet', data: '2026-11-03' });
  const c = await P.prenota(dati, ctx);
  assert.equal(c.prezzo, 20000);
  assert.equal(c.carnet.residui, 9);
  const g = await P.prenota(Object.assign({}, dati, { pacchetto: 'giornata', data: '2026-11-10' }), ctx);
  assert.equal(g.prezzo, 0);
  assert.equal(g.carnet.residui, 8);
  const v = await P.vantaggi(dati.email, dati.telefono, '2026-11-12');
  assert.equal(v.carnet.residui, 8);
  /* telefono sbagliato: nessun dato rivelato */
  const v2 = await P.vantaggi(dati.email, '333 999 9999', '2026-11-12');
  assert.equal(v2.carnet, null);
  /* annullare la giornata restituisce l'ingresso */
  await P.annulla(g.codice, dati.email, ADESSO);
  assert.equal((await P.vantaggi(dati.email, dati.telefono, '2026-11-12')).carnet.residui, 9);
});

test('fidelity: 10 giornate presenti = 1 omaggio, che si può usare', async () => {
  await nuovoDb();
  const base = cliente();
  const giorni = ['2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06', '2026-11-09', '2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13', '2026-11-16'];
  let ultimo;
  const sbloccati = [];
  for (const d of giorni) {
    const p = await P.prenota(Object.assign({}, base, { data: d }), ctx);
    ultimo = await P.segnaPresenza(p.id, 'presente');
    if (ultimo.premioSbloccato) sbloccati.push(ultimo.timbri + ':' + ultimo.premioSbloccato);
  }
  /* premi intermedi da consegnare in sede al 3°, 5° e 7° timbro */
  assert.deepEqual(sbloccati, ['3:25 stampe a colori gratis', '5:Porta un amico', '7:Sconto 10% in negozio']);
  assert.equal(ultimo.premio, true);
  assert.equal(ultimo.omaggi, 1);
  assert.equal(ultimo.timbri, 0);
  /* segnare di nuovo "presente" non regala timbri in più */
  const card0 = await P.card(base.email, (await P.prenota(Object.assign({}, base, { data: '2026-11-17' }), ctx)).codice);
  assert.equal(card0.omaggi, 1);
  const o = await P.prenota(Object.assign({}, base, { data: '2026-11-18', usa_omaggio: true }), ctx);
  assert.equal(o.omaggio, true);
  assert.equal(o.prezzo, 0);
  assert.equal((await P.vantaggi(base.email, base.telefono)).omaggi, 0);
});

test('annullamento: possibile fino alle 20:00 del giorno prima, poi rifiutato', async () => {
  await nuovoDb();
  const d = cliente({ data: '2026-11-12' });
  const p = await P.prenota(d, ctx);
  /* 11 novembre alle 20:30 (ora italiana = 19:30 UTC): troppo tardi */
  await assert.rejects(P.annulla(p.codice, d.email, new Date('2026-11-11T19:30:00Z')), e => e.codice === 'FUORI_TEMPO');
  /* 11 novembre alle 19:00: si può, e il posto torna libero */
  await P.annulla(p.codice, d.email, new Date('2026-11-11T18:00:00Z'));
  const r = await P.disponibilita('2026-11-12', 1, 'giornata', ADESSO);
  assert.equal(r.giorni['2026-11-12'], 8);
  await assert.rejects(P.annulla(p.codice, d.email, ADESSO), e => e.codice === 'GIA_FATTO');
  await assert.rejects(P.annulla(p.codice, 'altro@esempio.it', ADESSO), e => e.codice === 'NON_TROVATA');
});

test('protezioni: dati non validi, giorno chiuso, trappola anti-robot, limite per IP', async () => {
  const pg = await nuovoDb();
  await assert.rejects(P.prenota(cliente({ email: 'non-una-email' }), ctx), e => e.codice === 'DATI' && e.extra.campi.includes('email'));
  await assert.rejects(P.prenota(cliente({ consenso_privacy: false }), ctx), e => e.codice === 'DATI');
  await assert.rejects(P.prenota(cliente({ data: '2026-11-07' }), ctx), e => e.codice === 'DATA'); /* sabato */
  const finto = await P.prenota(cliente({ sito_web: 'http://spam' }), ctx);
  assert.equal(finto.finto, true);
  assert.equal((await pg.query('SELECT COUNT(*)::int AS n FROM prenotazioni')).rows[0].n, 0);
  for (let i = 0; i < 8; i++) await P.prenota(cliente({ data: i < 6 ? '2026-11-19' : '2026-11-20' }), { adesso: ADESSO, ip: '1.2.3.4' });
  await assert.rejects(P.prenota(cliente({ data: '2026-11-20' }), { adesso: ADESSO, ip: '1.2.3.4' }), e => e.codice === 'TROPPI');
});

test('richieste dal sito da accettare: online no, a mano sì, arrivo = accettata', async () => {
  await nuovoDb();
  const online = await P.prenota(cliente({ data: '2026-11-05' }), ctx);
  const banco = await P.prenota(cliente({ data: '2026-11-05' }), { adesso: ADESSO, manuale: true });
  const stato = async id => (await db.q('SELECT accettata FROM prenotazioni WHERE id = $1', [id]))[0].accettata;
  assert.equal(await stato(online.id), false);
  assert.equal(await stato(banco.id), true);
  await P.segnaPresenza(online.id, 'presente');
  assert.equal(await stato(online.id), true);
});

test('eliminare un cliente cancella prenotazioni, posti, carnet, card e incassi', async () => {
  await nuovoDb();
  const a = await P.prenota(cliente({ data: '2026-11-05', pacchetto: 'carnet' }), { adesso: ADESSO, manuale: true });
  const resta = await P.prenota(cliente({ data: '2026-11-05' }), { adesso: ADESSO, manuale: true });
  await db.q('UPDATE prenotazioni SET pagato = true, pagato_il = now() WHERE id = $1', [a.id]);
  const cid = (await db.q('SELECT cliente_id FROM prenotazioni WHERE id = $1', [a.id]))[0].cliente_id;
  const r = await P.eliminaCliente(cid);
  assert.equal(r.prenotazioni, 1);
  const conta = async (t, w, v) => (await db.q('SELECT COUNT(*)::int AS n FROM ' + t + ' WHERE ' + w, v))[0].n;
  assert.equal(await conta('clienti', 'id = $1', [cid]), 0);
  assert.equal(await conta('prenotazioni', 'cliente_id = $1', [cid]), 0);
  assert.equal(await conta('carnet', 'cliente_id = $1', [cid]), 0);
  assert.equal(await conta('occupazioni', 'prenotazione_id = $1', [a.id]), 0);
  assert.equal(await conta("eventi", "dati->>'codice' = $1", [a.codice]), 0);
  /* l'altro cliente resta com'era */
  assert.equal(await conta('prenotazioni', 'id = $1', [resta.id]), 1);
  await assert.rejects(P.eliminaCliente(cid), /non trovato/i);
});

test('email per far tornare i clienti: grazie, ci manchi, carnet, rinnovo — una volta sola', async () => {
  await nuovoDb();
  const F = require('../api/_fidelizzazione');
  const { impostazioni } = require('../api/_impostazioni');
  const cfg = await impostazioni();
  const inviate = [];
  const invia = m => { inviate.push(m); return Promise.resolve({ inviata: true }); };
  const sposta = async (id, da, a) => {
    await db.q('UPDATE prenotazioni SET data_inizio = $2, data_fine = $3 WHERE id = $1', [id, da, a]);
    await db.q('UPDATE occupazioni SET data = $2 WHERE prenotazione_id = $1', [id, da]);
  };
  const banco = { adesso: ADESSO, manuale: true };

  /* prima visita oggi (2 novembre) → grazie */
  const a = await P.prenota(cliente({ data: '2026-11-02' }), banco);
  await P.segnaPresenza(a.id, 'presente');
  /* ultima visita 25 giorni fa, con consenso → ci manchi; senza consenso → niente */
  const b = await P.prenota(cliente({ data: '2026-11-04', consenso_marketing: true }), banco);
  await sposta(b.id, '2026-10-08', '2026-10-08'); await P.segnaPresenza(b.id, 'presente');
  const b2 = await P.prenota(cliente({ data: '2026-11-04' }), banco);
  await sposta(b2.id, '2026-10-09', '2026-10-09'); await P.segnaPresenza(b2.id, 'presente');
  /* carnet con ingressi residui che scade tra 10 giorni */
  const k = await P.prenota(cliente({ data: '2026-11-05', pacchetto: 'carnet' }), banco);
  await db.q("UPDATE carnet SET scadenza = '2026-11-12' WHERE id = (SELECT carnet_id FROM prenotazioni WHERE id = $1)", [k.id]);
  /* mese che finisce tra 3 giorni */
  const m = await P.prenota(cliente({ data: '2026-11-03', pacchetto: 'mese_flessibile' }), banco);
  await db.q("UPDATE prenotazioni SET data_fine = '2026-11-05' WHERE id = $1", [m.id]);

  const r = await F.inviaFidelizzazione(cfg, 'https://esempio.it', invia, ADESSO);
  assert.deepEqual(r, { grazie: 1, ciManchi: 1, carnet: 1, rinnovo: 1 });
  assert.ok(inviate.some(x => /primo timbro/.test(x.subject)));
  assert.ok(inviate.some(x => /disiscrivi/.test(x.html)));
  assert.ok(inviate.some(x => /pacchetto=mese_flessibile&amp;data=2026-11-06/.test(x.html)));

  /* il giorno dopo non riparte niente */
  const r2 = await F.inviaFidelizzazione(cfg, 'https://esempio.it', invia, new Date('2026-11-03T08:00:00Z'));
  assert.deepEqual(r2, { grazie: 0, ciManchi: 0, carnet: 0, rinnovo: 0 });

  /* il link per disiscriversi funziona solo con la firma giusta */
  const idB = (await db.q('SELECT cliente_id FROM prenotazioni WHERE id = $1', [b.id]))[0].cliente_id;
  const link = new URL(F.linkDisiscrivi('https://esempio.it', idB));
  assert.equal(await F.disiscrivi(idB, 'sbagliata'), false);
  assert.equal(await F.disiscrivi(idB, link.searchParams.get('t')), true);
  assert.equal((await db.q('SELECT consenso_marketing FROM clienti WHERE id = $1', [idB]))[0].consenso_marketing, false);
});
