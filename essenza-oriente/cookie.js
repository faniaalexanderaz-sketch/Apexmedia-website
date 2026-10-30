/* =============================================================
   ESSENZA D'ORIENTE — consenso cookie
   Cookie tecnici (sempre attivi, non richiedono consenso) +
   Google Tag Manager (misurazione), che si carica SOLO se
   l'utente accetta dal banner. Il Google tag in head parte in
   Consent Mode "denied" e viene sbloccato qui.
   ============================================================= */
(function () {
  'use strict';
  var KEY = 'eo-cookie-consent';
  var GTM_ID = 'GTM-KVSX5PF5';
  var box = null;

  function stato() {
    try {
      var v = localStorage.getItem(KEY);
      return v === 'accettato' || v === 'rifiutato' ? v : null;
    } catch (e) { return null; }
  }

  var gtmCaricato = false;
  function caricaGTM() {
    if (gtmCaricato) return;
    gtmCaricato = true;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtm.js?id=' + GTM_ID;
    document.head.appendChild(s);
  }

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
    try { localStorage.setItem(KEY, v); } catch (e) { /* navigazione privata */ }
    if (box) { box.remove(); box = null; }
    if (v === 'accettato') { caricaGTM(); aggiornaConsensoGtag(); }
  }

  /* percorso base: '' in radice, '../' dentro trattamenti/ */
  var base = /\/trattamenti\//.test(location.pathname) ? '../' : '';

  function crea() {
    if (box || stato()) return;
    box = document.createElement('div');
    box.className = 'cookie-banner';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Preferenze cookie');
    box.innerHTML =
      '<p class="cookie-testo">Cookie <strong>tecnici</strong> sempre attivi; quelli di <strong>misurazione</strong> (Google) solo se accetti. <a href="' + base + 'cookie.html">Dettagli</a></p>' +
      '<div class="cookie-azioni">' +
        '<button class="btn btn-secondario" type="button" id="cookieRifiuta">Rifiuta</button>' +
        '<button class="btn btn-primario" type="button" id="cookieAccetta">Accetta</button>' +
      '</div>';
    document.body.appendChild(box);
    box.querySelector('#cookieAccetta').addEventListener('click', function () { imposta('accettato'); });
    box.querySelector('#cookieRifiuta').addEventListener('click', function () { imposta('rifiutato'); });
  }

  if (!stato()) crea();
  if (stato() === 'accettato') { caricaGTM(); aggiornaConsensoGtag(); }

  /* usata da script.js: se il consenso non è stato dato, l'evento
     non viene accodato in dataLayer (gtag in Consent Mode fa da sé) */
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
