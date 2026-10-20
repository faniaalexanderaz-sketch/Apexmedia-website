/* =============================================================
   POST /api/pagamento { codice, email } — pagamento online (SPENTO)
   Aggancio pronto per Stripe Checkout, come in
   arabesque/api/create-checkout-session.js. Si accende da solo
   impostando STRIPE_SECRET_KEY su Vercel; fino ad allora risponde
   501 e il cliente paga in sede.
   Da completare all'accensione: webhook che segna "pagato".
   ============================================================= */
const { trova } = require('./_prenotazioni');
const { impostazioni, pacchetto } = require('./_impostazioni');
const { corpo, json, errore, soloMetodo, sitoUrl } = require('./_http');

module.exports = async (req, res) => {
  if (!soloMetodo(req, res, 'POST')) return;
  if (!process.env.STRIPE_SECRET_KEY) { json(res, 501, { errore: 'PAGAMENTO_SPENTO', messaggio: 'Il pagamento online non è ancora attivo: paghi in sede.' }); return; }
  try {
    const b = corpo(req);
    const p = await trova(b.codice, b.email);
    if (p.pagato || p.prezzo_centesimi === 0) { json(res, 409, { errore: 'GIA_FATTO', messaggio: 'Questa prenotazione è già pagata.' }); return; }
    const cfg = await impostazioni(), pk = pacchetto(cfg, p.pacchetto), sito = sitoUrl(req);
    const form = new URLSearchParams({
      mode: 'payment', locale: 'it', customer_email: p.email, client_reference_id: p.codice,
      'line_items[0][quantity]': '1',
      'line_items[0][price_data][currency]': 'eur',
      'line_items[0][price_data][unit_amount]': String(p.prezzo_centesimi),
      'line_items[0][price_data][product_data][name]': 'Bagnarino Coworking – ' + (pk ? pk.nome : p.pacchetto) + ' (' + p.codice + ')',
      success_url: sito + '/prenotazione?codice=' + p.codice + '&email=' + encodeURIComponent(p.email) + '&pagato=1',
      cancel_url: sito + '/prenotazione?codice=' + p.codice + '&email=' + encodeURIComponent(p.email)
    });
    const r = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST', body: form,
      headers: { Authorization: 'Bearer ' + process.env.STRIPE_SECRET_KEY, 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    const s = await r.json();
    if (!r.ok) throw new Error('Stripe ' + r.status);
    json(res, 200, { url: s.url });
  } catch (err) { errore(res, err); }
};
