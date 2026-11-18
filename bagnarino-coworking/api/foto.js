/* GET /api/foto?id=…&t=p|g — una foto caricata dall'app di gestione
   (sezione "Lo spazio" del sito). p = piccola, g = grande.
   Ogni foto ha un indirizzo suo che non cambia mai: il telefono e la
   rete di Vercel la tengono in memoria per un anno. */
const { leggiFoto } = require('./_gestione');
const { disponibile } = require('./_db');

module.exports = async (req, res) => {
  const non = () => { res.statusCode = 404; res.setHeader('Cache-Control', 'no-store'); res.end(); };
  if (req.method !== 'GET' || !disponibile()) { non(); return; }
  try {
    const f = await leggiFoto(req.query.id, req.query.t === 'p' ? 'p' : 'g');
    if (!f) { non(); return; }
    res.statusCode = 200;
    res.setHeader('Content-Type', f.tipo);
    res.setHeader('Content-Length', f.dati.length);
    res.setHeader('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, immutable');
    res.end(f.dati);
  } catch (e) {
    console.error('[bagnarino] foto', e && e.message);
    res.statusCode = 500; res.setHeader('Cache-Control', 'no-store'); res.end();
  }
};
