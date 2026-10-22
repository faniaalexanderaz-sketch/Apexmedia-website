/* GET /api/disponibilita?da=AAAA-MM-GG&giorni=14[&pacchetto=mese_fisso]
   Posti liberi per giorno. Risposta in cache 30 secondi sul CDN. */
const { disponibilita } = require('./_prenotazioni');
const { json, errore, soloMetodo } = require('./_http');
const { disponibile } = require('./_db');

module.exports = async (req, res) => {
  if (!soloMetodo(req, res, 'GET')) return;
  /* senza database: risposta pulita, il sito resta in modalità dimostrativa */
  if (!disponibile()) { res.setHeader('Cache-Control', 'public, s-maxage=300'); json(res, 200, { modalita: 'demo' }); return; }
  try {
    const r = await disponibilita(req.query.da, req.query.giorni, req.query.pacchetto);
    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
    json(res, 200, r);
  } catch (err) { errore(res, err); }
};
