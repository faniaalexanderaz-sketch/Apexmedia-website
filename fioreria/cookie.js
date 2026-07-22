/* =============================================================
   ANTICA FIORERIA DEL CENTRO — consenso cookie
   Cookie tecnici (carrello/account, sempre attivi) + cookie di
   terze parti di Stripe (pagamento) e Google (misurazione e
   pubblicità) — questi ultimi due solo se l'utente accetta.
   ============================================================= */
(function () {
  'use strict';
  var KEY = 'afc-cookie-consent';
  var box = null;

  /* ID del contenitore Google Tag Manager — SOSTITUIRE con quello vero
     (es. "GTM-ABC1234") non appena creato su tagmanager.google.com.
     Finché resta questo valore, nessuno script si carica. */
  var GTM_ID = 'GTM-XXXXXXX';

  function stato() {
    var v = localStorage.getItem(KEY);
    return v === 'accettato' || v === 'rifiutato' ? v : null;
  }

  /* carica Google Tag Manager SOLO dopo il consenso — mai prima */
  var gtmCaricato = false;
  function caricaGTM() {
    if (gtmCaricato || GTM_ID.indexOf('XXXX') !== -1) return;
    gtmCaricato = true;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtm.js?id=' + GTM_ID;
    document.head.appendChild(s);
  }

  function nascondi() {
    if (box) { box.remove(); box = null; }
    document.body.classList.remove('cookie-aperto');
  }

  function imposta(v, dopo) {
    localStorage.setItem(KEY, v);
    nascondi();
    if (v === 'accettato') caricaGTM();
    if (typeof dopo === 'function') dopo();
  }

  function crea(dopoScelta) {
    if (box) return;
    box = document.createElement('div');
    box.className = 'cookie-banner';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Preferenze cookie');
    box.innerHTML =
      '<p class="cookie-testo">Usiamo cookie <strong>tecnici</strong>, indispensabili per far funzionare carrello e account, e — solo se accetti — quelli del <strong>circuito di pagamento</strong> e quelli di <strong>misurazione e pubblicità</strong> (Google), per capire come va il sito e mostrare annunci più utili. <a href="cookie-policy.html">Scopri di più</a></p>' +
      '<div class="cookie-azioni">' +
        '<button class="btn btn-ghost btn-sm" type="button" id="cookieRifiuta">Rifiuta</button>' +
        '<button class="btn btn-primary btn-sm" type="button" id="cookieAccetta">Accetta</button>' +
      '</div>';
    document.body.appendChild(box);
    document.body.classList.add('cookie-aperto');
    box.querySelector('#cookieAccetta').addEventListener('click', function () { imposta('accettato', dopoScelta); });
    box.querySelector('#cookieRifiuta').addEventListener('click', function () { imposta('rifiutato', dopoScelta); });
  }

  /* al primo accesso, mostra subito */
  if (!stato()) crea();

  /* se il consenso è già stato dato in una visita precedente, carica
     subito GTM senza aspettare un nuovo click */
  if (stato() === 'accettato') caricaGTM();

  /* API usata da main.js prima di caricare Stripe.js, e da altre
     pagine per sapere se può far partire un evento di conversione */
  window.AFC_COOKIE = {
    stato: stato,
    richiedi: function (dopoScelta) { crea(dopoScelta); },
    dataLayerPush: function (obj) { if (stato() === 'accettato') { caricaGTM(); window.dataLayer = window.dataLayer || []; window.dataLayer.push(obj); } }
  };
})();
