/* =============================================================
   APEXMEDIA — interazioni
   1) Walkthrough: crossfade scale+opacity tra background (rAF, GPU)
   2) Lazy-load reale delle immagini (IntersectionObserver)
   3) Reveal: animation-timeline: view() dove supportato, IO fallback
   4) Form → costruzione dinamica link WhatsApp + window.open
   ============================================================= */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sections = Array.from(document.querySelectorAll('.panel[data-section]'));
  const layers = Array.from(document.querySelectorAll('.bg-layer[data-bg]'));

  /* ---------- smoothstep ---------- */
  const smoothstep = (a, b, x) => {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };

  /* =============================================================
     1) WALKTHROUGH — il driver principale, affidabile ovunque
     Per ogni sezione calcola p = scostamento del suo centro dal
     centro viewport (in unità di viewport). p=0 → a fuoco.
     - opacity: piena al centro, sfuma verso i bordi (smoothstep)
     - scale:  in arrivo parte più grande e "avanza" a 1.0;
               in uscita scende sotto 1.0 e "recede".
     Solo transform/opacity. z-index pilotato dall'opacità.
     ============================================================= */
  function updateStage() {
    const vh = window.innerHeight;
    const vpCenter = vh / 2;

    for (let i = 0; i < sections.length; i++) {
      const r = sections[i].getBoundingClientRect();
      const center = r.top + r.height / 2;
      let p = (center - vpCenter) / vh;          // <0 sopra (uscita), >0 sotto (entrata)
      p = Math.max(-1.2, Math.min(1.2, p));

      const layer = layers[i];
      const opacity = 1 - smoothstep(0.12, 0.92, Math.abs(p));

      let scale, ty;
      if (reduceMotion) {
        scale = 1; ty = 0;
      } else if (p >= 0) {                        // in arrivo: avvicinamento a fuoco
        scale = 1 + p * 0.10;
        ty = p * 1.5;                             // micro-parallasse (vh%)
      } else {                                    // in uscita: si allontana
        scale = 1 + p * 0.06;                     // p<0 → <1.0
        ty = p * 1.5;
      }

      layer.style.opacity = opacity.toFixed(3);
      layer.style.transform = 'translate3d(0,' + ty.toFixed(2) + 'vh,0) scale(' + scale.toFixed(4) + ')';
      layer.style.zIndex = String(Math.round(opacity * 1000));
    }
  }

  let ticking = false;
  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => { updateStage(); ticking = false; });
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  window.addEventListener('orientationchange', onScroll, { passive: true });
  window.addEventListener('load', updateStage);
  updateStage();

  /* =============================================================
     2) LAZY-LOAD reale — carica la foto quando la sua sezione
        si avvicina (~1.5 viewport). La prima (hero) è già caricata.
     ============================================================= */
  const lazyImgs = Array.from(document.querySelectorAll('.bg-img[data-src]'));
  if ('IntersectionObserver' in window && lazyImgs.length) {
    const loadImg = (img) => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      }
    };
    const lazyIO = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const layer = e.target;
          const img = layer.querySelector('.bg-img[data-src]');
          if (img) loadImg(img);
          obs.unobserve(layer);
        }
      });
    }, { rootMargin: '150% 0px 150% 0px' });

    layers.forEach((layer) => {
      if (layer.querySelector('.bg-img[data-src]')) lazyIO.observe(layer);
    });
  } else {
    lazyImgs.forEach((img) => { img.src = img.dataset.src; });
  }

  /* =============================================================
     3) REVEAL — usa lo scroll-timeline nativo dove c'è;
        altrimenti IntersectionObserver. Mai entrambi insieme.
     ============================================================= */
  const supportsViewTimeline =
    !reduceMotion &&
    typeof CSS !== 'undefined' && CSS.supports && CSS.supports('animation-timeline: view()');

  if (supportsViewTimeline) {
    document.documentElement.classList.add('has-vt'); // CSS gestisce i reveal
  } else if (!reduceMotion && 'IntersectionObserver' in window) {
    // stagger leggero tra elementi figli diretti del medesimo blocco
    document.querySelectorAll('.panel-inner').forEach((inner) => {
      inner.querySelectorAll(':scope > .reveal').forEach((el, idx) => {
        el.style.setProperty('--d', (idx * 80) + 'ms');
      });
    });
    const revealIO = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach((el) => revealIO.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
  }

  /* =============================================================
     4) FORM → WhatsApp
        Costruisce dinamicamente il link wa.me con i dati inseriti
        e apre WhatsApp (app su mobile, Web su desktop).
     ============================================================= */
  const PHONE = '393515940685';
  const form = document.getElementById('leadForm');
  const errEl = document.getElementById('formError');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const nome = form.nome.value.trim();
      const email = form.email.value.trim();
      const tel = form.telefono.value.trim();

      if (!nome || !email || !tel) {
        if (errEl) errEl.hidden = false;
        const firstEmpty = !nome ? form.nome : !email ? form.email : form.telefono;
        firstEmpty.focus();
        return;
      }
      if (errEl) errEl.hidden = true;

      const msg = 'Ciao, mi chiamo ' + nome + ', vorrei prenotare una consulenza. ' +
                  'Email: ' + email + ', Tel: ' + tel;
      const url = 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(msg);
      window.open(url, '_blank', 'noopener,noreferrer');
    });

    // nascondi l'errore appena l'utente corregge
    form.addEventListener('input', function () {
      if (errEl && !errEl.hidden) errEl.hidden = true;
    });
  }
})();
