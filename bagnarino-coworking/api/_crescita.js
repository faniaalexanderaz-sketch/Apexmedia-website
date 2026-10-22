/* =============================================================
   BAGNARINO COWORKING — scheda "Crescita" dell'area riservata
   Due fonti di numeri, mese per mese (ultimi 12 mesi):
   1. AUTOMATICI, dal database: prenotazioni, incassi, nuovi
      clienti, clienti che tornano, arrivati / non venuti, canali
      di provenienza (stessa classificazione del widget "Da dove
      arrivano le prenotazioni" e del report mensile).
   2. A MANO, da Apex Media (tabella marketing_mesi): follower e
      persone raggiunte su Instagram e Facebook, azioni sul profilo
      Google, recensioni, visite al sito, spesa pubblicitaria e una
      nota "Cosa abbiamo fatto questo mese". Nessuna chiave API.
   Da qui escono anche i numeri riassuntivi (KPI) e la frase in
   italiano semplice in cima alla scheda, così sono verificabili
   dai test e uguali per tutti.
   ============================================================= */
const { q } = require('./_db');
const cal = require('./_calendario');
const { classificaFonte, primoDelMese } = require('./_report');

/* campi inseribili a mano: etichetta, limite massimo, decimali */
const CAMPI = {
  instagram_follower:     { nome: 'Follower Instagram', max: 10000000, dec: 0 },
  instagram_copertura:    { nome: 'Persone raggiunte su Instagram', max: 100000000, dec: 0 },
  facebook_follower:      { nome: 'Follower Facebook', max: 10000000, dec: 0 },
  facebook_copertura:     { nome: 'Persone raggiunte su Facebook', max: 100000000, dec: 0 },
  google_visualizzazioni: { nome: 'Visualizzazioni del profilo Google', max: 100000000, dec: 0 },
  google_chiamate:        { nome: 'Chiamate da Google', max: 1000000, dec: 0 },
  google_indicazioni:     { nome: 'Richieste di indicazioni', max: 1000000, dec: 0 },
  google_clic_sito:       { nome: 'Clic sul sito da Google', max: 1000000, dec: 0 },
  recensioni_numero:      { nome: 'Numero di recensioni', max: 100000, dec: 0 },
  recensioni_media:       { nome: 'Voto medio delle recensioni', max: 5, dec: 1 },
  visite_sito:            { nome: 'Visite al sito', max: 100000000, dec: 0 },
  contatti_whatsapp:      { nome: 'Contatti su WhatsApp', max: 1000000, dec: 0 },
  spesa_meta:             { nome: 'Spesa pubblicità Meta', max: 1000000, dec: 2 },
  spesa_google:           { nome: 'Spesa pubblicità Google', max: 1000000, dec: 2 }
};
const NOTA_MAX = 1000;
/* canali "a pagamento" usati per il ritorno della pubblicità */
const CANALI_PUBBLICITA = ['Instagram', 'Facebook', 'Google Ads'];
const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];

function errore(codice, messaggio) { const e = new Error(messaggio); e.codice = codice; return e; }
function nomeMese(iso) { return MESI[+iso.slice(5, 7) - 1]; }
/* "a settembre", ma "ad agosto", "ad aprile" */
function aMese(nome) { return (/^a/.test(nome) ? 'ad ' : 'a ') + nome; }
function meseValido(m, adesso) {
  const s = String(m || '');
  const iso = /^\d{4}-\d{2}$/.test(s) ? s + '-01' : s;
  if (!cal.isoValida(iso)) return null;
  const primo = primoDelMese(iso);
  const corrente = primoDelMese(cal.oraRoma(adesso).data);
  if (primo > corrente || primo < '2020-01-01') return null;
  return primo;
}

/* ---------- salvataggio dei numeri di un mese (solo Apex Media) ---------- */
function numero(v) {
  if (v == null) return null;
  const s = String(v).trim().replace(/\s/g, '').replace(/€/g, '');
  if (s === '') return null;
  /* "1.234" all'italiana = mille; "4,5" = quattro e mezzo */
  const norm = /^\d{1,3}(\.\d{3})+(,\d+)?$/.test(s) ? s.replace(/\./g, '').replace(',', '.') : s.replace(',', '.');
  const n = Number(norm);
  return Number.isFinite(n) ? n : NaN;
}

