/* =============================================================
   BAGNARINO COWORKING — animazioni (GSAP + ScrollTrigger)
   Meno ma migliori:
   - una sola "firma": la linea del tempo della storia, che si
     traccia mentre scorri e accende le tappe una a una;
   - tutto il resto compare in modo quasi impercettibile;
   - l'apertura si anima in CSS (subito, senza pesare).
   GSAP parte al primo gesto e rispetta "riduci movimento".
   Senza GSAP la pagina è già completa.
   ============================================================= */
(function () {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return [].slice.call((c || document).querySelectorAll(s)); }
  function sottoLaPiega(el) { return el.getBoundingClientRect().top > window.innerHeight * 0.9; }
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
      /* 1) la storia: il filo avanza con lo scorrimento, le tappe si accendono */
      var storia = $('.storia-sezione'), tempo = storia && $('[data-tempo]', storia);
      if (tempo) {
        var tappe = $$('.tappa', tempo), n = tappe.length;
        storia.classList.add('animata');
        tempo.style.setProperty('--avanza', '0');
        ScrollTrigger.create({
          trigger: tempo, start: 'top 78%', end: 'bottom 55%', scrub: 0.4,
          onUpdate: function (st) {
            var p = st.progress;
            tempo.style.setProperty('--avanza', p.toFixed(3));
            tappe.forEach(function (t, i) { t.classList.toggle('accesa', p >= (n > 1 ? i / (n - 1) : 0) * 0.96); });
          }
        });
      }

      /* 1b) una giornata: scorrendo l'orologio va dalle 9:30 alle 18:30
         e i quattro momenti si accendono quando arriva la loro ora */
      var corpo = $('[data-giornata]');
      if (corpo) {
        var momenti = $$('.momento', corpo), ore = momenti.map(function (m) {
          var t = ($('time', m) || {}).textContent || '', x = t.split(':');
          return (+x[0] || 0) + (+x[1] || 0) / 60;
        });
        var oraInizio = ore[0] || 9.5, oraFine = ore[ore.length - 1] || 18.5;
        var lOre = $('.lancetta-ore', corpo), lMin = $('.lancetta-min', corpo), digitale = $('[data-orologio-ora]', corpo);
        var segna = function (p) {
          var t = oraInizio + (oraFine - oraInizio) * p, q = Math.round(t * 4) / 4;
          corpo.style.setProperty('--avanza', p.toFixed(3));
          if (lOre) lOre.style.transform = 'rotate(' + ((t % 12) * 30).toFixed(1) + 'deg)';
          if (lMin) lMin.style.transform = 'rotate(' + ((t % 1) * 360).toFixed(1) + 'deg)';
          if (digitale) digitale.textContent = Math.floor(q) + ':' + String(Math.round((q % 1) * 60)).padStart(2, '0');
          var ultima = -1;
          momenti.forEach(function (m, i) { var on = t >= ore[i] - 0.05; m.classList.toggle('accesa', on); if (on) ultima = i; });
          momenti.forEach(function (m, i) { m.classList.toggle('ora-qui', i === ultima && p < 0.999); });
        };
        corpo.classList.add('animata');
        var stG = ScrollTrigger.create({
          trigger: corpo, start: 'top 70%', end: function () { return window.innerWidth >= 900 ? 'bottom 35%' : 'bottom 60%'; }, scrub: 0.5,
          onUpdate: function (st) { segna(st.progress); }, onRefresh: function (st) { segna(st.progress); }
        });
        segna(stG.progress);
      }

      /* 2) i titoli entrano parola per parola, da dietro una maschera */
      function spezzaParole(el) {
        var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), nodi = [];
        while (walker.nextNode()) if (walker.currentNode.nodeValue.trim()) nodi.push(walker.currentNode);
        nodi.forEach(function (n) {
          var frag = document.createDocumentFragment();
          n.nodeValue.split(/(\s+)/).forEach(function (pezzo) {
            if (!pezzo) return;
            if (/^\s+$/.test(pezzo)) { frag.appendChild(document.createTextNode(' ')); return; }
            var m = document.createElement('span'); m.className = 'maschera';
            var p = document.createElement('span'); p.className = 'parola-su'; p.textContent = pezzo;
            m.appendChild(p); frag.appendChild(m);
          });
          n.parentNode.replaceChild(frag, n);
        });
        return $$('.parola-su', el);
      }
      $$('.titolo-sezione, .disp-titolo, .finale h2').filter(sottoLaPiega).forEach(function (t) {
        var parole = spezzaParole(t);
        if (!parole.length) return;
        gsap.from(parole, { yPercent: 110, duration: 0.8, ease: 'power3.out', stagger: 0.045,
          scrollTrigger: { trigger: t, start: 'top 88%', once: true } });
      });

      /* 2b) testi e voci: comparsa leggera, sfalsata */
      var leggeri = $$('.occhiello, .intro-sezione, .negozio-lead, .fatti > div, .servizi-testa > *, .servizi-senza, .fidelity-testo > p[data-cfg], .fidelity-azioni, .vantaggi-mese, .perchi-testa p, .dove-scheda > *:not(h2), .faq-altro, .finale p, .finale .apertura-cta, .disp-live, .disp-azione > *, .prezzi-garanzie li')
        .filter(sottoLaPiega);
      if (leggeri.length) {
        gsap.set(leggeri, { opacity: 0, y: 16 });
        ScrollTrigger.batch(leggeri, { start: 'top 92%', once: true,
          onEnter: function (g) { gsap.to(g, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', stagger: 0.07, clearProps: 'opacity,transform' }); } });
      }

      /* 2c) liste: una voce alla volta, da sinistra */
      [['.ingresso-righe', 'li'], ['.servizi-senza ul', 'li'], ['.premi-scala', 'li'], ['.vantaggi-mese ul', 'li'], ['.faq', 'details'], ['.disp-giorni', '.disp-giorno'], ['.disp-scrivanie', '.disp-scrivania'], ['.tempo', '.tappa']].forEach(function (c) {
        $$(c[0]).forEach(function (lista) {
          var voci = $$(c[1], lista);
          if (!voci.length || !sottoLaPiega(lista)) return;
          gsap.from(voci, { opacity: 0, x: -18, duration: 0.55, ease: 'power2.out', stagger: 0.07, clearProps: 'opacity,transform',
            scrollTrigger: { trigger: lista, start: 'top 88%', once: true } });
        });
      });

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

      /* 2e) per chi è e lo spazio: i riquadri entrano alternati da destra e da sinistra */
      [$$('.profilo')].forEach(function (riquadri) {
        if (!riquadri.length || !sottoLaPiega(riquadri[0])) return;
        riquadri.forEach(function (r, i) {
          gsap.from(r, { opacity: 0, x: i % 2 ? 48 : -48, y: 24, duration: 0.8, ease: 'power3.out', clearProps: 'opacity,transform',
            scrollTrigger: { trigger: r, start: 'top 90%', once: true } });
        });
      });

      /* 2e-bis) negozio: la scheda "come arrivi" scivola sopra la foto */
      var ingresso = $('.ingresso');
      if (ingresso && sottoLaPiega(ingresso)) {
        var largo = window.innerWidth >= 900;
        gsap.from(ingresso, { opacity: 0, x: largo ? 80 : 0, y: largo ? 0 : 50, duration: 0.9, ease: 'power3.out', clearProps: 'opacity,transform',
          scrollTrigger: { trigger: ingresso, start: 'top 88%', once: true } });
      }

      /* 2e-ter) servizi inclusi: le card salgono a cascata e le icone "scattano" */
      var servizi = $$('.servizio:not([hidden])');
      if (servizi.length && sottoLaPiega(servizi[0])) {
        var tlS = gsap.timeline({ scrollTrigger: { trigger: '.servizi-griglia', start: 'top 85%', once: true } });
        tlS.from(servizi, { opacity: 0, y: 36, duration: 0.6, ease: 'power3.out', stagger: 0.08, clearProps: 'opacity,transform' })
          .from(servizi.map(function (c) { return $('.servizio-icona', c); }), { scale: 0.3, rotation: -35, duration: 0.55, ease: 'back.out(2.2)', stagger: 0.08, clearProps: 'transform' }, 0.15);
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

      /* 2h) la tessera ruota ed entra come posata sul tavolo, poi i timbri si pressano */
      var tessera = $('.tessera-scena .tessera');
      if (tessera && sottoLaPiega(tessera)) {
        gsap.from(tessera, { opacity: 0, rotationY: 35, rotationZ: -8, y: 60, transformPerspective: 1000, duration: 1.1, ease: 'power3.out', clearProps: 'opacity,transform',
          scrollTrigger: { trigger: tessera, start: 'top 85%', once: true } });
      }

      /* 2i) barra di lettura in alto, ocra */
      var barra = document.createElement('div'); barra.className = 'avanzamento'; barra.setAttribute('aria-hidden', 'true');
      document.body.appendChild(barra);
      gsap.to(barra, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 } });

      /* 3) Bagnarino Card: i timbri si posano uno alla volta */
      var timbri = $$('[data-timbri] .timbro.pieno');
      if (timbri.length && sottoLaPiega(timbri[0])) {
        gsap.from(timbri, { scale: 1.7, opacity: 0, rotation: -25, stagger: 0.09, duration: 0.32, ease: 'power3.in', clearProps: 'transform,opacity',
          delay: 0.6, scrollTrigger: { trigger: '[data-timbri]', start: 'top 80%', once: true } });
      }

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

    } catch (e) {
      /* rete di sicurezza: nulla deve restare nascosto */
      try { ScrollTrigger.getAll().forEach(function (t) { t.kill(); }); } catch (x) {}
      $$('[style]').forEach(function (el) { el.style.opacity = ''; el.style.transform = ''; el.style.clipPath = ''; });
      var s = $('.storia-sezione'); if (s) s.classList.remove('animata');
      $$('.parola-su').forEach(function (p) { p.style.transform = ''; });
      $$('[data-giornata]').forEach(function (c) { c.classList.remove('animata'); });
    }
  }

  /* GSAP parte al primo gesto (scorrere, toccare, tastiera):
     il caricamento della pagina resta leggero */
  var partito = false, gesti = ['scroll', 'wheel', 'touchstart', 'pointerdown', 'keydown'];
  function avvia() {
    if (partito) return; partito = true;
    gesti.forEach(function (g) { window.removeEventListener(g, avvia); });
    carica('/vendor/gsap/gsap.min.js')
      .then(function () { return carica('/vendor/gsap/ScrollTrigger.min.js'); })
      .then(anima)
      .catch(function () {});
  }
  function arma() {
    if (window.scrollY > 0) { avvia(); return; }
    gesti.forEach(function (g) { window.addEventListener(g, avvia, { passive: true }); });
  }
  if (document.readyState === 'complete') arma();
  else window.addEventListener('load', arma);
})();
