/* =============================================================
   BAGNARINO COWORKING — test dell'app di gestione (/gestione)
   Accesso, sessione di 90 giorni, recupero password, protezione
   lato server di pagine e azioni, chiusure, scuse, avviso, foto,
   contatti, "Come va". Database in memoria, email catturate.
   ============================================================= */
const test = require('node:test');
const assert = require('node:assert/strict');
const { PGlite } = require('@electric-sql/pglite');
const db = require('../api/_db');
const P = require('../api/_prenotazioni');
const E = require('../api/_email');
const A = require('../api/_accesso');
const G = require('../api/_gestione');
const { impostazioni } = require('../api/_impostazioni');

process.env.NOTIFICATION_EMAIL = 'info@bagnarino.it';
process.env.ADMIN_PASSWORD = 'la-password-di-prima';
process.env.LINK_SECRET = 'segreto-solo-per-i-test';
const gestione = require('../api/gestione');

const ADESSO = new Date('2026-11-02T08:00:00Z');   /* lunedì 2 novembre 2026, 9:00 a Roma */
const SITO = 'https://esempio.it';

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
  return Object.assign({ pacchetto: 'giornata', data: '2026-11-04', nome: 'Prova', cognome: 'Cliente' + n,
    email: 'cliente' + n + '@esempio.it', telefono: '347 000 02' + String(n).padStart(2, '0'), consenso_privacy: true }, extra || {});
}
function posta() { const lista = []; E.impostaTrasporto(m => { lista.push(m); }); return lista; }

/* una chiamata alla funzione api/gestione.js, come la farebbe Vercel */
function chiama(metodo, query, corpo, intestazioni) {
  return new Promise((ok) => {
    const req = { method: metodo, query: query || {}, body: corpo || {}, headers: Object.assign({ host: 'esempio.it', 'x-forwarded-for': '9.9.9.' + (n++ % 250) }, intestazioni || {}) };
    const res = {
      statusCode: 200, intestazioni: {},
      setHeader(k, v) { this.intestazioni[k.toLowerCase()] = v; }, getHeader(k) { return this.intestazioni[k.toLowerCase()]; },
      end(b) { let json = null; try { json = JSON.parse(b); } catch (e) { /* pagina html */ } ok({ stato: this.statusCode, intestazioni: this.intestazioni, testo: b || '', json }); }
    };
    gestione(req, res);
  });
}
const APP = { 'x-bgn-app': '1' };
function cookieDi(r) { return String(r.intestazioni['set-cookie'] || '').split(';')[0]; }
async function entra() {
  const r = await chiama('POST', { azione: 'accedi' }, { email: 'info@bagnarino.it', password: 'la-password-di-prima' }, APP);
  assert.equal(r.stato, 200);
  return Object.assign({ cookie: cookieDi(r) }, APP);
}

test('accesso: nasce l’utente della titolare, la password si scrive anche "come viene" dal telefono', async () => {
  await nuovoDb();
  let r = await chiama('POST', { azione: 'accedi' }, { email: 'info@bagnarino.it', password: 'sbagliata' }, APP);
  assert.equal(r.stato, 401);
  assert.equal(r.intestazioni['set-cookie'], undefined);
  r = await chiama('POST', { azione: 'accedi' }, { email: 'altra@esempio.it', password: 'la-password-di-prima' }, APP);
  assert.equal(r.stato, 401);
  /* maiuscola iniziale, spazio in coda e trattino lungo: la tastiera del telefono */
  r = await chiama('POST', { azione: 'accedi' }, { email: ' Info@Bagnarino.it ', password: 'La–password-di-prima ' }, APP);
  assert.equal(r.stato, 200);
  const cookie = r.intestazioni['set-cookie'];
  assert.match(cookie, /^bgn_gestione=[A-Za-z0-9_-]{40,}; HttpOnly; Path=\/; Max-Age=7776000; SameSite=Lax; Secure$/);   /* 90 giorni */
  /* nel database c'è solo l'impronta del gettone e della password */
  const u = (await db.q('SELECT email, nome, password_hash FROM utenti'))[0];
  assert.deepEqual([u.email, u.nome], ['info@bagnarino.it', 'Marcella']);
  assert.match(u.password_hash, /^scrypt\$/);
  const s = (await db.q('SELECT token_hash, scade_il > now() + interval \'89 days\' AS lunga FROM sessioni'))[0];
  assert.equal(s.lunga, true);
  assert.ok(cookie.indexOf(s.token_hash) === -1);
});

