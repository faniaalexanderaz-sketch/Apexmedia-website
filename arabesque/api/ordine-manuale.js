/* =============================================================
   ARABESQUE BUSALLA — ordini senza pagamento online
   Contrassegno e ritiro in negozio: l'ordine si registra qui e
   l'incasso avviene alla consegna o in cassa.
   ============================================================= */
const { sql, assicuraSchema, nuovoNumeroOrdine } = require('./_db');
const { inviaEmail } = require('./_email');
const { emailConfermaOrdine } = require('./_email-template');
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

  var body = req.body || {};
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }

  var items = Array.isArray(body.items) ? body.items : [];
  if (!items.length) { res.status(400).json({ error: 'Il carrello è vuoto' }); return; }
  if (!EMAIL_OK.test(body.email || '')) { res.status(400).json({ error: 'Email non valida' }); return; }

  var ritiro = body.consegnaTipo === 'ritiro';
  var pagamento = ritiro ? 'negozio' : 'contrassegno';
  var scontoPct = Math.max(0, Math.min(20, parseInt(body.couponPct, 10) || 0));

  var totale = 0;
  var elenco = items.map(function (r) {
    var ufficiale = prezzoUfficiale(String(r.slug || ''));
    var base = ufficiale !== null ? ufficiale : Number(r.prezzo) || 0;
    var qty = Math.max(1, Math.min(20, parseInt(r.qty, 10) || 1));
    totale += base * qty * (1 - scontoPct / 100);
    return { slug: String(r.slug || '').slice(0, 40), qty: qty, nome: String(r.nome || '').slice(0, 120) };
  });
  if (!ritiro) {
    totale += totale >= SPEDIZIONE.soglia ? 0 : SPEDIZIONE.costo;
    totale += SPEDIZIONE.contrassegno;
  }
  var centesimi = Math.round(totale * 100);

  var cliente = body.cliente || {};
  var numero = nuovoNumeroOrdine();

  try {
    await assicuraSchema();
    await sql`INSERT INTO ordini
      (numero_ordine, riferimento, email, articoli, totale_centesimi, pagamento, consegna, nome, telefono, via, cap, citta, note)
      VALUES (${numero}, ${null}, ${body.email}, ${JSON.stringify(elenco)}, ${centesimi},
              ${pagamento}, ${ritiro ? 'ritiro' : 'corriere'},
              ${String(cliente.nome || '').slice(0, 120)}, ${String(cliente.telefono || '').slice(0, 40)},
              ${String(cliente.via || '').slice(0, 160)}, ${String(cliente.cap || '').slice(0, 10)},
              ${String(cliente.citta || '').slice(0, 80)}, ${String(cliente.note || '').slice(0, 300)})`;

    inviaEmail({
      to: body.email,
      subject: 'Ordine confermato — Arabesque Busalla',
      html: emailConfermaOrdine({
        numeroOrdine: numero,
        articoli: elenco,
        totale: (centesimi / 100).toFixed(2).replace('.', ','),
        ritiro: ritiro,
        messaggio: ritiro
          ? 'Lo prepariamo e ti avvisiamo appena puoi passare a ritirarlo. Paghi in cassa.'
          : 'Paghi al corriere alla consegna. Parte entro 24/48 ore lavorative.'
      })
    }).catch(function () {});

    res.status(200).json({ numeroOrdine: numero });
  } catch (err) {
    if (err.codice === 'DB_ASSENTE') { res.status(501).json({ error: 'Ordini non ancora attivi su questo sito' }); return; }
    console.error('ordine-manuale', err.message);
    res.status(500).json({ error: 'Non riusciamo a registrare l\'ordine in questo momento' });
  }
};
