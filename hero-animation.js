/* =============================================================
   APEXMEDIA — animazione hero (GSAP + SplitText)
   Entrata in scena dell'hero: eyebrow → headline (char reveal) →
   lede → CTA → scroll-hint. Rispetta prefers-reduced-motion e
   degrada in modo sicuro se GSAP/SplitText non sono disponibili
   (CDN offline, blocco script) mostrando il contenuto senza anim.
   ============================================================= */
(function () {
  'use strict';

  var hero = document.getElementById('hero');
  if (!hero) return;

  var els = {
    eyebrow: hero.querySelector('[data-hero="eyebrow"]'),
    headline: hero.querySelector('[data-hero="headline"]'),
    lede: hero.querySelector('[data-hero="lede"]'),
    cta: hero.querySelector('[data-hero="cta"]'),
    hint: hero.querySelector('[data-hero="hint"]')
  };
  if (!els.headline) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealed = false;

  /* fallback statico: rimuove lo stato nascosto senza animare */
  function revealStatic() {
    if (revealed) return;
    revealed = true;
    Object.keys(els).forEach(function (k) {
      if (els[k]) els[k].classList.add('hero-in');
    });
  }

  /* rete di sicurezza: se qualcosa va storto (CDN down, errore JS),
     il contenuto non deve restare invisibile per sempre */
  var safety = window.setTimeout(revealStatic, 2500);

  if (reduceMotion || typeof gsap === 'undefined') {
    window.clearTimeout(safety);
    revealStatic();
    return;
  }

  function animate() {
    window.clearTimeout(safety);
    if (revealed) return;
    revealed = true;

    var hasSplit = typeof SplitText !== 'undefined';
    var split = null;

    try {
      if (hasSplit) {
        gsap.registerPlugin(SplitText);
        split = SplitText.create(els.headline, {
          type: 'words, chars',
          wordsClass: 'word',
          charsClass: 'char',
          reduceWhiteSpace: true
        });
      }
    } catch (err) {
      split = null;
    }

    /* la headline è già "hero-el" (opacity:0 via CSS): la portiamo
       subito allo stato finale e lasciamo che siano i singoli
       caratteri a nascondersi/animarsi, per l'effetto a cascata */
    gsap.set(els.headline, { opacity: 1, y: 0 });

    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (els.eyebrow) {
      tl.to(els.eyebrow, { opacity: 1, y: 0, duration: 0.55 }, 0);
    }

    if (split && split.chars && split.chars.length) {
      tl.from(split.chars, {
        opacity: 0,
        yPercent: 60,
        rotateX: -35,
        transformOrigin: '50% 100%',
        transformPerspective: 400,
        stagger: 0.016,
        duration: 0.65
      }, 0.25);
    } else {
      tl.to(els.headline, { opacity: 1, y: 0, duration: 0.7 }, 0.25);
    }

    if (els.lede) {
      tl.to(els.lede, { opacity: 1, y: 0, duration: 0.6 }, '-=0.35');
    }
    if (els.cta) {
      tl.fromTo(els.cta,
        { opacity: 0, y: 14, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'back.out(1.6)' },
        '-=0.3'
      );
    }
    if (els.hint) {
      tl.to(els.hint, { opacity: 1, y: 0, duration: 0.6 }, '-=0.2');
    }
  }

  /* aspetta il caricamento dei font per misure corrette dello split */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(animate).catch(animate);
  } else {
    animate();
  }
})();
