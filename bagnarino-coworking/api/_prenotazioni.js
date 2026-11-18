/* =============================================================
   BAGNARINO COWORKING — logica delle prenotazioni
   Tutte le regole stanno qui (le API sono solo "porte"):
   disponibilità per fascia, assegnazione delle postazioni, carnet,
   Bagnarino Card, risposta della titolare, annullamento, presenze.
   Ogni prenotazione nasce come RICHIESTA ('in_attesa'): il posto
   viene tenuto da parte subito, ma è del cliente solo quando la
   titolare conferma. Se risponde "non disponibile" il posto si libera.
   Ogni errore previsto ha un codice: _http.js lo traduce nella
   risposta giusta (400, 403, 404, 409, 429).
   ============================================================= */
const crypto = require('crypto');
const { q, transazione, nuovoCodice } = require('./_db');
const { impostazioni, pacchetto: trovaPacchetto } = require('./_impostazioni');
const cal = require('./_calendario');

const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function errore(codice, messaggio, extra) {
  const e = new Error(messaggio);
  e.codice = codice;
  if (extra) e.extra = extra;
  return e;
}
function soloCifre(t) { return String(t || '').replace(/\D/g, ''); }
function telefonoNormale(t) { return soloCifre(t).replace(/^(0039|39)(?=3\d{8,9}$)/, ''); }
function stessoTelefono(a, b) { const x = soloCifre(a), y = soloCifre(b); return x.length >= 8 && y.length >= 8 && x.slice(-8) === y.slice(-8); }
function euro(c) { return '€' + (c / 100).toFixed(c % 100 ? 2 : 0).replace('.', ','); }

/* ---------- validazione dei dati del modulo ---------- */
function valida(d, cfg, manuale) {
  /* inserita dalla titolare (cliente al banco o al telefono):
     l'email è facoltativa e l'informativa è consegnata in sede */
  if (manuale) {
    d = Object.assign({}, d, { consenso_privacy: true });
    if (!String(d.email || '').trim()) d.email = 'tel-' + String(d.telefono || '').replace(/\D/g, '') + '@senza-email.invalid';
  }
  const out = {
    pacchetto: String(d.pacchetto || ''),
    data: String(d.data || ''),
    nome: String(d.nome || '').trim().slice(0, 60),
    cognome: String(d.cognome || '').trim().slice(0, 60),
    email: String(d.email || '').trim().toLowerCase().slice(0, 120),
    telefono: String(d.telefono || '').trim().slice(0, 20),
    piva_cf: String(d.piva_cf || '').trim().toUpperCase().slice(0, 16),
    note: String(d.note || '').trim().slice(0, 500),
    consenso_privacy: d.consenso_privacy === true,
    consenso_marketing: d.consenso_marketing === true,
    usa_omaggio: d.usa_omaggio === true,
    origine: d.origine && typeof d.origine === 'object' ? d.origine : {}
  };
  /* la fascia si sceglie solo per la formula "Giornata": carnet e
     mensili valgono per la giornata intera */
  out.fascia = out.pacchetto === 'giornata' ? String(d.fascia || 'giornata') : 'giornata';
  const p = trovaPacchetto(cfg, out.pacchetto);
  const campi = [];
  if (!p || (out.pacchetto === 'sala' && !(cfg.sala && cfg.sala.attiva))) campi.push('pacchetto');
  if (!cal.isoValida(out.data)) campi.push('data');
  if (!cal.fasciaValida(out.fascia)) campi.push('fascia');
  if (out.nome.length < 2) campi.push('nome');
  if (out.cognome.length < 2) campi.push('cognome');
  if (!EMAIL_OK.test(out.email)) campi.push('email');
  if (!/^\d{8,11}$/.test(telefonoNormale(out.telefono))) campi.push('telefono');
  if (out.piva_cf && !/^\d{11}$/.test(out.piva_cf) && !/^[A-Z0-9]{16}$/.test(out.piva_cf)) campi.push('piva_cf');
  if (!out.consenso_privacy) campi.push('privacy');
  if (campi.length) throw errore('DATI', 'Controlla i dati inseriti.', { campi });
  /* della provenienza si tengono solo le chiavi note, accorciate */
  const o = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'gclid', 'fbclid', 'referrer', 'pagina'].forEach(k => {
    if (out.origine[k]) o[k] = String(out.origine[k]).slice(0, 200);
  });
  out.origine = o;
  out.listino = p;
  return out;
}