function validaMarketing(b, adesso) {
  b = b || {};
  const mese = meseValido(b.mese, adesso);
  const errori = [];
  if (!mese) errori.push('Mese non valido (non si possono inserire mesi futuri)');
  const dati = {};
  const sorgente = b.dati && typeof b.dati === 'object' ? b.dati : {};
  Object.keys(CAMPI).forEach(k => {
    const c = CAMPI[k], n = numero(sorgente[k]);
    if (n === null) return;
    if (Number.isNaN(n) || n < 0 || n > c.max) { errori.push(c.nome + ': inserisci un numero tra 0 e ' + c.max.toLocaleString('it-IT')); return; }
    const f = Math.pow(10, c.dec);
    dati[k] = Math.round(n * f) / f;
  });
  const note = b.note == null ? '' : String(b.note).trim();
  if (note.length > NOTA_MAX) errori.push('La nota può essere lunga al massimo ' + NOTA_MAX + ' caratteri');
  if (errori.length) throw errore('DATI', errori.join('. ') + '.');
  return { mese, dati, note: note || null };
}

async function salvaMarketing(b, adesso) {
  const v = validaMarketing(b, adesso);
  const r = await q(
    `INSERT INTO marketing_mesi (mese, dati, note, aggiornato_il) VALUES ($1, $2, $3, now())
     ON CONFLICT (mese) DO UPDATE SET dati = EXCLUDED.dati, note = EXCLUDED.note, aggiornato_il = now()
     RETURNING to_char(mese, 'YYYY-MM-DD') AS mese, dati, note`, [v.mese, JSON.stringify(v.dati), v.note]);
  const riga = r[0];
  if (typeof riga.dati === 'string') riga.dati = JSON.parse(riga.dati);
  return riga;
}

/* ---------- numeri mese per mese ---------- */
function somma(m, chiavi) {
  let t = 0, c = 0;
  chiavi.forEach(k => { if (m && m[k] != null) { t += m[k]; c++; } });
  return c ? t : null;
}

async function serieMensile(meseFine) {
  const inizio = cal.aggiungiMesi(meseFine, -11), fine = cal.aggiungiMesi(meseFine, 1);
  /* si legge un mese in più prima, per il confronto del primo mese */
  const da = cal.aggiungiMesi(inizio, -1);
  const mm = `to_char(date_trunc('month', (creato_il AT TIME ZONE 'Europe/Rome')::date), 'YYYY-MM-DD')`;

  const pren = await q(
    `SELECT ${mm} AS m, cliente_id, stato, prezzo_centesimi, origine FROM prenotazioni
     WHERE stato <> 'annullata' AND (creato_il AT TIME ZONE 'Europe/Rome')::date >= $1 AND (creato_il AT TIME ZONE 'Europe/Rome')::date < $2`, [da, fine]);
  const primi = await q(
    `SELECT cliente_id, to_char(MIN((creato_il AT TIME ZONE 'Europe/Rome')::date), 'YYYY-MM-DD') AS primo
     FROM prenotazioni WHERE stato <> 'annullata' GROUP BY cliente_id`);
  const primoDi = {};
  primi.forEach(r => { primoDi[r.cliente_id] = r.primo; });
  const inc = await q(
    `SELECT to_char(date_trunc('month', (pagato_il AT TIME ZONE 'Europe/Rome')::date), 'YYYY-MM-DD') AS m, COALESCE(SUM(prezzo_centesimi), 0)::int AS c
     FROM prenotazioni WHERE pagato AND pagato_il IS NOT NULL
     AND (pagato_il AT TIME ZONE 'Europe/Rome')::date >= $1 AND (pagato_il AT TIME ZONE 'Europe/Rome')::date < $2 GROUP BY 1`, [da, fine]);
  const nuovi = await q(
    `SELECT ${mm} AS m, COUNT(*)::int AS n FROM clienti
     WHERE (creato_il AT TIME ZONE 'Europe/Rome')::date >= $1 AND (creato_il AT TIME ZONE 'Europe/Rome')::date < $2 GROUP BY 1`, [da, fine]);
  const mk = await q(
    `SELECT to_char(mese, 'YYYY-MM-DD') AS m, dati, note, to_char(aggiornato_il AT TIME ZONE 'Europe/Rome', 'YYYY-MM-DD') AS aggiornato
     FROM marketing_mesi WHERE mese >= $1 AND mese < $2`, [da, fine]);

  const mesi = [];
  for (let d = da; d < fine; d = cal.aggiungiMesi(d, 1)) {
    const righe = pren.filter(r => r.m === d);
    const canali = {}, valoreCanali = {}, clienti = {};
    let valore = 0, presenti = 0, assenti = 0;
    righe.forEach(r => {
      const f = classificaFonte(typeof r.origine === 'string' ? JSON.parse(r.origine) : r.origine);
      canali[f] = (canali[f] || 0) + 1;
      valoreCanali[f] = (valoreCanali[f] || 0) + r.prezzo_centesimi;
      valore += r.prezzo_centesimi;
      if (r.stato === 'presente') presenti++;
      if (r.stato === 'assente') assenti++;
      clienti[r.cliente_id] = true;
    });
    const ids = Object.keys(clienti);
    const ritorni = ids.filter(id => primoDi[id] && primoDi[id] < d).length;
    const riga = mk.find(r => r.m === d);
    const dati = riga ? (typeof riga.dati === 'string' ? JSON.parse(riga.dati) : riga.dati) : null;
    mesi.push({
      mese: d, prenotazioni: righe.length, valore, incassato: (inc.find(r => r.m === d) || { c: 0 }).c,
      nuoviClienti: (nuovi.find(r => r.m === d) || { n: 0 }).n,
      clienti: ids.length, ritorni, quotaRitorni: ids.length ? Math.round(ritorni / ids.length * 100) : null,
      presenti, assenti, canali, valoreCanali,
      marketing: dati && Object.keys(dati).length ? dati : null,
      note: riga ? riga.note : null, aggiornato: riga ? riga.aggiornato : null
    });
  }
  return mesi;
}

