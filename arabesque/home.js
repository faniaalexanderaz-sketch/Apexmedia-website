/* =============================================================
   ARABESQUE BUSALLA — regia della home
   Riempie le zone dinamiche: schede sospese dell'hero, passerella,
   lookbook, scala delle taglie che si accende allo scroll.
   ============================================================= */
(function () {
  'use strict';

  /* ---- riquadri delle sezioni ---- */
  function slot(id, file, etichetta) {
    var n = document.getElementById(id);
    if (n) n.innerHTML = ARB.boxFoto('foto/' + file + '.webp', etichetta, 'A', etichetta);
  }
  slot('fotoCurvy', 'curvy', 'Linea curvy');
  slot('fotoNegozio', 'negozio', 'Il negozio');

  document.querySelectorAll('.tri-card').forEach(function (c) {
    var titolo = c.querySelector('h3').textContent;
    var box = c.querySelector('.tri-foto');
    if (box) box.outerHTML = ARB.boxFoto('foto/cat-' + titolo.toLowerCase() + '.webp', titolo, 'A', titolo);
  });

  /* ---- hero: tre capi sospesi ---- */
  var vetrina = ['cappotto-milano', 'giubbotto-genova', 'cappotto-boucle-curvy'];
  vetrina.forEach(function (slug, i) {
    var n = document.getElementById('cascata' + (i + 1));
    var p = arbProdotto(slug);
    if (!n || !p) return;
    n.innerHTML = ARB.boxFoto(arbFoto(p, 1), p.nome, 'A', p.sottocategoria) +
      '<span class="hero-scheda-eti">' + p.sottocategoria + '<b>' + arbEuro(arbPrezzoFinale(p)) + '</b></span>';
  });

  /* ---- passerella: novità e saldi ---- */
  var pista = document.getElementById('pista');
  if (pista) {
    var scelti = ARB_PRODOTTI.filter(function (p) {
      return p.sconto || (p.linea || []).indexOf('novita') !== -1;
    }).slice(0, 10);
    pista.innerHTML = scelti.map(function (p) { return ARB.cardProdotto(p); }).join('');
  }

  /* ---- lookbook ---- */
  var LOOK = [
    { nome: 'Sera in città', capi: ['blazer-notte', 'camicia-seta', 'gonna-pelle'] },
    { nome: 'Ufficio, lunedì', capi: ['cappotto-lana-uomo', 'camicia-oxford', 'chino-slim'] },
    { nome: 'Curvy, tutti i giorni', capi: ['cardigan-lungo-curvy', 'camicia-oversize-curvy', 'palazzo-curvy'] }
  ];
  var fila = document.getElementById('filaLook');
  if (fila) {
    fila.innerHTML = LOOK.map(function (l, i) {
      var capi = l.capi.map(arbProdotto).filter(Boolean);
      var tot = capi.reduce(function (t, p) { return t + arbPrezzoFinale(p); }, 0);
      return '<article class="guscio look entra' + (i ? ' r' + i : '') + '">' +
        '<div class="nucleo">' +
          ARB.boxFoto('foto/look-' + (i + 1) + '.webp', l.nome, 'A', 'Look ' + (i + 1)) +
          '<div class="look-corpo">' +
            '<h3>' + l.nome + '</h3>' +
            '<ul class="look-capi">' + capi.map(function (p) {
              return '<li><b>' + p.nome + '</b><span>' + arbEuro(arbPrezzoFinale(p)) + '</span></li>';
            }).join('') + '</ul>' +
            '<div class="look-somma"><span>Look completo</span><b>' + arbEuro(tot) + '</b></div>' +
            '<button class="btn btn-scuro btn-blocco btn-piccolo" data-look="' + i + '">Aggiungi il look' +
              '<span class="cerchio"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></button>' +
          '</div>' +
        '</div>' +
      '</article>';
    }).join('');
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-look]');
    if (!b) return;
    var l = LOOK[parseInt(b.dataset.look, 10)];
    var n = 0;
    l.capi.forEach(function (slug) {
      var p = arbProdotto(slug);
      if (!p) return;
      var disp = (p.taglie || []).filter(function (t) { return t.stock > 0; });
      var media = disp[Math.floor(disp.length / 2)] || disp[0];
      if (media) { ARB.aggiungi(slug, media.id); n++; }
    });
    if (n) ARB.avviso('Look aggiunto — le taglie le cambi nel carrello');
  });

  /* ---- la scala delle taglie si accende una alla volta ---- */
  var scala = document.getElementById('scalaTaglie');
  if (scala && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (voci, io) {
      if (!voci[0].isIntersecting) return;
      io.disconnect();
      var span = scala.querySelectorAll('span');
      span.forEach(function (s, i) {
        setTimeout(function () { s.classList.add(i >= 5 ? 'oro' : 'viva'); }, 90 * i);
      });
    }, { threshold: .4 }).observe(scala);
  }

  ARB.reveal();
  ARB.inclina();
})();