/* ---------- disponibilità ---------- */
async function postazioniAttive(esegui) {
  return (esegui || q)('SELECT id, tipo FROM postazioni WHERE attiva ORDER BY id');
}
/* posti occupati per giorno e mezza giornata:
   { 'AAAA-MM-GG': { mattina: Set(id), pomeriggio: Set(id) } } */
async function occupazioniTra(da, a, esegui) {
  const r = await (esegui || q)(
    "SELECT postazione_id, to_char(data, 'YYYY-MM-DD') AS d, fascia FROM occupazioni WHERE data BETWEEN $1 AND $2", [da, a]);
  const mappa = {};
  r.forEach(x => {
    const g = mappa[x.d] = mappa[x.d] || { mattina: new Set(), pomeriggio: new Set() };
    (g[x.fascia] || g.mattina).add(x.postazione_id);
  });
  return mappa;
}
/* quella scrivania è libera in quel giorno per tutta la fascia? */
function libera(occ, id, giorno, fascia) {
  const g = occ[giorno];
  return !g || cal.meta(fascia).every(m => !g[m].has(id));
}

/* Posti liberi per giorno.
   - giorni[data]: numero unico (per i mensili riguarda tutto il periodo
     che partirebbe da quel giorno; per la giornata è la fascia più libera)
   - fasce[data]: { mattina, pomeriggio, giornata, nd } dove nd elenca le
     fasce "non disponibili" (chiuse dalla titolare o non più richiedibili
     per oggi): sul sito non si distinguono da un posto pieno se non per
     l'etichetta. */
async function disponibilita(da, giorni, pacchettoId, adesso) {
  const cfg = await impostazioni();
  giorni = Math.max(1, Math.min(62, parseInt(giorni, 10) || 14));
  if (!cal.isoValida(da)) da = cal.oraRoma(adesso).data;
  const ultimo = cal.aggiungiGiorni(da, giorni - 1);
  const mensile = /^mese/.test(pacchettoId || '');
  const posti = await postazioniAttive();
  const occ = await occupazioniTra(da, mensile ? cal.fineMese(ultimo) : ultimo);
  const liberi = (d, fascia) => posti.filter(p => libera(occ, p.id, d, fascia));

  const out = {}, fasce = {};
  for (let i = 0; i < giorni; i++) {
    const d = cal.aggiungiGiorni(da, i);
    const f = { mattina: 0, pomeriggio: 0, giornata: 0, nd: [] };
    ['mattina', 'pomeriggio', 'giornata'].forEach(id => {
      if (!cal.prenotabile(d, id, cfg, adesso)) f.nd.push(id);
      else f[id] = liberi(d, id).length;
    });
    fasce[d] = f;
    if (!mensile) { out[d] = pacchettoId === 'carnet' ? f.giornata : Math.max(f.mattina, f.pomeriggio, f.giornata); continue; }
    if (f.nd.indexOf('giornata') !== -1) { out[d] = 0; continue; }
    const periodo = cal.giorniPacchetto(pacchettoId, d, cfg, cfg.chiusureTutte);
    if (pacchettoId === 'mese_fisso') {
      out[d] = posti.filter(p => periodo.every(g => libera(occ, p.id, g, 'giornata'))).length;
    } else {
      out[d] = Math.min.apply(null, periodo.map(g => liberi(g, 'giornata').length));
    }
  }
  return { giorni: out, fasce, postazioni: posti.length };
}

/* ---------- anti-spam: massimo 8 tentativi l'ora per IP ---------- */
function impronta(ip) {
  return crypto.createHash('sha256').update(String(ip || '') + '::' + (process.env.CRON_SECRET || 'bgn')).digest('hex').slice(0, 32);
}
async function controllaLimite(ip) {
  const imp = impronta(ip);
  const r = await q("SELECT COUNT(*)::int AS n FROM tentativi WHERE impronta = $1 AND creato_il > now() - interval '1 hour'", [imp]);
  if (r[0].n >= 8) throw errore('TROPPI', 'Troppi tentativi in poco tempo. Riprova tra un’ora o scrivici su WhatsApp.');
  await q('INSERT INTO tentativi (impronta) VALUES ($1)', [imp]);
  if (Math.random() < 0.05) await q("DELETE FROM tentativi WHERE creato_il < now() - interval '1 day'");
}

