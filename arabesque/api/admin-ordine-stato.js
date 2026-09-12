const { sql, assicuraSchema } = require('./_db');
const { sessioneValida } = require('./_admin');

const STATI = ['ricevuto', 'in preparazione', 'spedito', 'consegnato', 'annullato'];

module.exports = async function handler(req, res) {
  if (!sessioneValida(req)) { res.status(401).json({ error: 'Non autorizzato' }); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Metodo non consentito' }); return; }
  var body = req.body || {};
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  var numero = String(body.numero || '').toUpperCase().slice(0, 20);
  var stato = String(body.stato || '');
  if (!numero || STATI.indexOf(stato) === -1) { res.status(400).json({ error: 'Dati non validi' }); return; }
  try {
    await assicuraSchema();
    await sql`UPDATE ordini SET stato = ${stato} WHERE numero_ordine = ${numero}`;
    res.status(200).json({ ok: true });
  } catch (err) { res.status(500).json({ error: 'Errore' }); }
};