test('protezione lato server: senza sessione nessuna pagina dell’app e nessun dato', async () => {
  await nuovoDb();
  let r = await chiama('GET', { pagina: 'app' });
  assert.deepEqual([r.stato, r.intestazioni.location], [302, '/gestione/accedi']);
  r = await chiama('GET', { pagina: 'qualunque-cosa' });
  assert.equal(r.stato, 302);
  r = await chiama('GET', { pagina: 'app', richiesta: '12' });
  assert.equal(r.intestazioni.location, '/gestione/accedi?richiesta=12');
  for (const azione of ['oggi', 'calendario', 'giorno', 'prenotazioni', 'prenotazione', 'sito', 'come-va']) {
    r = await chiama('GET', { azione });
    assert.equal(r.stato, 401, azione);
  }
  for (const azione of ['rispondi', 'annulla', 'arrivo', 'chiudi', 'scuse', 'avviso', 'contatti', 'foto-aggiungi', 'foto-togli', 'foto-ordine', 'push-iscrivi', 'esci']) {
    r = await chiama('POST', { azione }, { id: 1 }, APP);
    assert.equal(r.stato, 401, azione);
  }
  /* le pagine pubbliche restano raggiungibili */
  assert.equal((await chiama('GET', { pagina: 'accedi' })).stato, 200);
  assert.equal((await chiama('GET', { pagina: 'installa' })).stato, 200);
  assert.equal((await chiama('GET', { pagina: 'password' })).stato, 200);
  /* con la sessione l'app viene servita, e non resta in memoria da nessuna parte */
  const io = await entra();
  r = await chiama('GET', { pagina: 'app' }, null, io);
  assert.equal(r.stato, 200);
  assert.match(r.testo, /data-nome="Marcella"/);
  assert.equal(r.intestazioni['cache-control'], 'no-store');
  assert.equal((await chiama('GET', { pagina: 'accedi' }, null, io)).intestazioni.location, '/gestione');
  /* un cookie inventato non vale; un altro sito non può far partire azioni */
  assert.equal((await chiama('GET', { azione: 'oggi' }, null, { cookie: 'bgn_gestione=' + 'x'.repeat(43) })).stato, 401);
  assert.equal((await chiama('POST', { azione: 'avviso' }, { attivo: true, testo: 'ciao' }, { cookie: io.cookie })).stato, 403);
  /* uscita */
  assert.equal((await chiama('POST', { azione: 'esci' }, {}, io)).stato, 200);
  assert.equal((await chiama('GET', { azione: 'oggi' }, null, io)).stato, 401);
});