/* ---------- prenotazione ---------- */
async function prenota(dati, contesto) {
  contesto = contesto || {};
  const cfg = await impostazioni();

  /* trappola compilata = robot: risposta normale, nulla salvato */
  if (dati && dati.sito_web) return { codice: nuovoCodice(), finto: true };

  const d = valida(dati || {}, cfg, contesto.manuale);
  const okData = contesto.manuale
    ? cal.isoValida(d.data) && d.data >= cal.oraRoma(contesto.adesso).data && cal.fasciaAperta(d.data, d.fascia, cfg)
    : cal.prenotabile(d.data, d.fascia, cfg, contesto.adesso);
  if (!okData) {
    throw errore('DATA', 'In quel momento lo spazio non è disponibile: scegli un altro giorno o un’altra fascia.');
  }
  if (contesto.ip !== undefined) await controllaLimite(contesto.ip);

  const giorni = cal.giorniPacchetto(d.pacchetto, d.data, cfg, cfg.chiusureTutte);
  if (!giorni.length) throw errore('DATA', 'Nel periodo scelto lo spazio non è disponibile: scegli un altro giorno di inizio.');
  const dataFine = /^mese/.test(d.pacchetto) ? cal.fineMese(d.data) : d.data;

  const esito = await transazione(async (x) => {
    /* una prenotazione alla volta: niente doppie assegnazioni */
    await x('SELECT pg_advisory_xact_lock(7231983)');

    /* cliente: nuovo o aggiornato (il consenso marketing non si perde) */
    const cli = (await x(
      `INSERT INTO clienti (nome, cognome, email, telefono, piva_cf, consenso_marketing)
       VALUES ($1, $2, $3, $4, NULLIF($5, ''), $6)
       ON CONFLICT (email) DO UPDATE SET nome = EXCLUDED.nome, cognome = EXCLUDED.cognome,
         telefono = EXCLUDED.telefono, piva_cf = COALESCE(EXCLUDED.piva_cf, clienti.piva_cf),
         consenso_marketing = clienti.consenso_marketing OR EXCLUDED.consenso_marketing
       RETURNING id`,
      [d.nome, d.cognome, d.email, d.telefono, d.piva_cf, d.consenso_marketing]))[0];

    /* la stessa persona non occupa due scrivanie lo stesso giorno */
    const doppia = await x(
      `SELECT p.codice FROM occupazioni o JOIN prenotazioni p ON p.id = o.prenotazione_id
       WHERE p.cliente_id = $1 AND o.data = ANY($2::date[]) LIMIT 1`, [cli.id, giorni]);
    if (doppia.length) {
      throw errore('GIA_PRENOTATO', 'Hai già una prenotazione per ' + (giorni.length > 1 ? 'uno dei giorni di questo periodo' : 'questo giorno') +
        ' (codice ' + doppia[0].codice + '). Se prenoti per un’altra persona, usa i suoi dati.', { codice: doppia[0].codice });
    }

    const mezza = d.pacchetto === 'giornata' && d.fascia !== 'giornata';
    let prezzo = Math.round((mezza ? cfg.prezzoMezzaGiornata : d.listino.prezzo) * 100);
    let carnetId = null, omaggio = false, carnetInfo = null;

    /* giornata in regalo e ingressi del carnet valgono per la giornata intera */
    if (d.pacchetto === 'giornata' && !mezza) {
      const fid = (await x('SELECT omaggi_disponibili FROM fidelity WHERE cliente_id = $1', [cli.id]))[0];
      if (d.usa_omaggio && fid && fid.omaggi_disponibili > 0) {
        omaggio = true; prezzo = 0;
        await x('UPDATE fidelity SET omaggi_disponibili = omaggi_disponibili - 1, omaggi_usati = omaggi_usati + 1 WHERE cliente_id = $1', [cli.id]);
      } else {
        /* carnet attivo: l'ingresso è già pagato */
        const c = (await x(
          `SELECT id, ingressi_totali, ingressi_usati FROM carnet
           WHERE cliente_id = $1 AND ingressi_usati < ingressi_totali AND (scadenza IS NULL OR scadenza >= $2)
           ORDER BY creato_il LIMIT 1 FOR UPDATE`, [cli.id, d.data]))[0];
        if (c) {
          carnetId = c.id; prezzo = 0;
          await x('UPDATE carnet SET ingressi_usati = ingressi_usati + 1 WHERE id = $1', [c.id]);
          carnetInfo = { residui: c.ingressi_totali - c.ingressi_usati - 1 };
        }
      }
    }
    if (d.pacchetto === 'carnet') {
      const tot = (cfg.carnet && cfg.carnet.ingressi) || 10;
      const c = (await x(
        'INSERT INTO carnet (cliente_id, ingressi_totali, ingressi_usati, scadenza) VALUES ($1, $2, 1, $3) RETURNING id',
        [cli.id, tot, cal.aggiungiMesi(d.data, (cfg.carnet && cfg.carnet.validitaMesi) || 3)]))[0];
      carnetId = c.id;
      carnetInfo = { residui: tot - 1 };
    }

    /* assegnazione delle postazioni */
    const posti = await postazioniAttive(x);
    const occ = await occupazioniTra(giorni[0], giorni[giorni.length - 1], x);
    const eLibera = (id, g) => libera(occ, id, g, d.fascia);
    const assegnate = [];
    if (d.pacchetto === 'mese_fisso') {
      const ordinati = posti.slice().sort((a, b) => (b.tipo === 'fissa') - (a.tipo === 'fissa') || a.id - b.id);
      const p = ordinati.find(p => giorni.every(g => eLibera(p.id, g)));
      if (!p) throw errore('POSTO_ESAURITO', 'Non c’è più una scrivania libera per tutto il mese da questo giorno.');
      giorni.forEach(g => assegnate.push([p.id, g]));
    } else {
      let ultima = null;
      for (const g of giorni) {
        /* stessa scrivania del giorno prima, se possibile; le "fisse" per ultime */
        const candidati = posti.filter(p => eLibera(p.id, g))
          .sort((a, b) => (a.id === ultima ? -1 : b.id === ultima ? 1 : 0) || (a.tipo === 'fissa') - (b.tipo === 'fissa') || a.id - b.id);
        if (!candidati.length) {
          throw errore('POSTO_ESAURITO', giorni.length > 1
            ? 'Nel mese scelto c’è almeno un giorno già pieno. Prova a partire da un altro giorno.'
            : 'Questo momento si è appena riempito. Scegline un altro.');
        }
        ultima = candidati[0].id;
        assegnate.push([ultima, g]);
      }
    }

    let codice = nuovoCodice();
    for (let i = 0; i < 5; i++) {
      const c = await x('SELECT 1 FROM prenotazioni WHERE codice = $1', [codice]);
      if (!c.length) break;
      codice = nuovoCodice();
    }
    /* dal sito: richiesta in attesa della titolare. Inserita da lei
       (cliente al banco o al telefono): già confermata. */
    const statoIniziale = contesto.manuale ? 'confermata' : 'in_attesa';
    const pren = (await x(
      `INSERT INTO prenotazioni (codice, cliente_id, pacchetto, data_inizio, data_fine, postazione_id, prezzo_centesimi,
         note, origine, carnet_id, omaggio, pagato, manuale, accettata, fascia, stato)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NULLIF($8, ''), $9, $10, $11, $12, $13, $13, $14, $15) RETURNING id`,
      [codice, cli.id, d.pacchetto, d.data, dataFine, assegnate[0][0], prezzo, d.note,
        JSON.stringify(contesto.manuale ? { utm_source: 'banco' } : d.origine),
        carnetId, omaggio, prezzo === 0 && d.pacchetto === 'giornata' && !!carnetId, !!contesto.manuale, d.fascia, statoIniziale]))[0];
    /* il posto è tenuto da parte da subito, una riga per mezza giornata */
    for (const [pid, g] of assegnate) {
      for (const m of cal.meta(d.fascia)) {
        await x('INSERT INTO occupazioni (postazione_id, data, prenotazione_id, fascia) VALUES ($1, $2, $3, $4)', [pid, g, pren.id, m]);
      }
    }
    await x("INSERT INTO eventi (tipo, dati) VALUES ('prenotazione', $1)",
      [JSON.stringify({ codice, pacchetto: d.pacchetto, fascia: d.fascia, valore: prezzo / 100, fonte: d.origine.utm_source || null })]);

    return { id: pren.id, codice, prezzo, omaggio, carnet: carnetInfo, postazione: assegnate[0][0], stato: statoIniziale };
  }).catch(err => {
    /* vincolo di unicità violato: qualcuno ha preso il posto nello stesso istante */
    if (err && err.code === '23505') throw errore('POSTO_ESAURITO', 'Questo momento si è appena riempito. Scegline un altro.');
    throw err;
  });

  return Object.assign(esito, {
    pacchetto: d.pacchetto,
    nomePacchetto: d.listino.nome,
    fascia: d.fascia,
    nomeFascia: cal.nomeFascia(d.fascia, cfg),
    nome: d.nome, cognome: d.cognome, email: d.email, telefono: d.telefono, piva_cf: d.piva_cf, note: d.note,
    data_inizio: d.data, data_fine: dataFine,
    prezzoTesto: euro(esito.prezzo),
    scadenzaDisdetta: cal.scadenzaDisdetta(d.data, cfg),
    origine: d.origine
  });
}

