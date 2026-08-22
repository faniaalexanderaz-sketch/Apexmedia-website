/* =============================================================
   ANTICA FIORERIA DEL CENTRO — traccia il tuo ordine
   Ricerca pubblica per numero ordine + email: nessuna delle due
   da sola basta, così non si possono "indovinare" gli ordini altrui.
   Lo stato (ricevuto/in preparazione/spedito/consegnato) è quello
   impostato a mano dalla titolare nel pannello admin — qui non c'è
   un corriere reale collegato via API.
   ============================================================= */
const { sql, assicuraSchema } = require('./_db');
const { afcProdotto } = require('../prodotti');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Metodo non consentito' });
    return;
  }

  var body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }

  var numeroOrdine = String(body.numeroOrdine || '').trim().toUpperCase().slice(0, 12);
  var email = String(body.email || '').trim().toLowerCase().slice(0, 200);
  if (!numeroOrdine || !email) {
    res.status(400).json({ error: 'Inserisci numero ordine ed email.' });
    return;
  }

  try {
    await assicuraSchema();

    var righe = await sql`
      SELECT numero_ordine, articoli, totale_centesimi, stato, creato_il
      FROM ordini
      WHERE numero_ordine = ${numeroOrdine} AND lower(email) = ${email}
      LIMIT 1`;

    if (!righe.length) {
      res.status(404).json({ error: 'Nessun ordine trovato con questi dati. Controlla numero ordine ed email.' });
      return;
    }

    var o = righe[0];
    var articoli = Array.isArray(o.articoli) ? o.articoli : [];
    var righeArticoli = articoli.map(function (a) {
      var prod = afcProdotto(a[0]);
      return { nome: prod ? prod.nome : a[0], qty: a[1] };
    });

    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
      numeroOrdine: o.numero_ordine,
      stato: o.stato,
      totaleCentesimi: o.totale_centesimi,
      creatoIl: o.creato_il,
      articoli: righeArticoli
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Errore imprevisto' });
  }
};
