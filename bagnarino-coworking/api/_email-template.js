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
const FONT = "'Hanken Grotesk',-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const MONO = "'IBM Plex Mono',Menlo,Consolas,monospace";
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
/* la fascia in parole: "mattina", "pomeriggio", "giornata intera" */
function fasciaTesto(p) { return p.fascia === 'mattina' ? 'mattina' : p.fascia === 'pomeriggio' ? 'pomeriggio' : 'giornata intera'; }
/* giorno e fascia insieme: "martedì 24 novembre, mattina" */
function quando(p) { return /^mese/.test(p.pacchetto) ? periodo(p) : dataLunga(p.data_inizio) + ', ' + fasciaTesto(p); }
/* link diretto al calendario per scegliere un altro momento */
function linkCalendario(p, sito) { return sito + '/prenota?pacchetto=' + encodeURIComponent(p.pacchetto || 'giornata') + '#giorno'; }
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
    '<td ' + (secondario ? '' : 'bgcolor="' + OCRA + '" ') + 'style="border-radius:4px;mso-padding-alt:14px 26px">' +
    '<a href="' + h(href) + '" target="_blank" style="display:block;padding:14px 26px;font:700 16px ' + FONT + ';' + stile +
    ';text-decoration:none;border-radius:4px">' + h(testo) + '</a></td></tr></table>';
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
    '@font-face{font-family:"Hanken Grotesk";src:url(' + h(sito) + '/fonts/hanken-grotesk-latin-wght-normal.woff2) format("woff2");font-weight:100 900}' +
    '@font-face{font-family:"IBM Plex Mono";src:url(' + h(sito) + '/fonts/ibm-plex-mono-latin-500-normal.woff2) format("woff2");font-weight:500}' +
    ':root{color-scheme:dark}a{color:' + OCRA_VIVO + '}</style></head>' +
    '<body style="margin:0;padding:0;background:' + NOTTE + '">' +
    '<div style="display:none;max-height:0;overflow:hidden;opacity:0">' + h(anteprima || '') + '</div>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="' + NOTTE + '" style="background:' + NOTTE + '"><tr><td align="center" style="padding:28px 12px 36px">' +
    '<table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:560px">' +
      /* logo chiaro, scontornato, sul blu notte */
      '<tr><td style="padding:0 4px 20px">' +
        '<img src="' + h(sito) + '/img/email-logo.png" width="170" height="48" alt="Bagnarino Coworking · dal 1983" style="display:block;border:0;width:170px;height:auto;font:600 20px ' + SERIF + ';color:' + TESTO + '">' +
      '</td></tr>' +
      '<tr><td bgcolor="' + CARD + '" style="background:' + CARD + ';border-radius:8px;border:1px solid ' + RIGA + ';overflow:hidden">' +
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">' +
        (foto ? '<tr><td style="padding:0;line-height:0;font-size:0"><img src="' + h(sito) + '/img/email-testata.jpg" width="560" alt="" style="display:block;width:100%;height:auto;border:0;border-radius:8px 8px 0 0"></td></tr>' : '') +
        '<tr><td style="height:3px;line-height:3px;font-size:0;background:' + OCRA + '" bgcolor="' + OCRA + '">&nbsp;</td></tr>' +
        '<tr><td style="padding:30px 30px 14px;font:16px/1.6 ' + FONT + ';color:' + TESTO + '">' + corpo + '</td></tr>' +
        '</table>' +
      '</td></tr>' +
      '<tr><td style="padding:22px 6px 0;font:13px/1.6 ' + FONT + ';color:' + MORBIDO + '">' +
        '<span style="font:italic 500 15px ' + SERIF + ';color:' + OCRA_VIVO + '">Un negozio vero, dal ' + h(cfg.azienda.dal) + '.</span><br>' +
        h(cfg.azienda.ragioneSociale) + ' · ' + h(cfg.azienda.indirizzo) + ', ' + h(cfg.azienda.cap) + ' ' + h(cfg.azienda.citta) +
        '<br>WhatsApp e telefono <a href="tel:' + h(cfg.contatti.cellulare) + '" style="color:' + TESTO + ';text-decoration:underline">' + h(cfg.contatti.cellulareVisibile) + '</a> · ' +
        h(cfg.apertura.testo) +
      '</td></tr>' +
    '</table></td></tr></table></body></html>';
}