/* ---------- lettura di una prenotazione ---------- */
const CAMPI = `p.id, p.codice, p.pacchetto, p.fascia, to_char(p.data_inizio, 'YYYY-MM-DD') AS data_inizio,
            to_char(p.data_fine, 'YYYY-MM-DD') AS data_fine, p.prezzo_centesimi, p.stato, p.pagato, p.note,
            p.motivo_annullamento, p.carnet_id, p.omaggio, p.postazione_id,
            to_char(p.creato_il AT TIME ZONE 'Europe/Rome', 'YYYY-MM-DD"T"HH24:MI') AS creato_il,
            c.id AS cliente_id, c.nome, c.cognome, c.email, c.telefono, c.piva_cf`;

/* aggiunge i testi pronti per email e schermate */
function completa(p, cfg) {
  const pk = trovaPacchetto(cfg, p.pacchetto);
  return Object.assign(p, {
    nomePacchetto: pk ? pk.nome : p.pacchetto,
    nomeFascia: cal.nomeFascia(p.fascia, cfg),
    prezzo: p.prezzo_centesimi,
    prezzoTesto: euro(p.prezzo_centesimi),
    scadenzaDisdetta: cal.scadenzaDisdetta(p.data_inizio, cfg)
  });
}

/* con codice + email (area del cliente) */
async function trova(codice, email, esegui) {
  codice = String(codice || '').trim().toUpperCase();
  email = String(email || '').trim().toLowerCase();
  if (!/^BGN-[A-Z0-9]{4}$/.test(codice) || !EMAIL_OK.test(email)) throw errore('NON_TROVATA', 'Prenotazione non trovata: controlla codice ed email.');
  const r = await (esegui || q)(
    `SELECT ${CAMPI} FROM prenotazioni p JOIN clienti c ON c.id = p.cliente_id
     WHERE p.codice = $1 AND lower(c.email) = $2`, [codice, email]);
  if (!r.length) throw errore('NON_TROVATA', 'Prenotazione non trovata: controlla codice ed email.');
  return r[0];
}

