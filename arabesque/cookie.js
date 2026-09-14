/* =============================================================
   ARABESQUE BUSALLA — consenso e misurazione
   Nessuno strumento di statistica parte prima del consenso.
   Con Consent Mode v2: i segnali partono negati e passano a
   concessi solo dopo un "accetta". I cookie tecnici (carrello,
   taglia scelta, codice sconto) restano sempre attivi.
   ============================================================= */
(function () {
  'use strict';
  var CHIAVE = 'arb-cookie';
  var scelta = null;
  try { scelta = localStorage.getItem(CHIAVE); } catch (e) {}
  window.ARB_CONSENSO = scelta === 'tutti';

  /* Consent Mode v2: dichiarato sempre, anche senza GA4 configurato */
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  gtag('consent', 'default', {
    ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
    analytics_storage: 'denied', functionality_storage: 'granted', security_storage: 'granted'
  });

  function accendiStrumenti() {
    if (typeof ARB_CONFIG === 'undefined') return;
    gtag('consent', 'update', {
      ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', analytics_storage: 'granted'
    });
    if (ARB_CONFIG.ga4 && !document.getElementById('ga4')) {
      var s = document.createElement('script');
      s.id = 'ga4'; s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ARB_CONFIG.ga4;
      document.head.appendChild(s);
      gtag('js', new Date());
      gtag('config', ARB_CONFIG.ga4, { send_page_view: true });
    }
    if (ARB_CONFIG.metaPixel && !window.fbq) {
      /* caricatore ufficiale Meta, ridotto all'osso */
      var n = window.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
      var t = document.createElement('script');
      t.async = true; t.src = 'https://connect.facebook.net/en_US/fbevents.js';
      document.head.appendChild(t);
      fbq('init', ARB_CONFIG.metaPixel);
      fbq('track', 'PageView');
    }
  }
  if (window.ARB_CONSENSO) accendiStrumenti();

  if (scelta) return;
  if (location.pathname.indexOf('cookie-policy') !== -1) return;

  function mostra() {
    var box = document.createElement('div');
    box.className = 'cookie';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Informativa cookie');
    box.innerHTML =
      '<p>Usiamo cookie tecnici per far funzionare il carrello e, solo con il tuo consenso, cookie di statistica per capire quali capi interessano di più. ' +
      'Dettagli nella <a href="cookie-policy.html">cookie policy</a>.</p>' +
      '<div class="cookie-azioni">' +
        '<button class="btn btn-primario btn-piccolo btn-senza-icona" data-cookie="tutti">Accetta tutti</button>' +
        '<button class="btn btn-filo btn-piccolo btn-senza-icona" data-cookie="tecnici">Solo tecnici</button>' +
      '</div>';
    document.body.appendChild(box);
    box.addEventListener('click', function (e) {
      var b = e.target.closest('[data-cookie]');
      if (!b) return;
      try { localStorage.setItem(CHIAVE, b.dataset.cookie); } catch (err) {}
      window.ARB_CONSENSO = b.dataset.cookie === 'tutti';
      if (window.ARB_CONSENSO) accendiStrumenti();
      box.remove();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mostra);
  else mostra();
})();
