/* =============================================================
   ANTICA FIORERIA DEL CENTRO — catalogo
   1) Filtri categoria (collegati anche allo slider a cerchi)
   2) Scheda prodotto (modale): formato, quantità, correlati
   Riusa il carrello già scritto in main.js via window.AFC_CART,
   non duplica la logica di carrello/checkout.
   ============================================================= */
(function () {
  'use strict';

  var grid = document.getElementById('catalogoGrid');
  if (!grid) return; // pagina senza catalogo (es. account.html)

  var card = Array.prototype.slice.call(grid.querySelectorAll('.card.prod'));
  var vuoto = document.getElementById('catalogoVuoto');

  /* =============================================================
     1) FILTRI
     ============================================================= */
  var filtri = Array.prototype.slice.call(document.querySelectorAll('.filtro'));
  var attivo = 'tutti';

  function applica(slug) {
    attivo = slug;
    var visibili = 0;
    card.forEach(function (c) {
      var cat = (c.getAttribute('data-cat') || '').split(/\s+/);
      var mostra = slug === 'tutti' || cat.indexOf(slug) !== -1;
      c.style.display = mostra ? '' : 'none';
      if (mostra) visibili += 1;
    });
    if (vuoto) vuoto.hidden = visibili > 0;
    filtri.forEach(function (f) {
      var on = f.getAttribute('data-filtro') === slug;
      f.classList.toggle('attivo', on);
      f.setAttribute('aria-pressed', String(on));
    });
  }

  filtri.forEach(function (f) {
    f.addEventListener('click', function () { applica(f.getAttribute('data-filtro')); });
  });

  /* i cerchi delle categorie in alto applicano lo stesso filtro
     prima di scorrere a #shop — slider intoccato, solo un listener in più */
  document.querySelectorAll('.cat-item[data-cat]').forEach(function (el) {
    el.addEventListener('click', function () {
      applica(el.getAttribute('data-cat'));
    });
  });

  /* le card "Scegli per occasione" filtrano allo stesso modo */
  document.querySelectorAll('.occ-card[data-occ]').forEach(function (el) {
    el.addEventListener('click', function () {
      applica(el.getAttribute('data-occ'));
    });
  });

  /* le voci del menu hamburger filtrano allo stesso modo */
  document.querySelectorAll('.menu-voce[data-menu-cat]').forEach(function (el) {
    el.addEventListener('click', function () {
      applica(el.getAttribute('data-menu-cat'));
    });
  });

  /* nastro recensioni: duplica le card per il loop continuo (i cloni
     sono decorativi, nascosti agli screen reader) */
  (function () {
    var track = document.querySelector('.rec-track');
    if (!track || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var originali = Array.prototype.slice.call(track.children);
    originali.forEach(function (c) {
      var clone = c.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
  })();

  /* =============================================================
     2) SCHEDA PRODOTTO — modale
     ============================================================= */
  var scrim = document.getElementById('prodottoScrim');
  var modale = document.getElementById('prodottoModale');
  if (!scrim || !modale) return;

  var elFoto = document.getElementById('pmFoto');
  var elBadge = document.getElementById('pmBadge');
  var elNome = document.getElementById('pmNome');
  var elRating = document.getElementById('pmRating');
  var elPrezzo = document.getElementById('pmPrezzo');
  var elDesc = document.getElementById('pmDesc');
  var elFormato = document.getElementById('pmFormato');
  var elQty = document.getElementById('pmQty');
  var btnMeno = document.getElementById('pmMeno');
  var btnPiu = document.getElementById('pmPiu');
  var btnCompra = document.getElementById('pmCompra');
  var btnAggiungi = document.getElementById('pmAggiungi');
  var corrBox = document.getElementById('pmCorrelatiBox');
  var corrLista = document.getElementById('pmCorrelati');
  var chiudi = document.getElementById('prodottoChiudi');

  var corrente = null;  // { card, nome, prezzoBase, cat }
  var formato = 'standard';
  var qty = 1;

  function euro(n) {
    return '€ ' + (Number.isInteger(n) ? n : n.toFixed(2).replace('.', ','));
  }

  function prezzoEffettivo() {
    if (!corrente) return 0;
    return formato === 'grande' ? Math.round(corrente.prezzoBase * 1.3) : corrente.prezzoBase;
  }

  function nomeEffettivo() {
    if (!corrente) return '';
    return formato === 'grande' ? corrente.nome + ' (Grande)' : corrente.nome;
  }

  function correlati(c) {
    var cat = (c.getAttribute('data-cat') || '').split(/\s+/);
    return card.filter(function (altro) {
      if (altro === c) return false;
      var altroCat = (altro.getAttribute('data-cat') || '').split(/\s+/);
      return altroCat.some(function (x) { return cat.indexOf(x) !== -1; });
    }).slice(0, 3);
  }

  function apri(c) {
    var foto = c.querySelector('.card-photo img');
    var badge = c.querySelector('.badge');
    var rating = c.querySelector('.rating');
    var desc = c.querySelector('.card-desc');

    corrente = {
      card: c,
      nome: c.getAttribute('data-nome'),
      prezzoBase: parseInt(c.getAttribute('data-prezzo'), 10)
    };
    formato = 'standard';
    qty = 1;

    elFoto.src = foto ? foto.src : '';
    elFoto.alt = foto ? foto.alt : '';
    if (badge) { elBadge.textContent = badge.textContent; elBadge.hidden = false; }
    else { elBadge.hidden = true; }
    elNome.textContent = corrente.nome;
    if (rating) { elRating.innerHTML = rating.innerHTML; elRating.hidden = false; }
    else { elRating.hidden = true; }
    elDesc.textContent = desc ? desc.textContent : '';

    elFormato.querySelectorAll('.seg-btn').forEach(function (b) {
      var on = b.getAttribute('data-formato') === 'standard';
      b.classList.toggle('attivo', on);
      b.setAttribute('aria-pressed', String(on));
    });
    elQty.textContent = '1';

    var elenco = correlati(c);
    corrLista.innerHTML = '';
    elenco.forEach(function (altro) {
      var f = altro.querySelector('.card-photo img');
      var p = altro.getAttribute('data-prezzo');
      var a = document.createElement('button');
      a.type = 'button';
      a.className = 'pm-corr-item';
      a.innerHTML =
        '<span class="pm-corr-foto"><img src="' + (f ? f.src : '') + '" alt="" /></span>' +
        '<span class="pm-corr-nome"></span><span class="pm-corr-prezzo">€ ' + p + '</span>';
      a.querySelector('.pm-corr-nome').textContent = altro.getAttribute('data-nome');
      a.addEventListener('click', function () { apri(altro); });
      corrLista.appendChild(a);
    });
    corrBox.hidden = elenco.length === 0;

    aggiorna();

    modale.hidden = false; scrim.hidden = false;
    document.body.style.overflow = 'hidden';
    chiudi.focus();
  }

  function chiudiModale() {
    modale.hidden = true; scrim.hidden = true;
    document.body.style.overflow = '';
  }

  function aggiorna() {
    elPrezzo.textContent = euro(prezzoEffettivo());
    elQty.textContent = String(qty);
  }

  elFormato.querySelectorAll('.seg-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      formato = b.getAttribute('data-formato');
      elFormato.querySelectorAll('.seg-btn').forEach(function (x) {
        var on = x === b;
        x.classList.toggle('attivo', on);
        x.setAttribute('aria-pressed', String(on));
      });
      aggiorna();
    });
  });

  btnMeno.addEventListener('click', function () { if (qty > 1) { qty -= 1; aggiorna(); } });
  btnPiu.addEventListener('click', function () { if (qty < 12) { qty += 1; aggiorna(); } });

  btnAggiungi.addEventListener('click', function () {
    if (!corrente || typeof AFC_CART === 'undefined') return;
    var nome = nomeEffettivo(), prezzo = prezzoEffettivo();
    for (var i = 0; i < qty; i++) AFC_CART.add(nome, prezzo);
    chiudiModale();
  });
  btnCompra.addEventListener('click', function () {
    if (!corrente || typeof AFC_CART === 'undefined') return;
    var nome = nomeEffettivo(), prezzo = prezzoEffettivo();
    for (var i = 0; i < qty; i++) AFC_CART.add(nome, prezzo);
    AFC_CART.openCart();
    chiudiModale();
  });

  card.forEach(function (c) {
    var btn = c.querySelector('.dettagli');
    var foto = c.querySelector('.card-photo');
    if (btn) btn.addEventListener('click', function () { apri(c); });
    if (foto) foto.addEventListener('click', function (e) {
      if (e.target.closest('.heart')) return; // non aprire cliccando sul cuore preferiti
      apri(c);
    });
  });

  chiudi.addEventListener('click', chiudiModale);
  scrim.addEventListener('click', chiudiModale);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modale.hidden) chiudiModale();
  });
})();