/* con il numero interno (titolare) */
async function leggi(id, esegui) {
  if (!Number.isInteger(id)) throw errore('NON_TROVATA', 'Prenotazione non trovata.');
  const r = await (esegui || q)(`SELECT ${CAMPI} FROM prenotazioni p JOIN clienti c ON c.id = p.cliente_id WHERE p.id = $1`, [id]);
  if (!r.length) throw errore('NON_TROVATA', 'Prenotazione non trovata.');
  return r[0];
}

async function stato(codice, email, adesso) {
  const cfg = await impostazioni();
  const p = completa(await trova(codice, email), cfg);
  return {
    codice: p.codice, stato: p.stato, motivo: p.motivo_annullamento || null,
    pacchetto: p.pacchetto, nomePacchetto: p.nomePacchetto, fascia: p.fascia, nomeFascia: p.nomeFascia,
    data_inizio: p.data_inizio, data_fine: p.data_fine, prezzo: p.prezzo_centesimi, prezzoTesto: p.prezzoTesto,
    pagato: p.pagato, omaggio: p.omaggio, nome: p.nome,
    /* una richiesta in attesa si ritira quando si vuole; una prenotazione
       confermata fino alla scadenza della disdetta */
    annullabile: p.stato === 'in_attesa' || (p.stato === 'confermata' && cal.annullabile(p.data_inizio, cfg, adesso)),
    scadenzaDisdetta: p.scadenzaDisdetta
  };
}

/* ---------- risposta della titolare a una richiesta ----------
   esito: 'conferma' oppure 'non_disponibile'. Vale una volta sola:
   se la richiesta ha già una risposta (data dall'app, dall'email o
   dal cliente che ha rinunciato) torna l'errore GIA_FATTO con lo
   stato attuale, così chi chiama può dirlo con parole semplici. */
