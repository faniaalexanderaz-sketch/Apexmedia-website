/* =============================================================
   BAGNARINO COWORKING — animazioni (GSAP + ScrollTrigger + SplitText + DrawSVG)
   Lo stesso sistema del sito della fioreria:
   - l'apertura entra subito: il titolo lettera per lettera, in 3D e
     a fuoco, la parte in corsivo cambia colore e ci si disegna sotto
     una sottolineatura ocra; sottotitolo parola per parola, pulsanti
     che saltano fuori, il bollo che gira;
   - i titoli di sezione salgono parola per parola ruotando, le
     etichette si stringono, i testi passano da sfocati a nitidi,
     i pulsanti saltano fuori, ogni blocco ha il suo ingresso;
   - le scene (storia, come funziona, servizi, tessera) hanno i loro gesti.
   Regola d'oro: il pulsante "Prenota" è visibile entro ~1 secondo.
   Rispetta "riduci movimento"; senza GSAP la pagina è già completa.
   ============================================================= */
(function () {
  'use strict';
  var radice = document.documentElement;
  function sblocca() { radice.classList.remove('anim-attesa'); }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !window.gsap || !window.ScrollTrigger) { sblocca(); return; }

  gsap.registerPlugin(ScrollTrigger);
  var SPLIT = !!window.SplitText, DRAW = !!window.DrawSVGPlugin;
  if (SPLIT) gsap.registerPlugin(SplitText);
  if (DRAW) gsap.registerPlugin(DrawSVGPlugin);
  radice.classList.add('gsap-attivo');

  var OCRA = '#DDB05C', AVORIO = '#FAF6EE';
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return [].slice.call((c || document).querySelectorAll(s)); }
  function sottoLaPiega(el) { return el.getBoundingClientRect().top > window.innerHeight * 0.9; }
  function allaVista(el, fn, start) { ScrollTrigger.create({ trigger: el, start: start || 'top 88%', once: true, onEnter: fn }); }

  /* rete di sicurezza: nulla deve restare nascosto */
  function ripristina() {
    try { ScrollTrigger.getAll().forEach(function (t) { t.kill(); }); } catch (x) {}
    $$('[style]').forEach(function (el) { el.style.opacity = ''; el.style.transform = ''; el.style.clipPath = ''; el.style.filter = ''; el.style.visibility = ''; el.style.letterSpacing = ''; });
    radice.classList.remove('gsap-attivo', 'js-tira');
    sblocca();
  }

  /* sottolineatura ocra disegnata sotto la parte in corsivo */
  function svolazzo(em) {
    if (!em || em.querySelector('.svolazzo') || em.getClientRects().length !== 1) return;
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'svolazzo'); svg.setAttribute('viewBox', '0 0 300 24');
    svg.setAttribute('preserveAspectRatio', 'none'); svg.setAttribute('aria-hidden', 'true');
    var p = document.createElementNS(ns, 'path');
    p.setAttribute('d', 'M4 15 C 60 5, 110 21, 160 12 S 250 5, 296 12');
    svg.appendChild(p); em.appendChild(svg);
    if (DRAW) gsap.from(p, { drawSVG: 0, duration: 1.1, ease: 'power2.inOut' });
    else gsap.from(svg, { opacity: 0, duration: 0.8 });
  }

  try {
    /* ======================================================
       1) L'APERTURA — entra subito, in poco più di un secondo
       ====================================================== */
    (function () {
      var ap = $('.apertura');
      if (!ap) return;
      var foto = $('.apertura-foto img'), sopra = $('.apertura-sopra', ap), titolo = $('.apertura-titolo', ap),
          sotto = $('.apertura-sotto', ap), bottoni = $$('.apertura-cta > a', ap), fatti = $$('.apertura-fatti > div', ap), bollo = $('.bollo', ap);
      var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      if (foto) tl.fromTo(foto, { scale: 1.16 }, { scale: 1, duration: 2.6, ease: 'power2.out' }, 0);
      if (sopra) tl.from(sopra, { opacity: 0, y: 10, letterSpacing: '.4em', duration: 1, clearProps: 'opacity,transform,letterSpacing' }, 0.05);
      if (titolo && SPLIT) {
        var st = SplitText.create(titolo, { type: 'words,chars', wordsClass: 'hw', charsClass: 'hc' });
        var emChars = $$('em .hc', titolo);
        tl.from(st.chars, { opacity: 0, yPercent: 70, rotateX: -80, transformPerspective: 500, filter: 'blur(10px)', transformOrigin: '50% 100%',
          duration: 1, stagger: 0.02 }, 0.12);
        if (emChars.length) tl.from(emChars, { color: AVORIO, duration: 1.2, ease: 'power1.out', stagger: 0.03 }, 0.7);
        tl.add(function () { st.revert(); svolazzo($('em', titolo)); });
      }
      if (sotto && SPLIT) {
        var ss = SplitText.create(sotto, { type: 'words', wordsClass: 'hw' });
        tl.from(ss.words, { opacity: 0, y: 14, filter: 'blur(6px)', duration: 0.7, stagger: 0.016, onComplete: function () { ss.revert(); } }, 0.45);
      }
      if (bottoni.length) {
        tl.from(bottoni, { opacity: 0, y: 26, scale: 0.86, duration: 0.85, ease: 'back.out(1.8)', stagger: 0.1, clearProps: 'opacity,transform' }, 0.6);
        var fr = $('.tasto-freccia', ap);
        if (fr) tl.from(fr, { x: -16, rotate: -90, opacity: 0, duration: 0.6, clearProps: 'transform,opacity' }, 0.95);
      }
      if (fatti.length) {
        tl.from(fatti, { opacity: 0, y: 24, duration: 0.7, stagger: 0.09, clearProps: 'opacity,transform' }, 0.85);
        var oli = $('.targa-olivetti', ap);
        if (oli) tl.from(oli, { scale: 0.5, rotate: -8, duration: 0.8, ease: 'back.out(2.2)', clearProps: 'transform' }, 0.95);
      }
      if (bollo) tl.from(bollo, { scale: 0, rotate: -140, duration: 1, ease: 'back.out(1.8)', clearProps: 'transform' }, 0.8);
      sblocca();

      /* scorrendo via: la foto si avvicina, il testo sale e sfuma */
      gsap.to('.apertura-foto', { scale: 1.14, yPercent: 7, ease: 'none', scrollTrigger: { trigger: ap, start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('.apertura-contenuto', { y: -70, opacity: 0.15, ease: 'none', scrollTrigger: { trigger: ap, start: '35% top', end: 'bottom top', scrub: true } });
    })();

    /* ======================================================
       2) TITOLI DI SEZIONE — parole che salgono ruotando,
          il corsivo si accende d'ocra
       ====================================================== */
    var conSvolazzo = ['pz-titolo'];
    $$('.titolo-sezione, .disp-titolo, .servizi-titolo, .finale h2').forEach(function (el) {
      if (!SPLIT || !sottoLaPiega(el)) return;
      var st = SplitText.create(el, { type: 'words', mask: 'words', wordsClass: 'sw' });
      gsap.set(st.words, { yPercent: 120, rotate: 7, transformOrigin: '0% 100%' });
      var em = $$('em', el);
      allaVista(el, function () {
        var tl = gsap.timeline({ onComplete: function () {
          st.revert();
          if (el.closest('.finale') || conSvolazzo.some(function (c) { return el.classList.contains(c); })) svolazzo($('em', el));
        } });
        tl.to(st.words, { yPercent: 0, rotate: 0, duration: 1.05, ease: 'power4.out', stagger: 0.065 });
        if (em.length) tl.from(em, { color: OCRA, duration: 1.3, ease: 'power1.out' }, 0.35);
      });
    });

    /* etichette (01 —— PRENOTA): si stringono e la lineetta si traccia */
    radice.classList.add('js-tira');
    $$('.occhiello').forEach(function (o) {
      if (!sottoLaPiega(o)) { o.classList.add('tirato'); return; }
      gsap.set(o, { opacity: 0, letterSpacing: '.5em' });
      allaVista(o, function () {
        o.classList.add('tirato');
        gsap.to(o, { opacity: 1, letterSpacing: '.12em', duration: 1.1, ease: 'power3.out', clearProps: 'opacity,letterSpacing' });
      }, 'top 92%');
    });

    /* ======================================================
       3) TESTI E BLOCCHI — ognuno col suo ingresso, a cascata
       ====================================================== */
    var testi = $$('.intro-sezione, .neg-lead, .neg-contatti, .olivetti-targa, .olivetti-testo, .olivetti-voci li, .servizi-testa > p, .servizi-senza, .perchi-testa p, .dove-scheda > *:not(h2):not(.btn):not(.dove-cta), .faq-altro, .finale > .contenitore > p, .pz-sotto, .pz-posti, .pz-nota, .prezzi-garanzie li, .fatti > div')
      .filter(sottoLaPiega);
    if (testi.length) {
      gsap.set(testi, { opacity: 0, y: 30, filter: 'blur(6px)' });
      ScrollTrigger.batch(testi, { start: 'top 92%', once: true,
        onEnter: function (g) { gsap.to(g, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out', stagger: 0.08, clearProps: 'opacity,transform,filter' }); } });
    }

    /* i pulsanti saltano fuori */
    var pulsanti = $$('main .tasto, main .btn-grande, .neg-azioni .btn, .dove-cta .btn').filter(function (b) { return !b.closest('.apertura') && sottoLaPiega(b); });
    if (pulsanti.length) {
      gsap.set(pulsanti, { opacity: 0, y: 30, scale: 0.88 });
      ScrollTrigger.batch(pulsanti, { start: 'top 94%', once: true,
        onEnter: function (g) { gsap.to(g, { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'back.out(1.8)', stagger: 0.1, clearProps: 'opacity,transform' }); } });
    }

    /* liste: una voce alla volta, da sinistra */
    [['.servizi-senza ul', 'li', -30], ['.faq', 'details', -50]].forEach(function (c) {
      $$(c[0]).forEach(function (lista) {
        var voci = $$(c[1], lista);
        if (!voci.length || !sottoLaPiega(lista)) return;
        gsap.from(voci, { opacity: 0, x: c[2], duration: 0.7, ease: 'power3.out', stagger: 0.08, clearProps: 'opacity,transform',
          scrollTrigger: { trigger: lista, start: 'top 88%', once: true } });
      });
    });

    /* piè di pagina: colonne a cascata */
    $$('.piede-griglia > *').filter(sottoLaPiega).forEach(function (el, i) {
      gsap.set(el, { opacity: 0, y: 40 });
      allaVista(el, function () { gsap.to(el, { opacity: 1, y: 0, duration: 0.9, delay: (i % 4) * 0.1, ease: 'power3.out', clearProps: 'opacity,transform' }); }, 'top 96%');
    });

    /* ======================================================
       4) LE SCENE
       ====================================================== */
      /* 04 · come funziona: i tre passaggi entrano uno dopo l'altro, una volta sola */
      var passi = $$('.come-passi li');
      if (passi.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.from(passi, { opacity: 0, y: 24, duration: 0.7, ease: 'power3.out', stagger: 0.14, clearProps: 'opacity,transform',
          scrollTrigger: { trigger: '.come-passi', start: 'top 85%', once: true } });
      }

    /* 01 · prenota: il pulsante "respira" finché la sezione è in vista */
    var tastoPz = $('.pz .tasto');
    if (tastoPz) inVista('#posti', gsap.to(tastoPz, { scale: 1.045, duration: 0.7, ease: 'sine.inOut', yoyo: true, repeat: -1, repeatDelay: 1.6 }));

    /* 02 · negozio: il cartellino sale piano mentre scorri, l'indirizzo arriva da destra */
    var cart = $('[data-cartellino]');
    if (cart) gsap.fromTo(cart, { y: 30 }, { y: -10, ease: 'none', scrollTrigger: { trigger: '.neg-info', start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
    var negInd = $('.neg-indirizzo');
    if (negInd && sottoLaPiega(negInd)) gsap.from(negInd, { x: 60, opacity: 0, duration: 0.9, ease: 'power3.out', clearProps: 'opacity,transform', scrollTrigger: { trigger: negInd, start: 'top 90%', once: true } });

    /* 04 · prezzi: le voci incluse entrano una a una, le card si inclinano col mouse */
    $$('.prezzo').forEach(function (card) {
      inclina3d(card, 6);
      var voci = $$('.prezzo-include li', card);
      if (voci.length && sottoLaPiega(card)) gsap.from(voci, { x: -24, opacity: 0, duration: 0.5, ease: 'power2.out', stagger: 0.07, delay: 0.3, clearProps: 'opacity,transform', scrollTrigger: { trigger: card, start: 'top 85%', once: true } });
    });

    /* 06 · spazio: le X dei "niente sorprese" girano dentro, la frase finale si batte a macchina */
    var xx = $$('.servizi-senza li .ico').filter(sottoLaPiega);
    if (xx.length) gsap.from(xx, { scale: 0, rotation: -180, duration: 0.6, ease: 'back.out(2.2)', stagger: 0.1, clearProps: 'transform', scrollTrigger: { trigger: '.servizi-senza', start: 'top 85%', once: true } });
    var porta = $('.servizi-porta');
    if (porta && SPLIT && sottoLaPiega(porta)) {
      var sp = SplitText.create(porta, { type: 'chars', charsClass: 'pc' });
      gsap.set(sp.chars, { opacity: 0 });
      allaVista(porta, function () { gsap.to(sp.chars, { opacity: 1, duration: 0.01, stagger: 0.045, ease: 'none', onComplete: function () { sp.revert(); } }); }, 'top 90%');
    }

    /* 07 · Bagnarino Card: testo, poi la tessera entra in 3D, poi logo e timbri uno a uno */
    (function () {
      var sez = $('#card'); if (!sez) return;
      var scena = $('[data-bc-scena]', sez), card = $('[data-bc-card]', sez); if (!card) return;
      var righe = $$('.bc-riga > *', sez), come = $('.bc-come', sez), premi = $$('.bc-premi li', sez), mese = $('.bc-mese', sez), azioni = $$('.bc-azioni > *', sez);
      var logoCard = $('.bc-card-testa', card), timbri = $$('.bc-timbro', card), inchiostri = $$('.bc-pieno .bc-inchiostro', card), piede = $('.bc-card-piede', card), luce = $('.bc-luce', card), ombra = $('.bc-ombra', scena);
      var traguardi = $$('.bc-traguardo', card);
      var mobile = window.innerWidth < 900;
      if (sottoLaPiega(sez)) {
        gsap.set(righe, { yPercent: 110 });
        gsap.set([come, mese].concat(azioni), { opacity: 0, y: 16 });
        gsap.set(premi, { opacity: 0, x: -18 });
        gsap.set(card, { opacity: 0, x: mobile ? 0 : 140, y: mobile ? 40 : 30, z: -260, rotationY: mobile ? -14 : -38, rotationX: mobile ? 6 : 12, scale: 0.92, transformPerspective: 1400 });
        gsap.set(ombra, { opacity: 0, scaleX: 0.6 });
        gsap.set(logoCard, { opacity: 0, y: -10 });
        gsap.set(timbri, { opacity: 0, scale: 0.6 });
        gsap.set(inchiostri, { opacity: 0, scale: 1.6, transformOrigin: '50% 50%' });
        gsap.set(piede, { opacity: 0 });
        var tl = gsap.timeline({ defaults: { ease: 'power3.out' }, scrollTrigger: { trigger: sez, start: 'top 65%', once: true } });
        tl.to(righe, { yPercent: 0, duration: 1, ease: 'power4.out', stagger: 0.12, clearProps: 'transform' }, 0)
          .to(come, { opacity: 1, y: 0, duration: 0.7, clearProps: 'opacity,transform' }, 0.35)
          .to(premi, { opacity: 1, x: 0, duration: 0.6, stagger: 0.09, clearProps: 'opacity,transform' }, 0.5)
          .to([mese].concat(azioni), { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, clearProps: 'opacity,transform' }, 0.95)
          /* la tessera: parte decisa, si assesta morbida */
          .to(card, { opacity: 1, duration: 0.5 }, 0.3)
          .to(card, { x: 0, y: 0, z: 0, rotationY: 0, rotationX: 0, scale: 1, duration: 1.5, ease: 'expo.out' }, 0.3)
          .to(ombra, { opacity: 1, scaleX: 1, duration: 1.2, clearProps: 'opacity,transform' }, 0.5)
          .fromTo(luce, { opacity: 0, '--luce-x': '-40%' }, { opacity: 1, '--luce-x': '40%', duration: 1.1, ease: 'power2.inOut' }, 0.9)
          .to(luce, { opacity: 0, duration: 0.4 }, 1.9)
          .to(logoCard, { opacity: 1, y: 0, duration: 0.6, clearProps: 'opacity,transform' }, 1.1)
          .to(timbri, { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(1.6)', stagger: 0.06, clearProps: 'opacity,transform' }, 1.25)
          .to(inchiostri, { opacity: 0.86, scale: 1, duration: 0.3, ease: 'power3.in', stagger: 0.09, clearProps: 'opacity,transform' }, 1.75)
          .to(traguardi, { boxShadow: '0 0 0 6px rgba(201,151,59,.28)', duration: 0.35, ease: 'power2.out', stagger: 0.1, yoyo: true, repeat: 1 }, 2.15)
          .to(piede, { opacity: 1, duration: 0.6, clearProps: 'opacity' }, 2.3)
          .add(function () { gsap.set(card, { clearProps: 'opacity,transform' }); });
      } else { gsap.set([card, ombra], { clearProps: 'all' }); }
      /* inclinazione 3D col mouse (solo con puntatore) */
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        gsap.set(card, { transformPerspective: 1400 });
        var rx = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3.out' }), ry = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3.out' });
        var lx = gsap.quickTo(luce, '--luce-x', { duration: 0.6, ease: 'power3.out' });
        scena.addEventListener('pointermove', function (e) {
          var r = card.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
          ry(px * 14); rx(-py * 10); gsap.to(luce, { opacity: 0.6, duration: 0.3 }); lx((px * 60) + '%');
        });
        scena.addEventListener('pointerleave', function () { rx(0); ry(0); gsap.to(luce, { opacity: 0, duration: 0.5 }); });
      }
    })();

    /* 08 · per chi è: ingresso orchestrato, poi le schede rispondono al mouse e all'indice */
    (function () {
      var sez = $('#per-chi'); if (!sez) return;
      var titolo = $('.pc-titolo', sez), righe = $$('.pc-riga > *', sez), testo = $('.pc-testo', sez), indice = $$('.pc-indice li', sez);
      var schede = $$('.pc-card', sez), numeri = $$('.pc-num, .pc-tipo', sez), frecce = $$('.pc-freccia', sez), cte = $$('.pc-cta', sez);
      if (sottoLaPiega(sez)) {
        gsap.set(righe, { yPercent: 108 });
        gsap.set(titolo, { '--linea': 0 });
        gsap.set(testo, { opacity: 0, y: 18 });
        gsap.set(indice, { opacity: 0, x: -14 });
        gsap.set(schede, { opacity: 0, y: 48, scale: 0.97 });
        gsap.set(numeri.concat(cte), { opacity: 0 });
        gsap.set(frecce, { scale: 0.6, opacity: 0 });
        var tl = gsap.timeline({ defaults: { ease: 'power3.out' }, scrollTrigger: { trigger: sez, start: 'top 72%', once: true } });
        tl.to(titolo, { '--linea': 1, duration: 1, ease: 'power2.inOut' }, 0)
          .to(righe, { yPercent: 0, duration: 1.05, ease: 'power4.out', stagger: 0.11, clearProps: 'transform' }, 0.05)
          .to(testo, { opacity: 1, y: 0, duration: 0.8, clearProps: 'opacity,transform' }, 0.55)
          .to(indice, { opacity: 1, x: 0, duration: 0.6, stagger: 0.07, clearProps: 'opacity,transform' }, 0.7)
          .to(schede, { opacity: 1, y: 0, scale: 1, duration: 0.95, stagger: 0.12, clearProps: 'opacity,transform' }, 0.35)
          .to(numeri.concat(cte), { opacity: 1, duration: 0.6, stagger: 0.04, clearProps: 'opacity' }, 0.8)
          .to(frecce, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.6)', stagger: 0.1, clearProps: 'opacity,transform' }, 1);
      }
      var evidenzia = function (n) { indice.forEach(function (li) { li.classList.toggle('attiva', li.getAttribute('data-indice') === n); }); };
      schede.forEach(function (card) {
        var ico = $('.pc-freccia .ico', card);
        var su = gsap.quickTo(card, 'y', { duration: 0.45, ease: 'power3.out' });
        var sposta = gsap.quickTo(ico, 'x', { duration: 0.35, ease: 'power3.out' });
        card.addEventListener('pointerenter', function (e) { if (e.pointerType === 'touch') return; su(-6); sposta(3); evidenzia(card.getAttribute('data-indice')); });
        card.addEventListener('pointerleave', function () { su(0); sposta(0); evidenzia(''); });
        card.addEventListener('focusin', function () { evidenzia(card.getAttribute('data-indice')); });
        card.addEventListener('focusout', function () { evidenzia(''); });
        /* da telefono l'indice segue la scheda al centro dello schermo */
        ScrollTrigger.create({ trigger: card, start: 'top 55%', end: 'bottom 55%',
          onToggle: function (st) { if (st.isActive && !window.matchMedia('(hover: hover)').matches) evidenzia(card.getAttribute('data-indice')); } });
      });
    })();

    /* 08 · dove siamo: l'indirizzo arriva riga per riga, la mappa si apre a cerchio,
       l'etichetta "Siamo qui" si posa sopra e il segnaposto rimbalza */
    var scenaMappa = $('[data-mappa-scena]');
    if (scenaMappa && sottoLaPiega(scenaMappa)) {
      var qui = $('.mappa-qui', scenaMappa), interno = $('.mappa-anteprima, .mappa-iframe', scenaMappa);
      gsap.set(qui, { opacity: 0, y: -40, scale: 0.7, transformOrigin: '50% 100%' });
      var tlM = gsap.timeline({ scrollTrigger: { trigger: scenaMappa, start: 'top 82%', once: true } });
      if (interno) tlM.fromTo(interno, { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(75% at 50% 50%)', duration: 1.3, ease: 'expo.out', clearProps: 'clipPath' }, 0);
      tlM.to(qui, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(2)', clearProps: 'opacity,transform' }, 0.7)
        .to($('.ico', qui), { y: -4, duration: 0.3, yoyo: true, repeat: 3, ease: 'power1.inOut', clearProps: 'transform' }, 1.3);
      var indirizzo = $$('.dove-indirizzo, .dove-apertura');
      if (indirizzo.length) gsap.from(indirizzo, { x: -30, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.12, clearProps: 'opacity,transform', scrollTrigger: { trigger: '.dove-scheda', start: 'top 85%', once: true } });
    }
    var pin = $('.mappa-carica .ico');
    if (pin) inVista('#dove', gsap.to(pin, { y: -6, duration: 0.45, ease: 'power2.out', yoyo: true, repeat: -1, repeatDelay: 0.9 }));

    /* 10 · domande: la risposta si apre scorrendo invece di comparire di colpo */
    $$('.faq details').forEach(function (d) {
      var risp = $('.faq-risposta', d);
      if (!risp) return;
      d.addEventListener('toggle', function () {
        if (!d.open) return;
        gsap.fromTo(risp, { height: 0, opacity: 0, overflow: 'hidden' }, { height: 'auto', opacity: 1, duration: 0.45, ease: 'power2.out', clearProps: 'height,opacity,overflow' });
        gsap.from($$('p', risp), { y: -10, duration: 0.45, ease: 'power2.out', clearProps: 'transform' });
      });
    });

    /* finale: la riga dei posti liberi salta fuori */
    var finPosti = $('.finale .apertura-sopra');
    if (finPosti && sottoLaPiega(finPosti)) gsap.from(finPosti, { scale: 0.6, opacity: 0, duration: 0.8, ease: 'back.out(2)', clearProps: 'opacity,transform', scrollTrigger: { trigger: finPosti, start: 'top 90%', once: true } });

    /* card, foto e font cambiano l'altezza della pagina: ricalcola i punti di attivazione */
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    if ('ResizeObserver' in window) {
      var attesa = 0;
      new ResizeObserver(function () { clearTimeout(attesa); attesa = setTimeout(function () { ScrollTrigger.refresh(); }, 200); }).observe(document.body);
    }
  } catch (e) {
    ripristina();
    if (window.console) console.warn('animazioni disattivate:', e);
  }
})();
