/* =============================================================
   BAGNARINO COWORKING — clienti, incassi, prezzi e posti
   La parte "da ufficio" dell'app di gestione (/gestione): chi sono
   i clienti, chi ha pagato e chi no, l'elenco da scaricare, i
   prezzi, quante scrivanie ci sono, i messaggi WhatsApp del sito.
   Prima stava nell'area riservata /admin: ora è tutto nell'app.
   ============================================================= */
const { q } = require('./_db');
const { modifiche, fondi, pacchetto: trovaPacchetto } = require('./_impostazioni');
const P = require('./_prenotazioni');
const G = require('./_gestione');
const cal = require('./_calendario');
const { classificaFonte } = require('./_report');

const METODI = ['contanti', 'carta', 'bonifico', 'online'];
/* come si chiamano, in parole semplici, i messaggi che il sito prepara per WhatsApp */
const NOMI_MESSAGGI = {
  generico: 'Chi chiede informazioni',
  prenota: 'Chi vuole un posto',
  giorno: 'Chi vuole un posto in un giorno preciso',
  pacchetto: 'Chi chiede di una formula',
  visita: 'Chi vuole vedere lo spazio prima',
  domanda: 'Chi ha una domanda sulla sua prenotazione',
  conferma: 'Chi manda la richiesta da WhatsApp'
};

function lunedi(iso) { return cal.aggiungiGiorni(iso, -((cal.giornoSettimana(iso) + 6) % 7)); }
function primoDelMese(iso) { return iso.slice(0, 8) + '01'; }
function nomePacchetto(cfg, id) { const p = trovaPacchetto(cfg, id); return p ? p.nome : id; }

/* ---------- clienti ---------- */
const CAMPI_CLIENTE = `c.id, c.nome, c.cognome, c.email, c.telefono, c.piva_cf, c.consenso_marketing,
  (SELECT COUNT(*)::int FROM prenotazioni p WHERE p.cliente_id = c.id AND p.stato <> 'annullata') AS prenotazioni,
  (SELECT COALESCE(SUM(prezzo_centesimi), 0)::int FROM prenotazioni p WHERE p.cliente_id = c.id AND p.pagato) AS speso,
  (SELECT to_char(MAX(o.data), 'YYYY-MM-DD') FROM occupazioni o JOIN prenotazioni p ON p.id = o.prenotazione_id
     WHERE p.cliente_id = c.id AND p.stato <> 'annullata' AND o.data <= $1) AS ultimo,
  (SELECT COUNT(DISTINCT o.data)::int FROM occupazioni o JOIN prenotazioni p ON p.id = o.prenotazione_id
     WHERE p.cliente_id = c.id AND p.stato <> 'annullata' AND o.data <= $1 AND o.data > $1::date - 30) AS ingressi30,
  (SELECT COALESCE(SUM(ingressi_totali - ingressi_usati), 0)::int FROM carnet k
     WHERE k.cliente_id = c.id AND (k.scadenza IS NULL OR k.scadenza >= $1)) AS carnet,
  COALESCE(f.timbri, 0) AS timbri, COALESCE(f.omaggi_disponibili, 0) AS omaggi`;

function schedaCliente(c, oggi) {
  const tel = G.internazionale(c.telefono);
  return {
    id: c.id, nome: c.nome + ' ' + c.cognome, nomeProprio: c.nome, cognome: c.cognome,
    telefono: c.telefono, telefonoLink: tel ? '+' + tel : '', whatsapp: tel, email: G.emailVera(c.email),
    fattura: c.piva_cf || '', novita: !!c.consenso_marketing,
    prenotazioni: c.prenotazioni, speso: c.speso, ultimo: c.ultimo || null,
    carnet: c.carnet, timbri: c.timbri, omaggi: c.omaggi,
    /* viene spesso: almeno quattro giorni nell'ultimo mese */
    abituale: c.ingressi30 >= 4,
    /* è venuta/o, ma non si vede da più di un mese */
    daRisentire: !!c.ultimo && c.ultimo < cal.aggiungiGiorni(oggi, -30)
  };
}

