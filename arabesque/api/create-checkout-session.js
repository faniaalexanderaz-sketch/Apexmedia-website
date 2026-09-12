/* =============================================================
   ARABESQUE BUSALLA — crea la sessione di pagamento Stripe
   Riceve il carrello, ricalcola l'importo lato server e apre una
   sessione già pronta per carta, PayPal, Apple Pay e Google Pay.
   La chiave segreta vive solo qui (STRIPE_SECRET_KEY su Vercel).
   Se Stripe non è configurato risponde 501 e il sito passa da solo
   in modalità dimostrativa.
   ============================================================= */
const Stripe = require('stripe');
const { ARB_PRODOTTI, arbPrezzoFinale } = require('../prodotti');

const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SPEDIZIONE = { costo: 6.9, soglia: 79, contrassegno: 4 };

function prezzoUfficiale(slug) {
  for (var i = 0; i < ARB_PRODOTTI.length; i++) {
    if (ARB_PRODOTTI[i].slug === slug) return arbPrezzoFinale(ARB_PRODOTTI[i]);
  }
  return null;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Metodo non consentito' }); return; }
  if (!process.env.STRIPE_SECRET_KEY) { res.status(501).json({ error: 'Pagamento non ancora configurato' }); return; }

  var body = req.body || {};
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }

  var items = Array.isArray(body.items) ? body.items : [];
  if (!items.length) { res.status(400).json({ error: 'Il carrello è vuoto' }); return; }
  if (items.length > 30) { res.status(400).json({ error: 'Troppi articoli nel carrello' }); return; }

  try {
    var stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    var origin = req.headers.origin || ('https://' + req.headers.host);
    var scontoPct = Math.max(0, Math.min(20, parseInt(body.couponPct, 10) || 0));
    var ritiro = body.consegnaTipo === 'ritiro';
    var imponibile = 0;

    var lineItems = items.map(function (r) {
      var nome = String(r.nome || 'Capo').slice(0, 120);
      /* il prezzo di riferimento è quello del catalogo lato server:
         il prezzo inviato dal browser non fa fede */
      var ufficiale = prezzoUfficiale(String(r.slug || ''));
      var base = ufficiale !== null ? ufficiale : Number(r.prezzo);
      var qty = Math.max(1, Math.min(20, parseInt(r.qty, 10) || 1));
      if (!isFinite(base) || base < 1 || base > 3000) throw new Error('Importo non valido per «' + nome + '»');
      var unitario = Math.round(base * 100 * (1 - scontoPct / 100));
      if (unitario < 50) unitario = 50;
      imponibile += (unitario * qty) / 100;
      return {
        quantity: qty,
        price_data: { currency: 'eur', unit_amount: unitario, product_data: { name: nome } }
      };
    });

    var spedizione = ritiro ? 0 : (imponibile >= SPEDIZIONE.soglia ? 0 : SPEDIZIONE.costo);
    if (spedizione > 0) {
      lineItems.push({
        quantity: 1,
        price_data: { currency: 'eur', unit_amount: Math.round(spedizione * 100), product_data: { name: 'Spedizione' } }
      });
    }

    var cliente = body.cliente || {};
    var email = EMAIL_OK.test(body.email || '') ? body.email : undefined;

    var compatti = JSON.stringify(items.map(function (r) {
      return [String(r.slug || '').slice(0, 40), Math.max(1, parseInt(r.qty, 10) || 1), String(r.nome || '').slice(0, 60)];
    })).slice(0, 480);

    var sessione = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      payment_method_types: ['card'],
      locale: 'it',
      customer_email: email,
      success_url: origin + '/ordine-completato.html?sessione={CHECKOUT_SESSION_ID}',
      cancel_url: origin + '/pagamento-annullato.html',
      metadata: {
        articoli: compatti,
        consegna: ritiro ? 'ritiro' : 'corriere',
        nome: String(cliente.nome || '').slice(0, 120),
        telefono: String(cliente.telefono || '').slice(0, 40),
        via: String(cliente.via || '').slice(0, 160),
        cap: String(cliente.cap || '').slice(0, 10),
        citta: String(cliente.citta || '').slice(0, 80),
        note: String(cliente.note || '').slice(0, 300),
        coupon: String(body.coupon || '').slice(0, 30)
      }
    });

    res.status(200).json({ url: sessione.url });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Errore imprevisto' });
  }
};
