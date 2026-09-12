/* =============================================================
   ARABESQUE BUSALLA — stato di un ordine
   Servono numero ordine + email: solo chi ha entrambi vede i dati.
   ============================================================= */
const { sql, assicuraSchema } = require('./_db');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Metodo non consentito' }); return; }
  var body = req.body || {};
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }

  var numero = String(body.numero || '').trim().toUpperCase().slice(0, 20);
  var email = String(body.email || '').trim().toLowerCase().slice(0, 120);
  if (!numero || !email) { res.status(400).json({ error: 'Dati mancanti' }); return; }

  try {
    await assicuraSchema();
    var righe = await sql`SELECT numero_ordine, stato, consegna, creato_il
                          FROM ordini
                          WHERE numero_ordine = ${numero} AND LOWER(email) = ${email}
                          LIMIT 1`;
    if (!righe.length) { res.status(404).json({ error: 'Nessun ordine trovato' }); return; }
    res.status(200).json({
      numero: righe[0].numero_ordine,
      stato: righe[0].stato,
      consegna: righe[0].consegna,
      data: righe[0].creato_il
    });
  } catch (err) {
    res.status(500).json({ error: 'Servizio non disponibile' });
  }
};
