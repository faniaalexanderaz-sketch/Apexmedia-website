/* =============================================================
   ANTICA FIORERIA DEL CENTRO — crea la sessione di pagamento
   Riceve il carrello dal sito, calcola l'importo esatto (nessun
   prodotto registrato in anticipo su Stripe) e apre una sessione
   di pagamento Stripe già pronta per carta, PayPal, Apple Pay e
   Google Pay. La chiave segreta vive solo qui, come variabile
   d'ambiente STRIPE_SECRET_KEY su Netlify — mai nel sito.
   ============================================================= */
const Stripe = require('stripe');

const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Metodo non consentito' }) };
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return { statusCode: 501, body: JSON.stringify({ error: 'Stripe non è ancora configurato su questo sito' }) };
  }

  var body;
  try { body = JSON.parse(event.body || '{}'); } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Richiesta non valida' }) };
  }

  var items = Array.isArray(body.items) ? body.items : [];
  if (!items.length) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Il carrello è vuoto' }) };
  }
  if (items.length > 30) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Troppi articoli nel carrello' }) };
  }

  try {
    var stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    var origin = (event.headers.origin) || ('https://' + event.headers.host);

    var lineItems = items.map(function (r) {
      var nome = String(r.nome || 'Bouquet').slice(0, 120);
      var prezzo = Math.round(Number(r.prezzo) * 100); // in centesimi
      var qty = Math.max(1, Math.min(20, parseInt(r.qty, 10) || 1));
      if (!isFinite(prezzo) || prezzo < 100 || prezzo > 100000) {
        throw new Error('Importo non valido per "' + nome + '"');
      }
      return {
        quantity: qty,
        price_data: {
          currency: 'eur',
          unit_amount: prezzo,
          product_data: { name: nome }
        }
      };
    });

    var consegna = body.consegna || {};
    var emailCliente = EMAIL_OK.test(body.email || '') ? body.email : undefined;

    var session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      payment_method_types: ['card', 'paypal'],
      locale: 'it',
      customer_email: emailCliente,
      success_url: origin + '/ordine-completato.html?sessione={CHECKOUT_SESSION_ID}',
      cancel_url: origin + '/pagamento-annullato.html',
      metadata: {
        nome_ricevente: String(consegna.nome || '').slice(0, 200),
        telefono: String(consegna.telefono || '').slice(0, 60),
        via: String(consegna.via || '').slice(0, 200),
        cap: String(consegna.cap || '').slice(0, 20),
        citta: String(consegna.citta || '').slice(0, 100),
        giorno_consegna: String(consegna.giorno || '').slice(0, 20),
        messaggio: String(consegna.messaggio || '').slice(0, 400)
      }
    });

    return { statusCode: 200, body: JSON.stringify({ url: session.url }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message || 'Errore imprevisto' }) };
  }
};
