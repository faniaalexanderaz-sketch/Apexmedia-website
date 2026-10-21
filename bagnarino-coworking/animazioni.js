/* =============================================================
   BAGNARINO COWORKING — animazioni (GSAP + ScrollTrigger)
   Regola: niente che ritardi la lettura del titolo o del prezzo.
   - L'apertura (foto, righe del titolo, pianta) si anima in CSS:
     parte subito e non pesa nulla.
   - GSAP (file locali) arriva DOPO il caricamento e anima solo ciò
     che è sotto la piega: ciò che è già sullo schermo non si tocca.
   - Con "riduci movimento" o senza GSAP la pagina è già completa.
   ============================================================= */
(function () {
  'use strict';
  var ridotto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (ridotto) return;

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return [].slice.call((c || document).querySelectorAll(s)); }
  function sottoLaPiega(el) { return el.getBoundingClientRect().top > window.innerHeight * 0.92; }
  var puntatoreFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  function carica(src) {
    return new Promise(function (ok, ko) {
      var s = document.createElement('script');
      s.src = src; s.async = false; s.onload = ok; s.onerror = ko;
      document.head.appendChild(s);
    });
  }

  /* divide un testo in parole, mantenendo corsivi e link */
  function dividiInParole(el, classe, maschera) {
    var parole = [];
    (function visita(nodo) {
      [].slice.call(nodo.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frammento = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frammento.appendChild(document.createTextNode(p)); return; }
            var s = document.createElement('span'); s.className = classe; s.textContent = p;
            if (maschera) {
              var m = document.createElement('span'); m.className = 'maschera'; m.appendChild(s);
              frammento.appendChild(m);
            } else frammento.appendChild(s);
            parole.push(s);
          });
          n.parentNode.replaceChild(frammento, n);
        } else if (n.nodeType === 1) visita(n);
      });
    })(el);
    return parole;
  }

  function anima() {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    gsap.defaults({ ease: 'power3.out', duration: 0.9 });
    var desktop = window.matchMedia('(min-width: 900px)').matches;

    try {
      /* 0) barra di avanzamento della lettura, in alto */
      var avanzamento = document.createElement('div');
      avanzamento.className = 'avanzamento'; avanzamento.setAttribute('aria-hidden', 'true');
      document.body.appendChild(avanzamento);
      gsap.to(avanzamento, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

      /* 1) manifesto: le parole si accendono scorrendo */
      var manifesto = $('[data-manifesto]');
      if (manifesto) {
        var parole = dividiInParole(manifesto, 'parola', false);
        gsap.fromTo(parole, { color: '#857C6E' }, {
          color: function (i, el) { return el.closest('em') ? '#84601F' : '#0C1F45'; }, ease: 'none', stagger: 0.08,
          scrollTrigger: { trigger: manifesto, start: 'top 82%', end: 'bottom 48%', scrub: 0.6 }
        });
      }

      /* 2) titoli di sezione: le parole salgono da dietro una maschera */
      $$('.titolo-sezione, .finale h2').forEach(function (h) {
        if (!sottoLaPiega(h)) return;
        var p = dividiInParole(h, 'parola-su', true);
        gsap.from(p, { yPercent: 115, rotate: 4, duration: 1.1, ease: 'expo.out', stagger: 0.045,
          scrollTrigger: { trigger: h, start: 'top 88%', once: true } });
      });

      /* 3) numeri di sezione e introduzioni */
      $$('.numero-sezione').forEach(function (el) {
        if (!sottoLaPiega(el)) return;
        gsap.from(el, { x: -24, opacity: 0, duration: 0.8, scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
      });
      $$('.intro-sezione, .luogo-paragrafo, .confronto').forEach(function (el) {
        if (!sottoLaPiega(el)) return;
        gsap.from(el, { y: 30, opacity: 0, duration: 1, delay: 0.15, scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
      });

      /* 4) fotografie: compaiono in dissolvenza morbida, senza "tendine" */
      $$('[data-rivela]').forEach(function (fig) {
        if (!sottoLaPiega(fig)) return;
        gsap.from(fig, { opacity: 0, y: 28, duration: 1.4, ease: 'power2.out', clearProps: 'opacity,transform',
          scrollTrigger: { trigger: fig, start: 'top 88%', once: true } });
      });

      /* 4b) la nostra storia: il filo si traccia, le tappe arrivano una a una */
      var storia = $('.storia');
      if (storia && sottoLaPiega(storia)) {
        var tls = gsap.timeline({ scrollTrigger: { trigger: storia, start: 'top 82%', once: true } });
        tls.from(storia, { opacity: 0, y: 40, duration: 1, clearProps: 'opacity,transform' })
           .from($$('.storia-linea li', storia), { opacity: 0, x: -18, stagger: 0.18, duration: 0.7, clearProps: 'opacity,transform' }, 0.35);
      }

      /* 5) parallasse leggera sulle foto di sfondo */
      $$('[data-parallasse] img').forEach(function (img) {
        var box = img.closest('section') || img.parentNode;
        var primo = box.classList.contains('apertura');
        gsap.fromTo(img, { yPercent: primo ? 0 : -8 }, {
          yPercent: primo ? 12 : 8, ease: 'none',
          scrollTrigger: { trigger: box, start: primo ? 'top top' : 'top bottom', end: 'bottom top', scrub: true }
        });
      });

      /* 5b) disponibilità: i giorni e le scrivanie si posano in sequenza */
      var dispCard = $('[data-disp]');
      if (dispCard && sottoLaPiega(dispCard)) {
        gsap.from($$('.disp-giorno, .disp-scrivania', dispCard), { y: 20, opacity: 0, stagger: 0.04, duration: 0.6, clearProps: 'opacity,transform',
          scrollTrigger: { trigger: dispCard, start: 'top 85%', once: true } });
      }

      /* 6) cifre che contano (anni, scrivanie, prezzo) */
      $$('.cifre dd').forEach(function (dd) {
        var span = $('span', dd) || dd, m = span.textContent.trim().match(/^(\D*)(\d+)(\D*)$/);
        if (!m || !sottoLaPiega(dd)) return;
        var stato = { n: 0 }, fine = +m[2];
        span.textContent = m[1] + '0' + m[3];
        gsap.to(stato, {
          n: fine, duration: 1.6, ease: 'power2.out',
          scrollTrigger: { trigger: dd, start: 'top 90%', once: true },
          onUpdate: function () { span.textContent = m[1] + Math.round(stato.n) + m[3]; }
        });
      });

      /* 7) prezzi: le card si alzano in 3D, il prezzo conta, i servizi si spuntano */
      var prezzi = $('.prezzi');
      if (prezzi && sottoLaPiega(prezzi)) {
        var card = $$('.prezzo', prezzi);
        var tlp = gsap.timeline({ scrollTrigger: { trigger: prezzi, start: 'top 82%', once: true } });
        tlp.from(card, { y: 90, rotationX: -22, opacity: 0, transformOrigin: '50% 0%', duration: 1.1, ease: 'expo.out', stagger: 0.12, clearProps: 'opacity' });
        card.forEach(function (c, i) {
          var v = $('[data-cifra]', c), fine = v ? +v.getAttribute('data-cifra') : 0;
          if (v && fine > 0) {
            var st = { n: 0 };
            v.textContent = '0';
            tlp.to(st, { n: fine, duration: 1.2, ease: 'power3.out',
              onUpdate: function () { v.textContent = String(Math.round(st.n)); } }, 0.25 + i * 0.12);
          }
          tlp.from($$('.prezzo-include li', c), { x: -14, opacity: 0, duration: 0.5, stagger: 0.07, clearProps: 'transform,opacity' }, 0.55 + i * 0.12);
          tlp.from($$('.prezzo-etichetta', c), { scale: 0, rotate: -8, duration: 0.6, ease: 'back.out(2.2)' }, 0.7);
        });
      }

      /* 8) servizi, profili, domande: entrano in sequenza */
      [['.servizi', 'li:not([hidden])', 0.06], ['.profili', '.profilo', 0.1], ['.faq', 'details', 0.05], ['.cifre', '> div', 0.08]].forEach(function (g) {
        var box = $(g[0]);
        if (!box || !sottoLaPiega(box)) return;
        var voci = g[1].charAt(0) === '>' ? [].slice.call(box.children) : $$(g[1], box);
        gsap.from(voci, {
          y: 46, opacity: 0, scale: 0.97, stagger: g[2], duration: 0.9, clearProps: 'transform,opacity',
          scrollTrigger: { trigger: box, start: 'top 86%', once: true }
        });
      });
      $$('.servizi .ico').forEach(function (ico) {
        if (!sottoLaPiega(ico)) return;
        gsap.from(ico, { scale: 0, rotate: -30, duration: 0.7, ease: 'back.out(2.5)', clearProps: 'transform',
          scrollTrigger: { trigger: ico, start: 'top 90%', once: true } });
      });

      /* 9) come funziona: il filo ocra avanza mentre scorri */
      var passi = $('[data-passi]');
      if (passi) {
        if (desktop) {
          var linea = document.createElement('span');
          linea.className = 'passi-linea'; linea.setAttribute('aria-hidden', 'true');
          passi.appendChild(linea);
          gsap.fromTo(linea, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: passi, start: 'top 80%', end: 'top 30%', scrub: 0.5 } });
        }
        if (sottoLaPiega(passi)) {
          gsap.from($$('.passo', passi), { y: 60, opacity: 0, rotationX: -14, transformOrigin: '50% 0%', stagger: 0.15, duration: 1, clearProps: 'transform,opacity', scrollTrigger: { trigger: passi, start: 'top 82%', once: true } });
        }
      }

      /* 10) Bagnarino Card: la tessera arriva ruotando, i timbri si posano */
      var tessera = $('[data-inclina] .tessera');
      if (tessera && sottoLaPiega(tessera)) {
        gsap.from(tessera, { y: 80, rotationY: -28, rotationX: 12, opacity: 0, duration: 1.4, ease: 'expo.out', clearProps: 'opacity',
          scrollTrigger: { trigger: tessera, start: 'top 85%', once: true } });
      }
      var timbri = $$('[data-timbri] .timbro.pieno');
      if (timbri.length && sottoLaPiega(timbri[0])) {
        gsap.from(timbri, { scale: 1.8, opacity: 0, stagger: 0.09, duration: 0.45, ease: 'back.out(2.4)', clearProps: 'transform,opacity',
          scrollTrigger: { trigger: '[data-timbri]', start: 'top 80%', once: true } });
      }

      /* 11) dove siamo e chiusura */
      var scheda = $('.dove-scheda');
      if (scheda && sottoLaPiega(scheda)) gsap.from(scheda, { y: 80, opacity: 0, duration: 1.2, scrollTrigger: { trigger: scheda, start: 'top 85%', once: true } });
      $$('.finale .btn, .finale .badge').forEach(function (el, i) {
        if (!sottoLaPiega(el)) return;
        gsap.from(el, { y: 30, opacity: 0, duration: 0.9, delay: 0.25 + i * 0.1, scrollTrigger: { trigger: el, start: 'top 95%', once: true } });
      });

      /* 12) su computer: card prezzi che si inclinano e pulsanti "magnetici" */
      if (puntatoreFine) {
        $$('[data-card-prezzo]').forEach(function (c) {
          var rx = gsap.quickTo(c, 'rotationX', { duration: 0.5, ease: 'power3' });
          var ry = gsap.quickTo(c, 'rotationY', { duration: 0.5, ease: 'power3' });
          var y = gsap.quickTo(c, 'y', { duration: 0.5, ease: 'power3' });
          c.addEventListener('pointermove', function (e) {
            var r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
            rx((0.5 - py) * 8); ry((px - 0.5) * 10); y(-8);
            c.style.setProperty('--mx', (px * 100).toFixed(1) + '%'); c.style.setProperty('--my', (py * 100).toFixed(1) + '%');
          });
          c.addEventListener('pointerleave', function () { rx(0); ry(0); y(0); });
        });
        $$('.btn-grande, .finale .btn, .testata .btn-ocra').forEach(function (b) {
          var bx = gsap.quickTo(b, 'x', { duration: 0.4, ease: 'power3' }), by = gsap.quickTo(b, 'y', { duration: 0.4, ease: 'power3' });
          b.addEventListener('pointermove', function (e) {
            var r = b.getBoundingClientRect();
            bx((e.clientX - r.left - r.width / 2) * 0.18); by((e.clientY - r.top - r.height / 2) * 0.3);
          });
          b.addEventListener('pointerleave', function () { bx(0); by(0); });
        });
      }
    } catch (e) {
      /* rete di sicurezza: nulla deve restare nascosto */
      try { ScrollTrigger.getAll().forEach(function (t) { t.kill(); }); } catch (x) {}
      $$('[style]').forEach(function (el) { el.style.opacity = ''; el.style.transform = ''; el.style.clipPath = ''; });
      $$('[data-cifra]').forEach(function (v) { v.textContent = v.getAttribute('data-cifra'); });
    }
  }

  /* la tessera si inclina seguendo il puntatore (solo mouse/penna) */
  function inclinaTessera() {
    var scena = $('[data-inclina]'), card = scena && $('.tessera', scena);
    if (!card || !puntatoreFine) return;
    var rx = 0, ry = 0, tx = 0, ty = 0, attivo = false;
    function ciclo() {
      rx += (tx - rx) * 0.12; ry += (ty - ry) * 0.12;
      card.style.transform = 'rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
      card.style.setProperty('--luce', (ry * 4).toFixed(1) + '%');
      if (attivo || Math.abs(tx - rx) > 0.05 || Math.abs(ty - ry) > 0.05) requestAnimationFrame(ciclo);
    }
    scena.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      tx = -((e.clientY - r.top) / r.height - 0.5) * 14;
      ty = ((e.clientX - r.left) / r.width - 0.5) * 18;
      if (!attivo) { attivo = true; requestAnimationFrame(ciclo); }
    });
    scena.addEventListener('pointerleave', function () { tx = 0; ty = 0; attivo = false; requestAnimationFrame(ciclo); });
  }

  function avvia() {
    carica('/vendor/gsap/gsap.min.js')
      .then(function () { return carica('/vendor/gsap/ScrollTrigger.min.js'); })
      .then(function () { anima(); inclinaTessera(); })
      .catch(function () { inclinaTessera(); });
  }
  /* tutto ciò che si anima è sotto la piega: GSAP parte al primo gesto
     (scorrere, toccare, tastiera), così il caricamento resta leggero */
  var partito = false, gesti = ['scroll', 'wheel', 'touchstart', 'pointerdown', 'keydown'];
  function primoGesto() {
    if (partito) return; partito = true;
    gesti.forEach(function (g) { window.removeEventListener(g, primoGesto); });
    avvia();
  }
  function arma() {
    if (window.scrollY > 0) { primoGesto(); return; }
    gesti.forEach(function (g) { window.addEventListener(g, primoGesto, { passive: true }); });
  }
  if (document.readyState === 'complete') arma();
  else window.addEventListener('load', arma);
})();
