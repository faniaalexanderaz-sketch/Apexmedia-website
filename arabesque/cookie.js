/* =============================================================
   ARABESQUE BUSALLA — banner cookie
   Nessuno script di statistica o marketing parte prima del
   consenso: qui si limita a memorizzare la scelta e a esporre
   window.ARB_CONSENSO per gli script futuri (GA4 / Meta).
   ============================================================= */
(function () {
  'use strict';
  var CHIAVE = 'arb-cookie';
  var scelta = null;
  try { scelta = localStorage.getItem(CHIAVE); } catch (e) {}
  window.ARB_CONSENSO = scelta === 'tutti';

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
        '<button class="btn btn-primario btn-piccolo" data-cookie="tutti">Accetta tutti</button>' +
        '<button class="btn btn-fantasma btn-piccolo" data-cookie="tecnici">Solo tecnici</button>' +
      '</div>';
    document.body.appendChild(box);
    box.addEventListener('click', function (e) {
      var b = e.target.closest('[data-cookie]');
      if (!b) return;
      try { localStorage.setItem(CHIAVE, b.dataset.cookie); } catch (err) {}
      window.ARB_CONSENSO = b.dataset.cookie === 'tutti';
      box.remove();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mostra);
  else mostra();
})();
