/* =============================================================
   BAGNARINO COWORKING — modelli delle email
   Layout a tabelle con stili in linea: è l'unico modo per avere
   la stessa resa su Gmail, Apple Mail e Outlook. Font di sistema
   (i font web non sono affidabili nelle email). Larghezza 560px,
   leggibile da telefono.
   ============================================================= */
/* Tema del sito: blu notte, ocra caldo, carta. Le email sono scure di
   proposito: Gmail e Outlook in "modalità scura" invertono le email chiare
   (testate azzurre, testi sbiaditi); quelle già scure restano come le abbiamo disegnate. */
const NOTTE = '#141C26', CARD = '#1C2633', RIGA = '#2C3A4B', OCRA = '#B98A45', OCRA_VIVO = '#CFA160',
  TESTO = '#F3EEE6', MORBIDO = '#AEB7C2', INK = '#F3EEE6', CARTA = NOTTE, GRIGIO = MORBIDO, LINEA = RIGA;
const FONT = "'Plus Jakarta Sans',-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const SERIF = "Fraunces,'Iowan Old Style',Georgia,'Times New Roman',serif";

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

/* pulsante: "scuro" = secondario a contorno chiaro, altrimenti pieno ocra */
function bottone(href, testo, secondario) {
  const stile = secondario
    ? 'background:transparent;border:1.5px solid #55657A;color:' + TESTO
    : 'background:' + OCRA + ';border:1.5px solid ' + OCRA + ';color:' + NOTTE;
  return '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 10px"><tr>' +
    '<td ' + (secondario ? '' : 'bgcolor="' + OCRA + '" ') + 'style="border-radius:10px;mso-padding-alt:14px 26px">' +
    '<a href="' + h(href) + '" target="_blank" style="display:block;padding:14px 26px;font:700 16px ' + FONT + ';' + stile +
    ';text-decoration:none;border-radius:10px">' + h(testo) + '</a></td></tr></table>';
}
function righe(coppie) {
  return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ' + RIGA + '">' +
    coppie.filter(Boolean).map(c =>
      '<tr><td style="padding:13px 0;border-bottom:1px solid ' + RIGA + ';font:15px ' + FONT + ';color:' + MORBIDO + ';width:40%;vertical-align:top">' + h(c[0]) + '</td>' +
      '<td style="padding:13px 0;border-bottom:1px solid ' + RIGA + ';font:600 15px ' + FONT + ';color:' + TESTO + ';text-align:right">' + (c[2] ? c[1] : h(c[1])) + '</td></tr>'
    ).join('') + '</table>';
}

