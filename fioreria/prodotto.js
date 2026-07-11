/* =============================================================
   ANTICA FIORERIA DEL CENTRO — pagina del singolo prodotto
   Legge ?p=<slug>, mostra descrizione completa e taglie S/M/L/XL.
   La XL contiene il doppio dei fiori della M ma costa il 30% in
   meno del doppio: si mostra il valore pieno barrato.
   ============================================================= */
(function () {
  'use strict';

  var m = location.search.match(/[?&]p=([a-z]+)/);
  var prod = m ? afcProdotto(m[1]) : null;
  if (!prod) { location.replace('collezione.html'); return; }

  function euro(n) {
    return '€ ' + (Number.isInteger(n) ? n : n.toFixed(2).replace('.', ','));
  }

  var taglia = AFC_TAGLIE[1]; // parte dalla M
  var qty = 1;

  /* ---------- riempi la scheda ---------- */
  document.title = prod.nome + ' — Antica Fioreria del Centro';
  document.getElementById('brNome').textContent = prod.nome;
  document.getElementById('pNome').textContent = prod.nome;
  document.getElementById('pDesc').textContent = prod.descLunga;

  var foto = document.getElementById('pFoto');
  foto.onerror = function () { foto.classList.add('no-foto'); };
  foto.src = prod.foto;
  foto.alt = 'Bouquet ' + prod.nome;

  if (prod.badge) {
    var b = document.getElementById('pBadge');
    b.textContent = prod.badge;
    if (prod.badgeOro) b.classList.add('badge-oro');
    b.hidden = false;
  }

  document.getElementById('pRating').innerHTML =
    '<span class="stelle" aria-hidden="true">★★★★★</span> <span>' + prod.rating[0] +
    '</span> <span class="rating-n">(' + prod.rating[1] + ' recensioni)</span>';

  var avail = document.getElementById('pAvail');
  avail.querySelector('span').textContent = prod.avail;
  if (prod.availBassa) avail.classList.add('avail-low');

  /* ---------- taglie ---------- */
  var boxTaglie = document.getElementById('taglie');
  var nota = document.getElementById('tagliaNota');

  function prezzoCorrente() { return afcPrezzoTaglia(prod.prezzo, taglia); }

  function dipingiPrezzo() {
    var pieno = document.getElementById('pPrezzoPieno');
    var sconto = document.getElementById('pSconto');
    document.getElementById('pPrezzo').textContent = euro(prezzoCorrente() * qty);
    if (taglia.doppio) {
      pieno.textContent = euro(afcValoreXL(prod.prezzo) * qty);
      pieno.hidden = false;
      sconto.hidden = false;
    } else {
      pieno.hidden = true;
      sconto.hidden = true;
    }
    nota.textContent = taglia.nota + (taglia.doppio ? ' — vale ' + euro(afcValoreXL(prod.prezzo)) + ', lo paghi ' + euro(prezzoCorrente()) + '.' : '');
    document.getElementById('qN').textContent = String(qty);
  }

  AFC_TAGLIE.forEach(function (t) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'taglia-btn' + (t.id === taglia.id ? ' attiva' : '');
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', String(t.id === taglia.id));
    btn.innerHTML = '<strong>' + t.nome + '</strong><span>' + euro(afcPrezzoTaglia(prod.prezzo, t)) + '</span>' +
      (t.doppio ? '<em class="taglia-badge">−30%</em>' : '');
    btn.addEventListener('click', function () {
      taglia = t;
      boxTaglie.querySelectorAll('.taglia-btn').forEach(function (x) {
        var on = x === btn;
        x.classList.toggle('attiva', on);
        x.setAttribute('aria-checked', String(on));
      });
      dipingiPrezzo();
    });
    boxTaglie.appendChild(btn);
  });

  document.getElementById('qMeno').addEventListener('click', function () { if (qty > 1) { qty -= 1; dipingiPrezzo(); } });
  document.getElementById('qPiu').addEventListener('click', function () { if (qty < 12) { qty += 1; dipingiPrezzo(); } });

  dipingiPrezzo();

  /* ---------- carrello ---------- */
  function nomeCompleto() { return prod.nome + ' (' + taglia.nome + ')'; }

  function aggiungi() {
    if (typeof AFC_CART === 'undefined') return;
    for (var i = 0; i < qty; i++) AFC_CART.add(nomeCompleto(), prezzoCorrente());
  }
  document.getElementById('pAggiungi').addEventListener('click', aggiungi);
  document.getElementById('pCompra').addEventListener('click', function () {
    aggiungi();
    AFC_CART.openCart();
  });

  /* ---------- wishlist ---------- */
  var cuore = document.getElementById('pCuore');
  if (typeof AFC !== 'undefined') {
    cuore.hidden = false;
    if (AFC.inWishlist(prod.nome)) cuore.classList.add('salvato');
    cuore.addEventListener('click', function () {
      var r = AFC.toggleWishlist(prod.nome);
      if (r.richiedeLogin) return;
      cuore.classList.toggle('salvato', r.salvato);
      cuore.classList.remove('pop'); void cuore.offsetWidth; cuore.classList.add('pop');
    });
  }

  /* ---------- correlati ---------- */
  var corr = AFC_PRODOTTI.filter(function (p) {
    if (p.slug === prod.slug) return false;
    return p.cat.some(function (c) { return prod.cat.indexOf(c) !== -1; });
  }).slice(0, 4);

  if (corr.length) {
    var griglia = document.getElementById('correlati');
    corr.forEach(function (p) {
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
    document.getElementById('correlatiSez').hidden = false;
  }
})();
