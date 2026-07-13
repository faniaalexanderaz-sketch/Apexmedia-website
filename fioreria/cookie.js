/* =============================================================
   ANTICA FIORERIA DEL CENTRO — consenso cookie
   Cookie tecnici (carrello/account, sempre attivi) + cookie di
   terze parti di Stripe (solo al pagamento, solo se accettati).
   Nessun cookie di profilazione o pubblicità sul sito.
   ============================================================= */
(function () {
  'use strict';
  var KEY = 'afc-cookie-consent';
  var box = null;

  function stato() {
    var v = localStorage.getItem(KEY);
    return v === 'accettato' || v === 'rifiutato' ? v : null;
  }

  function nascondi() {
    if (box) { box.remove(); box = null; }
    document.body.classList.remove('cookie-aperto');
  }

  function imposta(v, dopo) {
    localStorage.setItem(KEY, v);
    nascondi();
    if (typeof dopo === 'function') dopo();
  }

  function crea(dopoScelta) {
    if (box) return;
    box = document.createElement('div');
    box.className = 'cookie-banner';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Preferenze cookie');
    box.innerHTML =
      '<p class="cookie-testo">Usiamo cookie <strong>tecnici</strong>, indispensabili per far funzionare carrello e account, e — solo se accetti — quelli del <strong>circuito di pagamento</strong> quando paghi con carta, Apple Pay o Google Pay. Nessun cookie di profilazione o pubblicità. <a href="cookie-policy.html">Scopri di più</a></p>' +
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

  /* API usata da main.js prima di caricare Stripe.js */
  window.AFC_COOKIE = {
    stato: stato,
    richiedi: function (dopoScelta) { crea(dopoScelta); }
  };
})();
