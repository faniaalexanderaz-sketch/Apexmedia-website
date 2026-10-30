/* =============================================================
   ESSENZA D'ORIENTE — interazioni e tracciamento conversioni
   =============================================================
   EVENTI DATALAYER (da importare in GA4 e poi in Google Ads):

   | Evento                    | Significato                                    |
   |---------------------------|------------------------------------------------|
   | click_chiama              | Click su un link tel:                          |
   | click_whatsapp            | Click su un link wa.me                         |
   | prenota_click             | Click su un bottone "Prenota" (porta al widget)|
   | click_widget_prenotazione | Primo click DENTRO il widget Treatwell (proxy) |

   Il widget Treatwell è un iframe cross-origin: non comunica le
   prenotazioni completate. Il primo click al suo interno è il
   segnale più vicino alla conversione che possiamo misurare.
   ============================================================= */
(function () {
  'use strict';

  var APRE = 9 * 60 + 30, CHIUDE = 22 * 60 + 30;
  var WA_BASE = 'https://wa.me/393317153533?text=';

  /* ---------- tracciamento ---------- */
  var AW_ID = 'AW-17997395114';
  var AW_ETICHETTE = { PREDEFINITA: '', click_chiama: '', click_whatsapp: '', click_widget_prenotazione: '' };
  function traccia(obj) {
    if (window.EO_COOKIE) window.EO_COOKIE.push(obj);
    var etichetta = AW_ETICHETTE[obj.event] || AW_ETICHETTE.PREDEFINITA;
    if (!etichetta || typeof window.gtag !== 'function' || !(obj.event in AW_ETICHETTE)) return;
    window.gtag('event', 'conversion', { send_to: AW_ID + '/' + etichetta, value: 30.0, currency: 'EUR', transport_type: 'beacon' });
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (href.indexOf('tel:') === 0) traccia({ event: 'click_chiama' });
    else if (href.indexOf('https://wa.me/') === 0) traccia({ event: 'click_whatsapp' });
  });

  /* ---------- click dentro il widget Treatwell (blur trick) ----------
     Il browser non ci fa ascoltare i click in un iframe cross-origin,
     ma quando l'utente ci clicca la finestra perde il focus e
     document.activeElement diventa l'iframe. */
  var widgetTracciato = false;
  window.addEventListener('blur', function () {
    setTimeout(function () {
      var attivo = document.activeElement;
      if (!widgetTracciato && attivo && attivo.tagName === 'IFRAME' && (attivo.src || '').indexOf('treatwell') !== -1) {
        widgetTracciato = true;
        traccia({ event: 'click_widget_prenotazione' });
      }
    }, 0);
  });

  /* ---------- stato di apertura in tempo reale ---------- */
  function apertoOra() { var d = new Date(); var m = d.getHours() * 60 + d.getMinutes(); return m >= APRE && m < CHIUDE; }
  var stato = document.getElementById('statoApertura');
  var statoTesto = document.getElementById('statoTesto');
  if (stato && statoTesto) {
    if (apertoOra()) statoTesto.textContent = 'Aperti ora fino alle 22:30';
    else { statoTesto.textContent = 'Chiusi ora, riapriamo alle 9:30'; stato.classList.add('chiuso'); }
  }

  /* ---------- nav: si nasconde scendendo, riappare risalendo ---------- */
  var nav = document.getElementById('nav');
  if (nav) {
    var ultimoY = window.scrollY, nascosta = false, ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        var giu = y > ultimoY + 4 && y > 120;
        var su = y < ultimoY - 4 || y < 80;
        if (giu && !nascosta && !document.documentElement.classList.contains('menu-aperto')) { nav.classList.add('nascosta'); nascosta = true; }
        else if (su && nascosta) { nav.classList.remove('nascosta'); nascosta = false; }
        ultimoY = y; ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- menu a schermo intero (mobile) ---------- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu');
  if (burger && menu) {
    var root = document.documentElement;
    function toggleMenu(apri) {
      root.classList.toggle('menu-aperto', apri);
      burger.setAttribute('aria-expanded', apri ? 'true' : 'false');
      burger.setAttribute('aria-label', apri ? 'Chiudi il menu' : 'Apri il menu');
      if (apri) nav.classList.remove('nascosta');
    }
    burger.addEventListener('click', function () { toggleMenu(!root.classList.contains('menu-aperto')); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) toggleMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('menu-aperto')) { toggleMenu(false); burger.focus(); } });
  }

  /* ---------- scelta del trattamento → widget ----------
     Ogni "Prenota" porta al calendario Treatwell. Se il click parte da
     una riga del listino (o da una pagina trattamento), il nome viaggia
     fino alla sezione prenota: l'utente sa cosa cercare nel widget e il
     messaggio WhatsApp è già compilato. */
  var sceltaAttiva = document.getElementById('sceltaAttiva');
  var sceltaNome = document.getElementById('sceltaNome');
  var sceltaInfo = document.getElementById('sceltaInfo');
  var sceltaCambia = document.getElementById('sceltaCambia');
  var prenotaWa = document.getElementById('prenotaWa');

  function messaggioWa(nome) {
    return nome ? 'Ciao! Vorrei prenotare: ' + nome + '. Quando avete disponibilità?' : 'Ciao! Vorrei prenotare un trattamento. Quando avete disponibilità?';
  }
  function scegli(nome, info) {
    if (!sceltaAttiva) return;
    if (nome) {
      sceltaNome.textContent = nome;
      sceltaInfo.textContent = info || '';
      sceltaAttiva.hidden = false;
    } else {
      sceltaAttiva.hidden = true;
    }
    if (prenotaWa) prenotaWa.href = WA_BASE + encodeURIComponent(messaggioWa(nome));
  }
  var trattPagina = document.body.getAttribute('data-tratt-nome');
  if (trattPagina) scegli(trattPagina, document.body.getAttribute('data-tratt-info') || '');

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-prenota]');
    if (!el) return;
    var riga = el.closest('[data-tratt]');
    var nome = riga ? riga.getAttribute('data-tratt') : trattPagina || '';
    var info = riga ? riga.getAttribute('data-info') : '';
    if (riga) scegli(nome, info);
    traccia({ event: 'prenota_click', trattamento: nome || '' });
  });
  if (sceltaCambia) {
    sceltaCambia.addEventListener('click', function () {
      scegli(null);
      var listino = document.getElementById('listino') || document.getElementById('trattamenti');
      if (listino) listino.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else window.location.href = '../index.html#trattamenti';
    });
  }

  /* ---------- nastro: duplica le voci per il loop continuo ---------- */
  var nastro = document.getElementById('nastro');
  if (nastro) {
    var voci = Array.prototype.slice.call(nastro.children);
    voci.forEach(function (v) { nastro.appendChild(v.cloneNode(true)); });
  }
})();
