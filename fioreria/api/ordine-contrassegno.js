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
    var spedizioneEuro = 0;
    totaleCentesimi += COSTO_CONTRASSEGNO_CENT;

    var consegna = body.consegna || {};
    var emailCliente = EMAIL_OK.test(body.email || '') ? body.email : null;

    for (var i = 0; i < articoliDaScalare.length; i++) {
      await sql`UPDATE prodotti_scorte
                SET quantita = GREATEST(0, quantita - ${articoliDaScalare[i][1]})
                WHERE slug = ${articoliDaScalare[i][0]}`;
    }

    var idOrdine = 'COD-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
    var messaggio = (String(consegna.messaggio || '').slice(0, 360) +
      ' [Pagamento: contrassegno alla consegna, +€15]').trim().slice(0, 400);

    await sql`INSERT INTO ordini
      (sessione_stripe, email, articoli, totale_centesimi, nome_ricevente, telefono, via, cap, citta, messaggio)
      VALUES (
        ${idOrdine},
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

    // email di conferma: se RESEND_API_KEY non è configurata, inviaEmail
    // non fa nulla — non deve mai far fallire la registrazione dell'ordine
    if (emailCliente) {
      try {
        await inviaEmail({
          to: emailCliente,
          subject: 'Il tuo ordine è confermato — Antica Fioreria del Centro',
          html: emailConfermaContrassegno(idOrdine, articoliDaScalare, totaleCentesimi, spedizioneEuro, consegna)
        });
      } catch (err) {
        console.error('Invio email conferma fallito:', err.message);
      }
    }

    res.status(200).json({ ok: true, ordine: idOrdine });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Errore imprevisto' });
  }
};

/* ---------- testo dell'email di conferma ---------- */
function euro(centesimi) {
  return '€ ' + (centesimi / 100).toFixed(2).replace('.', ',');
}

function emailConfermaContrassegno(idOrdine, articoli, totaleCentesimi, spedizioneEuro, consegna) {
  var righeArticoli = articoli.map(function (a) {
    var slug = a[0], qty = a[1];
    var prod = afcProdotto(slug);
    var nome = prod ? prod.nome : slug;
    return '<tr>' +
      '<td style="padding:10px 0;border-bottom:1px solid #ECE8E1;color:#24352B;font-size:15px;">' + nome + '</td>' +
      '<td style="padding:10px 0;border-bottom:1px solid #ECE8E1;color:#5A6B5E;font-size:15px;text-align:right;">× ' + qty + '</td>' +
      '</tr>';
  }).join('');

  var indirizzo = [consegna.nome, consegna.via, [consegna.cap, consegna.citta].filter(Boolean).join(' ')]
    .filter(Boolean).join('<br/>');

  var numeroOrdine = idOrdine.slice(-8).toUpperCase();
  var rigaSpedizione = spedizioneEuro
    ? '<tr><td style="padding:10px 0;color:#5A6B5E;font-size:14px;">Spedizione assicurata</td>' +
      '<td style="padding:10px 0;color:#5A6B5E;font-size:14px;text-align:right;">€ ' + spedizioneEuro + ',00</td></tr>'
    : '';
  var rigaContrassegno =
    '<tr><td style="padding:10px 0;color:#5A6B5E;font-size:14px;">Contrassegno alla consegna</td>' +
    '<td style="padding:10px 0;color:#5A6B5E;font-size:14px;text-align:right;">€ 15,00</td></tr>';

  return '' +
    '<div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#FAFAF7;">' +
    '  <p style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#9CAF94;margin:0 0 6px;">Ordine confermato</p>' +
    '  <h1 style="font-size:26px;color:#24352B;margin:0 0 18px;">Grazie di cuore!</h1>' +
    '  <p style="font-size:15px;line-height:1.6;color:#5A6B5E;margin:0 0 22px;">Il tuo ordine <strong>#' + numeroOrdine + '</strong> è confermato e lo stiamo già preparando con cura in bottega. Arriverà in 48/72 ore lavorative.</p>' +
    '  <table style="width:100%;border-collapse:collapse;margin:0 0 18px;">' + righeArticoli + rigaSpedizione + rigaContrassegno + '</table>' +
    '  <p style="font-size:17px;font-weight:bold;color:#24352B;text-align:right;margin:0 0 10px;">Totale: ' + euro(totaleCentesimi) + '</p>' +
    '  <p style="font-size:14px;color:#8A6A2A;background:#FBF3E4;border-radius:8px;padding:10px 14px;margin:0 0 26px;">Pagamento alla consegna: tieni pronto l\'importo in contanti o con carta per il corriere.</p>' +
    (indirizzo ? '  <p style="font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#9CAF94;margin:0 0 6px;">Consegna a</p>' +
      '  <p style="font-size:15px;line-height:1.5;color:#24352B;margin:0 0 26px;">' + indirizzo + '</p>' : '') +
    '  <p style="font-size:13px;line-height:1.6;color:#5A6B5E;margin:0;">Per qualsiasi domanda sul tuo ordine, rispondi pure a questa email o scrivici a <a href="mailto:info@anticafioreriadelcentro.it" style="color:#2E4B3A;">info@anticafioreriadelcentro.it</a>.</p>' +
    '  <p style="font-size:13px;color:#9CAF94;margin:26px 0 0;">Antica Fioreria del Centro · dal 1953</p>' +
    '</div>';
}
