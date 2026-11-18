/* =============================================================
   BAGNARINO COWORKING — file calendario (.ics) allegato all'email
   di conferma. Il coworking non ha orari fissi: l'appuntamento è
   un evento del giorno, con la fascia scelta nel titolo.
   ============================================================= */
function esc(t) { return String(t).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n'); }
function giornoDopo(iso) {
  const p = iso.split('-'), d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2]));
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10).replace(/-/g, '');
}

function creaIcs(p, cfg) {
  const luogo = cfg.azienda.indirizzo + ', ' + cfg.azienda.cap + ' ' + cfg.azienda.citta;
  const cosa = p.pacchetto === 'giornata' && p.nomeFascia ? p.nomeFascia : p.nomePacchetto;
  const descr = 'Codice prenotazione ' + p.codice + '\n' + p.nomePacchetto + (p.pacchetto === 'giornata' && p.nomeFascia ? ' (' + p.nomeFascia.toLowerCase() + ')' : '') +
    ' – ' + p.prezzoTesto + ', da pagare in sede.\n' + 'Domande? WhatsApp ' + cfg.contatti.cellulareVisibile;
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Bagnarino Coworking//Prenotazioni//IT', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:' + p.codice + '@bagnarino-coworking',
    'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''),
    'DTSTART;VALUE=DATE:' + p.data_inizio.replace(/-/g, ''),
    'DTEND;VALUE=DATE:' + giornoDopo(p.data_inizio),
    'SUMMARY:' + esc('Coworking Bagnarino – ' + cosa),
    'LOCATION:' + esc(luogo),
    'DESCRIPTION:' + esc(descr),
    'TRANSP:TRANSPARENT',
    'END:VEVENT', 'END:VCALENDAR'
  ].join('\r\n');
}
module.exports = { creaIcs };
