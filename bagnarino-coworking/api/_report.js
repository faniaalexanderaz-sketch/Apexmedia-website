/* =============================================================
   BAGNARINO COWORKING — numeri del mese e provenienza clienti
   Usato dalla dashboard e dal report automatico del giorno 1
   (alla titolare e ad Apex Media).
   Destinatari: NOTIFICHE_EMAIL + REPORT_EMAIL (anche più
   indirizzi separati da virgola, es. quello di Apex Media).
   ============================================================= */
const { q } = require('./_db');
const cal = require('./_calendario');
const { inviaEmail } = require('./_email');
const T = require('./_email-template');

/* da dove arriva una prenotazione: le categorie che servono alle campagne */
function classificaFonte(o) {
  o = o || {};
  const s = String(o.utm_source || '').toLowerCase(), m = String(o.utm_medium || '').toLowerCase(), r = String(o.referrer || '').toLowerCase();
  if (s === 'banco') return 'In sede / telefono';
  if (/gmb|maps|google_?business|business_?profile/.test(s) || /maps\.google|google\.[a-z.]+\/maps|maps\.app\.goo/.test(r)) return 'Google Maps';
  if (/insta|^ig$/.test(s) || /instagram/.test(r)) return 'Instagram';
  if (/face|^fb$|meta/.test(s) || o.fbclid || /facebook|fb\.com|m\.me/.test(r)) return 'Facebook';
  if (/google/.test(s) || o.gclid || /google\./.test(r)) return m === 'cpc' || o.gclid ? 'Google Ads' : 'Google';
  if (/whatsapp|wa/.test(s) || /whatsapp|wa\.me/.test(r)) return 'WhatsApp';
  if (s || r) return 'Altro';
  return 'Diretto';
}

function primoDelMese(iso) { return iso.slice(0, 8) + '01'; }

async function numeriMese(inizio) {
  const fine = cal.aggiungiMesi(inizio, 1);
  const pren = await q(
    `SELECT COUNT(*)::int AS n, COALESCE(SUM(prezzo_centesimi), 0)::int AS valore FROM prenotazioni
     WHERE stato <> 'annullata' AND (creato_il AT TIME ZONE 'Europe/Rome')::date >= $1 AND (creato_il AT TIME ZONE 'Europe/Rome')::date < $2`, [inizio, fine]);
  const inc = await q(
    `SELECT COALESCE(SUM(prezzo_centesimi), 0)::int AS c FROM prenotazioni
     WHERE pagato AND pagato_il IS NOT NULL AND (pagato_il AT TIME ZONE 'Europe/Rome')::date >= $1 AND (pagato_il AT TIME ZONE 'Europe/Rome')::date < $2`, [inizio, fine]);
  const nuovi = await q(
    `SELECT COUNT(*)::int AS n FROM clienti WHERE (creato_il AT TIME ZONE 'Europe/Rome')::date >= $1 AND (creato_il AT TIME ZONE 'Europe/Rome')::date < $2`, [inizio, fine]);
  const occ = await q('SELECT COUNT(*)::int AS n FROM occupazioni WHERE data >= $1 AND data < $2', [inizio, fine]);
  const posti = await q('SELECT COUNT(*)::int AS n FROM postazioni WHERE attiva');
  const cfg = await require('./_impostazioni').impostazioni();
  let aperti = 0;
  for (let d = inizio; d < fine; d = cal.aggiungiGiorni(d, 1)) if (cal.aperto(d, cfg, cfg.chiusureTutte)) aperti++;
  const fonti = await q(
    `SELECT origine FROM prenotazioni WHERE stato <> 'annullata'
     AND (creato_il AT TIME ZONE 'Europe/Rome')::date >= $1 AND (creato_il AT TIME ZONE 'Europe/Rome')::date < $2`, [inizio, fine]);
  const canali = {};
  fonti.forEach(r => { const f = classificaFonte(r.origine); canali[f] = (canali[f] || 0) + 1; });
  return {
    inizio, prenotazioni: pren[0].n, valorePrenotato: pren[0].valore, incasso: inc[0].c, nuoviClienti: nuovi[0].n,
    occupazione: aperti && posti[0].n ? Math.round(occ[0].n / (aperti * posti[0].n) * 100) : 0,
    canali: Object.keys(canali).map(k => ({ fonte: k, n: canali[k] })).sort((a, b) => b.n - a.n)
  };
}

function euro(c) { return '€' + Math.round(c / 100).toLocaleString('it-IT'); }

async function inviaReportMensile(cfg, sito, adesso) {
  const oggi = cal.oraRoma(adesso).data;
  const inizio = cal.aggiungiMesi(primoDelMese(oggi), -1);
  const n = await numeriMese(inizio);
  const prima = await numeriMese(cal.aggiungiMesi(inizio, -1));
  const nomeMese = new Date(inizio + 'T12:00:00Z').toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
  const delta = (a, b) => b ? (a >= b ? '+' : '') + Math.round((a - b) / b * 100) + '% sul mese prima' : '';
  const corpo = T.titoloH('Il coworking a ' + nomeMese) +
    T.righe([
      ['Prenotazioni', n.prenotazioni + '  ' + delta(n.prenotazioni, prima.prenotazioni)],
      ['Incasso', euro(n.incasso) + '  ' + delta(n.incasso, prima.incasso)],
      ['Occupazione media', n.occupazione + '% delle scrivanie'],
      ['Nuovi clienti', String(n.nuoviClienti)]
    ]) + '<div style="height:18px"></div>' +
    T.paragrafo('<b>Da dove arrivano le prenotazioni</b>', true) +
    (n.canali.length ? T.righe(n.canali.map(c => [c.fonte, String(c.n)])) : T.paragrafo('Nessuna prenotazione nel mese.')) +
    '<div style="height:18px"></div>' + T.bottone(sito + '/admin', 'Apri l’area riservata', true);
  const html = T.layout({ titolo: 'Report ' + nomeMese, anteprima: n.prenotazioni + ' prenotazioni, ' + euro(n.incasso) + ' incassati', corpo, sito, cfg });
  const destinatari = [process.env.NOTIFICHE_EMAIL].concat(String(process.env.REPORT_EMAIL || '').split(','))
    .map(s => (s || '').trim()).filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);
  let inviate = 0;
  for (const to of destinatari) { const e = await inviaEmail({ to, subject: 'Report di ' + nomeMese + ' – Bagnarino Coworking', html }); if (e.inviata) inviate++; }
  return { mese: inizio, numeri: n, destinatari: destinatari.length, inviate };
}

module.exports = { classificaFonte, numeriMese, inviaReportMensile, primoDelMese };
