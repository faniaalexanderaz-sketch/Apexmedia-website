/* =============================================================
   BAGNARINO COWORKING — API per il cliente (una sola funzione)
   Gli indirizzi pubblici restano separati grazie a vercel.json:
     GET  /api/prenotazione?codice=&email=  → stato
     POST /api/annulla   { codice, email }  → annullamento
     POST /api/vantaggi  { email, telefono, data } → omaggi e carnet
     POST /api/card      { email, codice }  → Bagnarino Card
   Una funzione invece di quattro: il piano gratuito di Vercel
   ne ammette un numero limitato per progetto.
   ============================================================= */
const P = require('./_prenotazioni');
const { impostazioni } = require('./_impostazioni');
const { inviaEmail } = require('./_email');
const { avvisaTitolare } = require('./_notifiche');
const T = require('./_email-template');
const { corpo, json, errore, soloMetodo, sitoUrl } = require('./_http');

module.exports = async (req, res) => {
  const azione = req.query.azione;
  try {
    if (azione === 'stato') {
      if (!soloMetodo(req, res, 'GET')) return;
      json(res, 200, await P.stato(req.query.codice, req.query.email));
      return;
    }
    if (!soloMetodo(req, res, 'POST')) return;
    const b = corpo(req);
    if (azione === 'vantaggi') { json(res, 200, await P.vantaggi(b.email, b.telefono, b.data)); return; }
    if (azione === 'card') { json(res, 200, await P.card(b.email, b.codice)); return; }
    if (azione === 'annulla') {
      const p = await P.annulla(b.codice, b.email);
      const cfg = await impostazioni(), sito = sitoUrl(req);
      const cli = T.annullataCliente(p, cfg, sito), tit = T.titolareAnnullata(p, cfg, sito);
      await Promise.all([
        inviaEmail({ to: p.email, subject: cli.oggetto, html: cli.html }),
        avvisaTitolare({ oggetto: tit.oggetto, html: tit.html, testo: 'Annullata ' + p.codice + ': ' + p.nome + ' ' + p.cognome + ', ' + T.periodo(p) })
      ]);
      json(res, 200, { codice: p.codice, stato: 'annullata' });
      return;
    }
    json(res, 404, { errore: 'AZIONE', messaggio: 'Azione sconosciuta' });
  } catch (err) { errore(res, err); }
};
