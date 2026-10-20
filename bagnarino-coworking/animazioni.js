/* =============================================================
   BAGNARINO COWORKING — animazioni
   Regola: niente che ritardi la lettura del titolo o del prezzo.
   - La pianta dell'hero si anima in CSS (styles.css): parte subito
     e non pesa nulla.
   - GSAP + ScrollTrigger (file locali) si caricano solo DOPO che la
     pagina è pronta e servono alle sezioni sotto la piega.
   Senza GSAP o con "riduci movimento" la pagina è già completa.
   ============================================================= */
(function () {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function $$(s, c) { return [].slice.call((c || document).querySelectorAll(s)); }
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
      /* blocchi sotto la piega: entrano leggeri, una volta sola.
         Ciò che è già sullo schermo non si tocca. */
      var gruppi = [
        ['.prezzi', '.prezzo'], ['.passi', '.passo'], ['.galleria', '.foto-segnaposto'],
        ['.servizi', 'li:not([hidden])'], ['.profili', '.profilo']
      ];
      gruppi.forEach(function (g) {
        var box = document.querySelector(g[0]);
        if (!box || box.getBoundingClientRect().top < window.innerHeight) return;
        var figli = $$(g[1], box);
        if (!figli.length) return;
        gsap.from(figli, {
          opacity: 0, y: 18, duration: 0.5, stagger: 0.07, ease: 'power2.out', clearProps: 'opacity,transform',
          scrollTrigger: { trigger: box, start: 'top 85%', once: true }
        });
      });

      /* la tessera: i timbri si posano uno dopo l'altro */
      var tessera = document.querySelector('[data-timbri]');
      if (tessera && tessera.getBoundingClientRect().top > window.innerHeight) {
        gsap.from($$('.timbro.pieno', tessera), {
          scale: 1.6, opacity: 0, duration: 0.32, stagger: 0.09, ease: 'back.out(2.2)', clearProps: 'opacity,transform',
          scrollTrigger: { trigger: tessera, start: 'top 80%', once: true }
        });
      }
    } catch (e) {
      /* rete di sicurezza: nulla deve restare nascosto */
      try { ScrollTrigger.getAll().forEach(function (t) { t.kill(); }); } catch (x) {}
      $$('[style]').forEach(function (el) { el.style.opacity = ''; el.style.transform = ''; });
    }
  }

  function avvia() {
    carica('/vendor/gsap/gsap.min.js')
      .then(function () { return carica('/vendor/gsap/ScrollTrigger.min.js'); })
      .then(anima)
      .catch(function () {});
  }
  var dopo = window.requestIdleCallback || function (fn) { setTimeout(fn, 200); };
  if (document.readyState === 'complete') dopo(avvia);
  else window.addEventListener('load', function () { dopo(avvia); });
})();
