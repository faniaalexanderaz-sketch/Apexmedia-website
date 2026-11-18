/* GET /api/disponibilita?da=AAAA-MM-GG&giorni=14[&pacchetto=mese_fisso]
   Posti liberi per giorno e per fascia. In cache 15 secondi sulla rete di
   Vercel e mai nel browser: un giorno chiuso dall'app sparisce dal sito
   in pochi secondi. (Il server rifiuta comunque ogni richiesta per un
   momento chiuso, qualunque cosa mostri la pagina.) */
const { disponibilita } = require('./_prenotazioni');
const { json, errore, soloMetodo } = require('./_http');
const { disponibile } = require('./_db');

module.exports = async (req, res) => {
  if (!soloMetodo(req, res, 'GET')) return;
  /* senza database: risposta pulita, il sito resta in modalità dimostrativa */
  if (!disponibile()) { res.setHeader('Cache-Control', 'public, s-maxage=300'); json(res, 200, { modalita: 'demo' }); return; }
  try {
    const r = await disponibilita(req.query.da, req.query.giorni, req.query.pacchetto);
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=15');
    json(res, 200, r);
  } catch (err) { errore(res, err); }
};