async function rispondi(id, esito) {
  if (esito !== 'conferma' && esito !== 'non_disponibile') throw errore('DATI', 'Risposta non valida.');
  const cfg = await impostazioni();
  const p = await leggi(id);
  const giaFatto = (st, motivo) => errore('GIA_FATTO', 'Questa richiesta ha già una risposta.', { stato: st, motivo: motivo || null });
  if (p.stato !== 'in_attesa') throw giaFatto(p.stato, p.motivo_annullamento);
  if (esito === 'conferma') {
    const r = await q(
      "UPDATE prenotazioni SET stato = 'confermata', accettata = true, risposta_il = now() WHERE id = $1 AND stato = 'in_attesa' RETURNING id", [id]);
    if (!r.length) { const ora = await leggi(id); throw giaFatto(ora.stato, ora.motivo_annullamento); }
    await q("INSERT INTO eventi (tipo, dati) VALUES ('conferma', $1)", [JSON.stringify({ codice: p.codice, pacchetto: p.pacchetto })]);
    p.stato = 'confermata';
  } else {
    await annullaPrenotazione(p, 'non_disponibile', ['in_attesa']);
    p.stato = 'annullata'; p.motivo_annullamento = 'non_disponibile';
  }
  return completa(p, cfg);
}

/* ---------- annullamento da parte del cliente ---------- */
async function annulla(codice, email, adesso) {
  const cfg = await impostazioni();
  const p = await trova(codice, email);
  if (p.stato === 'annullata') throw errore('GIA_FATTO', 'Questa prenotazione è già annullata.');
  if (p.stato !== 'confermata' && p.stato !== 'in_attesa') throw errore('GIA_FATTO', 'Questa prenotazione è già stata usata.');
  if (p.stato === 'confermata' && !cal.annullabile(p.data_inizio, cfg, adesso)) {
    throw errore('FUORI_TEMPO', 'Si può annullare online fino alle ' + ((cfg.disdetta && cfg.disdetta.ora) || '20:00') +
      ' del giorno prima. Ora scrivici su WhatsApp e troviamo una soluzione.');
  }
  const eraInAttesa = p.stato === 'in_attesa';
  await annullaPrenotazione(p, 'cliente');
  return Object.assign(completa(p, cfg), { stato: 'annullata', motivo_annullamento: 'cliente', eraInAttesa });
}

/* ---------- annullamento da parte della titolare ----------
   Nessun limite di tempo. Una richiesta ancora in attesa diventa
   "non disponibile"; una prenotazione già confermata è un
   annullamento vero, con le scuse al cliente. */
async function annullaDaAdmin(id) {
  const cfg = await impostazioni();
  const p = await leggi(id);
  if (p.stato === 'annullata') throw errore('GIA_FATTO', 'Questa prenotazione è già annullata.');
  const motivo = p.stato === 'in_attesa' ? 'non_disponibile' : 'titolare';
  await annullaPrenotazione(p, motivo);
  return Object.assign(completa(p, cfg), { stato: 'annullata', motivo_annullamento: motivo });
}

/* statiAmmessi: se indicati, l'annullamento vale solo partendo da uno
   di quegli stati (controllato dentro la transazione) */
async function annullaPrenotazione(p, motivo, statiAmmessi) {
  await transazione(async (x) => {
    await x('SELECT pg_advisory_xact_lock(7231983)');
    const ora = (await x('SELECT stato, motivo_annullamento FROM prenotazioni WHERE id = $1 FOR UPDATE', [p.id]))[0];
    if (!ora || ora.stato === 'annullata') {
      throw errore('GIA_FATTO', 'Questa prenotazione è già annullata.', { stato: 'annullata', motivo: ora ? ora.motivo_annullamento : null });
    }
    if (statiAmmessi && statiAmmessi.indexOf(ora.stato) === -1) {
      throw errore('GIA_FATTO', 'Questa richiesta ha già una risposta.', { stato: ora.stato, motivo: null });
    }
    if (p.pacchetto === 'carnet' && p.carnet_id) {
      const altri = await x("SELECT COUNT(*)::int AS n FROM prenotazioni WHERE carnet_id = $1 AND id <> $2 AND stato <> 'annullata'", [p.carnet_id, p.id]);
      if (altri[0].n > 0) throw errore('CARNET_IN_USO', 'Il carnet è già in uso: per annullarlo scrivici su WhatsApp.');
      await x('UPDATE carnet SET ingressi_totali = 0, ingressi_usati = 0 WHERE id = $1', [p.carnet_id]);
    } else if (p.carnet_id) {
      await x('UPDATE carnet SET ingressi_usati = GREATEST(0, ingressi_usati - 1) WHERE id = $1', [p.carnet_id]);
    }
    if (p.omaggio) {
      await x('UPDATE fidelity SET omaggi_disponibili = omaggi_disponibili + 1, omaggi_usati = GREATEST(0, omaggi_usati - 1) WHERE cliente_id = $1', [p.cliente_id]);
    }
    await x(
      `UPDATE prenotazioni SET stato = 'annullata', motivo_annullamento = $2::text,
         risposta_il = CASE WHEN $2::text = 'cliente' THEN risposta_il ELSE COALESCE(risposta_il, now()) END
       WHERE id = $1`, [p.id, motivo || null]);
    await x('DELETE FROM occupazioni WHERE prenotazione_id = $1', [p.id]);
    await x("INSERT INTO eventi (tipo, dati) VALUES ('annullamento', $1)",
      [JSON.stringify({ codice: p.codice, pacchetto: p.pacchetto, motivo: motivo || null })]);
  });
}

