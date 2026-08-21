/* =============================================================
   ANTICA FIORERIA DEL CENTRO — pagina collezione
   Card piccole (4 per riga): foto, nome, prezzo. Il click porta
   alla pagina del singolo prodotto. Filtro categoria via ?cat=.
   ============================================================= */
(function () {
  'use strict';

  var griglia = document.getElementById('prodGriglia');
  var filtri = document.getElementById('filtri');
  var vuoto = document.getElementById('catalogoVuoto');
  if (!griglia || !filtri) return;

  function catAttiva() {
    var m = location.search.match(/[?&]cat=([a-z]+)/);
    return m ? m[1] : 'tutti';
  }

  function disegnaFiltri(attiva) {
    filtri.innerHTML = '';
    AFC_CATEGORIE.forEach(function (c) {
      var b = document.createElement('a');
      b.className = 'filtro' + (c[0] === attiva ? ' attivo' : '');
      b.href = c[0] === 'tutti' ? 'collezione.html' : 'collezione.html?cat=' + c[0];
      b.textContent = c[1];
      b.setAttribute('aria-pressed', String(c[0] === attiva));
      filtri.appendChild(b);
    });
  }

  var scorte = {};

  function disegnaGriglia(attiva) {
    griglia.innerHTML = '';
    var visibili = 0;
    AFC_PRODOTTI.forEach(function (p) {
      if (attiva !== 'tutti' && p.cat.indexOf(attiva) === -1) return;
      visibili += 1;
      var conosciuta = Object.prototype.hasOwnProperty.call(scorte, p.slug);
      var rimasti = scorte[p.slug];
      var esaurito = conosciuta && rimasti === 0;
      var a = document.createElement('a');
      a.className = 'prod-mini' + (esaurito ? ' prod-mini-esaurito' : '');
      a.href = 'prodotto.html?p=' + p.slug;
      a.innerHTML = AFC_CARD.markup(p, {
        esaurito: esaurito,
        rimasti: conosciuta ? rimasti : undefined
      });
      a.querySelector('.prod-mini-nome').textContent = p.nome;
      griglia.appendChild(a);
    });
    if (vuoto) vuoto.hidden = visibili > 0;
  }

  var attiva = catAttiva();
  disegnaFiltri(attiva);
  disegnaGriglia(attiva);

  fetch('/api/stock').then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
    if (d && d.scorte) { scorte = d.scorte; disegnaGriglia(attiva); }
  }).catch(function () {});

  /* titolo dinamico per la categoria */
  if (attiva !== 'tutti') {
    var nomeCat = null;
    AFC_CATEGORIE.forEach(function (c) { if (c[0] === attiva) nomeCat = c[1]; });
    if (nomeCat) {
      var h = document.querySelector('.shop-pagina .display');
      h.innerHTML = '';
      h.appendChild(document.createTextNode(nomeCat.split(' ')[0] + ' '));
      var em = document.createElement('em');
      em.textContent = nomeCat.split(' ').slice(1).join(' ') || 'in bottega';
      h.appendChild(em);
      document.title = nomeCat + ' — Antica Fioreria del Centro';
    }
  }
})();
