/* =============================================================
   ARABESQUE BUSALLA — regia della home
   Riempie le zone dinamiche e tiene l'ordine commerciale:
   prima i capi comprabili, poi il racconto.
   ============================================================= */
(function () {
  'use strict';

  function slot(id, file, etichetta) {
    var n = document.getElementById(id);
    if (n) n.innerHTML = ARB.boxFoto('foto/' + file + '.webp', etichetta, 'A', etichetta);
  }

  /* ---- hero a strati: fondo, capo, interfaccia che fluttua ---- */
  var punta = arbProdotto('cappotto-milano');
  var fondo = document.getElementById('stratoFondo');
  var capo = document.getElementById('stratoCapo');
  var pillolaPrezzo = document.getElementById('pillolaPrezzo');
  if (fondo && punta) {
    fondo.innerHTML = ARB.boxFoto('foto/hero-fondo.webp', 'Tessuto', '', 'Collezione autunno / inverno', 'v-donna');
    capo.innerHTML = '<div class="strato-capo-carta" style="aspect-ratio:3/4;border-radius:var(--r-l);overflow:hidden;box-shadow:var(--ombra-3)">' +
      ARB.boxFoto(arbFoto(punta, 1), punta.nome, ARB.segnoDi(punta).m, punta.sottocategoria, ARB.segnoDi(punta).v) + '</div>';
    pillolaPrezzo.href = 'prodotto.html?p=' + punta.slug;
    pillolaPrezzo.innerHTML = '<b>' + punta.nome + '</b> ' + arbEuro(arbPrezzoFinale(punta));
  }

  /* ---- riquadri delle sezioni ---- */
  slot('fotoCurvy', 'curvy', 'Linea curvy');
  slot('fotoNegozio', 'negozio', 'Il negozio');
  slot('megaFotoDonna', 'cat-donna', 'Donna');
  slot('megaFotoCurvy', 'curvy', 'Curvy');
  slot('megaFotoUomo', 'cat-uomo', 'Uomo');
  slot('megaFotoNegozio', 'negozio', 'Negozio');
  document.querySelectorAll('.tri-card').forEach(function (c) {
    var titolo = c.querySelector('h3').textContent;
    var box = c.querySelector('.tri-foto');
    if (box) box.outerHTML = ARB.boxFoto('foto/cat-' + titolo.toLowerCase() + '.webp', titolo, 'A', titolo);
  });

  /* ---- riga sotto l'hero: quattro capi, subito comprabili ---- */
  var riga = document.getElementById('rigaHero');
  if (riga) {
    var primi = ARB_PRODOTTI.filter(function (p) { return p.sconto && arbDisponibile(p); }).slice(0, 4);
    riga.innerHTML = primi.map(function (p) { return ARB.cardProdotto(p); }).join('');
    ARB.evento('view_item_list', { item_list_name: 'hero', items: primi.map(function (p) { return { item_id: p.slug, item_name: p.nome, price: arbPrezzoFinale(p) }; }) });
  }

  /* ---- più venduti ---- */
  var venduti = document.getElementById('grigliaVenduti');
  if (venduti) {
    var scelti = ARB_PRODOTTI.filter(function (p) { return arbDisponibile(p); }).slice(0, 8);
    venduti.innerHTML = scelti.map(function (p) { return ARB.cardProdotto(p); }).join('');
  }

  /* ---- novità: la vetrina che scorre da sola ---- */
  function riempiVetrina(id, capi) {
    var pista = document.getElementById(id);
    if (!pista || !capi.length) return;
    pista.innerHTML = '<div class="vetrina-fila">' +
      capi.map(function (p) { return ARB.cardProdotto(p); }).join('') + '</div>';
  }

  var novita = ARB_PRODOTTI.filter(function (p) { return (p.linea || []).indexOf('novita') !== -1 && arbDisponibile(p); });
  if (novita.length < 6) {
    novita = novita.concat(ARB_PRODOTTI.filter(function (p) {
      return novita.indexOf(p) === -1 && arbDisponibile(p);
    }).slice(0, 8 - novita.length));
  }
  riempiVetrina('pista', novita.slice(0, 10));

  /* ---- le taglie che raramente si trovano: la curvy in vetrina ---- */
  var curvy = ARB_PRODOTTI.filter(function (p) {
    return (p.linea || []).indexOf('curvy') !== -1 && arbDisponibile(p);
  });
  riempiVetrina('pistaCurvy', curvy.slice(0, 10));

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
            '<button class="btn btn-primario btn-blocco btn-piccolo" data-look="' + i + '">Aggiungi il look' +
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
      scala.querySelectorAll('span').forEach(function (s, i) {
        setTimeout(function () { s.classList.add(i >= 4 ? 'oro' : 'viva'); }, 85 * i);
      });
    }, { threshold: .4 }).observe(scala);
  }

  ARB.config();
  ARB.riaggancia();
})();
