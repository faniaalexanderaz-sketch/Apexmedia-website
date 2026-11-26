/* =============================================================
   ANTICA FIORERIA DEL CENTRO — campagna di Natale
   Tutto quello che è "Natale" sta qui: si spegne da solo alle date
   sotto, senza dover toccare le pagine.
   - barra in alto con il conto alla rovescia per la consegna
   - banner che compare una volta per visita (home e collezione)
   - decorazioni leggere nella hero (solo CSS, ferme con "riduci movimento")
   - promemoria offerte in collezione Natale, scheda prodotto e checkout
   Le offerte sono vere e applicate: confezione regalo e biglietto
   scritto a mano in omaggio, spedizione gratis sopra 99 € (main.js /
   checkout.js), consegna entro Natale per ordini entro il 22 dicembre.
   ============================================================= */
(function () {
  'use strict';

  var SCADENZA_CONSEGNA = new Date('2026-12-22T23:59:59+01:00'); // ultimo ordine per Natale
  var FINE_CAMPAGNA = new Date('2026-12-27T00:00:00+01:00');      // dopo, tutto si spegne
  var LINK_NATALE = 'collezione.html?cat=natale';

  var ora = new Date();
  if (ora >= FINE_CAMPAGNA) {
    var testoBar = document.querySelector('#promoBar .promo-bar-testo');
    if (testoBar) testoBar.innerHTML = 'Primo ordine? <strong>−10%</strong> con <code>BENVENUTO10</code> · Spedizione gratis sopra <strong>€ 99</strong>';
    return;
  }
  document.documentElement.classList.add('natale');
  var inTempo = ora < SCADENZA_CONSEGNA;
  var ridotto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function quantoManca() {
    var ms = SCADENZA_CONSEGNA - new Date();
    if (ms <= 0) return '';
    var min = Math.floor(ms / 60000);
    var g = Math.floor(min / 1440), h = Math.floor((min % 1440) / 60), m = min % 60;
    if (g >= 2) return 'mancano ' + g + ' giorni';
    if (g === 1) return 'manca 1 giorno e ' + h + ' h';
    return 'mancano ' + h + ' h ' + m + ' min';
  }

  function crea(tag, cls, html) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (html != null) el.innerHTML = html;
    return el;
  }

  var ICONA_REGALO = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="8.5" width="17" height="4" rx="1"/><path d="M5 12.5v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7M12 8.5v12"/><path d="M12 8.5C10.5 5 7 4.6 7 6.6S10 8.5 12 8.5ZM12 8.5c1.5-3.5 5-3.9 5-1.9S14 8.5 12 8.5Z"/></svg>';
  var ICONA_PENNA = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 3.5 20.5 9.5 9.8 20.2 3.5 21.5l1.3-6.3L14.5 3.5Z"/><path d="m13 5 6 6"/></svg>';
  var ICONA_FURGONE = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.8 16.3V7.6c0-.6.4-1 1-1h9.3c.6 0 1 .4 1 1v8.7"/><path d="M14.1 9.8h3.1l2.7 3.1c.2.2.3.5.3.8v2.6h-1.9"/><path d="M8.7 16.3h5.4M2.8 16.3h1.4"/><circle cx="6.5" cy="16.6" r="1.9"/><circle cx="16.4" cy="16.6" r="1.9"/></svg>';

  function promesse() {
    return '<li>' + ICONA_REGALO + '<span><strong>Confezione regalo natalizia</strong> in omaggio</span></li>' +
      '<li>' + ICONA_PENNA + '<span><strong>Biglietto scritto a mano</strong> in omaggio</span></li>' +
      '<li>' + ICONA_FURGONE + '<span>' + (inTempo
        ? '<strong>Consegna entro Natale</strong> per ordini entro il 22/12'
        : 'Spedizioni di Natale chiuse: <strong>ritiro in bottega</strong> ad Alessandria') + '</span></li>';
  }

  /* ---------- 1) barra in alto: conto alla rovescia ---------- */
  (function () {
    var cd = document.getElementById('natCountdown');
    var testo = document.querySelector('#promoBar .promo-bar-testo');
    if (!testo) return;
    if (!inTempo) {
      testo.innerHTML = '<strong>Natale in bottega</strong> — spedizioni per Natale chiuse: ritira in bottega ad Alessandria · confezione regalo e biglietto in omaggio';
      return;
    }
    if (!cd) return;
    function aggiorna() {
      var t = quantoManca();
      if (!t) { location.reload(); return; }
      cd.textContent = t;
    }
    aggiorna();
    setInterval(aggiorna, 30000);
  })();

  /* ---------- 2) decorazioni nella hero ---------- */
  (function () {
    var hero = document.querySelector('.hero-split');
    if (!hero) return;
    var deco = crea('div', 'natale-deco');
    deco.setAttribute('aria-hidden', 'true');
    var html = '';
    // fiocchi: posizione, ritardo e durata variati, solo transform/opacity
    for (var i = 0; i < 12; i++) {
      html += '<i class="nd-fiocco" style="left:' + (4 + (i * 37) % 92) + '%;--r:' + (-(i * 1.7) % 11).toFixed(1) +
        's;--t:' + (11 + (i * 5) % 9) + 's;--s:' + (0.6 + ((i * 7) % 5) / 10).toFixed(1) + '"></i>';
    }
    // stelle dorate che brillano piano
    [[8, 14], [88, 10], [70, 34], [16, 58], [94, 64]].forEach(function (p, i) {
      html += '<i class="nd-stella" style="left:' + p[0] + '%;top:' + p[1] + '%;--r:' + (i * 0.9).toFixed(1) + 's"></i>';
    });
    deco.innerHTML = html;
    hero.appendChild(deco);
    if (ridotto) deco.classList.add('ferma');
  })();

  /* ---------- 3) banner una volta per visita (home e collezione) ---------- */
  (function () {
    var pagina = location.pathname;
    var inHome = pagina === '/' || /index\.html$/.test(pagina);
    var inCollezione = /collezione(\.html)?$/.test(pagina) && !/[?&]cat=natale/.test(location.search);
    if (!inHome && !inCollezione) return;
    try {
      if (localStorage.getItem('afc-natale-card-chiusa') === '1') return;
      if (sessionStorage.getItem('afc-natale-card-vista') === '1') return;
    } catch (e) { return; }

    var card = crea('aside', 'natale-card');
    card.setAttribute('aria-label', 'Offerta di Natale');
    card.innerHTML =
      '<button class="natale-card-chiudi" type="button" aria-label="Chiudi l\'offerta di Natale">×</button>' +
      '<p class="natale-card-eyebrow">Natale in bottega</p>' +
      '<p class="natale-card-titolo">Il regalo che <em>non appassisce</em></p>' +
      '<ul class="natale-promesse">' + promesse() + '</ul>' +
      '<a class="btn btn-primary natale-card-cta" href="' + LINK_NATALE + '">Scopri i regali di Natale</a>' +
      (inTempo ? '<p class="natale-card-nota">Spedizione gratis sopra € 99 · ' + quantoManca() + '</p>' : '');

    function chiudi(ricorda) {
      card.classList.remove('aperta');
      document.body.classList.remove('natale-card-aperta');
      setTimeout(function () { card.remove(); }, 400);
      if (ricorda) { try { localStorage.setItem('afc-natale-card-chiusa', '1'); } catch (e) {} }
    }
    card.querySelector('.natale-card-chiudi').addEventListener('click', function () { chiudi(true); });
    card.querySelector('.natale-card-cta').addEventListener('click', function () { chiudi(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && card.isConnected) chiudi(true); });

    function mostra() {
      // aspetta che il banner cookie sia chiuso; mai sopra carrello o popup newsletter
      if (document.querySelector('.cookie-banner')) { setTimeout(mostra, 1500); return; }
      var cart = document.getElementById('cart');
      var pop = document.getElementById('newsPop');
      if ((cart && !cart.hidden) || (pop && !pop.hidden)) return;
      try { sessionStorage.setItem('afc-natale-card-vista', '1'); } catch (e) {}
      document.body.appendChild(card);
      document.body.classList.add('natale-card-aperta');
      requestAnimationFrame(function () { requestAnimationFrame(function () { card.classList.add('aperta'); }); });
    }
    setTimeout(mostra, 4000);
  })();

  /* ---------- 4) collezione Natale: le promesse sopra la griglia ---------- */
  (function () {
    if (!/[?&]cat=natale/.test(location.search)) return;
    var griglia = document.getElementById('prodGriglia');
    if (!griglia) return;
    var box = crea('div', 'natale-fascia');
    box.innerHTML = '<ul class="natale-promesse">' + promesse() + '</ul>' +
      (inTempo ? '<p class="natale-fascia-cd">Ordina entro il 22 dicembre — <strong>' + quantoManca() + '</strong> · spedizione gratis sopra € 99</p>' : '');
    griglia.parentNode.insertBefore(box, griglia);
    var eyebrow = document.querySelector('.shop-pagina .eyebrow');
    if (eyebrow) eyebrow.textContent = 'Fatti a mano in bottega, dal 1953';
  })();

  /* ---------- 5) scheda prodotto: promemoria regalo ---------- */
  (function () {
    var consegna = document.querySelector('.prodotto .pm-consegna');
    if (!consegna) return;
    var p = crea('p', 'pm-natale', ICONA_REGALO + '<span>' + (inTempo
      ? '<strong>Natale:</strong> confezione regalo e biglietto scritto a mano in omaggio · ordina entro il 22/12 per riceverlo a Natale'
      : '<strong>Natale:</strong> confezione regalo e biglietto scritto a mano in omaggio · ritiro in bottega ad Alessandria') + '</span>');
    consegna.parentNode.insertBefore(p, consegna);
  })();

  /* ---------- 6) checkout: il biglietto è in omaggio ---------- */
  (function () {
    var bigliettoExtra = document.querySelector('.extra-card[data-extra="Biglietto scritto a mano"]');
    if (bigliettoExtra) bigliettoExtra.hidden = true; // a Natale non si paga: si scrive nel campo messaggio
    var lbl = document.querySelector('label[for="coMsg"]');
    if (lbl) lbl.innerHTML = 'Biglietto scritto a mano <span class="hint">(in omaggio a Natale — facoltativo)</span>';
    var msg = document.getElementById('coMsg');
    if (msg) msg.placeholder = 'Scrivi qui le tue parole: le scriviamo a mano sul biglietto di Natale…';
    var sezExtra = document.querySelector('.extra-card');
    if (sezExtra) {
      var nota = crea('p', 'co-natale', ICONA_REGALO + '<span><strong>Natale in bottega:</strong> ogni ordine parte in confezione regalo natalizia con biglietto scritto a mano, in omaggio. Spedizione gratis sopra € 99.</span>');
      var griglia = sezExtra.parentNode;
      griglia.parentNode.insertBefore(nota, griglia);
    }
  })();
})();
