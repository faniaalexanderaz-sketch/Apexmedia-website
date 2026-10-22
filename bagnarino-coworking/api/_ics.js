/* =============================================================
   BAGNARINO COWORKING — file calendario (.ics) allegato alle email
   ============================================================= */
function esc(t) { return String(t).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n'); }
function ora(hhmm) { const p = String(hhmm).split(':'); return (p[0].length < 2 ? '0' : '') + p[0] + p[1] + '00'; }

function creaIcs(p, cfg) {
  const d = p.data_inizio.replace(/-/g, '');
  const luogo = cfg.azienda.indirizzo + ', ' + cfg.azienda.cap + ' ' + cfg.azienda.citta;
  const descr = 'Codice prenotazione ' + p.codice + '\n' + p.nomePacchetto + ' – ' + p.prezzoTesto + ', da pagare in sede.\n' +
    'Domande? WhatsApp ' + cfg.contatti.cellulareVisibile;
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Bagnarino Coworking//Prenotazioni//IT', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:' + p.codice + '@bagnarino-coworking',
    'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''),
    'DTSTART:' + d + 'T' + ora(cfg.orari.apertura),
    'DTEND:' + d + 'T' + ora(cfg.orari.chiusura),
    'SUMMARY:' + esc('Coworking Bagnarino – ' + p.nomePacchetto),
    'LOCATION:' + esc(luogo),
    'DESCRIPTION:' + esc(descr),
    'BEGIN:VALARM', 'TRIGGER:-PT1H', 'ACTION:DISPLAY', 'DESCRIPTION:' + esc('Coworking Bagnarino tra un’ora'), 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR'
  ].join('\r\n');
}
module.exports = { creaIcs };
