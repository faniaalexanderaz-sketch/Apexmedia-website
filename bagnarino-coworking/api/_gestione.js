/* =============================================================
   BAGNARINO COWORKING — i dati dell'app di gestione (/gestione)
   Qui si prepara tutto ciò che l'app mostra, già in parole
   semplici: richieste in attesa, chi arriva oggi, calendario del
   mese, chiusure, elenco prenotazioni, avviso, foto, contatti e
   i tre numeri di "Come va".
   La titolare può cambiare solo contenuti (testo dell'avviso,
   foto, numeri di telefono): mai layout, colori o sezioni.
   ============================================================= */
const crypto = require('crypto');
const { q } = require('./_db');
const { modifiche, BASE } = require('./_impostazioni');
const P = require('./_prenotazioni');
const cal = require('./_calendario');
const T = require('./_email-template');
const avvisi = require('./_avvisi');

const ORDINE_FASCIA = { mattina: 1, giornata: 2, pomeriggio: 3 };
const MAX_FOTO = 12;
const MAX_AVVISO = 160;

function emailVera(e) { return e && !/\.invalid$/.test(e) ? e : ''; }
function soloCifre(t) { return String(t || '').replace(/\D/g, ''); }
/* numero per wa.me e per tel: i cellulari italiani prendono il 39 */
function internazionale(t) {
  let n = soloCifre(t).replace(/^00/, '');
  if (/^3\d{8,9}$/.test(n) || /^0\d{5,10}$/.test(n)) n = '39' + n;
  return n;
}

/* una prenotazione pronta per lo schermo */
function riga(p, cfg, oggi) {
  P.completa(p, cfg);
  const mensile = /^mese/.test(p.pacchetto);
  const tel = internazionale(p.telefono);
  return {
    id: p.id, codice: p.codice, stato: p.stato, motivo: p.motivo_annullamento || null,
    nome: p.nome + ' ' + p.cognome, soloNome: p.nome,
    telefono: p.telefono, telefonoLink: tel ? '+' + tel : '', whatsapp: tel, email: emailVera(p.email),
    pacchetto: p.pacchetto, mensile, cosa: mensile || p.pacchetto === 'carnet' ? p.nomePacchetto : p.nomeFascia,
    fascia: p.fascia, quando: T.quando(p), data: p.data_inizio, dataFine: p.data_fine,
    prezzo: p.prezzo_centesimi === 0 ? 'Già pagato' : p.prezzoTesto + ' da pagare in sede',
    nota: p.note || '', ricevuta: p.creato_il,
    passata: p.data_fine < oggi, oggi: p.data_inizio <= oggi && p.data_fine >= oggi
  };
}
function perOrario(a, b) { return (ORDINE_FASCIA[a.fascia] || 2) - (ORDINE_FASCIA[b.fascia] || 2) || a.nome.localeCompare(b.nome); }

async function inAttesa(cfg, oggi) {
  const r = await q(`SELECT ${P.CAMPI} FROM prenotazioni p JOIN clienti c ON c.id = p.cliente_id
                     WHERE p.stato = 'in_attesa' AND p.data_fine >= $1 ORDER BY p.creato_il`, [oggi]);
  return r.map(p => riga(p, cfg, oggi));
}
/* chi occupa un posto in quel giorno (anche gli abbonati del mese) */
async function delGiorno(data, cfg, oggi, stati) {
  const r = await q(
    `SELECT DISTINCT ON (p.id) ${P.CAMPI} FROM occupazioni o JOIN prenotazioni p ON p.id = o.prenotazione_id JOIN clienti c ON c.id = p.cliente_id
     WHERE o.data = $1 AND p.stato = ANY($2::text[]) ORDER BY p.id`, [data, stati]);
  return r.map(p => riga(p, cfg, oggi)).sort(perOrario);
}

/* ---------- Oggi ---------- */
async function oggi(cfg, adesso) {
  const d = cal.oraRoma(adesso).data;
  return {
    oggi: d, chiusura: cal.chiusura(d, cfg),
    inAttesa: await inAttesa(cfg, d),
    arrivi: await delGiorno(d, cfg, d, ['confermata', 'presente', 'assente'])
  };
}

