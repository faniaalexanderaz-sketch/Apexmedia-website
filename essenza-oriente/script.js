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

  /* ---------- hero: leggero parallax sulla foto ----------
     Solo su desktop (dove la foto è a tutto bordo) e solo mentre la
     hero è visibile: un IntersectionObserver accende/spegne un rAF
     loop, così non giriamo calcoli inutili quando l'utente ha già
     scrollato oltre. Anima solo `transform` (GPU-safe), mai `top`. */
  var heroFotoImg = document.getElementById('heroFotoImg');
  var vuoleMenoMovimentoHero = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var schermoDesktopHero = window.matchMedia && window.matchMedia('(min-width: 821px)').matches;
  if (heroFotoImg && !vuoleMenoMovimentoHero && schermoDesktopHero) {
    var heroInView = false;
    var heroRafInCorso = false;
    function aggiornaParallaxHero() {
      heroRafInCorso = false;
      if (!heroInView) return;
      var offset = Math.min(40, window.scrollY * 0.08);
      heroFotoImg.style.transform = 'translateY(' + offset + 'px)';
      requestAnimationFrame(aggiornaParallaxHero);
      heroRafInCorso = true;
    }
    var heroObserver = new IntersectionObserver(function (entries) {
      heroInView = entries[0].isIntersecting;
      if (heroInView) {
        heroFotoImg.style.willChange = 'transform';
        if (!heroRafInCorso) { heroRafInCorso = true; requestAnimationFrame(aggiornaParallaxHero); }
      } else {
        heroFotoImg.style.willChange = 'auto';
      }
    });
    heroObserver.observe(document.querySelector('.hero'));
  }

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

  /* ---------- Offerta Primo Accesso: fascia in alto + countdown ----------
     Flash offer con scadenza reale (15 settembre, giorno del rinnovo
     contratto Ads: dopo quella data l'offerta non ha più motivo di
     esistere). Tre superfici condividono lo stesso countdown:
     - ".ribbon-offerta": iniettata qui via JS sopra l'header, su OGNI
       pagina (non serve editarle una per una);
     - ".offerta-sez": sezione statica già scritta nell'HTML (home e
       landing riflessologia plantare) — questo script si limita ad
       aggiornarne i numeri tramite [data-countdown];
     - se il tempo è scaduto, fascia e sezioni offerta si nascondono da
       sole: evita che l'offerta resti online per errore dopo il 15. */
  var OFFERTA_SCADENZA = new Date('2026-09-15T23:59:59');
  var OFFERTA_WA_HREF = 'https://wa.me/393317153533?text=' +
    encodeURIComponent("Ciao! Vorrei prenotare la Riflessologia Plantare a 25€ (offerta Primo Accesso).");

  function offertaResiduo() {
    var ms = OFFERTA_SCADENZA.getTime() - Date.now();
    if (ms <= 0) return null;
    var minutiTotali = Math.floor(ms / 60000);
    return {
      giorni: Math.floor(minutiTotali / 1440),
      ore: Math.floor((minutiTotali % 1440) / 60),
      minuti: minutiTotali % 60
    };
  }

  function aggiornaContiOfferta() {
    var residuo = offertaResiduo();
    if (!residuo) {
      var fasciaScaduta = document.getElementById('ribbonOfferta');
      if (fasciaScaduta) fasciaScaduta.remove();
      document.querySelectorAll('.offerta-sez').forEach(function (sez) { sez.hidden = true; });
      return;
    }
    var contoRibbon = document.getElementById('ribbonOffertaConto');
    if (contoRibbon) contoRibbon.textContent = residuo.giorni + 'g ' + residuo.ore + 'h';
    var bGiorni = document.querySelector('[data-countdown="giorni"]');
    var bOre = document.querySelector('[data-countdown="ore"]');
    var bMinuti = document.querySelector('[data-countdown="minuti"]');
    if (bGiorni) bGiorni.textContent = residuo.giorni;
    if (bOre) bOre.textContent = residuo.ore;
    if (bMinuti) bMinuti.textContent = residuo.minuti;
  }

  /* la fascia si chiude solo per il resto della giornata, non per
     sempre: chi chiude oggi la rivede comunque domani, l'obiettivo è
     non essere invadenti senza nascondere l'offerta a chi torna */
  var OFFERTA_CHIUSA_KEY = 'eo_offerta_chiusa_il';
  function offertaChiusaOggi() {
    try { return localStorage.getItem(OFFERTA_CHIUSA_KEY) === new Date().toDateString(); }
    catch (e) { return false; }
  }
  function chiudiOffertaOggi() {
    try { localStorage.setItem(OFFERTA_CHIUSA_KEY, new Date().toDateString()); }
    catch (e) { /* storage non disponibile (es. navigazione privata): pazienza */ }
  }

  if (offertaResiduo() && !offertaChiusaOggi() && document.querySelector('.top')) {
    var fascia = document.createElement('div');
    fascia.className = 'ribbon-offerta';
    fascia.id = 'ribbonOfferta';
    fascia.setAttribute('role', 'region');
    fascia.setAttribute('aria-label', 'Offerta a tempo');
    fascia.innerHTML =
      '<span class="ribbon-offerta-testo">' +
        '<svg width="12" height="12" viewBox="0 0 34 20" fill="currentColor" aria-hidden="true"><path d="M17 1.5c2.4 3.4 2.4 7.6 0 11.4-2.4-3.8-2.4-8 0-11.4Z"/><path d="M10.6 4.4c3 1.9 4.6 5 4.3 8.7-3.6-1-5.7-4.1-4.3-8.7Z"/><path d="M23.4 4.4c1.4 4.6-.7 7.7-4.3 8.7-.3-3.7 1.3-6.8 4.3-8.7Z"/></svg>' +
        '<strong>Offerta Primo Accesso:</strong> Riflessologia Plantare a 25&nbsp;€ invece di 35&nbsp;€' +
      '</span>' +
      '<span class="ribbon-offerta-conto">Scade tra <span id="ribbonOffertaConto"></span></span>' +
      '<a class="ribbon-offerta-cta" href="' + OFFERTA_WA_HREF + '" target="_blank" rel="noopener">Scrivici su WhatsApp</a>' +
      '<button type="button" class="ribbon-offerta-chiudi" aria-label="Chiudi l\'avviso offerta">×</button>';
    document.body.insertBefore(fascia, document.body.firstChild);
    var chiudiBtn = fascia.querySelector('.ribbon-offerta-chiudi');
    if (chiudiBtn) {
      chiudiBtn.addEventListener('click', function () {
        chiudiOffertaOggi();
        fascia.remove();
      });
    }
  }
  aggiornaContiOfferta();
  setInterval(aggiornaContiOfferta, 60000);
})();