test('recupero password: link via email, vale un’ora e una volta sola, fa uscire gli altri telefoni', async () => {
  await nuovoDb();
  const inviate = posta();
  const vecchio = await entra();
  /* email sconosciuta: stessa risposta, nessuna email */
  let r = await chiama('POST', { azione: 'recupero' }, { email: 'nessuno@esempio.it' }, APP);
  assert.deepEqual([r.stato, inviate.length], [200, 0]);
  r = await chiama('POST', { azione: 'recupero' }, { email: 'info@bagnarino.it' }, APP);
  assert.deepEqual([r.stato, inviate.length, inviate[0].to], [200, 1, 'info@bagnarino.it']);
  const t = /\/gestione\/password\?t=([A-Za-z0-9_-]+)/.exec(inviate[0].html)[1];
  assert.match((await chiama('GET', { pagina: 'password', t })).testo, /Scegli la nuova password/);
  assert.match((await chiama('GET', { pagina: 'password', t: 'inventato' })).testo, /non vale più/);
  r = await chiama('POST', { azione: 'nuova-password' }, { token: t, password: 'corta' }, APP);
  assert.equal(r.stato, 400);
  r = await chiama('POST', { azione: 'nuova-password' }, { token: t, password: 'una frase facile da ricordare' }, APP);
  assert.equal(r.stato, 200);
  const nuovo = Object.assign({ cookie: cookieDi(r) }, APP);
  assert.equal((await chiama('GET', { azione: 'oggi' }, null, nuovo)).stato, 200);
  assert.equal((await chiama('GET', { azione: 'oggi' }, null, vecchio)).stato, 401);
  assert.equal((await chiama('POST', { azione: 'nuova-password' }, { token: t, password: 'un’altra frase lunga' }, APP)).stato, 410);
  assert.equal((await chiama('POST', { azione: 'accedi' }, { email: 'info@bagnarino.it', password: 'la-password-di-prima' }, APP)).stato, 401);
  assert.equal((await chiama('POST', { azione: 'accedi' }, { email: 'info@bagnarino.it', password: 'Una frase facile da ricordare' }, APP)).stato, 200);
  /* un link scaduto non vale */
  await chiama('POST', { azione: 'recupero' }, { email: 'info@bagnarino.it' }, APP);
  const t2 = /\/gestione\/password\?t=([A-Za-z0-9_-]+)/.exec(inviate[1].html)[1];
  await db.q("UPDATE recuperi SET scade_il = now() - interval '1 minute' WHERE NOT usato");
  assert.equal(await A.recuperoValido(t2), null);
  E.impostaTrasporto(null);
});

