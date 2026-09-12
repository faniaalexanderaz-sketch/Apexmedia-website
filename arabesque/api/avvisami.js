/* =============================================================
   ARABESQUE BUSALLA — "avvisami quando torna disponibile"
   ============================================================= */
const { sql, assicuraSchema } = require('./_db');
const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Metodo non consentito' }); return; }
  var body = req.body || {};
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  var email = String(body.email || '').trim().toLowerCase();
  var slug = String(body.slug || '').slice(0, 40);
  if (!EMAIL_OK.test(email) || !slug) { res.status(400).json({ error: 'Dati non validi' }); return; }
  try {
    await assicuraSchema();
    await sql`INSERT INTO avvisi_disponibilita (email, slug) VALUES (${email}, ${slug})`;
    res.status(200).json({ ok: true });
  } catch (err) { res.status(500).json({ error: 'Servizio non disponibile' }); }
};