function layout({ titolo, anteprima, corpo, sito, cfg, foto }) {
  return '<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark">' +
    '<title>' + h(titolo) + '</title>' +
    /* Apple Mail e iOS usano i caratteri del sito; gli altri ripiegano su Georgia e sul carattere di sistema */
    '<style>@font-face{font-family:Fraunces;src:url(' + h(sito) + '/fonts/fraunces-latin-standard-normal.woff2) format("woff2");font-weight:100 900}' +
    '@font-face{font-family:Fraunces;src:url(' + h(sito) + '/fonts/fraunces-latin-standard-italic.woff2) format("woff2");font-weight:100 900;font-style:italic}' +
    '@font-face{font-family:"Plus Jakarta Sans";src:url(' + h(sito) + '/fonts/plus-jakarta-sans-latin-wght-normal.woff2) format("woff2");font-weight:200 800}' +
    ':root{color-scheme:dark}a{color:' + OCRA_VIVO + '}</style></head>' +
    '<body style="margin:0;padding:0;background:' + NOTTE + '">' +
    '<div style="display:none;max-height:0;overflow:hidden;opacity:0">' + h(anteprima || '') + '</div>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="' + NOTTE + '" style="background:' + NOTTE + '"><tr><td align="center" style="padding:28px 12px 36px">' +
    '<table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:560px">' +
      /* logo chiaro, scontornato, sul blu notte */
      '<tr><td style="padding:0 4px 20px">' +
        '<img src="' + h(sito) + '/img/email-logo.png" width="170" height="48" alt="Bagnarino Coworking · dal 1983" style="display:block;border:0;width:170px;height:auto;font:600 20px ' + SERIF + ';color:' + TESTO + '">' +
      '</td></tr>' +
      '<tr><td bgcolor="' + CARD + '" style="background:' + CARD + ';border-radius:18px;border:1px solid ' + RIGA + ';overflow:hidden">' +
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">' +
        (foto ? '<tr><td style="padding:0;line-height:0;font-size:0"><img src="' + h(sito) + '/img/email-testata.jpg" width="560" alt="" style="display:block;width:100%;height:auto;border:0;border-radius:18px 18px 0 0"></td></tr>' : '') +
        '<tr><td style="height:3px;line-height:3px;font-size:0;background:' + OCRA + '" bgcolor="' + OCRA + '">&nbsp;</td></tr>' +
        '<tr><td style="padding:30px 30px 14px;font:16px/1.6 ' + FONT + ';color:' + TESTO + '">' + corpo + '</td></tr>' +
        '</table>' +
      '</td></tr>' +
      '<tr><td style="padding:22px 6px 0;font:13px/1.6 ' + FONT + ';color:' + MORBIDO + '">' +
        '<span style="font:italic 500 15px ' + SERIF + ';color:' + OCRA_VIVO + '">Un negozio vero, dal ' + h(cfg.azienda.dal) + '.</span><br>' +
        h(cfg.azienda.ragioneSociale) + ' · ' + h(cfg.azienda.indirizzo) + ', ' + h(cfg.azienda.cap) + ' ' + h(cfg.azienda.citta) +
        '<br>WhatsApp e telefono <a href="tel:' + h(cfg.contatti.cellulare) + '" style="color:' + TESTO + ';text-decoration:underline">' + h(cfg.contatti.cellulareVisibile) + '</a> · ' +
        h(cfg.orari.testoBreve) +
      '</td></tr>' +
    '</table></td></tr></table></body></html>';
}

