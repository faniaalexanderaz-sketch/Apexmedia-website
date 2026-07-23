/* =============================================================
   ANTICA FIORERIA DEL CENTRO — scorte in tempo reale
   GET pubblico: usato dalle pagine del sito per sapere quanti
   pezzi restano di ogni composizione e mostrare "Esaurito".
   ============================================================= */
const { sql, assicuraSchema } = require('./_db');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Metodo non consentito' });
    return;
  }
  try {
    await assicuraSchema();
    const righe = await sql`SELECT slug, quantita FROM prodotti_scorte`;
    const scorte = {};
    righe.forEach((r) => { scorte[r.slug] = r.quantita; });
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ scorte });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Errore imprevisto' });
  }
};
