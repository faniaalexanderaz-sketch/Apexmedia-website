/* =============================================================
   ANTICA FIORERIA DEL CENTRO — webhook Stripe
   Chiamato da Stripe (non dal sito) quando un pagamento va a buon
   fine. Solo qui — mai al click su "Acquista" — scaliamo le scorte
   e registriamo l'ordine, così un carrello abbandonato non blocca
   un pezzo per altre clienti. Richiede STRIPE_WEBHOOK_SECRET.
   ============================================================= */
const Stripe = require('stripe');
const { sql, assicuraSchema } = require('./_db');
const { inviaEmail } = require('./_email');
const { afcProdotto } = require('../prodotti');
const { emailConfermaOrdine, rigaArticolo, rigaExtra } = require('./_email-template');

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

    var numeroOrdine = String(sessione.id || '').slice(-8).toUpperCase();

    await sql`INSERT INTO ordini
      (sessione_stripe, numero_ordine, email, articoli, totale_centesimi, nome_ricevente, telefono, via, cap, citta, messaggio)
      VALUES (
        ${sessione.id},
        ${numeroOrdine},
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

    // email di conferma: se SENDGRID_API_KEY non è configurata, inviaEmail
    // non fa nulla — non deve mai far fallire il webhook
    var emailCliente = sessione.customer_details ? sessione.customer_details.email : null;
    if (emailCliente) {
      try {
        var righeArticoli = articoli.map(function (a) {
          var prod = afcProdotto(a[0]);
          return rigaArticolo(prod ? prod.nome : a[0], a[1]);
        }).join('');

        var spedizioneEuro = parseInt(meta.spedizione, 10) || 0;
        var righeExtra = spedizioneEuro ? rigaExtra('Spedizione assicurata', '€ ' + spedizioneEuro + ',00') : '';

        var indirizzoHtml = [meta.nome_ricevente, meta.via, [meta.cap, meta.citta].filter(Boolean).join(' ')]
          .filter(Boolean).join('<br/>') || null;

        await inviaEmail({
          to: emailCliente,
          subject: 'Il tuo ordine è confermato — Antica Fioreria del Centro',
          html: emailConfermaOrdine({
            numeroOrdine: numeroOrdine,
            email: emailCliente,
            righeArticoli: righeArticoli,
            righeExtra: righeExtra,
            totaleCentesimi: sessione.amount_total || 0,
            indirizzoHtml: indirizzoHtml
          })
        });
      } catch (err) {
        console.error('Invio email conferma fallito:', err.message);
      }
    }

    res.status(200).send('ok');
  } catch (err) {
    res.status(500).send('Errore: ' + err.message);
  }
};