/* ---------- vantaggi del cliente (email + telefono devono combaciare) ---------- */
async function vantaggi(email, telefono, data) {
  email = String(email || '').trim().toLowerCase();
  const vuoto = { omaggi: 0, carnet: null };
  if (!EMAIL_OK.test(email)) return vuoto;
  const c = (await q('SELECT id, telefono FROM clienti WHERE email = $1', [email]))[0];
  if (!c || !stessoTelefono(c.telefono, telefono)) return vuoto;
  const f = (await q('SELECT omaggi_disponibili FROM fidelity WHERE cliente_id = $1', [c.id]))[0];
  const k = (await q(
    `SELECT ingressi_totali - ingressi_usati AS residui, to_char(scadenza, 'YYYY-MM-DD') AS scadenza FROM carnet
     WHERE cliente_id = $1 AND ingressi_usati < ingressi_totali AND (scadenza IS NULL OR scadenza >= $2)
     ORDER BY creato_il LIMIT 1`, [c.id, cal.isoValida(data) ? data : cal.oraRoma().data]))[0];
  return { omaggi: f ? f.omaggi_disponibili : 0, carnet: k || null };
}

/* ---------- Bagnarino Card (email + codice di una prenotazione) ---------- */
async function card(email, codice) {
  const cfg = await impostazioni();
  const p = await trova(codice, email);
  const f = (await q('SELECT timbri, omaggi_disponibili, omaggi_usati FROM fidelity WHERE cliente_id = $1', [p.cliente_id]))[0] ||
    { timbri: 0, omaggi_disponibili: 0, omaggi_usati: 0 };
  const k = (await q(
    `SELECT ingressi_totali - ingressi_usati AS residui, to_char(scadenza, 'YYYY-MM-DD') AS scadenza FROM carnet
     WHERE cliente_id = $1 AND ingressi_usati < ingressi_totali AND (scadenza IS NULL OR scadenza >= CURRENT_DATE)
     ORDER BY creato_il LIMIT 1`, [p.cliente_id]))[0];
  return { nome: p.nome, timbri: f.timbri, timbriPerOmaggio: (cfg.fidelity && cfg.fidelity.timbri) || 10,
    omaggi: f.omaggi_disponibili, omaggiUsati: f.omaggi_usati, carnet: k || null };
}

/* ---------- presenze (area riservata, fase 3) ----------
   Ogni giornata 'presente' pagata (giornata singola o ingresso
   del carnet) vale un timbro. Al 3°, 5° e 7° un premio da consegnare
   in sede, al decimo una giornata in regalo. Tornare indietro toglie il timbro. */
