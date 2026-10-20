/* =============================================================
   BAGNARINO COWORKING — modelli delle email
   Layout a tabelle con stili in linea: è l'unico modo per avere
   la stessa resa su Gmail, Apple Mail e Outlook. Font di sistema
   (i font web non sono affidabili nelle email). Larghezza 560px,
   leggibile da telefono.
   ============================================================= */
const INK = '#1B2A3A', OCRA = '#C9973B', CARTA = '#F7F5F0', GRIGIO = '#4A5868', LINEA = '#E2DDD1';
const FONT = "-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

function h(t) { return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function dataLunga(iso) {
  const p = iso.split('-');
  return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2], 12)).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Rome' });
}
function periodo(p) {
  if (/^mese/.test(p.pacchetto)) return 'dal ' + dataLunga(p.data_inizio) + ' al ' + dataLunga(p.data_fine);
  return dataLunga(p.data_inizio);
}
function waLink(cfg, testo) { return 'https://wa.me/' + cfg.contatti.whatsapp + '?text=' + encodeURIComponent(testo); }
function mappa(cfg) {
  return 'https://www.google.com/maps/dir/?api=1&destination=' +
    encodeURIComponent('Bagnarino, ' + cfg.azienda.indirizzo + ', ' + cfg.azienda.cap + ' ' + cfg.azienda.citta);
}

function bottone(href, testo, scuro) {
  const bg = scuro ? INK : OCRA, col = scuro ? '#FFFFFF' : INK;
  return '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 10px"><tr>' +
    '<td bgcolor="' + bg + '" style="border-radius:999px;mso-padding-alt:14px 26px">' +
    '<a href="' + h(href) + '" style="display:inline-block;padding:14px 26px;font:700 16px ' + FONT + ';color:' + col +
    ';text-decoration:none;border-radius:999px">' + h(testo) + '</a></td></tr></table>';
}
function righe(coppie) {
  return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ' + LINEA + '">' +
    coppie.filter(Boolean).map(c =>
      '<tr><td style="padding:11px 0;border-bottom:1px solid ' + LINEA + ';font:15px ' + FONT + ';color:' + GRIGIO + ';width:42%">' + h(c[0]) + '</td>' +
      '<td style="padding:11px 0;border-bottom:1px solid ' + LINEA + ';font:600 15px ' + FONT + ';color:' + INK + ';text-align:right">' + (c[2] ? c[1] : h(c[1])) + '</td></tr>'
    ).join('') + '</table>';
}

function layout({ titolo, anteprima, corpo, sito, cfg }) {
  return '<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>' + h(titolo) + '</title></head><body style="margin:0;padding:0;background:' + CARTA + '">' +
    '<div style="display:none;max-height:0;overflow:hidden;opacity:0">' + h(anteprima || '') + '</div>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="' + CARTA + '"><tr><td align="center" style="padding:24px 12px">' +
    '<table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:560px;background:#FFFFFF;border-radius:16px">' +
      '<tr><td bgcolor="' + INK + '" style="padding:22px 28px;border-radius:16px 16px 0 0">' +
        '<img src="' + h(sito) + '/img/logo-email.png" width="180" height="50" alt="Bagnarino Coworking" style="display:block;border:0;font:700 20px ' + FONT + ';color:#FFFFFF">' +
      '</td></tr>' +
      '<tr><td style="height:4px;line-height:4px;font-size:0" bgcolor="' + OCRA + '">&nbsp;</td></tr>' +
      '<tr><td style="padding:28px 28px 8px;font:16px/1.55 ' + FONT + ';color:' + INK + '">' + corpo + '</td></tr>' +
      '<tr><td style="padding:18px 28px 24px;font:13px/1.5 ' + FONT + ';color:' + GRIGIO + ';border-top:1px solid ' + LINEA + '">' +
        h(cfg.azienda.ragioneSociale) + ' · ' + h(cfg.azienda.indirizzo) + ', ' + h(cfg.azienda.cap) + ' ' + h(cfg.azienda.citta) +
        '<br>WhatsApp e telefono <a href="tel:' + h(cfg.contatti.cellulare) + '" style="color:' + INK + '">' + h(cfg.contatti.cellulareVisibile) + '</a> · ' +
        h(cfg.orari.testoBreve) +
      '</td></tr>' +
    '</table></td></tr></table></body></html>';
}