/* ---------- Calendario del mese ---------- */
async function calendario(mese, cfg, adesso) {
  const oggiIso = cal.oraRoma(adesso).data;
  if (!/^\d{4}-\d{2}$/.test(String(mese || '')) || !cal.isoValida(mese + '-01')) mese = oggiIso.slice(0, 7);
  const primo = mese + '-01', ultimo = cal.aggiungiGiorni(cal.aggiungiMesi(primo, 1), -1);
  const conta = await q(
    `SELECT to_char(o.data, 'YYYY-MM-DD') AS d, p.stato, COUNT(DISTINCT p.id)::int AS n
     FROM occupazioni o JOIN prenotazioni p ON p.id = o.prenotazione_id
     WHERE o.data BETWEEN $1 AND $2 AND p.stato IN ('in_attesa', 'confermata', 'presente', 'assente') GROUP BY 1, 2`, [primo, ultimo]);
  const festivi = cal.festivi(+mese.slice(0, 4));
  const giorni = [];
  for (let d = primo; d <= ultimo; d = cal.aggiungiGiorni(d, 1)) {
    const righe = conta.filter(x => x.d === d);
    giorni.push({
      data: d, chiusura: cal.chiusura(d, cfg), festa: festivi.indexOf(d) !== -1, passato: d < oggiIso,
      prenotazioni: righe.filter(x => x.stato !== 'in_attesa').reduce((t, x) => t + x.n, 0),
      inAttesa: righe.filter(x => x.stato === 'in_attesa').reduce((t, x) => t + x.n, 0)
    });
  }
  return { mese, oggi: oggiIso, primoGiornoSettimana: (cal.giornoSettimana(primo) + 6) % 7, giorni };
}

async function giorno(data, cfg, adesso) {
  if (!cal.isoValida(data)) throw P.errore('DATI', 'Giorno non valido.');
  const oggiIso = cal.oraRoma(adesso).data;
  return {
    data, oggi: oggiIso, passato: data < oggiIso, chiusura: cal.chiusura(data, cfg),
    festa: cal.festivi(+data.slice(0, 4)).indexOf(data) !== -1,
    prenotazioni: await delGiorno(data, cfg, oggiIso, ['in_attesa', 'confermata', 'presente', 'assente'])
  };
}

/* ---------- Chiusure ----------
   valore: 'giorno' | 'mattina' | 'pomeriggio' | 'aperto', per uno o più
   giorni di fila. Torna anche chi aveva già una prenotazione o una
   richiesta nelle parti chiuse, così l'app può proporre le scuse. */
async function chiudi(da, a, valore, cfg, adesso) {
  const oggiIso = cal.oraRoma(adesso).data;
  a = a || da;
  if (!cal.isoValida(da) || !cal.isoValida(a) || a < da) throw P.errore('DATI', 'Controlla i giorni: il secondo deve venire dopo il primo.');
  if (da < oggiIso) throw P.errore('DATI', 'Non si può chiudere un giorno già passato.');
  if (a > cal.aggiungiGiorni(da, 92)) throw P.errore('DATI', 'Si possono chiudere al massimo tre mesi alla volta.');
  if (['giorno', 'mattina', 'pomeriggio', 'aperto'].indexOf(valore) === -1) throw P.errore('DATI', 'Scelta non valida.');
  const giorni = [];
  for (let d = da; d <= a; d = cal.aggiungiGiorni(d, 1)) giorni.push(d);
  if (valore === 'aperto') {
    await q('DELETE FROM chiusure WHERE data = ANY($1::date[])', [giorni]);
    return { da, a, valore, giorni: giorni.length, coinvolte: [], abbonati: [] };
  }
  for (const d of giorni) {
    await q(`INSERT INTO chiusure (data, motivo, fascia) VALUES ($1, 'Chiuso', $2)
             ON CONFLICT (data) DO UPDATE SET fascia = EXCLUDED.fascia, motivo = EXCLUDED.motivo`, [d, valore]);
  }
  /* chi aveva già chiesto o prenotato un posto nelle parti ora chiuse */
  const meta = valore === 'giorno' ? ['mattina', 'pomeriggio'] : [valore];
  const r = await q(
    `SELECT DISTINCT ON (p.id) ${P.CAMPI} FROM occupazioni o JOIN prenotazioni p ON p.id = o.prenotazione_id JOIN clienti c ON c.id = p.cliente_id
     WHERE o.data = ANY($1::date[]) AND o.fascia = ANY($2::text[]) AND p.stato IN ('in_attesa', 'confermata') ORDER BY p.id`, [giorni, meta]);
  const tutte = r.map(p => riga(p, cfg, oggiIso)).sort((x, y) => x.data.localeCompare(y.data) || perOrario(x, y));
  return {
    da, a, valore, giorni: giorni.length,
    coinvolte: tutte.filter(x => !x.mensile),   /* a loro si possono mandare le scuse con un tocco */
    abbonati: tutte.filter(x => x.mensile)      /* hanno il mese: li avvisa lei, la prenotazione resta */
  };
}

