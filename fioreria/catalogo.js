/* =============================================================
   ANTICA FIORERIA DEL CENTRO — home
   Il catalogo prodotti ora vive in collezione.html: qui resta
   solo il nastro recensioni a scorrimento continuo.
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

/* scorte live per "Le più scelte" */
(function () {
  var carte = document.querySelectorAll('#piuScelte .prod-mini[data-slug]');
  if (!carte.length) return;
  fetch('/api/stock').then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
    if (!d || !d.scorte) return;
    carte.forEach(function (card) {
      var slug = card.getAttribute('data-slug');
      if (!Object.prototype.hasOwnProperty.call(d.scorte, slug)) return;
      var rimasti = d.scorte[slug];
      var elScorte = card.querySelector('.prod-mini-scorte');
      if (rimasti <= 0) {
        card.classList.add('prod-mini-esaurito');
        var badge = card.querySelector('.badge');
        if (badge) { badge.textContent = 'Esaurito'; badge.className = 'badge badge-esaurito'; }
        else {
          var span = document.createElement('span');
          span.className = 'badge badge-esaurito';
          span.textContent = 'Esaurito';
          card.querySelector('.prod-mini-foto').prepend(span);
        }
        if (elScorte) elScorte.hidden = true;
      } else if (elScorte) {
        elScorte.querySelector('span').textContent = rimasti + ' rimasti';
        elScorte.hidden = false;
      }
    });
  }).catch(function () {});
})();
