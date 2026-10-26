/* =============================================================
   BAGNARINO COWORKING — API per il cliente (una sola funzione)
   Gli indirizzi pubblici restano separati grazie a vercel.json:
     GET  /api/prenotazione?codice=&email=  → stato
     POST /api/annulla   { codice, email }  → annullamento
     POST /api/vantaggi  { email, telefono, data } → omaggi e carnet
     POST /api/card      { email, codice }  → Bagnarino Card
     GET  /api/cliente?azione=disiscrivi&id=&t= → stop email promozionali
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
    if (azione === 'disiscrivi') {
      /* link nelle email "ci manchi": niente più email promozionali */
      const ok = await require('./_fidelizzazione').disiscrivi(req.query.id, req.query.t);
      res.statusCode = ok ? 200 : 400;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end('<!doctype html><html lang="it"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Bagnarino Coworking</title>' +
        '<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#111922;color:#FAF6EE;font:18px/1.6 system-ui,sans-serif;text-align:center;padding:24px">' +
        '<div><p style="font-size:26px;margin:0 0 10px">' + (ok ? 'Fatto.' : 'Link non valido.') + '</p><p style="margin:0 0 20px;color:#c9c3b8">' +
        (ok ? 'Non riceverai più email promozionali dal Bagnarino Coworking. Le email delle tue prenotazioni continueranno ad arrivare.' : 'Scrivici su WhatsApp e ti togliamo noi dalla lista.') +
        '</p><a href="/" style="color:#DDB05C">Torna al sito</a></div></body></html>');
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
