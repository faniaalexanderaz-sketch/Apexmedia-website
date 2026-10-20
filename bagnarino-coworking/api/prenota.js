/* POST /api/prenota — crea la prenotazione e manda gli avvisi */
const { prenota } = require('./_prenotazioni');
const { impostazioni } = require('./_impostazioni');
const { inviaEmail } = require('./_email');
const { avvisaTitolare } = require('./_notifiche');
const { creaIcs } = require('./_ics');
const T = require('./_email-template');
const { corpo, ip, json, errore, soloMetodo, sitoUrl } = require('./_http');
const { inviaConversione } = require('./_meta');

module.exports = async (req, res) => {
  if (!soloMetodo(req, res, 'POST')) return;
  try {
    const dati = corpo(req);
    const p = await prenota(dati, { ip: ip(req) });
    if (p.finto) { json(res, 200, { codice: p.codice }); return; }

    const cfg = await impostazioni();
    const sito = sitoUrl(req);
    const conferma = T.confermaCliente(p, cfg, sito);
    const titolare = T.titolareNuova(p, cfg, sito);
    /* gli avvisi partono prima di rispondere: una funzione serverless
       può essere fermata subito dopo la risposta */
    const [email] = await Promise.all([
      inviaEmail({
        to: p.email, subject: conferma.oggetto, html: conferma.html, testo: conferma.testo,
        rispondiA: cfg.azienda.email,
        allegati: [{ nome: 'prenotazione-' + p.codice + '.ics', tipo: 'text/calendar', contenuto: creaIcs(p, cfg) }]
      }),
      avvisaTitolare({
        oggetto: titolare.oggetto, html: titolare.html,
        testo: 'Nuova prenotazione ' + p.codice + ': ' + p.nome + ' ' + p.cognome + ', ' + p.nomePacchetto + ', ' + T.periodo(p) + ', ' + p.prezzoTesto + ', tel ' + p.telefono
      }),
      inviaConversione(req, p, dati.event_id)
    ]);

    json(res, 200, {
      codice: p.codice, pacchetto: p.pacchetto, nomePacchetto: p.nomePacchetto,
      data_inizio: p.data_inizio, data_fine: p.data_fine, prezzo: p.prezzo, prezzoTesto: p.prezzoTesto,
      omaggio: p.omaggio, carnet: p.carnet, scadenzaDisdetta: p.scadenzaDisdetta,
      emailInviata: !!(email && email.inviata)
    });
  } catch (err) { errore(res, err); }
};
