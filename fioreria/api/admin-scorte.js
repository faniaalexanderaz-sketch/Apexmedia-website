/* =============================================================
   ANTICA FIORERIA DEL CENTRO — modifica manuale delle scorte
   Per correggere un numero a mano (es. dopo un rifornimento).
   ============================================================= */
const { sql, assicuraSchema } = require('./_db');
const { sessioneValida } = require('./_admin');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Metodo non consentito' });
    return;
  }
  if (!sessioneValida(req)) {
    res.status(401).json({ error: 'Accesso richiesto' });
    return;
  }

  var body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }

  var slug = String(body.slug || '').slice(0, 40);
  var quantita = parseInt(body.quantita, 10);
  if (!slug || !isFinite(quantita) || quantita < 0 || quantita > 9999) {
    res.status(400).json({ error: 'Dati non validi' });
    return;
  }

  try {
    await assicuraSchema();
    await sql`UPDATE prodotti_scorte SET quantita = ${quantita} WHERE slug = ${slug}`;
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Errore imprevisto' });
  }
};