/* scuse a chi aveva un posto in un giorno chiuso: la prenotazione viene
   annullata e parte l'email giusta (scuse, oppure "non disponibile" se
   era ancora una richiesta) con il link per scegliere un altro momento */
async function mandaScuse(ids, cfg, sito) {
  let fatte = 0;
  for (const id of (Array.isArray(ids) ? ids : []).slice(0, 60)) {
    try {
      const p = await P.annullaDaAdmin(parseInt(id, 10));
      await avvisi.esito(p, cfg, sito);
      fatte++;
    } catch (e) { if (!e.codice) throw e; }
  }
  return { fatte };
}

/* ---------- Prenotazioni ---------- */
async function prenotazioni(cfg, adesso) {
  const d = cal.oraRoma(adesso).data;
  const confermate = await q(
    `SELECT ${P.CAMPI} FROM prenotazioni p JOIN clienti c ON c.id = p.cliente_id
     WHERE p.stato IN ('confermata', 'presente', 'assente') AND p.data_fine >= $1 ORDER BY p.data_inizio, p.id LIMIT 200`, [d]);
  const passate = await q(
    `SELECT ${P.CAMPI} FROM prenotazioni p JOIN clienti c ON c.id = p.cliente_id
     WHERE p.data_fine < $1 OR p.stato = 'annullata' ORDER BY p.data_inizio DESC, p.id DESC LIMIT 60`, [d]);
  return {
    oggi: d,
    daConfermare: await inAttesa(cfg, d),
    confermate: confermate.map(p => riga(p, cfg, d)).sort((a, b) => a.data.localeCompare(b.data) || perOrario(a, b)),
    passate: passate.map(p => riga(p, cfg, d))
  };
}
async function prenotazione(id, cfg, adesso) {
  const d = cal.oraRoma(adesso).data;
  const p = await P.leggi(id);
  const r = riga(p, cfg, d);
  /* "È arrivata/o" si può segnare dal giorno della prenotazione in poi */
  r.puoSegnareArrivo = ['confermata', 'presente', 'assente'].indexOf(p.stato) !== -1 && p.data_inizio <= d && !r.mensile;
  return r;
}

/* ---------- Il mio sito ---------- */
async function salvaModifiche(cambia) {
  const m = JSON.parse(JSON.stringify(await modifiche() || {}));
  cambia(m);
  await q(`INSERT INTO impostazioni (chiave, valore, aggiornato_il) VALUES ('config', $1, now())
           ON CONFLICT (chiave) DO UPDATE SET valore = EXCLUDED.valore, aggiornato_il = now()`, [JSON.stringify(m)]);
  return m;
}
function telefonoVisibile(n) {
  /* 3472249457 → 347 224 9457; i fissi restano con il prefisso staccato */
  const c = soloCifre(n).replace(/^(0039|39)(?=3\d{8,9}$)/, '');
  if (/^3\d{9}$/.test(c)) return c.slice(0, 3) + ' ' + c.slice(3, 6) + ' ' + c.slice(6);
  if (/^3\d{8}$/.test(c)) return c.slice(0, 3) + ' ' + c.slice(3, 6) + ' ' + c.slice(6);
  return c;
}
function sito(cfg) {
  return {
    avviso: { attivo: !!(cfg.avviso && cfg.avviso.attivo), testo: (cfg.avviso && cfg.avviso.testo) || '', massimo: MAX_AVVISO },
    foto: (cfg.galleria || []).map(f => ({ id: f.id, src: f.p, alt: f.alt || '' })), massimoFoto: MAX_FOTO,
    contatti: { telefono: cfg.contatti.cellulareVisibile, whatsapp: telefonoVisibile(cfg.contatti.whatsapp) }
  };
}

