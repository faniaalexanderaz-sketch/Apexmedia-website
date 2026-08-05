/* =============================================================
   ESSENZA D'ORIENTE — interazioni e tracciamento conversioni
   =============================================================

   EVENTI DATALAYER (da importare in GA4 e poi in Google Ads
   come conversioni):

   | Evento                    | Significato                                | Uso                          |
   |---------------------------|--------------------------------------------|------------------------------|
   | click_chiama              | Click su un bottone/link tel:              | GA4 -> Google Ads conversione |
   | click_whatsapp            | Click su un bottone/link wa.me             | GA4 -> Google Ads conversione |
   | click_widget_prenotazione | Click DENTRO il widget Treatwell (proxy)   | GA4 -> Google Ads conversione |

   Il terzo evento è un "proxy di intenzione": Treatwell non
   comunica al sito le prenotazioni completate, quindi tracciamo
   il primo click dentro l'iframe come segnale forte di interesse.
   ============================================================= */
(function () {
  'use strict';

  /* gli eventi passano da EO_COOKIE.push (definita in cookie.js):
     se l'utente non ha ancora accettato i cookie di misurazione,
     l'evento viene scartato invece di essere accodato */
  function traccia(obj) {
    if (window.EO_COOKIE) window.EO_COOKIE.push(obj);
  }

  /* ---------- click_chiama + click_whatsapp ----------
     Delegato sul documento: copre anche bottoni ripetuti
     (header, barra mobile, sezione prenotazione, contatti). */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (href.indexOf('tel:') === 0) {
      traccia({ event: 'click_chiama' });
    } else if (href.indexOf('https://wa.me/') === 0 || href.indexOf('wa.me/') === 0) {
      traccia({ event: 'click_whatsapp' });
    }
  });

  /* ---------- click_widget_prenotazione: il "blur trick" ----------
     PERCHÉ ESISTE QUESTO WORKAROUND: il widget Treatwell è un
     iframe cross-origin — il browser NON ci lascia ascoltare i
     click al suo interno. Però, quando l'utente clicca dentro un
     iframe, la finestra principale perde il focus (evento "blur")
     e document.activeElement diventa l'iframe stesso. Combinando
     le due cose otteniamo un segnale affidabile di "ha interagito
     col widget di prenotazione". Non è un tracciamento perfetto
     (non sappiamo se ha COMPLETATO la prenotazione), è un proxy
     di intenzione forte — documentato anche nella tabella sopra.
     Il flag `widgetGiaTracciato` evita eventi duplicati nella
     stessa sessione di pagina. */
  var widgetGiaTracciato = false;
  window.addEventListener('blur', function () {
    if (widgetGiaTracciato) return;
    var attivo = document.activeElement;
    if (attivo && attivo.tagName === 'IFRAME' &&
        (attivo.closest('#wahanda-online-booking-widget-iframe') ||
         (attivo.src || '').indexOf('treatwell') !== -1)) {
      widgetGiaTracciato = true;
      traccia({ event: 'click_widget_prenotazione' });
    }
  });

  /* ---------- card trattamento cliccabile ----------
     Tutta la card porta alla pagina del trattamento (foto compresa),
     non solo il piccolo link "Scopri di più". I link/bottoni dentro
     la card (Prenota, Scopri di più) continuano a funzionare come
     sempre: si naviga dalla card solo se il click non è già dentro
     un link o un bottone. */
  document.querySelectorAll('.tratt[data-href]').forEach(function (card) {
    card.addEventListener('click', function (e) {
      if (e.target.closest('a, button')) return;
      window.location.href = card.getAttribute('data-href');
    });
  });

  /* ---------- recensioni: scorrimento continuo e lento (marquee) ----------
     Duplichiamo le card via JS invece che nell'HTML: il markup resta
     con una sola copia (più facile da aggiornare), e il loop CSS
     (-50%) risulta perfetto perché il set duplicato ha esattamente
     la stessa larghezza dell'originale. Se l'utente preferisce
     "riduci movimento" il JS non parte: resta lo swipe manuale. */
  var recensioniTrack = document.getElementById('recensioniTrack');
  var vuoleMenoMovimento = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (recensioniTrack && !vuoleMenoMovimento) {
    var carteOriginali = Array.prototype.slice.call(recensioniTrack.children);
    carteOriginali.forEach(function (carta) {
      var clone = carta.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      recensioniTrack.appendChild(clone);
    });
    recensioniTrack.classList.add('marquee-attivo');
    /* touch: metti in pausa mentre l'utente scorre col dito, riprendi dopo */
    var timerRipresa;
    recensioniTrack.addEventListener('touchstart', function () {
      recensioniTrack.classList.add('scorrimento-in-pausa');
      clearTimeout(timerRipresa);
    }, { passive: true });
    recensioniTrack.addEventListener('touchend', function () {
      clearTimeout(timerRipresa);
      timerRipresa = setTimeout(function () {
        recensioniTrack.classList.remove('scorrimento-in-pausa');
      }, 2500);
    }, { passive: true });
  }

  /* ---------- sezione orari: giorno corrente + badge "aperti ora" ----------
     Il centro è aperto tutti i giorni 9:30–22:30: calcoliamo lo stato
     in base all'orario locale del visitatore, niente di hardcoded. */
  var orariGiorni = document.getElementById('orariGiorni');
  var orariLiveTesto = document.getElementById('orariLiveTesto');
  var orariLive = document.getElementById('orariLive');
  if (orariGiorni) {
    var oggi = new Date();
    var voceOggi = orariGiorni.querySelector('[data-giorno="' + oggi.getDay() + '"]');
    if (voceOggi) voceOggi.setAttribute('data-oggi', '');
  }
  if (orariLiveTesto && orariLive) {
    var ora = new Date();
    var minutiOra = ora.getHours() * 60 + ora.getMinutes();
    var aperto = minutiOra >= 9 * 60 + 30 && minutiOra < 22 * 60 + 30;
    if (aperto) {
      orariLiveTesto.textContent = 'Aperti ora';
    } else {
      orariLiveTesto.textContent = 'Apriamo alle 9:30';
      orariLive.style.background = 'rgba(217,198,140,.14)';
      orariLive.style.borderColor = 'rgba(217,198,140,.45)';
      orariLive.style.color = 'var(--oro-chiaro)';
      var pallino = orariLive.querySelector('.orari-live-pallino');
      if (pallino) { pallino.style.background = 'var(--oro-chiaro)'; pallino.style.animation = 'none'; }
    }
  }

  /* ---------- menu a scomparsa (hamburger) ---------- */
  var menuBtn = document.getElementById('menuBtn');
  var menuDrawer = document.getElementById('menuDrawer');
  var menuScrim = document.getElementById('menuScrim');
  var menuChiudi = document.getElementById('menuChiudi');
  if (menuBtn && menuDrawer && menuScrim) {
    function apriMenu() {
      menuDrawer.hidden = false;
      menuScrim.hidden = false;
      document.body.classList.add('menu-aperto');
      menuBtn.setAttribute('aria-expanded', 'true');
    }
    function chiudiMenu() {
      menuDrawer.hidden = true;
      menuScrim.hidden = true;
      document.body.classList.remove('menu-aperto');
      menuBtn.setAttribute('aria-expanded', 'false');
    }
    menuBtn.addEventListener('click', apriMenu);
    menuScrim.addEventListener('click', chiudiMenu);
    if (menuChiudi) menuChiudi.addEventListener('click', chiudiMenu);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menuDrawer.hidden) chiudiMenu();
    });
    menuDrawer.addEventListener('click', function (e) {
      if (e.target.closest('a')) chiudiMenu();
    });
  }
})();
