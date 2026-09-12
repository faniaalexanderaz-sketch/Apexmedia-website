/* =============================================================
   ARABESQUE BUSALLA — script comune a tutte le pagine
   Nav, menu, carrello, card prodotto, hero WebGL, FAQ, toast.
   Nessuna libreria esterna: tutto vive qui.
   ============================================================= */
(function () {
  'use strict';

  var LS_CART = 'arb-cart';
  var LS_WISH = 'arb-wish';
  var LS_COUPON = 'arb-coupon';
  var COUPONS = { BENVENUTO10: 10, BUSALLA15: 15 };
  var ridotto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- visita (anonima, per il pannello interno) ---------- */
  try {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ percorso: location.pathname })
    }).catch(function () {});
  } catch (e) {}

  /* ---------- toast ---------- */
  var elToast = null;
  var toastTimer = null;
  function toast(msg) {
    if (!elToast) {
      elToast = document.createElement('div');
      elToast.className = 'toast';
      elToast.setAttribute('role', 'status');
      document.body.appendChild(elToast);
    }
    elToast.textContent = msg;
    elToast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { elToast.hidden = true; }, 2600);
  }

  /* ---------- reveal allo scroll ---------- */
  function osservaReveal(radice) {
    var nodi = (radice || document).querySelectorAll('.reveal:not(.dentro)');
    if (!nodi.length) return;
    if (ridotto || !('IntersectionObserver' in window)) {
      nodi.forEach(function (n) { n.classList.add('dentro'); });
      return;
    }
    var io = new IntersectionObserver(function (voci) {
      voci.forEach(function (v) {
        if (v.isIntersecting) { v.target.classList.add('dentro'); io.unobserve(v.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    nodi.forEach(function (n) { io.observe(n); });
  }

  /* =============================================================
     HERO WEBGL — seta nera con riflesso oro, generata a runtime
     Nessun file video da scaricare: 0 KB di asset, si adatta a
     qualsiasi schermo. Se WebGL manca o l'utente ha chiesto meno
     animazioni, resta il fondo statico .hero-fallback.
     ============================================================= */
  function heroWebgl() {
    var cv = document.getElementById('heroCanvas');
    if (!cv) return;
    if (ridotto) { cv.remove(); return; }

    var gl = cv.getContext('webgl', { antialias: false, alpha: true, powerPreference: 'low-power' })
          || cv.getContext('experimental-webgl');
    if (!gl) { cv.remove(); return; }

    var vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    var fs = [
      'precision mediump float;',
      'uniform vec2 u_res;uniform float u_t;uniform vec2 u_m;',
      'float grana(vec2 v){return fract(sin(dot(v,vec2(12.9898,78.233)))*43758.5453);}',
      'void main(){',
      '  vec2 uv=gl_FragCoord.xy/u_res.xy;',
      '  vec2 p=vec2(uv.x*(u_res.x/u_res.y),uv.y);',
      '  float t=u_t*0.075;',
      '  float w=0.0;',
      '  w+=sin(p.x*2.6+t*1.9+sin(p.y*2.1-t*1.1)*1.5)*0.50;',
      '  w+=sin(p.x*5.1-t*1.2+sin(p.y*3.4+t*0.8)*1.1)*0.30;',
      '  w+=sin((p.x+p.y)*3.9+t*1.5)*0.20;',
      '  float piega=0.5+0.5*sin(w*3.14159+p.y*1.9);',
      '  float luce=pow(piega,9.0);',
      '  float bordo=pow(piega,3.0)*0.20;',
      '  vec3 base=mix(vec3(0.026,0.026,0.030),vec3(0.085,0.082,0.090),piega);',
      '  vec3 oro=vec3(0.784,0.663,0.416);',
      '  vec3 col=base+oro*(luce*0.62+bordo*0.16);',
      '  float d=distance(uv,u_m);',
      '  col+=oro*0.09*exp(-d*d*7.0);',
      '  float v=smoothstep(1.25,0.25,distance(uv,vec2(0.5)));',
      '  col*=0.42+0.58*v;',
      '  col+=(grana(uv*u_res.xy)-0.5)*0.022;',
      '  gl_FragColor=vec4(col,1.0);',
      '}'
    ].join('\n');

    function compila(tipo, src) {
      var s = gl.createShader(tipo);
      gl.shaderSource(s, src); gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    }
    var v = compila(gl.VERTEX_SHADER, vs), f = compila(gl.FRAGMENT_SHADER, fs);
    if (!v || !f) { cv.remove(); return; }
    var pr = gl.createProgram();
    gl.attachShader(pr, v); gl.attachShader(pr, f); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { cv.remove(); return; }
    gl.useProgram(pr);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(pr, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    var uRes = gl.getUniformLocation(pr, 'u_res');
    var uT = gl.getUniformLocation(pr, 'u_t');
    var uM = gl.getUniformLocation(pr, 'u_m');
    var mouse = [0.72, 0.62];

    function ridimensiona() {
      var dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      var w = Math.round(cv.clientWidth * dpr), h = Math.round(cv.clientHeight * dpr);
      if (cv.width !== w || cv.height !== h) {
        cv.width = w; cv.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(uRes, cv.width, cv.height);
    }
    window.addEventListener('resize', ridimensiona, { passive: true });

    cv.parentNode.addEventListener('pointermove', function (e) {
      var r = cv.getBoundingClientRect();
      mouse[0] = (e.clientX - r.left) / r.width;
      mouse[1] = 1 - (e.clientY - r.top) / r.height;
    }, { passive: true });

    var visibile = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (vs2) { visibile = vs2[0].isIntersecting; })
        .observe(cv);
    }

    var avvio = performance.now(), ultimo = 0;
    function disegna(ora) {
      requestAnimationFrame(disegna);
      if (!visibile || document.hidden) return;
      if (ora - ultimo < 33) return;          /* ~30 fps: basta e avanza */
      ultimo = ora;
      ridimensiona();
      gl.uniform1f(uT, (ora - avvio) / 1000);
      gl.uniform2f(uM, mouse[0], mouse[1]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    requestAnimationFrame(disegna);
  }

  /* =============================================================
     FOTO — riquadro editoriale finché non c'è la foto reale
     ============================================================= */
  function boxFoto(src, alt, monogramma, etichetta, classe) {
    return '<span class="foto ' + (classe || '') + '">' +
      '<span class="foto-vuota" aria-hidden="true">' +
        '<span class="foto-vuota-m">' + (monogramma || 'A') + '</span>' +
        '<span class="foto-vuota-t">' + (etichetta || 'Arabesque') + '</span>' +
      '</span>' +
      '<img src="' + src + '" alt="' + alt.replace(/"/g, '&quot;') + '" loading="lazy" decoding="async" ' +
      'onerror="this.remove()">' +
    '</span>';
  }

  /* =============================================================
     CARD PRODOTTO — resa identica ovunque
     ============================================================= */
  function cardProdotto(p, opzioni) {
    var o = opzioni || {};
    var finale = arbPrezzoFinale(p);
    var esaurito = !arbDisponibile(p);
    var wish = leggiWishlist();
    var inWish = wish.indexOf(p.slug) !== -1;

    var badge = '';
    if (esaurito) badge = '<span class="prod-card-badge esaurito">Esaurito</span>';
    else if (p.sconto) badge = '<span class="prod-card-badge sconto">−' + p.sconto + '%</span>';
    else if ((p.linea || []).indexOf('novita') !== -1) badge = '<span class="prod-card-badge">Novità</span>';

    var chips = (p.taglie || []).slice(0, 8).map(function (t) {
      return '<button type="button" class="taglia-chip" data-slug="' + p.slug + '" data-taglia="' + t.id + '"' +
             (t.stock > 0 ? '' : ' disabled') + ' aria-label="Aggiungi ' + p.nome + ' taglia ' + t.id + '">' + t.id + '</button>';
    }).join('');

    return '<article class="prod-card reveal">' +
      '<a class="prod-card-foto" href="prodotto.html?p=' + p.slug + '" aria-label="' + p.nome + '">' +
        badge +
        boxFoto(arbFoto(p, 1), p.nome, 'A', p.sottocategoria) +
      '</a>' +
      '<button type="button" class="prod-card-cuore' + (inWish ? ' attiva attivo' : '') + '" data-wish="' + p.slug + '" aria-label="Salva tra i preferiti">' +
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="' + (inWish ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="1.8"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>' +
      '</button>' +
      (esaurito ? '' : '<div class="prod-card-taglie">' + chips + '</div>') +
      '<div class="prod-card-info">' +
        '<p class="prod-card-brand">' + arbBrand() + '</p>' +
        '<h3 class="prod-card-nome"><a href="prodotto.html?p=' + p.slug + '">' + p.nome + '</a></h3>' +
        '<p class="prod-card-prezzo">' +
          (p.sconto ? '<span class="prezzo-pieno">' + arbEuro(p.prezzo) + '</span>' : '') +
          '<span class="prezzo-ora' + (p.sconto ? ' in-saldo' : '') + '">' + arbEuro(finale) + '</span>' +
        '</p>' +
        '<p class="prod-card-misure">' + (o.nascondiTaglie ? '' : arbRangeTaglie(p)) + '</p>' +
      '</div>' +
    '</article>';
  }

  /* =============================================================
     CARRELLO
     ============================================================= */
  function leggiCart() {
    try { return JSON.parse(localStorage.getItem(LS_CART) || '[]'); } catch (e) { return []; }
  }
  function scriviCart(c) {
    try { localStorage.setItem(LS_CART, JSON.stringify(c)); } catch (e) {}
    aggiornaBadge();
    renderCarrello();
  }
  function leggiWishlist() {
    try { return JSON.parse(localStorage.getItem(LS_WISH) || '[]'); } catch (e) { return []; }
  }
  function leggiCoupon() {
    try { return localStorage.getItem(LS_COUPON) || ''; } catch (e) { return ''; }
  }

  function aggiungiAlCarrello(slug, taglia, colore, qta) {
    var p = arbProdotto(slug);
    if (!p) return;
    var riga = (p.taglie || []).filter(function (t) { return t.id === taglia; })[0];
    if (!riga || riga.stock <= 0) { toast('Taglia non disponibile'); return; }

    var col = colore || (p.colori && p.colori[0] ? p.colori[0].nome : '');
    var c = leggiCart();
    var chiave = slug + '|' + taglia + '|' + col;
    var trovata = c.filter(function (r) { return r.chiave === chiave; })[0];
    var nuova = Math.min(riga.stock, (trovata ? trovata.qty : 0) + (qta || 1));
    if (trovata) trovata.qty = nuova;
    else c.push({ chiave: chiave, slug: slug, nome: p.nome, taglia: taglia, colore: col, prezzo: arbPrezzoFinale(p), qty: nuova });
    scriviCart(c);
    toast(p.nome + ' · taglia ' + taglia + ' — aggiunto');
    apriDrawer('carrello');
  }

  function totaleCarrello(c) {
    return c.reduce(function (t, r) { return t + r.prezzo * r.qty; }, 0);
  }
  function pezziCarrello(c) {
    return c.reduce(function (t, r) { return t + r.qty; }, 0);
  }
  function scontoCoupon() {
    var cod = leggiCoupon().toUpperCase();
    return COUPONS[cod] || 0;
  }

  function aggiornaBadge() {
    var n = pezziCarrello(leggiCart());
    document.querySelectorAll('[data-badge-carrello]').forEach(function (b) {
      b.textContent = n;
      b.hidden = n === 0;
    });
  }

  function renderCarrello() {
    var corpo = document.getElementById('carrelloCorpo');
    var piede = document.getElementById('carrelloPiede');
    if (!corpo || !piede) return;

    var c = leggiCart();
    if (!c.length) {
      corpo.innerHTML = '<div class="carrello-vuoto">' +
        '<svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/></svg>' +
        '<p>Il tuo carrello è vuoto.</p></div>';
      piede.innerHTML = '<a class="btn btn-fantasma btn-blocco" href="donna.html">Scopri la collezione</a>';
      return;
    }

    corpo.innerHTML = c.map(function (r) {
      var p = arbProdotto(r.slug);
      return '<div class="riga-cart">' +
        '<a class="riga-cart-foto" href="prodotto.html?p=' + r.slug + '">' +
          boxFoto(arbFoto(p || { slug: r.slug }, 1), r.nome, 'A', '') +
        '</a>' +
        '<div>' +
          '<a class="riga-cart-nome" href="prodotto.html?p=' + r.slug + '">' + r.nome + '</a>' +
          '<p class="riga-cart-var">Taglia ' + r.taglia + (r.colore ? ' · ' + r.colore : '') + '</p>' +
          '<div class="qta">' +
            '<button type="button" data-qta="-" data-chiave="' + r.chiave + '" aria-label="Riduci quantità">−</button>' +
            '<span>' + r.qty + '</span>' +
            '<button type="button" data-qta="+" data-chiave="' + r.chiave + '" aria-label="Aumenta quantità">+</button>' +
          '</div>' +
          '<button type="button" class="riga-cart-rimuovi" data-rimuovi="' + r.chiave + '">Rimuovi</button>' +
        '</div>' +
        '<p class="riga-cart-prezzo">' + arbEuro(r.prezzo * r.qty) + '</p>' +
      '</div>';
    }).join('');

    var tot = totaleCarrello(c);
    var pct = scontoCoupon();
    var sconto = Math.round(tot * pct) / 100;
    var imponibile = tot - sconto;
    var manca = Math.max(0, ARB_SPEDIZIONE.soglia - imponibile);
    var perc = Math.min(100, (imponibile / ARB_SPEDIZIONE.soglia) * 100);

    piede.innerHTML =
      '<div class="spedizione-barra">' +
        (manca > 0
          ? '<p>Ti mancano <b>' + arbEuro(manca) + '</b> alla spedizione gratuita</p>'
          : '<p><b>Spedizione gratuita</b> sbloccata</p>') +
        '<div class="barra"><i style="width:' + perc + '%"></i></div>' +
      '</div>' +
      '<div class="coupon-riga">' +
        '<input type="text" id="couponInput" placeholder="Codice sconto" value="' + leggiCoupon() + '" aria-label="Codice sconto">' +
        '<button type="button" class="btn btn-fantasma" id="couponApplica">Applica</button>' +
      '</div>' +
      (pct ? '<p class="coupon-ok">Codice ' + leggiCoupon().toUpperCase() + ' attivo: −' + pct + '%</p>' : '') +
      '<div class="totale-riga"><span>Subtotale</span><span>' + arbEuro(tot) + '</span></div>' +
      (pct ? '<div class="totale-riga sconto"><span>Sconto</span><span>−' + arbEuro(sconto) + '</span></div>' : '') +
      '<div class="totale-riga"><span>Spedizione</span><span>' + (imponibile >= ARB_SPEDIZIONE.soglia ? 'Gratuita' : arbEuro(ARB_SPEDIZIONE.costo)) + '</span></div>' +
      '<div class="totale-riga grande"><span>Totale</span><span>' + arbEuro(imponibile + (imponibile >= ARB_SPEDIZIONE.soglia ? 0 : ARB_SPEDIZIONE.costo)) + '</span></div>' +
      '<a class="btn btn-primario btn-blocco" href="checkout.html" style="margin-top:14px">Vai alla cassa</a>' +
      '<p style="font-size:11.5px;color:var(--grigio);text-align:center;margin-top:12px">Oppure <b>ritira gratis in negozio</b> a Busalla — lo scegli alla cassa</p>';
  }

  /* ---------- eventi delegati ---------- */
  document.addEventListener('click', function (e) {
    var chip = e.target.closest('.taglia-chip[data-slug]');
    if (chip && !chip.disabled) {
      aggiungiAlCarrello(chip.dataset.slug, chip.dataset.taglia);
      return;
    }
    var wish = e.target.closest('[data-wish]');
    if (wish) {
      var slug = wish.dataset.wish;
      var w = leggiWishlist();
      var i = w.indexOf(slug);
      if (i === -1) { w.push(slug); toast('Salvato tra i preferiti'); }
      else { w.splice(i, 1); }
      try { localStorage.setItem(LS_WISH, JSON.stringify(w)); } catch (err) {}
      wish.classList.toggle('attivo', i === -1);
      var svg = wish.querySelector('svg');
      if (svg) svg.setAttribute('fill', i === -1 ? 'currentColor' : 'none');
      return;
    }
    var q = e.target.closest('[data-qta]');
    if (q) {
      var c = leggiCart();
      var r = c.filter(function (x) { return x.chiave === q.dataset.chiave; })[0];
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
    if (rm) {
      scriviCart(leggiCart().filter(function (x) { return x.chiave !== rm.dataset.rimuovi; }));
      return;
    }
    if (e.target.id === 'couponApplica') {
      var val = (document.getElementById('couponInput').value || '').trim().toUpperCase();
      if (!val) { try { localStorage.removeItem(LS_COUPON); } catch (err) {} renderCarrello(); return; }
      if (COUPONS[val]) {
        try { localStorage.setItem(LS_COUPON, val); } catch (err) {}
        toast('Codice applicato: −' + COUPONS[val] + '%');
      } else {
        toast('Codice non valido');
        try { localStorage.removeItem(LS_COUPON); } catch (err) {}
      }
      renderCarrello();
      return;
    }
  });

  /* =============================================================
     DRAWER (carrello + menu)
     ============================================================= */
  var ultimoFocus = null;
  function apriDrawer(quale) {
    var d = document.getElementById(quale === 'menu' ? 'drawerMenu' : 'drawerCarrello');
    var velo = document.getElementById('velo');
    if (!d || !velo) return;
    ultimoFocus = document.activeElement;
    d.classList.add('aperto');
    d.setAttribute('aria-hidden', 'false');
    velo.classList.add('aperto');
    document.body.classList.add('no-scroll');
    var f = d.querySelector('button, a, input');
    if (f) f.focus();
  }
  function chiudiDrawer() {
    document.querySelectorAll('.drawer').forEach(function (d) {
      d.classList.remove('aperto');
      d.setAttribute('aria-hidden', 'true');
    });
    var velo = document.getElementById('velo');
    if (velo) velo.classList.remove('aperto');
    document.body.classList.remove('no-scroll');
    if (ultimoFocus) ultimoFocus.focus();
  }
  window.addEventListener('keydown', function (e) { if (e.key === 'Escape') chiudiDrawer(); });

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-apri="carrello"]')) { e.preventDefault(); apriDrawer('carrello'); }
    if (e.target.closest('[data-apri="menu"]')) { e.preventDefault(); apriDrawer('menu'); }
    if (e.target.closest('[data-chiudi]') || e.target.id === 'velo') chiudiDrawer();
  });

  /* =============================================================
     FAQ
     ============================================================= */
  document.addEventListener('click', function (e) {
    var q = e.target.closest('.faq-q');
    if (!q) return;
    var voce = q.parentNode;
    var aperta = voce.classList.contains('aperta');
    voce.parentNode.querySelectorAll('.faq-voce').forEach(function (v) {
      v.classList.remove('aperta');
      v.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
    });
    if (!aperta) {
      voce.classList.add('aperta');
      q.setAttribute('aria-expanded', 'true');
    }
  });

  /* =============================================================
     NEWSLETTER
     ============================================================= */
  document.addEventListener('submit', function (e) {
    var form = e.target.closest('[data-newsletter]');
    if (!form) return;
    e.preventDefault();
    var email = form.querySelector('input[type=email]').value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { toast('Controlla l\'indirizzo email'); return; }
    var btn = form.querySelector('button[type=submit]');
    if (btn) { btn.disabled = true; btn.textContent = 'Invio…'; }
    fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email })
    }).then(function () {}).catch(function () {}).then(function () {
      try { localStorage.setItem(LS_COUPON, 'BENVENUTO10'); } catch (err) {}
      form.innerHTML = '<p style="color:var(--oro);font-size:15px">Grazie. Il codice <b>BENVENUTO10</b> è già attivo nel tuo carrello.</p>';
      renderCarrello();
    });
  });

  /* =============================================================
     PROMO BAR
     ============================================================= */
  var promo = document.getElementById('promoBar');
  if (promo) {
    try { if (sessionStorage.getItem('arb-promo-chiusa') === '1') promo.hidden = true; } catch (e) {}
    var chiudiPromo = document.getElementById('promoBarChiudi');
    if (chiudiPromo) chiudiPromo.addEventListener('click', function () {
      promo.hidden = true;
      try { sessionStorage.setItem('arb-promo-chiusa', '1'); } catch (e) {}
    });
  }


  /* =============================================================
     DATI NEGOZIO — riempiti da config.js
     ============================================================= */
  function applicaConfig() {
    if (typeof ARB_CONFIG === 'undefined') return;
    var c = ARB_CONFIG;
    var testi = {
      telefono: c.telefonoVisibile,
      email: c.email,
      indirizzo: c.indirizzo,
      citta: c.cap + ' ' + c.citta + ' (' + c.provincia + ')',
      indirizzoCompleto: c.indirizzo + ', ' + c.cap + ' ' + c.citta + ' (' + c.provincia + ')',
      piva: c.piva,
      insegna: c.insegna
    };
    document.querySelectorAll('[data-cfg]').forEach(function (n) {
      var v = testi[n.dataset.cfg];
      if (v) n.textContent = v;
    });
    document.querySelectorAll('[data-cfg-tel]').forEach(function (n) { n.href = 'tel:' + c.telefono; });
    document.querySelectorAll('[data-cfg-map]').forEach(function (n) { n.href = c.mappa; });
    document.querySelectorAll('[data-cfg-ig]').forEach(function (n) { n.href = c.instagram; });
    document.querySelectorAll('[data-cfg-fb]').forEach(function (n) { n.href = c.facebook; });
    document.querySelectorAll('[data-cfg-wa]').forEach(function (n) {
      var testo = n.dataset.cfgWa || 'Buongiorno, vorrei un consiglio sulla taglia.';
      n.href = 'https://wa.me/' + c.whatsapp + '?text=' + encodeURIComponent(testo);
    });
    var lista = document.getElementById('orariLista');
    if (lista) {
      lista.innerHTML = c.orari.map(function (o) {
        return '<li><span>' + o.giorni + '</span><span>' + o.ore + '</span></li>';
      }).join('');
    }
  }

  /* =============================================================
     AVVIO
     ============================================================= */
  function avvia() {
    applicaConfig();
    heroWebgl();
    aggiornaBadge();
    renderCarrello();
    osservaReveal();
    if (location.hash === '#carrello') apriDrawer('carrello');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', avvia);
  else avvia();

  /* API condivisa con catalogo.js / prodotto.js / checkout.js */
  window.ARB = {
    cardProdotto: cardProdotto,
    boxFoto: boxFoto,
    aggiungi: aggiungiAlCarrello,
    leggiCart: leggiCart,
    scriviCart: scriviCart,
    totale: totaleCarrello,
    sconto: scontoCoupon,
    coupon: leggiCoupon,
    toast: toast,
    reveal: osservaReveal,
    apriDrawer: apriDrawer
  };
})();
