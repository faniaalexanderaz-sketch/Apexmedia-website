/* =============================================================
   ANTICA FIORERIA DEL CENTRO — crea la sessione di pagamento
   Versione per Vercel Serverless Functions (porting da Netlify
   Functions). Riceve il carrello dal sito, calcola l'importo
   esatto (nessun prodotto registrato in anticipo su Stripe) e
   apre una sessione di pagamento Stripe già pronta per carta,
   PayPal, Apple Pay e Google Pay. La chiave segreta vive solo
   qui, come variabile d'ambiente STRIPE_SECRET_KEY su Vercel —
   mai nel sito.
   ============================================================= */
const Stripe = require('stripe');
const { sql, assicuraSchema } = require('./_db');

const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Metodo non consentito' });
    return;
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    res.status(501).json({ error: 'Stripe non è ancora configurato su questo sito' });
    return;
  }

  var body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) {
      res.status(400).json({ error: 'Richiesta non valida' });
      return;
    }
  }

  var items = Array.isArray(body.items) ? body.items : [];
  if (!items.length) {
    res.status(400).json({ error: 'Il carrello è vuoto' });
    return;
  }
  if (items.length > 30) {
    res.status(400).json({ error: 'Troppi articoli nel carrello' });
    return;
  }

  try {
    // controllo scorte: chi ha slug lo trova esaurito viene bloccato prima di Stripe
    await assicuraSchema();
    var scorteAttuali = {};
    var righeScorte = (await sql`SELECT slug, quantita FROM prodotti_scorte`);
    righeScorte.forEach(function (r) { scorteAttuali[r.slug] = r.quantita; });

    var stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    var origin = req.headers.origin || ('https://' + req.headers.host);
    var scorteRichieste = {};

    // coupon (es. BENVENUTO10): percentuale di sconto applicata all'importo
    // effettivamente addebitato, così Stripe incassa esattamente il "Paga €X"
    // mostrato al cliente. Il sistema coupon è lato dispositivo, quindi la
    // percentuale è limitata prudenzialmente per contenere eventuali abusi.
    var scontoCoupon = Math.max(0, Math.min(20, parseInt(body.couponPct, 10) || 0));

    var lineItems = items.map(function (r) {
      var nome = String(r.nome || 'Bouquet').slice(0, 120);
      var prezzoPieno = Math.round(Number(r.prezzo) * 100); // in centesimi
      var qty = Math.max(1, Math.min(20, parseInt(r.qty, 10) || 1));
      if (!isFinite(prezzoPieno) || prezzoPieno < 100 || prezzoPieno > 100000) {
        throw new Error('Importo non valido per "' + nome + '"');
      }
      var prezzo = Math.round(prezzoPieno * (1 - scontoCoupon / 100));
      if (prezzo < 50) prezzo = 50; // minimo consentito da Stripe per EUR (0,50 €)
      var slug = typeof r.slug === 'string' ? r.slug.slice(0, 40) : null;
      if (slug) {
        scorteRichieste[slug] = (scorteRichieste[slug] || 0) + qty;
        if (Object.prototype.hasOwnProperty.call(scorteAttuali, slug) &&
            scorteRichieste[slug] > scorteAttuali[slug]) {
          throw new Error('«' + nome + '» non è più disponibile in questa quantità');
        }
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

    // spedizione assicurata: 12€ (pacchi S/M) o 15€ (pacchi L/XL), mai scontata dal coupon
    var TARIFFE_SPEDIZIONE = [12, 15, 50]; // S/M, L/XL, tariffa fissa (es. bonsai)
    var spedizioneEuro = Number(body.spedizione);
    if (TARIFFE_SPEDIZIONE.indexOf(spedizioneEuro) === -1) spedizioneEuro = 0;
    if (spedizioneEuro > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: spedizioneEuro * 100,
          product_data: { name: 'Spedizione assicurata' }
        }
      });
    }

    var consegna = body.consegna || {};
    var emailCliente = EMAIL_OK.test(body.email || '') ? body.email : undefined;

    // elenco compatto slug:quantità, letto dal webhook per scalare le scorte
    var articoliCompatti = JSON.stringify(
      items.filter(function (r) { return typeof r.slug === 'string'; })
           .map(function (r) { return [r.slug.slice(0, 40), Math.max(1, Math.min(20, parseInt(r.qty, 10) || 1))]; })
    ).slice(0, 480);

    var session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      payment_method_types: ['card'],
      locale: 'it',
      customer_email: emailCliente,
      success_url: origin + '/ordine-completato.html?sessione={CHECKOUT_SESSION_ID}',
      cancel_url: origin + '/pagamento-annullato.html',
      metadata: {
        articoli: articoliCompatti,
        nome_ricevente: String(consegna.nome || '').slice(0, 200),
        telefono: String(consegna.telefono || '').slice(0, 60),
        via: String(consegna.via || '').slice(0, 200),
        cap: String(consegna.cap || '').slice(0, 20),
        citta: String(consegna.citta || '').slice(0, 100),
        giorno_consegna: String(consegna.giorno || '').slice(0, 20),
        messaggio: String(consegna.messaggio || '').slice(0, 400),
        coupon: String(body.coupon || '').slice(0, 40),
        spedizione: String(spedizioneEuro)
      }
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Errore imprevisto' });
  }
};
