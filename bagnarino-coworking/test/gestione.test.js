/* =============================================================
   BAGNARINO COWORKING — test dell'app di gestione (/gestione)
   Accesso, sessione di 90 giorni, recupero password, protezione
   lato server di pagine e azioni, chiusure, scuse, avviso, foto,
   contatti, "Come va", e quello che prima stava nell'area
   riservata: clienti, incassi, prezzi, posti, prenotazioni a mano.
   Database in memoria, email catturate.
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
  /* prezzi, postazioni e listino non sono stati toccati: si cambiano solo dalla schermata "Prezzi", con la conferma */
  assert.deepEqual([cfg.listino[0].prezzo, cfg.postazioni, cfg.prezzoMezzaGiornata], [25, 8, 12]);
  const io = await entra();
  assert.equal((await chiama('POST', { azione: 'impostazioni' }, { listino: [{ id: 'giornata', prezzo: 1 }] }, io)).stato, 404);
});

test('Come va: i numeri di questo momento', async () => {
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

test('prenotazione aggiunta a mano dall’app: già confermata, email solo se c’è l’indirizzo', async () => {
  await nuovoDb();
  const inviate = posta();
  const io = await entra();
  const domani = (() => { const d = new Date(Date.now() + 864e5); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); })();
  /* senza sessione, o da un altro sito, non passa */
  assert.equal((await chiama('POST', { azione: 'prenotazione-nuova' }, { pacchetto: 'giornata', data: domani, nome: 'Rita', cognome: 'Neri', telefono: '3471112233' }, APP)).stato, 401);
  assert.equal((await chiama('POST', { azione: 'prenotazione-nuova' }, { pacchetto: 'giornata', data: domani, nome: 'Rita', cognome: 'Neri', telefono: '3471112233' }, { cookie: io.cookie })).stato, 403);
  /* mancano i dati: dice quali */
  let r = await chiama('POST', { azione: 'prenotazione-nuova' }, { pacchetto: 'giornata', data: domani, nome: 'R', cognome: 'Neri', telefono: '12' }, io);
  assert.equal(r.stato, 400);
  assert.deepEqual(r.json.campi.sort(), ['nome', 'telefono']);
  /* al telefono, senza email: confermata subito, nessuna email al cliente */
  r = await chiama('POST', { azione: 'prenotazione-nuova' }, { pacchetto: 'giornata', data: domani, fascia: 'mattina', nome: 'Rita', cognome: 'Neri', telefono: '347 111 2233', note: 'Vicino alla finestra' }, io);
  assert.deepEqual([r.stato, r.json.conEmail], [200, false]);
  assert.match(r.json.codice, /^BGN-/);
  assert.equal(inviate.length, 0);
  let p = (await chiama('GET', { azione: 'prenotazione', id: String(r.json.id) }, null, io)).json;
  assert.deepEqual([p.stato, p.fascia, p.importo, p.pagato, p.arrivaDa, p.puoPagare, p.email, p.nota], ['confermata', 'mattina', 1200, false, 'Aggiunta da te', true, '', 'Vicino alla finestra']);
  assert.match(p.posto, /^Postazione \d+$/);
  assert.equal(p.prezzo, '€12 da pagare in sede');
  /* con l'email: parte la conferma al cliente, con reply-to della titolare */
  r = await chiama('POST', { azione: 'prenotazione-nuova' }, { pacchetto: 'giornata', data: domani, fascia: 'giornata', nome: 'Ugo', cognome: 'Verdi', telefono: '3472223344', email: 'ugo@esempio.it' }, io);
  assert.deepEqual([r.stato, r.json.conEmail], [200, true]);
  assert.equal(inviate.filter(m => m.to === 'ugo@esempio.it' && /^Prenotazione confermata/.test(m.subject)).length, 1);
  assert.equal(inviate.filter(m => m.to !== 'ugo@esempio.it').length, 0);
  /* le prenotazioni a mano contano come "Di persona o al telefono" in Come va */
  const cv = (await chiama('GET', { azione: 'come-va' }, null, io)).json;
  assert.equal(cv.mesi[cv.mesi.length - 1].canali['In sede / telefono'], 2);
  E.impostaTrasporto(null);
});

test('incassi: da incassare, pagato con il metodo, elenco da scaricare', async () => {
  await nuovoDb();
  const io = await entra();
  const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const oggi = iso(new Date());
  const a = await P.prenota(cliente({ data: oggi, nome: 'Anna', cognome: 'Abate' }), { manuale: true });
  const b = await P.prenota(cliente({ data: oggi, fascia: 'mattina', nome: 'Bruno', cognome: 'Bassi', piva_cf: '12345678901' }), { manuale: true });
  await P.prenota(cliente({ data: iso(new Date(Date.now() + 864e5)), nome: 'Carla', cognome: 'Conti' }), {});   /* richiesta in attesa: non è ancora un incasso */
  let r = (await chiama('GET', { azione: 'incassi', periodo: 'giorno', da: oggi }, null, io)).json;
  assert.deepEqual([r.periodo, r.inizio, r.fine, r.righe.length], ['giorno', oggi, oggi, 2]);
  assert.deepEqual(r.totali, { previsto: 3700, incassato: 0, daIncassare: 3700, daIncassareOra: 3700 });
  assert.deepEqual(r.righe.map(x => [x.nome, x.importo, x.pagato, x.cosa]), [['Anna Abate', 2500, false, 'Giornata'], ['Bruno Bassi', 1200, false, 'Giornata · mattina']]);
  /* pagato in contanti */
  let pg = await chiama('POST', { azione: 'pagato' }, { id: a.id, pagato: true, metodo: 'contanti' }, io);
  assert.deepEqual([pg.stato, pg.json.pagato, pg.json.metodo], [200, true, 'contanti']);
  r = (await chiama('GET', { azione: 'incassi', periodo: 'mese', da: oggi }, null, io)).json;
  assert.deepEqual([r.totali.incassato, r.totali.daIncassare], [2500, r.totali.previsto - 2500]);
  let scheda = (await chiama('GET', { azione: 'prenotazione', id: String(a.id) }, null, io)).json;
  assert.deepEqual([scheda.pagato, scheda.metodo, scheda.pagataIl, scheda.prezzo], [true, 'contanti', oggi, '€25 · pagato']);
  /* "Come va": da incassare resta solo Bruno */
  const cv = (await chiama('GET', { azione: 'come-va' }, null, io)).json;
  assert.deepEqual([cv.numeri.daIncassare, cv.numeri.daIncassareN, cv.kpi.incasso.valore], [1200, 1, 2500]);
  /* ho sbagliato: non ha pagato */
  pg = await chiama('POST', { azione: 'pagato' }, { id: a.id, pagato: false }, io);
  assert.deepEqual([pg.json.pagato, pg.json.metodo], [false, null]);
  assert.equal((await chiama('POST', { azione: 'pagato' }, { id: 99999, pagato: true, metodo: 'carta' }, io)).stato, 404);
  /* l'elenco per la commercialista: solo con la sessione */
  assert.equal((await chiama('GET', { azione: 'elenco', da: oggi, a: oggi })).stato, 401);
  await chiama('POST', { azione: 'pagato' }, { id: b.id, pagato: true, metodo: 'carta' }, io);
  const csv = await chiama('GET', { azione: 'elenco', da: oggi, a: oggi }, null, io);
  assert.equal(csv.stato, 200);
  assert.match(csv.intestazioni['content-type'], /text\/csv/);
  assert.match(csv.intestazioni['content-disposition'], /incassi-bagnarino-/);
  const righe = csv.testo.trim().split('\r\n');
  assert.equal(righe.length, 3);
  assert.match(righe[0], /Data;Codice;Cliente;Telefono;Email;P\. IVA \/ C\.F\.;Formula;Importo \(EUR\);Pagato;Metodo/);
  assert.match(righe[2], /Bruno Bassi;.*;12345678901;Giornata · mattina;12,00;sì;carta;/);
});

test('clienti: elenco, ricerca, scheda con la storia, eliminazione', async () => {
  await nuovoDb();
  const io = await entra();
  const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const oggi = iso(new Date());
  const anna = cliente({ data: oggi, nome: 'Anna', cognome: 'Abate' });
  const p1 = await P.prenota(anna, { manuale: true });
  await P.prenota(Object.assign({}, anna, { data: iso(new Date(Date.now() + 3 * 864e5)) }), { manuale: true });
  await P.prenota(cliente({ data: oggi, fascia: 'pomeriggio', nome: 'Bruno', cognome: 'Bassi' }), { manuale: true });
  await P.segnaPresenza(p1.id, 'presente');
  assert.equal((await chiama('GET', { azione: 'clienti' })).stato, 401);
  let r = (await chiama('GET', { azione: 'clienti' }, null, io)).json;
  assert.deepEqual(r.clienti.map(c => [c.nome, c.prenotazioni, c.timbri]), [['Anna Abate', 2, 1], ['Bruno Bassi', 1, 0]]);
  assert.equal(r.clienti[0].ultimo, oggi);
  r = (await chiama('GET', { azione: 'clienti', cerca: 'bass' }, null, io)).json;
  assert.deepEqual(r.clienti.map(c => c.nome), ['Bruno Bassi']);
  assert.equal((await chiama('GET', { azione: 'clienti', cerca: "x' OR 1=1 --" }, null, io)).json.clienti.length, 0);
  const idAnna = (await chiama('GET', { azione: 'clienti', cerca: 'anna' }, null, io)).json.clienti[0].id;
  const scheda = (await chiama('GET', { azione: 'cliente', id: String(idAnna) }, null, io)).json;
  assert.deepEqual([scheda.nome, scheda.nomeProprio, scheda.cognome, scheda.prenotazioni, scheda.storia.length, scheda.whatsapp.slice(0, 2)], ['Anna Abate', 'Anna', 'Abate', 2, 2, '39']);
  assert.equal(scheda.storia[1].stato, 'presente');
  assert.equal((await chiama('GET', { azione: 'cliente', id: '99999' }, null, io)).stato, 404);
  /* dalla prenotazione si arriva alla scheda del cliente */
  assert.equal((await chiama('GET', { azione: 'prenotazione', id: String(p1.id) }, null, io)).json.clienteId, idAnna);
  /* eliminazione: spariscono anche prenotazioni e posti occupati */
  const via = await chiama('POST', { azione: 'cliente-elimina' }, { id: idAnna }, io);
  assert.deepEqual([via.stato, via.json.prenotazioni], [200, 2]);
  assert.equal((await chiama('POST', { azione: 'cliente-elimina' }, { id: idAnna }, io)).stato, 404);
  assert.deepEqual((await chiama('GET', { azione: 'clienti' }, null, io)).json.clienti.map(c => c.nome), ['Bruno Bassi']);
  assert.equal((await db.q('SELECT COUNT(*)::int AS n FROM occupazioni'))[0].n, 1);
});

test('prezzi, posti e messaggi di WhatsApp: si cambiano dall’app e arrivano sul sito', async () => {
  await nuovoDb();
  const io = await entra();
  let c = (await chiama('GET', { azione: 'coworking' }, null, io)).json;
  assert.deepEqual([c.listino.map(p => p.id).join(), c.listino[0].prezzo, c.mezza, c.postazioni], ['giornata,carnet,mese_flessibile,mese_fisso', 25, 12, 8]);
  assert.deepEqual(c.fasce.map(f => f.id), ['mattina', 'pomeriggio', 'giornata']);
  assert.equal((await chiama('GET', { azione: 'coworking' })).stato, 401);
  /* prezzi sbagliati: non si salva niente */
  let r = await chiama('POST', { azione: 'coworking' }, { listino: [{ id: 'giornata', prezzo: 'abc' }], mezza: '0' }, io);
  assert.equal(r.stato, 400);
  assert.match(r.json.messaggio, /Giornata/);
  assert.match(r.json.messaggio, /mezza giornata/);
  assert.equal((await impostazioni()).listino[0].prezzo, 25);
  /* prezzi nuovi: valgono per il sito e per le prossime richieste */
  r = await chiama('POST', { azione: 'coworking' }, { listino: [{ id: 'giornata', prezzo: '30' }, { id: 'inventato', prezzo: '1' }], mezza: '15' }, io);
  assert.deepEqual([r.stato, r.json.listino[0].prezzo, r.json.mezza], [200, 30, 15]);
  let cfg = await impostazioni();
  assert.deepEqual([cfg.listino[0].prezzo, cfg.prezzoMezzaGiornata, cfg.listino[0].nota, cfg.listino[1].prezzo], [30, 15, 'Mezza giornata a €15', 200]);
  const traTreGiorni = (() => { const d = new Date(Date.now() + 3 * 864e5); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); })();
  const p = await P.prenota(cliente({ data: traTreGiorni, fascia: 'mattina' }), {});
  assert.equal((await db.q('SELECT prezzo_centesimi FROM prenotazioni WHERE id = $1', [p.id]))[0].prezzo_centesimi, 1500);
  /* posti */
  assert.equal((await chiama('POST', { azione: 'coworking' }, { postazioni: 0 }, io)).stato, 400);
  r = await chiama('POST', { azione: 'coworking' }, { postazioni: 5 }, io);
  assert.equal(r.json.postazioni, 5);
  assert.equal((await db.q('SELECT COUNT(*)::int AS n FROM postazioni WHERE attiva'))[0].n, 5);
  r = await chiama('POST', { azione: 'coworking' }, { postazioni: 10 }, io);
  assert.equal((await db.q('SELECT COUNT(*)::int AS n FROM postazioni WHERE attiva'))[0].n, 10);
  /* i prezzi salvati prima restano */
  assert.equal((await impostazioni()).listino[0].prezzo, 30);
  /* messaggi: le parole tra graffe devono restare, e un messaggio non può restare vuoto */
  r = await chiama('POST', { azione: 'coworking' }, { messaggi: { giorno: 'Vorrei venire.' } }, io);
  assert.equal(r.stato, 400);
  assert.match(r.json.messaggio, /\{giorno\}/);
  assert.equal((await chiama('POST', { azione: 'coworking' }, { messaggi: { generico: '   ' } }, io)).stato, 400);
  r = await chiama('POST', { azione: 'coworking' }, { messaggi: { giorno: 'Buongiorno, vorrei un posto per {giorno}.', generico: 'Buongiorno, vorrei informazioni.' } }, io);
  assert.equal(r.stato, 200);
  cfg = await impostazioni();
  assert.deepEqual([cfg.whatsappTesti.giorno, cfg.whatsappTesti.generico], ['Buongiorno, vorrei un posto per {giorno}.', 'Buongiorno, vorrei informazioni.']);
  assert.match(cfg.whatsappTesti.domanda, /\{codice\}/);
  /* l'avviso e le foto del sito non vengono toccati da questi salvataggi */
  assert.equal(cfg.galleria.length, 2);
});

