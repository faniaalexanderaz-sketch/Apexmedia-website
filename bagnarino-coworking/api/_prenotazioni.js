/* =============================================================
   BAGNARINO COWORKING — logica delle prenotazioni
   Tutte le regole stanno qui (le API sono solo "porte"):
   disponibilità, assegnazione delle postazioni, carnet,
   Bagnarino Card, annullamento, presenze.
   Ogni errore previsto ha un codice: _http.js lo traduce nella
   risposta giusta (400, 403, 404, 409, 429).
   ============================================================= */
const crypto = require('crypto');
const { q, transazione, nuovoCodice } = require('./_db');
const { impostazioni, pacchetto: trovaPacchetto } = require('./_impostazioni');
const cal = require('./_calendario');

const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const STATI_ATTIVI = "('confermata','presente')";

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
  const p = trovaPacchetto(cfg, out.pacchetto);
  const campi = [];
  if (!p || (out.pacchetto === 'sala' && !(cfg.sala && cfg.sala.attiva))) campi.push('pacchetto');
  if (!cal.isoValida(out.data)) campi.push('data');
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
async function occupazioniTra(da, a, esegui) {
  const r = await (esegui || q)(
    "SELECT postazione_id, to_char(data, 'YYYY-MM-DD') AS d FROM occupazioni WHERE data BETWEEN $1 AND $2", [da, a]);
  const mappa = {};
  r.forEach(x => { (mappa[x.d] = mappa[x.d] || new Set()).add(x.postazione_id); });
  return mappa;
}

/* posti liberi per giorno. Con un pacchetto mensile il numero
   riguarda l'intero periodo che partirebbe da quel giorno. */