/* ---------- numeri riassuntivi del mese scelto ---------- */
function kpi(m, p) {
  const mk = m.marketing || {}, pk = (p && p.marketing) || {};
  const spesa = somma(mk, ['spesa_meta', 'spesa_google']);
  const valorePubblicita = CANALI_PUBBLICITA.reduce((t, c) => t + (m.valoreCanali[c] || 0), 0);
  const prenPubblicita = CANALI_PUBBLICITA.reduce((t, c) => t + (m.canali[c] || 0), 0);
  const v = (valore, prima) => ({ valore: valore == null ? null : valore, prima: prima == null ? null : prima });
  return {
    prenotazioni: v(m.prenotazioni, p ? p.prenotazioni : null),
    incasso: v(m.incassato, p ? p.incassato : null),
    valorePrenotato: v(m.valore, p ? p.valore : null),
    nuoviClienti: v(m.nuoviClienti, p ? p.nuoviClienti : null),
    quotaRitorni: v(m.quotaRitorni, p ? p.quotaRitorni : null),
    followerInstagram: v(mk.instagram_follower, pk.instagram_follower),
    followerFacebook: v(mk.facebook_follower, pk.facebook_follower),
    personeRaggiunte: v(somma(mk, ['instagram_copertura', 'facebook_copertura']), somma(pk, ['instagram_copertura', 'facebook_copertura'])),
    azioniGoogle: v(somma(mk, ['google_chiamate', 'google_indicazioni', 'google_clic_sito']), somma(pk, ['google_chiamate', 'google_indicazioni', 'google_clic_sito'])),
    recensioniMedia: v(mk.recensioni_media, pk.recensioni_media),
    recensioniNumero: v(mk.recensioni_numero, pk.recensioni_numero),
    visiteSito: v(mk.visite_sito, pk.visite_sito),
    spesa: v(spesa, somma(pk, ['spesa_meta', 'spesa_google'])),
    /* costo per prenotazione: spesa del mese ÷ TUTTE le prenotazioni del mese */
    costoPrenotazione: v(spesa && m.prenotazioni ? Math.round(spesa * 100 / m.prenotazioni) : null, null),
    /* ritorno: valore delle prenotazioni arrivate da Instagram, Facebook e Google Ads ÷ spesa */
    ritornoPubblicita: v(spesa ? Math.round(valorePubblicita / spesa) / 100 : null, null),
    prenotazioniDaPubblicita: v(prenPubblicita, null),
    arrivati: v(m.presenti, p ? p.presenti : null),
    nonVenuti: v(m.assenti, p ? p.assenti : null)
  };
}

