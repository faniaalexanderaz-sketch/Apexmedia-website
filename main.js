/* =============================================================
   APEXMEDIA — interazioni
   1) Camera walkthrough: dolly-forward con inerzia (damped follow)
   2) Lazy-load dei background (IntersectionObserver)
   3) Reveal: animation-timeline: view() dove supportato, IO fallback
   4) Form → costruzione dinamica link WhatsApp + window.open
   ============================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var sections = Array.prototype.slice.call(document.querySelectorAll('.panel[data-section]'));
  var layers = Array.prototype.slice.call(document.querySelectorAll('.bg-layer[data-bg]'));
  var n = Math.min(sections.length, layers.length);

  /* smootherstep: accelerazione/decelerazione dolce ai capi (C2-continua) */
  function smootherstep(a, b, x) {
    var t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  /* =============================================================
     1) CAMERA — geometria prospettica reale + respiro steadicam
     Per ogni sezione, p = scostamento del suo centro dal centro
     viewport. p=1 sotto (lontana), 0 a fuoco, -1 sopra (superata).

     Dolly su asse Z: i layer si muovono in profondità dentro una
     prospettiva vera (perspective sul palcoscenico, CSS).
       z(p) = −p·Z  →  lontana dietro il fuoco · a fuoco a z=0
                        · ti passa accanto crescendo oltre
     La scala emerge dalla prospettiva: crescita NON lineare, che
     accelera avvicinandosi — la firma fisica di una camera reale,
     impossibile da ottenere con scale() lineare.

     Respiro steadicam: deriva impercettibile e continua (±3px,
     ~8s) applicata al palcoscenico anche a scroll fermo — la
     presenza dell'operatore. Disattivata con reduced-motion.

     Inerzia: damping esponenziale (1 − e^(−k·dt)) — la camera ha
     massa, accelera e decelera, mai agganciata 1:1 allo scroll.
     ============================================================= */
  var stage = document.querySelector('.stage');
  var isMobile = window.matchMedia('(max-width: 820px)').matches;
  /* il fuoco sta DIETRO il piano prospettico: con l'overscan CSS,
     a fuoco l'immagine copre appena il frame (~1.05) e la corsa Z
     si sviluppa attorno a quel punto — mai sovra-ingrandita */
  var ZBASE = isMobile ? -150 : -215;   // profondità del punto di fuoco (px)
  var ZTRAVEL = isMobile ? 150 : 245;   // corsa del dolly (px) — un filo più profonda
  var K = 6.8;                          // rigidità del follow
  var cur = [], tgt = [];
  for (var i = 0; i < n; i++) {
    cur.push({ o: i === 0 ? 1 : 0, z: ZBASE, y: 0 });
    tgt.push({ o: i === 0 ? 1 : 0, z: ZBASE, y: 0 });
  }

  function computeTargets() {
    var vh = window.innerHeight;
    var vpCenter = vh / 2;
    for (var i = 0; i < n; i++) {
      var r = sections[i].getBoundingClientRect();
      var p = (r.top + r.height / 2 - vpCenter) / vh;
      p = Math.max(-1.2, Math.min(1.2, p));
      tgt[i].o = 1 - smootherstep(0.14, 0.86, Math.abs(p));
      if (reduceMotion) { tgt[i].z = ZBASE; tgt[i].y = 0; }
      else { tgt[i].z = ZBASE - p * ZTRAVEL; tgt[i].y = p * 1.6; }
    }
  }

  function apply(i) {
    var c = cur[i];
    var l = layers[i];
    l.style.opacity = c.o.toFixed(4);
    l.style.transform = 'translate3d(0,' + c.y.toFixed(3) + 'vh,' + c.z.toFixed(2) + 'px)';
    l.style.zIndex = String(Math.round(c.o * 500));
  }

  var lastT = 0;

  function tick(now) {
    var dt = Math.min(0.05, (now - lastT) / 1000) || 0.016;
    lastT = now;
    computeTargets();
    var k = reduceMotion ? 1 : 1 - Math.exp(-K * dt);
    for (var i = 0; i < n; i++) {
      var c = cur[i], t = tgt[i];
      c.o += (t.o - c.o) * k;
      c.z += (t.z - c.z) * k;
      c.y += (t.y - c.y) * k;
      apply(i);
    }
    // respiro steadicam: la camera non è mai perfettamente ferma
    if (!reduceMotion && stage) {
      var dx = Math.sin(now * 0.00013) * 3;
      var dy = Math.cos(now * 0.00010) * 2.4;
      stage.style.transform = 'translate3d(' + dx.toFixed(2) + 'px,' + dy.toFixed(2) + 'px,0)';
    }
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function () {
    isMobile = window.matchMedia('(max-width: 820px)').matches;
    ZBASE = isMobile ? -150 : -215;
    ZTRAVEL = isMobile ? 150 : 245;
  }, { passive: true });

  // primo frame: allinea subito senza inerzia, poi loop continuo
  computeTargets();
  for (var j = 0; j < n; j++) { cur[j].o = tgt[j].o; cur[j].z = tgt[j].z; cur[j].y = tgt[j].y; apply(j); }
  lastT = performance.now();
  requestAnimationFrame(tick);

  /* =============================================================
     2) LAZY-LOAD — imposta il background del layer quando la sua
        sezione si avvicina (~1.5 viewport). La prima è già in CSS.
     ============================================================= */
  function loadLayer(layer) {
    var src = layer.getAttribute('data-bg-src');
    if (src) {
      layer.style.backgroundImage = "url('" + src + "')";
      layer.removeAttribute('data-bg-src');
    }
  }
  var lazyLayers = Array.prototype.slice.call(document.querySelectorAll('.bg-layer[data-bg-src]'));
  if ('IntersectionObserver' in window && lazyLayers.length) {
    var lazyIO = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { loadLayer(e.target); obs.unobserve(e.target); }
      });
    }, { rootMargin: '150% 0px 150% 0px' });
    lazyLayers.forEach(function (l) { lazyIO.observe(l); });
  } else {
    lazyLayers.forEach(loadLayer);
  }

  /* =============================================================
     2b) HERO VIDEO — camera-walk (Seedance). Carica la sorgente,
        e mette in pausa quando la Hero è fuori vista (batteria/CPU).
        Su reduced-motion resta il poster fermo (nessun autoplay).
     ============================================================= */
  var heroVideo = document.querySelector('.bg-video');
  if (heroVideo) {
    var vsrc = heroVideo.getAttribute('data-hero-video') || '';
    var validSrc = /^https?:\/\//.test(vsrc);
    if (validSrc && !reduceMotion) {
      heroVideo.src = vsrc;
      var tryPlay = function () { var p = heroVideo.play(); if (p && p.catch) p.catch(function () {}); };
      heroVideo.addEventListener('canplay', tryPlay, { once: true });
      tryPlay();
      // pausa quando la Hero esce dal viewport
      var heroPanel = document.getElementById('hero');
      if (heroPanel && 'IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) tryPlay(); else heroVideo.pause();
          });
        }, { threshold: 0.05 }).observe(heroPanel);
      }
    }
  }

  /* =============================================================
     3) REVEAL — scroll-timeline nativo dove c'è, IO altrimenti.
     ============================================================= */
  var supportsVT = !reduceMotion && typeof CSS !== 'undefined' &&
    CSS.supports && CSS.supports('animation-timeline: view()');

  if (supportsVT) {
    document.documentElement.classList.add('has-vt');
  } else if (!reduceMotion && 'IntersectionObserver' in window) {
    document.querySelectorAll('.panel-inner').forEach(function (inner) {
      inner.querySelectorAll(':scope > .reveal').forEach(function (el, idx) {
        el.style.setProperty('--d', (idx * 90) + 'ms');
      });
    });
    var revealIO = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(function (el) { revealIO.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  /* =============================================================
     4) FORM → WhatsApp
     ============================================================= */
  var PHONE = '393515940685';
  var form = document.getElementById('leadForm');
  var errEl = document.getElementById('formError');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nome = form.nome.value.trim();
      var email = form.email.value.trim();
      var tel = form.telefono.value.trim();
      if (!nome || !email || !tel) {
        if (errEl) errEl.hidden = false;
        (!nome ? form.nome : !email ? form.email : form.telefono).focus();
        return;
      }
      if (errEl) errEl.hidden = true;
      var msg = 'Ciao, mi chiamo ' + nome + ', vorrei prenotare una consulenza. ' +
                'Email: ' + email + ', Tel: ' + tel;
      window.open('https://wa.me/' + PHONE + '?text=' + encodeURIComponent(msg),
                  '_blank', 'noopener,noreferrer');
    });
    form.addEventListener('input', function () {
      if (errEl && !errEl.hidden) errEl.hidden = true;
    });
  }
})();