async function salvaAvviso(b) {
  const testo = String((b && b.testo) || '').replace(/\s+/g, ' ').trim().slice(0, MAX_AVVISO);
  const attivo = !!(b && b.attivo);
  if (attivo && !testo) throw P.errore('DATI', 'Scrivi il testo dell’avviso prima di mostrarlo sul sito.');
  await salvaModifiche(m => { m.avviso = { attivo, testo }; });
  return { attivo, testo };
}

async function salvaContatti(b) {
  const tel = soloCifre(b && b.telefono).replace(/^(0039|39)(?=3\d{8,9}$)/, '');
  const wa = soloCifre(b && b.whatsapp).replace(/^(0039|39)(?=3\d{8,9}$)/, '');
  if (!/^(3\d{8,9}|0\d{5,10})$/.test(tel)) throw P.errore('DATI', 'Controlla il numero di telefono: per esempio 347 123 4567.');
  if (!/^3\d{8,9}$/.test(wa)) throw P.errore('DATI', 'Controlla il numero di WhatsApp: deve essere un cellulare, per esempio 347 123 4567.');
  const contatti = { cellulareVisibile: telefonoVisibile(tel), cellulare: '+39' + tel, whatsapp: '39' + wa };
  await salvaModifiche(m => { m.contatti = contatti; });
  return { telefono: contatti.cellulareVisibile, whatsapp: telefonoVisibile(wa) };
}

/* le foto arrivano già ridotte dal telefono, in due misure (JPEG, base64) */
function controllaFoto(b64, massimoByte) {
  if (typeof b64 !== 'string' || !/^[A-Za-z0-9+/]+=*$/.test(b64)) return null;
  const buf = Buffer.from(b64, 'base64');
  if (buf.length < 200 || buf.length > massimoByte) return null;
  const jpeg = buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF;
  const webp = buf.toString('latin1', 0, 4) === 'RIFF' && buf.toString('latin1', 8, 12) === 'WEBP';
  return jpeg ? 'image/jpeg' : webp ? 'image/webp' : null;
}
function galleriaAttuale(m) { return (m.galleria || BASE.galleria || []).map(f => Object.assign({}, f)); }

async function aggiungiFoto(b) {
  const tipo = controllaFoto(b && b.grande, 1500000), tipoPiccola = controllaFoto(b && b.piccola, 500000);
  if (!tipo || tipo !== tipoPiccola) throw P.errore('DATI', 'Non sono riuscita a leggere la foto. Riprova con un’altra.');
  const l = Math.max(1, Math.min(4000, parseInt(b.larghezza, 10) || 1280)), a = Math.max(1, Math.min(4000, parseInt(b.altezza, 10) || 960));
  const attuali = galleriaAttuale(await modifiche() || {});
  if (attuali.length >= MAX_FOTO) throw P.errore('DATI', 'Ci sono già ' + MAX_FOTO + ' foto: togline una prima di aggiungerne un’altra.');
  const id = crypto.randomBytes(8).toString('hex');
  await q('INSERT INTO foto (id, grande, piccola, tipo, larghezza, altezza) VALUES ($1, $2, $3, $4, $5, $6)', [id, b.grande, b.piccola, tipo, l, a]);
  await salvaModifiche(m => {
    const g = galleriaAttuale(m);
    g.push({ id, p: '/api/foto?id=' + id + '&t=p', g: '/api/foto?id=' + id + '&t=g', l, a, alt: 'Foto dello spazio del Bagnarino Coworking' });
    m.galleria = g;
  });
  return { id };
}
async function togliFoto(id) {
  id = String(id || '');
  let trovata = false;
  await salvaModifiche(m => {
    const g = galleriaAttuale(m);
    if (g.length <= 1) throw P.errore('DATI', 'Sul sito deve restare almeno una foto.');
    const resto = g.filter(f => f.id !== id);
    trovata = resto.length !== g.length;
    m.galleria = resto;
  });
  if (!trovata) throw P.errore('NON_TROVATA', 'Foto non trovata.');
  await q('DELETE FROM foto WHERE id = $1', [id]);
  return { id };
}
/* rimette una foto appena tolta (pulsante "Annulla") non serve: la foto
   viene tolta davvero solo quando scade il tempo per annullare, nell'app */
