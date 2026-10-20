/* =============================================================
   BAGNARINO COWORKING — API dell'area riservata (una funzione)
   GET  ?azione=oggi | calendario&da= | clienti&cerca= |
            incassi&periodo=giorno|settimana|mese&da= | csv&da=&a= | impostazioni
   POST ?azione=login | esci | presenza | pagato | prenotazione |
            annulla | chiusura | impostazioni
   Tutto (tranne login) richiede la sessione della titolare.
   ============================================================= */
const crypto = require('crypto');
const { q, disponibile } = require('./_db');
const { impostazioni, modifiche, fondi, pacchetto: trovaPacchetto } = require('./_impostazioni');
const P = require('./_prenotazioni');
const R = require('./_report');
const cal = require('./_calendario');
const T = require('./_email-template');
const { inviaEmail } = require('./_email');
const { creaIcs } = require('./_ics');
const A = require('./_admin');
const { corpo, ip, json, errore, sitoUrl } = require('./_http');

const STATI_ATTIVI = ['confermata', 'presente', 'assente'];

function lunedi(iso) { const g = cal.giornoSettimana(iso); return cal.aggiungiGiorni(iso, -((g + 6) % 7)); }
function nomePacchetto(cfg, id) { const p = trovaPacchetto(cfg, id); return p ? p.nome : id; }
function emailVera(e) { return e && !/\.invalid$/.test(e) ? e : ''; }

/* ---------- arrivi di un giorno ---------- */
async function arrivi(data, cfg) {
  const r = await q(
    `SELECT p.id, p.codice, p.pacchetto, p.stato, p.pagato, p.metodo_pagamento, p.prezzo_centesimi, p.omaggio, p.carnet_id, p.note,
            to_char(p.data_inizio, 'YYYY-MM-DD') AS data_inizio, to_char(p.data_fine, 'YYYY-MM-DD') AS data_fine,
            c.id AS cliente_id, c.nome, c.cognome, c.telefono, c.email, s.nome AS postazione,
            COALESCE(f.timbri, 0) AS timbri
     FROM occupazioni o JOIN prenotazioni p ON p.id = o.prenotazione_id JOIN clienti c ON c.id = p.cliente_id
     JOIN postazioni s ON s.id = o.postazione_id LEFT JOIN fidelity f ON f.cliente_id = c.id
     WHERE o.data = $1 AND p.stato <> 'annullata' ORDER BY s.id`, [data]);
  return r.map(x => Object.assign(x, {
    nomePacchetto: nomePacchetto(cfg, x.pacchetto), email: emailVera(x.email),
    /* le presenze (e i timbri) valgono per le giornate singole e gli ingressi del carnet */
    conPresenza: x.data_inizio === data && (x.pacchetto === 'giornata' || x.pacchetto === 'carnet'),
    primoGiorno: x.data_inizio === data
  }));
}