async function clienti(cerca, adesso) {
  const oggi = cal.oraRoma(adesso).data, filtro = '%' + String(cerca || '').trim().toLowerCase().slice(0, 60) + '%';
  const r = await q(
    `SELECT ${CAMPI_CLIENTE} FROM clienti c LEFT JOIN fidelity f ON f.cliente_id = c.id
     WHERE lower(c.nome || ' ' || c.cognome || ' ' || c.email || ' ' || c.telefono) LIKE $2
     ORDER BY c.cognome, c.nome LIMIT 300`, [oggi, filtro]);
  return { clienti: r.map(c => schedaCliente(c, oggi)) };
}

async function cliente(id, cfg, adesso) {
  if (!Number.isInteger(id)) throw P.errore('NON_TROVATA', 'Cliente non trovato.');
  const oggi = cal.oraRoma(adesso).data;
  const r = await q(`SELECT ${CAMPI_CLIENTE} FROM clienti c LEFT JOIN fidelity f ON f.cliente_id = c.id WHERE c.id = $2`, [oggi, id]);
  if (!r.length) throw P.errore('NON_TROVATA', 'Cliente non trovato.');
  const pren = await q(
    `SELECT ${P.CAMPI} FROM prenotazioni p JOIN clienti c ON c.id = p.cliente_id
     WHERE c.id = $1 ORDER BY p.data_inizio DESC, p.id DESC LIMIT 60`, [id]);
  return Object.assign(schedaCliente(r[0], oggi), { storia: pren.map(p => G.riga(p, cfg, oggi)) });
}

/* ---------- incassi ---------- */
function intervallo(periodo, da, adesso) {
  da = cal.isoValida(da) ? da : cal.oraRoma(adesso).data;
  if (periodo === 'giorno') return [da, da];
  if (periodo === 'settimana') { const l = lunedi(da); return [l, cal.aggiungiGiorni(l, 6)]; }
  const m = primoDelMese(da); return [m, cal.aggiungiGiorni(cal.aggiungiMesi(m, 1), -1)];
}

/* le prenotazioni (non annullate, già confermate) di un periodo, con quello che serve per i conti */
async function righeIncassi(da, a, cfg) {
  const r = await q(
    `SELECT p.id, p.codice, p.pacchetto, p.fascia, p.stato, p.pagato, p.metodo_pagamento, p.prezzo_centesimi, p.omaggio, p.carnet_id,
            to_char(p.data_inizio, 'YYYY-MM-DD') AS data, to_char(p.pagato_il AT TIME ZONE 'Europe/Rome', 'YYYY-MM-DD') AS pagato_il,
            c.nome, c.cognome, c.telefono, c.email, c.piva_cf
     FROM prenotazioni p JOIN clienti c ON c.id = p.cliente_id
     WHERE p.data_inizio BETWEEN $1 AND $2 AND p.stato IN ('confermata', 'presente', 'assente') ORDER BY p.data_inizio, c.cognome, p.id`, [da, a]);
  return r.map(x => Object.assign(x, {
    nomePacchetto: nomePacchetto(cfg, x.pacchetto) + (x.pacchetto === 'giornata' && x.fascia !== 'giornata' ? ' · ' + cal.nomeFascia(x.fascia, cfg).toLowerCase() : ''),
    email: G.emailVera(x.email)
  }));
}

