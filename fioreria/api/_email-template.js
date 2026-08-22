/* =============================================================
   ANTICA FIORERIA DEL CENTRO — template email di conferma ordine
   Un'unica sorgente per l'aspetto delle email (Stripe e contrassegno
   la usano entrambe), così restano sempre uguali e in stile col
   sito: sfondo botanico, testata verde bosco, bottoni "in pillola".
   HTML a tabelle con stili inline — è l'unico modo per essere
   compatibili con la maggior parte dei client di posta.
   ============================================================= */
const ORIGINE = 'https://anticafioreriadelcentro.it';
const WHATSAPP = 'https://wa.me/393273370547?text=Ciao%21%20Ho%20una%20domanda%20sul%20mio%20ordine.';

function euro(centesimi) {
  return '€ ' + (centesimi / 100).toFixed(2).replace('.', ',');
}

/* opts: {
     numeroOrdine, righeArticoli (html <tr>...</tr>), righeExtra (html,
     facoltativo — spedizione/contrassegno), totaleCentesimi, avviso
     (testo facoltativo, es. nota sul contrassegno), indirizzoHtml
     (facoltativo)
   } */
function emailConfermaOrdine(opts) {
  var numeroOrdine = opts.numeroOrdine || '';
  var trackingUrl = ORIGINE + '/traccia-ordine.html?numero=' + encodeURIComponent(numeroOrdine) +
    (opts.email ? '&email=' + encodeURIComponent(opts.email) : '');

  var rigaAvviso = opts.avviso
    ? '<tr><td style="padding:0 40px 24px;">' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>' +
      '<td style="background:#FBF3E4;border:1px solid rgba(194,164,92,.34);border-radius:12px;padding:14px 18px;font-family:Georgia,\'Times New Roman\',serif;font-size:14px;line-height:1.55;color:#8A6A2A;">' +
      opts.avviso +
      '</td></tr></table></td></tr>'
    : '';

  var rigaIndirizzo = opts.indirizzoHtml
    ? '<tr><td style="padding:0 40px 8px;">' +
      '<p style="margin:0 0 6px;font-family:Georgia,\'Times New Roman\',serif;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#9CAF94;">Consegna a</p>' +
      '<p style="margin:0;font-family:Georgia,\'Times New Roman\',serif;font-size:15px;line-height:1.55;color:#24352B;">' + opts.indirizzoHtml + '</p>' +
      '</td></tr>'
    : '';

  return '' +
'<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>Il tuo ordine è confermato</title></head>' +
'<body style="margin:0;padding:0;background:#F2F6EC;font-family:Georgia,\'Times New Roman\',serif;">' +
'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F2F6EC;padding:36px 16px;">' +
'<tr><td align="center">' +
'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border:1px solid #ECE8E1;border-radius:20px;overflow:hidden;">' +

  // testata
  '<tr><td align="center" style="background:#2E4B3A;padding:30px 32px 26px;">' +
  '<img src="' + ORIGINE + '/foto/logo-orizzontale.jpg" width="168" alt="Antica Fioreria del Centro" style="display:block;max-width:168px;height:auto;border-radius:8px;" />' +
  '</td></tr>' +

  // eyebrow + titolo + numero ordine
  '<tr><td align="center" style="padding:30px 40px 4px;">' +
  '<p style="margin:0 0 10px;font-family:Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#9CAF94;">Ordine confermato</p>' +
  '<h1 style="margin:0 0 16px;font-family:Georgia,\'Times New Roman\',serif;font-size:28px;color:#24352B;">Grazie di cuore!</h1>' +
  '<p style="display:inline-block;margin:0 0 22px;padding:6px 16px;background:#F4EDDC;border:1px solid rgba(194,164,92,.4);border-radius:999px;font-family:Helvetica,Arial,sans-serif;font-size:13px;font-weight:bold;letter-spacing:.03em;color:#2E4B3A;">Ordine #' + numeroOrdine + '</p>' +
  '</td></tr>' +

  '<tr><td style="padding:0 40px 22px;">' +
  '<p style="margin:0;font-family:Georgia,\'Times New Roman\',serif;font-size:15px;line-height:1.6;color:#5A6B5E;text-align:center;">Lo stiamo già preparando con cura in bottega. Arriverà in 48/72 ore lavorative.</p>' +
  '</td></tr>' +

  // articoli
  '<tr><td style="padding:0 40px;">' +
  '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">' +
  opts.righeArticoli + (opts.righeExtra || '') +
  '</table></td></tr>' +

  '<tr><td style="padding:14px 40px 26px;">' +
  '<p style="margin:0;font-family:Georgia,\'Times New Roman\',serif;font-size:18px;font-weight:bold;color:#24352B;text-align:right;">Totale: ' + euro(opts.totaleCentesimi) + '</p>' +
  '</td></tr>' +

  rigaAvviso +

  // bottoni
  '<tr><td align="center" style="padding:0 40px 30px;">' +
  '<table role="presentation" cellpadding="0" cellspacing="0"><tr>' +
  '<td style="padding:0 6px 10px;">' +
  '<a href="' + trackingUrl + '" style="display:inline-block;padding:13px 26px;background:#2E4B3A;color:#FFFFFF;font-family:Helvetica,Arial,sans-serif;font-size:14px;font-weight:bold;text-decoration:none;border-radius:999px;">Traccia il tuo ordine</a>' +
  '</td>' +
  '<td style="padding:0 6px 10px;">' +
  '<a href="' + WHATSAPP + '" style="display:inline-block;padding:12px 24px;background:#FFFFFF;color:#2E4B3A;font-family:Helvetica,Arial,sans-serif;font-size:14px;font-weight:bold;text-decoration:none;border-radius:999px;border:1.5px solid #2E4B3A;">Scrivici su WhatsApp</a>' +
  '</td>' +
  '</tr></table>' +
  '</td></tr>' +

  rigaIndirizzo +

  // footer
  '<tr><td style="padding:20px 40px 8px;border-top:1px solid #ECE8E1;">' +
  '<p style="margin:0;font-family:Georgia,\'Times New Roman\',serif;font-size:13px;line-height:1.6;color:#5A6B5E;">Per qualsiasi domanda sul tuo ordine, rispondi pure a questa email o scrivici a <a href="mailto:info@anticafioreriadelcentro.it" style="color:#2E4B3A;">info@anticafioreriadelcentro.it</a>.</p>' +
  '</td></tr>' +
  '<tr><td align="center" style="padding:18px 40px 30px;">' +
  '<p style="margin:0;font-family:Georgia,\'Times New Roman\',serif;font-style:italic;font-size:13px;color:#9CAF94;">Antica Fioreria del Centro · dal 1953</p>' +
  '</td></tr>' +

'</table>' +
'</td></tr>' +
'</table>' +
'</body></html>';
}

/* riga articolo pronta per la tabella email */
function rigaArticolo(nome, qty) {
  return '<tr>' +
    '<td style="padding:10px 0;border-bottom:1px solid #ECE8E1;font-family:Georgia,\'Times New Roman\',serif;color:#24352B;font-size:15px;">' + nome + '</td>' +
    '<td style="padding:10px 0;border-bottom:1px solid #ECE8E1;font-family:Georgia,\'Times New Roman\',serif;color:#5A6B5E;font-size:15px;text-align:right;">× ' + qty + '</td>' +
    '</tr>';
}

/* riga extra (spedizione / contrassegno) pronta per la tabella email */
function rigaExtra(etichetta, euroTesto) {
  return '<tr>' +
    '<td style="padding:10px 0;font-family:Georgia,\'Times New Roman\',serif;color:#5A6B5E;font-size:14px;">' + etichetta + '</td>' +
    '<td style="padding:10px 0;font-family:Georgia,\'Times New Roman\',serif;color:#5A6B5E;font-size:14px;text-align:right;">' + euroTesto + '</td>' +
    '</tr>';
}

module.exports = { emailConfermaOrdine, rigaArticolo, rigaExtra, euro };
