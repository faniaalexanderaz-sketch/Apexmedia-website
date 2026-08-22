/* =============================================================
   ANTICA FIORERIA DEL CENTRO — aggiorna a mano lo stato di un ordine
   Usato dal pannello admin: Ricevuto → In preparazione → Spedito →
   Consegnato. Nessun corriere reale collegato: lo stato lo sceglie
   la titolare.
   ============================================================= */
const { sql, assicuraSchema } = require('./_db');
const { sessioneValida } = require('./_admin');

const STATI_VALIDI = ['ricevuto', 'in_preparazione', 'spedito', 'consegnato'];

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

  var id = parseInt(body.id, 10);
  var stato = String(body.stato || '');
  if (!isFinite(id) || STATI_VALIDI.indexOf(stato) === -1) {
    res.status(400).json({ error: 'Dati non validi' });
    return;
  }

  try {
    await assicuraSchema();
    await sql`UPDATE ordini SET stato = ${stato} WHERE id = ${id}`;
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Errore imprevisto' });
  }
};