test('Oggi: chi arriva domani', async () => {
  await nuovoDb();
  const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const domani = iso(new Date(Date.now() + 864e5));
  const cfg = await impostazioni();
  assert.deepEqual((await G.oggi(cfg)).arriviDomani, []);
  await P.prenota(cliente({ data: domani, nome: 'Dora', cognome: 'Dotti' }), { manuale: true });
  await P.prenota(cliente({ data: domani, nome: 'Elio', cognome: 'Elmi' }), {});   /* in attesa: non è ancora un arrivo */
  const o = await G.oggi(cfg);
  assert.deepEqual([o.domani, o.arriviDomani.map(x => x.nome).join()], [domani, 'Dora Dotti']);
});

test('cruscotto e previsione: numeri di adesso, ultime settimane e mesi, fine mese con il ritmo di adesso', async () => {
  await nuovoDb();
  const C = require('../api/_conti');
  /* mercoledì 18 novembre 2026, mezzogiorno a Roma */
  const adesso = new Date('2026-11-18T11:00:00Z');
  const vuoto = await C.numeriAdesso(adesso);
  assert.deepEqual([vuoto.oggi, vuoto.settimana, vuoto.occupate, vuoto.daIncassare, vuoto.incassoMese, vuoto.settimane.length, vuoto.mesi.length, vuoto.fonti.length], ['2026-11-18', 0, 0, 0, 0, 8, 6, 0]);
  assert.deepEqual(vuoto.mesi.map(m => m.inizio), ['2026-06-01', '2026-07-01', '2026-08-01', '2026-09-01', '2026-10-01', '2026-11-01']);
  assert.equal(vuoto.settimane[7].inizio, '2026-11-16');
  /* senza prenotazioni la previsione non si fa */
  assert.deepEqual([vuoto.previsione.giorno, vuoto.previsione.giorniMese, vuoto.previsione.stima], [18, 30, null]);

  /* sei prenotazioni create questo mese: una oggi (arrivata e pagata), le altre nei prossimi giorni */
  const oggi = await P.prenota(cliente({ data: '2026-11-18' }), { manuale: true, adesso });
  for (const g of ['2026-11-19', '2026-11-20', '2026-11-23', '2026-11-24', '2026-12-21']) await P.prenota(cliente({ data: g, origine: { utm_source: 'instagram' } }), { adesso });
  await db.q("UPDATE prenotazioni SET creato_il = '2026-11-10T09:00:00Z'");
  await db.q("UPDATE prenotazioni SET stato = 'confermata' WHERE stato = 'in_attesa' AND data_inizio < '2026-12-01'");
  await db.q("UPDATE prenotazioni SET pagato = true, pagato_il = '2026-11-18T09:30:00Z', metodo_pagamento = 'carta' WHERE id = $1", [oggi.id]);
  /* una prenotazione di ottobre, già incassata allora */
  const ott = await P.prenota(cliente({ data: '2026-11-25' }), { manuale: true, adesso });
  await db.q("UPDATE prenotazioni SET creato_il = '2026-10-12T09:00:00Z', pagato = true, pagato_il = '2026-10-12T10:00:00Z' WHERE id = $1", [ott.id]);

  const n = await C.numeriAdesso(adesso);
  assert.deepEqual([n.occupate, n.postazioni, n.incassoMese, n.incassoMesePrima, n.daIncassare, n.daIncassareN], [1, 8, 2500, 2500, 0, 0]);
  assert.deepEqual(n.mesi.slice(-2).map(m => m.centesimi), [2500, 2500]);
  assert.deepEqual(n.settimane.map(s => s.n), [0, 0, 1, 0, 0, 0, 6, 0]);
  assert.deepEqual(n.fonti, [{ fonte: 'Instagram', n: 5 }, { fonte: 'In sede / telefono', n: 2 }]);
  /* 6 prenotazioni in 18 giorni → circa 10 in un mese di 30; il valore segue la stessa regola */
  assert.deepEqual(n.previsione.finora, { prenotazioni: 6, valore: 15000 });
  assert.deepEqual(n.previsione.stima, { prenotazioni: 10, valore: 25000 });
  assert.deepEqual(n.previsione.mesePrima, { prenotazioni: 1, valore: 2500 });
  /* già in calendario nei prossimi 30 giorni: le quattro confermate di novembre più quella di ottobre (non la richiesta di dicembre ancora in attesa) */
  assert.deepEqual(n.previsione.inCalendario, { prenotazioni: 5, valore: 12500 });
  /* devono ancora entrare: le quattro confermate non pagate */
  assert.equal(n.previsione.daEntrare, 10000);
  /* nei primi tre giorni del mese la previsione non si fa: sarebbe un numero a caso */
  assert.equal((await C.numeriAdesso(new Date('2026-11-03T11:00:00Z'))).previsione.stima, null);
  /* anche "Oggi" porta questi numeri */
  const io = await entra();
  const o = (await chiama('GET', { azione: 'oggi' }, null, io)).json;
  assert.ok(o.numeri && o.numeri.previsione && o.numeri.settimane.length === 8 && Array.isArray(o.numeri.fonti));
});

