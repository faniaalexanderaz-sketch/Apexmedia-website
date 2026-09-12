/* =============================================================
   ARABESQUE BUSALLA — email di conferma ordine (HTML)
   Tabella semplice: è ciò che i client email renderizzano bene.
   ============================================================= */
function emailConfermaOrdine(d) {
  var righe = (d.articoli || []).map(function (a) {
    return '<tr><td style="padding:10px 0;border-bottom:1px solid #E6E2D8;font:15px Georgia,serif;color:#15151A">' +
      a.nome + '</td><td align="right" style="padding:10px 0;border-bottom:1px solid #E6E2D8;font:14px Arial;color:#15151A">×' +
      a.qty + '</td></tr>';
  }).join('');

  return '<div style="background:#0B0B0C;padding:32px 0;font-family:Arial,Helvetica,sans-serif">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">' +
    '<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#F3EFE7;border-radius:14px;overflow:hidden">' +
      '<tr><td style="background:#0B0B0C;padding:26px 30px;text-align:center">' +
        '<div style="font:500 22px Georgia,serif;letter-spacing:6px;color:#F3EFE7">ARABESQUE</div>' +
        '<div style="font:11px Arial;letter-spacing:4px;color:#C8A96A;margin-top:4px">BUSALLA</div>' +
      '</td></tr>' +
      '<tr><td style="padding:30px">' +
        '<h1 style="font:500 26px Georgia,serif;color:#15151A;margin:0 0 10px">Grazie, ordine confermato</h1>' +
        '<p style="font:15px Arial;color:#4A4A52;margin:0 0 6px">Numero ordine: <b>' + d.numeroOrdine + '</b></p>' +
        '<p style="font:15px Arial;color:#4A4A52;margin:0 0 22px">' + (d.messaggio || '') + '</p>' +
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">' + righe +
          '<tr><td style="padding:14px 0;font:600 17px Georgia,serif;color:#15151A">Totale</td>' +
          '<td align="right" style="padding:14px 0;font:600 17px Georgia,serif;color:#15151A">€ ' + d.totale + '</td></tr>' +
        '</table>' +
        (d.ritiro
          ? '<p style="font:14px Arial;color:#4A4A52;margin:18px 0 0;padding:14px;background:#EFE9DC;border-radius:8px">Ti avvisiamo appena è pronto in negozio, in Via Vittorio Veneto 154 a Busalla. Lo teniamo da parte 7 giorni.</p>'
          : '<p style="font:14px Arial;color:#4A4A52;margin:18px 0 0">Ti scriviamo di nuovo quando il pacco parte, con il codice di tracciamento.</p>') +
        '<p style="font:13px Arial;color:#7A7A80;margin:26px 0 0">Un dubbio sulla taglia? Rispondi a questa email o scrivici su WhatsApp: cambiare taglia è semplice.</p>' +
      '</td></tr>' +
      '<tr><td style="background:#EFE9DC;padding:18px 30px;font:12px Arial;color:#7A7A80;text-align:center">' +
        'Arabesque Abbigliamento · Via Vittorio Veneto 154, Busalla (GE)' +
      '</td></tr>' +
    '</table></td></tr></table></div>';
}
module.exports = { emailConfermaOrdine };