async function segnaPresenza(id, nuovoStato) {
  if (!Number.isInteger(id)) throw errore('NON_TROVATA', 'Prenotazione non trovata.');
  if (['presente', 'assente', 'confermata'].indexOf(nuovoStato) === -1) throw errore('DATI', 'Stato non valido.');
  const cfg = await impostazioni();
  const soglia = (cfg.fidelity && cfg.fidelity.timbri) || 10;
  return transazione(async (x) => {
    const p = (await x('SELECT id, cliente_id, pacchetto, fascia, stato, omaggio FROM prenotazioni WHERE id = $1 FOR UPDATE', [id]))[0];
    if (!p) throw errore('NON_TROVATA', 'Prenotazione non trovata.');
    if (p.stato === 'annullata') throw errore('GIA_FATTO', 'La prenotazione è annullata.');
    /* un timbro per ogni giornata intera pagata (singola o da carnet) */
    const vale = (p.pacchetto === 'giornata' || p.pacchetto === 'carnet') && !p.omaggio && p.fascia === 'giornata';
    let timbro = false;
    await x('INSERT INTO fidelity (cliente_id) VALUES ($1) ON CONFLICT (cliente_id) DO NOTHING', [p.cliente_id]);
    let premio = false, premioSbloccato = null;
    if (vale && p.stato !== 'presente' && nuovoStato === 'presente') {
      const f = (await x('UPDATE fidelity SET timbri = timbri + 1 WHERE cliente_id = $1 RETURNING timbri', [p.cliente_id]))[0];
      timbro = true;
      /* premi intermedi della card (stampe, amico, sconto): li consegna il negozio */
      const sb = ((cfg.fidelity && cfg.fidelity.premi) || []).find(z => z.timbri === f.timbri && z.timbri < soglia);
      if (sb) premioSbloccato = sb.titolo;
      if (f.timbri >= soglia) {
        premio = true;
        await x('UPDATE fidelity SET timbri = timbri - $2, omaggi_disponibili = omaggi_disponibili + 1 WHERE cliente_id = $1', [p.cliente_id, soglia]);
      }
    }
    if (vale && p.stato === 'presente' && nuovoStato !== 'presente') {
      const f = (await x('SELECT timbri, omaggi_disponibili FROM fidelity WHERE cliente_id = $1', [p.cliente_id]))[0];
      if (f.timbri > 0) await x('UPDATE fidelity SET timbri = timbri - 1 WHERE cliente_id = $1', [p.cliente_id]);
      else if (f.omaggi_disponibili > 0) {
        await x('UPDATE fidelity SET timbri = $2, omaggi_disponibili = omaggi_disponibili - 1 WHERE cliente_id = $1', [p.cliente_id, soglia - 1]);
      }
    }
    /* segnare arrivo o assenza vale anche come "accettata" */
    await x('UPDATE prenotazioni SET stato = $2, accettata = true WHERE id = $1', [id, nuovoStato]);
    const f = (await x('SELECT timbri, omaggi_disponibili FROM fidelity WHERE cliente_id = $1', [p.cliente_id]))[0];
    return { id, stato: nuovoStato, timbri: f.timbri, omaggi: f.omaggi_disponibili, premio, premioSbloccato, timbro };
  });
}

/* eliminazione definitiva di un cliente (clienti di prova, richieste di
   cancellazione dei dati): con lui spariscono le sue prenotazioni, i
   posti occupati, il carnet, i timbri della Card e gli eventi collegati.
   Non si può annullare: l'area riservata chiede conferma prima. */
async function eliminaCliente(id) {
  if (!Number.isInteger(id)) throw errore('NON_TROVATO', 'Cliente non trovato.');
  return transazione(async (x) => {
    await x('SELECT pg_advisory_xact_lock(7231983)');
    const c = (await x('SELECT id, nome, cognome FROM clienti WHERE id = $1', [id]))[0];
    if (!c) throw errore('NON_TROVATO', 'Cliente non trovato.');
    const pren = await x('SELECT id, codice FROM prenotazioni WHERE cliente_id = $1', [id]);
    const codici = pren.map(r => r.codice);
    if (codici.length) await x("DELETE FROM eventi WHERE dati->>'codice' = ANY($1::text[])", [codici]);
    await x('DELETE FROM occupazioni WHERE prenotazione_id IN (SELECT id FROM prenotazioni WHERE cliente_id = $1)', [id]);
    await x('DELETE FROM prenotazioni WHERE cliente_id = $1', [id]);
    await x('DELETE FROM carnet WHERE cliente_id = $1', [id]);
    await x('DELETE FROM fidelity WHERE cliente_id = $1', [id]);
    await x('DELETE FROM clienti WHERE id = $1', [id]);
    return { id, nome: c.nome, cognome: c.cognome, prenotazioni: pren.length };
  });
}

module.exports = {
  eliminaCliente,
  disponibilita, prenota, stato, rispondi, annulla, annullaDaAdmin, vantaggi, card, segnaPresenza, trova, leggi, completa, CAMPI,
  valida, errore, euro, stessoTelefono, impronta
};