async function oggi(cfg) {
  const oggi = cal.oraRoma().data;
  let prossimo = cal.aggiungiGiorni(oggi, 1);
  for (let i = 0; i < 10 && !cal.aperto(prossimo, cfg, cfg.chiusureTutte); i++) prossimo = cal.aggiungiGiorni(prossimo, 1);
  const mese = R.primoDelMese(oggi), mesePrima = cal.aggiungiMesi(mese, -1), meseDopo = cal.aggiungiMesi(mese, 1);
  const lun = lunedi(oggi), lunPrima = cal.aggiungiGiorni(lun, -7);

  const incasso = async (da, a) => (await q(
    `SELECT COALESCE(SUM(prezzo_centesimi), 0)::int AS c FROM prenotazioni WHERE pagato AND pagato_il IS NOT NULL
     AND (pagato_il AT TIME ZONE 'Europe/Rome')::date >= $1 AND (pagato_il AT TIME ZONE 'Europe/Rome')::date < $2`, [da, a]))[0].c;
  const create = async (da, a) => (await q(
    `SELECT COUNT(*)::int AS n FROM prenotazioni WHERE stato <> 'annullata'
     AND (creato_il AT TIME ZONE 'Europe/Rome')::date >= $1 AND (creato_il AT TIME ZONE 'Europe/Rome')::date < $2`, [da, a]))[0].n;
  const giorniSett = ((cal.giornoSettimana(oggi) + 6) % 7) + 1; /* lun = 1 */

  const posti = (await q('SELECT COUNT(*)::int AS n FROM postazioni WHERE attiva'))[0].n;
  const occupate = (await q('SELECT COUNT(*)::int AS n FROM occupazioni WHERE data = $1', [oggi]))[0].n;
  const daIncassare = (await q(
    `SELECT COALESCE(SUM(prezzo_centesimi), 0)::int AS c, COUNT(*)::int AS n FROM prenotazioni
     WHERE NOT pagato AND prezzo_centesimi > 0 AND stato <> 'annullata' AND data_inizio <= $1`, [oggi]))[0];

  /* ultime 8 settimane: prenotazioni ricevute */
  const sett = await q(
    `SELECT to_char(date_trunc('week', (creato_il AT TIME ZONE 'Europe/Rome')::date), 'YYYY-MM-DD') AS s, COUNT(*)::int AS n
     FROM prenotazioni WHERE stato <> 'annullata' AND (creato_il AT TIME ZONE 'Europe/Rome')::date >= $1 GROUP BY 1`, [cal.aggiungiGiorni(lun, -49)]);
  const settimane = [];
  for (let i = 7; i >= 0; i--) { const s = cal.aggiungiGiorni(lun, -7 * i); const t = sett.find(x => x.s === s); settimane.push({ inizio: s, n: t ? t.n : 0 }); }

  /* ultimi 6 mesi: incassi */
  const mesiDb = await q(
    `SELECT to_char(date_trunc('month', (pagato_il AT TIME ZONE 'Europe/Rome')::date), 'YYYY-MM-DD') AS m, COALESCE(SUM(prezzo_centesimi), 0)::int AS c
     FROM prenotazioni WHERE pagato AND pagato_il IS NOT NULL AND (pagato_il AT TIME ZONE 'Europe/Rome')::date >= $1 GROUP BY 1`, [cal.aggiungiMesi(mese, -5)]);
  const mesi = [];
  for (let i = 5; i >= 0; i--) { const m = cal.aggiungiMesi(mese, -i); const t = mesiDb.find(x => x.m === m); mesi.push({ inizio: m, centesimi: t ? t.c : 0 }); }

  /* da dove arrivano (ultimi 90 giorni) */
  const orig = await q(`SELECT origine FROM prenotazioni WHERE stato <> 'annullata' AND creato_il > now() - interval '90 days'`);
  const fonti = {};
  orig.forEach(r => { const f = R.classificaFonte(r.origine); fonti[f] = (fonti[f] || 0) + 1; });

  return {
    oggi, prossimo,
    kpi: {
      incassoMese: await incasso(mese, meseDopo), incassoMesePrima: await incasso(mesePrima, mese),
      settimana: await create(lun, cal.aggiungiGiorni(oggi, 1)),
      settimanaPrima: await create(lunPrima, cal.aggiungiGiorni(lunPrima, giorniSett)),
      occupate, postazioni: posti, daIncassare: daIncassare.c, daIncassareN: daIncassare.n
    },
    arriviOggi: await arrivi(oggi, cfg),
    arriviProssimo: await arrivi(prossimo, cfg),
    settimane, mesi,
    fonti: Object.keys(fonti).map(k => ({ fonte: k, n: fonti[k] })).sort((a, b) => b.n - a.n)
  };
}

