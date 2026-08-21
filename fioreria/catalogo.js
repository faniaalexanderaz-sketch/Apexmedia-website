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
