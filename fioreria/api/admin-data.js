/* =============================================================
   ANTICA FIORERIA DEL CENTRO — dati del pannello interno
   Scorte, ultimi ordini, visite. Solo lettura.
   ============================================================= */
const { sql, assicuraSchema } = require('./_db');
const { sessioneValida } = require('./_admin');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Metodo non consentito' });
    return;
  }
  if (!sessioneValida(req)) {
    res.status(401).json({ error: 'Accesso richiesto' });
    return;
  }

  try {
    await assicuraSchema();

    var scorte = (await sql`SELECT slug, quantita FROM prodotti_scorte ORDER BY slug`);

    var ordini = (await sql`
      SELECT id, sessione_stripe, email, articoli, totale_centesimi,
             nome_ricevente, telefono, via, cap, citta, messaggio, creato_il
      FROM ordini ORDER BY creato_il DESC LIMIT 100`);

    var visiteOggi = (await sql`
      SELECT COUNT(*)::int AS n FROM visite
      WHERE creato_il >= date_trunc('day', now())`)[0].n;

    var visite7gg = (await sql`
      SELECT COUNT(*)::int AS n FROM visite
      WHERE creato_il >= now() - interval '7 days'`)[0].n;

    var visiteTotali = (await sql`SELECT COUNT(*)::int AS n FROM visite`)[0].n;

    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ scorte: scorte, ordini: ordini, visite: { oggi: visiteOggi, settimana: visite7gg, totali: visiteTotali } });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Errore imprevisto' });
  }
};
