/* =============================================================
   ESSENZA D'ORIENTE — animazioni (GSAP)
   Va caricato DOPO script.js (e dopo lo script della headline Ads):
   prende in carico i [data-reveal] e anima il testo definitivo.

   - Hero: il loto sboccia, il titolo affiora lettera per lettera
     come inchiostro, le stelle Google si accendono una a una,
     "Prenota ora" è visibile entro ~0,6s.
   - Scorrendo: titoli che salgono dalla maschera, card con la foto
     che si scopre, sigillo dell'offerta che ruota in scena, loti
     dei divisori che sbocciano, ideogrammi del footer a pennello.

   Se GSAP manca o l'utente preferisce meno movimento non fa nulla:
   restano il reveal CSS di script.js e l'hero statica.
   ============================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  function liberaHero() { root.classList.remove('anim-attesa'); }

  if (!window.gsap || !window.ScrollTrigger || !window.SplitText ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    liberaHero();
    return;
  }

  gsap.registerPlugin(ScrollTrigger, SplitText);
  var DRAW = !!window.DrawSVGPlugin;
  if (DRAW) gsap.registerPlugin(DrawSVGPlugin);

  var ORO = '#B99A45';
  var FINE = 'transform,opacity,filter,transition,clipPath,letterSpacing';

  /* l'hero si anima solo se è ancora in attesa: se la rete è stata
     lenta e la protezione nell'head l'ha già mostrata, non la si
     nasconde di nuovo (niente contenuto che sparisce sotto gli occhi) */
  var introHero = root.classList.contains('anim-attesa');

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return [].slice.call((ctx || document).querySelectorAll(sel)); }
  function prendi(el) { el.removeAttribute('data-reveal'); el.classList.remove('in-vista'); }
  function allaVista(el, fn, start) {
    ScrollTrigger.create({ trigger: el, start: start || 'top 88%', once: true, onEnter: fn });
  }

  /* rete di sicurezza: se qualcosa si rompe a metà, tutto torna visibile */
  function ripristina() {
    liberaHero();
    try { ScrollTrigger.getAll().forEach(function (t) { t.kill(); }); } catch (e) {}
    $$('[style]').forEach(function (el) {
      if (el.style.opacity !== '' || el.style.transform !== '' || el.style.clipPath !== '') {
        gsap.set(el, { clearProps: FINE + ',visibility' });
      }
    });
  }

  try {
    root.classList.add('gsap-attivo');

    /* ---------- utilità di scena ---------- */

    /* loto: i petali sbocciano dal centro verso l'esterno */
    function loto(svg, tl, at) {
      var petali = $$('path', svg);
      if (!petali.length) return;
      var t = tl || gsap;
      var vars = {
        scale: 0, opacity: 0, transformOrigin: '50% 100%', duration: 0.9,
        ease: 'back.out(2.2)', stagger: { each: 0.08, from: 'center' }, clearProps: 'transform,opacity'
      };
      if (tl) tl.from(petali, vars, at); else t.from(petali, vars);
    }

    /* stelle ★★★★★: si accendono una alla volta */
    function stelle(el, tl, at) {
      var s = SplitText.create(el, { type: 'chars', charsClass: 'st' });
      var vars = {
        scale: 0, opacity: 0, rotate: -90, duration: 0.55, ease: 'back.out(3)', stagger: 0.09,
        onComplete: function () { s.revert(); }
      };
      if (tl) tl.from(s.chars, vars, at); else gsap.from(s.chars, vars);
    }

    /* titolo lettera per lettera, "a inchiostro": sale e si mette a fuoco */
    function inchiostro(el, tl, at, passo) {
      var s = SplitText.create(el, { type: 'words,chars', charsClass: 'hc' });
      tl.from(s.chars, {
        opacity: 0, yPercent: 45, filter: 'blur(12px)', duration: 0.95, ease: 'expo.out',
        stagger: passo || 0.016
      }, at);
      tl.add(function () { s.revert(); }, '>');
    }

    /* ======================================================
       1) HERO della home
       ====================================================== */
    var hero = $('.hero');
    if (hero && introHero) {
      var copy = $('.hero-copy', hero);
      var eyebrow = $('.hero-eyebrow', hero);
      var h1 = $('h1', hero);
      var sub = $('.hero-sub', hero);
      var prova = $('.hero-prova', hero);
      var scelta = $('.hero-scelta', hero);
      var cta = $('.hero-cta', hero);
      var nota = $('.hero-nota', hero);
      var foto = $('.hero-foto', hero);
      var sfondoMob = $('.hero-sfondo-mobile img', hero);
      var marchio = $('.hero-marchio-mini', hero);

      liberaHero();
      var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      if (sfondoMob) tl.fromTo(sfondoMob, { scale: 1.14 }, { scale: 1, duration: 2.6, ease: 'power2.out', clearProps: 'transform' }, 0);
      if (marchio) tl.from(marchio, { opacity: 0, letterSpacing: '.4em', duration: 1.2, clearProps: 'opacity,letterSpacing' }, 0);
      if (foto) {
        tl.fromTo(foto, { clipPath: 'inset(0% 0% 0% 100% round 18px)' },
          { clipPath: 'inset(0% 0% 0% 0% round 18px)', duration: 1.3, ease: 'power3.inOut', clearProps: 'clipPath' }, 0.05);
      }

      if (eyebrow) {
        tl.from(eyebrow, { opacity: 0, y: 12, letterSpacing: '.3em', duration: 0.9, clearProps: FINE }, 0);
        var lotoEy = $('svg', eyebrow);
        if (lotoEy) loto(lotoEy, tl, 0.15);
      }

      if (h1) inchiostro(h1, tl, 0.1, 0.016);

      if (sub) {
        var sSub = SplitText.create(sub, { type: 'words' });
        tl.from(sSub.words, {
          opacity: 0, y: 12, filter: 'blur(6px)', duration: 0.7, stagger: 0.014,
          onComplete: function () { sSub.revert(); }
        }, 0.35);
      }

      if (prova) {
        tl.from(prova, { opacity: 0, y: 16, duration: 0.7, clearProps: 'transform,opacity' }, 0.42);
        var st = $('.stelle', prova);
        if (st) stelle(st, tl, 0.6);
        var voto = $('.hero-prova-voto', prova);
        if (voto) {
          var v = { n: 0 };
          tl.to(v, {
            n: 5, duration: 1, ease: 'power2.out',
            onUpdate: function () { voto.textContent = v.n.toFixed(1).replace('.', ','); },
            onComplete: function () { voto.textContent = '5,0'; }
          }, 0.5);
        }
      }

      if (scelta) {
        var titoloScelta = $('.hero-scelta-titolo', scelta);
        if (titoloScelta) tl.from(titoloScelta, { opacity: 0, x: -16, duration: 0.6, clearProps: 'transform,opacity' }, 0.45);
        var num = $('.hero-scelta-num', scelta);
        if (num) tl.from(num, { scale: 0, rotate: -120, duration: 0.6, ease: 'back.out(3)', clearProps: 'transform' }, 0.5);
        var chip = $$('.hero-chip', scelta);
        if (chip.length) {
          tl.from(chip, {
            opacity: 0, y: 18, scale: 0.9, duration: 0.6, ease: 'back.out(2)', stagger: 0.06,
            clearProps: 'transform,opacity'
          }, 0.5);
        }
      }

      if (cta) {
        var bottone = $('#heroCtaPrenota', cta);
        if (bottone) {
          tl.from(bottone, { opacity: 0, y: 22, scale: 0.88, duration: 0.8, ease: 'back.out(1.8)', clearProps: 'transform,opacity' }, 0.55);
          /* riflesso di luce: tre passaggi, poi resta il "respiro" già esistente */
          var luce = document.createElement('span');
          luce.className = 'cta-luce';
          luce.setAttribute('aria-hidden', 'true');
          bottone.appendChild(luce);
          gsap.fromTo(luce, { xPercent: -130 }, {
            xPercent: 130, duration: 1.1, ease: 'power2.inOut', delay: 1.6, repeat: 2, repeatDelay: 4.5
          });
        }
        var tel = $('.hero-cta-tel', cta);
        if (tel) tl.from(tel, { opacity: 0, x: -12, duration: 0.6, clearProps: 'transform,opacity' }, 0.7);
      }

      if (nota) tl.from(nota, { opacity: 0, y: 10, duration: 0.6, clearProps: 'transform,opacity' }, 0.8);

      /* scorrendo oltre, il testo dell'hero sale e sfuma */
      if (copy && window.matchMedia('(min-width: 821px)').matches) {
        gsap.to(copy, {
          yPercent: -6, opacity: 0.4, ease: 'none',
          scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
        });
      }
    }

    /* ======================================================
       1b) HERO delle pagine trattamento
       ====================================================== */
    var heroT = $('.hero-tratt');
    if (heroT && introHero) {
      liberaHero();
      var tlT = gsap.timeline({ defaults: { ease: 'power3.out' } });
      var etT = $('.etichetta', heroT);
      if (etT) tlT.from(etT, { opacity: 0, letterSpacing: '.45em', duration: 1, clearProps: 'opacity,letterSpacing' }, 0);
      var h1T = $('h1', heroT);
      if (h1T) inchiostro(h1T, tlT, 0.1, 0.022);
      var subT = $('.hero-sub', heroT);
      if (subT) {
        tlT.from(subT, { opacity: 0, y: 14, filter: 'blur(6px)', duration: 0.8, clearProps: FINE }, 0.35);
        var stT = $('.stelle', subT);
        if (stT) stelle(stT, tlT, 0.55);
      }
      var btnT = $('.btn', heroT);
      if (btnT) tlT.from(btnT, { opacity: 0, y: 20, scale: 0.88, duration: 0.8, ease: 'back.out(1.8)', clearProps: 'transform,opacity' }, 0.5);
    }
    liberaHero();

    /* ======================================================
       2) TITOLI, ETICHETTE, TESTI
       ====================================================== */
    function animaTitolo(el) {
      var split = SplitText.create(el, { type: 'words', mask: 'words', wordsClass: 'sw' });
      gsap.set(split.words, { yPercent: 120, rotate: 6, transformOrigin: '0% 100%' });
      allaVista(el, function () {
        gsap.to(split.words, {
          yPercent: 0, rotate: 0, duration: 1.05, ease: 'power4.out', stagger: 0.06,
          onComplete: function () { split.revert(); }
        });
      });
    }
    function animaEtichetta(el) {
      var ls = getComputedStyle(el).letterSpacing;
      if (ls === 'normal') ls = '0px';
      gsap.set(el, { opacity: 0, letterSpacing: '.45em' });
      allaVista(el, function () {
        gsap.to(el, { opacity: 1, letterSpacing: ls, duration: 1, ease: 'power3.out', clearProps: 'opacity,letterSpacing' });
      }, 'top 92%');
    }
    function animaTesto(el, ritardo) {
      gsap.set(el, { opacity: 0, y: 20, filter: 'blur(5px)' });
      allaVista(el, function () {
        gsap.to(el, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, delay: ritardo || 0, ease: 'power3.out', clearProps: FINE });
      }, 'top 92%');
    }

    /* le teste di sezione non si animano in blocco: ogni pezzo entra per conto suo */
    $$('.sez-testa').forEach(function (t) {
      prendi(t);
      $$(':scope > p', t).forEach(function (p) { animaTesto(p, 0.35); });
    });
    $$('main h2').forEach(function (h) {
      if (h.closest('.hero') || h.closest('[hidden]')) return;
      animaTitolo(h);
    });
    $$('main .etichetta').forEach(function (e) {
      if (e.closest('.hero-tratt') && introHero) return;
      animaEtichetta(e);
    });
    $$('.corpo-tratt > p, .offerta-copy > p, .prenota-alt > p').forEach(function (p) { animaTesto(p); });

    /* ======================================================
       3) BLOCCHI — ogni tipo ha il suo ingresso
       ====================================================== */
    var VARIANTI = [
      { sel: '.tratt', da: { opacity: 0, y: 70, scale: 0.93 },
        extra: function (el) {
          var f = $('.tratt-foto-clip', el);
          return f ? [f, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power3.inOut' }] : null;
        } },
      { sel: '.fiducia-voce', da: { opacity: 0, y: 36 },
        extra: function (el) {
          var ic = $('.fiducia-icona', el);
          return ic ? [ic, { scale: 0, rotate: -40 }, { scale: 1, rotate: 0, duration: 0.8, ease: 'back.out(2.4)', delay: 0.12 }] : null;
        } },
      { sel: '.contatto-scheda', da: { opacity: 0, y: 40, rotateX: -20, transformPerspective: 800, transformOrigin: '50% 0%' } },
      { sel: '.faq-voce', da: { opacity: 0, x: -40 } },
      { sel: '*', da: { opacity: 0, y: 40, scale: 0.97 } }
    ];
    function variante(el) {
      for (var i = 0; i < VARIANTI.length; i++) if (el.matches(VARIANTI[i].sel)) return VARIANTI[i];
    }

    /* ingressi scattati nello stesso fotogramma partono insieme, a cascata */
    var coda = [];
    var frame = 0;
    function svuota() {
      var gruppo = coda; coda = []; frame = 0;
      gruppo.forEach(function (voce, i) {
        gsap.to(voce.el, {
          opacity: 1, x: 0, y: 0, scale: 1, rotate: 0, rotateX: 0,
          duration: 1, ease: 'power3.out', delay: i * 0.1, clearProps: FINE
        });
        var ex = voce.v.extra && voce.v.extra(voce.el);
        if (ex) {
          var dopo = Object.assign({}, ex[2]);
          dopo.delay = (dopo.delay || 0) + i * 0.1;
          dopo.clearProps = FINE;
          gsap.fromTo(ex[0], ex[1], dopo);
        }
      });
    }
    function osserva(el) {
      prendi(el);
      var v = variante(el);
      gsap.set(el, Object.assign({ transition: 'none' }, v.da));
      var ex = v.extra && v.extra(el);
      if (ex) gsap.set(ex[0], ex[1]);
      allaVista(el, function () {
        coda.push({ el: el, v: v });
        if (!frame) frame = requestAnimationFrame(svuota);
      }, 'top 92%');
    }
    $$('[data-reveal]').forEach(osserva);

    /* ======================================================
       4) SCENE SPECIALI
       ====================================================== */

    /* divisori a loto: i filetti si allungano, il fiore sboccia */
    $$('.loto-divisore').forEach(function (d) {
      var svg = $('svg', d);
      gsap.set(d, { '--linea': 0 });
      if (svg) gsap.set($$('path', svg), { scale: 0, opacity: 0, transformOrigin: '50% 100%' });
      allaVista(d, function () {
        gsap.to(d, { '--linea': 1, duration: 1.2, ease: 'power2.inOut' });
        if (svg) gsap.to($$('path', svg), { scale: 1, opacity: 1, duration: 0.9, ease: 'back.out(2.2)', stagger: { each: 0.09, from: 'center' }, delay: 0.2, clearProps: 'transform,opacity' });
      }, 'top 92%');
    });

    /* badge Google delle recensioni + nastro che entra da destra */
    $$('.badge-google').forEach(function (b) {
      gsap.set(b, { opacity: 0, y: 20, scale: 0.9 });
      allaVista(b, function () {
        gsap.to(b, { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'back.out(2)', clearProps: 'transform,opacity' });
        var st = $('.stelle', b);
        if (st) stelle(st);
      });
    });
    $$('.recensioni-viewport').forEach(function (r) {
      gsap.set(r, { opacity: 0, x: 90 });
      allaVista(r, function () { gsap.to(r, { opacity: 1, x: 0, duration: 1.3, ease: 'power3.out', clearProps: 'transform,opacity' }); });
    });

    /* widget di prenotazione: si solleva */
    $$('.prenota-cornice').forEach(function (c) {
      gsap.set(c, { opacity: 0, y: 50, scale: 0.96 });
      allaVista(c, function () { gsap.to(c, { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: 'power3.out', clearProps: 'transform,opacity' }); });
    });
    $$('.prenota-alt .btn, .prenota-alt-bottoni .btn, .offerta-cta-riga .btn, .box-prezzo .btn').forEach(function (b, i) {
      gsap.set(b, { opacity: 0, y: 20, scale: 0.9 });
      allaVista(b, function () { gsap.to(b, { opacity: 1, y: 0, scale: 1, duration: 0.7, delay: (i % 2) * 0.1, ease: 'back.out(2)', clearProps: 'transform,opacity' }); }, 'top 95%');
    });

    /* offerta: il sigillo ruota in scena, il conto alla rovescia si ribalta */
    $$('.offerta-sez').forEach(function (o) {
      var sig = $('.offerta-sigillo', o);
      var blocchi = $$('.offerta-conto-blocco', o);
      if (sig) gsap.set(sig, { scale: 0, rotate: -200, opacity: 0 });
      if (blocchi.length) gsap.set(blocchi, { rotateX: -90, opacity: 0, transformPerspective: 600, transformOrigin: '50% 0%' });
      allaVista(o, function () {
        if (sig) gsap.to(sig, { scale: 1, rotate: 0, opacity: 1, duration: 1.3, ease: 'back.out(1.6)', clearProps: 'transform,opacity' });
        if (blocchi.length) gsap.to(blocchi, { rotateX: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.12, delay: 0.3, clearProps: 'transform,opacity' });
      }, 'top 80%');
    });

    /* pagine trattamento: foto che si scopre, prezzo che si stacca, altri trattamenti a cascata */
    $$('.foto-tratt-box').forEach(function (f) {
      gsap.set(f, { clipPath: 'inset(0% 100% 0% 0% round 18px)' });
      allaVista(f, function () { gsap.to(f, { clipPath: 'inset(0% 0% 0% 0% round 18px)', duration: 1.3, ease: 'power3.inOut', clearProps: 'clipPath' }); }, 'top 90%');
    });
    $$('.box-prezzo').forEach(function (b) {
      gsap.set(b, { opacity: 0, y: 40, scale: 0.94 });
      allaVista(b, function () { gsap.to(b, { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'back.out(1.7)', clearProps: 'transform,opacity' }); });
    });
    $$('.altri-tratt').forEach(function (a) {
      var link = $$('a', a);
      gsap.set(link, { opacity: 0, y: 20, scale: 0.9 });
      allaVista(a, function () { gsap.to(link, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(2)', stagger: 0.06, clearProps: 'transform,opacity' }); });
    });

    /* footer: gli ideogrammi compaiono come pennellate, il resto a cascata */
    $$('.fondo').forEach(function (f) {
      var cinese = $('.fondo-cinese', f);
      var resto = $$(':scope > *', f).filter(function (el) { return el !== cinese; });
      gsap.set(resto, { opacity: 0, y: 24 });
      var sC = null;
      if (cinese) {
        sC = SplitText.create(cinese, { type: 'chars', charsClass: 'hc' });
        gsap.set(sC.chars, { opacity: 0, scale: 1.6, filter: 'blur(10px)' });
      }
      allaVista(f, function () {
        gsap.to(resto, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08, clearProps: 'transform,opacity' });
        if (sC) gsap.to(sC.chars, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.1, ease: 'power2.out', stagger: 0.14, delay: 0.2, onComplete: function () { sC.revert(); } });
      }, 'top 95%');
    });

    /* foto, iframe e font cambiano l'altezza della pagina dopo il caricamento */
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