/* indirizzo scritto per esteso: se un'app di posta blocca il pulsante, il link resta toccabile */
function linkScritto(url) {
  return '<p style="margin:4px 0 16px;font:13px/1.5 ' + FONT + ';color:' + MORBIDO + '">Oppure apri: <a href="' + h(url) + '" target="_blank" style="color:' + OCRA_VIVO + ';text-decoration:underline">' + h(url.replace(/^https?:\/\//, '')) + '</a></p>';
}
function titoloH(t) { return '<h1 style="margin:0 0 12px;font:500 30px/1.15 ' + SERIF + ';color:' + TESTO + ';letter-spacing:-0.3px">' + h(t) + '</h1>'; }
function paragrafo(t, html) { return '<p style="margin:0 0 16px;font:16px/1.6 ' + FONT + ';color:' + MORBIDO + '">' + (html ? t : h(t)) + '</p>'; }
function codiceBox(c, etichetta) {
  return '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 22px"><tr>' +
    '<td style="border:1px dashed ' + OCRA + ';border-radius:4px;padding:14px 22px;font:500 11px ' + MONO + ';color:' + MORBIDO + ';letter-spacing:2px">' +
    h(etichetta || 'CODICE PRENOTAZIONE') + '<br><span style="font:500 28px ' + MONO + ';color:' + OCRA_VIVO + ';letter-spacing:4px">' + h(c) + '</span></td></tr></table>';
}

/* ---------- al cliente ---------- */
function gestisciLink(p, sito) { return sito + '/prenotazione?codice=' + encodeURIComponent(p.codice) + '&email=' + encodeURIComponent(p.email); }
function riepilogo(p, cfg) {
  return righe([
    ['Formula', p.nomePacchetto],
    [/^mese/.test(p.pacchetto) ? 'Periodo' : p.pacchetto === 'carnet' ? 'Primo ingresso' : 'Giorno', periodo(p)],
    /^mese/.test(p.pacchetto) ? null : ['Fascia', p.nomeFascia || fasciaTesto(p)],
    ['Da pagare in sede', p.prezzo === 0 ? 'Niente: già pagato' : p.prezzoTesto + ' (contanti o carta)'],
    ['Dove', cfg.azienda.indirizzo + ', ' + cfg.azienda.cap + ' ' + cfg.azienda.citta]
  ]) + '<div style="height:18px"></div>';
}
function notaVantaggi(p) {
  return p.omaggio ? paragrafo('Questa giornata è in regalo con la tua Bagnarino Card.')
    : p.carnet && p.pacchetto === 'giornata' ? paragrafo('Ingresso dal tuo carnet: ti restano <b>' + p.carnet.residui + '</b> ingressi.', true)
    : p.carnet && p.pacchetto === 'carnet' ? paragrafo('Con il carnet, oltre a questa giornata, hai altri <b>' + p.carnet.residui + '</b> ingressi da richiedere quando vuoi.', true)
    : '';
}

/* subito dopo l'invio della richiesta: ricevuta, non ancora confermata */
function richiestaRicevuta(p, cfg, sito) {
  const gestisci = gestisciLink(p, sito);
  const corpo = titoloH('Richiesta ricevuta, ' + p.nome) +
    paragrafo('Abbiamo ricevuto la tua richiesta, ti confermiamo a breve. Il posto sarà tuo appena ricevi la conferma.') +
    codiceBox(p.codice, 'CODICE RICHIESTA') +
    riepilogo(p, cfg) + notaVantaggi(p) +
    bottone(waLink(cfg, 'Ciao, ho una domanda sulla mia richiesta ' + p.codice + '.'), 'Scrivici su WhatsApp', true) +
    paragrafo('Cambio di programma? Puoi ritirare la richiesta in qualsiasi momento: <a href="' + h(gestisci) + '" style="color:' + INK + ';font-weight:600">gestisci la richiesta</a>.', true);
  return {
    oggetto: 'Richiesta ricevuta ' + p.codice + ' – ' + quando(p),
    html: layout({ foto: true, titolo: 'Richiesta ricevuta', anteprima: 'Ti confermiamo a breve. ' + p.nomePacchetto + ', ' + quando(p), corpo, sito, cfg }),
    testo: 'Abbiamo ricevuto la tua richiesta, ti confermiamo a breve.\nCodice ' + p.codice + '\n' + p.nomePacchetto + ', ' + quando(p) +
      '\nDa pagare in sede: ' + p.prezzoTesto + '\n' + cfg.azienda.indirizzo + ', ' + cfg.azienda.citta + '\nGestisci: ' + gestisci
  };
}

/* la titolare ha confermato: adesso il posto è del cliente */
function prenotazioneConfermata(p, cfg, sito) {
  const gestisci = gestisciLink(p, sito);
  const frase = 'Prenotazione confermata, ti aspettiamo ' + quando(p) + '.';
  const corpo = titoloH('Prenotazione confermata') +
    paragrafo(frase) +
    codiceBox(p.codice) +
    riepilogo(p, cfg) + notaVantaggi(p) +
    paragrafo('<b style="color:' + TESTO + '">Come arrivare.</b> Siamo in ' + h(cfg.azienda.indirizzo) + ', nel centro di ' + h(cfg.azienda.citta) +
      ': si entra dalla porta del negozio Bagnarino. A piedi o in bicicletta sei a pochi passi; in auto trovi parcheggi a pagamento lungo il corso.', true) +
    bottone(mappa(cfg), 'Come arrivare') +
    bottone(waLink(cfg, 'Ciao, ho una domanda sulla mia prenotazione ' + p.codice + '.'), 'Scrivici su WhatsApp', true) +
    paragrafo('Nel file allegato trovi l’appuntamento da aggiungere al calendario.') +
    paragrafo('Cambio di programma? Puoi annullare gratis fino alle ' + h(p.scadenzaDisdetta.split(' ')[1]) + ' del giorno prima: <a href="' + h(gestisci) + '" style="color:' + INK + ';font-weight:600">gestisci la prenotazione</a>.', true);
  return {
    oggetto: 'Prenotazione confermata ' + p.codice + ' – ' + quando(p),
    html: layout({ foto: true, titolo: 'Prenotazione confermata', anteprima: 'Ti aspettiamo ' + quando(p) + '. Codice ' + p.codice, corpo, sito, cfg }),
    testo: frase + '\nCodice ' + p.codice + '\n' + p.nomePacchetto + '\nDa pagare in sede: ' + p.prezzoTesto + '\n' +
      cfg.azienda.indirizzo + ', ' + cfg.azienda.cap + ' ' + cfg.azienda.citta + '\nCome arrivare: ' + mappa(cfg) + '\nGestisci: ' + gestisci
  };
}

/* la titolare ha risposto "non disponibile" a una richiesta */
function nonDisponibile(p, cfg, sito) {
  const cal = linkCalendario(p, sito);
  const corpo = titoloH('Scegliamo un altro momento, ' + p.nome) +
    paragrafo('Purtroppo in quella fascia lo spazio non è disponibile. Scegli un altro momento, ti confermiamo subito:') +
    bottone(cal, 'Scegli un altro momento') + linkScritto(cal) +
    righe([['La tua richiesta', quando(p)], ['Codice', p.codice]]) + '<div style="height:18px"></div>' +
    paragrafo('Non hai pagato nulla. Se preferisci sentirci, <a href="' + h(waLink(cfg, 'Ciao, vorrei trovare un altro momento per la mia richiesta ' + p.codice + '.')) + '" style="color:' + INK + ';font-weight:600">scrivici su WhatsApp</a>.', true);
  return {
    oggetto: 'La tua richiesta per ' + dataLunga(p.data_inizio) + ': scegli un altro momento',
    html: layout({ titolo: 'Scegli un altro momento', anteprima: 'Scegli un altro momento, ti confermiamo subito', corpo, sito, cfg }),
    testo: 'Purtroppo in quella fascia lo spazio non è disponibile. Scegli un altro momento, ti confermiamo subito: ' + cal
  };
}

/* la titolare ha annullato una prenotazione già confermata */
function annullataConScuse(p, cfg, sito) {
  const cal = linkCalendario(p, sito);
  const corpo = titoloH('Ci scusiamo, ' + p.nome) +
    paragrafo('Ci dispiace molto: non riusciamo ad accoglierti ' + quando(p) + ' e abbiamo dovuto annullare la tua prenotazione ' + p.codice + '. Non devi pagare nulla.') +
    paragrafo('Scegli un altro momento: ti confermiamo subito e trovi tutto pronto al tuo arrivo.') +
    bottone(cal, 'Scegli un altro momento') + linkScritto(cal) +
    bottone(waLink(cfg, 'Ciao, vorrei trovare un altro momento al posto della prenotazione ' + p.codice + '.'), 'Scrivici su WhatsApp', true);
  return {
    oggetto: 'Ci scusiamo: la prenotazione ' + p.codice + ' è stata annullata',
    html: layout({ titolo: 'Ci scusiamo', anteprima: 'Scegli un altro momento, ti confermiamo subito', corpo, sito, cfg }),
    testo: 'Ci dispiace molto: non riusciamo ad accoglierti ' + quando(p) + ' e abbiamo dovuto annullare la tua prenotazione ' + p.codice +
      '. Non devi pagare nulla. Scegli un altro momento: ' + cal
  };
}

function promemoria(p, cfg, sito) {
  const gestisci = gestisciLink(p, sito);
  const corpo = titoloH('A domani, ' + p.nome + '!') +
    paragrafo('Ti ricordiamo la tua prenotazione al Bagnarino Coworking: ti aspettiamo domani' + (/^mese/.test(p.pacchetto) ? '' : ', ' + fasciaTesto(p)) + '. La tua postazione è pronta.') +
    righe([['Codice', p.codice], ['Formula', p.nomePacchetto], /^mese/.test(p.pacchetto) ? null : ['Fascia', p.nomeFascia || fasciaTesto(p)],
      ['Dove', cfg.azienda.indirizzo + ', ' + cfg.azienda.citta],
      ['Da pagare in sede', p.prezzo === 0 ? 'Niente' : p.prezzoTesto]]) + '<div style="height:18px"></div>' +
    bottone(mappa(cfg), 'Come arrivare') +
    paragrafo('Non riesci più a venire? <a href="' + h(gestisci) + '" style="color:' + INK + ';font-weight:600">Annulla qui</a> entro le ' +
      h(p.scadenzaDisdetta.split(' ')[1]) + ' di stasera: così il posto torna libero per qualcun altro.', true);
  return {
    oggetto: 'Domani ti aspettiamo – ' + p.codice,
    html: layout({ foto: true, titolo: 'Promemoria', anteprima: 'Domani in ' + cfg.azienda.indirizzo + ', ' + cfg.azienda.citta, corpo, sito, cfg })
  };
}

/* il cliente ha annullato (o ritirato la richiesta) da solo */
function annullataCliente(p, cfg, sito) {
  const corpo = titoloH(p.eraInAttesa ? 'Richiesta ritirata' : 'Prenotazione annullata') +
    paragrafo('Ciao ' + p.nome + ', abbiamo annullato la ' + (p.eraInAttesa ? 'richiesta ' : 'prenotazione ') + p.codice + ' (' + p.nomePacchetto + ', ' + quando(p) + '). Non devi pagare nulla.') +
    bottone(sito + '/prenota', 'Richiedi il tuo posto');
  return { oggetto: (p.eraInAttesa ? 'Richiesta ritirata ' : 'Prenotazione annullata ') + p.codice, html: layout({ titolo: 'Prenotazione annullata', corpo, sito, cfg }) };
}

/* ---------- alla titolare ----------
   Email semplicissima: fondo bianco, testo grande, riepilogo e due
   pulsanti grandi. Nient'altro. */
const S_FONT = "-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const S_TESTO = '#111922', S_VERDE = '#1E7A46', S_GRIGIO = '#E3E5E8', S_RIGA = '#C9CED6';

function layoutSemplice({ titolo, anteprima, corpo }) {
  return '<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light only">' +
    '<title>' + h(titolo) + '</title></head>' +
    '<body style="margin:0;padding:0;background:#FFFFFF">' +
    '<div style="display:none;max-height:0;overflow:hidden;opacity:0">' + h(anteprima || '') + '</div>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#FFFFFF" style="background:#FFFFFF"><tr><td align="center" style="padding:28px 16px 40px">' +
    '<table role="presentation" width="520" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:520px"><tr>' +
    '<td style="font:20px/1.5 ' + S_FONT + ';color:' + S_TESTO + '">' + corpo + '</td></tr></table>' +
    '</td></tr></table></body></html>';
}
function sTitolo(t) { return '<h1 style="margin:0 0 20px;font:700 30px/1.2 ' + S_FONT + ';color:' + S_TESTO + '">' + h(t) + '</h1>'; }
function sTesto(t) { return '<p style="margin:0 0 20px;font:20px/1.5 ' + S_FONT + ';color:' + S_TESTO + '">' + h(t) + '</p>'; }
function sRighe(coppie) {
  return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;border-top:2px solid ' + S_RIGA + '">' +
    coppie.filter(Boolean).map(c =>
      '<tr><td style="padding:14px 0;border-bottom:2px solid ' + S_RIGA + ';font:20px/1.4 ' + S_FONT + ';color:' + S_TESTO + '">' +
      '<span style="display:block;font:700 15px/1.3 ' + S_FONT + ';color:' + S_TESTO + ';letter-spacing:.5px;text-transform:uppercase">' + h(c[0]) + '</span>' +
      '<span style="display:block;font:600 22px/1.35 ' + S_FONT + ';color:' + S_TESTO + '">' + (c[2] ? c[1] : h(c[1])) + '</span></td></tr>'
    ).join('') + '</table>';
}
/* pulsante grande a tutta larghezza: verde = conferma, grigio = non disponibile */
function sBottone(href, testo, verde) {
  const sfondo = verde ? S_VERDE : S_GRIGIO, colore = verde ? '#FFFFFF' : S_TESTO, bordo = verde ? S_VERDE : '#5B6470';
  return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px"><tr>' +
    '<td align="center" bgcolor="' + sfondo + '" style="background:' + sfondo + ';border:2px solid ' + bordo + ';border-radius:10px">' +
    '<a href="' + h(href) + '" target="_blank" style="display:block;padding:22px 16px;font:700 24px/1.2 ' + S_FONT + ';color:' + colore +
    ';text-decoration:none;border-radius:10px">' + h(testo) + '</a></td></tr></table>';
}
function sRiepilogoRichiesta(p) {
  const tel = '<a href="tel:' + h(String(p.telefono || '').replace(/\s/g, '')) + '" style="color:' + S_TESTO + '">' + h(p.telefono) + '</a>';
  return sRighe([
    ['Chi', p.nome + ' ' + p.cognome],
    ['Quando', quando(p)],
    ['Cosa', p.nomePacchetto + ' · ' + (p.prezzo === 0 ? 'già pagato' : p.prezzoTesto + ' da pagare in sede')],
    ['Telefono', tel, true],
    p.note ? ['Nota', p.note] : null
  ]);
}
/* link.conferma e link.no: indirizzi firmati; se mancano resta un solo pulsante per aprire l'app */
function sPulsantiRisposta(link, sito, p) {
  return link && link.conferma && link.no
    ? sBottone(link.conferma, 'Conferma', true) + sBottone(link.no, 'Non disponibile', false)
    : sBottone(sito + '/gestione?richiesta=' + p.id, 'Apri la richiesta', true);
}

function titolareNuova(p, cfg, sito, link) {
  const corpo = sTitolo('Nuova richiesta') + sRiepilogoRichiesta(p) + sPulsantiRisposta(link, sito, p);
  return {
    oggetto: 'Nuova richiesta: ' + p.nome + ' ' + p.cognome + ', ' + quando(p),
    html: layoutSemplice({ titolo: 'Nuova richiesta', anteprima: p.nome + ' ' + p.cognome + ', ' + quando(p), corpo })
  };
}
/* la richiesta è in attesa da più di due ore */
function titolareSollecito(p, cfg, sito, link) {
  const corpo = sTitolo('Una richiesta aspetta la tua risposta') + sRiepilogoRichiesta(p) + sPulsantiRisposta(link, sito, p);
  return {
    oggetto: 'Aspetta la tua risposta: ' + p.nome + ' ' + p.cognome + ', ' + quando(p),
    html: layoutSemplice({ titolo: 'Richiesta in attesa', anteprima: p.nome + ' ' + p.cognome + ', ' + quando(p), corpo })
  };
}
function titolareAnnullata(p, cfg, sito) {
  const corpo = sTitolo(p.eraInAttesa ? 'Richiesta ritirata dal cliente' : 'Prenotazione annullata dal cliente') +
    sRighe([['Chi', p.nome + ' ' + p.cognome], ['Quando', quando(p)], ['Cosa', p.nomePacchetto]]) +
    sTesto('Il posto è di nuovo libero sul sito. Non devi fare niente.');
  return {
    oggetto: 'Annullata dal cliente: ' + p.nome + ' ' + p.cognome + ', ' + quando(p),
    html: layoutSemplice({ titolo: 'Annullata dal cliente', anteprima: p.nome + ' ' + p.cognome + ', ' + quando(p), corpo })
  };
}
function riepilogoSerale(lista, data, cfg, sito) {
  const corpo = sTitolo('Domani, ' + dataLunga(data)) +
    (lista.length
      ? sTesto(lista.length === 1 ? 'Arriva una persona.' : 'Arrivano ' + lista.length + ' persone.') +
        sRighe(lista.map(p => [p.nome + ' ' + p.cognome, h(/^mese/.test(p.pacchetto) ? p.nomePacchetto : (p.nomeFascia || fasciaTesto(p))) +
          ' · <a href="tel:' + h(p.telefono.replace(/\s/g, '')) + '" style="color:' + S_TESTO + '">' + h(p.telefono) + '</a>', true]))
      : sTesto('Per domani non ci sono prenotazioni.')) +
    sBottone(sito + '/gestione', 'Apri l’app', true);
  return {
    oggetto: 'Domani al coworking: ' + lista.length + (lista.length === 1 ? ' persona' : ' persone'),
    html: layoutSemplice({ titolo: 'Riepilogo di domani', anteprima: lista.length + (lista.length === 1 ? ' persona' : ' persone') + ' domani', corpo })
  };
}
/* recupero della password dell'app di gestione */
function recuperoPassword(link) {
  const corpo = sTitolo('Scegli una nuova password') +
    sTesto('Tocca il pulsante qui sotto e scrivi la nuova password per l’app del Bagnarino.') +
    sBottone(link, 'Scegli una nuova password', true) +
    sTesto('Il pulsante vale per un’ora. Se non l’hai chiesto tu, non fare niente: la password resta quella di prima.');
  return { oggetto: 'Bagnarino: scegli una nuova password', html: layoutSemplice({ titolo: 'Nuova password', anteprima: 'Il pulsante vale per un’ora', corpo }) };
}


/* ---------- per far tornare i clienti ---------- */
function prossimoPremio(cfg, timbri) {
  const premi = (cfg.fidelity && cfg.fidelity.premi) || [];
  return premi.filter(z => z.timbri > timbri).sort((a, b) => a.timbri - b.timbri)[0] || null;
}
function riquadroCard(cfg, timbri) {
  const tot = (cfg.fidelity && cfg.fidelity.timbri) || 10, pr = prossimoPremio(cfg, timbri);
  return righe([['Bagnarino Card', timbri + ' timbri su ' + tot]].concat(pr ? [['Prossimo premio', pr.titolo + ' (al ' + pr.timbri + '° timbro)']] : [])) + '<div style="height:18px"></div>';
}
function piccolo(t) { return '<p style="margin:18px 0 0;font:13px/1.6 ' + FONT + ';color:' + MORBIDO + '">' + t + '</p>'; }

/* la sera della prima visita: grazie e benvenuto nella Card */
function grazieVisita(c, cfg, sito) {
  const corpo = titoloH('Grazie per oggi, ' + c.nome + '!') +
    paragrafo('Speriamo che la giornata al Bagnarino Coworking sia andata bene. Con questa visita hai il tuo primo timbro sulla Bagnarino Card: ogni giornata vale un timbro, e lungo la strada sblocchi dei premi.') +
    riquadroCard(cfg, c.timbri) +
    bottone(sito + '/prenota?pacchetto=giornata', 'Richiedi il tuo posto') +
    bottone(sito + '/card?email=' + encodeURIComponent(c.email) + (c.codice ? '&codice=' + encodeURIComponent(c.codice) : ''), 'Guarda la tua Card', true) +
    paragrafo('Hai suggerimenti su come migliorare lo spazio? Rispondi a questa email: la leggiamo davvero.');
  return { oggetto: 'Grazie per oggi, ' + c.nome + ' – il tuo primo timbro', html: layout({ titolo: 'Grazie per oggi', anteprima: 'Il tuo primo timbro sulla Bagnarino Card', corpo, sito, cfg }) };
}

/* dopo tre settimane senza venire (solo con consenso alle email promozionali) */
function ciManchi(c, cfg, sito, disiscrivi) {
  const pr = prossimoPremio(cfg, c.timbri);
  const corpo = titoloH('Ci manchi, ' + c.nome + '!') +
    paragrafo('È da un po’ che non passi in corso Lamarmora. Siamo aperti tutti i giorni su prenotazione: scegli giorno e fascia, ti confermiamo a breve e paghi quando arrivi.') +
    (pr ? paragrafo('Sulla tua Bagnarino Card hai <b>' + c.timbri + ' timbri</b>: ancora ' + (pr.timbri - c.timbri) + ' e sblocchi <b>' + h(pr.titolo.toLowerCase()) + '</b>.', true) : '') +
    bottone(sito + '/prenota?pacchetto=giornata', 'Richiedi il tuo posto') +
    bottone(waLink(cfg, 'Ciao, vorrei tornare al coworking. Quali giorni avete liberi?'), 'Scrivici su WhatsApp', true) +
    piccolo('Ricevi questa email perché hai accettato di ricevere novità dal coworking. <a href="' + h(disiscrivi) + '" style="color:' + MORBIDO + '">Non voglio più ricevere queste email</a>.');
  return { oggetto: c.nome + ', la tua scrivania ti aspetta', html: layout({ foto: true, titolo: 'Ci manchi', anteprima: 'Aperto tutti i giorni su prenotazione', corpo, sito, cfg }) };
}

/* carnet con ingressi da usare, in scadenza */
function carnetInScadenza(k, cfg, sito) {
  const corpo = titoloH('Il tuo carnet sta per scadere') +
    paragrafo('Ciao ' + k.nome + ', ti restano <b>' + k.residui + (k.residui === 1 ? ' ingresso' : ' ingressi') + '</b> sul carnet, valido fino a ' + h(dataLunga(k.scadenza)) + '. Prenotali prima che scadano: sono già pagati.', true) +
    bottone(sito + '/prenota?pacchetto=giornata', 'Richiedi il tuo posto') +
    paragrafo('Prenotando con la stessa email l’ingresso si scala dal carnet da solo.');
  return { oggetto: 'Ti restano ' + k.residui + ' ingressi sul carnet', html: layout({ titolo: 'Carnet in scadenza', anteprima: 'Valido fino a ' + dataLunga(k.scadenza), corpo, sito, cfg }) };
}

/* abbonamento mensile che finisce tra pochi giorni */
function rinnovoMese(p, cfg, sito) {
  const corpo = titoloH('Il tuo mese finisce ' + dataLunga(p.data_fine)) +
    paragrafo('Ciao ' + p.nome + ', il tuo abbonamento ' + p.nomePacchetto.toLowerCase() + ' finisce ' + dataLunga(p.data_fine) + '. Se vuoi continuare, puoi rinnovarlo adesso: tieni il posto senza interruzioni.') +
    bottone(sito + '/prenota?pacchetto=' + encodeURIComponent(p.pacchetto) + '&data=' + encodeURIComponent(p.rinnovoDa), 'Rinnova il mese') +
    bottone(waLink(cfg, 'Ciao, vorrei rinnovare il mio abbonamento al coworking.'), 'Scrivici su WhatsApp', true) +
    paragrafo('Paghi in sede come sempre, contanti o carta.');
  return { oggetto: 'Il tuo mese al coworking finisce ' + dataLunga(p.data_fine), html: layout({ titolo: 'Rinnovo', anteprima: 'Rinnova e tieni il posto senza interruzioni', corpo, sito, cfg }) };
}

module.exports = {
  grazieVisita, ciManchi, carnetInScadenza, rinnovoMese, layout, layoutSemplice,
  richiestaRicevuta, prenotazioneConfermata, nonDisponibile, annullataConScuse, promemoria, annullataCliente,
  titolareNuova, titolareSollecito, titolareAnnullata, riepilogoSerale, recuperoPassword,
  dataLunga, periodo, quando, fasciaTesto, linkCalendario, bottone, righe, titoloH, paragrafo, h
};