async function ordinaFoto(ids) {
  if (!Array.isArray(ids)) throw P.errore('DATI', 'Ordine non valido.');
  await salvaModifiche(m => {
    const g = galleriaAttuale(m);
    const uguali = ids.length === g.length && g.every(f => ids.indexOf(f.id) !== -1) && new Set(ids).size === ids.length;
    if (!uguali) throw P.errore('DATI', 'Le foto sono cambiate nel frattempo: riapri la pagina.');
    m.galleria = ids.map(id => g.find(f => f.id === id));
  });
  return { ok: true };
}

/* una foto per il sito pubblico: t = 'p' (piccola) o 'g' (grande) */
async function leggiFoto(id, t) {
  if (!/^[a-f0-9]{16}$/.test(String(id || ''))) return null;
  const r = await q('SELECT ' + (t === 'p' ? 'piccola' : 'grande') + ' AS dati, tipo FROM foto WHERE id = $1', [id]);
  return r.length ? { tipo: r[0].tipo, dati: Buffer.from(r[0].dati, 'base64') } : null;
}

/* ---------- Come va: tre numeri e basta ---------- */
const GIORNI_SETTIMANA = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
async function comeVa(adesso) {
  const d = cal.oraRoma(adesso).data, primo = d.slice(0, 8) + '01', dopo = cal.aggiungiMesi(primo, 1);
  const pren = await q(
    `SELECT COUNT(*)::int AS n FROM prenotazioni WHERE stato IN ('confermata', 'presente', 'assente') AND data_inizio >= $1 AND data_inizio < $2`, [primo, dopo]);
  const persone = await q(
    `SELECT COUNT(DISTINCT p.cliente_id)::int AS n FROM occupazioni o JOIN prenotazioni p ON p.id = o.prenotazione_id
     WHERE o.data >= $1 AND o.data <= $2 AND p.stato IN ('confermata', 'presente')`, [primo, d]);
  const giorni = await q(
    `SELECT EXTRACT(DOW FROM data_inizio)::int AS g, COUNT(*)::int AS n FROM prenotazioni
     WHERE pacchetto IN ('giornata', 'carnet') AND creato_il > now() - interval '90 days' AND (stato <> 'annullata' OR motivo_annullamento = 'non_disponibile')
     GROUP BY 1 ORDER BY n DESC, g LIMIT 2`);
  const nomi = giorni.filter(x => x.n > 0).map(x => GIORNI_SETTIMANA[x.g]);
  const mese = new Date(primo + 'T12:00:00Z').toLocaleDateString('it-IT', { month: 'long', timeZone: 'Europe/Rome' });
  return {
    mese, prenotazioni: pren[0].n, persone: persone[0].n,
    giorniPiuRichiesti: nomi.length ? (nomi[0].charAt(0).toUpperCase() + nomi[0].slice(1)) + (nomi[1] ? ' e ' + nomi[1] : '') : ''
  };
}

module.exports = {
  oggi, calendario, giorno, chiudi, mandaScuse, prenotazioni, prenotazione,
  sito, salvaAvviso, salvaContatti, aggiungiFoto, togliFoto, ordinaFoto, leggiFoto, comeVa, riga, MAX_FOTO
};