test('chiusure dall’app: giorno, mezza giornata, più giorni di fila, e chi aveva già un posto', async () => {
  await nuovoDb();
  let cfg = await impostazioni();
  const inviate = posta();
  const confermata = await P.prenota(cliente({ data: '2026-11-05', fascia: 'mattina', nome: 'Anna' }), { adesso: ADESSO });
  await P.rispondi(confermata.id, 'conferma');
  const inAttesa = await P.prenota(cliente({ data: '2026-11-05', fascia: 'giornata', nome: 'Bruno' }), { adesso: ADESSO });
  const pomeriggio = await P.prenota(cliente({ data: '2026-11-05', fascia: 'pomeriggio', nome: 'Carla' }), { adesso: ADESSO });
  const abbonato = await P.prenota(cliente({ pacchetto: 'mese_flessibile', data: '2026-11-03', nome: 'Dario' }), { adesso: ADESSO, manuale: true });

  /* chiudere la mattina tocca solo chi aveva la mattina (o la giornata intera) */
  let r = await G.chiudi('2026-11-05', null, 'mattina', cfg, ADESSO);
  assert.deepEqual(r.coinvolte.map(p => p.soloNome).sort(), ['Anna', 'Bruno']);
  assert.deepEqual(r.abbonati.map(p => p.soloNome), ['Dario']);
  cfg = await impostazioni();
  assert.equal((await G.giorno('2026-11-05', cfg, ADESSO)).chiusura, 'mattina');
  let disp = await P.disponibilita('2026-11-05', 1, 'giornata', ADESSO);
  assert.deepEqual(disp.fasce['2026-11-05'].nd, ['mattina', 'giornata']);

  /* le scuse: la confermata riceve le scuse, la richiesta in attesa "non disponibile"; l'abbonato resta */
  const fatte = await G.mandaScuse(r.coinvolte.map(p => p.id), cfg, SITO);
  assert.equal(fatte.fatte, 2);
  const perCliente = oggetto => inviate.filter(m => m.to !== 'info@bagnarino.it' && oggetto.test(m.subject)).length;
  assert.equal(perCliente(/^Ci scusiamo/), 1);
  assert.equal(perCliente(/scegli un altro momento$/), 1);
  assert.deepEqual((await db.q('SELECT stato FROM prenotazioni WHERE id = ANY($1::int[]) ORDER BY id', [[confermata.id, inAttesa.id, pomeriggio.id, abbonato.id]])).map(x => x.stato),
    ['annullata', 'annullata', 'in_attesa', 'confermata']);

  /* tutto il giorno, poi di nuovo aperto */
  r = await G.chiudi('2026-11-05', null, 'giorno', cfg, ADESSO);
  assert.deepEqual(r.coinvolte.map(p => p.soloNome), ['Carla']);
  cfg = await impostazioni();
  assert.equal((await G.oggi(cfg, new Date('2026-11-05T08:00:00Z'))).chiusura, 'giorno');
  await G.chiudi('2026-11-05', null, 'aperto', cfg, ADESSO);
  cfg = await impostazioni();
  assert.equal((await G.giorno('2026-11-05', cfg, ADESSO)).chiusura, null);

  /* dal ... al ... */
  r = await G.chiudi('2026-12-24', '2026-12-27', 'giorno', cfg, ADESSO);
  assert.equal(r.giorni, 4);
  cfg = await impostazioni();
  const mese = await G.calendario('2026-12', cfg, ADESSO);
  assert.deepEqual(mese.giorni.filter(g => g.chiusura === 'giorno').map(g => g.data), ['2026-12-24', '2026-12-25', '2026-12-26', '2026-12-27']);
  assert.equal(mese.giorni.find(g => g.data === '2026-12-25').festa, true);
  assert.equal(mese.primoGiornoSettimana, 1);   /* il primo dicembre 2026 è martedì */
  /* errori detti con parole semplici */
  await assert.rejects(G.chiudi('2026-12-27', '2026-12-24', 'giorno', cfg, ADESSO), e => e.codice === 'DATI');
  await assert.rejects(G.chiudi('2026-10-01', null, 'giorno', cfg, ADESSO), e => e.codice === 'DATI' && /già passato/.test(e.message));
  await assert.rejects(G.chiudi('2026-12-24', null, 'sera', cfg, ADESSO), e => e.codice === 'DATI');
  E.impostaTrasporto(null);
});

test('Oggi e Prenotazioni: richieste in attesa, arrivi in ordine di orario, elenco in tre parti', async () => {
  await nuovoDb();
  const cfg = await impostazioni();
  const adesso = { adesso: ADESSO, manuale: true };
  await P.prenota(cliente({ data: '2026-11-02', fascia: 'pomeriggio', nome: 'Pomeriggio', cognome: 'Tre' }), adesso);
  await P.prenota(cliente({ data: '2026-11-02', fascia: 'giornata', nome: 'Giornata', cognome: 'Due' }), adesso);
  await P.prenota(cliente({ data: '2026-11-02', fascia: 'mattina', nome: 'Mattina', cognome: 'Uno' }), adesso);
  const attesa = await P.prenota(cliente({ data: '2026-11-06', fascia: 'mattina', nome: 'Attesa', telefono: '0039 347 555 6677' }), { adesso: ADESSO });
  const o = await G.oggi(cfg, ADESSO);
  assert.deepEqual(o.arrivi.map(p => p.soloNome), ['Mattina', 'Giornata', 'Pomeriggio']);
  assert.deepEqual(o.inAttesa.map(p => [p.soloNome, p.quando, p.cosa, p.prezzo]), [['Attesa', 'venerdì 6 novembre, mattina', 'Mattina', '€12 da pagare in sede']]);
  /* i numeri sono già pronti per "Chiama" e "Scrivi su WhatsApp" */
  assert.deepEqual([o.inAttesa[0].telefonoLink, o.inAttesa[0].whatsapp], ['+393475556677', '393475556677']);
  const no = await P.prenota(cliente({ data: '2026-11-07', nome: 'Rifiutata' }), { adesso: ADESSO });
  await P.rispondi(no.id, 'non_disponibile');
  const elenco = await G.prenotazioni(cfg, ADESSO);
  assert.deepEqual(elenco.daConfermare.map(p => p.id), [attesa.id]);
  assert.equal(elenco.confermate.length, 3);
  assert.deepEqual(elenco.passate.map(p => [p.soloNome, p.motivo]), [['Rifiutata', 'non_disponibile']]);
  const scheda = await G.prenotazione(attesa.id, cfg, ADESSO);
  assert.deepEqual([scheda.stato, scheda.puoSegnareArrivo], ['in_attesa', false]);
});

