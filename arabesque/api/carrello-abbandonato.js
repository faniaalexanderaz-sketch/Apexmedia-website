/* =============================================================
   ARABESQUE BUSALLA — carrello abbandonato
   Registra email e contenuto quando il cliente inizia la cassa.
   Il recupero (una mail dopo un'ora, una dopo 24) va lanciato da
   un'attività pianificata che legge questa tabella: qui teniamo
   solo il dato, con il consenso dato al momento dell'ordine.
   ============================================================= */
const { sql, assicuraSchema } = require('./_db');
const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Metodo non consentito' }); return; }
  var body = req.body || {};
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  var email = String(body.email || '').trim().toLowerCase();
  if (!EMAIL_OK.test(email)) { res.status(400).json({ error: 'Email non valida' }); return; }

  var articoli = Array.isArray(body.articoli) ? body.articoli.slice(0, 30) : [];
  var totale = Math.round((Number(body.totale) || 0) * 100);

  try {
    await assicuraSchema();
    await sql`INSERT INTO carrelli_aperti (email, articoli, totale_centesimi)
              VALUES (${email}, ${JSON.stringify(articoli)}, ${totale})`;
    res.status(200).json({ ok: true });
  } catch (err) {
    if (err.codice === 'DB_ASSENTE') { res.status(501).json({ error: 'Non ancora attivo' }); return; }
    res.status(500).json({ error: 'Errore' });
  }
};