async function calendario(da, cfg) {
  const inizio = lunedi(cal.isoValida(da) ? da : cal.oraRoma().data);
  const fine = cal.aggiungiGiorni(inizio, 6);
  const posti = await q('SELECT id, nome, attiva FROM postazioni ORDER BY id');
  const occ = await q(
    `SELECT to_char(o.data, 'YYYY-MM-DD') AS data, o.postazione_id, p.id, p.codice, p.pacchetto, p.stato, c.nome, c.cognome, c.telefono
     FROM occupazioni o JOIN prenotazioni p ON p.id = o.prenotazione_id JOIN clienti c ON c.id = p.cliente_id
     WHERE o.data BETWEEN $1 AND $2`, [inizio, fine]);
  const chiusure = await q(`SELECT to_char(data, 'YYYY-MM-DD') AS data, motivo FROM chiusure WHERE data BETWEEN $1 AND $2`, [inizio, fine]);
  const giorni = [];
  for (let i = 0; i < 7; i++) {
    const d = cal.aggiungiGiorni(inizio, i);
    const ch = chiusure.find(c => c.data === d);
    giorni.push({
      data: d, aperto: cal.aperto(d, cfg, cfg.chiusureTutte), chiusoDaTe: !!ch, motivo: ch ? ch.motivo : null,
      festivo: cal.festivi(+d.slice(0, 4)).indexOf(d) !== -1,
      posti: posti.filter(p => p.attiva).map(p => {
        const o = occ.find(x => x.data === d && x.postazione_id === p.id);
        return { postazione: p.nome, prenotazione: o ? { id: o.id, codice: o.codice, nome: o.nome + ' ' + o.cognome, telefono: o.telefono,
          pacchetto: nomePacchetto(cfg, o.pacchetto), stato: o.stato } : null };
      })
    });
  }
  return { inizio, giorni, oggi: cal.oraRoma().data };
}

async function clienti(cerca) {
  const oggi = cal.oraRoma().data, filtro = '%' + String(cerca || '').trim().toLowerCase() + '%';
  const r = await q(
    `SELECT c.id, c.nome, c.cognome, c.email, c.telefono, c.piva_cf, c.consenso_marketing,
       (SELECT COUNT(*)::int FROM prenotazioni p WHERE p.cliente_id = c.id AND p.stato <> 'annullata') AS prenotazioni,
       (SELECT COALESCE(SUM(prezzo_centesimi), 0)::int FROM prenotazioni p WHERE p.cliente_id = c.id AND p.pagato) AS speso,
       (SELECT to_char(MAX(o.data), 'YYYY-MM-DD') FROM occupazioni o JOIN prenotazioni p ON p.id = o.prenotazione_id
          WHERE p.cliente_id = c.id AND o.data <= $2) AS ultimo,
       (SELECT COUNT(*)::int FROM occupazioni o JOIN prenotazioni p ON p.id = o.prenotazione_id
          WHERE p.cliente_id = c.id AND o.data <= $2 AND o.data > $2::date - 30) AS ingressi30,
       (SELECT COALESCE(SUM(ingressi_totali - ingressi_usati), 0)::int FROM carnet k
          WHERE k.cliente_id = c.id AND (k.scadenza IS NULL OR k.scadenza >= $2)) AS carnet,
       COALESCE(f.timbri, 0) AS timbri, COALESCE(f.omaggi_disponibili, 0) AS omaggi
     FROM clienti c LEFT JOIN fidelity f ON f.cliente_id = c.id
     WHERE lower(c.nome || ' ' || c.cognome || ' ' || c.email || ' ' || c.telefono) LIKE $1
     ORDER BY c.cognome, c.nome LIMIT 300`, [filtro, oggi]);
  return r.map(c => Object.assign(c, {
    email: emailVera(c.email),
    abituale: c.ingressi30 >= 4,
    daRichiamare: !!c.ultimo && c.ultimo < cal.aggiungiGiorni(oggi, -30)
  }));
}

