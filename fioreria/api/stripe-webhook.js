/* =============================================================
   ANTICA FIORERIA DEL CENTRO — webhook Stripe
   Chiamato da Stripe (non dal sito) quando un pagamento va a buon
   fine. Solo qui — mai al click su "Acquista" — scaliamo le scorte
   e registriamo l'ordine, così un carrello abbandonato non blocca
   un pezzo per altre clienti. Richiede STRIPE_WEBHOOK_SECRET.
   ============================================================= */
const Stripe = require('stripe');
const { sql, assicuraSchema } = require('./_db');

module.exports.config = { api: { bodyParser: false } };

function leggiCorpoGrezzo(req) {
  return new Promise((resolve, reject) => {
    var pezzi = [];
    req.on('data', (c) => pezzi.push(c));
    req.on('end', () => resolve(Buffer.concat(pezzi)));
    req.on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send('Metodo non consentito');
    return;
  }
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    res.status(501).send('Webhook non ancora configurato');
    return;
  }

  var stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  var evento;
  try {
    var corpo = await leggiCorpoGrezzo(req);
    evento = stripe.webhooks.constructEvent(
      corpo,
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    res.status(400).send('Firma non valida: ' + err.message);
    return;
  }

  if (evento.type !== 'checkout.session.completed') {
    res.status(200).send('ignorato');
    return;
  }

  var sessione = evento.data.object;
  var meta = sessione.metadata || {};

  try {
    await assicuraSchema();

    // idempotenza: se l'ordine per questa sessione esiste già, non rifare nulla
    var giaRegistrato = await sql`SELECT id FROM ordini WHERE sessione_stripe = ${sessione.id}`;
    if (giaRegistrato.length > 0) {
      res.status(200).send('già registrato');
      return;
    }

    var articoli = [];
    try { articoli = JSON.parse(meta.articoli || '[]'); } catch (e) { articoli = []; }

    for (var i = 0; i < articoli.length; i++) {
      var slug = articoli[i][0];
      var qty = articoli[i][1];
      if (!slug || !qty) continue;
      await sql`UPDATE prodotti_scorte
                SET quantita = GREATEST(0, quantita - ${qty})
                WHERE slug = ${slug}`;
    }

    await sql`INSERT INTO ordini
      (sessione_stripe, email, articoli, totale_centesimi, nome_ricevente, telefono, via, cap, citta, messaggio)
      VALUES (
        ${sessione.id},
        ${sessione.customer_details ? sessione.customer_details.email : null},
        ${JSON.stringify(articoli)},
        ${sessione.amount_total || 0},
        ${meta.nome_ricevente || null},
        ${meta.telefono || null},
        ${meta.via || null},
        ${meta.cap || null},
        ${meta.citta || null},
        ${meta.messaggio || null}
      )`;

    res.status(200).send('ok');
  } catch (err) {
    res.status(500).send('Errore: ' + err.message);
  }
};
