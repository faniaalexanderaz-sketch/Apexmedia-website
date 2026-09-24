/* =============================================================
   ANTICA FIORERIA DEL CENTRO — animazioni (GSAP)
   Va caricato PRIMA di main.js: prende in carico i .reveal.
   Se GSAP manca o l'utente preferisce meno movimento non fa nulla
   e resta il reveal CSS di main.js.

   Regola d'oro: il bottone principale di ogni pagina è visibile
   entro ~1s. Le animazioni accompagnano la lettura, non la ritardano.
   ============================================================= */
(function () {
  'use strict';

  if (!window.gsap || !window.ScrollTrigger || !window.SplitText) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.registerPlugin(ScrollTrigger, SplitText);
  var DRAW = !!window.DrawSVGPlugin;
  if (DRAW) gsap.registerPlugin(DrawSVGPlugin);

  /* rete di sicurezza: se qualcosa si rompe a metà, nulla deve restare
     nascosto — si ripulisce tutto e main.js torna al reveal CSS */
  function ripristina() {
    try { ScrollTrigger.getAll().forEach(function (t) { t.kill(); }); } catch (e) {}
    [].forEach.call(document.querySelectorAll('[style]'), function (el) {
      if (el.style.opacity !== '' || el.style.transform !== '' || el.style.clipPath !== '') {
        gsap.set(el, { clearProps: 'opacity,transform,filter,clipPath,visibility,transition,letterSpacing' });
      }
    });
    window.AFC_ANIM = undefined;
  }
  try {

  var ORO = '#C2A45C';
  var desktop = window.matchMedia('(min-width: 861px)').matches;
  document.documentElement.classList.add('gsap-attivo');

  /* ---------- utilità ---------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return [].slice.call((ctx || document).querySelectorAll(sel)); }
  function prendi(el) { el.classList.remove('reveal', 'in'); }
  function allaVista(el, fn, start) {
    ScrollTrigger.create({ trigger: el, start: start || 'top 88%', once: true, onEnter: fn });
  }
  /* durante l'ingresso spegne le transition CSS sul transform (hover),
     che altrimenti rincorrerebbero GSAP fotogramma per fotogramma */
  var FINE = 'transform,opacity,filter,transition,clipPath,visibility';

  /* ======================================================
     1) HERO — il titolo entra lettera per lettera
     ====================================================== */
  (function () {
    var hero = $('.hero-copy');
    if (!hero) return;

    var titolo = $('.hero-titolo', hero);
    var eyebrow = $('.hero-eyebrow', hero);
    var sub = $('.hero-sub', hero);
    var badge = $('.hero-badge-riga', hero);
    var cta = $('.btn-hero', hero);
    var punti = $$('.hero-fiducia li', hero);
    var foto = $('.hero-sfondo img');

    [titolo, eyebrow, sub, badge, cta].concat(punti).forEach(function (el) { if (el) prendi(el); });

    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    /* la foto (LCP) non parte mai trasparente: solo uno zoom lento */
    if (foto) tl.fromTo(foto, { scale: 1.16 }, { scale: 1, duration: 2.8, ease: 'power2.out' }, 0);

    if (eyebrow) {
      tl.fromTo(eyebrow, { '--linea': 0 }, { '--linea': 1, duration: 1.2, ease: 'power2.inOut' }, 0);
      var et = $('span', eyebrow);
      tl.from(et || eyebrow, { opacity: 0, letterSpacing: '.7em', duration: 1.1, ease: 'power2.out' }, 0.05);
    }

    if (titolo) {
      var split = SplitText.create(titolo, { type: 'words,chars', wordsClass: 'hw', charsClass: 'hc' });
      var emChars = $$('em .hc', titolo);
      tl.from(split.chars, {
        opacity: 0, yPercent: 70, rotateX: -80, transformPerspective: 500, filter: 'blur(10px)',
        transformOrigin: '50% 100%', duration: 1.05, ease: 'power3.out',
        stagger: { each: 0.028 }
      }, 0.15);
      if (emChars.length) {
        tl.from(emChars, { color: ORO, duration: 1.4, ease: 'power1.out', stagger: 0.03 }, 0.8);
      }
      tl.add(function () {
        split.revert();
        svolazzo($('em', titolo));
      });
    }

    if (sub) {
      var sSub = SplitText.create(sub, { type: 'words', wordsClass: 'hw' });
      tl.from(sSub.words, {
        opacity: 0, y: 14, filter: 'blur(6px)', duration: 0.7, stagger: 0.018,
        onComplete: function () { sSub.revert(); }
      }, 0.5);
    }

    if (badge) {
      tl.from(badge, { opacity: 0, y: 22, scale: 0.94, duration: 0.8, ease: 'back.out(1.6)', clearProps: 'transform' }, 0.62);
      var sigillo = $('svg', badge);
      if (sigillo) tl.from(sigillo, { rotate: -140, scale: 0, duration: 0.9, ease: 'back.out(2)', clearProps: 'transform' }, 0.72);
    }

    if (cta) {
      tl.from(cta, { opacity: 0, y: 26, scale: 0.86, duration: 0.9, ease: 'back.out(1.8)', clearProps: 'transform,opacity' }, 0.7);
      var freccia = $('.btn-freccia', cta);
      if (freccia) tl.from(freccia, { x: -14, opacity: 0, duration: 0.6, clearProps: 'transform,opacity' }, 1.05);
      /* riflesso di luce sul bottone: tre passaggi, poi si ferma */
      gsap.fromTo(cta, { '--luce': '-130%' }, {
        '--luce': '130%', duration: 1.1, ease: 'power2.inOut',
        delay: 1.7, repeat: 2, repeatDelay: 4.5
      });
    }

    punti.forEach(function (li, i) {
      var at = 0.85 + i * 0.12;
      tl.from(li, { opacity: 0, y: 26, duration: 0.7, clearProps: 'transform,opacity' }, at);
      var ic = $('svg', li);
      if (ic) tl.from(ic, { scale: 0, rotate: -35, duration: 0.7, ease: 'back.out(2.4)', clearProps: 'transform' }, at + 0.1);
    });

    if (foto) {
      gsap.to(foto, {
        yPercent: 10, ease: 'none',
        scrollTrigger: { trigger: '.hero-split', start: 'top top', end: 'bottom top', scrub: true }
      });
      gsap.to(hero, {
        yPercent: -8, opacity: 0.35, ease: 'none',
        scrollTrigger: { trigger: '.hero-split', start: 'top top', end: 'bottom top', scrub: true }
      });
    }
  })();

  /* svolazzo d'oro disegnato sotto la parola in corsivo */
  function svolazzo(em) {
    if (!em || em.querySelector('.svolazzo')) return;
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'svolazzo');
    svg.setAttribute('viewBox', '0 0 300 24');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    var p = document.createElementNS(ns, 'path');
    p.setAttribute('d', 'M4 16 C 60 4, 110 22, 160 12 S 250 4, 296 13');
    svg.appendChild(p);
    em.appendChild(svg);
    if (DRAW) gsap.from(p, { drawSVG: 0, duration: 1.1, ease: 'power2.inOut' });
    else gsap.from(svg, { opacity: 0, duration: 0.8 });
  }

  /* ======================================================
     2) TITOLI DI SEZIONE — parole che salgono ruotando
     ====================================================== */
  function animaTitolo(el) {
    prendi(el);
    var split = SplitText.create(el, { type: 'words', mask: 'words', wordsClass: 'sw' });
    gsap.set(split.words, { yPercent: 120, rotate: 7, transformOrigin: '0% 100%' });
    var em = $$('em', el);
    allaVista(el, function () {
      var tl = gsap.timeline({ onComplete: function () { split.revert(); } });
      tl.to(split.words, { yPercent: 0, rotate: 0, duration: 1.05, ease: 'power4.out', stagger: 0.065 });
      if (em.length) tl.from(em, { color: ORO, duration: 1.3, ease: 'power1.out' }, 0.35);
    });
  }

  function animaEyebrow(el) {
    prendi(el);
    gsap.set(el, { opacity: 0, letterSpacing: '.6em' });
    allaVista(el, function () {
      gsap.to(el, { opacity: 1, letterSpacing: '.26em', duration: 1.1, ease: 'power3.out', clearProps: 'opacity,letterSpacing' });
    }, 'top 92%');
  }

  $$('main h1.display, main h2.display').forEach(function (el) {
    if (el.id === 'pNome' || el.classList.contains('hero-titolo')) return;
    animaTitolo(el);
  });
  $$('main .eyebrow').forEach(animaEyebrow);

  /* ======================================================
     3) BLOCCHI — ogni tipo ha il suo ingresso
     ====================================================== */
  var VARIANTI = [
    { sel: '.prod-mini', da: { opacity: 0, y: 60, rotate: 1.5, scale: 0.95 },
      extra: function (el) {
        var f = $('.prod-mini-foto', el);
        return f ? [f, { clipPath: 'inset(100% 0% 0% 0% round 15px)' }, { clipPath: 'inset(0% 0% 0% 0% round 15px)', duration: 1.1, ease: 'power3.inOut' }] : null;
      } },
    { sel: '.percorso-blocco', da: function (el) {
        var i = $$('.percorso-blocco').indexOf(el);
        return { opacity: 0, x: i % 2 ? 80 : -80, rotate: i % 2 ? 1.5 : -1.5 };
      } },
    { sel: '.fiducia-item', da: { opacity: 0, y: 50, scale: 0.9 },
      extra: function (el) {
        var ic = $('.fiducia-ic, .fiducia-stelle', el);
        return ic ? [ic, { scale: 0, rotate: -25 }, { scale: 1, rotate: 0, duration: 0.8, ease: 'back.out(2.2)', delay: 0.15 }] : null;
      } },
    { sel: '.sped-card', da: { opacity: 0, y: 60, rotateX: -25, transformPerspective: 800, transformOrigin: '50% 0%' },
      extra: function (el) {
        var ic = $('.sped-ic', el);
        return ic ? [ic, { scale: 0, rotate: 20 }, { scale: 1, rotate: 0, duration: 0.8, ease: 'back.out(2.4)', delay: 0.2 }] : null;
      } },
    { sel: '.faq-item', da: { opacity: 0, x: -50 } },
    { sel: '.btn', da: { opacity: 0, y: 30, scale: 0.88 }, ease: 'back.out(1.8)' },
    { sel: '.atelier-punti', da: { opacity: 0 },
      extra: function (el) {
        return [el.children, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.14, ease: 'power3.out', clearProps: 'transform,opacity' }];
      } },
    { sel: '.body-text, .hero-sub', da: { opacity: 0, y: 30, filter: 'blur(6px)' } },
    { sel: '*', da: { opacity: 0, y: 44, scale: 0.97 } }
  ];

  function variante(el) {
    for (var i = 0; i < VARIANTI.length; i++) {
      if (el.matches(VARIANTI[i].sel) || (VARIANTI[i].sel === '.btn' && el.querySelector(':scope > .btn'))) return VARIANTI[i];
    }
  }

  /* ingressi scattati nello stesso fotogramma partono insieme, a cascata */
  var coda = [];
  var frame = 0;
  function svuota() {
    var gruppo = coda; coda = []; frame = 0;
    gruppo.forEach(function (voce, i) {
      var v = voce.v;
      gsap.to(voce.el, {
        opacity: 1, x: 0, y: 0, scale: 1, rotate: 0, rotateX: 0, filter: 'blur(0px)',
        duration: 1, ease: v.ease || 'power3.out', delay: i * 0.1,
        clearProps: FINE
      });
      var ex = v.extra && v.extra(voce.el);
      if (ex) {
        var dopo = Object.assign({}, ex[2]);
        dopo.delay = (dopo.delay || 0) + i * 0.1;
        if (!dopo.clearProps) dopo.clearProps = FINE;
        gsap.fromTo(ex[0], ex[1], dopo);
      }
    });
  }
  function entra(el, v) {
    coda.push({ el: el, v: v });
    if (!frame) frame = requestAnimationFrame(svuota);
  }
  function osserva(el) {
    prendi(el);
    var v = variante(el);
    var da = typeof v.da === 'function' ? v.da(el) : v.da;
    gsap.set(el, Object.assign({ transition: 'none' }, da));
    var ex = v.extra && v.extra(el);
    if (ex) gsap.set(ex[0], ex[1]);
    allaVista(el, function () { entra(el, v); }, 'top 92%');
  }

  /* ======================================================
     4) NUMERI CHE CONTANO
     ====================================================== */
  function formatta(n, decimali) {
    var s = n.toFixed(decimali).split('.');
    s[0] = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return s.join(',');
  }
  $$('[data-conta]').forEach(function (el) {
    var fine = parseFloat(el.getAttribute('data-conta'));
    if (isNaN(fine)) return;
    var dec = parseInt(el.getAttribute('data-decimali') || '0', 10);
    var suff = el.getAttribute('data-suffisso') || '';
    var orig = el.textContent;
    var st = { v: 0 };
    el.textContent = formatta(0, dec) + suff;
    allaVista(el, function () {
      gsap.to(st, {
        v: fine, duration: 2, ease: 'power2.out', delay: 0.2,
        onUpdate: function () { el.textContent = formatta(st.v, dec) + suff; },
        onComplete: function () { el.textContent = orig; }
      });
    }, 'top 95%');
  });

  /* ======================================================
     5) FREGIO D'ORO — il filo si disegna, il fiore sboccia
     ====================================================== */
  $$('.invito-fregio').forEach(function (svg) {
    prendi(svg);
    var tratti = $$('path[stroke]', svg);
    var fiore = $$('path[fill], circle', svg);
    if (DRAW && tratti.length) gsap.set(tratti, { drawSVG: '50% 50%' });
    gsap.set(fiore, { opacity: 0, scale: 0.3, transformOrigin: '50% 100%' });
    allaVista(svg, function () {
      var tl = gsap.timeline();
      if (DRAW && tratti.length) tl.to(tratti, { drawSVG: '0% 100%', duration: 1.2, ease: 'power2.inOut' });
      tl.to(fiore, { opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(2.4)', stagger: 0.09 }, '-=0.6');
    });
  });

  /* nastro recensioni: entra da destra */
  $$('.rec-nastro').forEach(function (el) {
    gsap.set(el, { opacity: 0, x: 120 });
    allaVista(el, function () {
      gsap.to(el, { opacity: 1, x: 0, duration: 1.3, ease: 'power3.out', clearProps: 'transform,opacity' });
    });
  });

  /* footer: colonne a cascata */
  $$('.footer-inner > *').forEach(function (el, i) {
    gsap.set(el, { opacity: 0, y: 40 });
    allaVista(el, function () {
      gsap.to(el, { opacity: 1, y: 0, duration: 0.9, delay: (i % 4) * 0.1, ease: 'power3.out', clearProps: 'transform,opacity' });
    }, 'top 96%');
  });

  /* tutti gli altri .reveal della pagina */
  $$('.reveal').forEach(osserva);

  /* catalogo.js e collezione.js creano card dopo: main.js userà questo */
  window.AFC_ANIM = { observe: osserva };

  /* ======================================================
     6) DOPO GLI SCRIPT DI PAGINA (card, nastri, scheda prodotto)
     ====================================================== */
  /* scheda prodotto: nascosta subito, animata quando prodotto.js
     ha scritto nome, foto e prezzo */
  var scheda = $('.prodotto-scheda');
  var pezziScheda = [];
  if (scheda) {
    pezziScheda = [$('.prodotto-foto', scheda), $('#pNome'), $('.briciole')]
      .concat($$('.prodotto-acquisto-box > *', scheda)).filter(Boolean);
    gsap.set(pezziScheda, { opacity: 0 });
  }

  document.addEventListener('DOMContentLoaded', function () {
    try { dopoPagina(); } catch (err) { ripristina(); }
  });
  function dopoPagina() {
    /* nastro categorie in cima: i cerchi sbocciano uno dopo l'altro
       (i duplicati del nastro esistono solo ora, dopo catalogo.js) */
    $$('.categorie:not(.categorie-stagioni) .cat-item').forEach(function (el, i) {
      gsap.from(el, {
        opacity: 0, y: 30, scale: 0.6, duration: 0.8, ease: 'back.out(1.9)',
        delay: 0.05 + Math.min(i, 10) * 0.06, clearProps: 'transform,opacity'
      });
    });

    /* categorie per stagione: sbocciano allo scorrimento */
    $$('.categorie-stagioni .cat-track').forEach(function (track) {
      var items = $$('.cat-item', track);
      gsap.set(items, { opacity: 0, y: 40, scale: 0.6 });
      allaVista(track, function () {
        gsap.to(items, { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'back.out(1.9)', stagger: 0.1, clearProps: 'transform,opacity' });
      });
    });

    /* collezione: filtri e card, anche a ogni cambio di filtro */
    var filtri = $('#filtri');
    if (filtri && filtri.children.length) {
      gsap.from(filtri.children, { opacity: 0, y: 18, scale: 0.9, duration: 0.6, ease: 'back.out(2)', stagger: 0.04, delay: 0.3, clearProps: 'transform,opacity' });
    }
    var griglia = $('#prodGriglia');
    if (griglia) {
      var entraGriglia = function () {
        $$('.prod-mini', griglia).forEach(function (card) {
          if (card.dataset.animata) return;
          card.dataset.animata = '1';
          card.classList.add('reveal');
          osserva(card);
        });
        ScrollTrigger.refresh();
      };
      entraGriglia();
      new MutationObserver(entraGriglia).observe(griglia, { childList: true });
    }

    /* scheda prodotto */
    if (scheda && pezziScheda.length) {
      try {
        var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        var fotoP = $('.prodotto-foto', scheda);
        var nome = $('#pNome');
        var box = $$('.prodotto-acquisto-box > *', scheda);
        var br = $('.briciole');
        if (br) tl.to(br, { opacity: 1, duration: 0.6, clearProps: 'opacity' }, 0);
        if (fotoP) {
          tl.fromTo(fotoP, { opacity: 1, clipPath: 'inset(0% 100% 0% 0% round 22px)' },
            { clipPath: 'inset(0% 0% 0% 0% round 22px)', duration: 1.2, ease: 'power3.inOut', clearProps: 'clipPath,opacity' }, 0);
          var img = $('img', fotoP);
          if (img) tl.from(img, { scale: 1.25, duration: 1.8, ease: 'power2.out', clearProps: 'transform' }, 0);
        }
        if (nome) {
          gsap.set(nome, { opacity: 1 });
          var sN = SplitText.create(nome, { type: 'words,chars', charsClass: 'hc' });
          tl.from(sN.chars, {
            opacity: 0, yPercent: 60, rotateX: -80, transformPerspective: 500, filter: 'blur(8px)', transformOrigin: '50% 100%',
            duration: 0.9, stagger: 0.025, onComplete: function () { sN.revert(); }
          }, 0.2);
        }
        if (box.length) {
          tl.fromTo(box, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.07, clearProps: 'transform,opacity' }, 0.35);
        }
      } catch (e) {
        gsap.set(pezziScheda, { clearProps: 'opacity,clipPath' });
      }
    }
  }

  /* card, foto e font cambiano l'altezza della pagina dopo il caricamento:
     ricalcola i punti di attivazione (al massimo ogni 200ms) */
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  if ('ResizeObserver' in window) {
    var attesa = 0;
    new ResizeObserver(function () {
      clearTimeout(attesa);
      attesa = setTimeout(function () { ScrollTrigger.refresh(); }, 200);
    }).observe(document.body);
  }
  } catch (err) {
    ripristina();
    if (window.console) console.warn('animazioni disattivate:', err);
  }
})();