function intervallo(periodo, da) {
  da = cal.isoValida(da) ? da : cal.oraRoma().data;
  if (periodo === 'giorno') return [da, da];
  if (periodo === 'settimana') { const l = lunedi(da); return [l, cal.aggiungiGiorni(l, 6)]; }
  const m = R.primoDelMese(da); return [m, cal.aggiungiGiorni(cal.aggiungiMesi(m, 1), -1)];
}

async function righeIncassi(da, a, cfg) {
  const r = await q(
    `SELECT p.id, p.codice, p.pacchetto, p.stato, p.pagato, p.metodo_pagamento, p.prezzo_centesimi, p.omaggio, p.carnet_id,
            to_char(p.data_inizio, 'YYYY-MM-DD') AS data, to_char(p.pagato_il AT TIME ZONE 'Europe/Rome', 'YYYY-MM-DD') AS pagato_il,
            c.nome, c.cognome, c.telefono, c.email, c.piva_cf
     FROM prenotazioni p JOIN clienti c ON c.id = p.cliente_id
     WHERE p.data_inizio BETWEEN $1 AND $2 AND p.stato <> 'annullata' ORDER BY p.data_inizio, c.cognome`, [da, a]);
  return r.map(x => Object.assign(x, { nomePacchetto: nomePacchetto(cfg, x.pacchetto), email: emailVera(x.email) }));
}

async function incassi(periodo, da, cfg) {
  const [inizio, fine] = intervallo(periodo, da);
  const righe = await righeIncassi(inizio, fine, cfg);
  const tot = righe.reduce((t, r) => { t.previsto += r.prezzo_centesimi; if (r.pagato) t.incassato += r.prezzo_centesimi; return t; }, { previsto: 0, incassato: 0 });
  return { periodo: periodo || 'mese', inizio, fine, righe, totali: tot };
}

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