function percento(a, b) { return b ? Math.round((a - b) / b * 100) : null; }
function euroTesto(centesimi, dec) {
  return '€' + (centesimi / 100).toLocaleString('it-IT', { minimumFractionDigits: dec ? 2 : 0, maximumFractionDigits: dec ? 2 : 0 });
}

/* frase in cima alla scheda: solo i numeri che esistono */
function riassunto(m, p, k) {
  const nome = nomeMese(m.mese), Nome = nome.charAt(0).toUpperCase() + nome.slice(1);
  const parti = [];
  if (!m.prenotazioni) parti.push(Nome + ': ancora nessuna prenotazione.');
  else {
    let s = Nome + ': ' + m.prenotazioni + (m.prenotazioni === 1 ? ' prenotazione' : ' prenotazioni');
    const d = p ? percento(m.prenotazioni, p.prenotazioni) : null;
    if (d !== null) s += ', ' + (d > 0 ? '+' + d + '% rispetto ' : d < 0 ? d + '% rispetto ' : 'come ') + aMese(nomeMese(p.mese));
    parti.push(s + '.');
  }
  if (k.followerInstagram.valore != null && k.followerInstagram.prima != null) {
    const d = k.followerInstagram.valore - k.followerInstagram.prima;
    parti.push('Instagram ' + (d >= 0 ? '+' : '') + d.toLocaleString('it-IT') + ' follower.');
  } else if (k.followerInstagram.valore != null) parti.push('Instagram: ' + k.followerInstagram.valore.toLocaleString('it-IT') + ' follower.');
  if (k.azioniGoogle.valore) parti.push('Dal profilo Google: ' + k.azioniGoogle.valore.toLocaleString('it-IT') + ' tra chiamate, richieste di indicazioni e clic sul sito.');
  if (k.ritornoPubblicita.valore != null) {
    parti.push(k.ritornoPubblicita.valore > 0
      ? 'Ogni €1 speso in pubblicità ha portato ' + euroTesto(Math.round(k.ritornoPubblicita.valore * 100), true) + ' di prenotazioni.'
      : 'La pubblicità di questo mese non ha ancora portato prenotazioni registrate.');
  }
  return parti.join(' ');
}

/* imbuto del mese: dalle persone raggiunte a chi è arrivato in sede */
function imbuto(m) {
  const mk = m.marketing || {};
  const passi = [
    { nome: 'Persone raggiunte sui social', valore: somma(mk, ['instagram_copertura', 'facebook_copertura']) },
    { nome: 'Visite al sito', valore: mk.visite_sito == null ? null : mk.visite_sito },
    { nome: 'Prenotazioni', valore: m.prenotazioni },
    { nome: 'Arrivati in sede', valore: m.presenti }
  ].filter(x => x.valore != null);
  passi.forEach((x, i) => { x.quota = i && passi[i - 1].valore ? Math.round(x.valore / passi[i - 1].valore * 1000) / 10 : null; });
  return passi;
}

async function crescita(meseRichiesto, adesso) {
  const corrente = primoDelMese(cal.oraRoma(adesso).data);
  const mese = meseValido(meseRichiesto, adesso) || corrente;
  const tutti = await serieMensile(mese);
  const mesi = tutti.slice(1); /* il primo serviva solo al confronto */
  const m = tutti[tutti.length - 1], p = tutti[tutti.length - 2];
  const k = kpi(m, p);
  const canali = {};
  mesi.forEach(x => Object.keys(x.canali).forEach(c => { canali[c] = (canali[c] || 0) + x.canali[c]; }));
  return {
    mese, corrente, mesePrima: p.mese, nomeMese: nomeMese(mese), nomeMesePrima: nomeMese(p.mese),
    kpi: k, riassunto: riassunto(m, p, k), imbuto: imbuto(m),
    note: m.note, aggiornato: m.aggiornato, marketing: m.marketing,
    mesi, canali: Object.keys(canali).sort((a, b) => canali[b] - canali[a]),
    canaliPubblicita: CANALI_PUBBLICITA,
    campi: Object.keys(CAMPI).map(c => ({ id: c, nome: CAMPI[c].nome, dec: CAMPI[c].dec, max: CAMPI[c].max }))
  };
}

module.exports = { crescita, salvaMarketing, validaMarketing, serieMensile, kpi, riassunto, imbuto, CAMPI };
