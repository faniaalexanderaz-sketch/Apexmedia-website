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

    // email di conferma: se RESEND_API_KEY non è configurata, inviaEmail
    // non fa nulla — non deve mai far fallire il webhook
    var emailCliente = sessione.customer_details ? sessione.customer_details.email : null;
    if (emailCliente) {
      try {
        await inviaEmail({
          to: emailCliente,
          subject: 'Il tuo ordine è confermato — Antica Fioreria del Centro',
          html: emailConfermaOrdine(sessione, articoli, meta)
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

/* ---------- testo dell'email di conferma ---------- */
function euro(centesimi) {
  return '€ ' + (centesimi / 100).toFixed(2).replace('.', ',');
}

function emailConfermaOrdine(sessione, articoli, meta) {
  var righeArticoli = articoli.map(function (a) {
    var slug = a[0], qty = a[1];
    var prod = afcProdotto(slug);
    var nome = prod ? prod.nome : slug;
    return '<tr>' +
      '<td style="padding:10px 0;border-bottom:1px solid #ECE8E1;color:#24352B;font-size:15px;">' + nome + '</td>' +
      '<td style="padding:10px 0;border-bottom:1px solid #ECE8E1;color:#5A6B5E;font-size:15px;text-align:right;">× ' + qty + '</td>' +
      '</tr>';
  }).join('');

  var indirizzo = [meta.nome_ricevente, meta.via, [meta.cap, meta.citta].filter(Boolean).join(' ')]
    .filter(Boolean).join('<br/>');

  var numeroOrdine = String(sessione.id || '').slice(-8).toUpperCase();
  var spedizioneEuro = parseInt(meta.spedizione, 10) || 0;
  var rigaSpedizione = spedizioneEuro
    ? '<tr><td style="padding:10px 0;color:#5A6B5E;font-size:14px;">Spedizione assicurata</td>' +
      '<td style="padding:10px 0;color:#5A6B5E;font-size:14px;text-align:right;">€ ' + spedizioneEuro + ',00</td></tr>'
    : '';

  return '' +
    '<div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#FAFAF7;">' +
    '  <p style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#9CAF94;margin:0 0 6px;">Ordine confermato</p>' +
    '  <h1 style="font-size:26px;color:#24352B;margin:0 0 18px;">Grazie di cuore!</h1>' +
    '  <p style="font-size:15px;line-height:1.6;color:#5A6B5E;margin:0 0 22px;">Il tuo ordine <strong>#' + numeroOrdine + '</strong> è confermato e lo stiamo già preparando con cura in bottega. Arriverà in 48/72 ore lavorative.</p>' +
    '  <table style="width:100%;border-collapse:collapse;margin:0 0 18px;">' + righeArticoli + rigaSpedizione + '</table>' +
    '  <p style="font-size:17px;font-weight:bold;color:#24352B;text-align:right;margin:0 0 26px;">Totale: ' + euro(sessione.amount_total || 0) + '</p>' +
    (indirizzo ? '  <p style="font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#9CAF94;margin:0 0 6px;">Consegna a</p>' +
      '  <p style="font-size:15px;line-height:1.5;color:#24352B;margin:0 0 26px;">' + indirizzo + '</p>' : '') +
    '  <p style="font-size:13px;line-height:1.6;color:#5A6B5E;margin:0;">Per qualsiasi domanda sul tuo ordine, rispondi pure a questa email o scrivici a <a href="mailto:info@anticafioreriadelcentro.it" style="color:#2E4B3A;">info@anticafioreriadelcentro.it</a>.</p>' +
    '  <p style="font-size:13px;color:#9CAF94;margin:26px 0 0;">Antica Fioreria del Centro · dal 1953</p>' +
    '</div>';
}
