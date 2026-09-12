/* =============================================================
   ARABESQUE BUSALLA — regia comune a tutte le pagine
   Isola di navigazione, sipario del menu, carrello, schede capo,
   seta in WebGL, profondità 3D, passerella trascinabile.
   Nessuna libreria esterna.
   ============================================================= */
(function () {
  'use strict';

  var LS_CART = 'arb-cart';
  var LS_WISH = 'arb-wish';
  var LS_COUPON = 'arb-coupon';
  var COUPONS = { BENVENUTO10: 10, BUSALLA15: 15 };
  var ridotto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var tocco = window.matchMedia('(hover: none)').matches;

  try {
    fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ percorso: location.pathname }) }).catch(function () {});
  } catch (e) {}

  /* ---------------- avvisi ---------------- */
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

  /* ---------------- entrata in scena ---------------- */
  function osserva(radice) {
    var nodi = (radice || document).querySelectorAll('.entra:not(.dentro)');
    if (!nodi.length) return;
    if (ridotto || !('IntersectionObserver' in window)) {
      nodi.forEach(function (n) { n.classList.add('dentro'); });
      return;
    }
    var io = new IntersectionObserver(function (voci) {
      voci.forEach(function (v) {
        if (v.isIntersecting) { v.target.classList.add('dentro'); io.unobserve(v.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: .06 });
    nodi.forEach(function (n) { io.observe(n); });
  }

  /* =============================================================
     SETA IN WEBGL — luce calda, pieghe in movimento, raggi
     Generata a runtime: nessun video da scaricare.
     ============================================================= */
  function seta() {
    var cv = document.getElementById('heroCanvas');
    if (!cv) return;
    if (ridotto) { cv.remove(); return; }
    var gl = cv.getContext('webgl', { antialias: false, alpha: true, powerPreference: 'low-power' });
    if (!gl) { cv.remove(); return; }

    var vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    var fs = [
      'precision mediump float;',
      'uniform vec2 u_res;uniform float u_t;uniform vec2 u_m;',
      'float rnd(vec2 v){return fract(sin(dot(v,vec2(12.9898,78.233)))*43758.5453);}',
      'void main(){',
      '  vec2 uv=gl_FragCoord.xy/u_res.xy;',
      '  vec2 p=vec2(uv.x*(u_res.x/u_res.y),uv.y);',
      '  float t=u_t*0.070;',
      /* pieghe del tessuto: tre onde sovrapposte */
      '  float w=0.0;',
      '  w+=sin(p.x*2.4+t*1.8+sin(p.y*2.0-t*1.0)*1.6)*0.52;',
      '  w+=sin(p.x*4.8-t*1.15+sin(p.y*3.2+t*0.75)*1.2)*0.30;',
      '  w+=sin((p.x+p.y)*3.6+t*1.45)*0.20;',
      '  float piega=0.5+0.5*sin(w*3.14159+p.y*1.8);',
      '  float lucido=pow(piega,7.0);',
      '  float bordo=pow(piega,2.4)*0.26;',
      /* base satinata: nero profondo che si schiarisce sulle creste */
      '  vec3 base=mix(vec3(0.030,0.030,0.036),vec3(0.140,0.132,0.140),piega);',
      '  vec3 oro=vec3(0.855,0.735,0.470);',
      '  vec3 col=base+oro*(lucido*0.88+bordo*0.22);',
      /* sorgente luminosa in alto a destra + raggio diffuso */
      '  vec2 luce=vec2(0.78,0.76);',
      '  float d=distance(uv,luce);',
      '  col+=oro*0.30*exp(-d*d*5.0);',
      '  float raggio=pow(max(0.0,1.0-abs((uv.x-uv.y*0.55)-0.52)*2.6),3.0);',
      '  col+=oro*raggio*0.11*(0.65+0.35*sin(u_t*0.5));',
      /* alone che segue il puntatore */
      '  float dm=distance(uv,u_m);',
      '  col+=oro*0.16*exp(-dm*dm*9.0);',
      /* vignettatura morbida + grana */
      '  float v=smoothstep(1.35,0.20,distance(uv,vec2(0.5)));',
      '  col*=0.46+0.54*v;',
      '  col+=(rnd(uv*u_res.xy)-0.5)*0.020;',
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

    var uRes = gl.getUniformLocation(pr, 'u_res'),
        uT = gl.getUniformLocation(pr, 'u_t'),
        uM = gl.getUniformLocation(pr, 'u_m');
    var m = [0.74, 0.66], mDest = [0.74, 0.66];

    function misura() {
      var dpr = Math.min(window.devicePixelRatio || 1, 1.3);
      var w = Math.round(cv.clientWidth * dpr), h = Math.round(cv.clientHeight * dpr);
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); }
      gl.uniform2f(uRes, cv.width, cv.height);
    }
    window.addEventListener('resize', misura, { passive: true });
    window.addEventListener('pointermove', function (e) {
      var r = cv.getBoundingClientRect();
      mDest[0] = (e.clientX - r.left) / r.width;
      mDest[1] = 1 - (e.clientY - r.top) / r.height;
    }, { passive: true });

    var visibile = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (x) { visibile = x[0].isIntersecting; }).observe(cv);
    }
    var avvio = performance.now(), ultimo = 0;
    (function disegna(ora) {
      requestAnimationFrame(disegna);
      if (!visibile || document.hidden) return;
      if (ora - ultimo < 33) return;
      ultimo = ora;
      misura();
      m[0] += (mDest[0] - m[0]) * 0.06;
      m[1] += (mDest[1] - m[1]) * 0.06;
      gl.uniform1f(uT, (ora - avvio) / 1000);
      gl.uniform2f(uM, m[0], m[1]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    })(performance.now());
  }

  /* =============================================================
     PROFONDITÀ — schede sospese che seguono il puntatore
     ============================================================= */
  function profondita() {
    var schede = document.querySelectorAll('.hero-scheda');
    if (!schede.length || ridotto || tocco) return;
    var bx = 0, by = 0, dx = 0, dy = 0;
    window.addEventListener('pointermove', function (e) {
      dx = (e.clientX / window.innerWidth - .5) * 2;
      dy = (e.clientY / window.innerHeight - .5) * 2;
    }, { passive: true });
    (function passo() {
      requestAnimationFrame(passo);
      bx += (dx - bx) * .05; by += (dy - by) * .05;
      schede.forEach(function (s, i) {
        var f = (i + 1) * 7;
        s.style.transform = 'translate3d(' + (bx * f) + 'px,' + (by * f * .7) + 'px,0) rotateY(' + (bx * 6) + 'deg) rotateX(' + (-by * 5) + 'deg)';
      });
    })();
  }

  /* inclinazione 3D delle schede categoria */
  function inclina() {
    if (ridotto || tocco) return;
    document.querySelectorAll('[data-tilt]').forEach(function (c) {
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - .5;
        var y = (e.clientY - r.top) / r.height - .5;
        c.style.transform = 'rotateY(' + (x * 7) + 'deg) rotateX(' + (-y * 7) + 'deg) translateY(-6px)';
      });
      c.addEventListener('pointerleave', function () { c.style.transform = ''; });
    });
  }

  /* =============================================================
     PASSERELLA — trascinamento e frecce
     ============================================================= */
  function passerella() {
    document.querySelectorAll('.passerella-pista').forEach(function (pista) {
      var giu = false, x0 = 0, s0 = 0, mosso = false;
      pista.addEventListener('pointerdown', function (e) {
        giu = true; mosso = false; x0 = e.pageX; s0 = pista.scrollLeft;
        pista.classList.add('trascino');
      });
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
      var passo = pista.firstElementChild ? pista.firstElementChild.getBoundingClientRect().width + 18 : 300;
      pista.scrollBy({ left: b.dataset.scorri === 'avanti' ? passo : -passo, behavior: 'smooth' });
    });
  }

  /* =============================================================
     NAVIGAZIONE — isola + sipario
     ============================================================= */
  function navigazione() {
    var isola = document.querySelector('.isola');
    if (isola) {
      var applica = function () { document.body.classList.toggle('scrollato', window.scrollY > 40); };
      applica();
      window.addEventListener('scroll', applica, { passive: true });
    }
    var sipario = document.getElementById('sipario');
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-menu]')) {
        e.preventDefault();
        var aperto = document.body.classList.toggle('menu-aperto');
        if (sipario) { sipario.classList.toggle('aperto', aperto); sipario.setAttribute('aria-hidden', aperto ? 'false' : 'true'); }
        document.body.classList.toggle('no-scroll', aperto);
        return;
      }
      if (sipario && sipario.classList.contains('aperto') && e.target.closest('#sipario a')) {
        document.body.classList.remove('menu-aperto', 'no-scroll');
        sipario.classList.remove('aperto');
      }
    });
  }

  /* =============================================================
     FOTO E SCHEDE
     ============================================================= */
  function boxFoto(src, alt, monogramma, etichetta, classe) {
    return '<span class="foto ' + (classe || '') + '">' +
      '<span class="foto-vuota" aria-hidden="true">' +
        '<span class="foto-vuota-m">' + (monogramma || 'A') + '</span>' +
        '<span class="foto-vuota-t">' + (etichetta || 'Arabesque') + '</span>' +
      '</span>' +
      '<img src="' + src + '" alt="' + String(alt).replace(/"/g, '&quot;') + '" loading="lazy" decoding="async" onerror="this.remove()">' +
    '</span>';
  }

  function cardProdotto(p) {
    var finale = arbPrezzoFinale(p);
    var esaurito = !arbDisponibile(p);
    var inWish = leggiWishlist().indexOf(p.slug) !== -1;

    var badge = '';
    if (esaurito) badge = '<span class="tag capo-badge">Esaurito</span>';
    else if (p.sconto) badge = '<span class="tag pieno capo-badge">−' + p.sconto + '%</span>';
    else if ((p.linea || []).indexOf('novita') !== -1) badge = '<span class="tag oro capo-badge">Novità</span>';

    var chips = (p.taglie || []).slice(0, 8).map(function (t) {
      return '<button type="button" class="chip-taglia" data-slug="' + p.slug + '" data-taglia="' + t.id + '"' +
        (t.stock > 0 ? '' : ' disabled') + ' aria-label="Aggiungi ' + p.nome + ' taglia ' + t.id + '">' + t.id + '</button>';
    }).join('');

    return '<article class="capo entra">' +
      '<a class="capo-foto" href="prodotto.html?p=' + p.slug + '" aria-label="' + p.nome + '">' +
        badge + boxFoto(arbFoto(p, 1), p.nome, 'A', p.sottocategoria) +
      '</a>' +
      '<button type="button" class="capo-cuore' + (inWish ? ' attivo' : '') + '" data-wish="' + p.slug + '" aria-label="Salva tra i preferiti">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="' + (inWish ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="1.4"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>' +
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
      '<a class="btn btn-primario btn-blocco" href="checkout.html" style="margin-top:18px">Vai alla cassa' +
        '<span class="cerchio"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></a>' +
      '<p style="font-family:var(--f-dati);font-size:11px;color:var(--grigio);text-align:center;margin-top:14px">oppure <b style="color:var(--oro)">ritiri gratis a Busalla</b></p>';
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
    var f = d.querySelector('button, a, input'); if (f) f.focus();
  }
  function chiudiCassetti() {
    document.querySelectorAll('.cassetto').forEach(function (d) { d.classList.remove('aperto'); d.setAttribute('aria-hidden', 'true'); });
    var velo = document.getElementById('velo'); if (velo) velo.classList.remove('aperto');
    document.body.classList.remove('no-scroll');
    if (ultimoFocus) ultimoFocus.focus();
  }
  window.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    chiudiCassetti();
    if (document.body.classList.contains('menu-aperto')) {
      document.body.classList.remove('menu-aperto');
      var s = document.getElementById('sipario'); if (s) s.classList.remove('aperto');
    }
  });

  /* ---------------- eventi delegati ---------------- */
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-apri="carrello"]')) { e.preventDefault(); apriCarrello(); return; }
    if (e.target.closest('[data-chiudi]') || e.target.id === 'velo') { chiudiCassetti(); return; }

    var chip = e.target.closest('.chip-taglia[data-slug]');
    if (chip && !chip.disabled) { aggiungiAlCarrello(chip.dataset.slug, chip.dataset.taglia); return; }

    var wish = e.target.closest('[data-wish]');
    if (wish) {
      var w = leggiWishlist(), i = w.indexOf(wish.dataset.wish);
      if (i === -1) { w.push(wish.dataset.wish); avviso('Salvato tra i preferiti'); } else { w.splice(i, 1); }
      try { localStorage.setItem(LS_WISH, JSON.stringify(w)); } catch (err) {}
      wish.classList.toggle('attivo', i === -1);
      var svg = wish.querySelector('svg'); if (svg) svg.setAttribute('fill', i === -1 ? 'currentColor' : 'none');
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
    var fq = e.target.closest('.faq-q');
    if (fq) {
      var voce = fq.parentNode, gia = voce.classList.contains('aperta');
      voce.parentNode.querySelectorAll('.faq-voce').forEach(function (x) {
        x.classList.remove('aperta'); x.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });
      if (!gia) { voce.classList.add('aperta'); fq.setAttribute('aria-expanded', 'true'); }
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
  }

  /* ---------------- avvio ---------------- */
  function avvia() {
    applicaConfig();
    navigazione();
    seta();
    profondita();
    inclina();
    passerella();
    aggiornaPallino();
    renderCarrello();
    osserva();
    var hero = document.querySelector('.hero');
    if (hero) requestAnimationFrame(function () { hero.classList.add('entrato'); });
    var anno = document.getElementById('annoCorrente');
    if (anno) anno.textContent = new Date().getFullYear();
    if (location.hash === '#carrello') apriCarrello();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', avvia);
  else avvia();

  window.ARB = {
    cardProdotto: cardProdotto, boxFoto: boxFoto, aggiungi: aggiungiAlCarrello,
    leggiCart: leggiCart, scriviCart: scriviCart, totale: totaleCarrello,
    sconto: scontoCoupon, coupon: leggiCoupon, toast: avviso, avviso: avviso,
    reveal: osserva, apriCarrello: apriCarrello, inclina: inclina
  };
})();
