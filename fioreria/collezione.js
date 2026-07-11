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

  function euro(n) {
    return '€ ' + (Number.isInteger(n) ? n : n.toFixed(2).replace('.', ','));
  }

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

  function disegnaGriglia(attiva) {
    griglia.innerHTML = '';
    var visibili = 0;
    AFC_PRODOTTI.forEach(function (p) {
      if (attiva !== 'tutti' && p.cat.indexOf(attiva) === -1) return;
      visibili += 1;
      var a = document.createElement('a');
      a.className = 'prod-mini';
      a.href = 'prodotto.html?p=' + p.slug;
      a.innerHTML =
        '<span class="prod-mini-foto">' +
          (p.badge ? '<span class="badge' + (p.badgeOro ? ' badge-oro' : '') + '">' + p.badge + '</span>' : '') +
          '<img src="' + p.foto + '" alt="" loading="lazy" width="700" height="875" onerror="this.classList.add(\'no-foto\')" />' +
        '</span>' +
        '<span class="prod-mini-nome"></span>' +
        '<span class="prod-mini-prezzo">da ' + euro(afcPrezzoTaglia(p.prezzo, AFC_TAGLIE[0])) + '</span>' +
        '<span class="prod-mini-stelle" aria-label="Valutazione ' + p.rating[0] + ' su 5">★ ' + p.rating[0] + '</span>';
      a.querySelector('.prod-mini-nome').textContent = p.nome;
      griglia.appendChild(a);
    });
    if (vuoto) vuoto.hidden = visibili > 0;
  }

  var attiva = catAttiva();
  disegnaFiltri(attiva);
  disegnaGriglia(attiva);

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
