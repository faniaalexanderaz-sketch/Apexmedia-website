/* =============================================================
   BAGNARINO COWORKING — calendario lato server
   Il server gira in UTC: qui tutto è riportato all'ora italiana
   (Europe/Rome), con festivi nazionali, chiusure e scadenze.
   Le date viaggiano come stringhe 'AAAA-MM-GG'.
   ============================================================= */
const FUSO = 'Europe/Rome';

function pad(n) { return (n < 10 ? '0' : '') + n; }

/* data e ora italiane di un istante */
function oraRoma(istante) {
  const parti = {};
  new Intl.DateTimeFormat('en-GB', {
    timeZone: FUSO, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).formatToParts(istante || new Date()).forEach(p => { parti[p.type] = p.value; });
  return {
    data: parti.year + '-' + parti.month + '-' + parti.day,
    ora: parti.hour + ':' + parti.minute,
    minuti: (+parti.hour) * 60 + (+parti.minute)
  };
}

function utc(iso) { const p = iso.split('-'); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])); }
function daUtc(d) { return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()); }
function aggiungiGiorni(iso, n) { const d = utc(iso); d.setUTCDate(d.getUTCDate() + n); return daUtc(d); }
function aggiungiMesi(iso, n) { const d = utc(iso); d.setUTCMonth(d.getUTCMonth() + n); return daUtc(d); }
function giornoSettimana(iso) { return utc(iso).getUTCDay(); }
function isoValida(s) { return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && daUtc(utc(s)) === s; }
function minuti(hhmm) { const p = String(hhmm).split(':'); return (+p[0]) * 60 + (+p[1] || 0); }

function pasqua(y) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4,
    f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3),
    h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4,
    l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451),
    mese = Math.floor((h + l - 7 * m + 114) / 31), giorno = ((h + l - 7 * m + 114) % 31) + 1;
  return y + '-' + pad(mese) + '-' + pad(giorno);
}
function festivi(y) {
  const f = ['01-01', '01-06', '04-25', '05-01', '06-02', '08-15', '11-01', '12-08', '12-25', '12-26'].map(md => y + '-' + md);
  f.push(aggiungiGiorni(pasqua(y), 1)); /* Pasquetta */
  return f;
}

/* cfg = impostazioni correnti; chiusure = date chiuse (config + database) */
function aperto(iso, cfg, chiusure) {
  return cfg.orari.giorni.indexOf(giornoSettimana(iso)) !== -1 &&
    festivi(+iso.slice(0, 4)).indexOf(iso) === -1 &&
    (chiusure || []).indexOf(iso) === -1;
}

/* ultimo giorno coperto da un pacchetto mensile */
function fineMese(inizio) { return aggiungiGiorni(aggiungiMesi(inizio, 1), -1); }

/* i giorni di apertura occupati da un pacchetto che parte da "inizio" */
function giorniPacchetto(pacchetto, inizio, cfg, chiusure) {
  if (pacchetto.indexOf('mese') !== 0) return [inizio];
  const fine = fineMese(inizio), out = [];
  for (let d = inizio; d <= fine; d = aggiungiGiorni(d, 1)) if (aperto(d, cfg, chiusure)) out.push(d);
  return out;
}

/* si può ancora prenotare per quel giorno? */
function prenotabile(iso, cfg, chiusure, adesso) {
  const r = oraRoma(adesso);
  if (!isoValida(iso) || iso < r.data) return false;
  if (iso > aggiungiGiorni(r.data, (cfg.giorniPrenotabili || 28) + 7)) return false;
  if (iso === r.data && r.minuti >= minuti(cfg.orari.ultimaPrenotazioneOggi)) return false;
  return aperto(iso, cfg, chiusure);
}

/* disdetta gratuita fino alle 20:00 (cfg.disdetta.ora) del giorno prima */
function scadenzaDisdetta(dataInizio, cfg) {
  return aggiungiGiorni(dataInizio, -1) + ' ' + ((cfg.disdetta && cfg.disdetta.ora) || '20:00');
}
function annullabile(dataInizio, cfg, adesso) {
  const r = oraRoma(adesso);
  const [g, o] = scadenzaDisdetta(dataInizio, cfg).split(' ');
  return r.data < g || (r.data === g && r.minuti < minuti(o));
}

module.exports = {
  oraRoma, aggiungiGiorni, aggiungiMesi, giornoSettimana, isoValida, minuti,
  festivi, aperto, fineMese, giorniPacchetto, prenotabile, scadenzaDisdetta, annullabile
};
