/* =============================================================
   ARABESQUE BUSALLA — webhook Stripe
   Chiamato da Stripe quando il pagamento è andato a buon fine:
   solo qui registriamo l'ordine e mandiamo l'email di conferma.
   Richiede STRIPE_WEBHOOK_SECRET.
   ============================================================= */
const Stripe = require('stripe');
const { sql, assicuraSchema, nuovoNumeroOrdine } = require('./_db');
const { inviaEmail } = require('./_email');
const { emailConfermaOrdine } = require('./_email-template');

module.exports.config = { api: { bodyParser: false } };

function corpoGrezzo(req) {
  return new Promise(function (risolvi, rifiuta) {
    var pezzi = [];
    req.on('data', function (c) { pezzi.push(c); });
    req.on('end', function () { risolvi(Buffer.concat(pezzi)); });
    req.on('error', rifiuta);
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).send('Metodo non consentito'); return; }
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    res.status(501).send('Webhook non ancora configurato'); return;
  }

  var stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  var evento;
  try {
    evento = stripe.webhooks.constructEvent(
      await corpoGrezzo(req), req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    res.status(400).send('Firma non valida: ' + err.message); return;
  }
  if (evento.type !== 'checkout.session.completed') { res.status(200).send('ignorato'); return; }

  var s = evento.data.object;
  var meta = s.metadata || {};

  try {
    await assicuraSchema();

    var gia = await sql`SELECT numero_ordine FROM ordini WHERE riferimento = ${s.id}`;
    if (gia.length) { res.status(200).send('già registrato'); return; }

    var articoli = [];
    try { articoli = JSON.parse(meta.articoli || '[]'); } catch (e) { articoli = []; }
    var elenco = articoli.map(function (a) { return { slug: a[0], qty: a[1], nome: a[2] || a[0] }; });

    var numero = nuovoNumeroOrdine();
    var email = s.customer_details ? s.customer_details.email : null;

    await sql`INSERT INTO ordini
      (numero_ordine, riferimento, email, articoli, totale_centesimi, pagamento, consegna, nome, telefono, via, cap, citta, note)
      VALUES (${numero}, ${s.id}, ${email}, ${JSON.stringify(elenco)}, ${s.amount_total || 0},
              'carta', ${meta.consegna || 'corriere'}, ${meta.nome || null}, ${meta.telefono || null},
              ${meta.via || null}, ${meta.cap || null}, ${meta.citta || null}, ${meta.note || null})`;

    if (email) {
      try {
        await inviaEmail({
          to: email,
          subject: 'Ordine confermato — Arabesque Busalla',
          html: emailConfermaOrdine({
            numeroOrdine: numero,
            articoli: elenco,
            totale: ((s.amount_total || 0) / 100).toFixed(2).replace('.', ','),
            ritiro: meta.consegna === 'ritiro',
            messaggio: meta.consegna === 'ritiro'
              ? 'Lo prepariamo e ti avvisiamo appena puoi passare a ritirarlo.'
              : 'Lo prepariamo oggi stesso: parte entro 24/48 ore lavorative.'
          })
        });
      } catch (e) { console.error('email conferma', e.message); }
    }

    res.status(200).send('ok');
  } catch (err) {
    console.error('webhook', err.message);
    res.status(500).send('errore');
  }
};