test('Il mio sito: solo contenuti (avviso, telefono, foto), mai prezzi o disegno', async () => {
  const pg = await nuovoDb();
  let cfg = await impostazioni();
  assert.deepEqual(G.sito(cfg).foto.map(f => f.id), ['base-1', 'base-2']);
  assert.equal(G.sito(cfg).avviso.attivo, false);

  /* avviso */
  await assert.rejects(G.salvaAvviso({ attivo: true, testo: '   ' }), e => e.codice === 'DATI');
  const a = await G.salvaAvviso({ attivo: true, testo: '  Da lunedì   nuova sala.  ' + 'x'.repeat(300) });
  assert.equal(a.testo.length, 160);
  assert.match(a.testo, /^Da lunedì nuova sala\. x/);
  cfg = await impostazioni();
  assert.equal(cfg.avviso.attivo, true);

  /* telefono e WhatsApp */
  await assert.rejects(G.salvaContatti({ telefono: 'abc', whatsapp: '3471234567' }), e => e.codice === 'DATI');
  await assert.rejects(G.salvaContatti({ telefono: '3471234567', whatsapp: '0131444845' }), e => /WhatsApp/.test(e.message));
  await G.salvaContatti({ telefono: '+39 333 111 2233', whatsapp: '333.111.2233' });
  cfg = await impostazioni();
  assert.deepEqual(cfg.contatti, { cellulareVisibile: '333 111 2233', cellulare: '+393331112233', whatsapp: '393331112233' });

  /* foto: accettate solo immagini vere, già ridotte */
  const jpeg = Buffer.concat([Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]), Buffer.alloc(400, 7)]).toString('base64');
  await assert.rejects(G.aggiungiFoto({ grande: Buffer.from('<script>alert(1)</script>'.repeat(20)).toString('base64'), piccola: jpeg }), e => e.codice === 'DATI');
  await assert.rejects(G.aggiungiFoto({ grande: Buffer.concat([Buffer.from([0xFF, 0xD8, 0xFF]), Buffer.alloc(1600000)]).toString('base64'), piccola: jpeg }), e => e.codice === 'DATI');
  const f = await G.aggiungiFoto({ grande: jpeg, piccola: jpeg, larghezza: 1440, altezza: 1080 });
  cfg = await impostazioni();
  assert.deepEqual(cfg.galleria.map(x => x.id), ['base-1', 'base-2', f.id]);
  assert.equal(cfg.galleria[2].p, '/api/foto?id=' + f.id + '&t=p');
  const letta = await G.leggiFoto(f.id, 'g');
  assert.deepEqual([letta.tipo, letta.dati.length], ['image/jpeg', 404]);
  assert.equal(await G.leggiFoto("x' OR 1=1 --", 'g'), null);
  /* ordine e rimozione */
  await G.ordinaFoto([f.id, 'base-2', 'base-1']);
  await assert.rejects(G.ordinaFoto([f.id, 'base-2']), e => e.codice === 'DATI');
  await G.togliFoto('base-2');
  await G.togliFoto(f.id);
  assert.equal((await pg.query('SELECT COUNT(*)::int AS n FROM foto')).rows[0].n, 0);
  await assert.rejects(G.togliFoto('base-1'), e => /almeno una foto/.test(e.message));
  cfg = await impostazioni();
  assert.deepEqual(cfg.galleria.map(x => x.id), ['base-1']);
  /* prezzi, postazioni e listino non sono stati toccati, e dall'app non esiste un'azione per farlo */
  assert.deepEqual([cfg.listino[0].prezzo, cfg.postazioni, cfg.prezzoMezzaGiornata], [25, 8, 12]);
  const io = await entra();
  assert.equal((await chiama('POST', { azione: 'impostazioni' }, { listino: [{ id: 'giornata', prezzo: 1 }] }, io)).stato, 404);
});