test('il giorno scrivania per scrivania, le chiusure in programma, "non è venuta/o"', async () => {
  await nuovoDb();
  const io = await entra();
  const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const oggi = iso(new Date()), tra5 = iso(new Date(Date.now() + 5 * 864e5)), tra6 = iso(new Date(Date.now() + 6 * 864e5));
  const a = await P.prenota(cliente({ data: oggi, nome: 'Anna', cognome: 'Abate' }), { manuale: true });
  await P.prenota(cliente({ data: oggi, fascia: 'mattina', nome: 'Bruno', cognome: 'Bassi' }), { manuale: true });
  await P.prenota(cliente({ data: oggi, fascia: 'pomeriggio', nome: 'Carla', cognome: 'Conti' }), { manuale: true });
  const g = (await chiama('GET', { azione: 'giorno', data: oggi }, null, io)).json;
  assert.equal(g.posti.length, 8);
  assert.deepEqual([g.posti[0].nome, g.posti[0].mattina.nome, g.posti[0].pomeriggio.nome, g.posti[0].mattina.id === g.posti[0].pomeriggio.id], ['Postazione 1', 'Anna Abate', 'Anna Abate', true]);
  /* mezza giornata e mezza giornata sulla stessa scrivania: due persone diverse */
  assert.deepEqual([g.posti[1].mattina.nome, g.posti[1].pomeriggio.nome], ['Bruno Bassi', 'Carla Conti']);
  assert.deepEqual([g.posti[2].mattina, g.posti[2].pomeriggio], [null, null]);

  /* chiusure in programma, in ordine, con la mezza giornata */
  assert.deepEqual((await chiama('GET', { azione: 'chiusure' }, null, io)).json.chiusure, []);
  assert.equal((await chiama('GET', { azione: 'chiusure' })).stato, 401);
  await chiama('POST', { azione: 'chiudi' }, { da: tra6, a: tra6, valore: 'mattina' }, io);
  await chiama('POST', { azione: 'chiudi' }, { da: tra5, a: tra5, valore: 'giorno' }, io);
  assert.deepEqual((await chiama('GET', { azione: 'chiusure' }, null, io)).json.chiusure, [{ data: tra5, valore: 'giorno' }, { data: tra6, valore: 'mattina' }]);
  await chiama('POST', { azione: 'chiudi' }, { da: tra5, a: tra5, valore: 'aperto' }, io);
  assert.deepEqual((await chiama('GET', { azione: 'chiusure' }, null, io)).json.chiusure.map(c => c.data), [tra6]);

  /* non è venuta/o, e poi la correzione */
  let r = await chiama('POST', { azione: 'arrivo' }, { id: a.id, assente: true }, io);
  assert.deepEqual([r.stato, r.json.stato], [200, 'assente']);
  let p = (await chiama('GET', { azione: 'prenotazione', id: String(a.id) }, null, io)).json;
  assert.deepEqual([p.stato, p.quante, p.puoSegnareArrivo], ['assente', 1, true]);
  r = await chiama('POST', { azione: 'arrivo' }, { id: a.id, arrivato: false }, io);
  assert.equal(r.json.stato, 'confermata');
  r = await chiama('POST', { azione: 'arrivo' }, { id: a.id, arrivato: true }, io);
  assert.deepEqual([r.json.stato, r.json.timbro], ['presente', true]);
});
