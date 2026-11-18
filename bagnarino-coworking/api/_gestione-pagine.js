/* =============================================================
   BAGNARINO COWORKING — le pagine dell'app di gestione
   Stanno qui, e non tra i file pubblici del sito, perché le serve
   la funzione api/gestione.js dopo aver controllato la sessione:
   senza accesso l'app non viene consegnata al browser.
   Stili e script (senza dati) sono file normali: /gestione-app.css
   e /gestione-app.js. La versione ?v= la aggiorna strumenti/versiona.py.
   Regole dell'app: testo da 18px in su, pulsanti alti almeno 56px,
   una cosa importante per schermata, parole semplici.
   ============================================================= */
function h(t) { return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

function testa(titolo) {
  return '<!doctype html>\n<html lang="it">\n<head>\n' +
    '<meta charset="utf-8">\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' +
    '<meta name="robots" content="noindex, nofollow">\n' +
    '<meta name="format-detection" content="telephone=no, address=no, email=no, date=no">\n' +
    '<title>' + h(titolo) + '</title>\n' +
    '<meta name="theme-color" content="#1B2A3A">\n' +
    '<link rel="manifest" href="/gestione.webmanifest">\n' +
    '<link rel="icon" href="/img/app/icona-96.png" sizes="96x96" type="image/png">\n' +
    '<link rel="icon" href="/img/app/icona-192.png" sizes="192x192" type="image/png">\n' +
    '<link rel="apple-touch-icon" href="/img/app/icona-180.png">\n' +
    '<link rel="apple-touch-icon" sizes="152x152" href="/img/app/icona-152.png">\n' +
    '<link rel="apple-touch-icon" sizes="167x167" href="/img/app/icona-167.png">\n' +
    '<link rel="apple-touch-icon" sizes="180x180" href="/img/app/icona-180.png">\n' +
    '<meta name="mobile-web-app-capable" content="yes">\n' +
    '<meta name="apple-mobile-web-app-capable" content="yes">\n' +
    '<meta name="apple-mobile-web-app-title" content="Bagnarino">\n' +
    '<meta name="apple-mobile-web-app-status-bar-style" content="default">\n' +
    '<link rel="preload" href="/fonts/hanken-grotesk-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>\n' +
    '<link rel="stylesheet" href="/gestione-app.css?v=e158e9e9">\n' +
    '</head>\n';
}

/* icone a tratto, le stesse famiglie del sito */
const ICONE = {
  indietro: '<path d="m15 18-6-6 6-6"/>',
  profilo: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  oggi: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  calendario: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  elenco: '<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/>',
  sito: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20"/>'
};
function icona(nome) {
  return '<svg class="g-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONE[nome] + '</svg>';
}
const MARCHIO = '<svg class="g-marchio" viewBox="0 0 380 402" aria-hidden="true"><path fill="#FAF6EE" d="M40 0H267A103 103 0 0 1 343.5 172H0V40A40 40 0 0 1 40 0Z"/><path fill="#C9973B" d="M0 192H317C331 195 340 202 345 210H0Z"/><path fill="#FAF6EE" d="M0 230H362A112 112 0 0 1 267 401H40A40 40 0 0 1 0 361Z"/></svg>';

/* testata semplice delle pagine senza barra (accesso, password, installa, risposta) */
function fascia(titolo) {
  return '<header class="g-testa"><span class="g-testa-marchio">' + MARCHIO + '</span><h1 class="g-testa-titolo">' + h(titolo) + '</h1></header>\n';
}

/* ---------- l'app ---------- */
function app(o) {
  return testa('Bagnarino') +
    '<body class="g-app" data-nome="' + h(o.nome || '') + '" data-chiave-push="' + h(o.chiavePush || '') + '">\n' +
    '<header class="g-testa">\n' +
    '  <button class="g-indietro" type="button" data-indietro hidden>' + icona('indietro') + '<span>Indietro</span></button>\n' +
    '  <span class="g-testa-marchio" data-marchio>' + MARCHIO + '</span>\n' +
    '  <h1 class="g-testa-titolo" data-titolo>Oggi</h1>\n' +
    '  <a class="g-profilo" href="#profilo" aria-label="Profilo: impostazioni e come va">' + icona('profilo') + '</a>\n' +
    '</header>\n' +
    '<main class="g-vista" id="vista" tabindex="-1" aria-live="polite"><p class="g-attesa">Un attimo…</p></main>\n' +
    '<nav class="g-barra" aria-label="Sezioni">\n' +
    '  <a href="#oggi" data-voce="oggi">' + icona('oggi') + '<span>Oggi</span></a>\n' +
    '  <a href="#calendario" data-voce="calendario">' + icona('calendario') + '<span>Calendario</span></a>\n' +
    '  <a href="#prenotazioni" data-voce="prenotazioni">' + icona('elenco') + '<span>Prenotazioni</span></a>\n' +
    '  <a href="#sito" data-voce="sito">' + icona('sito') + '<span>Sito</span></a>\n' +
    '</nav>\n' +
    /* "Fatto" grande dopo ogni salvataggio */
    '<div class="g-fatto" data-fatto role="status" hidden><div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg><strong data-fatto-titolo>Fatto</strong><span data-fatto-testo></span></div></div>\n' +
    /* "Annulla" per qualche secondo dopo le azioni importanti */
    '<div class="g-ripensa" data-ripensa role="status" hidden><p data-ripensa-testo></p><button class="g-btn g-btn-chiaro" type="button" data-ripensa-annulla>Annulla</button></div>\n' +
    /* una sola domanda prima di chiudere, annullare o togliere qualcosa */
    '<dialog class="g-domanda" data-domanda aria-labelledby="g-domanda-titolo"><h2 id="g-domanda-titolo" data-domanda-titolo></h2><p data-domanda-testo></p>' +
    '<div class="g-pulsanti"><button class="g-btn g-btn-primario" type="button" data-domanda-si></button><button class="g-btn g-btn-grigio" type="button" data-domanda-no>No, torna indietro</button></div></dialog>\n' +
    '<script src="/gestione-app.js?v=0ff055c8" defer></script>\n' +
    '</body>\n</html>\n';
}

/* ---------- accesso ---------- */
function accedi() {
  return testa('Entra · Bagnarino') +
    '<body class="g-fuori">\n' + fascia('Bagnarino') +
    '<main class="g-vista g-stretta">\n' +
    '<h2 class="g-titolo">Entra nell’app</h2>\n' +
    '<p class="g-testo">Scrivi email e password una volta sola: questo telefono resta dentro.</p>\n' +
    '<form class="g-modulo" data-accedi novalidate>\n' +
    '  <label class="g-campo"><span>Email</span><input type="email" name="email" autocomplete="username" inputmode="email" autocapitalize="none" spellcheck="false" required></label>\n' +
    '  <label class="g-campo"><span>Password</span><input type="password" name="password" autocomplete="current-password" autocapitalize="none" required></label>\n' +
    '  <label class="g-spunta"><input type="checkbox" data-mostra><span>Mostra la password</span></label>\n' +
    '  <p class="g-errore" data-errore role="alert" hidden></p>\n' +
    '  <button class="g-btn g-btn-primario" type="submit">Entra</button>\n' +
    '</form>\n' +
    '<p class="g-sotto"><a class="g-link" href="/gestione/password">Password dimenticata?</a></p>\n' +
    '</main>\n' +
    '<script src="/gestione-app.js?v=0ff055c8" defer></script>\n</body>\n</html>\n';
}

/* ---------- password dimenticata / nuova password ---------- */
function password(tokenLink, valido) {
  let corpo;
  if (!tokenLink) {
    corpo = '<h2 class="g-titolo">Password dimenticata</h2>\n' +
      '<p class="g-testo">Scrivi la tua email. Ti mandiamo un messaggio con il pulsante per scegliere una nuova password.</p>\n' +
      '<form class="g-modulo" data-recupero novalidate>\n' +
      '  <label class="g-campo"><span>Email</span><input type="email" name="email" autocomplete="username" inputmode="email" autocapitalize="none" spellcheck="false" required></label>\n' +
      '  <p class="g-errore" data-errore role="alert" hidden></p>\n' +
      '  <button class="g-btn g-btn-primario" type="submit">Mandami il messaggio</button>\n' +
      '</form>\n' +
      '<div class="g-esito" data-esito hidden><h2 class="g-titolo">Controlla la posta</h2><p class="g-testo">Se l’email è giusta, ti abbiamo appena mandato un messaggio. Aprilo e tocca il pulsante: vale per un’ora.</p></div>\n' +
      '<p class="g-sotto"><a class="g-link" href="/gestione/accedi">Torna all’accesso</a></p>\n';
  } else if (!valido) {
    corpo = '<h2 class="g-titolo">Questo link non vale più</h2>\n' +
      '<p class="g-testo">È passata più di un’ora, oppure è già stato usato. Chiedine uno nuovo.</p>\n' +
      '<a class="g-btn g-btn-primario" href="/gestione/password">Chiedi un nuovo messaggio</a>\n';
  } else {
    corpo = '<h2 class="g-titolo">Scegli la nuova password</h2>\n' +
      '<p class="g-testo">Almeno 8 caratteri. Scegli una frase facile da ricordare.</p>\n' +
      '<form class="g-modulo" data-nuova-password data-token="' + h(tokenLink) + '" novalidate>\n' +
      '  <label class="g-campo"><span>Nuova password</span><input type="password" name="password" autocomplete="new-password" autocapitalize="none" minlength="8" required></label>\n' +
      '  <label class="g-spunta"><input type="checkbox" data-mostra><span>Mostra la password</span></label>\n' +
      '  <p class="g-errore" data-errore role="alert" hidden></p>\n' +
      '  <button class="g-btn g-btn-primario" type="submit">Salva la nuova password</button>\n' +
      '</form>\n';
  }
  return testa('Password · Bagnarino') + '<body class="g-fuori">\n' + fascia('Bagnarino') +
    '<main class="g-vista g-stretta">\n' + corpo + '</main>\n<script src="/gestione-app.js?v=0ff055c8" defer></script>\n</body>\n</html>\n';
}

/* ---------- arrivo dai pulsanti dell'email ---------- */
function risposta(t) {
  return testa('Risposta · Bagnarino') + '<body class="g-fuori">\n' + fascia('Bagnarino') +
    '<main class="g-vista g-stretta" data-risposta data-token="' + h(t) + '">\n' +
    '<h2 class="g-titolo" data-risposta-titolo>Un attimo…</h2>\n' +
    '<p class="g-testo" data-risposta-testo>Sto registrando la tua risposta.</p>\n' +
    '<a class="g-btn g-btn-primario" href="/gestione" data-risposta-app hidden>Apri l’app</a>\n' +
    '<noscript><p class="g-testo">Apri l’app per rispondere alla richiesta.</p><a class="g-btn g-btn-primario" href="/gestione">Apri l’app</a></noscript>\n' +
    '</main>\n<script src="/gestione-app.js?v=0ff055c8" defer></script>\n</body>\n</html>\n';
}

function messaggio(titolo, testo) {
  return testa('Bagnarino') + '<body class="g-fuori">\n' + fascia('Bagnarino') +
    '<main class="g-vista g-stretta"><h2 class="g-titolo">' + h(titolo) + '</h2><p class="g-testo">' + h(testo) + '</p></main>\n</body>\n</html>\n';
}

/* ---------- /gestione/installa: come mettere l'app sulla schermata Home ---------- */
const T = 'font-family="-apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"';
function telefono(dentro) {
  return '<svg class="g-disegno" viewBox="0 0 320 200" role="img" ' + T + '>' +
    '<rect x="1.5" y="1.5" width="317" height="197" rx="14" fill="#FFFFFF" stroke="#1B2A3A" stroke-width="3"/>' + dentro + '</svg>';
}
function cerchio(cx, cy, r) { return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="#B4620A" stroke-width="5"/>'; }
const DISEGNI = {
  /* iPhone 1: la barra di Safari in basso, con il pulsante Condividi */
  condividi: telefono(
    '<title>La barra in basso di Safari: il pulsante Condividi è il quadrato con la freccia verso l’alto</title>' +
    '<rect x="20" y="24" width="280" height="34" rx="9" fill="#EEF0F3"/><text x="160" y="47" font-size="16" fill="#1B2A3A" text-anchor="middle">bagnarinocoworking.it</text>' +
    '<line x1="3" y1="128" x2="317" y2="128" stroke="#1B2A3A" stroke-width="2"/>' +
    '<g fill="none" stroke="#1B2A3A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="m52 152-12 12 12 12"/><path d="m108 152 12 12-12 12"/>' +
    '<path d="M160 172v-28"/><path d="m150 153 10-10 10 10"/><path d="M148 160h-5v24h34v-24h-5"/>' +
    '<path d="M212 148h20v32l-10-7-10 7z"/><rect x="262" y="150" width="20" height="20" rx="3"/><path d="M270 178h20v-20"/></g>' +
    cerchio(160, 164, 32)),
  /* iPhone 2: la voce nell'elenco */
  schermataHome: telefono(
    '<title>Nell’elenco che si apre, la voce Aggiungi alla schermata Home</title>' +
    '<text x="24" y="42" font-size="17" fill="#1B2A3A">Copia</text><line x1="20" y1="58" x2="300" y2="58" stroke="#C9CED6" stroke-width="2"/>' +
    '<text x="24" y="88" font-size="17" fill="#1B2A3A">Aggiungi ai preferiti</text><line x1="20" y1="104" x2="300" y2="104" stroke="#C9CED6" stroke-width="2"/>' +
    '<rect x="12" y="114" width="296" height="48" rx="10" fill="#FBF0DA" stroke="#B4620A" stroke-width="4"/>' +
    '<text x="24" y="144" font-size="15" font-weight="700" fill="#1B2A3A">Aggiungi alla schermata Home</text>' +
    '<g fill="none" stroke="#1B2A3A" stroke-width="3" stroke-linecap="round"><rect x="272" y="126" width="24" height="24" rx="5"/><path d="M284 132v12M278 138h12"/></g>' +
    '<text x="24" y="186" font-size="17" fill="#1B2A3A">Trova nella pagina</text>'),
  /* iPhone 3: Aggiungi in alto a destra */
  aggiungi: telefono(
    '<title>In alto a destra, il pulsante Aggiungi</title>' +
    '<text x="24" y="42" font-size="17" fill="#1B2A3A">Annulla</text>' +
    '<rect x="206" y="16" width="100" height="40" rx="10" fill="#FBF0DA" stroke="#B4620A" stroke-width="4"/>' +
    '<text x="256" y="43" font-size="17" font-weight="700" fill="#1B2A3A" text-anchor="middle">Aggiungi</text>' +
    '<line x1="3" y1="68" x2="317" y2="68" stroke="#1B2A3A" stroke-width="2"/>' +
    '<rect x="24" y="92" width="64" height="64" rx="14" fill="#F7F5F0" stroke="#1B2A3A" stroke-width="2"/>' +
    '<g transform="translate(38 104) scale(0.095)"><path fill="#1B2A3A" d="M40 0H267A103 103 0 0 1 343.5 172H0V40A40 40 0 0 1 40 0Z"/><path fill="#C9973B" d="M0 192H317C331 195 340 202 345 210H0Z"/><path fill="#1B2A3A" d="M0 230H362A112 112 0 0 1 267 401H40A40 40 0 0 1 0 361Z"/></g>' +
    '<text x="104" y="120" font-size="19" font-weight="700" fill="#1B2A3A">Bagnarino</text><text x="104" y="146" font-size="15" fill="#1B2A3A">bagnarinocoworking.it</text>'),
  /* la nuova icona sulla schermata Home */
  icona: telefono(
    '<title>La nuova icona Bagnarino sulla schermata Home</title>' +
    '<g fill="#E3E5E8">' +
    '<rect x="28" y="22" width="56" height="56" rx="13"/><rect x="100" y="22" width="56" height="56" rx="13"/><rect x="244" y="22" width="56" height="56" rx="13"/>' +
    '<rect x="28" y="130" width="56" height="56" rx="13"/><rect x="100" y="130" width="56" height="56" rx="13"/><rect x="172" y="130" width="56" height="56" rx="13"/><rect x="244" y="130" width="56" height="56" rx="13"/></g>' +
    '<rect x="172" y="22" width="56" height="56" rx="13" fill="#F7F5F0" stroke="#1B2A3A" stroke-width="2"/>' +
    '<g transform="translate(184 32) scale(0.085)"><path fill="#1B2A3A" d="M40 0H267A103 103 0 0 1 343.5 172H0V40A40 40 0 0 1 40 0Z"/><path fill="#C9973B" d="M0 192H317C331 195 340 202 345 210H0Z"/><path fill="#1B2A3A" d="M0 230H362A112 112 0 0 1 267 401H40A40 40 0 0 1 0 361Z"/></g>' +
    cerchio(200, 50, 40) + '<text x="200" y="114" font-size="15" font-weight="700" fill="#1B2A3A" text-anchor="middle">Bagnarino</text>'),
  /* Android 1: i tre puntini in alto a destra */
  puntini: telefono(
    '<title>In alto a destra in Chrome, i tre puntini</title>' +
    '<rect x="20" y="22" width="232" height="36" rx="18" fill="#EEF0F3"/><text x="136" y="46" font-size="16" fill="#1B2A3A" text-anchor="middle">bagnarinocoworking.it</text>' +
    '<g fill="#1B2A3A"><circle cx="286" cy="28" r="4"/><circle cx="286" cy="40" r="4"/><circle cx="286" cy="52" r="4"/></g>' + cerchio(286, 40, 26) +
    '<line x1="3" y1="76" x2="317" y2="76" stroke="#1B2A3A" stroke-width="2"/>' +
    '<rect x="20" y="96" width="180" height="14" rx="7" fill="#E3E5E8"/><rect x="20" y="124" width="250" height="14" rx="7" fill="#E3E5E8"/><rect x="20" y="152" width="210" height="14" rx="7" fill="#E3E5E8"/>'),
  /* Android 2: la voce del menu (sui Chrome non recenti si chiama così) */
  installa: telefono(
    '<title>Nel menu, la voce Aggiungi a schermata Home</title>' +
    '<text x="24" y="42" font-size="17" fill="#1B2A3A">Nuova scheda</text><line x1="20" y1="58" x2="300" y2="58" stroke="#C9CED6" stroke-width="2"/>' +
    '<text x="24" y="88" font-size="17" fill="#1B2A3A">Condividi…</text><line x1="20" y1="104" x2="300" y2="104" stroke="#C9CED6" stroke-width="2"/>' +
    '<rect x="12" y="114" width="296" height="48" rx="10" fill="#FBF0DA" stroke="#B4620A" stroke-width="4"/>' +
    '<text x="24" y="144" font-size="16" font-weight="700" fill="#1B2A3A">Aggiungi a schermata Home</text>' +
    '<g fill="none" stroke="#1B2A3A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="270" y="126" width="24" height="24" rx="5"/><path d="M282 132v12M276 138h12"/></g>' +
    '<text x="24" y="186" font-size="17" fill="#1B2A3A">Impostazioni</text>'),
  /* Android 3: la conferma */
  conferma: telefono(
    '<title>La finestra di conferma, con il pulsante Installa</title>' +
    '<text x="28" y="48" font-size="18" font-weight="700" fill="#1B2A3A">Installa app</text>' +
    '<rect x="28" y="70" width="52" height="52" rx="12" fill="#F7F5F0" stroke="#1B2A3A" stroke-width="2"/>' +
    '<g transform="translate(39 79) scale(0.08)"><path fill="#1B2A3A" d="M40 0H267A103 103 0 0 1 343.5 172H0V40A40 40 0 0 1 40 0Z"/><path fill="#C9973B" d="M0 192H317C331 195 340 202 345 210H0Z"/><path fill="#1B2A3A" d="M0 230H362A112 112 0 0 1 267 401H40A40 40 0 0 1 0 361Z"/></g>' +
    '<rect x="96" y="76" width="196" height="40" rx="6" fill="#FFFFFF" stroke="#5B6470" stroke-width="2"/><text x="108" y="102" font-size="18" fill="#1B2A3A">Bagnarino</text>' +
    '<text x="150" y="172" font-size="17" fill="#1B2A3A" text-anchor="middle">Annulla</text>' +
    '<rect x="196" y="146" width="104" height="40" rx="20" fill="#FBF0DA" stroke="#B4620A" stroke-width="4"/>' +
    '<text x="248" y="172" font-size="17" font-weight="700" fill="#1B2A3A" text-anchor="middle">Installa</text>'),
  /* Android 0: aggiornare Chrome dal Play Store */
  aggiorna: telefono(
    '<title>Nel Play Store, accanto a Chrome, il pulsante Aggiorna</title>' +
    '<rect x="20" y="20" width="280" height="40" rx="20" fill="#EEF0F3"/><text x="44" y="46" font-size="17" fill="#1B2A3A">Chrome</text>' +
    '<g fill="none" stroke="#1B2A3A" stroke-width="3" stroke-linecap="round"><circle cx="268" cy="38" r="8"/><path d="m274 44 8 8"/></g>' +
    '<circle cx="52" cy="112" r="26" fill="#FFFFFF" stroke="#1B2A3A" stroke-width="3"/><circle cx="52" cy="112" r="10" fill="#1B2A3A"/>' +
    '<text x="92" y="106" font-size="19" font-weight="700" fill="#1B2A3A">Chrome</text><text x="92" y="130" font-size="15" fill="#1B2A3A">Google LLC</text>' +
    '<rect x="188" y="90" width="116" height="44" rx="22" fill="#FBF0DA" stroke="#B4620A" stroke-width="4"/>' +
    '<text x="246" y="118" font-size="17" font-weight="700" fill="#1B2A3A" text-anchor="middle">Aggiorna</text>' +
    '<line x1="20" y1="160" x2="300" y2="160" stroke="#C9CED6" stroke-width="2"/><rect x="20" y="174" width="170" height="12" rx="6" fill="#E3E5E8"/>')
};
function passo(n, titolo, testo, disegno) {
  return '<li class="g-passo"><h3>' + n + '. ' + titolo + '</h3><p>' + testo + '</p>' + (disegno ? DISEGNI[disegno] : '') + '</li>\n';
}
/* un consiglio senza numero (per "Se le notifiche non arrivano") */
function consiglio(titolo, testo) {
  return '<li class="g-passo"><h3>' + titolo + '</h3><p>' + testo + '</p></li>\n';
}
function installa() {
  return testa('Installa l’app · Bagnarino') + '<body class="g-fuori g-installa">\n' + fascia('Bagnarino') +
    '<main class="g-vista g-stretta">\n' +
    '<h2 class="g-titolo">Metti l’app sul telefono</h2>\n' +
    '<p class="g-testo">Si fa una volta sola e richiede pochi minuti. Dopo, l’app si apre a tutto schermo dalla sua icona, come le altre app.</p>\n' +
    '<div class="g-scelta" role="tablist" aria-label="Che telefono è?">\n' +
    '  <button class="g-btn g-btn-primario" type="button" role="tab" aria-selected="true" aria-controls="p-android" data-telefono="android">Android</button>\n' +
    '  <button class="g-btn g-btn-grigio" type="button" role="tab" aria-selected="false" aria-controls="p-iphone" data-telefono="iphone">iPhone</button>\n' +
    '</div>\n' +

    /* ---------- Android: anche telefoni non recenti ---------- */
    '<section id="p-android" role="tabpanel" data-pannello="android">\n' +
    '<h2 class="g-sezione">Su Android</h2>\n' +
    '<p class="g-testo">Va bene anche un telefono di qualche anno fa: l’importante è usare <strong>Chrome</strong> e che sia aggiornato.</p>\n' +
    '<div class="g-riquadro" data-installa-subito hidden><p class="g-testo">Questo telefono può installarla subito, con un tocco.</p><button class="g-btn g-btn-primario" type="button" data-installa-ora>Installa l’app adesso</button></div>\n' +
    '<ol class="g-passi">\n' +
    passo(1, 'Aggiorna Chrome', 'Apri il <strong>Play Store</strong>, cerca “Chrome” e, se compare il pulsante <strong>Aggiorna</strong>, toccalo e aspetta che finisca. Se c’è scritto “Apri”, è già aggiornato.', 'aggiorna') +
    passo(2, 'Apri questa pagina con Chrome', 'Chrome è l’app con il cerchio rosso, giallo e verde. In alto scrivi <strong>bagnarinocoworking.it/gestione</strong>. Sui Samsung non usare l’app “Internet”: usa Chrome.') +
    passo(3, 'Tocca i tre puntini', 'In alto a destra.', 'puntini') +
    passo(4, 'Tocca “Aggiungi a schermata Home”', 'Su alcuni telefoni la stessa voce si chiama <strong>“Installa app”</strong>: è la stessa cosa.', 'installa') +
    passo(5, 'Tocca “Installa”', 'Su alcuni telefoni il pulsante si chiama “Aggiungi”. Se il telefono fa scegliere tra “Installa” e “Crea scorciatoia”, scegli <strong>“Installa”</strong>.', 'conferma') +
    passo(6, 'Apri l’app dalla nuova icona', 'L’icona Bagnarino compare sulla schermata Home. Se non la vedi, cercala nell’elenco di tutte le app. Entra con email e password: si fa solo la prima volta.', 'icona') +
    passo(7, 'Attiva le notifiche', 'Dentro l’app tocca l’omino in alto a destra, poi <strong>Impostazioni</strong>, poi <strong>Attiva le notifiche</strong>. Se il telefono chiede il permesso, tocca “Consenti”. Arriva subito una notifica di prova.') +
    '</ol>\n' +
    '<h2 class="g-sezione" id="notifiche">Se le notifiche non arrivano</h2>\n' +
    '<p class="g-testo">Prova queste cose, una alla volta. Dopo ognuna, nell’app tocca <strong>Manda una notifica di prova</strong>.</p>\n' +
    '<ul class="g-passi">\n' +
    consiglio('Chrome non è aggiornato', 'Play Store → cerca “Chrome” → <strong>Aggiorna</strong>. Poi riapri l’app e tocca di nuovo “Attiva le notifiche”.') +
    consiglio('Le notifiche sono spente', 'Apri le <strong>Impostazioni</strong> del telefono → <strong>App</strong> (o “Applicazioni”) → <strong>Chrome</strong> → <strong>Notifiche</strong> e accendile. Se tra le app trovi anche “Bagnarino”, accendile anche lì. Poi, in Chrome: tre puntini → Impostazioni → Impostazioni sito → Notifiche → <strong>bagnarinocoworking.it</strong> → Consenti.') +
    consiglio('Arrivano in ritardo', 'È il risparmio della batteria. Apri le <strong>Impostazioni</strong> del telefono → <strong>App</strong> → <strong>Chrome</strong> → <strong>Batteria</strong> e scegli “Senza restrizioni” (su alcuni telefoni “Non ottimizzare”). Se il telefono ha il “Risparmio energetico” acceso, spegnilo.') +
    consiglio('Il telefono è in silenzioso', 'Controlla il volume delle notifiche e che “Non disturbare” sia spento.') +
    consiglio('In ogni caso', 'Ogni richiesta arriva anche per <strong>email</strong>, con i due pulsanti Conferma e Non disponibile: si può rispondere da lì.') +
    '</ul>\n</section>\n' +

    /* ---------- iPhone ---------- */
    '<section id="p-iphone" role="tabpanel" data-pannello="iphone" hidden>\n' +
    '<h2 class="g-sezione">Su iPhone</h2>\n<ol class="g-passi">\n' +
    passo(1, 'Apri questa pagina con Safari', 'Safari è l’app con la bussola blu. Se sei in un’altra app (per esempio la posta o WhatsApp), copia l’indirizzo <strong>bagnarinocoworking.it/gestione</strong> e incollalo in Safari.') +
    passo(2, 'Tocca Condividi', 'È il quadrato con la freccia verso l’alto, nella barra in basso.', 'condividi') +
    passo(3, 'Tocca “Aggiungi alla schermata Home”', 'Scorri un po’ l’elenco verso il basso per trovarla.', 'schermataHome') +
    passo(4, 'Tocca “Aggiungi”', 'In alto a destra. Il nome resta “Bagnarino”.', 'aggiungi') +
    passo(5, 'Apri l’app dalla nuova icona', 'Chiudi Safari e tocca l’icona Bagnarino sulla schermata Home. Entra con email e password: si fa solo la prima volta.', 'icona') +
    passo(6, 'Attiva le notifiche', 'Dentro l’app tocca l’omino in alto a destra, poi <strong>Impostazioni</strong>, poi <strong>Attiva le notifiche</strong> e scegli “Consenti”. Su iPhone le notifiche funzionano solo dall’app sulla schermata Home (serve iOS 16.4 o più recente).') +
    '</ol>\n</section>\n' +

    '<h2 class="g-sezione">Per entrare</h2>\n' +
    '<p class="g-testo">Email: quella del coworking. Password: la stessa dell’area riservata. Se non la ricordi, nella pagina di accesso tocca “Password dimenticata?”.</p>\n' +
    '<a class="g-btn g-btn-primario" href="/gestione">Apri l’app</a>\n' +
    '</main>\n<script src="/gestione-app.js?v=0ff055c8" defer></script>\n</body>\n</html>\n';
}

module.exports = { app, accedi, password, risposta, messaggio, installa };
