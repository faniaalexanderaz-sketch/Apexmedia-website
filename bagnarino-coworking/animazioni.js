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
   - le scene (storia, giornata, servizi, tessera) hanno i loro gesti.
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
    $$('.gd').forEach(function (c) { c.classList.remove('animata'); });
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
      /* 1b) una giornata: la sezione si ferma e, scorrendo, passa la giornata.
         L'orologio gira dall'apertura alla chiusura, il cielo cambia colore,
         il sole fa il suo arco, le stelle escono la sera, i momenti si danno il cambio */
      var gd = $('.gd'), C = window.BGN_CONFIG || {};
      if (gd) {
        var min = function (t) { var x = String(t).split(':'); return (+x[0]) * 60 + (+x[1] || 0); };
        var INIZIO = min((C.orari && C.orari.apertura) || '9:30'), FINE = min((C.orari && C.orari.chiusura) || '18:30');
        var rulli = $$('[data-gd-cifra] .gd-rullo', gd), pieno = $('[data-gd-pieno]', gd), punto = $('[data-gd-punto]', gd);
        var momenti = $$('.gd-momento', gd).map(function (m) { return { el: m, min: min(m.getAttribute('data-ora')) }; });
        var tacche = $('[data-gd-tacche]', gd), segni = [];
        for (var h = Math.ceil(INIZIO / 60); h * 60 <= FINE; h++) {
          var t = document.createElement('span'); t.textContent = h; t.style.left = ((h * 60 - INIZIO) / (FINE - INIZIO) * 100) + '%';
          tacche.appendChild(t); segni.push({ el: t, min: h * 60 });
        }
        var cieloAlto = gsap.utils.interpolate(['#3A5878', '#4B6D8E', '#5A5A63', '#8A5634', '#141E2A']);
        var cieloBasso = gsap.utils.interpolate(['#1E3044', '#22374C', '#2A2C38', '#3A2A2A', '#0C1219']);
        var ultimo = '';
        var mostra = function (p) {
          var m = INIZIO + (FINE - INIZIO) * Math.min(p / 0.86, 1), hh = Math.floor(m / 60), mm = Math.floor(m % 60);
          var cifre = (hh < 10 ? '0' + hh : '' + hh) + (mm < 10 ? '0' + mm : '' + mm);
          if (cifre !== ultimo) { ultimo = cifre; rulli.forEach(function (r, i) { r.style.transform = 'translateY(' + (-(+cifre[i])) + 'em)'; }); }
          pieno.style.transform = 'scaleX(' + p.toFixed(4) + ')';
          punto.style.left = (p * 100).toFixed(2) + '%';
          segni.forEach(function (sg) { sg.el.classList.toggle('passata', m >= sg.min); });
          gd.style.setProperty('--cielo-alto', cieloAlto(p));
          gd.style.setProperty('--cielo-basso', cieloBasso(p));
          gd.style.setProperty('--sole-x', (8 + p * 84).toFixed(2) + '%');
          gd.style.setProperty('--sole-y', (78 - Math.sin(Math.PI * Math.min(p / 0.9, 1)) * 62).toFixed(2) + '%');
          gd.style.setProperty('--sole-o', (p < 0.8 ? Math.min(1, 0.35 + p * 2) : Math.max(0, 1 - (p - 0.8) * 9)).toFixed(3));
          gd.style.setProperty('--stelle', Math.max(0, (p - 0.86) * 7).toFixed(3));
          var attivo = 0;
          momenti.forEach(function (x, i) { if (m >= x.min - 1) attivo = i; });
          momenti.forEach(function (x, i) { x.el.classList.toggle('attivo', i === attivo); x.el.classList.toggle('passato', i < attivo); });
        };
        gd.classList.add('animata');
        mostra(0);
        var giorno = { p: 0 };
        gsap.to(giorno, { p: 1, ease: 'none', onUpdate: function () { mostra(giorno.p); },
          scrollTrigger: { trigger: gd, start: 'top top', end: function () { return '+=' + Math.round(window.innerHeight * 2.4); }, pin: true, scrub: 0.8, refreshPriority: 1, anticipatePin: 1 } });
        /* all'ingresso le cifre salgono dal basso */
        gsap.from($$('.gd-cifra', gd), { yPercent: 80, opacity: 0, duration: 0.9, ease: 'power4.out', stagger: 0.07, clearProps: 'transform,opacity',
          scrollTrigger: { trigger: gd, start: 'top 70%', once: true } });
      }

      /* 2d) il listino: le colonne salgono una dopo l'altra, quella del mese si apre per ultima */
      var colonne = $$('.prezzo');
      if (colonne.length && sottoLaPiega(colonne[0])) {
        var normali = colonne.filter(function (c) { return !c.classList.contains('prezzo-evidenza'); }), mese = $('.prezzo-evidenza');
        var tl = gsap.timeline({ scrollTrigger: { trigger: '.prezzi', start: 'top 82%', once: true } });
        tl.from(normali, { opacity: 0, y: 40, duration: 0.7, ease: 'power3.out', stagger: 0.12, clearProps: 'opacity,transform' });
        if (mese) tl.from(mese, { opacity: 0, scaleY: 0.6, transformOrigin: '50% 50%', duration: 0.7, ease: 'back.out(1.6)', clearProps: 'opacity,transform' }, 0.3)
          .from($('.prezzo-etichetta', mese), { scale: 2.2, opacity: 0, rotation: -20, duration: 0.4, ease: 'power3.in', clearProps: 'opacity,transform' }, 0.8);
        $$('.prezzo-valore', mese || document).forEach(function () {});
      }

      /* 2e-ter) servizi inclusi: le card si alzano in 3D una dopo l'altra,
         le icone saltano fuori e ognuna fa il suo gesto (la spina si infila,
         la chiave gira, la stampante vibra, il cassetto si apre) */
      var servizi = $$('.servizio:not([hidden])');
      var muoviIcona = function (card, ritardo) {
        var ico = $('.servizio-icona .ico', card), moto = card.getAttribute('data-moto'), d = ritardo || 0;
        if (!ico || gsap.isTweening(ico)) return;
        if (moto === 'salta') gsap.to(ico, { y: -7, duration: 0.2, yoyo: true, repeat: 3, ease: 'power1.inOut', delay: d, clearProps: 'transform' });
        else if (moto === 'spina') gsap.fromTo(ico, { y: -12 }, { y: 0, duration: 0.7, ease: 'bounce.out', delay: d, clearProps: 'transform' });
        else if (moto === 'scuoti') gsap.fromTo(ico, { x: -3 }, { x: 3, duration: 0.06, yoyo: true, repeat: 9, ease: 'none', delay: d, clearProps: 'transform' });
        else if (moto === 'gira') gsap.fromTo(ico, { rotation: 0 }, { rotation: 360, duration: 0.9, ease: 'power3.inOut', delay: d, transformOrigin: '50% 50%', clearProps: 'transform' });
        else if (moto === 'cassetto') gsap.to(ico, { x: 7, duration: 0.28, yoyo: true, repeat: 1, ease: 'power2.inOut', delay: d, clearProps: 'transform' });
        else if (moto === 'onde') gsap.fromTo($('.servizio-icona', card), { boxShadow: '0 0 0 0 rgba(201,151,59,.55)' }, { boxShadow: '0 0 0 22px rgba(201,151,59,0)', duration: 1.1, ease: 'power2.out', delay: d, clearProps: 'boxShadow' });
      };
      if (servizi.length && sottoLaPiega(servizi[0])) {
        /* ogni card entra appena spunta dal fondo dello schermo, senza aspettare le altre */
        gsap.set(servizi, { opacity: 0, y: 46, rotationX: -22, scale: 0.96, transformPerspective: 900, transformOrigin: '50% 100%' });
        ScrollTrigger.batch(servizi, { start: 'top 98%', once: true, onEnter: function (g) {
          gsap.to(g, { opacity: 1, y: 0, rotationX: 0, scale: 1, duration: 0.6, ease: 'back.out(1.4)', stagger: 0.07, clearProps: 'opacity,transform' });
          gsap.from(g.map(function (c) { return $('.servizio-icona', c); }), { scale: 0, rotation: -90, duration: 0.5, ease: 'back.out(2.4)', stagger: 0.07, delay: 0.12, clearProps: 'transform',
            onComplete: function () { g.forEach(function (c, i) { muoviIcona(c, i * 0.08); }); } });
        } });
      }
      if (servizi.length) {
        /* finché la griglia è in vista, ogni tanto un'icona "si sveglia" */
        var griglia = $('.servizi-griglia'), attiva = false;
        ScrollTrigger.create({ trigger: griglia, start: 'top bottom', end: 'bottom top', onToggle: function (st) { attiva = st.isActive; } });
        setInterval(function () { if (attiva && !document.hidden) muoviIcona(servizi[Math.floor(Math.random() * servizi.length)]); }, 3200);
        servizi.forEach(function (c) { c.addEventListener('pointerenter', function () { muoviIcona(c); }); });
      }

      /* 2e-sexies) la scena della macchina da scrivere sale piano mentre arrivi */
      var scenaMc = $('.pz-scena');
      if (scenaMc && sottoLaPiega(scenaMc)) {
        gsap.from(scenaMc, { y: 90, rotation: 1.5, ease: 'none', scrollTrigger: { trigger: '#posti', start: 'top bottom', end: 'top 25%', scrub: 0.6 } });
      }

      /* 2e-septies) la foto del negozio si apre dal centro */
      var negFoto = $('.neg-foto');
      if (negFoto && sottoLaPiega(negFoto)) {
        gsap.fromTo(negFoto, { clipPath: 'inset(14% 14% 14% 14% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 10px)', duration: 1.2, ease: 'expo.out', clearProps: 'clipPath',
          scrollTrigger: { trigger: negFoto, start: 'top 85%', once: true } });
        gsap.fromTo($('img', negFoto), { scale: 1.2 }, { scale: 1, duration: 1.6, ease: 'expo.out', clearProps: 'transform',
          scrollTrigger: { trigger: negFoto, start: 'top 85%', once: true } });
      }

      /* 2e-novies) i pulsanti principali seguono un poco il mouse */
      if (window.matchMedia('(hover: hover)').matches) {
        $$('.tasto').forEach(function (b) {
          var vx = gsap.quickTo(b, 'x', { duration: 0.4, ease: 'power3.out' }), vy = gsap.quickTo(b, 'y', { duration: 0.4, ease: 'power3.out' });
          b.addEventListener('pointermove', function (e) {
            var r = b.getBoundingClientRect();
            vx((e.clientX - r.left - r.width / 2) * 0.18); vy((e.clientY - r.top - r.height / 2) * 0.3);
          });
          b.addEventListener('pointerleave', function () { vx(0); vy(0); });
        });
      }

      /* 2f) la mappa e i pulsanti: su e dentro */
      $$('.mappa, .dove-cta .btn').filter(sottoLaPiega).forEach(function (el, i) {
        gsap.from(el, { opacity: 0, y: 30, duration: 0.7, delay: i * 0.08, ease: 'power2.out', clearProps: 'opacity,transform',
          scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
      });

      /* 2g) i prezzi contano fino alla cifra, una volta sola */
      $$('[data-cifra]').forEach(function (el) {
        var fine = +el.getAttribute('data-cifra');
        if (!fine || !sottoLaPiega(el)) return;
        var conta = { v: 0 };
        gsap.to(conta, { v: fine, duration: 1.1, ease: 'power2.out', snap: { v: 1 },
          onUpdate: function () { el.textContent = String(Math.round(conta.v)); },
          scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
      });

      /* 2i) barra di lettura in alto, ocra */
      var barra = document.createElement('div'); barra.className = 'avanzamento'; barra.setAttribute('aria-hidden', 'true');
      document.body.appendChild(barra);
      gsap.to(barra, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 } });

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


    /* ======================================================
       5) DI PIÙ, SEZIONE PER SEZIONE
       ====================================================== */
    var desktop = window.matchMedia('(hover: hover) and (min-width: 900px)').matches;
    function inVista(el, tween) { /* un'animazione continua che gira solo quando la sezione si vede */
      ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', onToggle: function (st) { st.isActive ? tween.play() : tween.pause(); } });
      tween.pause();
    }
    function inclina3d(el, forza) { /* card che si inclina in 3D seguendo il mouse */
      if (!desktop || !el) return;
      gsap.set(el, { transformPerspective: 900 });
      var rx = gsap.quickTo(el, 'rotationX', { duration: 0.5, ease: 'power3.out' }), ry = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power3.out' });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - 0.5) * forza); rx(-((e.clientY - r.top) / r.height - 0.5) * forza);
      });
      el.addEventListener('pointerleave', function () { rx(0); ry(0); });
    }

    /* apertura: il bollo gira mentre scorri */
    var bolloAp = $('.apertura .bollo');
    if (bolloAp) gsap.to(bolloAp, { rotation: 200, ease: 'none', scrollTrigger: { trigger: '.apertura', start: 'top top', end: 'bottom top', scrub: 0.5 } });

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

    /* 09 · dove siamo: il segnaposto della mappa rimbalza, l'indirizzo arriva riga per riga */
    var pin = $('.mappa-carica .ico');
    if (pin) inVista('#dove', gsap.to(pin, { y: -6, duration: 0.45, ease: 'power2.out', yoyo: true, repeat: -1, repeatDelay: 0.9 }));
    var mappa = $('.mappa-anteprima');
    if (mappa && sottoLaPiega(mappa)) gsap.from(mappa, { clipPath: 'circle(0% at 50% 50%)', duration: 1.3, ease: 'expo.out', clearProps: 'clipPath', scrollTrigger: { trigger: mappa, start: 'top 85%', once: true } });

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
