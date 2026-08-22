/* =============================================================
   ANTICA FIORERIA DEL CENTRO — ordine con pagamento alla consegna
   Il contrassegno non passa da Stripe: qui registriamo subito
   l'ordine, scaliamo le scorte e mandiamo la conferma via email —
   esattamente come fa il webhook di Stripe dopo un pagamento
   online, ma nel momento stesso dell'ordine, perché qui il
   pagamento vero avviene di persona al corriere.
   Il sovrapprezzo del contrassegno è fisso — € 15, uguale per
   tutti gli ordini — e non viene mai scontato dal coupon.
   ============================================================= */
const { sql, assicuraSchema } = require('./_db');
const { inviaEmail } = require('./_email');
const { afcProdotto } = require('../prodotti');
const { emailConfermaOrdine, rigaArticolo, rigaExtra } = require('./_email-template');

const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const COSTO_CONTRASSEGNO_CENT = 1500; // € 15, fisso per tutti

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Metodo non consentito' });
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
    await assicuraSchema();

    var scorteAttuali = {};
    var righeScorte = (await sql`SELECT slug, quantita FROM prodotti_scorte`);
    righeScorte.forEach(function (r) { scorteAttuali[r.slug] = r.quantita; });

    // coupon: stessa percentuale, stesso limite prudenziale del pagamento online
    var scontoCoupon = Math.max(0, Math.min(20, parseInt(body.couponPct, 10) || 0));
    var scorteRichieste = {};
    var articoliDaScalare = [];
    var totaleCentesimi = 0;

    items.forEach(function (r) {
      var nome = String(r.nome || 'Bouquet').slice(0, 120);
      var prezzoPieno = Math.round(Number(r.prezzo) * 100);
      var qty = Math.max(1, Math.min(20, parseInt(r.qty, 10) || 1));
      if (!isFinite(prezzoPieno) || prezzoPieno < 100 || prezzoPieno > 100000) {
        throw new Error('Importo non valido per "' + nome + '"');
      }
      var prezzo = Math.round(prezzoPieno * (1 - scontoCoupon / 100));
      if (prezzo < 50) prezzo = 50;
      totaleCentesimi += prezzo * qty;

      var slug = typeof r.slug === 'string' ? r.slug.slice(0, 40) : null;
      if (slug) {
        scorteRichieste[slug] = (scorteRichieste[slug] || 0) + qty;
        if (Object.prototype.hasOwnProperty.call(scorteAttuali, slug) &&
            scorteRichieste[slug] > scorteAttuali[slug]) {
          throw new Error('«' + nome + '» non è più disponibile in questa quantità');
        }
        articoliDaScalare.push([slug, qty]);
      }
    });

    // il contrassegno sostituisce la spedizione assicurata (12/15€): non si
    // paga due volte, quindi qui non si aggiunge mai — solo il sovrapprezzo fisso
    totaleCentesimi += COSTO_CONTRASSEGNO_CENT;

    var consegna = body.consegna || {};
    var emailCliente = EMAIL_OK.test(body.email || '') ? body.email : null;

    for (var i = 0; i < articoliDaScalare.length; i++) {
      await sql`UPDATE prodotti_scorte
                SET quantita = GREATEST(0, quantita - ${articoliDaScalare[i][1]})
                WHERE slug = ${articoliDaScalare[i][0]}`;
    }

    var idOrdine = 'COD-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
    var numeroOrdine = idOrdine.slice(-8).toUpperCase();
    var messaggio = (String(consegna.messaggio || '').slice(0, 360) +
      ' [Pagamento: contrassegno alla consegna, +€15]').trim().slice(0, 400);

    await sql`INSERT INTO ordini
      (sessione_stripe, numero_ordine, email, articoli, totale_centesimi, nome_ricevente, telefono, via, cap, citta, messaggio)
      VALUES (
        ${idOrdine},
        ${numeroOrdine},
        ${emailCliente},
        ${JSON.stringify(articoliDaScalare)},
        ${totaleCentesimi},
        ${String(consegna.nome || '').slice(0, 200)},
        ${String(consegna.telefono || '').slice(0, 60)},
        ${String(consegna.via || '').slice(0, 200)},
        ${String(consegna.cap || '').slice(0, 20)},
        ${String(consegna.citta || '').slice(0, 100)},
        ${messaggio}
      )`;

    // email di conferma: se SENDGRID_API_KEY non è configurata, inviaEmail
    // non fa nulla — non deve mai far fallire la registrazione dell'ordine
    if (emailCliente) {
      try {
        var righeArticoli = articoliDaScalare.map(function (a) {
          var prod = afcProdotto(a[0]);
          return rigaArticolo(prod ? prod.nome : a[0], a[1]);
        }).join('');

        var righeExtra = rigaExtra('Contrassegno alla consegna (spedizione inclusa)', '€ 15,00');

        var indirizzoHtml = [consegna.nome, consegna.via, [consegna.cap, consegna.citta].filter(Boolean).join(' ')]
          .filter(Boolean).join('<br/>') || null;

        await inviaEmail({
          to: emailCliente,
          subject: 'Il tuo ordine è confermato — Antica Fioreria del Centro',
          html: emailConfermaOrdine({
            numeroOrdine: numeroOrdine,
            email: emailCliente,
            righeArticoli: righeArticoli,
            righeExtra: righeExtra,
            totaleCentesimi: totaleCentesimi,
            avviso: 'Pagamento alla consegna: tieni pronto l\'importo in contanti o con carta per il corriere.',
            indirizzoHtml: indirizzoHtml
          })
        });
      } catch (err) {
        console.error('Invio email conferma fallito:', err.message);
      }
    }

    res.status(200).json({ ok: true, ordine: idOrdine, numeroOrdine: numeroOrdine });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Errore imprevisto' });
  }
};