async function disponibilita(da, giorni, pacchettoId, adesso) {
  const cfg = await impostazioni();
  giorni = Math.max(1, Math.min(62, parseInt(giorni, 10) || 14));
  if (!cal.isoValida(da)) da = cal.oraRoma(adesso).data;
  const ultimo = cal.aggiungiGiorni(da, giorni - 1);
  const mensile = /^mese/.test(pacchettoId || '');
  const posti = await postazioniAttive();
  const occ = await occupazioniTra(da, mensile ? cal.fineMese(ultimo) : ultimo);
  const liberiIl = d => posti.filter(p => !(occ[d] && occ[d].has(p.id)));

  const out = {};
  for (let i = 0; i < giorni; i++) {
    const d = cal.aggiungiGiorni(da, i);
    if (!cal.prenotabile(d, cfg, cfg.chiusureTutte, adesso)) { out[d] = 0; continue; }
    if (!mensile) { out[d] = liberiIl(d).length; continue; }
    const periodo = cal.giorniPacchetto(pacchettoId, d, cfg, cfg.chiusureTutte);
    if (pacchettoId === 'mese_fisso') {
      out[d] = posti.filter(p => periodo.every(g => !(occ[g] && occ[g].has(p.id)))).length;
    } else {
      out[d] = Math.min.apply(null, periodo.map(g => liberiIl(g).length));
    }
  }
  return { giorni: out, postazioni: posti.length };
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
    ? cal.isoValida(d.data) && d.data >= cal.oraRoma(contesto.adesso).data && cal.aperto(d.data, cfg, cfg.chiusureTutte)
    : cal.prenotabile(d.data, cfg, cfg.chiusureTutte, contesto.adesso);
  if (!okData) {
    throw errore('DATA', 'Questo giorno non è prenotabile: scegline un altro.');
  }
  if (contesto.ip !== undefined) await controllaLimite(contesto.ip);

  const giorni = cal.giorniPacchetto(d.pacchetto, d.data, cfg, cfg.chiusureTutte);
  if (!giorni.length) throw errore('DATA', 'Nel periodo scelto il coworking è chiuso.');
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

    let prezzo = Math.round(d.listino.prezzo * 100);
    let carnetId = null, omaggio = false, carnetInfo = null;

    if (d.pacchetto === 'giornata') {
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
    const libera = (id, g) => !(occ[g] && occ[g].has(id));
    const assegnate = [];
    if (d.pacchetto === 'mese_fisso') {
      const ordinati = posti.slice().sort((a, b) => (b.tipo === 'fissa') - (a.tipo === 'fissa') || a.id - b.id);
      const p = ordinati.find(p => giorni.every(g => libera(p.id, g)));
      if (!p) throw errore('POSTO_ESAURITO', 'Non c’è più una scrivania libera per tutto il mese da questo giorno.');
      giorni.forEach(g => assegnate.push([p.id, g]));
    } else {
      let ultima = null;
      for (const g of giorni) {
        /* stessa scrivania del giorno prima, se possibile; le "fisse" per ultime */
        const candidati = posti.filter(p => libera(p.id, g))
          .sort((a, b) => (a.id === ultima ? -1 : b.id === ultima ? 1 : 0) || (a.tipo === 'fissa') - (b.tipo === 'fissa') || a.id - b.id);
        if (!candidati.length) {
          throw errore('POSTO_ESAURITO', giorni.length > 1
            ? 'Nel mese scelto c’è almeno un giorno già pieno. Prova a partire da un altro giorno.'
            : 'Questo giorno si è appena riempito. Scegline un altro.');
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
    const pren = (await x(
      `INSERT INTO prenotazioni (codice, cliente_id, pacchetto, data_inizio, data_fine, postazione_id, prezzo_centesimi,
         note, origine, carnet_id, omaggio, pagato, manuale)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NULLIF($8, ''), $9, $10, $11, $12, $13) RETURNING id`,
      [codice, cli.id, d.pacchetto, d.data, dataFine, assegnate[0][0], prezzo, d.note,
        JSON.stringify(contesto.manuale ? { utm_source: 'banco' } : d.origine),
        carnetId, omaggio, prezzo === 0 && d.pacchetto === 'giornata' && !!carnetId, !!contesto.manuale]))[0];
    for (const [pid, g] of assegnate) {
      await x('INSERT INTO occupazioni (postazione_id, data, prenotazione_id) VALUES ($1, $2, $3)', [pid, g, pren.id]);
    }
    await x("INSERT INTO eventi (tipo, dati) VALUES ('prenotazione', $1)",
      [JSON.stringify({ codice, pacchetto: d.pacchetto, valore: prezzo / 100, fonte: d.origine.utm_source || null })]);

    return { id: pren.id, codice, prezzo, omaggio, carnet: carnetInfo, postazione: assegnate[0][0] };
  }).catch(err => {
    /* vincolo di unicità violato: qualcuno ha preso il posto nello stesso istante */
    if (err && err.code === '23505') throw errore('POSTO_ESAURITO', 'Questo giorno si è appena riempito. Scegline un altro.');
    throw err;
  });

  return Object.assign(esito, {
    pacchetto: d.pacchetto,
    nomePacchetto: d.listino.nome,
    nome: d.nome, cognome: d.cognome, email: d.email, telefono: d.telefono, piva_cf: d.piva_cf, note: d.note,
    data_inizio: d.data, data_fine: dataFine,
    prezzoTesto: euro(esito.prezzo),
    scadenzaDisdetta: cal.scadenzaDisdetta(d.data, cfg),
    origine: d.origine
  });
}

/* ---------- lettura di una prenotazione (codice + email) ---------- */
async function trova(codice, email, esegui) {
  codice = String(codice || '').trim().toUpperCase();
  email = String(email || '').trim().toLowerCase();
  if (!/^BGN-[A-Z0-9]{4}$/.test(codice) || !EMAIL_OK.test(email)) throw errore('NON_TROVATA', 'Prenotazione non trovata: controlla codice ed email.');
  const r = await (esegui || q)(
    `SELECT p.id, p.codice, p.pacchetto, to_char(p.data_inizio, 'YYYY-MM-DD') AS data_inizio,
            to_char(p.data_fine, 'YYYY-MM-DD') AS data_fine, p.prezzo_centesimi, p.stato, p.pagato,
            p.carnet_id, p.omaggio, p.postazione_id, c.id AS cliente_id, c.nome, c.cognome, c.email, c.telefono
     FROM prenotazioni p JOIN clienti c ON c.id = p.cliente_id
     WHERE p.codice = $1 AND lower(c.email) = $2`, [codice, email]);
  if (!r.length) throw errore('NON_TROVATA', 'Prenotazione non trovata: controlla codice ed email.');
  return r[0];
}

async function stato(codice, email, adesso) {
  const cfg = await impostazioni();
  const p = await trova(codice, email);
  const pk = trovaPacchetto(cfg, p.pacchetto);
  return {
    codice: p.codice, stato: p.stato, pacchetto: p.pacchetto, nomePacchetto: pk ? pk.nome : p.pacchetto,
    data_inizio: p.data_inizio, data_fine: p.data_fine, prezzo: p.prezzo_centesimi, prezzoTesto: euro(p.prezzo_centesimi),
    pagato: p.pagato, omaggio: p.omaggio, nome: p.nome,
    annullabile: p.stato === 'confermata' && cal.annullabile(p.data_inizio, cfg, adesso),
    scadenzaDisdetta: cal.scadenzaDisdetta(p.data_inizio, cfg)
  };
}

/* ---------- annullamento ---------- */
async function annulla(codice, email, adesso) {
  const cfg = await impostazioni();
  const p = await trova(codice, email);
  if (p.stato === 'annullata') throw errore('GIA_FATTO', 'Questa prenotazione è già annullata.');
  if (p.stato !== 'confermata') throw errore('GIA_FATTO', 'Questa prenotazione è già stata usata.');
  if (!cal.annullabile(p.data_inizio, cfg, adesso)) {
    throw errore('FUORI_TEMPO', 'Si può annullare online fino alle ' + ((cfg.disdetta && cfg.disdetta.ora) || '20:00') +
      ' del giorno prima. Ora scrivici su WhatsApp e troviamo una soluzione.');
  }
  await annullaPrenotazione(p);
  const pk = trovaPacchetto(cfg, p.pacchetto);
  return Object.assign({}, p, { stato: 'annullata', nomePacchetto: pk ? pk.nome : p.pacchetto, prezzoTesto: euro(p.prezzo_centesimi) });
}

/* annullamento dall'area riservata: nessun limite di orario */
async function annullaDaAdmin(id) {
  if (!Number.isInteger(id)) throw errore('NON_TROVATA', 'Prenotazione non trovata.');
  const cfg = await impostazioni();
  const p = (await q(
    `SELECT p.id, p.codice, p.pacchetto, to_char(p.data_inizio, 'YYYY-MM-DD') AS data_inizio, to_char(p.data_fine, 'YYYY-MM-DD') AS data_fine,
            p.prezzo_centesimi, p.stato, p.carnet_id, p.omaggio, c.id AS cliente_id, c.nome, c.cognome, c.email, c.telefono
     FROM prenotazioni p JOIN clienti c ON c.id = p.cliente_id WHERE p.id = $1`, [id]))[0];
  if (!p) throw errore('NON_TROVATA', 'Prenotazione non trovata.');
  if (p.stato === 'annullata') throw errore('GIA_FATTO', 'Questa prenotazione è già annullata.');
  await annullaPrenotazione(p);
  const pk = trovaPacchetto(cfg, p.pacchetto);
  return Object.assign({}, p, { stato: 'annullata', nomePacchetto: pk ? pk.nome : p.pacchetto, prezzoTesto: euro(p.prezzo_centesimi) });
}

async function annullaPrenotazione(p) {
  await transazione(async (x) => {
    await x('SELECT pg_advisory_xact_lock(7231983)');
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
    await x("UPDATE prenotazioni SET stato = 'annullata' WHERE id = $1", [p.id]);
    await x('DELETE FROM occupazioni WHERE prenotazione_id = $1', [p.id]);
    await x("INSERT INTO eventi (tipo, dati) VALUES ('annullamento', $1)", [JSON.stringify({ codice: p.codice, pacchetto: p.pacchetto })]);
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
    const p = (await x('SELECT id, cliente_id, pacchetto, stato, omaggio FROM prenotazioni WHERE id = $1 FOR UPDATE', [id]))[0];
    if (!p) throw errore('NON_TROVATA', 'Prenotazione non trovata.');
    if (p.stato === 'annullata') throw errore('GIA_FATTO', 'La prenotazione è annullata.');
    const vale = (p.pacchetto === 'giornata' || p.pacchetto === 'carnet') && !p.omaggio;
    await x('INSERT INTO fidelity (cliente_id) VALUES ($1) ON CONFLICT (cliente_id) DO NOTHING', [p.cliente_id]);
    let premio = false, premioSbloccato = null;
    if (vale && p.stato !== 'presente' && nuovoStato === 'presente') {
      const f = (await x('UPDATE fidelity SET timbri = timbri + 1 WHERE cliente_id = $1 RETURNING timbri', [p.cliente_id]))[0];
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
    await x('UPDATE prenotazioni SET stato = $2 WHERE id = $1', [id, nuovoStato]);
    const f = (await x('SELECT timbri, omaggi_disponibili FROM fidelity WHERE cliente_id = $1', [p.cliente_id]))[0];
    return { id, stato: nuovoStato, timbri: f.timbri, omaggi: f.omaggi_disponibili, premio, premioSbloccato };
  });
}

module.exports = {
  disponibilita, prenota, stato, annulla, annullaDaAdmin, vantaggi, card, segnaPresenza, trova,
  valida, errore, euro, stessoTelefono, impronta
};
