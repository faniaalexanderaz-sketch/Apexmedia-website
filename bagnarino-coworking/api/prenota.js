/* POST /api/prenota — salva la richiesta ("in attesa") e manda gli avvisi:
   al cliente "richiesta ricevuta", alla titolare email e notifica. */
const { prenota } = require('./_prenotazioni');
const { impostazioni } = require('./_impostazioni');
const avvisi = require('./_avvisi');
const { corpo, ip, json, errore, soloMetodo, sitoUrl } = require('./_http');
const { inviaConversione } = require('./_meta');

module.exports = async (req, res) => {
  if (!soloMetodo(req, res, 'POST')) return;
  try {
    const dati = corpo(req);
    const p = await prenota(dati, { ip: ip(req) });
    if (p.finto) { json(res, 200, { codice: p.codice, stato: 'in_attesa' }); return; }

    const cfg = await impostazioni();
    /* gli avvisi partono prima di rispondere: una funzione serverless
       può essere fermata subito dopo la risposta */
    const [a] = await Promise.all([
      avvisi.richiesta(p, cfg, sitoUrl(req)),
      inviaConversione(req, p, dati.event_id)
    ]);

    json(res, 200, {
      codice: p.codice, stato: p.stato, pacchetto: p.pacchetto, nomePacchetto: p.nomePacchetto,
      fascia: p.fascia, nomeFascia: p.nomeFascia,
      data_inizio: p.data_inizio, data_fine: p.data_fine, prezzo: p.prezzo, prezzoTesto: p.prezzoTesto,
      omaggio: p.omaggio, carnet: p.carnet,
      emailInviata: !!(a && a.email && a.email.inviata)
    });
  } catch (err) { errore(res, err); }
};