async function incassi(periodo, da, cfg, adesso) {
  periodo = ['giorno', 'settimana', 'mese'].indexOf(periodo) !== -1 ? periodo : 'mese';
  const oggi = cal.oraRoma(adesso).data, v = intervallo(periodo, da, adesso), inizio = v[0], fine = v[1];
  const righe = await righeIncassi(inizio, fine, cfg);
  const tot = { previsto: 0, incassato: 0, daIncassare: 0, daIncassareOra: 0 };
  const elenco = righe.map(r => {
    const gratis = r.prezzo_centesimi === 0;
    tot.previsto += r.prezzo_centesimi;
    if (r.pagato) tot.incassato += r.prezzo_centesimi;
    else if (!gratis) { tot.daIncassare += r.prezzo_centesimi; if (r.data <= oggi) tot.daIncassareOra += r.prezzo_centesimi; }
    return {
      id: r.id, nome: r.nome + ' ' + r.cognome, data: r.data,
      cosa: r.nomePacchetto + (r.omaggio ? ' · regalo della Card' : gratis && r.carnet_id ? ' · ingresso del carnet' : ''),
      importo: r.prezzo_centesimi, gratis, pagato: !!r.pagato, metodo: r.metodo_pagamento || '', futura: r.data > oggi
    };
  });
  /* periodo prima e dopo, per le due frecce */
  const prima = periodo === 'giorno' ? cal.aggiungiGiorni(inizio, -1) : periodo === 'settimana' ? cal.aggiungiGiorni(inizio, -7) : cal.aggiungiMesi(inizio, -1);
  const dopo = periodo === 'giorno' ? cal.aggiungiGiorni(inizio, 1) : periodo === 'settimana' ? cal.aggiungiGiorni(inizio, 7) : cal.aggiungiMesi(inizio, 1);
  return { periodo, inizio, fine, prima, dopo, oggi, righe: elenco, totali: tot };
}