function titoloH(t) { return '<h1 style="margin:0 0 12px;font:800 26px/1.2 ' + FONT + ';color:' + INK + '">' + h(t) + '</h1>'; }
function paragrafo(t, html) { return '<p style="margin:0 0 16px;font:16px/1.55 ' + FONT + ';color:' + GRIGIO + '">' + (html ? t : h(t)) + '</p>'; }
function codiceBox(c) {
  return '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 20px"><tr>' +
    '<td style="border:2px dashed ' + OCRA + ';border-radius:12px;padding:12px 20px;font:13px ' + FONT + ';color:' + GRIGIO + ';letter-spacing:1px">' +
    'CODICE PRENOTAZIONE<br><span style="font:800 26px ' + FONT + ';color:' + INK + ';letter-spacing:3px">' + h(c) + '</span></td></tr></table>';
}

/* ---------- al cliente ---------- */
function confermaCliente(p, cfg, sito) {
  const gestisci = sito + '/prenotazione?codice=' + encodeURIComponent(p.codice) + '&email=' + encodeURIComponent(p.email);
  const extra = p.omaggio ? paragrafo('🎁 Questa giornata è in omaggio con la tua Bagnarino Card.')
    : p.carnet && p.pacchetto === 'giornata' ? paragrafo('Ingresso dal tuo carnet: ti restano <b>' + p.carnet.residui + '</b> ingressi.', true)
    : p.pacchetto === 'carnet' ? paragrafo('Il carnet è attivo: oltre a questa giornata ti restano <b>' + p.carnet.residui + '</b> ingressi da prenotare quando vuoi.', true)
    : '';
  const corpo = titoloH('Ti aspettiamo, ' + p.nome + '!') +
    paragrafo('La tua postazione è prenotata. Ecco il riepilogo: tienilo a portata di mano.') +
    codiceBox(p.codice) +
    righe([
      ['Formula', p.nomePacchetto],
      [/^mese/.test(p.pacchetto) ? 'Periodo' : 'Giorno', periodo(p)],
      ['Orario', cfg.orari.apertura + '–' + cfg.orari.chiusura],
      ['Da pagare in sede', p.prezzo === 0 ? 'Niente: già pagato' : p.prezzoTesto + ' (contanti o carta)'],
      ['Dove', cfg.azienda.indirizzo + ', ' + cfg.azienda.citta]
    ]) + '<div style="height:18px"></div>' + extra +
    bottone(mappa(cfg), 'Come arrivare', true) +
    bottone(waLink(cfg, 'Ciao, ho una domanda sulla mia prenotazione ' + p.codice + '.'), 'Scrivici su WhatsApp') +
    paragrafo('Nel file allegato trovi l’appuntamento da aggiungere al calendario.') +
    paragrafo('Cambio di programma? Puoi annullare gratis fino alle ' + h(p.scadenzaDisdetta.split(' ')[1]) + ' del giorno prima: <a href="' + h(gestisci) + '" style="color:' + INK + ';font-weight:600">gestisci la prenotazione</a>.', true);
  return {
    oggetto: 'Prenotazione confermata ' + p.codice + ' – ' + periodo(p),
    html: layout({ titolo: 'Prenotazione confermata', anteprima: p.nomePacchetto + ', ' + periodo(p) + '. Codice ' + p.codice, corpo, sito, cfg }),
    testo: 'Prenotazione confermata ' + p.codice + '\n' + p.nomePacchetto + ', ' + periodo(p) + '\nOrario ' + cfg.orari.apertura + '-' + cfg.orari.chiusura +
      '\nDa pagare in sede: ' + p.prezzoTesto + '\n' + cfg.azienda.indirizzo + ', ' + cfg.azienda.citta + '\nGestisci: ' + gestisci
  };
}

function promemoria(p, cfg, sito) {
  const gestisci = sito + '/prenotazione?codice=' + encodeURIComponent(p.codice) + '&email=' + encodeURIComponent(p.email);
  const corpo = titoloH('A domani, ' + p.nome + '!') +
    paragrafo('Ti ricordiamo la tua postazione al Bagnarino Coworking: domani dalle ' + cfg.orari.apertura + ' la scrivania è pronta.') +
    righe([['Codice', p.codice], ['Formula', p.nomePacchetto], ['Dove', cfg.azienda.indirizzo + ', ' + cfg.azienda.citta],
      ['Da pagare in sede', p.prezzo === 0 ? 'Niente' : p.prezzoTesto]]) + '<div style="height:18px"></div>' +
    bottone(mappa(cfg), 'Come arrivare', true) +
    paragrafo('Non riesci più a venire? <a href="' + h(gestisci) + '" style="color:' + INK + ';font-weight:600">Annulla qui</a> entro le ' +
      h(p.scadenzaDisdetta.split(' ')[1]) + ' di stasera: così il posto torna libero per qualcun altro.', true);
  return {
    oggetto: 'Domani ti aspettiamo – ' + p.codice,
    html: layout({ titolo: 'Promemoria', anteprima: 'Domani dalle ' + cfg.orari.apertura + ' in ' + cfg.azienda.indirizzo, corpo, sito, cfg })
  };
}

