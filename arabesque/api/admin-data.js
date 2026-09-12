/* =============================================================
   ARABESQUE BUSALLA — dati del pannello interno
   Ordini recenti, incasso, visite. Solo con sessione valida.
   ============================================================= */
const { sql, assicuraSchema } = require('./_db');
const { sessioneValida } = require('./_admin');

module.exports = async function handler(req, res) {
  if (!sessioneValida(req)) { res.status(401).json({ error: 'Non autorizzato' }); return; }
  try {
    await assicuraSchema();
    var ordini = await sql`SELECT numero_ordine, email, articoli, totale_centesimi, pagamento, consegna,
                                  nome, telefono, via, cap, citta, note, stato, creato_il
                           FROM ordini ORDER BY creato_il DESC LIMIT 60`;
    var oggi = await sql`SELECT COUNT(*)::int AS n FROM visite WHERE creato_il > now() - interval '1 day'`;
    var settimana = await sql`SELECT COUNT(*)::int AS n, COALESCE(SUM(totale_centesimi),0)::int AS tot
                              FROM ordini WHERE creato_il > now() - interval '7 days'`;
    var iscritti = await sql`SELECT COUNT(*)::int AS n FROM iscritti`;
    res.status(200).json({
      ordini: ordini,
      visiteOggi: oggi[0].n,
      ordiniSettimana: settimana[0].n,
      incassoSettimana: settimana[0].tot,
      iscritti: iscritti[0].n
    });
  } catch (err) {
    res.status(500).json({ error: 'Errore nel caricamento' });
  }
};
