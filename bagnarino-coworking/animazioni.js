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
  function carica(src) {
    return new Promise(function (ok, ko) {
      var s = document.createElement('script');
      s.src = src; s.async = false; s.onload = ok; s.onerror = ko;
      document.head.appendChild(s);
    });
  }

  /* ---------- la frase manifesto: le parole si accendono scorrendo ---------- */
  function dividiInParole(el) {
    var parole = [];
    (function visita(nodo) {
      [].slice.call(nodo.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var pezzi = n.textContent.split(/(\s+)/), frammento = document.createDocumentFragment();
          pezzi.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frammento.appendChild(document.createTextNode(p)); return; }
            var s = document.createElement('span'); s.className = 'parola'; s.textContent = p;
            frammento.appendChild(s); parole.push(s);
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
      /* 1) manifesto */
      var manifesto = $('[data-manifesto]');
      if (manifesto) {
        var parole = dividiInParole(manifesto);
        /* da un grigio caldo ancora leggibile (contrasto 3.5:1) al colore pieno */
        gsap.fromTo(parole, { color: '#857C6E' }, {
          color: function (i, el) { return el.closest('em') ? '#84601F' : '#1B2A3A'; }, ease: 'none', stagger: 0.08,
          scrollTrigger: { trigger: manifesto, start: 'top 82%', end: 'bottom 48%', scrub: 0.6 }
        });
      }

      /* 2) numeri di sezione: il filo ocra si traccia, i titoli salgono */
      $$('.numero-sezione, .titolo-sezione, .intro-sezione').forEach(function (el) {
        if (!sottoLaPiega(el)) return;
        gsap.from(el, { y: 36, opacity: 0, duration: 1, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
      });

      /* 3) fotografie: si scoprono dal basso, l'immagine si assesta */
      $$('[data-rivela]').forEach(function (fig) {
        if (!sottoLaPiega(fig)) return;
        var img = $('img', fig);
        var tl = gsap.timeline({ scrollTrigger: { trigger: fig, start: 'top 85%', once: true } });
        tl.fromTo(fig, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.out', clearProps: 'clipPath' })
          .from(img, { scale: 1.18, duration: 1.6, ease: 'expo.out', clearProps: 'transform' }, 0);
      });

      /* 4) parallasse leggera sulle foto di sfondo */
      $$('[data-parallasse] img').forEach(function (img) {
        var box = img.closest('section') || img.parentNode;
        var primo = box.classList.contains('apertura');
        gsap.fromTo(img, { yPercent: primo ? 0 : -6 }, {
          yPercent: primo ? 12 : 6, ease: 'none',
          scrollTrigger: { trigger: box, start: primo ? 'top top' : 'top bottom', end: 'bottom top', scrub: true }
        });
      });

      /* 5) cifre che contano (anni, scrivanie, prezzo) */
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

      /* 6) prezzi, servizi, profili, domande: entrano in sequenza */
      [['.prezzi', '.prezzo', 0.08], ['.servizi', 'li:not([hidden])', 0.06], ['.profili', '.profilo', 0.1], ['.faq', 'details', 0.05]].forEach(function (g) {
        var box = $(g[0]);
        if (!box || !sottoLaPiega(box)) return;
        gsap.from($$(g[1], box), {
          y: 40, opacity: 0, stagger: g[2], duration: 0.9, clearProps: 'transform,opacity',
          scrollTrigger: { trigger: box, start: 'top 85%', once: true }
        });
      });

      /* 7) come funziona: il filo ocra avanza mentre scorri */
      var passi = $('[data-passi]');
      if (passi) {
        if (desktop) {
          var linea = document.createElement('span');
          linea.className = 'passi-linea'; linea.setAttribute('aria-hidden', 'true');
          passi.appendChild(linea);
          gsap.fromTo(linea, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: passi, start: 'top 80%', end: 'top 30%', scrub: 0.5 } });
        }
        if (sottoLaPiega(passi)) {
          gsap.from($$('.passo', passi), { y: 50, opacity: 0, stagger: 0.15, duration: 1, clearProps: 'transform,opacity', scrollTrigger: { trigger: passi, start: 'top 82%', once: true } });
        }
      }

      /* 8) Bagnarino Card: i timbri si posano uno alla volta */
      var timbri = $$('[data-timbri] .timbro.pieno');
      if (timbri.length && sottoLaPiega(timbri[0])) {
        gsap.from(timbri, { scale: 1.8, opacity: 0, stagger: 0.09, duration: 0.45, ease: 'back.out(2.4)', clearProps: 'transform,opacity',
          scrollTrigger: { trigger: '[data-timbri]', start: 'top 80%', once: true } });
      }

      /* 9) chiusura: il titolo sale */
      var finale = $('.finale h2');
      if (finale && sottoLaPiega(finale)) gsap.from(finale, { y: 60, opacity: 0, duration: 1.2, scrollTrigger: { trigger: finale, start: 'top 85%', once: true } });

      /* 10) scheda "dove siamo" */
      var scheda = $('.dove-scheda');
      if (scheda && sottoLaPiega(scheda)) gsap.from(scheda, { y: 80, opacity: 0, duration: 1.2, scrollTrigger: { trigger: scheda, start: 'top 85%', once: true } });
    } catch (e) {
      /* rete di sicurezza: nulla deve restare nascosto */
      try { ScrollTrigger.getAll().forEach(function (t) { t.kill(); }); } catch (x) {}
      $$('[style]').forEach(function (el) { el.style.opacity = ''; el.style.transform = ''; el.style.clipPath = ''; });
    }
  }

  /* la tessera si inclina seguendo il puntatore (solo mouse/penna) */
  function inclinaTessera() {
    var scena = $('[data-inclina]'), card = scena && $('.tessera', scena);
    if (!card || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
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
    inclinaTessera();
    carica('/vendor/gsap/gsap.min.js')
      .then(function () { return carica('/vendor/gsap/ScrollTrigger.min.js'); })
      .then(anima)
      .catch(function () {});
  }
  var dopo = window.requestIdleCallback || function (fn) { setTimeout(fn, 200); };
  if (document.readyState === 'complete') dopo(avvia);
  else window.addEventListener('load', function () { dopo(avvia); });
})();
