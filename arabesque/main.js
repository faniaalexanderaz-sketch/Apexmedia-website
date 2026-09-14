/* =============================================================
   ARABESQUE BUSALLA — regia comune
   Testata, mega menu, ricerca istantanea, carrello, schede capo,
   stima di consegna, tracciamento con consenso.
   Nessuna libreria esterna.
   ============================================================= */
(function () {
  'use strict';

  var LS_CART = 'arb-cart';
  var LS_WISH = 'arb-wish';
  var LS_COUPON = 'arb-coupon';
  var LS_FILTRI = 'arb-filtri';
  var COUPONS = { BENVENUTO10: 10, BUSALLA15: 15 };
  var ridotto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =============================================================
     TRACCIAMENTO — niente parte prima del consenso
     ============================================================= */
  window.dataLayer = window.dataLayer || [];
  function evento(nome, dati) {
    var payload = dati || {};
    window.dataLayer.push(Object.assign({ event: nome }, payload));
    if (window.ARB_CONSENSO) {
      if (typeof gtag === 'function') gtag('event', nome, payload);
      if (typeof fbq === 'function') fbq('trackCustom', nome, payload);
    }
    /* conteggio interno, sempre anonimo, per il pannello del negozio */
    if (['add_to_cart', 'begin_checkout', 'purchase', 'search_performed', 'whatsapp_click', 'size_guide_open', 'pickup_selected', 'back_in_stock_request'].indexOf(nome) !== -1) {
      try {
        fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ percorso: location.pathname, evento: nome, valore: payload.value || null }) }).catch(function () {});
      } catch (e) {}
    }
  }
  try {
    fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ percorso: location.pathname, evento: 'page_view' }) }).catch(function () {});
  } catch (e) {}

  /* =============================================================
     STIMA DI CONSEGNA — la domanda numero uno prima di comprare
     Ordini entro le 15:00 nei giorni feriali → parte oggi.
     ============================================================= */
  var FESTIVI = ['01-01','01-06','04-25','05-01','06-02','08-15','11-01','12-08','12-25','12-26'];
  function feriale(d) {
    var g = d.getDay();
    if (g === 0 || g === 6) return false;
    var mm = String(d.getMonth() + 1).padStart(2, '0');
    var gg = String(d.getDate()).padStart(2, '0');
    return FESTIVI.indexOf(mm + '-' + gg) === -1;
  }
  function aggiungiGiorniLavorativi(da, n) {
    var d = new Date(da.getTime());
    while (n > 0) { d.setDate(d.getDate() + 1); if (feriale(d)) n--; }
    return d;
  }
  var GIORNI = ['domenica','lunedì','martedì','mercoledì','giovedì','venerdì','sabato'];
  var MESI = ['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'];
  function dataLunga(d) { return GIORNI[d.getDay()] + ' ' + d.getDate() + ' ' + MESI[d.getMonth()]; }

  function stimaConsegna() {
    var ora = new Date();
    var inTempo = feriale(ora) && ora.getHours() < 15;
    var partenza = inTempo ? ora : aggiungiGiorniLavorativi(ora, 1);
    return {
      inTempo: inTempo,
      corriere: { da: aggiungiGiorniLavorativi(partenza, 1), a: aggiungiGiorniLavorativi(partenza, 2) },
      ritiro: aggiungiGiorniLavorativi(partenza, 1),
      testoCorriere: 'tra ' + dataLunga(aggiungiGiorniLavorativi(partenza, 1)) + ' e ' + dataLunga(aggiungiGiorniLavorativi(partenza, 2)),
      testoRitiro: dataLunga(aggiungiGiorniLavorativi(partenza, 1)),
      oreRestanti: inTempo ? (15 - ora.getHours()) : 0
    };
  }

  /* =============================================================
     AVVISI ED ENTRATE IN SCENA
     ============================================================= */
  var elAvviso = null, timerAvviso = null;
  function avviso(msg) {
    if (!elAvviso) {
      elAvviso = document.createElement('div');
      elAvviso.className = 'avviso';
      elAvviso.setAttribute('role', 'status');
      document.body.appendChild(elAvviso);
    }
    elAvviso.textContent = msg;
    elAvviso.hidden = false;
    clearTimeout(timerAvviso);
    timerAvviso = setTimeout(function () { elAvviso.hidden = true; }, 2800);
  }

  function osserva(radice) {
    var nodi = (radice || document).querySelectorAll('.entra:not(.dentro)');
    if (!nodi.length) return;
    if (ridotto || !('IntersectionObserver' in window)) {
      nodi.forEach(function (n) { n.classList.add('dentro'); });
      return;
    }
    var io = new IntersectionObserver(function (voci) {
      voci.forEach(function (v) { if (v.isIntersecting) { v.target.classList.add('dentro'); io.unobserve(v.target); } });
    }, { rootMargin: '0px 0px -5% 0px', threshold: .05 });
    nodi.forEach(function (n) { io.observe(n); });
  }

  /* =============================================================
     FOTO E SCHEDA CAPO
     ============================================================= */
  /* la composizione del riquadro cambia per categoria: finché mancano
     le foto vere il catalogo non sembra una fila di caselle uguali */
  var SEGNI = {
    donna:     { m: 'A',        v: 'v-donna' },
    uomo:      { m: 'AB',       v: 'v-uomo' },
    curvy:     { m: 'XS→6XL',   v: 'v-curvy' },
    accessori: { m: '✦',        v: 'v-accessori' }
  };
  function segnoDi(p) {
    if (!p) return SEGNI.donna;
    if ((p.linea || []).indexOf('curvy') !== -1) return SEGNI.curvy;
    return SEGNI[p.categoria] || SEGNI.donna;
  }

  function boxFoto(src, alt, monogramma, etichetta, classe) {
    return '<span class="foto ' + (classe || '') + '">' +
      '<span class="foto-vuota ' + (classe && classe.indexOf('v-') === 0 ? classe : '') + '" aria-hidden="true">' +
        '<span class="foto-vuota-m">' + (monogramma || 'A') + '</span>' +
        '<span class="foto-vuota-t">' + (etichetta || 'Arabesque') + '</span>' +
      '</span>' +
      '<img src="' + src + '" alt="' + String(alt).replace(/"/g, '&quot;') + '" loading="lazy" decoding="async" onerror="this.remove()">' +
    '</span>';
  }

  function scorteBasse(p) {
    var tot = (p.taglie || []).reduce(function (t, x) { return t + (x.stock || 0); }, 0);
    return tot > 0 && tot <= 4 ? tot : 0;
  }

  function cardProdotto(p) {
    var finale = arbPrezzoFinale(p);
    var esaurito = !arbDisponibile(p);
    var inWish = leggiWishlist().indexOf(p.slug) !== -1;
    var pochi = scorteBasse(p);

    var badge = '';
    if (esaurito) badge = '<span class="tag spento capo-badge">Esaurito</span>';
    else if (p.sconto) badge = '<span class="tag saldo capo-badge">−' + p.sconto + '%</span>';
    else if ((p.linea || []).indexOf('novita') !== -1) badge = '<span class="tag oro capo-badge">Novità</span>';

    var chips = (p.taglie || []).slice(0, 8).map(function (t) {
      return '<button type="button" class="chip-taglia" data-slug="' + p.slug + '" data-taglia="' + t.id + '"' +
        (t.stock > 0 ? '' : ' disabled') + ' aria-label="Aggiungi ' + p.nome + ' taglia ' + t.id + '">' + t.id + '</button>';
    }).join('');

    var segno = segnoDi(p);
    return '<article class="capo entra">' +
      '<a class="capo-foto" href="prodotto.html?p=' + p.slug + '" aria-label="' + p.nome + '" data-tilt="4">' +
        badge + boxFoto(arbFoto(p, 1), p.nome, segno.m, p.sottocategoria, segno.v) +
        (esaurito ? '' : '<button type="button" class="sbircia-btn" data-sbircia="' + p.slug + '">Guarda</button>') +
      '</a>' +
      '<button type="button" class="capo-cuore' + (inWish ? ' attivo' : '') + '" data-wish="' + p.slug + '" aria-label="Salva tra i preferiti">' +
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="' + (inWish ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="1.5"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>' +
      '</button>' +
      (esaurito ? '' : '<div class="capo-taglie">' + chips + '</div>') +
      '<div class="capo-info">' +
        '<p class="capo-casa">' + arbBrand() + '</p>' +
        '<h3 class="capo-nome"><a href="prodotto.html?p=' + p.slug + '">' + p.nome + '</a></h3>' +
        '<p class="capo-prezzo">' +
          (p.sconto ? '<span class="prezzo-vecchio">' + arbEuro(p.prezzo) + '</span>' : '') +
          '<span class="prezzo-ora' + (p.sconto ? ' saldo' : '') + '">' + arbEuro(finale) + '</span>' +
        '</p>' +
        '<p class="capo-scala">' + arbRangeTaglie(p) + '</p>' +
        (pochi ? '<p class="capo-pochi">Ultimi ' + pochi + ' pezzi</p>' : '') +
      '</div>' +
    '</article>';
  }

  /* =============================================================
     CARRELLO
     ============================================================= */
  function leggiCart() { try { return JSON.parse(localStorage.getItem(LS_CART) || '[]'); } catch (e) { return []; } }
  function scriviCart(c) { try { localStorage.setItem(LS_CART, JSON.stringify(c)); } catch (e) {} aggiornaPallino(); renderCarrello(); }
  function leggiWishlist() { try { return JSON.parse(localStorage.getItem(LS_WISH) || '[]'); } catch (e) { return []; } }
  function leggiCoupon() { try { return localStorage.getItem(LS_COUPON) || ''; } catch (e) { return ''; } }
  function scontoCoupon() { return COUPONS[leggiCoupon().toUpperCase()] || 0; }
  function totaleCarrello(c) { return c.reduce(function (t, r) { return t + r.prezzo * r.qty; }, 0); }

  function aggiungiAlCarrello(slug, taglia, colore, qta) {
    var p = arbProdotto(slug);
    if (!p) return;
    var riga = (p.taglie || []).filter(function (t) { return t.id === taglia; })[0];
    if (!riga || riga.stock <= 0) { avviso('Taglia non disponibile'); return; }
    var col = colore || (p.colori && p.colori[0] ? p.colori[0].nome : '');
    var c = leggiCart();
    var chiave = slug + '|' + taglia + '|' + col;
    var trovata = c.filter(function (r) { return r.chiave === chiave; })[0];
    var nuova = Math.min(riga.stock, (trovata ? trovata.qty : 0) + (qta || 1));
    if (trovata) trovata.qty = nuova;
    else c.push({ chiave: chiave, slug: slug, nome: p.nome, taglia: taglia, colore: col, prezzo: arbPrezzoFinale(p), qty: nuova });
    scriviCart(c);
    evento('add_to_cart', { currency: 'EUR', value: arbPrezzoFinale(p), items: [{ item_id: slug, item_name: p.nome, item_variant: taglia + '/' + col, price: arbPrezzoFinale(p), quantity: 1 }] });
    avviso(p.nome + ' · taglia ' + taglia);
    apriCarrello();
  }

  function aggiornaPallino() {
    var n = leggiCart().reduce(function (t, r) { return t + r.qty; }, 0);
    document.querySelectorAll('[data-pallino]').forEach(function (b) { b.textContent = n; b.hidden = n === 0; });
  }

  function renderCarrello() {
    var corpo = document.getElementById('carrelloCorpo'), piede = document.getElementById('carrelloPiede');
    if (!corpo || !piede) return;
    var c = leggiCart();
    if (!c.length) {
      corpo.innerHTML = '<div class="vuoto-cassetto"><p class="corsivo" style="font-size:22px">Il carrello è ancora vuoto.</p></div>';
      piede.innerHTML = '<a class="btn btn-filo btn-blocco btn-senza-icona" href="donna.html">Scopri la collezione</a>';
      return;
    }
    corpo.innerHTML = c.map(function (r) {
      var p = arbProdotto(r.slug);
      return '<div class="riga-cart">' +
        '<a class="riga-cart-foto" href="prodotto.html?p=' + r.slug + '">' + boxFoto(arbFoto(p || { slug: r.slug }, 1), r.nome, 'A', '') + '</a>' +
        '<div>' +
          '<a class="riga-cart-nome" href="prodotto.html?p=' + r.slug + '">' + r.nome + '</a>' +
          '<p class="riga-cart-var">' + r.taglia + (r.colore ? ' · ' + r.colore : '') + '</p>' +
          '<div class="qta">' +
            '<button type="button" data-qta="-" data-chiave="' + r.chiave + '" aria-label="Riduci">−</button>' +
            '<span>' + r.qty + '</span>' +
            '<button type="button" data-qta="+" data-chiave="' + r.chiave + '" aria-label="Aumenta">+</button>' +
          '</div>' +
          '<button type="button" class="riga-cart-via" data-rimuovi="' + r.chiave + '">Rimuovi</button>' +
        '</div>' +
        '<p class="riga-cart-prezzo">' + arbEuro(r.prezzo * r.qty) + '</p>' +
      '</div>';
    }).join('');

    var tot = totaleCarrello(c), pct = scontoCoupon();
    var sconto = Math.round(tot * pct) / 100;
    var imponibile = tot - sconto;
    var manca = Math.max(0, ARB_SPEDIZIONE.soglia - imponibile);
    var perc = Math.min(100, (imponibile / ARB_SPEDIZIONE.soglia) * 100);
    var cons = stimaConsegna();

    piede.innerHTML =
      '<div class="barra-spedizione">' +
        (manca > 0 ? '<p>Ti mancano <b>' + arbEuro(manca) + '</b> alla spedizione gratuita</p>' : '<p><b>Spedizione gratuita</b> sbloccata</p>') +
        '<div class="binario"><i style="width:' + perc + '%"></i></div>' +
      '</div>' +
      '<div class="riga-coupon">' +
        '<input type="text" id="couponInput" placeholder="Codice sconto" value="' + leggiCoupon() + '" aria-label="Codice sconto">' +
        '<button type="button" class="btn btn-filo btn-piccolo btn-senza-icona" id="couponApplica">Applica</button>' +
      '</div>' +
      (pct ? '<p class="coupon-ok">' + leggiCoupon().toUpperCase() + ' attivo · −' + pct + '%</p>' : '') +
      '<div class="riga-tot"><span>Subtotale</span><span>' + arbEuro(tot) + '</span></div>' +
      (pct ? '<div class="riga-tot sconto"><span>Sconto</span><span>−' + arbEuro(sconto) + '</span></div>' : '') +
      '<div class="riga-tot"><span>Spedizione</span><span>' + (imponibile >= ARB_SPEDIZIONE.soglia ? 'Gratuita' : arbEuro(ARB_SPEDIZIONE.costo)) + '</span></div>' +
      '<div class="riga-tot grande"><span>Totale</span><span>' + arbEuro(imponibile + (imponibile >= ARB_SPEDIZIONE.soglia ? 0 : ARB_SPEDIZIONE.costo)) + '</span></div>' +
      '<p style="font-family:var(--f-dati);font-size:11.5px;color:var(--fumo);margin:12px 0 0">Consegna stimata ' + cons.testoCorriere + '</p>' +
      '<a class="btn btn-primario btn-blocco" href="checkout.html" id="vaiCassa" style="margin-top:14px">Vai alla cassa' +
        '<span class="cerchio"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></a>';
  }

  /* ---------------- cassetto ---------------- */
  var ultimoFocus = null;
  function apriCarrello() {
    var d = document.getElementById('cassettoCarrello'), velo = document.getElementById('velo');
    if (!d || !velo) return;
    ultimoFocus = document.activeElement;
    d.classList.add('aperto'); d.setAttribute('aria-hidden', 'false');
    velo.classList.add('aperto');
    document.body.classList.add('no-scroll');
    evento('view_cart', {});
    var f = d.querySelector('button, a, input'); if (f) f.focus();
  }
  function chiudiTutto() {
    document.querySelectorAll('.cassetto').forEach(function (d) { d.classList.remove('aperto'); d.setAttribute('aria-hidden', 'true'); });
    var velo = document.getElementById('velo'); if (velo) velo.classList.remove('aperto');
    var pan = document.getElementById('filtriPannello'); if (pan) pan.classList.remove('aperto');
    document.body.classList.remove('no-scroll');
    if (ultimoFocus) ultimoFocus.focus();
  }

  /* =============================================================
     RICERCA ISTANTANEA
     ============================================================= */
  var SUGGERITE = ['Cappotti', 'Curvy 3XL', 'Cerimonia', 'Camicie', 'Saldi', 'Novità'];
  function apriRicerca() {
    var c = document.getElementById('cerca'), v = document.getElementById('cercaVelo');
    if (!c) return;
    c.classList.add('aperto'); v.classList.add('aperto');
    document.body.classList.add('no-scroll');
    var i = document.getElementById('cercaInput');
    renderRicerca('');
    setTimeout(function () { i.focus(); }, 120);
  }
  function chiudiRicerca() {
    var c = document.getElementById('cerca'), v = document.getElementById('cercaVelo');
    if (!c) return;
    c.classList.remove('aperto'); v.classList.remove('aperto');
    document.body.classList.remove('no-scroll');
  }
  function cercaCapi(q) {
    var t = q.trim().toLowerCase();
    if (!t) return [];
    return ARB_PRODOTTI.filter(function (p) {
      var testo = [p.nome, p.categoria, p.sottocategoria, (p.linea || []).join(' '),
                   (p.colori || []).map(function (c) { return c.nome; }).join(' '),
                   (p.taglie || []).map(function (x) { return x.id; }).join(' ')].join(' ').toLowerCase();
      return t.split(/\s+/).every(function (parola) { return testo.indexOf(parola) !== -1; });
    }).slice(0, 8);
  }
  function renderRicerca(q) {
    var box = document.getElementById('cercaCorpo');
    if (!box) return;
    if (!q.trim()) {
      box.innerHTML = '<p class="cerca-titolo">Ricerche frequenti</p><div class="cerca-suggerimenti">' +
        SUGGERITE.map(function (s) { return '<button type="button" data-suggerita="' + s + '">' + s + '</button>'; }).join('') +
        '</div>';
      return;
    }
    var out = cercaCapi(q);
    if (!out.length) {
      box.innerHTML = '<div class="cerca-vuoto"><p>Nessun capo per «' + q + '».</p>' +
        '<p style="margin-top:10px;font-size:14px">In negozio abbiamo molto di più: <a data-cfg-wa href="#" target="_blank" rel="noopener" style="color:var(--oro);text-decoration:underline">chiedi su WhatsApp</a></p></div>';
      applicaConfig();
      return;
    }
    box.innerHTML = '<p class="cerca-titolo">' + out.length + ' capi trovati</p>' + out.map(function (p) {
      return '<a class="cerca-voce" href="prodotto.html?p=' + p.slug + '">' +
        '<span class="mini">' + boxFoto(arbFoto(p, 1), p.nome, 'A', '') + '</span>' +
        '<span><b>' + p.nome + '</b><small>' + p.sottocategoria + ' · ' + arbRangeTaglie(p) + '</small></span>' +
        '<span class="prezzo">' + arbEuro(arbPrezzoFinale(p)) + '</span>' +
      '</a>';
    }).join('');
  }

  /* =============================================================
     TESTATA: mega menu, sipario, scroll
     ============================================================= */
  function navigazione() {
    var applica = function () { document.body.classList.toggle('scrollato', window.scrollY > 20); };
    applica();
    window.addEventListener('scroll', applica, { passive: true });

    /* mega menu su desktop: apre al passaggio, chiude uscendo */
    var testata = document.querySelector('.testata-sito');
    if (testata) {
      var timer = null;
      testata.addEventListener('pointerover', function (e) {
        var v = e.target.closest('[data-mega]');
        var dentroMega = e.target.closest('.mega');
        clearTimeout(timer);
        if (v) {
          document.querySelectorAll('.mega').forEach(function (m) { m.classList.toggle('aperto', m.id === v.dataset.mega); });
          document.querySelectorAll('[data-mega]').forEach(function (x) { x.setAttribute('aria-expanded', x === v ? 'true' : 'false'); });
        } else if (!dentroMega) {
          timer = setTimeout(chiudiMega, 160);
        }
      });
      testata.addEventListener('pointerleave', function () { timer = setTimeout(chiudiMega, 200); });
    }
    function chiudiMega() {
      document.querySelectorAll('.mega').forEach(function (m) { m.classList.remove('aperto'); });
      document.querySelectorAll('[data-mega]').forEach(function (x) { x.setAttribute('aria-expanded', 'false'); });
    }

    /* pagina corrente nella barra in basso */
    var qui = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.barra-giu a').forEach(function (a) {
      if (a.getAttribute('href') === qui) a.setAttribute('aria-current', 'page');
    });
  }

  /* =============================================================
     EVENTI DELEGATI
     ============================================================= */
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-apri="carrello"]')) { e.preventDefault(); apriCarrello(); return; }
    if (e.target.closest('[data-apri="cerca"]')) { e.preventDefault(); apriRicerca(); return; }
    if (e.target.closest('[data-chiudi]') || e.target.id === 'velo') { chiudiTutto(); return; }
    if (e.target.closest('[data-chiudi-cerca]') || e.target.id === 'cercaVelo') { chiudiRicerca(); return; }

    var sug = e.target.closest('[data-suggerita]');
    if (sug) {
      var i = document.getElementById('cercaInput');
      i.value = sug.dataset.suggerita;
      renderRicerca(i.value);
      evento('search_performed', { search_term: i.value });
      return;
    }
    if (e.target.closest('[data-menu]')) {
      e.preventDefault();
      var aperto = document.body.classList.toggle('menu-aperto');
      var s = document.getElementById('sipario');
      if (s) { s.classList.toggle('aperto', aperto); s.setAttribute('aria-hidden', aperto ? 'false' : 'true'); }
      document.body.classList.toggle('no-scroll', aperto);
      return;
    }
    if (document.body.classList.contains('menu-aperto') && e.target.closest('#sipario a')) {
      document.body.classList.remove('menu-aperto', 'no-scroll');
      document.getElementById('sipario').classList.remove('aperto');
    }
    if (e.target.closest('[data-apri-filtri]')) {
      var pan = document.getElementById('filtriPannello');
      if (pan) { pan.classList.add('aperto'); document.getElementById('velo').classList.add('aperto'); document.body.classList.add('no-scroll'); }
      return;
    }
    if (e.target.closest('[data-cfg-wa]')) evento('whatsapp_click', {});

    var chip = e.target.closest('.chip-taglia[data-slug]');
    if (chip && !chip.disabled) { aggiungiAlCarrello(chip.dataset.slug, chip.dataset.taglia); return; }

    var wish = e.target.closest('[data-wish]');
    if (wish) {
      var w = leggiWishlist(), k = w.indexOf(wish.dataset.wish);
      if (k === -1) { w.push(wish.dataset.wish); avviso('Salvato tra i preferiti'); } else { w.splice(k, 1); }
      try { localStorage.setItem(LS_WISH, JSON.stringify(w)); } catch (err) {}
      wish.classList.toggle('attivo', k === -1);
      var svg = wish.querySelector('svg'); if (svg) svg.setAttribute('fill', k === -1 ? 'currentColor' : 'none');
      return;
    }
    var q = e.target.closest('[data-qta]');
    if (q) {
      var c = leggiCart(), r = c.filter(function (x) { return x.chiave === q.dataset.chiave; })[0];
      if (r) {
        var p = arbProdotto(r.slug);
        var max = p ? (p.taglie.filter(function (t) { return t.id === r.taglia; })[0] || { stock: 9 }).stock : 9;
        r.qty = q.dataset.qta === '+' ? Math.min(max, r.qty + 1) : r.qty - 1;
        if (r.qty <= 0) c = c.filter(function (x) { return x.chiave !== r.chiave; });
        scriviCart(c);
      }
      return;
    }
    var rm = e.target.closest('[data-rimuovi]');
    if (rm) { scriviCart(leggiCart().filter(function (x) { return x.chiave !== rm.dataset.rimuovi; })); return; }

    if (e.target.id === 'couponApplica') {
      var val = (document.getElementById('couponInput').value || '').trim().toUpperCase();
      if (!val) { try { localStorage.removeItem(LS_COUPON); } catch (err) {} renderCarrello(); return; }
      if (COUPONS[val]) { try { localStorage.setItem(LS_COUPON, val); } catch (err) {} avviso('Codice applicato · −' + COUPONS[val] + '%'); }
      else { avviso('Codice non valido'); try { localStorage.removeItem(LS_COUPON); } catch (err) {} }
      renderCarrello();
      return;
    }
    if (e.target.id === 'vaiCassa') evento('begin_checkout', { value: totaleCarrello(leggiCart()), currency: 'EUR' });

    var fq = e.target.closest('.faq-q');
    if (fq) {
      var voce = fq.parentNode, gia = voce.classList.contains('aperta');
      voce.parentNode.querySelectorAll('.faq-voce').forEach(function (x) {
        x.classList.remove('aperta'); x.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });
      if (!gia) { voce.classList.add('aperta'); fq.setAttribute('aria-expanded', 'true'); }
    }
  });

  document.addEventListener('input', function (e) {
    if (e.target.id === 'cercaInput') renderRicerca(e.target.value);
  });
  var timerCerca = null;
  document.addEventListener('change', function (e) {
    if (e.target.id === 'cercaInput') {
      clearTimeout(timerCerca);
      timerCerca = setTimeout(function () { evento('search_performed', { search_term: e.target.value }); }, 600);
    }
  });
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { chiudiTutto(); chiudiRicerca();
      if (document.body.classList.contains('menu-aperto')) {
        document.body.classList.remove('menu-aperto', 'no-scroll');
        var s = document.getElementById('sipario'); if (s) s.classList.remove('aperto');
      }
    }
    if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !/input|textarea/i.test(document.activeElement.tagName))) {
      e.preventDefault(); apriRicerca();
    }
  });

  /* ---------------- newsletter ---------------- */
  document.addEventListener('submit', function (e) {
    var form = e.target.closest('[data-newsletter]');
    if (!form) return;
    e.preventDefault();
    var email = form.querySelector('input[type=email]').value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { avviso('Controlla l\'indirizzo email'); return; }
    var btn = form.querySelector('button[type=submit]');
    if (btn) { btn.disabled = true; btn.textContent = 'Invio…'; }
    fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email }) })
      .catch(function () {})
      .then(function () {
        try { localStorage.setItem(LS_COUPON, 'BENVENUTO10'); } catch (err) {}
        evento('newsletter_signup', {});
        form.innerHTML = '<p class="corsivo" style="color:var(--oro);font-size:21px">Grazie. Il codice BENVENUTO10 è già attivo nel tuo carrello.</p>';
        renderCarrello();
      });
  });

  /* ---------------- dati del negozio ---------------- */
  function applicaConfig() {
    if (typeof ARB_CONFIG === 'undefined') return;
    var c = ARB_CONFIG;
    var testi = {
      telefono: c.telefonoVisibile, email: c.email, indirizzo: c.indirizzo,
      citta: c.cap + ' ' + c.citta + ' (' + c.provincia + ')',
      indirizzoCompleto: c.indirizzo + ', ' + c.cap + ' ' + c.citta + ' (' + c.provincia + ')',
      piva: c.piva, insegna: c.insegna
    };
    document.querySelectorAll('[data-cfg]').forEach(function (n) { var v = testi[n.dataset.cfg]; if (v) n.textContent = v; });
    document.querySelectorAll('[data-cfg-tel]').forEach(function (n) { n.href = 'tel:' + c.telefono; });
    document.querySelectorAll('[data-cfg-map]').forEach(function (n) { n.href = c.mappa; });
    document.querySelectorAll('[data-cfg-ig]').forEach(function (n) { n.href = c.instagram; });
    document.querySelectorAll('[data-cfg-fb]').forEach(function (n) { n.href = c.facebook; });
    document.querySelectorAll('[data-cfg-wa]').forEach(function (n) {
      n.href = 'https://wa.me/' + c.whatsapp + '?text=' + encodeURIComponent(n.dataset.cfgWa || 'Buongiorno, vorrei un consiglio sulla taglia.');
    });
    document.querySelectorAll('#orariLista').forEach(function (l) {
      l.innerHTML = c.orari.map(function (o) { return '<li><span>' + o.giorni + '</span><span>' + o.ore + '</span></li>'; }).join('');
    });
    /* le recensioni compaiono solo quando ce ne sono di vere */
    if (!c.recensioniAttive) {
      document.querySelectorAll('[data-recensioni]').forEach(function (s) { s.hidden = true; });
    }
  }

  /* ---------------- annuncio ---------------- */
  var annuncio = document.getElementById('annuncio');
  if (annuncio) {
    try { if (sessionStorage.getItem('arb-annuncio') === 'chiuso') annuncio.hidden = true; } catch (e) {}
    var chiudiAnn = document.getElementById('annuncioChiudi');
    if (chiudiAnn) chiudiAnn.addEventListener('click', function () {
      annuncio.hidden = true;
      try { sessionStorage.setItem('arb-annuncio', 'chiuso'); } catch (e) {}
    });
  }

  /* ---------------- passerella trascinabile ---------------- */
  function passerella() {
    document.querySelectorAll('.passerella-pista').forEach(function (pista) {
      var giu = false, x0 = 0, s0 = 0, mosso = false;
      pista.addEventListener('pointerdown', function (e) { giu = true; mosso = false; x0 = e.pageX; s0 = pista.scrollLeft; pista.classList.add('trascino'); });
      pista.addEventListener('pointermove', function (e) {
        if (!giu) return;
        var d = e.pageX - x0;
        if (Math.abs(d) > 4) mosso = true;
        pista.scrollLeft = s0 - d;
      });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) {
        pista.addEventListener(ev, function () { giu = false; pista.classList.remove('trascino'); });
      });
      pista.addEventListener('click', function (e) { if (mosso) { e.preventDefault(); e.stopPropagation(); } }, true);
    });
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-scorri]');
      if (!b) return;
      var pista = document.querySelector(b.dataset.pista || '.passerella-pista');
      if (!pista) return;
      var passo = pista.firstElementChild ? pista.firstElementChild.getBoundingClientRect().width + 16 : 300;
      pista.scrollBy({ left: b.dataset.scorri === 'avanti' ? passo : -passo, behavior: 'smooth' });
    });
  }

  /* ---------------- avvio ---------------- */
  function avvia() {
    applicaConfig();
    navigazione();
    passerella();
    aggiornaPallino();
    renderCarrello();
    osserva();
    var anno = document.getElementById('annoCorrente');
    if (anno) anno.textContent = new Date().getFullYear();
    if (location.hash === '#carrello') apriCarrello();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', avvia);
  else avvia();

  /* le griglie costruite a runtime chiedono di riagganciare il movimento */
  function riaggancia(radice) {
    osserva(radice);
    if (window.ARB_MOVIMENTO) {
      ARB_MOVIMENTO.scagliona();
      ARB_MOVIMENTO.inclina(radice);
      ARB_MOVIMENTO.respiro();
    }
  }

  window.ARB = {
    riaggancia: riaggancia,
    segnoDi: segnoDi,
    cardProdotto: cardProdotto, boxFoto: boxFoto, aggiungi: aggiungiAlCarrello,
    leggiCart: leggiCart, scriviCart: scriviCart, totale: totaleCarrello,
    sconto: scontoCoupon, coupon: leggiCoupon, avviso: avviso, toast: avviso,
    reveal: osserva, apriCarrello: apriCarrello, evento: evento,
    consegna: stimaConsegna, dataLunga: dataLunga, config: applicaConfig,
    scorteBasse: scorteBasse, LS_FILTRI: LS_FILTRI
  };
})();