function annullataCliente(p, cfg, sito) {
  const corpo = titoloH('Prenotazione annullata') +
    paragrafo('Ciao ' + p.nome + ', abbiamo annullato la prenotazione ' + p.codice + ' (' + p.nomePacchetto + ', ' + periodo(p) + '). Non devi pagare nulla.') +
    bottone(sito + '/prenota', 'Prenota un altro giorno', true);
  return { oggetto: 'Prenotazione annullata ' + p.codice, html: layout({ titolo: 'Prenotazione annullata', corpo, sito, cfg }) };
}

/* ---------- alla titolare: brevi, leggibili dal telefono ---------- */
function titolareNuova(p, cfg, sito) {
  const tel = '<a href="tel:' + h(p.telefono.replace(/\s/g, '')) + '" style="color:' + INK + '">' + h(p.telefono) + '</a>';
  const corpo = titoloH('Nuova prenotazione') +
    righe([
      ['Chi', p.nome + ' ' + p.cognome],
      ['Quando', periodo(p)],
      ['Cosa', p.nomePacchetto + (p.omaggio ? ' (omaggio Card)' : p.carnet && p.pacchetto === 'giornata' ? ' (dal carnet)' : '')],
      ['Quanto', p.prezzo === 0 ? 'Già pagato' : p.prezzoTesto],
      ['Telefono', tel, true],
      ['Email', p.email],
      p.piva_cf ? ['Fattura a', p.piva_cf] : null,
      p.note ? ['Note', p.note] : null,
      p.origine && p.origine.utm_source ? ['Arriva da', p.origine.utm_source] : null,
      ['Codice', p.codice]
    ]) + '<div style="height:18px"></div>' +
    bottone('https://wa.me/' + p.telefono.replace(/\D/g, '').replace(/^(?!39)(3\d{8,9})$/, '39$1'), 'Scrivigli su WhatsApp', true) +
    bottone(sito + '/admin', 'Apri l’area riservata');
  return { oggetto: 'Nuova: ' + p.nome + ' ' + p.cognome + ' – ' + p.nomePacchetto + ', ' + periodo(p), html: layout({ titolo: 'Nuova prenotazione', corpo, sito, cfg }) };
}
function titolareAnnullata(p, cfg, sito) {
  const corpo = titoloH('Prenotazione annullata') +
    righe([['Chi', p.nome + ' ' + p.cognome], ['Quando', periodo(p)], ['Cosa', p.nomePacchetto], ['Codice', p.codice]]) +
    '<div style="height:18px"></div>' + paragrafo('Il posto è di nuovo libero sul sito.');
  return { oggetto: 'Annullata: ' + p.nome + ' ' + p.cognome + ' – ' + periodo(p), html: layout({ titolo: 'Annullata', corpo, sito, cfg }) };
}
function riepilogoSerale(lista, data, cfg, sito) {
  const corpo = titoloH('Domani, ' + dataLunga(data)) +
    (lista.length
      ? paragrafo('Arrivano ' + lista.length + (lista.length === 1 ? ' persona.' : ' persone.')) +
        righe(lista.map(p => [p.nome + ' ' + p.cognome, p.nomePacchetto + ' · <a href="tel:' + h(p.telefono.replace(/\s/g, '')) + '" style="color:' + INK + '">' + h(p.telefono) + '</a>', true]))
      : paragrafo('Per domani non ci sono prenotazioni.')) +
    '<div style="height:18px"></div>' + bottone(sito + '/admin', 'Apri l’area riservata', true);
  return { oggetto: 'Domani al coworking: ' + lista.length + (lista.length === 1 ? ' persona' : ' persone'), html: layout({ titolo: 'Riepilogo di domani', corpo, sito, cfg }) };
}

module.exports = { layout, confermaCliente, promemoria, annullataCliente, titolareNuova, titolareAnnullata, riepilogoSerale, dataLunga, periodo, bottone, righe, titoloH, paragrafo, h };
