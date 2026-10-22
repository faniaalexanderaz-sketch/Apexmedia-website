/* =============================================================
   BAGNARINO COWORKING — consenso cookie e misurazione
   Finché in config.js non ci sono i codici GA4 / Meta Pixel il
   sito usa solo memoria tecnica: nessun banner da mostrare.
   Quando i codici ci sono, nulla parte prima del consenso
   (Consent Mode v2: segnali negati di partenza).
   ============================================================= */
(function () {
  'use strict';
  var C = window.BGN_CONFIG || {};
  var CHIAVE = 'bgn-cookie';
  var scelta = null;
  try { scelta = localStorage.getItem(CHIAVE); } catch (e) {}

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  gtag('consent', 'default', {
    ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
    analytics_storage: 'denied', functionality_storage: 'granted', security_storage: 'granted'
  });

  var strumenti = !!(C.ga4 || C.metaPixel);
  if (!strumenti) return;

  function accendi() {
    gtag('consent', 'update', { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', analytics_storage: 'granted' });
    if (C.ga4 && !document.getElementById('ga4')) {
      var s = document.createElement('script');
      s.id = 'ga4'; s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + C.ga4;
      document.head.appendChild(s);
      gtag('js', new Date());
      gtag('config', C.ga4);
    }
    if (C.metaPixel && !window.fbq) {
      var n = window.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
      var t = document.createElement('script');
      t.async = true; t.src = 'https://connect.facebook.net/it_IT/fbevents.js';
      document.head.appendChild(t);
      fbq('init', C.metaPixel);
      fbq('track', 'PageView');
    }
  }
  if (scelta === 'tutti') { accendi(); return; }
  if (scelta) return;
  if (location.pathname.indexOf('cookie') !== -1) return;

  function mostra() {
    var box = document.createElement('div');
    box.className = 'cookie';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Preferenze cookie');
    box.innerHTML =
      '<p>Usiamo cookie tecnici per far funzionare il sito e, solo se accetti, cookie di statistica e pubblicità per capire come migliorare. ' +
      '<a href="/cookie">Dettagli</a>.</p>' +
      '<div class="cookie-azioni">' +
        '<button class="btn btn-pieno btn-piccolo" type="button" data-cookie="tutti">Accetta</button>' +
        '<button class="btn btn-filo btn-piccolo" type="button" data-cookie="tecnici">Solo tecnici</button>' +
      '</div>';
    document.body.appendChild(box);
    box.addEventListener('click', function (e) {
      var b = e.target.closest('[data-cookie]');
      if (!b) return;
      try { localStorage.setItem(CHIAVE, b.getAttribute('data-cookie')); } catch (err) {}
      if (b.getAttribute('data-cookie') === 'tutti') accendi();
      box.remove();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mostra); else mostra();
})();
