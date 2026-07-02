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
     1) CAMERA — fisica del walkthrough
     Per ogni sezione, p = scostamento del suo centro dal centro
     viewport (in viewport-unit). p=1 sotto (in arrivo), 0 a fuoco,
     -1 sopra (attraversata).

     Dolly-forward: la scena CRESCE mentre la si attraversa
       scale(p) = 1.045 − p·0.045   →  0.99 lontana · 1.045 a fuoco
                                       · ~1.10 mentre la superi
     (come camminare in avanti: la stanza si avvicina, ti supera).

     Inerzia: i valori correnti inseguono i target con damping
     esponenziale (1 − e^(−k·dt)) → la camera ha massa, accelera
     e decelera come una steadicam, mai agganciata 1:1 allo scroll.
     Solo transform/opacity, z-index pilotato dall'opacità.
     ============================================================= */
  var K = 7.2;                 // rigidità del follow (più alto = più reattivo)
  var EPS = 0.0006;
  var cur = [], tgt = [];
  for (var i = 0; i < n; i++) {
    cur.push({ o: i === 0 ? 1 : 0, s: 1.045, y: 0 });
    tgt.push({ o: i === 0 ? 1 : 0, s: 1.045, y: 0 });
  }

  function computeTargets() {
    var vh = window.innerHeight;
    var vpCenter = vh / 2;
    for (var i = 0; i < n; i++) {
      var r = sections[i].getBoundingClientRect();
      var p = (r.top + r.height / 2 - vpCenter) / vh;
      p = Math.max(-1.2, Math.min(1.2, p));
      tgt[i].o = 1 - smootherstep(0.10, 0.88, Math.abs(p));
      if (reduceMotion) { tgt[i].s = 1; tgt[i].y = 0; }
      else { tgt[i].s = 1.045 - p * 0.045; tgt[i].y = p * 2.0; }
    }
  }

  function apply(i) {
    var c = cur[i];
    var l = layers[i];
    l.style.opacity = c.o.toFixed(4);
    l.style.transform = 'translate3d(0,' + c.y.toFixed(3) + 'vh,0) scale(' + c.s.toFixed(4) + ')';
    l.style.zIndex = String(Math.round(c.o * 1000));
  }

  var running = false;
  var lastT = 0;

  function tick(now) {
    var dt = Math.min(0.05, (now - lastT) / 1000) || 0.016;
    lastT = now;
    computeTargets();
    var settled = true;
    var k = reduceMotion ? 1 : 1 - Math.exp(-K * dt);
    for (var i = 0; i < n; i++) {
      var c = cur[i], t = tgt[i];
      c.o += (t.o - c.o) * k;
      c.s += (t.s - c.s) * k;
      c.y += (t.y - c.y) * k;
      if (Math.abs(t.o - c.o) > EPS || Math.abs(t.s - c.s) > EPS || Math.abs(t.y - c.y) > 0.01) settled = false;
      apply(i);
    }
    if (settled) { running = false; return; }
    requestAnimationFrame(tick);
  }

  function wake() {
    if (!running) {
      running = true;
      lastT = performance.now();
      requestAnimationFrame(tick);
    }
  }

  window.addEventListener('scroll', wake, { passive: true });
  window.addEventListener('resize', wake, { passive: true });
  window.addEventListener('orientationchange', wake, { passive: true });
  window.addEventListener('load', wake);
  // primo frame: allinea subito senza inerzia
  computeTargets();
  for (var j = 0; j < n; j++) { cur[j].o = tgt[j].o; cur[j].s = tgt[j].s; cur[j].y = tgt[j].y; apply(j); }
  wake();

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
