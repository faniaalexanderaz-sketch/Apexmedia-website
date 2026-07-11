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
