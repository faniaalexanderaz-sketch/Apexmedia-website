/* =============================================================
   ANTICA FIORERIA DEL CENTRO — conteggio visite, minimale
   Nessun cookie di profilazione, nessun dato personale: solo un
   contatore per pagina, per il pannello interno.
   ============================================================= */
const { sql, assicuraSchema } = require('./_db');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }
  var body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  var percorso = String(body.percorso || '/').slice(0, 200);

  try {
    await assicuraSchema();
    await sql`INSERT INTO visite (percorso) VALUES (${percorso})`;
    res.status(204).end();
  } catch (err) {
    res.status(500).end();
  }
};
