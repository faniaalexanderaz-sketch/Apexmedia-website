/* =============================================================
   BAGNARINO COWORKING — animazioni (GSAP + ScrollTrigger)
   Meno ma migliori:
   - una sola "firma": la linea del tempo della storia, che si
     traccia mentre scorri e accende le tappe una a una;
   - tutto il resto compare in modo quasi impercettibile;
   - l'apertura si anima in CSS (subito, senza pesare).
   GSAP parte al primo gesto e rispetta "riduci movimento".
   Senza GSAP la pagina è già completa.
   ============================================================= */
(function () {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return [].slice.call((c || document).querySelectorAll(s)); }
  function sottoLaPiega(el) { return el.getBoundingClientRect().top > window.innerHeight * 0.9; }
  function carica(src) {
    return new Promise(function (ok, ko) {
      var s = document.createElement('script');
      s.src = src; s.async = false; s.onload = ok; s.onerror = ko;
      document.head.appendChild(s);
    });
  }

  function anima() {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    try {
      /* 1) la storia: il filo avanza con lo scorrimento, le tappe si accendono */
      var storia = $('.storia-sezione'), tempo = storia && $('[data-tempo]', storia);
      if (tempo) {
        var tappe = $$('.tappa', tempo), n = tappe.length;
        storia.classList.add('animata');
        tempo.style.setProperty('--avanza', '0');
        ScrollTrigger.create({
          trigger: tempo, start: 'top 78%', end: 'bottom 55%', scrub: 0.4,
          onUpdate: function (st) {
            var p = st.progress;
            tempo.style.setProperty('--avanza', p.toFixed(3));
            tappe.forEach(function (t, i) { t.classList.toggle('accesa', p >= (n > 1 ? i / (n - 1) : 0) * 0.96); });
          }
        });
      }

      /* 2) comparsa discreta: un filo di movimento, niente effetti */
      var discreti = $$('.testa-sezione, .negozio-testo, .accoglie, .prezzo, .prezzi-garanzie li, .giornata li, .dotazione > div, .premi-scala li, .vantaggi-mese, .fidelity-azioni, .profilo, .faq details, .dove-scheda, .mappa, .finale-interno > *')
        .filter(sottoLaPiega);
      if (discreti.length) {
        gsap.set(discreti, { opacity: 0, y: 12 });
        ScrollTrigger.batch(discreti, {
          start: 'top 90%', once: true,
          onEnter: function (gruppo) {
            gsap.to(gruppo, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.06, clearProps: 'opacity,transform' });
          }
        });
      }

      /* 3) Bagnarino Card: i timbri si posano uno alla volta */
      var timbri = $$('[data-timbri] .timbro.pieno');
      if (timbri.length && sottoLaPiega(timbri[0])) {
        gsap.from(timbri, { scale: 1.7, opacity: 0, rotation: -25, stagger: 0.09, duration: 0.32, ease: 'power3.in', clearProps: 'transform,opacity',
          scrollTrigger: { trigger: '[data-timbri]', start: 'top 80%', once: true } });
      }

      /* 4) le foto si scoprono a tendina, con un filo di zoom e di parallasse */
      $$('[data-foto-rivela]').forEach(function (fig) {
        var mask = $('.foto-maschera', fig), img = $('img', fig);
        if (!mask || !img) return;
        if (sottoLaPiega(fig)) {
          var tl = gsap.timeline({ scrollTrigger: { trigger: fig, start: 'top 85%', once: true } });
          tl.fromTo(mask, { clipPath: 'inset(100% 0% 0% 0% round 4px)' }, { clipPath: 'inset(0% 0% 0% 0% round 4px)', duration: 1.1, ease: 'expo.out', clearProps: 'clipPath' })
            .fromTo(img, { scale: 1.18 }, { scale: 1.06, duration: 1.4, ease: 'expo.out' }, 0);
          var cap = $('figcaption', fig);
          if (cap) tl.from(cap, { opacity: 0, y: 8, duration: 0.5, ease: 'power2.out', clearProps: 'opacity,transform' }, 0.45);
        } else gsap.set(img, { scale: 1.06 });
        gsap.fromTo(img, { yPercent: -3 }, { yPercent: 3, ease: 'none', scrollTrigger: { trigger: fig, start: 'top bottom', end: 'bottom top', scrub: true } });
      });

    } catch (e) {
      /* rete di sicurezza: nulla deve restare nascosto */
      try { ScrollTrigger.getAll().forEach(function (t) { t.kill(); }); } catch (x) {}
      $$('[style]').forEach(function (el) { el.style.opacity = ''; el.style.transform = ''; el.style.clipPath = ''; });
      var s = $('.storia-sezione'); if (s) s.classList.remove('animata');
    }
  }

  /* GSAP parte al primo gesto (scorrere, toccare, tastiera):
     il caricamento della pagina resta leggero */
  var partito = false, gesti = ['scroll', 'wheel', 'touchstart', 'pointerdown', 'keydown'];
  function avvia() {
    if (partito) return; partito = true;
    gesti.forEach(function (g) { window.removeEventListener(g, avvia); });
    carica('/vendor/gsap/gsap.min.js')
      .then(function () { return carica('/vendor/gsap/ScrollTrigger.min.js'); })
      .then(anima)
      .catch(function () {});
  }
  function arma() {
    if (window.scrollY > 0) { avvia(); return; }
    gesti.forEach(function (g) { window.addEventListener(g, avvia, { passive: true }); });
  }
  if (document.readyState === 'complete') arma();
  else window.addEventListener('load', arma);
})();
