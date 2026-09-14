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

    /* imbuto degli ultimi 7 giorni: da chi guarda a chi compra */
    var imbuto = await sql`SELECT evento, COUNT(*)::int AS n
                           FROM visite
                           WHERE creato_il > now() - interval '7 days'
                           GROUP BY evento`;
    var conteggi = {};
    imbuto.forEach(function (r) { conteggi[r.evento] = r.n; });

    /* capi molto visti e mai comprati: problema di prezzo o di foto */
    var vistiSenzaAcquisto = await sql`SELECT percorso, COUNT(*)::int AS n
                                       FROM visite
                                       WHERE evento = 'page_view' AND percorso LIKE '%prodotto%'
                                         AND creato_il > now() - interval '30 days'
                                       GROUP BY percorso ORDER BY n DESC LIMIT 8`;

    /* taglie più richieste da esaurite: cosa riordinare */
    var daRiordinare = await sql`SELECT COUNT(*)::int AS n FROM avvisi_disponibilita
                                 WHERE creato_il > now() - interval '30 days'`;
    var carrelliAperti = await sql`SELECT COUNT(*)::int AS n FROM carrelli_aperti
                                   WHERE recuperato = false AND creato_il > now() - interval '7 days'`;
    var prenotazioni = await sql`SELECT email, dettaglio, creato_il FROM prenotazioni
                                 ORDER BY creato_il DESC LIMIT 10`;

    res.status(200).json({
      ordini: ordini,
      visiteOggi: oggi[0].n,
      ordiniSettimana: settimana[0].n,
      incassoSettimana: settimana[0].tot,
      iscritti: iscritti[0].n,
      imbuto: {
        visite: conteggi['page_view'] || 0,
        carrello: conteggi['add_to_cart'] || 0,
        cassa: conteggi['begin_checkout'] || 0,
        acquisti: conteggi['purchase'] || 0,
        whatsapp: conteggi['whatsapp_click'] || 0,
        guidaTaglie: conteggi['size_guide_open'] || 0,
        ritiro: conteggi['pickup_selected'] || 0,
        ricerche: conteggi['search_performed'] || 0
      },
      vistiSenzaAcquisto: vistiSenzaAcquisto,
      daRiordinare: daRiordinare[0].n,
      carrelliAperti: carrelliAperti[0].n,
      prenotazioni: prenotazioni
    });
  } catch (err) {
    res.status(500).json({ error: 'Errore nel caricamento' });
  }
};