/* ---------- impostazioni ---------- */
async function salvaImpostazioni(b, cfg) {
  const m = await modifiche();
  const nuove = JSON.parse(JSON.stringify(m || {}));
  const errori = [];
  if (Array.isArray(b.listino)) {
    nuove.listino = (nuove.listino || []).slice();
    b.listino.forEach(x => {
      const p = trovaPacchetto(cfg, x.id), prezzo = Math.round(Number(String(x.prezzo).replace(',', '.')));
      if (!p) return;
      if (!(prezzo >= 0 && prezzo <= 5000)) { errori.push('Prezzo non valido per ' + p.nome); return; }
      const i = nuove.listino.findIndex(y => y.id === x.id);
      const v = { id: x.id, prezzo };
      if (i === -1) nuove.listino.push(v); else nuove.listino[i] = Object.assign(nuove.listino[i], v);
    });
  }
  if (b.postazioni != null) {
    const n = parseInt(b.postazioni, 10);
    if (!(n >= 1 && n <= 60)) errori.push('Il numero di postazioni deve essere tra 1 e 60');
    else nuove.postazioni = n;
  }
  if (b.orari) {
    const ok = s => /^([01]?\d|2[0-3]):[0-5]\d$/.test(String(s || ''));
    if (!ok(b.orari.apertura) || !ok(b.orari.chiusura) || cal.minuti(b.orari.apertura) >= cal.minuti(b.orari.chiusura)) errori.push('Controlla gli orari di apertura e chiusura');
    else {
      const a = b.orari.apertura.replace(/^0/, ''), c = b.orari.chiusura.replace(/^0/, '');
      nuove.orari = Object.assign({}, nuove.orari || {}, {
        apertura: a, chiusura: c, testoBreve: 'Lun–Ven ' + a + '–' + c,
        testoLungo: 'Dal lunedì al venerdì, ' + a + '–' + c + '. Sabato e domenica chiuso.'
      });
      if (ok(b.orari.ultimaPrenotazioneOggi)) nuove.orari.ultimaPrenotazioneOggi = b.orari.ultimaPrenotazioneOggi;
    }
  }
  if (b.whatsappTesti && typeof b.whatsappTesti === 'object') {
    nuove.whatsappTesti = Object.assign({}, nuove.whatsappTesti || {});
    Object.keys(cfg.whatsappTesti).forEach(k => {
      if (typeof b.whatsappTesti[k] === 'string' && b.whatsappTesti[k].trim()) nuove.whatsappTesti[k] = b.whatsappTesti[k].trim().slice(0, 600);
    });
  }
  if (errori.length) { const e = P.errore('DATI', errori.join('. ') + '.'); throw e; }
  await q(`INSERT INTO impostazioni (chiave, valore, aggiornato_il) VALUES ('config', $1, now())
           ON CONFLICT (chiave) DO UPDATE SET valore = EXCLUDED.valore, aggiornato_il = now()`, [JSON.stringify(nuove)]);
  if (nuove.postazioni) await sincronizzaPostazioni(nuove.postazioni);
  return fondi(JSON.parse(JSON.stringify(require('../config.js'))), nuove);
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

/* ---------- accesso: massimo 10 tentativi l'ora ---------- */
async function controllaTentativi(req) {
  if (!disponibile()) return;
  const imp = 'login:' + crypto.createHash('sha256').update(ip(req) + '::' + (process.env.CRON_SECRET || 'bgn')).digest('hex').slice(0, 24);
  const r = await q("SELECT COUNT(*)::int AS n FROM tentativi WHERE impronta = $1 AND creato_il > now() - interval '1 hour'", [imp]);
  if (r[0].n >= 10) throw P.errore('TROPPI', 'Troppi tentativi. Riprova tra un’ora.');
  await q('INSERT INTO tentativi (impronta) VALUES ($1)', [imp]);
}

module.exports = async (req, res) => {
  const azione = req.query.azione;
  try {
    if (req.method === 'POST' && azione === 'login') {
      if (!process.env.ADMIN_PASSWORD) { json(res, 501, { errore: 'ADMIN_SPENTO', messaggio: 'L’area riservata non è ancora configurata (manca ADMIN_PASSWORD).' }); return; }
      await controllaTentativi(req);
      if (!A.confrontoSicuro(String(corpo(req).password || ''), process.env.ADMIN_PASSWORD)) {
        json(res, 401, { errore: 'PASSWORD', messaggio: 'Password sbagliata. Riprova.' }); return;
      }
      A.apriSessione(req, res);
      json(res, 200, { ok: true });
      return;
    }
    if (req.method === 'POST' && azione === 'esci') { A.chiudiSessione(req, res); json(res, 200, { ok: true }); return; }
    if (!A.sessioneValida(req)) { json(res, 401, { errore: 'NON_AUTORIZZATO', messaggio: 'Accesso scaduto: inserisci di nuovo la password.' }); return; }
    if (!disponibile()) { json(res, 501, { errore: 'DB_ASSENTE', messaggio: 'Il database non è ancora collegato: le prenotazioni online non sono attive.' }); return; }

    const cfg = await impostazioni();
    if (req.method === 'GET') {
      if (azione === 'oggi') { json(res, 200, await oggi(cfg)); return; }
      if (azione === 'calendario') { json(res, 200, await calendario(req.query.da, cfg)); return; }
      if (azione === 'clienti') { json(res, 200, { clienti: await clienti(req.query.cerca) }); return; }
      if (azione === 'incassi') { json(res, 200, await incassi(req.query.periodo, req.query.da, cfg)); return; }
      if (azione === 'csv') {
        const da = cal.isoValida(req.query.da) ? req.query.da : R.primoDelMese(cal.oraRoma().data);
        const a = cal.isoValida(req.query.a) ? req.query.a : cal.aggiungiGiorni(cal.aggiungiMesi(da, 1), -1);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="incassi-bagnarino-' + da + '_' + a + '.csv"');
        res.setHeader('Cache-Control', 'no-store');
        res.end(csv(await righeIncassi(da, a, cfg)));
        return;
      }
      if (azione === 'impostazioni') {
        const ch = await q(`SELECT to_char(data, 'YYYY-MM-DD') AS data, motivo FROM chiusure WHERE data >= CURRENT_DATE ORDER BY data`);
        const posti = (await q('SELECT COUNT(*)::int AS n FROM postazioni WHERE attiva'))[0].n;
        json(res, 200, { listino: cfg.listino.map(p => ({ id: p.id, nome: p.nome, prezzo: p.prezzo, unita: p.unita })),
          postazioni: posti, orari: cfg.orari, whatsappTesti: cfg.whatsappTesti, chiusure: ch });
        return;
      }
    }
    if (req.method === 'POST') {
      const b = corpo(req);
      if (azione === 'presenza') { json(res, 200, await P.segnaPresenza(parseInt(b.id, 10), b.stato)); return; }
      if (azione === 'pagato') {
        const pagato = b.pagato === true, metodo = ['contanti', 'carta', 'bonifico', 'online'].indexOf(b.metodo) !== -1 ? b.metodo : null;
        const r = await q(`UPDATE prenotazioni SET pagato = $2, metodo_pagamento = $3, pagato_il = CASE WHEN $2 THEN COALESCE(pagato_il, now()) ELSE NULL END
                           WHERE id = $1 RETURNING id, pagato, metodo_pagamento`, [parseInt(b.id, 10), pagato, pagato ? metodo : null]);
        if (!r.length) throw P.errore('NON_TROVATA', 'Prenotazione non trovata.');
        json(res, 200, r[0]); return;
      }
      if (azione === 'prenotazione') {
        const p = await P.prenota(b, { manuale: true });
        if (emailVera(p.email)) {
          const sito = sitoUrl(req), m = T.confermaCliente(p, cfg, sito);
          await inviaEmail({ to: p.email, subject: m.oggetto, html: m.html, testo: m.testo, rispondiA: cfg.azienda.email,
            allegati: [{ nome: 'prenotazione-' + p.codice + '.ics', tipo: 'text/calendar', contenuto: creaIcs(p, cfg) }] });
        }
        json(res, 200, { codice: p.codice, id: p.id, prezzoTesto: p.prezzoTesto }); return;
      }
      if (azione === 'annulla') {
        const p = await P.annullaDaAdmin(parseInt(b.id, 10));
        if (emailVera(p.email) && b.avvisa !== false) {
          const m = T.annullataCliente(p, cfg, sitoUrl(req));
          await inviaEmail({ to: p.email, subject: m.oggetto, html: m.html });
        }
        json(res, 200, { codice: p.codice, stato: 'annullata' }); return;
      }
      if (azione === 'chiusura') {
        if (!cal.isoValida(b.data)) throw P.errore('DATI', 'Data non valida.');
        if (b.chiudi === false) await q('DELETE FROM chiusure WHERE data = $1', [b.data]);
        else await q('INSERT INTO chiusure (data, motivo) VALUES ($1, $2) ON CONFLICT (data) DO UPDATE SET motivo = EXCLUDED.motivo',
          [b.data, String(b.motivo || 'Chiuso').slice(0, 80)]);
        const giaPrenotati = (await q('SELECT COUNT(*)::int AS n FROM occupazioni WHERE data = $1', [b.data]))[0].n;
        json(res, 200, { data: b.data, chiuso: b.chiudi !== false, giaPrenotati }); return;
      }
      if (azione === 'impostazioni') { const c = await salvaImpostazioni(b, cfg); json(res, 200, { ok: true, listino: c.listino, orari: c.orari }); return; }
    }
    json(res, 404, { errore: 'AZIONE', messaggio: 'Azione sconosciuta' });
  } catch (err) { errore(res, err); }
};