/* indirizzo scritto per esteso: se un'app di posta blocca il pulsante, il link resta toccabile */
function linkScritto(url) {
  return '<p style="margin:4px 0 16px;font:13px/1.5 ' + FONT + ';color:' + MORBIDO + '">Oppure apri: <a href="' + h(url) + '" target="_blank" style="color:' + OCRA_VIVO + ';text-decoration:underline">' + h(url.replace(/^https?:\/\//, '')) + '</a></p>';
}
function titoloH(t) { return '<h1 style="margin:0 0 12px;font:500 30px/1.15 ' + SERIF + ';color:' + TESTO + ';letter-spacing:-0.3px">' + h(t) + '</h1>'; }
function paragrafo(t, html) { return '<p style="margin:0 0 16px;font:16px/1.6 ' + FONT + ';color:' + MORBIDO + '">' + (html ? t : h(t)) + '</p>'; }
function codiceBox(c) {
  return '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 22px"><tr>' +
    '<td style="border:1.5px dashed ' + OCRA + ';border-radius:12px;padding:14px 22px;font:700 11px ' + FONT + ';color:' + MORBIDO + ';letter-spacing:2px">' +
    'CODICE PRENOTAZIONE<br><span style="font:500 30px ' + SERIF + ';color:' + OCRA_VIVO + ';letter-spacing:4px">' + h(c) + '</span></td></tr></table>';
}

/* ---------- al cliente ---------- */
function confermaCliente(p, cfg, sito) {
  const gestisci = sito + '/prenotazione?codice=' + encodeURIComponent(p.codice) + '&email=' + encodeURIComponent(p.email);
  const extra = p.omaggio ? paragrafo('🎁 Questa giornata è in regalo con la tua Bagnarino Card.')
    : p.carnet && p.pacchetto === 'giornata' ? paragrafo('Ingresso dal tuo pacchetto: ti restano <b>' + p.carnet.residui + '</b> ingressi.', true)
    : p.pacchetto === 'carnet' ? paragrafo('Il pacchetto è attivo: oltre a questa giornata ti restano <b>' + p.carnet.residui + '</b> ingressi da prenotare quando vuoi.', true)
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
    bottone(mappa(cfg), 'Come arrivare') +
    bottone(waLink(cfg, 'Ciao, ho una domanda sulla mia prenotazione ' + p.codice + '.'), 'Scrivici su WhatsApp', true) +
    paragrafo('Nel file allegato trovi l’appuntamento da aggiungere al calendario.') +
    paragrafo('Cambio di programma? Puoi annullare gratis fino alle ' + h(p.scadenzaDisdetta.split(' ')[1]) + ' del giorno prima: <a href="' + h(gestisci) + '" style="color:' + INK + ';font-weight:600">gestisci la prenotazione</a>.', true);
  return {
    oggetto: 'Prenotazione confermata ' + p.codice + ' – ' + periodo(p),
    html: layout({ foto: true, titolo: 'Prenotazione confermata', anteprima: p.nomePacchetto + ', ' + periodo(p) + '. Codice ' + p.codice, corpo, sito, cfg }),
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
    bottone(mappa(cfg), 'Come arrivare') +
    paragrafo('Non riesci più a venire? <a href="' + h(gestisci) + '" style="color:' + INK + ';font-weight:600">Annulla qui</a> entro le ' +
      h(p.scadenzaDisdetta.split(' ')[1]) + ' di stasera: così il posto torna libero per qualcun altro.', true);
  return {
    oggetto: 'Domani ti aspettiamo – ' + p.codice,
    html: layout({ foto: true, titolo: 'Promemoria', anteprima: 'Domani dalle ' + cfg.orari.apertura + ' in ' + cfg.azienda.indirizzo, corpo, sito, cfg })
  };
}

function annullataCliente(p, cfg, sito) {
  const corpo = titoloH('Prenotazione annullata') +
    paragrafo('Ciao ' + p.nome + ', abbiamo annullato la prenotazione ' + p.codice + ' (' + p.nomePacchetto + ', ' + periodo(p) + '). Non devi pagare nulla.') +
    bottone(sito + '/prenota', 'Prenota un altro giorno');
  return { oggetto: 'Prenotazione annullata ' + p.codice, html: layout({ titolo: 'Prenotazione annullata', corpo, sito, cfg }) };
}

/* ---------- alla titolare: brevi, leggibili dal telefono ---------- */
function titolareNuova(p, cfg, sito) {
  const tel = '<a href="tel:' + h(p.telefono.replace(/\s/g, '')) + '" style="color:' + INK + '">' + h(p.telefono) + '</a>';
  const corpo = titoloH('Nuova prenotazione da accettare') +
    paragrafo('Il cliente ha già ricevuto la conferma. Apri la richiesta e tocca <strong>Accetta</strong>; se non va bene, <strong>Rifiuta</strong> e gli arriva un’email di annullamento.', true) +
    righe([
      ['Chi', p.nome + ' ' + p.cognome],
      ['Quando', periodo(p)],
      ['Cosa', p.nomePacchetto + (p.omaggio ? ' (in regalo con la Card)' : p.carnet && p.pacchetto === 'giornata' ? ' (dal pacchetto)' : '')],
      ['Quanto', p.prezzo === 0 ? 'Già pagato' : p.prezzoTesto],
      ['Telefono', tel, true],
      ['Email', p.email],
      p.piva_cf ? ['Fattura a', p.piva_cf] : null,
      p.note ? ['Note', p.note] : null,
      p.origine && p.origine.utm_source ? ['Arriva da', p.origine.utm_source] : null,
      ['Codice', p.codice]
    ]) + '<div style="height:18px"></div>' +
    bottone('https://wa.me/' + p.telefono.replace(/\D/g, '').replace(/^(?!39)(3\d{8,9})$/, '39$1'), 'Scrivigli su WhatsApp') +
    bottone(sito + '/admin' + (p.id ? '?pren=' + p.id : '') + '#oggi', 'Apri e accetta la richiesta', true) +
    linkScritto(sito + '/admin');
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
    '<div style="height:18px"></div>' + bottone(sito + '/admin', 'Apri l’area riservata');
  return { oggetto: 'Domani al coworking: ' + lista.length + (lista.length === 1 ? ' persona' : ' persone'), html: layout({ titolo: 'Riepilogo di domani', corpo, sito, cfg }) };
}

module.exports = { layout, confermaCliente, promemoria, annullataCliente, titolareNuova, titolareAnnullata, riepilogoSerale, dataLunga, periodo, bottone, righe, titoloH, paragrafo, h };
