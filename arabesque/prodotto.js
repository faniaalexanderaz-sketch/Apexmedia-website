/* =============================================================
   ARABESQUE BUSALLA — scheda prodotto
   Tutto parte da ?p=<slug>. Taglia obbligatoria prima del
   carrello: è la prima causa di reso, non la lasciamo al caso.
   ============================================================= */
(function () {
  'use strict';

  var slug = new URLSearchParams(location.search).get('p');
  var p = slug ? arbProdotto(slug) : null;
  var radice = document.getElementById('pdp');
  if (!radice) return;

  if (!p) {
    radice.innerHTML = '<div class="wrap vuoto"><h1>Capo non trovato</h1>' +
      '<p>Il capo che cerchi non è più online.</p>' +
      '<p style="margin-top:20px"><a class="btn btn-primario" href="donna.html">Torna alla collezione</a></p></div>';
    return;
  }

  document.title = p.nome + ' — Arabesque Busalla';
  var meta = document.querySelector('meta[name=description]');
  if (meta) meta.setAttribute('content', p.descrizione.slice(0, 155));

  var finale = arbPrezzoFinale(p);
  var esaurito = !arbDisponibile(p);
  var scelta = { taglia: '', colore: (p.colori && p.colori[0] ? p.colori[0].nome : '') };

  /* ---------- dati strutturati ---------- */
  var ld = document.createElement('script');
  ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.nome,
    description: p.descrizione,
    brand: { '@type': 'Brand', name: arbBrand() },
    offers: {
      '@type': 'Offer',
      price: finale.toFixed(2),
      priceCurrency: 'EUR',
      availability: esaurito ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition'
    }
  });
  document.head.appendChild(ld);

  /* ---------- galleria ---------- */
  function galleria() {
    var principale = '<div class="pdp-foto-grande">' + ARB.boxFoto(arbFoto(p, 1), p.nome, 'A', p.sottocategoria) + '</div>';
    var mini = [2, 3].map(function (n) {
      return '<div class="pdp-foto-mini">' + ARB.boxFoto(arbFoto(p, n), p.nome + ' — dettaglio ' + n, 'A', '') + '</div>';
    }).join('');
    return '<div class="pdp-galleria">' + principale + '<div class="pdp-mini">' + mini + '</div></div>';
  }

  /* ---------- colonna informazioni ---------- */
  function colonna() {
    var colori = (p.colori || []).map(function (c, i) {
      return '<button type="button" class="colore-chip' + (i === 0 ? ' scelto' : '') + '" data-colore="' + c.nome + '" ' +
        'style="--c:' + c.hex + '" aria-label="Colore ' + c.nome + '"><span></span>' + c.nome + '</button>';
    }).join('');

    var taglie = (p.taglie || []).map(function (t) {
      var basso = t.stock > 0 && t.stock <= 2;
      return '<button type="button" class="taglia-box" data-t="' + t.id + '"' + (t.stock > 0 ? '' : ' disabled') + '>' +
        t.id + (basso ? '<i>ultimi ' + t.stock + '</i>' : '') + '</button>';
    }).join('');

    return '<div class="pdp-info">' +
      '<p class="briciole"><a href="index.html">Home</a> · <a href="' + (p.categoria === 'uomo' ? 'uomo.html' : (p.categoria === 'accessori' ? 'donna.html' : 'donna.html')) + '">' +
        (p.categoria.charAt(0).toUpperCase() + p.categoria.slice(1)) + '</a> · ' + p.nome + '</p>' +
      '<p class="prod-card-brand">' + arbBrand() + '</p>' +
      '<h1>' + p.nome + '</h1>' +
      '<p class="pdp-prezzo">' +
        (p.sconto ? '<span class="prezzo-pieno">' + arbEuro(p.prezzo) + '</span>' : '') +
        '<span class="prezzo-ora' + (p.sconto ? ' in-saldo' : '') + '">' + arbEuro(finale) + '</span>' +
        (p.sconto ? '<span class="pdp-risparmi">risparmi ' + arbEuro(p.prezzo - finale) + '</span>' : '') +
      '</p>' +
      '<p class="pdp-descrizione">' + p.descrizione + '</p>' +

      (colori ? '<div class="pdp-blocco"><p class="pdp-eti stretta">Colore: <b id="coloreScelto">' + scelta.colore + '</b></p>' +
        '<div class="colori-riga">' + colori + '</div></div>' : '') +

      '<div class="pdp-blocco">' +
        '<p class="pdp-eti">Taglia' + (p.tagliaUnica ? '' : ' <button type="button" class="link-taglie" id="apriTaglie">Guida alle taglie</button>') + '</p>' +
        '<div class="taglie-griglia" id="taglieGriglia">' + taglie + '</div>' +
        '<p class="pdp-vestibilita">' + p.vestibilita + '</p>' +
      '</div>' +

      '<div class="pdp-azioni">' +
        (esaurito
          ? '<button class="btn btn-fantasma btn-blocco" id="btnAvvisami">Avvisami quando torna</button>'
          : '<button class="btn btn-primario btn-blocco" id="btnCarrello">Aggiungi al carrello</button>') +
        '<a class="btn btn-fantasma btn-blocco" href="checkout.html?ritiro=1" id="btnRitiro">Ritira gratis in negozio a Busalla</a>' +
      '</div>' +

      '<ul class="pdp-trust">' +
        '<li>Spedizione in 24/48h — gratuita sopra 79 €</li>' +
        '<li>Reso entro 14 giorni, cambio taglia immediato in negozio</li>' +
        '<li>Pagamenti sicuri: carta, PayPal, Apple Pay, contrassegno</li>' +
      '</ul>' +

      '<div class="pdp-accordion">' +
        voce('Materiali e lavaggio', p.materiali + '. Lavaggio secondo l\'etichetta interna: rispettarla è il modo più semplice per far durare il capo.') +
        voce('Spedizione e resi', 'Spedizione in tutta Italia in 24/48 ore lavorative, 6,90 € oppure gratuita sopra 79 €. Ritiro in negozio a Busalla sempre gratuito, pronto entro 24 ore. Reso entro 14 giorni dalla consegna.') +
        voce('Disponibile in negozio', 'Questo capo è nel nostro punto vendita di Busalla, in Via Vittorio Veneto 154. Chiamaci prima di venire se vuoi che te lo teniamo da parte: lo mettiamo da parte per 48 ore.') +
      '</div>' +
    '</div>';
  }

  function voce(titolo, testo) {
    return '<div class="faq-voce">' +
      '<button class="faq-q" aria-expanded="false">' + titolo + '</button>' +
      '<div class="faq-r"><p>' + testo + '</p></div>' +
    '</div>';
  }

  radice.innerHTML = '<div class="wrap pdp">' + galleria() + colonna() + '</div>';

  /* ---------- barra fissa su mobile ---------- */
  var barra = document.createElement('div');
  barra.className = 'pdp-barra';
  barra.innerHTML = '<div><b>' + arbEuro(finale) + '</b><small id="barraTaglia">Scegli la taglia</small></div>' +
    '<button class="btn btn-primario" id="btnCarrelloBarra"' + (esaurito ? ' disabled' : '') + '>Aggiungi</button>';
  document.body.appendChild(barra);

  /* ---------- guida taglie (drawer) ---------- */
  var drawer = document.createElement('aside');
  drawer.className = 'drawer';
  drawer.id = 'drawerTaglie';
  drawer.setAttribute('aria-hidden', 'true');
  drawer.innerHTML = '<div class="drawer-testa"><h2>Guida alle taglie</h2>' +
    '<button class="chiudi" data-chiudi aria-label="Chiudi">×</button></div>' +
    '<div class="drawer-corpo">' +
      '<p style="color:var(--grigio-2);font-size:14.5px">Misura un capo che ti sta bene, appoggiato sul letto, e confronta i centimetri. È più affidabile della taglia scritta in etichetta.</p>' +
      '<div class="tabella-taglie" style="margin-top:20px"><table><thead><tr><th>Taglia</th><th>Torace</th><th>Vita</th></tr></thead><tbody>' +
        '<tr><td>XS</td><td>82 – 86</td><td>62 – 66</td></tr>' +
        '<tr><td>S</td><td>87 – 91</td><td>67 – 71</td></tr>' +
        '<tr><td>M</td><td>92 – 96</td><td>72 – 76</td></tr>' +
        '<tr><td>L</td><td>97 – 101</td><td>77 – 82</td></tr>' +
        '<tr><td>XL</td><td>102 – 110</td><td>83 – 94</td></tr>' +
        '<tr><td>2XL</td><td>111 – 116</td><td>95 – 100</td></tr>' +
        '<tr><td>3XL</td><td>117 – 122</td><td>101 – 106</td></tr>' +
        '<tr><td>4XL</td><td>123 – 128</td><td>107 – 112</td></tr>' +
        '<tr><td>5XL</td><td>129 – 134</td><td>113 – 118</td></tr>' +
        '<tr><td>6XL</td><td>135 – 140</td><td>119 – 124</td></tr>' +
      '</tbody></table><p class="nota-tabella">Valori in centimetri, indicativi. TODO-CLIENTE: tabella reale dei capi trattati.</p></div>' +
      '<a class="btn btn-oro btn-blocco" data-cfg-wa data-cfg-wa-testo="Buongiorno, ho un dubbio sulla taglia di: ' + p.nome + '" href="#" target="_blank" rel="noopener" style="margin-top:22px">Chiedi a noi su WhatsApp</a>' +
    '</div>';
  document.body.appendChild(drawer);

  /* ---------- interazioni ---------- */
  function selezionaTaglia(id) {
    scelta.taglia = id;
    document.querySelectorAll('.taglia-box').forEach(function (b) {
      b.classList.toggle('scelta', b.dataset.t === id);
    });
    var bt = document.getElementById('barraTaglia');
    if (bt) bt.textContent = 'Taglia ' + id;
  }

  radice.addEventListener('click', function (e) {
    var t = e.target.closest('.taglia-box');
    if (t && !t.disabled) { selezionaTaglia(t.dataset.t); return; }
    var c = e.target.closest('.colore-chip');
    if (c) {
      scelta.colore = c.dataset.colore;
      radice.querySelectorAll('.colore-chip').forEach(function (x) { x.classList.remove('scelto'); });
      c.classList.add('scelto');
      var eti = document.getElementById('coloreScelto');
      if (eti) eti.textContent = scelta.colore;
      return;
    }
    if (e.target.id === 'apriTaglie') {
      drawer.classList.add('aperto');
      drawer.setAttribute('aria-hidden', 'false');
      document.getElementById('velo').classList.add('aperto');
      document.body.classList.add('no-scroll');
      return;
    }
  });

  function aggiungi() {
    if (p.tagliaUnica && !scelta.taglia) scelta.taglia = p.taglie[0].id;
    if (!scelta.taglia) {
      ARB.toast('Scegli prima la taglia');
      var g = document.getElementById('taglieGriglia');
      if (g) { g.classList.add('scuoti'); setTimeout(function () { g.classList.remove('scuoti'); }, 500); }
      return;
    }
    ARB.aggiungi(p.slug, scelta.taglia, scelta.colore);
  }
  document.addEventListener('click', function (e) {
    if (e.target.id === 'btnCarrello' || e.target.id === 'btnCarrelloBarra') aggiungi();
    if (e.target.id === 'btnRitiro') {
      if (!scelta.taglia && !p.tagliaUnica) { e.preventDefault(); aggiungi(); return; }
      e.preventDefault();
      if (p.tagliaUnica && !scelta.taglia) scelta.taglia = p.taglie[0].id;
      ARB.aggiungi(p.slug, scelta.taglia, scelta.colore);
      setTimeout(function () { location.href = 'checkout.html?ritiro=1'; }, 500);
    }
    if (e.target.id === 'btnAvvisami') {
      var email = prompt('Lasciaci la tua email: ti avvisiamo appena il capo torna disponibile.');
      if (!email) return;
      fetch('/api/avvisami', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, slug: p.slug })
      }).catch(function () {});
      ARB.toast('Ti avvisiamo appena torna');
    }
  });

  if (p.tagliaUnica) selezionaTaglia(p.taglie[0].id);

  /* ---------- correlati ---------- */
  var completa = ARB_PRODOTTI.filter(function (x) {
    return x.slug !== p.slug && x.categoria === p.categoria && x.sottocategoria !== p.sottocategoria;
  }).slice(0, 4);
  var simili = ARB_PRODOTTI.filter(function (x) {
    return x.slug !== p.slug && x.sottocategoria === p.sottocategoria;
  }).slice(0, 4);

  var sezioni = document.getElementById('pdpCorrelati');
  if (sezioni) {
    sezioni.innerHTML =
      (completa.length ? blocco('Completa il look', completa) : '') +
      (simili.length ? blocco('Ti potrebbe piacere', simili) : '');
    ARB.reveal(sezioni);
  }
  function blocco(titolo, elenco) {
    return '<section class="sez sez-bordo"><div class="wrap">' +
      '<div class="sez-testa reveal"><h2>' + titolo + '</h2></div>' +
      '<div class="prod-griglia">' + elenco.map(function (x) { return ARB.cardProdotto(x); }).join('') + '</div>' +
    '</div></section>';
  }

  ARB.reveal(radice);
})();
