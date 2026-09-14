/* =============================================================
   ARABESQUE BUSALLA — scheda capo
   Ogni elemento qui dentro toglie un dubbio: quando arriva, come
   veste, cosa succede se sbaglio taglia, posso provarlo in negozio.
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
      '<p style="margin-top:22px"><a class="btn btn-primario btn-senza-icona" href="donna.html">Torna alla collezione</a></p></div>';
    return;
  }

  document.title = p.nome + ' — Arabesque Busalla';
  var meta = document.querySelector('meta[name=description]');
  if (meta) meta.setAttribute('content', p.descrizione.slice(0, 155));

  var finale = arbPrezzoFinale(p);
  var esaurito = !arbDisponibile(p);
  var pochi = ARB.scorteBasse(p);
  var scelta = { taglia: '', colore: (p.colori && p.colori[0] ? p.colori[0].nome : ''), foto: 1 };
  var cons = ARB.consegna();

  /* ---------- dati strutturati ---------- */
  var ld = document.createElement('script');
  ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Product',
    name: p.nome, description: p.descrizione, sku: p.slug,
    brand: { '@type': 'Brand', name: arbBrand() },
    material: p.materiali,
    offers: {
      '@type': 'Offer', price: finale.toFixed(2), priceCurrency: 'EUR',
      availability: esaurito ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', value: ARB_SPEDIZIONE.costo, currency: 'EUR' },
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'IT' }
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy', applicableCountry: 'IT',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 14
      }
    }
  });
  document.head.appendChild(ld);
  ARB.evento('view_item', { currency: 'EUR', value: finale, items: [{ item_id: p.slug, item_name: p.nome, price: finale }] });

  /* ---------- galleria: miniature + zoom ---------- */
  function galleria() {
    var mini = [1, 2, 3, 4].map(function (n) {
      return '<button type="button" class="pdp-mini-b' + (n === 1 ? ' scelta' : '') + '" data-foto="' + n + '" aria-label="Foto ' + n + '">' +
        ARB.boxFoto(arbFoto(p, n), p.nome + ' — foto ' + n, 'A', '') + '</button>';
    }).join('');
    return '<div class="pdp-galleria">' +
      '<div class="pdp-miniature">' + mini + '</div>' +
      '<div class="pdp-grande" id="pdpGrande">' + ARB.boxFoto(arbFoto(p, 1), p.nome, 'A', p.sottocategoria) + '</div>' +
    '</div>';
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

    var categoria = p.categoria === 'uomo' ? 'uomo.html' : 'donna.html';

    return '<div class="pdp-info">' +
      '<p class="briciole"><a href="index.html">Home</a> · <a href="' + categoria + '">' +
        p.categoria.charAt(0).toUpperCase() + p.categoria.slice(1) + '</a> · <a href="' + categoria + '?sotto=' + p.sottocategoria + '">' +
        p.sottocategoria + '</a></p>' +
      '<p class="capo-casa">' + arbBrand() + '</p>' +
      '<h1>' + p.nome + '</h1>' +
      '<p class="pdp-prezzo">' +
        (p.sconto ? '<span class="prezzo-vecchio">' + arbEuro(p.prezzo) + '</span>' : '') +
        '<span class="prezzo-ora' + (p.sconto ? ' saldo' : '') + '">' + arbEuro(finale) + '</span>' +
        (p.sconto ? '<span class="tag saldo">risparmi ' + arbEuro(p.prezzo - finale) + '</span>' : '') +
      '</p>' +
      '<p class="pdp-iva">IVA inclusa · spedizione calcolata alla cassa</p>' +
      (pochi ? '<p class="capo-pochi" style="margin:0 0 18px">Ne restano ' + pochi + ' in tutto</p>' : '') +
      '<p class="pdp-descrizione">' + p.descrizione + '</p>' +

      (colori ? '<div class="pdp-blocco"><p class="pdp-eti stretta">Colore: <b id="coloreScelto">' + scelta.colore + '</b></p>' +
        '<div class="colori-riga">' + colori + '</div></div>' : '') +

      '<div class="pdp-blocco">' +
        '<p class="pdp-eti">Taglia' + (p.tagliaUnica ? '' : ' <button type="button" class="link-taglie" id="apriTaglie">Guida alle taglie</button>') + '</p>' +
        '<div class="taglie-griglia" id="taglieGriglia">' + taglie + '</div>' +
        '<p class="pdp-vestibilita">Vestibilità: ' + p.vestibilita + '</p>' +
      '</div>' +

      /* il riquadro che risponde a "quando mi arriva" */
      '<div class="consegna-box">' +
        '<div class="consegna-riga">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 7h13v10H3zM16 10h3.5L21 13v4h-5z"/><circle cx="7" cy="18" r="1.5"/><circle cx="17.5" cy="18" r="1.5"/></svg>' +
          '<div><b>A casa tua ' + cons.testoCorriere + '</b>' +
          (cons.inTempo ? '<small><em>Ordina entro le 15:00</em> e parte oggi stesso</small>' : '<small>Ordina ora: parte il prossimo giorno lavorativo</small>') + '</div>' +
        '</div>' +
        '<div class="consegna-riga">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 21s-7-5.3-7-11a7 7 0 1 1 14 0c0 5.7-7 11-7 11z"/><circle cx="12" cy="10" r="2.6"/></svg>' +
          '<div><b>Ritiro gratuito a Busalla, ' + cons.testoRitiro + '</b><small>Provi il capo in negozio e cambi taglia sul momento</small></div>' +
        '</div>' +
      '</div>' +

      '<div class="pdp-azioni">' +
        (esaurito
          ? '<button class="btn btn-filo btn-blocco btn-grande" id="btnAvvisami">Avvisami quando torna</button>'
          : '<button class="btn btn-primario btn-blocco btn-grande" id="btnCarrello">Aggiungi al carrello' +
            '<span class="cerchio"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></button>') +
        '<button class="btn btn-filo btn-blocco" id="btnPrenota">Prenotalo in negozio — te lo teniamo 48h</button>' +
      '</div>' +

      '<ul class="pdp-trust">' +
        '<li>Reso entro 14 giorni, cambio taglia immediato in negozio</li>' +
        '<li>Pagamenti sicuri: carta, PayPal, Apple Pay, contrassegno</li>' +
        '<li>Assistenza da persone vere, dal negozio di Busalla</li>' +
      '</ul>' +

      '<div class="pdp-accordion">' +
        voce('Materiali e lavaggio', p.materiali + '. Segui l\'etichetta interna: è il modo più semplice per far durare il capo.') +
        voce('Spedizione e resi', 'Spedizione in tutta Italia in 24/48 ore lavorative, ' + arbEuro(ARB_SPEDIZIONE.costo) + ' oppure gratuita sopra ' + arbEuro(ARB_SPEDIZIONE.soglia) + '. Ritiro in negozio sempre gratuito. Reso entro 14 giorni dalla consegna.') +
        voce('Disponibile in negozio', 'Questo capo è nel punto vendita di Busalla, in Via Vittorio Veneto 154. Prenotalo qui sopra e te lo teniamo da parte 48 ore, senza impegno.') +
      '</div>' +
    '</div>';
  }
  function voce(titolo, testo) {
    return '<div class="faq-voce"><button class="faq-q" aria-expanded="false">' + titolo + '</button>' +
      '<div class="faq-r"><p>' + testo + '</p></div></div>';
  }

  radice.innerHTML = '<div class="wrap pdp">' + galleria() + colonna() + '</div>';

  /* ---------- barra fissa su telefono ---------- */
  var barra = document.createElement('div');
  barra.className = 'pdp-barra';
  barra.innerHTML =
    '<div class="pdp-barra-info">' +
      '<div class="pdp-barra-foto">' + ARB.boxFoto(arbFoto(p, 1), p.nome, 'A', '') + '</div>' +
      '<div><b>' + arbEuro(finale) + '</b><small id="barraTaglia">Scegli la taglia</small></div>' +
    '</div>' +
    '<button class="btn btn-primario btn-senza-icona" id="btnCarrelloBarra"' + (esaurito ? ' disabled' : '') + '>Aggiungi</button>';
  document.body.appendChild(barra);

  /* ---------- guida taglie ---------- */
  var drawer = document.createElement('aside');
  drawer.className = 'cassetto';
  drawer.id = 'cassettoTaglie';
  drawer.setAttribute('aria-hidden', 'true');
  drawer.innerHTML = '<div class="cassetto-testa"><h2>Guida alle taglie</h2>' +
    '<button class="chiudi" data-chiudi aria-label="Chiudi">×</button></div>' +
    '<div class="cassetto-corpo">' +
      '<p style="color:var(--grafite);font-size:15px">Misura un capo che ti sta bene, appoggiato sul letto, e confronta i centimetri. È più affidabile della taglia scritta in etichetta.</p>' +
      '<p style="margin-top:14px;font-size:15px"><b>Questo capo:</b> ' + p.vestibilita + '</p>' +
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
      '<a class="btn btn-primario btn-blocco" data-cfg-wa data-cfg-wa-testo="Buongiorno, ho un dubbio sulla taglia di: ' + p.nome + '" href="#" target="_blank" rel="noopener" style="margin-top:22px">Chiedi a noi su WhatsApp</a>' +
    '</div>';
  document.body.appendChild(drawer);
  ARB.config();

  /* ---------- interazioni ---------- */
  function selezionaTaglia(id) {
    scelta.taglia = id;
    document.querySelectorAll('.taglia-box').forEach(function (b) { b.classList.toggle('scelta', b.dataset.t === id); });
    var bt = document.getElementById('barraTaglia');
    if (bt) bt.textContent = 'Taglia ' + id;
    ARB.evento('select_size', { item_id: p.slug, size: id });
  }
  function mostraFoto(n) {
    scelta.foto = n;
    var g = document.getElementById('pdpGrande');
    g.innerHTML = ARB.boxFoto(arbFoto(p, n), p.nome + ' — foto ' + n, 'A', p.sottocategoria);
    document.querySelectorAll('.pdp-mini-b').forEach(function (b) { b.classList.toggle('scelta', +b.dataset.foto === n); });
  }

  radice.addEventListener('click', function (e) {
    var t = e.target.closest('.taglia-box');
    if (t && !t.disabled) { selezionaTaglia(t.dataset.t); return; }
    var m = e.target.closest('.pdp-mini-b');
    if (m) { mostraFoto(+m.dataset.foto); return; }
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
      ARB.evento('size_guide_open', { item_id: p.slug });
      return;
    }
  });

  /* zoom sulla foto grande */
  var grande = document.getElementById('pdpGrande');
  if (grande) {
    grande.addEventListener('click', function () { grande.classList.toggle('zoom'); });
    grande.addEventListener('pointermove', function (e) {
      if (!grande.classList.contains('zoom')) return;
      var r = grande.getBoundingClientRect();
      var img = grande.querySelector('img');
      if (img) img.style.transformOrigin = ((e.clientX - r.left) / r.width * 100) + '% ' + ((e.clientY - r.top) / r.height * 100) + '%';
    });
    grande.addEventListener('pointerleave', function () { grande.classList.remove('zoom'); });
  }

  function aggiungi() {
    if (p.tagliaUnica && !scelta.taglia) scelta.taglia = p.taglie[0].id;
    if (!scelta.taglia) {
      ARB.avviso('Scegli prima la taglia');
      var g = document.getElementById('taglieGriglia');
      if (g) { g.classList.add('scuoti'); setTimeout(function () { g.classList.remove('scuoti'); }, 520); }
      return false;
    }
    ARB.aggiungi(p.slug, scelta.taglia, scelta.colore);
    return true;
  }

  document.addEventListener('click', function (e) {
    if (e.target.id === 'btnCarrello' || e.target.id === 'btnCarrelloBarra') aggiungi();

    if (e.target.id === 'btnPrenota') {
      if (!scelta.taglia && !p.tagliaUnica) { ARB.avviso('Scegli prima la taglia da provare'); return; }
      var email = prompt('Lasciaci la tua email: ti scriviamo quando il capo è pronto in negozio (lo teniamo 48 ore).');
      if (!email) return;
      fetch('/api/prenota-negozio', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, slug: p.slug, nome: p.nome, taglia: scelta.taglia || 'unica', colore: scelta.colore })
      }).catch(function () {});
      ARB.evento('pickup_selected', { item_id: p.slug });
      ARB.avviso('Prenotato: ti scriviamo appena è pronto');
    }

    if (e.target.id === 'btnAvvisami') {
      var mail = prompt('Lasciaci la tua email: ti avvisiamo appena il capo torna disponibile.');
      if (!mail) return;
      fetch('/api/avvisami', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: mail, slug: p.slug })
      }).catch(function () {});
      ARB.evento('back_in_stock_request', { item_id: p.slug });
      ARB.avviso('Ti avvisiamo appena torna');
    }
  });

  if (p.tagliaUnica) selezionaTaglia(p.taglie[0].id);


  /* ---------- 5 — il racconto del capo, a scorrimento agganciato ----------
     Tre fermate: il tessuto, come veste, come portarlo. La scena resta
     ferma e cambia mentre il testo scorre: lo scroll diventa il
     telecomando della storia. La silhouette che si allarga dalla XS alla
     6XL è la dimostrazione visiva del posizionamento del negozio. */
  var abbinamenti = ARB_PRODOTTI.filter(function (x) {
    return x.slug !== p.slug && x.categoria === p.categoria && x.sottocategoria !== p.sottocategoria;
  }).slice(0, 3);

  /* La sagoma non è disegnata a mano: è generata dalle misure, così le
     tre taglie restano matematicamente coerenti fra loro. s = mezza
     spalla, h = mezzo fondo, m = larghezza manica. È un cappotto
     stilizzato, non un corpo: racconta il capo, non chi lo indossa. */
  function sagoma(s, h, m) {
    var c = 100;                       /* asse centrale */
    return [
      'M', c - s, 44,                  /* spalla sinistra */
      'L', c - s - m, 62,              /* attacco manica */
      'L', c - s - m - 2, 148,         /* polso */
      'L', c - s - m + 12, 150,
      'L', c - s + 4, 74,              /* rientro sotto l'ascella */
      'L', c - h, 196,                 /* fianco fino al fondo */
      'L', c + h, 196,                 /* fondo */
      'L', c + s - 4, 74,
      'L', c + s + m - 12, 150,
      'L', c + s + m + 2, 148,
      'L', c + s + m, 62,
      'L', c + s, 44,                  /* spalla destra */
      'L', c + 13, 50,                 /* revers destro */
      'L', c, 72,                      /* incrocio del doppiopetto */
      'L', c - 13, 50,                 /* revers sinistro */
      'Z'
    ].join(' ');
  }
  var SAGOME = {
    xs:  sagoma(26, 30, 11),
    m:   sagoma(31, 37, 13),
    xxl: sagoma(38, 50, 16)
  };
  function silhouette(id, d, opacita) {
    return '<path id="' + id + '" d="' + d + '" fill="currentColor" fill-opacity=".14" ' +
           'stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" opacity="' + opacita + '"/>';
  }

  var racconto = document.createElement('section');
  racconto.className = 'sez racconto crema';
  racconto.innerHTML = '<div class="wrap racconto-in">' +
    '<div class="racconto-scena">' +
      '<div class="scena-strato viva" data-scena="0">' +
        '<svg viewBox="0 0 200 200" width="70%" aria-hidden="true">' +
          '<defs><pattern id="trama" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">' +
            '<rect width="14" height="14" fill="none"/>' +
            '<path d="M0 7h14M7 0v14" stroke="currentColor" stroke-width="1.1" opacity=".38"/>' +
          '</pattern></defs>' +
          '<rect x="10" y="10" width="180" height="180" rx="14" fill="url(#trama)" color="var(--accento)"/>' +
          '<rect x="10" y="10" width="180" height="180" rx="14" fill="none" stroke="var(--filo-2)"/>' +
        '</svg>' +
        '<p class="scena-eti">' + p.materiali + '</p>' +
      '</div>' +
      '<div class="scena-strato" data-scena="1">' +
        '<svg class="silhouette" viewBox="0 0 200 220" aria-hidden="true" style="color:var(--accento)">' +
          silhouette('sagXS', SAGOME.xs, '1') +
          silhouette('sagM', SAGOME.m, '0') +
          silhouette('sagXXL', SAGOME.xxl, '0') +
        '</svg>' +
        '<p class="scena-eti" id="scenaTaglia">XS</p>' +
      '</div>' +
      '<div class="scena-strato" data-scena="2">' +
        '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;width:82%">' +
          abbinamenti.map(function (x) {
            return '<a href="prodotto.html?p=' + x.slug + '" style="border-radius:12px;overflow:hidden;aspect-ratio:3/4;border:1px solid var(--filo);display:block">' +
              ARB.boxFoto(arbFoto(x, 1), x.nome, ARB.segnoDi(x).m, '', ARB.segnoDi(x).v) + '</a>';
          }).join('') +
        '</div>' +
        '<p class="scena-eti">Tre abbinamenti che facciamo in negozio</p>' +
      '</div>' +
    '</div>' +
    '<div class="racconto-fermate">' +
      '<div class="fermata viva" data-fermata="0"><span class="num">01 — Il tessuto</span>' +
        '<h3>' + p.materiali.split(',')[0] + '</h3>' +
        '<p>' + p.materiali + '. Lo scegliamo toccandolo, non leggendo una scheda: è la parte del lavoro che non si vede da una foto.</p></div>' +
      '<div class="fermata" data-fermata="1"><span class="num">02 — Come veste</span>' +
        '<h3>' + p.vestibilita.split('—')[0].trim() + '</h3>' +
        '<p>Dalla XS alla 6XL cambia il taglio, non solo la misura: spalle, fianchi e maniche sono disegnati per ogni corporatura. Scorri e guarda come cambia.</p></div>' +
      '<div class="fermata" data-fermata="2"><span class="num">03 — Come portarlo</span>' +
        '<h3>Tre modi, uno per occasione</h3>' +
        '<p>Gli stessi abbinamenti che proponiamo in camerino. Toccali per vedere il capo intero.</p></div>' +
    '</div>' +
  '</div>';



  /* ---------- correlati ---------- */
  var completa = ARB_PRODOTTI.filter(function (x) {
    return x.slug !== p.slug && x.categoria === p.categoria && x.sottocategoria !== p.sottocategoria;
  }).slice(0, 4);
  var simili = ARB_PRODOTTI.filter(function (x) { return x.slug !== p.slug && x.sottocategoria === p.sottocategoria; }).slice(0, 4);

  var sezioni = document.getElementById('pdpCorrelati');
  if (sezioni) {
    sezioni.innerHTML =
      (completa.length ? blocco('Completa il look', completa, 'crema') : '') +
      (simili.length ? blocco('Ti potrebbe piacere', simili, '') : '');
    ARB.riaggancia(sezioni);
  }

  var contenitore = document.getElementById('pdpCorrelati');
  if (contenitore && abbinamenti.length === 3) {
    contenitore.appendChild(racconto);
    var scene = racconto.querySelectorAll('.scena-strato');
    var fermate = racconto.querySelectorAll('.fermata');
    var sagome = { 0: 'sagXS', 1: 'sagM', 2: 'sagXXL' };
    if ('IntersectionObserver' in window) {
      /* la fermata al centro dello schermo comanda la scena */
      var occhio = new IntersectionObserver(function (voci) {
        voci.forEach(function (v) {
          if (!v.isIntersecting) return;
          var n = +v.target.dataset.fermata;
          fermate.forEach(function (f) { f.classList.toggle('viva', +f.dataset.fermata === n); });
          scene.forEach(function (sc) { sc.classList.toggle('viva', +sc.dataset.scena === n); });
        });
      }, { rootMargin: '-45% 0px -45% 0px' });
      fermate.forEach(function (f) { occhio.observe(f); });

      /* dentro la seconda fermata la sagoma cresce dalla XS alla 6XL */
      var eti = racconto.querySelector('#scenaTaglia');
      var nomi = ['XS', 'M', '6XL'];
      var idSagome = ['sagXS', 'sagM', 'sagXXL'];
      var attesa = null;
      window.addEventListener('scroll', function () {
        if (attesa) return;
        attesa = requestAnimationFrame(function () {
          attesa = null;
          var f = racconto.querySelector('[data-fermata="1"]');
          if (!f || !f.classList.contains('viva')) return;
          var r = f.getBoundingClientRect();
          var quanto = Math.min(1, Math.max(0, (window.innerHeight / 2 - r.top) / Math.max(1, r.height)));
          var indice = quanto < 0.34 ? 0 : (quanto < 0.67 ? 1 : 2);
          idSagome.forEach(function (id, i) {
            var el = racconto.querySelector('#' + id);
            if (el) el.setAttribute('opacity', i === indice ? '1' : '0');
          });
          if (eti) eti.textContent = nomi[indice];
        });
      }, { passive: true });
    }
  }

  function blocco(titolo, elenco, classe) {
    return '<section class="sez-stretta ' + classe + '"><div class="wrap">' +
      '<div class="sez-testa entra" style="margin-bottom:28px"><h2>' + titolo + '</h2></div>' +
      '<div class="griglia-capi">' + elenco.map(function (x) { return ARB.cardProdotto(x); }).join('') + '</div>' +
    '</div></section>';
  }

  ARB.riaggancia(radice);
})();
