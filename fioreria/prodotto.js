/* =============================================================
   ANTICA FIORERIA DEL CENTRO — pagina del singolo prodotto
   Legge ?p=<slug>, mostra descrizione completa e taglie S/M/L/XL.
   La XL contiene il doppio dei fiori della M ma costa il 30% in
   meno del doppio: si mostra il valore pieno barrato.
   ============================================================= */
(function () {
  'use strict';

  var m = location.search.match(/[?&]p=([a-z-]+)/);
  var prod = m ? afcProdotto(m[1]) : null;
  if (!prod) { location.replace('collezione.html'); return; }

  function euro(n) {
    return '€ ' + (Number.isInteger(n) ? n : n.toFixed(2).replace('.', ','));
  }

  /* alcune referenze hanno taglie proprie con prezzo fisso (es. "1 pezzo" /
     "2 pezzi"): in quel caso si usano quelle al posto di S/M/L/XL */
  var listaTaglie = prod.taglie || AFC_TAGLIE;
  // di norma si parte dalla M: se le taglie personalizzate ne hanno più di due
  // (S/M/L/XL) la M è la seconda; se sono solo due (es. "1 pezzo"/"2 pezzi") si
  // parte dalla prima
  var taglia = prod.taglie ? (prod.taglie.length > 2 ? prod.taglie[1] : prod.taglie[0]) : AFC_TAGLIE[1];
  var qty = 1;
  var TAGLIA_UNICA = { id: 'U', nome: 'Unica', fattore: 1, nota: 'Formato unico da collezione' };
  if (prod.tagliaUnica) taglia = TAGLIA_UNICA;

  function prezzoTaglia(t) {
    return t.prezzo != null ? t.prezzo : afcPrezzoTaglia(prod.prezzo, t);
  }
  function prezzoTagliaScontato(t) {
    return afcPrezzoScontato(prezzoTaglia(t), prod);
  }

  /* ---------- riempi la scheda ---------- */
  document.title = prod.nome + ' — Antica Fioreria del Centro';
  document.getElementById('brNome').textContent = prod.nome;
  document.getElementById('pNome').textContent = prod.nome;
  document.getElementById('pDesc').textContent = prod.descLunga;

  /* ---------- SEO: meta tag e dati strutturati per questo prodotto ---------- */
  (function () {
    var urlAssoluta = location.origin + location.pathname + location.search;
    var fotoAssoluta = location.origin + '/' + prod.foto;
    var descBreve = prod.desc || prod.descLunga;

    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', descBreve);

    var mappa = {
      'meta[property="og:title"]': prod.nome + ' — Antica Fioreria del Centro',
      'meta[property="og:description"]': descBreve,
      'meta[property="og:image"]': fotoAssoluta
    };
    Object.keys(mappa).forEach(function (sel) {
      var el = document.querySelector(sel);
      if (el) el.setAttribute('content', mappa[sel]);
    });
    var ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', urlAssoluta);
    else {
      var nuovo = document.createElement('meta');
      nuovo.setAttribute('property', 'og:url');
      nuovo.setAttribute('content', urlAssoluta);
      document.head.appendChild(nuovo);
    }

    var canonica = document.createElement('link');
    canonica.setAttribute('rel', 'canonical');
    canonica.setAttribute('href', urlAssoluta);
    document.head.appendChild(canonica);

    var prezzoBase = afcPrezzoScontato(prod.tagliaUnica ? prod.prezzo : afcPrezzoTaglia(prod.prezzo, AFC_TAGLIE[0]), prod);
    var jsonLd = document.createElement('script');
    jsonLd.type = 'application/ld+json';
    jsonLd.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: prod.nome,
      description: descBreve,
      image: fotoAssoluta,
      brand: { '@type': 'Brand', name: 'Antica Fioreria del Centro' },
      offers: {
        '@type': 'Offer',
        url: urlAssoluta,
        priceCurrency: 'EUR',
        price: prezzoBase,
        availability: 'https://schema.org/InStock'
      }
    });
    document.head.appendChild(jsonLd);
  })();

  /* ---------- galleria foto: una o più immagini, scorrevoli ---------- */
  (function () {
    var elenco = prod.galleria && prod.galleria.length ? prod.galleria : [prod.foto];
    var track = document.getElementById('pfTrack');
    var dotsBox = document.getElementById('pfDots');
    var prevBtn = document.getElementById('pfPrev');
    var nextBtn = document.getElementById('pfNext');

    elenco.forEach(function (src, i) {
      var img = document.createElement('img');
      img.className = 'pf-slide';
      img.src = src;
      img.alt = prod.nome + (elenco.length > 1 ? ' — foto ' + (i + 1) : '');
      img.loading = i === 0 ? 'eager' : 'lazy';
      img.onerror = function () { img.classList.add('no-foto'); };
      track.appendChild(img);
    });

    if (elenco.length <= 1) return;

    var dots = elenco.map(function (_, i) {
      var b = document.createElement('button');
      b.className = 'pf-dot' + (i === 0 ? ' attivo' : '');
      b.setAttribute('aria-label', 'Vai alla foto ' + (i + 1));
      b.addEventListener('click', function () { vaiA(i); });
      dotsBox.appendChild(b);
      return b;
    });
    dotsBox.hidden = false;
    prevBtn.hidden = false;
    nextBtn.hidden = false;

    function indiceCorrente() {
      return Math.round(track.scrollLeft / track.clientWidth);
    }
    function vaiA(i) {
      i = Math.max(0, Math.min(elenco.length - 1, i));
      track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' });
    }
    function aggiornaDots() {
      var i = indiceCorrente();
      dots.forEach(function (d, di) { d.classList.toggle('attivo', di === i); });
    }
    var timerScroll = null;
    track.addEventListener('scroll', function () {
      clearTimeout(timerScroll);
      timerScroll = setTimeout(aggiornaDots, 80);
    });
    prevBtn.addEventListener('click', function () { vaiA(indiceCorrente() - 1); });
    nextBtn.addEventListener('click', function () { vaiA(indiceCorrente() + 1); });
  })();

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

  /* nota fragile: solo per le composizioni con base in ceramica/vetro */
  if (prod.fragile) document.getElementById('pmFragile').hidden = false;

  /* taglia della composizione fotografata (solo dove indicata) */
  if (prod.tagliaFoto) {
    document.getElementById('pTagliaFotoVal').textContent = prod.tagliaFoto;
    document.getElementById('pTagliaFoto').hidden = false;
  }

  /* ---------- taglie ---------- */
  var boxTaglie = document.getElementById('taglie');
  var nota = document.getElementById('tagliaNota');

  function prezzoCorrente() { return prezzoTagliaScontato(taglia); }

  function dipingiPrezzo() {
    var pieno = document.getElementById('pPrezzoPieno');
    var sconto = document.getElementById('pSconto');
    document.getElementById('pPrezzo').textContent = euro(prezzoCorrente() * qty);
    if (prod.sconto) {
      pieno.textContent = euro(prezzoTaglia(taglia) * qty);
      pieno.hidden = false;
      sconto.textContent = 'Saldi estivi −' + prod.sconto + '%';
      sconto.hidden = false;
    } else if (taglia.doppio) {
      pieno.textContent = euro(afcValoreXL(prod.prezzo) * qty);
      pieno.hidden = false;
      sconto.textContent = 'risparmi il 30%';
      sconto.hidden = false;
    } else {
      pieno.hidden = true;
      sconto.hidden = true;
    }
    nota.textContent = taglia.nota + (taglia.doppio ? ' — vale ' + euro(afcValoreXL(prod.prezzo)) + ', lo paghi ' + euro(prezzoCorrente()) + '.' : '');
    document.getElementById('qN').textContent = String(qty);

    var costoSpedizioneAttuale = afcSpedizioneCosto(prod, prod.tagliaUnica ? null : taglia);
    document.getElementById('pmConsegnaTesto').textContent =
      'Spedizione assicurata in 48/72 ore (€ ' + costoSpedizioneAttuale + ') · ritiro gratuito in bottega ad Alessandria';
  }

  if (prod.tagliaUnica) {
    document.querySelector('.taglie-blocco').hidden = true;
  } else {
    if (prod.taglie) boxTaglie.style.gridTemplateColumns = 'repeat(' + listaTaglie.length + ', 1fr)';
    listaTaglie.forEach(function (t) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'taglia-btn' + (t.id === taglia.id ? ' attiva' : '');
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', String(t.id === taglia.id));
      btn.innerHTML = '<strong>' + t.nome + '</strong><span>' + euro(prezzoTagliaScontato(t)) + '</span>' +
        (t.doppio ? '<em class="taglia-badge">−30%</em>' : (prod.sconto ? '<em class="taglia-badge">−' + prod.sconto + '%</em>' : ''));
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
  }

  document.getElementById('qMeno').addEventListener('click', function () { if (qty > 1) { qty -= 1; dipingiPrezzo(); } });
  document.getElementById('qPiu').addEventListener('click', function () { if (qty < 12) { qty += 1; dipingiPrezzo(); } });

  dipingiPrezzo();

  /* ---------- scorte in tempo reale ---------- */
  function mostraScorte(rimasti) {
    var pScorte = document.getElementById('pScorte');
    var pScorteTesto = document.getElementById('pScorteTesto');
    if (rimasti <= 0) {
      var b = document.getElementById('pBadge');
      b.textContent = 'Esaurito';
      b.classList.remove('badge-oro');
      b.classList.add('badge-esaurito');
      b.hidden = false;
      avail.querySelector('span').textContent = 'Al momento esaurito — torna presto';
      avail.classList.add('avail-low');
      document.getElementById('pAggiungi').disabled = true;
      document.getElementById('pCompra').disabled = true;
      pScorte.hidden = true;
    } else {
      pScorteTesto.textContent = rimasti + (rimasti === 1 ? ' pezzo rimasto' : ' pezzi rimasti');
      pScorte.hidden = false;
      pScorte.classList.toggle('prodotto-scorte-poche', rimasti <= 5);
      if (rimasti <= 5) {
        avail.querySelector('span').textContent = 'Ultimi ' + rimasti + ' pezzi disponibili';
        avail.classList.add('avail-low');
      }
    }
  }

  fetch('/api/stock').then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
    if (!d || !d.scorte) return;
    if (Object.prototype.hasOwnProperty.call(d.scorte, prod.slug)) {
      mostraScorte(d.scorte[prod.slug]);
    }
    document.querySelectorAll('#correlati .prod-mini[data-slug]').forEach(function (card) {
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

  /* ---------- carrello ---------- */
  function nomeCompleto() { return prod.tagliaUnica ? prod.nome : prod.nome + ' (' + taglia.nome + ')'; }

  function aggiungi() {
    if (typeof AFC_CART === 'undefined') return;
    var costoSpedizione = afcSpedizioneCosto(prod, prod.tagliaUnica ? null : taglia);
    for (var i = 0; i < qty; i++) AFC_CART.add(nomeCompleto(), prezzoCorrente(), prod.slug, costoSpedizione);
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
      a.setAttribute('data-slug', p.slug);
      var unica = p.tagliaUnica || (p.taglie && p.taglie.length === 1);
      var base = p.taglie ? p.taglie[0].prezzo : (unica ? p.prezzo : afcPrezzoTaglia(p.prezzo, AFC_TAGLIE[0]));
      var finale = afcPrezzoScontato(base, p);
      var prezzoHtml = p.sconto
        ? '<span class="prezzo-blocco"><s class="prod-mini-prezzo-pieno">' + euro(base) + '</s><span class="prod-mini-prezzo">' + (unica ? '' : 'da ') + euro(finale) + '</span></span>'
        : '<span class="prod-mini-prezzo">' + (unica ? '' : 'da ') + euro(base) + '</span>';
      a.innerHTML =
        '<span class="prod-mini-foto">' +
          (p.badge ? '<span class="badge' + (p.badgeOro ? ' badge-oro' : '') + '">' + p.badge + '</span>' : '') +
          '<img src="' + p.foto + '" alt="" loading="lazy" width="700" height="560" onerror="this.classList.add(\'no-foto\')" />' +
        '</span>' +
        '<span class="prod-mini-nome"></span>' +
        '<span class="prod-mini-riga">' +
          prezzoHtml +
          '<span class="prod-mini-scorte" hidden><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2c2 3 4 5.2 4 8.4A4 4 0 1 1 8 10.4C8 7.2 10 5 12 2Z"/></svg><span></span></span>' +
        '</span>' +
        '<span class="prod-mini-stelle" aria-label="Valutazione ' + p.rating[0] + ' su 5">★ ' + p.rating[0] + '</span>';
      a.querySelector('.prod-mini-nome').textContent = p.nome;
      griglia.appendChild(a);
    });
    document.getElementById('correlatiSez').hidden = false;
  }
})();