/* l'elenco per la commercialista: si apre con Excel (separatore ";", virgola nei decimali) */
function csv(righe) {
  const cella = v => { const s = String(v == null ? '' : v); return /[";\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const intest = ['Data', 'Codice', 'Cliente', 'Telefono', 'Email', 'P. IVA / C.F.', 'Formula', 'Importo (EUR)', 'Pagato', 'Metodo', 'Data incasso', 'Note'];
  const corpoCsv = righe.map(r => [
    r.data.split('-').reverse().join('/'), r.codice, r.nome + ' ' + r.cognome, r.telefono, r.email, r.piva_cf || '', r.nomePacchetto,
    (r.prezzo_centesimi / 100).toFixed(2).replace('.', ','), r.pagato ? 'sì' : 'no', r.metodo_pagamento || '',
    r.pagato_il ? r.pagato_il.split('-').reverse().join('/') : '', r.omaggio ? 'omaggio Bagnarino Card' : r.carnet_id && r.pacchetto === 'giornata' ? 'ingresso da carnet' : ''
  ].map(cella).join(';'));
  return '﻿' + [intest.join(';')].concat(corpoCsv).join('\r\n') + '\r\n';
}

async function segnaPagato(id, pagato, metodo) {
  if (!Number.isInteger(id)) throw P.errore('NON_TROVATA', 'Prenotazione non trovata.');
  pagato = pagato === true;
  metodo = METODI.indexOf(metodo) !== -1 ? metodo : null;
  const r = await q(
    `UPDATE prenotazioni SET pagato = $2, metodo_pagamento = $3, pagato_il = CASE WHEN $2 THEN COALESCE(pagato_il, now()) ELSE NULL END,
            accettata = accettata OR $2
     WHERE id = $1 AND stato <> 'annullata' AND prezzo_centesimi > 0 RETURNING id, pagato, metodo_pagamento AS metodo`, [id, pagato, pagato ? metodo : null]);
  if (!r.length) throw P.errore('NON_TROVATA', 'Questa prenotazione non ha niente da pagare.');
  return r[0];
}

/* ---------- i numeri di adesso: il cruscotto di "Oggi" e la cima di "Come va" ----------
   Tutto quello che il vecchio pannello mostrava in apertura: scrivanie
   occupate, da incassare, incasso del mese con gli ultimi 6 mesi,
   prenotazioni della settimana con le ultime 8, da dove arrivano
   (ultimi 90 giorni). In più la previsione: dove si arriva a fine mese
   con il ritmo di adesso, cosa c'è già in calendario, quanto deve
   ancora entrare. */
function giorniDelMese(primo) { return +cal.aggiungiGiorni(cal.aggiungiMesi(primo, 1), -1).slice(8); }

async function numeriAdesso(adesso) {
  const oggi = cal.oraRoma(adesso).data, lun = lunedi(oggi), lunPrima = cal.aggiungiGiorni(lun, -7);
  const mese = primoDelMese(oggi), mesePrima = cal.aggiungiMesi(mese, -1), meseDopo = cal.aggiungiMesi(mese, 1), domani = cal.aggiungiGiorni(oggi, 1);
  const giorniSett = ((cal.giornoSettimana(oggi) + 6) % 7) + 1;   /* lunedì = 1 */
  const CREATO = "(creato_il AT TIME ZONE 'Europe/Rome')::date", PAGATO = "(pagato_il AT TIME ZONE 'Europe/Rome')::date";
  const ricevute = (da, a) => q(
    `SELECT COUNT(*)::int AS n, COALESCE(SUM(prezzo_centesimi), 0)::int AS valore FROM prenotazioni WHERE stato <> 'annullata' AND ${CREATO} >= $1 AND ${CREATO} < $2`, [da, a]).then(r => r[0]);
  const incasso = (da, a) => q(
    `SELECT COALESCE(SUM(prezzo_centesimi), 0)::int AS c FROM prenotazioni WHERE pagato AND pagato_il IS NOT NULL AND ${PAGATO} >= $1 AND ${PAGATO} < $2`, [da, a]).then(r => r[0].c);

  const v = await Promise.all([
    ricevute(lun, domani), ricevute(lunPrima, cal.aggiungiGiorni(lunPrima, giorniSett)),
    q('SELECT COUNT(*)::int AS n FROM postazioni WHERE attiva'),
    q(`SELECT COUNT(DISTINCT o.postazione_id)::int AS n FROM occupazioni o JOIN prenotazioni p ON p.id = o.prenotazione_id
       WHERE o.data = $1 AND p.stato IN ('confermata', 'presente')`, [oggi]),
    q(`SELECT COALESCE(SUM(prezzo_centesimi), 0)::int AS c, COUNT(*)::int AS n FROM prenotazioni
       WHERE NOT pagato AND prezzo_centesimi > 0 AND stato IN ('confermata', 'presente', 'assente') AND data_inizio <= $1`, [oggi]),
    incasso(mese, meseDopo), incasso(mesePrima, mese),
    q(`SELECT to_char(date_trunc('week', ${CREATO}), 'YYYY-MM-DD') AS s, COUNT(*)::int AS n
       FROM prenotazioni WHERE stato <> 'annullata' AND ${CREATO} >= $1 GROUP BY 1`, [cal.aggiungiGiorni(lun, -49)]),
    q(`SELECT to_char(date_trunc('month', ${PAGATO}), 'YYYY-MM-DD') AS m, COALESCE(SUM(prezzo_centesimi), 0)::int AS c
       FROM prenotazioni WHERE pagato AND pagato_il IS NOT NULL AND ${PAGATO} >= $1 GROUP BY 1`, [cal.aggiungiMesi(mese, -5)]),
    q(`SELECT origine FROM prenotazioni WHERE stato <> 'annullata' AND creato_il > now() - interval '90 days'`),
    ricevute(mese, meseDopo), ricevute(mesePrima, mese),
    /* già in calendario: prenotazioni confermate nei prossimi 30 giorni */
    q(`SELECT COUNT(*)::int AS n, COALESCE(SUM(prezzo_centesimi), 0)::int AS valore FROM prenotazioni
       WHERE stato = 'confermata' AND data_inizio > $1 AND data_inizio <= $2`, [oggi, cal.aggiungiGiorni(oggi, 30)]),
    /* devono ancora entrare: tutto quello che è confermato e non pagato, anche nei prossimi giorni */
    q(`SELECT COALESCE(SUM(prezzo_centesimi), 0)::int AS c FROM prenotazioni
       WHERE NOT pagato AND prezzo_centesimi > 0 AND stato IN ('confermata', 'presente')`)
  ]);
  const sett = v[7], mesiDb = v[8], settimane = [], mesi = [], fonti = {};
  for (let i = 7; i >= 0; i--) { const s = cal.aggiungiGiorni(lun, -7 * i); const t = sett.find(x => x.s === s); settimane.push({ inizio: s, n: t ? t.n : 0 }); }
  for (let i = 5; i >= 0; i--) { const m = cal.aggiungiMesi(mese, -i); const t = mesiDb.find(x => x.m === m); mesi.push({ inizio: m, centesimi: t ? t.c : 0 }); }
  v[9].forEach(r => { const f = classificaFonte(typeof r.origine === 'string' ? JSON.parse(r.origine) : r.origine); fonti[f] = (fonti[f] || 0) + 1; });

  /* previsione di fine mese: il ritmo dei giorni passati finora, portato a tutto il mese.
     Nei primi tre giorni, o senza prenotazioni, non si fa: sarebbe un numero a caso. */
  const giorno = +oggi.slice(8), giorniMese = giorniDelMese(mese), delMese = v[10], prima = v[11];
  const stima = giorno >= 4 && delMese.n > 0 ? {
    prenotazioni: Math.round(delMese.n * giorniMese / giorno),
    valore: Math.round(delMese.valore * giorniMese / giorno / 100) * 100
  } : null;
  return {
    oggi, settimana: v[0].n, settimanaPrima: v[1].n,
    occupate: v[3][0].n, postazioni: v[2][0].n, daIncassare: v[4][0].c, daIncassareN: v[4][0].n,
    incassoMese: v[5], incassoMesePrima: v[6], settimane, mesi,
    fonti: Object.keys(fonti).map(k => ({ fonte: k, n: fonti[k] })).sort((a, b) => b.n - a.n),
    previsione: {
      giorno, giorniMese, finora: { prenotazioni: delMese.n, valore: delMese.valore }, stima,
      mesePrima: { prenotazioni: prima.n, valore: prima.valore },
      inCalendario: { prenotazioni: v[12][0].n, valore: v[12][0].valore }, daEntrare: v[13][0].c
    }
  };
}

/* ---------- prezzi, posti, messaggi ---------- */
async function coworking(cfg) {
  const posti = (await q('SELECT COUNT(*)::int AS n FROM postazioni WHERE attiva'))[0].n;
  return {
    listino: cfg.listino.map(p => ({ id: p.id, nome: p.nome, prezzo: p.prezzo, unita: p.unita, tipoData: p.tipoData })),
    mezza: cfg.prezzoMezzaGiornata, postazioni: posti,
    fasce: (cfg.fasce || []).map(f => ({ id: f.id, nome: f.nome })),
    messaggi: Object.keys(cfg.whatsappTesti).map(k => ({ id: k, nome: NOMI_MESSAGGI[k] || k, testo: cfg.whatsappTesti[k] }))
  };
}

/* il numero di scrivanie attive segue le impostazioni */
async function sincronizzaPostazioni(n) {
  const tutte = await q('SELECT id, attiva FROM postazioni ORDER BY id');
  for (let i = 0; i < Math.max(n, tutte.length); i++) {
    if (i < tutte.length) {
      const attiva = i < n;
      if (tutte[i].attiva !== attiva) await q('UPDATE postazioni SET attiva = $2 WHERE id = $1', [tutte[i].id, attiva]);
    } else {
      await q('INSERT INTO postazioni (nome) VALUES ($1)', ['Postazione ' + (i + 1)]);
    }
  }
}

function prezzoValido(v) {
  const n = Math.round(Number(String(v == null ? '' : v).replace(',', '.').replace(/[€\s]/g, '')));
  return Number.isFinite(n) && n >= 1 && n <= 5000 ? n : null;
}

/* b può contenere: listino [{ id, prezzo }], mezza, postazioni, messaggi { id: testo } */
async function salvaCoworking(b, cfg) {
  b = b || {};
  const nuove = JSON.parse(JSON.stringify(await modifiche() || {}));
  const errori = [];
  const voceListino = (id, cambia) => {
    nuove.listino = (nuove.listino || []).slice();
    const i = nuove.listino.findIndex(y => y && y.id === id);
    if (i === -1) nuove.listino.push(Object.assign({ id }, cambia)); else nuove.listino[i] = Object.assign({}, nuove.listino[i], cambia);
  };
  if (Array.isArray(b.listino)) {
    b.listino.forEach(x => {
      const p = trovaPacchetto(cfg, x && x.id);
      if (!p) return;
      const prezzo = prezzoValido(x.prezzo);
      if (prezzo === null) { errori.push('Controlla il prezzo di “' + p.nome + '”: deve essere un numero, per esempio 25'); return; }
      voceListino(p.id, { prezzo });
    });
  }
  if (b.mezza != null && b.mezza !== '') {
    const mezza = prezzoValido(b.mezza);
    if (mezza === null) errori.push('Controlla il prezzo della mezza giornata: deve essere un numero, per esempio 12');
    else {
      nuove.prezzoMezzaGiornata = mezza;
      /* la riga "Mezza giornata a €…" sotto il prezzo della Giornata, sul sito */
      voceListino('giornata', { nota: 'Mezza giornata a €' + mezza });
    }
  }
  if (b.postazioni != null && b.postazioni !== '') {
    const n = parseInt(b.postazioni, 10);
    if (!(n >= 1 && n <= 60)) errori.push('I posti devono essere tra 1 e 60');
    else nuove.postazioni = n;
  }
  if (b.messaggi && typeof b.messaggi === 'object') {
    nuove.whatsappTesti = Object.assign({}, nuove.whatsappTesti || {});
    Object.keys(cfg.whatsappTesti).forEach(k => {
      if (typeof b.messaggi[k] !== 'string') return;
      const testo = b.messaggi[k].replace(/\r/g, '').trim().slice(0, 600);
      if (!testo) { errori.push('Il messaggio “' + (NOMI_MESSAGGI[k] || k) + '” non può restare vuoto'); return; }
      /* le parole tra graffe le riempie il sito: devono restare */
      const mancanti = (String(cfg.whatsappTesti[k]).match(/\{[a-z]+\}/g) || []).filter(s => testo.indexOf(s) === -1);
      if (mancanti.length) { errori.push('Nel messaggio “' + (NOMI_MESSAGGI[k] || k) + '” deve restare ' + mancanti.join(' e ')); return; }
      nuove.whatsappTesti[k] = testo;
    });
  }
  if (errori.length) throw P.errore('DATI', errori.join('. ') + '.');
  await q(`INSERT INTO impostazioni (chiave, valore, aggiornato_il) VALUES ('config', $1, now())
           ON CONFLICT (chiave) DO UPDATE SET valore = EXCLUDED.valore, aggiornato_il = now()`, [JSON.stringify(nuove)]);
  if (b.postazioni != null && b.postazioni !== '') await sincronizzaPostazioni(nuove.postazioni);
  return coworking(fondi(JSON.parse(JSON.stringify(require('../config.js'))), nuove));
}

module.exports = { clienti, cliente, incassi, righeIncassi, csv, segnaPagato, numeriAdesso, coworking, salvaCoworking, primoDelMese, METODI };
