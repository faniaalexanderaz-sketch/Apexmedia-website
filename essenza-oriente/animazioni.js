/* =============================================================
   ESSENZA D'ORIENTE — coreografia (GSAP + SplitText + ScrollTrigger)
   Linguaggio: righe che salgono da una maschera, evidenziatore che si
   disegna, fade-up pesanti con easing a molla, nastro continuo,
   contatori. Mai lettere che ruotano, mai blur, mai rimbalzi.
   Se GSAP manca o l'utente preferisce meno movimento: tutto visibile,
   nessuna animazione.
   ============================================================= */
(function () {
  'use strict';
  var root = document.documentElement;
  var meno = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function mostraTutto() {
    root.classList.remove('anim-attesa');
    document.querySelectorAll('[data-reveal]').forEach(function (el) { el.classList.add('pronto'); });
  }
  if (meno || !window.gsap || !window.ScrollTrigger) { mostraTutto(); return; }

  gsap.registerPlugin(ScrollTrigger);
  var haSplit = !!window.SplitText;
  var EASE = 'expo.out';
  var MOLLA = 'power4.out';

  /* ---------- hero ---------- */
  var hero = document.querySelector('.hero');
  if (hero) {
    var copy = hero.querySelector('.hero-copy');
    var h1 = hero.querySelector('h1');
    var visual = hero.querySelector('.hero-visual');
    var foto = hero.querySelector('.hero-foto');
    var card = hero.querySelector('.hero-card');
    var tag = hero.querySelector('.hero-tag');
    var figli = copy ? Array.prototype.slice.call(copy.children) : [];
    var altri = figli.filter(function (el) { return el !== h1; });

    var tl = gsap.timeline({ defaults: { ease: EASE }, onStart: function () { root.classList.remove('anim-attesa'); } });
    gsap.set(figli, { opacity: 1 });
    if (visual) gsap.set(visual, { opacity: 1 });

    /* etichetta di stato */
    if (altri[0]) tl.from(altri[0], { opacity: 0, y: 14, duration: .9 }, 0);

    /* titolo: righe da una maschera + evidenziatore */
    if (h1 && haSplit) {
      var hls = h1.querySelectorAll('.hl');
      if (hls.length) gsap.set(hls, { backgroundSize: '0% 100%' });
      var split = SplitText.create(h1, { type: 'lines', mask: 'lines', linesClass: 'riga-split' });
      tl.from(split.lines, { yPercent: 110, duration: 1.3, ease: MOLLA, stagger: .09 }, .1);
      if (hls.length) tl.to(h1.querySelectorAll('.hl'), { backgroundSize: '100% 100%', duration: .9, ease: 'power3.inOut' }, .8);
    } else if (h1) {
      tl.from(h1, { opacity: 0, y: 30, duration: 1.1 }, .1);
    }

    /* sottotitolo, cta, prova */
    var resto = altri.slice(1);
    if (resto.length) tl.from(resto, { opacity: 0, y: 24, duration: 1, stagger: .1 }, .45);

    /* foto: clip dal basso, scala; card e tag entrano dopo */
    if (foto) {
      var img = foto.querySelector('img');
      tl.from(foto, { clipPath: 'inset(12% 0% 0% 0% round 28px)', opacity: 0, duration: 1.4, ease: MOLLA, clearProps: 'clipPath,opacity' }, .25);
      if (img) tl.from(img, { scale: 1.12, duration: 2.2, ease: 'power2.out', clearProps: 'transform' }, .25);
    }
    if (card) tl.from(card, { opacity: 0, y: 30, rotate: 0, duration: 1, ease: MOLLA, clearProps: 'opacity' }, .9);
    if (tag) tl.from(tag, { opacity: 0, x: 14, duration: .9, clearProps: 'opacity' }, 1);

    /* la foto segue leggermente il mouse (solo desktop) */
    if (foto && matchMedia('(min-width: 900px) and (hover: hover)').matches) {
      var qx = gsap.quickTo(foto, 'x', { duration: 1.2, ease: 'power3' });
      var qy = gsap.quickTo(foto, 'y', { duration: 1.2, ease: 'power3' });
      hero.addEventListener('mousemove', function (e) {
        var r = hero.getBoundingClientRect();
        qx(((e.clientX - r.left) / r.width - .5) * 16);
        qy(((e.clientY - r.top) / r.height - .5) * 12);
      });
      hero.addEventListener('mouseleave', function () { qx(0); qy(0); });
    }
  } else {
    root.classList.remove('anim-attesa');
  }

  /* ---------- titoli di sezione: righe da una maschera ---------- */
  document.querySelectorAll('[data-split]').forEach(function (el) {
    if (!haSplit) { gsap.from(el, { opacity: 0, y: 24, duration: 1, ease: EASE, scrollTrigger: { trigger: el, start: 'top 88%', once: true } }); return; }
    var s = SplitText.create(el, { type: 'lines', mask: 'lines' });
    gsap.from(s.lines, { yPercent: 110, duration: 1.2, ease: MOLLA, stagger: .08, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });

  /* ---------- blocchi: fade-up pesante, a gruppi ---------- */
  var reveal = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  ScrollTrigger.batch(reveal, {
    start: 'top 90%',
    once: true,
    onEnter: function (batch) {
      gsap.fromTo(batch, { opacity: 0, y: 28 }, {
        opacity: 1, y: 0, duration: 1.1, ease: EASE, stagger: .08, overwrite: true,
        onStart: function () { batch.forEach(function (el) { el.classList.add('pronto'); }); },
        clearProps: 'transform'
      });
    }
  });
  /* sicurezza: ciò che è già sopra la piega resta visibile anche se batch non scatta */
  setTimeout(function () { reveal.forEach(function (el) { if (!el.classList.contains('pronto') && el.getBoundingClientRect().top < window.innerHeight) { el.classList.add('pronto'); gsap.set(el, { opacity: 1 }); } }); }, 1500);

  /* ---------- contatori ---------- */
  document.querySelectorAll('[data-conta]').forEach(function (el) {
    var fine = parseInt(el.getAttribute('data-conta'), 10);
    var o = { n: 0 };
    gsap.to(o, {
      n: fine, duration: 1.6, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 92%', once: true },
      onUpdate: function () { el.textContent = Math.round(o.n); }
    });
  });

  /* ---------- nastro continuo ---------- */
  var nastro = document.getElementById('nastro');
  if (nastro) {
    var loop = gsap.to(nastro, { xPercent: -50, duration: 38, ease: 'none', repeat: -1, paused: true });
    ScrollTrigger.create({ trigger: nastro, start: 'top bottom', end: 'bottom top', onToggle: function (s) { s.isActive ? loop.play() : loop.pause(); } });
    document.addEventListener('visibilitychange', function () { document.hidden ? loop.pause() : (ScrollTrigger.isInViewport(nastro) && loop.play()); });
  }

  /* ---------- footer: marchio gigante che sale ---------- */
  var marchio = document.querySelector('.fondo-marchio .display');
  if (marchio) gsap.from(marchio, { yPercent: 40, opacity: 0, duration: 1.4, ease: MOLLA, scrollTrigger: { trigger: marchio, start: 'top 98%', once: true } });

  /* ---------- fallback: se dopo 2 s qualcosa è ancora invisibile, mostralo ---------- */
  setTimeout(mostraTutto, 2200);
})();