test('Come va: tre numeri', async () => {
  await nuovoDb();
  const oggi = new Date();
  const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const vuoto = await G.comeVa();
  assert.deepEqual([vuoto.prenotazioni, vuoto.persone, vuoto.giorniPiuRichiesti], [0, 0, '']);
  const stesso = cliente({ data: iso(oggi) });
  const a = await P.prenota(stesso, { manuale: true });
  await P.prenota(cliente({ data: iso(oggi) }), { manuale: true });
  await P.prenota(cliente({ data: iso(new Date(Date.now() + 2 * 864e5)) }), {});   /* una richiesta in attesa non è ancora una prenotazione */
  await P.segnaPresenza(a.id, 'presente');
  const r = await G.comeVa();
  assert.deepEqual([r.prenotazioni, r.persone], [2, 2]);
  /* il giorno più richiesto è oggi (due prenotazioni); al secondo posto quello della richiesta in attesa */
  const nomeOggi = oggi.toLocaleDateString('it-IT', { weekday: 'long' }).replace(/^./, c => c.toUpperCase());
  assert.ok(r.giorniPiuRichiesti.indexOf(nomeOggi + ' e ') === 0, r.giorniPiuRichiesti);
});

test('pulsanti dell’email: un tocco, senza accesso, una volta sola', async () => {
  await nuovoDb();
  const inviate = posta();
  const avvisi = require('../api/_avvisi');
  const cfg = await impostazioni();
  const p = await P.prenota(cliente({ data: '2026-11-10', fascia: 'pomeriggio', nome: 'Elena', cognome: 'Blu' }), { adesso: ADESSO });
  const link = avvisi.linkRisposta(p, SITO);
  const t = u => new URL(u).searchParams.get('t');
  /* la pagina si apre senza accesso; la risposta parte dalla pagina stessa */
  assert.equal((await chiama('GET', { pagina: 'risposta', t: t(link.conferma) })).stato, 200);
  let r = await chiama('POST', { azione: 'risposta' }, { t: t(link.conferma) }, APP);
  assert.deepEqual([r.stato, r.json.ok, r.json.titolo], [200, true, 'Fatto']);
  assert.match(r.json.testo, /Hai confermato Elena Blu, martedì 10 novembre, pomeriggio/);
  assert.equal(inviate.filter(m => /^Prenotazione confermata/.test(m.subject)).length, 1);
  r = await chiama('POST', { azione: 'risposta' }, { t: t(link.no) }, APP);
  assert.deepEqual([r.json.ok, r.json.titolo], [false, 'Avevi già risposto']);
  assert.match(r.json.testo, /è già confermata/);
  assert.equal((await db.q('SELECT stato FROM prenotazioni WHERE id = $1', [p.id]))[0].stato, 'confermata');
  r = await chiama('POST', { azione: 'risposta' }, { t: 'inventato.firma' }, APP);
  assert.deepEqual([r.json.ok, r.json.titolo], [false, 'Questo pulsante non vale più']);
  E.impostaTrasporto(null);
});
