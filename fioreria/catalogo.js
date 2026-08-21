/* =============================================================
   ANTICA FIORERIA DEL CENTRO — home
   Nastro recensioni + le due vetrine di prodotti ("Le più scelte"
   e la vetrina dell'atelier), costruite dal catalogo con la stessa
   card di collezione e correlati.
   ============================================================= */
(function () {
  'use strict';

  /* nastro recensioni: duplica le card per il loop continuo (i cloni
     sono decorativi, nascosti agli screen reader) */
  var track = document.querySelector('.rec-track');
  if (!track || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var originali = Array.prototype.slice.call(track.children);
  originali.forEach(function (c) {
    var clone = c.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });
})();

/* Vetrine della home costruite dal catalogo.
   Prima erano quattro card scritte a mano per vetrina, con prezzi
   copiati a mano: quattro degli otto avevano già preso strade diverse
   da prodotti.js (es. Cuore di Rose in home "da € 46", in scheda
   "da € 55"). Leggendo il catalogo la deriva non può più succedere. */
(function () {
  var vetrine = document.querySelectorAll('[data-slugs]');
  if (!vetrine.length || typeof AFC_CARD === 'undefined' || typeof afcProdotto !== 'function') return;

  function disegna(scorte) {
    vetrine.forEach(function (box) {
      box.innerHTML = '';
      box.getAttribute('data-slugs').split(',').forEach(function (slug) {
        var p = afcProdotto(slug.trim());
        if (!p) return;
        var conosciuta = scorte && Object.prototype.hasOwnProperty.call(scorte, p.slug);
        var rimasti = conosciuta ? scorte[p.slug] : undefined;
        var esaurito = conosciuta && rimasti === 0;

        var a = document.createElement('a');
        a.className = 'prod-mini reveal' + (esaurito ? ' prod-mini-esaurito' : '');
        a.href = 'prodotto.html?p=' + p.slug;
        a.setAttribute('data-slug', p.slug);
        a.innerHTML = AFC_CARD.markup(p, { esaurito: esaurito, rimasti: rimasti });
        a.querySelector('.prod-mini-nome').textContent = p.nome;
        box.appendChild(a);
        if (window.AFC_REVEAL) AFC_REVEAL.observe(a);
      });
    });
  }

  disegna(null);
  fetch('/api/stock').then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
    if (d && d.scorte) disegna(d.scorte);
  }).catch(function () {});
})();

/* Nastro delle categorie che scorre da solo, lentamente.
   Non è un'animazione CSS come il nastro recensioni: lì il nastro è
   decorativo, qui sono link che si devono poter toccare e scorrere a
   mano. Si muove quindi il vero scrollLeft, così swipe e tastiera
   continuano a funzionare, e il movimento si ferma appena l'utente
   mette le mani sul nastro. */
(function () {
  var PX_AL_SECONDO = 16;

  document.querySelectorAll('.cat-track[data-scorrimento-auto]').forEach(function (track) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var originali = Array.prototype.slice.call(track.children);
    if (!originali.length) return;

    /* i duplicati rendono il ciclo continuo: sono decorativi, quindi
       fuori dal flusso di lettura e non raggiungibili da tastiera */
    originali.forEach(function (el) {
      var clone = el.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.setAttribute('tabindex', '-1');
      track.appendChild(clone);
    });

    var giro = 0;
    function misura() {
      var primoClone = track.children[originali.length];
      giro = primoClone ? primoClone.offsetLeft - originali[0].offsetLeft : 0;
    }
    misura();
    window.addEventListener('resize', misura);

    /* i duplicati raddoppiano già il contenuto, quindi il nastro è
       scorrevole anche quando le categorie entrerebbero tutte: qui basta
       escludere il caso degenere in cui non c'è nulla da percorrere */
    if (giro <= 0) return;

    var inPausa = false;
    var timerRipresa = null;
    function ferma() { inPausa = true; clearTimeout(timerRipresa); }
    function riprendiTraPoco(ms) {
      clearTimeout(timerRipresa);
      timerRipresa = setTimeout(function () { inPausa = false; }, ms);
    }

    track.addEventListener('pointerenter', ferma);
    track.addEventListener('pointerleave', function () { riprendiTraPoco(600); });
    track.addEventListener('pointerdown', ferma);
    window.addEventListener('pointerup', function () { riprendiTraPoco(1800); });
    track.addEventListener('touchstart', ferma, { passive: true });
    track.addEventListener('touchend', function () { riprendiTraPoco(2500); }, { passive: true });
    track.addEventListener('focusin', ferma);
    track.addEventListener('focusout', function () { riprendiTraPoco(600); });

    /* La posizione va tenuta a parte come numero con la virgola: a questa
       velocità ogni frame vale una frazione di pixel, e scrollLeft
       restituisce un valore arrotondato — rileggendolo ogni volta
       l'avanzamento verrebbe buttato via a ogni frame e il nastro
       resterebbe fermo. */
    var pos = track.scrollLeft;
    var ultimo = null;
    function passo(ora) {
      var dt = ultimo == null ? 0 : Math.min(ora - ultimo, 100);
      ultimo = ora;
      if (inPausa || document.hidden) {
        pos = track.scrollLeft;   // l'utente può aver scorrito a mano
      } else if (dt) {
        pos += PX_AL_SECONDO * dt / 1000;
        /* tornati al punto di partenza del ciclo: si rientra di un giro,
           e poiché i duplicati sono identici il salto non si vede */
        if (pos >= giro) pos -= giro;
        track.scrollLeft = pos;
      }
      requestAnimationFrame(passo);
    }
    requestAnimationFrame(passo);
  });
})();
