/* =============================================================
   ESSENZA D'ORIENTE — consenso cookie
   Cookie tecnici (sempre attivi, non richiedono consenso) +
   Google Tag Manager (misurazione), che si carica SOLO se
   l'utente accetta dal banner.
   ============================================================= */
(function () {
  'use strict';
  var KEY = 'eo-cookie-consent';
  var box = null;

  /* ID del contenitore Google Tag Manager */
  var GTM_ID = 'GTM-KVSX5PF5';

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
    var nos = document.createElement('noscript');
    var ifr = document.createElement('iframe');
    ifr.src = 'https://www.googletagmanager.com/ns.html?id=' + GTM_ID;
    ifr.height = '0'; ifr.width = '0';
    ifr.style.display = 'none'; ifr.style.visibility = 'hidden';
    nos.appendChild(ifr);
    document.body.insertBefore(nos, document.body.firstChild);
  }

  function nascondi() {
    if (box) { box.remove(); box = null; }
  }

  /* sblocca il Google tag (gtag.js, in head) solo dopo l'accettazione:
     di default parte con 'denied' per restare conformi al GDPR */
  function aggiornaConsensoGtag() {
    if (typeof window.gtag !== 'function') return;
    window.gtag('consent', 'update', {
      'ad_storage': 'granted',
      'ad_user_data': 'granted',
      'ad_personalization': 'granted',
      'analytics_storage': 'granted'
    });
  }

  function imposta(v) {
    localStorage.setItem(KEY, v);
    nascondi();
    if (v === 'accettato') { caricaGTM(); aggiornaConsensoGtag(); }
  }

  /* percorso base: '' in radice, '../' dentro trattamenti/ */
  var base = document.body.getAttribute('data-base') || '';

  function crea() {
    if (box || stato()) return;
    box = document.createElement('div');
    box.className = 'cookie-banner';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Preferenze cookie');
    box.innerHTML =
      '<p class="cookie-testo">Usiamo cookie <strong>tecnici</strong>, sempre attivi e indispensabili per far funzionare il sito, e — solo se accetti — cookie di <strong>misurazione</strong> (Google) per capire come va il sito. <a href="' + base + 'cookie.html">Scopri di più</a></p>' +
      '<div class="cookie-azioni">' +
        '<button class="btn btn-cookie-rifiuta" type="button" id="cookieRifiuta">Rifiuta</button>' +
        '<button class="btn btn-cookie-accetta" type="button" id="cookieAccetta">Accetta</button>' +
      '</div>';
    document.body.appendChild(box);
    box.querySelector('#cookieAccetta').addEventListener('click', function () { imposta('accettato'); });
    box.querySelector('#cookieRifiuta').addEventListener('click', function () { imposta('rifiutato'); });
  }

  if (!stato()) crea();
  if (stato() === 'accettato') { caricaGTM(); aggiornaConsensoGtag(); }

  /* usata da script.js per gli eventi di conversione: se il consenso
     non è ancora stato dato (o è stato rifiutato), l'evento non
     viene mai accodato in dataLayer */
  window.EO_COOKIE = {
    stato: stato,
    push: function (obj) {
      if (stato() !== 'accettato') return;
      caricaGTM();
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(obj);
    }
  };
})();
