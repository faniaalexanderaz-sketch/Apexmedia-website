/* =============================================================
   ANTICA FIORERIA DEL CENTRO — animazioni (GSAP)
   1) Hero: titolo parola per parola, CTA entro ~1s
   2) Titoli di sezione: parole che salgono da una maschera
   3) Blocchi .reveal: ingresso morbido a scorrimento, a gruppi
   4) Numeri di fiducia che contano (data-conta)
   5) Fregio d'oro disegnato a mano (DrawSVG)
   Va caricato PRIMA di main.js: prende in carico i .reveal. Se GSAP
   non c'è o l'utente preferisce meno movimento, non fa nulla e resta
   il reveal CSS di main.js.
   ============================================================= */
(function () {
  'use strict';

  if (!window.gsap || !window.ScrollTrigger || !window.SplitText) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.registerPlugin(ScrollTrigger, SplitText);
  if (window.DrawSVGPlugin) gsap.registerPlugin(DrawSVGPlugin);

  var EASE = 'power3.out';
  var ORO = '#C2A45C';

  /* toglie l'elemento al reveal CSS: da qui in poi lo anima GSAP */
  function prendi(el) { el.classList.remove('reveal', 'in'); }

  /* parole in maschera: salgono dal basso senza toccare l'opacità,
     così il testo resta un candidato LCP valido */
  function dividi(el) {
    return SplitText.create(el, { type: 'words', mask: 'words', wordsClass: 'sw' });
  }

  /* ---------- 1) Hero ---------- */
  (function () {
    var hero = document.querySelector('.hero-copy');
    if (!hero) return;

    var titolo = hero.querySelector('.hero-titolo');
    var eyebrow = hero.querySelector('.hero-eyebrow');
    var sub = hero.querySelector('.hero-sub');
    var badge = hero.querySelector('.hero-badge-riga');
    var cta = hero.querySelector('.btn-hero');
    var punti = hero.querySelectorAll('.hero-fiducia li');
    var foto = document.querySelector('.hero-sfondo img');

    [titolo, eyebrow, sub, badge, cta].concat([].slice.call(punti))
      .forEach(function (el) { if (el) prendi(el); });

    var tl = gsap.timeline({ defaults: { ease: EASE } });

    /* Ken Burns leggero sulla foto: solo scala, mai opacità (è l'LCP) */
    if (foto) tl.fromTo(foto, { scale: 1.08 }, { scale: 1, duration: 2.4, ease: 'power2.out' }, 0);

    if (eyebrow) {
      tl.from(eyebrow, { opacity: 0, duration: 0.6 }, 0.05);
      var etichetta = eyebrow.querySelector('span');
      if (etichetta) tl.from(etichetta, { letterSpacing: '.5em', duration: 1.1, ease: 'power2.out' }, 0.05);
    }

    if (titolo) {
      var split = dividi(titolo);
      tl.from(split.words, {
        yPercent: 115, duration: 0.9, ease: 'power4.out', stagger: 0.06,
        onComplete: function () { split.revert(); }
      }, 0.12);
      var em = titolo.querySelectorAll('em');
      if (em.length) tl.from(em, { color: ORO, duration: 1.2, ease: 'power1.out' }, 0.55);
    }

    if (sub) tl.from(sub, { opacity: 0, y: 16, duration: 0.7 }, 0.4);
    if (badge) tl.from(badge, { opacity: 0, y: 14, duration: 0.7 }, 0.5);
    if (cta) {
      tl.from(cta, { opacity: 0, y: 16, scale: 0.96, duration: 0.7, clearProps: 'transform' }, 0.58);
      var freccia = cta.querySelector('.btn-freccia');
      if (freccia) tl.from(freccia, { x: -8, duration: 0.6, clearProps: 'transform' }, 0.8);
    }
    if (punti.length) tl.from(punti, { opacity: 0, y: 14, duration: 0.6, stagger: 0.08, clearProps: 'transform' }, 0.7);

    /* parallasse morbida della foto mentre si scorre oltre l'hero */
    if (foto) {
      gsap.to(foto, {
        yPercent: 8, ease: 'none',
        scrollTrigger: { trigger: '.hero-split', start: 'top top', end: 'bottom top', scrub: true }
      });
    }
  })();

  /* ---------- 2) Titoli di sezione ---------- */
  document.querySelectorAll('main h1.display, main h2.display').forEach(function (el) {
    /* il nome prodotto (#pNome) arriva da JS dopo: non si divide */
    if (el.id === 'pNome' || el.classList.contains('hero-titolo')) return;
    prendi(el);
    var split = dividi(el);
    var tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      onComplete: function () { split.revert(); }
    });
    tl.from(split.words, { yPercent: 115, duration: 0.9, ease: 'power4.out', stagger: 0.05 });
    var em = el.querySelectorAll('em');
    if (em.length) tl.from(em, { color: ORO, duration: 1.1, ease: 'power1.out' }, 0.3);
  });

  /* ---------- 5) Fregio d'oro: il filo si disegna, il fiore sboccia ---------- */
  document.querySelectorAll('.invito-fregio').forEach(function (svg) {
    prendi(svg);
    var tl = gsap.timeline({ scrollTrigger: { trigger: svg, start: 'top 90%', once: true } });
    var tratti = svg.querySelectorAll('path[stroke]');
    var fiore = svg.querySelectorAll('path[fill], circle');
    if (window.DrawSVGPlugin && tratti.length) {
      tl.from(tratti, { drawSVG: '50% 50%', duration: 1.1, ease: 'power2.inOut' });
    } else {
      tl.from(svg, { opacity: 0, duration: 0.6 });
    }
    if (fiore.length) {
      tl.from(fiore, {
        opacity: 0, scale: 0.4, transformOrigin: '50% 100%', duration: 0.6,
        ease: 'back.out(2)', stagger: 0.08
      }, '-=0.5');
    }
  });

  /* ---------- 4) Numeri che contano ---------- */
  function formatta(n, decimali) {
    var s = n.toFixed(decimali).split('.');
    s[0] = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return s.join(',');
  }
  document.querySelectorAll('[data-conta]').forEach(function (el) {
    var fine = parseFloat(el.getAttribute('data-conta'));
    if (isNaN(fine)) return;
    var decimali = parseInt(el.getAttribute('data-decimali') || '0', 10);
    var suffisso = el.getAttribute('data-suffisso') || '';
    var originale = el.textContent;
    var stato = { v: 0 };
    el.textContent = formatta(0, decimali) + suffisso;
    gsap.to(stato, {
      v: fine, duration: 1.8, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 92%', once: true },
      onUpdate: function () { el.textContent = formatta(stato.v, decimali) + suffisso; },
      onComplete: function () { el.textContent = originale; }
    });
  });

  /* ---------- 3) Tutti gli altri .reveal (anche le card create dopo) ----------
     ingressi raccolti nello stesso frame partono insieme, a cascata */
  var coda = [];
  var frame = 0;
  function entra(el) {
    coda.push(el);
    if (frame) return;
    frame = requestAnimationFrame(function () {
      gsap.to(coda, {
        opacity: 1, y: 0, duration: 0.8, ease: EASE, stagger: 0.09,
        overwrite: true, clearProps: 'transform,opacity'
      });
      coda = [];
      frame = 0;
    });
  }
  function osserva(el) {
    prendi(el);
    gsap.set(el, { opacity: 0, y: 28 });
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: function () { entra(el); }
    });
  }
  document.querySelectorAll('.reveal').forEach(osserva);

  /* catalogo.js aggiunge card dopo il caricamento: main.js userà questo */
  window.AFC_ANIM = { observe: osserva };

  /* card, foto e font cambiano l'altezza della pagina dopo il caricamento:
     ricalcola i punti di attivazione (una volta ogni 200ms al massimo) */
  if ('ResizeObserver' in window) {
    var attesa = 0;
    new ResizeObserver(function () {
      clearTimeout(attesa);
      attesa = setTimeout(function () { ScrollTrigger.refresh(); }, 200);
    }).observe(document.body);
  }
})();
