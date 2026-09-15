/* =============================================================
   ARABESQUE BUSALLA — movimento e interazioni premium
   Entrate 3D scaglionate, inclinazione al mouse, parallasse,
   anteprima rapida, miniatura che vola nel carrello.
   Tutto su transform e opacity: nessun ricalcolo di layout.
   ============================================================= */
(function () {
  'use strict';
  var ridotto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var tocco = window.matchMedia('(hover: none)').matches;

  /* ---------------------------------------------------------
     Entrate scaglionate: il ritardo lo calcola la posizione,
     non una classe scritta a mano.
     --------------------------------------------------------- */
  function scaglionaSimili() {
    var gruppi = {};
    document.querySelectorAll('.entra:not(.dentro)').forEach(function (n) {
      var padre = n.parentNode;
      if (!padre) return;
      var k = padre.dataset.gruppo || (padre.dataset.gruppo = 'g' + Math.random().toString(36).slice(2, 7));
      gruppi[k] = gruppi[k] || [];
      gruppi[k].push(n);
    });
    Object.keys(gruppi).forEach(function (k) {
      var elenco = gruppi[k];
      if (elenco.length < 2) return;
      elenco.forEach(function (n, i) {
        if (n.style.transitionDelay) return;
        n.style.transitionDelay = Math.min(i * 70, 420) + 'ms';
      });
    });
  }

  /* ---------------------------------------------------------
     Inclinazione 3D al passaggio del mouse
     --------------------------------------------------------- */
  function inclina(radice) {
    if (ridotto || tocco) return;
    (radice || document).querySelectorAll('[data-tilt]:not([data-tilt-attivo])').forEach(function (c) {
      c.dataset.tiltAttivo = '1';
      var forza = parseFloat(c.dataset.tilt) || 6;
      var raf = null;
      c.addEventListener('pointermove', function (e) {
        if (raf) return;
        raf = requestAnimationFrame(function () {
          raf = null;
          var r = c.getBoundingClientRect();
          var x = (e.clientX - r.left) / r.width - .5;
          var y = (e.clientY - r.top) / r.height - .5;
          c.style.transform = 'perspective(1100px) rotateY(' + (x * forza) + 'deg) rotateX(' + (-y * forza) + 'deg) translateY(-6px)';
        });
      });
      c.addEventListener('pointerleave', function () { c.style.transform = ''; });
    });
  }

  /* ---------------------------------------------------------
     Parallasse: gli strati si muovono a velocità diverse
     --------------------------------------------------------- */
  function parallasse() {
    if (ridotto) return;
    var nodi = [].slice.call(document.querySelectorAll('[data-parallasse]'));
    if (!nodi.length) return;
    var mx = 0, my = 0, dx = 0, dy = 0, girando = false;

    if (!tocco) {
      window.addEventListener('pointermove', function (e) {
        dx = (e.clientX / window.innerWidth - .5) * 2;
        dy = (e.clientY / window.innerHeight - .5) * 2;
        avvia();
      }, { passive: true });
    }
    window.addEventListener('scroll', avvia, { passive: true });

    function avvia() { if (!girando) { girando = true; requestAnimationFrame(passo); } }
    function passo() {
      mx += (dx - mx) * .06; my += (dy - my) * .06;
      var vh = window.innerHeight;
      nodi.forEach(function (n) {
        var p = parseFloat(n.dataset.parallasse) || .3;
        var r = n.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var centro = (r.top + r.height / 2 - vh / 2) / vh;   /* -1 … 1 */
        var y = -centro * 26 * p;
        n.style.transform = 'translate3d(' + (mx * 16 * p) + 'px,' + (y + my * 10 * p) + 'px,0)';
      });
      girando = Math.abs(dx - mx) > .001 || Math.abs(dy - my) > .001;
      if (girando) requestAnimationFrame(passo);
    }
    avvia();
  }

  /* ---------------------------------------------------------
     Barra di avanzamento della lettura
     --------------------------------------------------------- */
  function avanzamento() {
    if (ridotto) return;
    var barra = document.createElement('div');
    barra.className = 'avanzamento';
    barra.setAttribute('aria-hidden', 'true');
    document.body.appendChild(barra);
    var raf = null;
    window.addEventListener('scroll', function () {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = null;
        var h = document.documentElement.scrollHeight - window.innerHeight;
        barra.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, window.scrollY / h) : 0) + ')';
      });
    }, { passive: true });
  }

  /* ---------------------------------------------------------
     La CTA principale respira una volta quando entra in vista
     --------------------------------------------------------- */
  function respiroCTA() {
    if (ridotto || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (voci) {
      voci.forEach(function (v) {
        if (!v.isIntersecting) return;
        v.target.classList.add('respira');
        io.unobserve(v.target);
        setTimeout(function () { v.target.classList.remove('respira'); }, 2600);
      });
    }, { threshold: .9 });
    document.querySelectorAll('.btn-cta').forEach(function (b) { io.observe(b); });
  }

  /* ---------------------------------------------------------
     La miniatura del capo vola dentro il carrello
     --------------------------------------------------------- */
  function vola(origine) {
    if (ridotto || !origine) return;
    var meta = document.querySelector('[data-apri="carrello"]');
    if (!meta) return;
    var a = origine.getBoundingClientRect(), b = meta.getBoundingClientRect();
    if (!a.width) return;
    var clone = document.createElement('div');
    clone.className = 'volante';
    clone.style.cssText = 'left:' + a.left + 'px;top:' + a.top + 'px;width:' + a.width + 'px;height:' + a.height + 'px;';
    clone.innerHTML = origine.innerHTML;
    document.body.appendChild(clone);
    requestAnimationFrame(function () {
      var sx = 44 / a.width, sy = 44 / a.height;
      clone.style.transform = 'translate(' + (b.left + b.width / 2 - a.left - a.width / 2) + 'px,' +
        (b.top + b.height / 2 - a.top - a.height / 2) + 'px) scale(' + Math.min(sx, sy) + ')';
      clone.style.opacity = '.15';
    });
    setTimeout(function () { clone.remove(); }, 820);
  }

  /* aggancio: ogni aggiunta al carrello fa volare la foto giusta */
  if (window.ARB && ARB.aggiungi) {
    var originale = ARB.aggiungi;
    ARB.aggiungi = function (slug, taglia, colore, qta) {
      var foto = document.querySelector('.capo-foto[href*="p=' + slug + '"]') ||
                 document.getElementById('pdpGrande') ||
                 document.querySelector('.sbircia.aperta .sbircia-foto');
      vola(foto);
      return originale(slug, taglia, colore, qta);
    };
  }

  /* ---------------------------------------------------------
     Anteprima rapida: comprare senza lasciare il catalogo
     --------------------------------------------------------- */
  var pannello = null;
  function apriSbircia(slug) {
    var p = arbProdotto(slug);
    if (!p) return;
    if (!pannello) {
      pannello = document.createElement('div');
      pannello.className = 'sbircia';
      pannello.setAttribute('role', 'dialog');
      pannello.setAttribute('aria-modal', 'true');
      document.body.appendChild(pannello);
    }
    var finale = arbPrezzoFinale(p);
    var cons = ARB.consegna();
    var taglie = (p.taglie || []).map(function (t) {
      return '<button type="button" class="taglia-box" data-sb-taglia="' + t.id + '"' + (t.stock > 0 ? '' : ' disabled') + '>' +
        t.id + (t.stock > 0 && t.stock <= 2 ? '<i>ultimi ' + t.stock + '</i>' : '') + '</button>';
    }).join('');

    pannello.innerHTML =
      '<button class="sbircia-chiudi" data-sb-chiudi aria-label="Chiudi">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M18 6 6 18M6 6l12 12"/></svg></button>' +
      '<div class="sbircia-in">' +
        '<div class="sbircia-foto">' + ARB.boxFoto(arbFoto(p, 1), p.nome, 'A', p.sottocategoria) + '</div>' +
        '<div>' +
          '<p class="capo-casa">' + arbBrand() + '</p>' +
          '<h2 style="font-size:var(--t-7);margin:8px 0 12px">' + p.nome + '</h2>' +
          '<p class="pdp-prezzo">' +
            (p.sconto ? '<span class="prezzo-vecchio">' + arbEuro(p.prezzo) + '</span>' : '') +
            '<span class="prezzo-ora' + (p.sconto ? ' saldo' : '') + '">' + arbEuro(finale) + '</span></p>' +
          '<p style="color:var(--grafite);font-size:var(--t-3);margin:14px 0 20px">' + p.descrizione.slice(0, 150) + '…</p>' +
          '<p class="pdp-eti">Taglia</p>' +
          '<div class="taglie-griglia" id="sbTaglie">' + taglie + '</div>' +
          '<p class="pdp-vestibilita">' + p.vestibilita + '</p>' +
          '<div class="consegna-box" style="margin:20px 0">' +
            '<div class="consegna-riga">' +
              '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 7h13v10H3zM16 10h3.5L21 13v4h-5z"/><circle cx="7" cy="18" r="1.5"/><circle cx="17.5" cy="18" r="1.5"/></svg>' +
              '<div><b>A casa ' + cons.testoCorriere + '</b></div>' +
            '</div>' +
          '</div>' +
          '<button class="btn btn-cta btn-blocco" data-sb-aggiungi="' + p.slug + '">Aggiungi al carrello' +
            '<span class="cerchio"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></button>' +
          '<p style="text-align:center;margin-top:14px"><a class="link-linea" href="prodotto.html?p=' + p.slug + '">Vedi la scheda completa</a></p>' +
        '</div>' +
      '</div>';

    document.getElementById('velo').classList.add('aperto');
    document.body.classList.add('no-scroll');
    requestAnimationFrame(function () { pannello.classList.add('aperta'); });
    ARB.evento('view_item', { item_id: p.slug, item_name: p.nome, price: finale, fonte: 'anteprima' });
  }
  function chiudiSbircia() {
    if (!pannello) return;
    pannello.classList.remove('aperta');
    document.getElementById('velo').classList.remove('aperto');
    document.body.classList.remove('no-scroll');
  }

  document.addEventListener('click', function (e) {
    var sb = e.target.closest('[data-sbircia]');
    if (sb) { e.preventDefault(); apriSbircia(sb.dataset.sbircia); return; }
    if (e.target.closest('[data-sb-chiudi]') || (e.target.id === 'velo' && pannello && pannello.classList.contains('aperta'))) {
      chiudiSbircia(); return;
    }
    var t = e.target.closest('[data-sb-taglia]');
    if (t && !t.disabled) {
      pannello.querySelectorAll('[data-sb-taglia]').forEach(function (x) { x.classList.remove('scelta'); });
      t.classList.add('scelta');
      return;
    }
    var add = e.target.closest('[data-sb-aggiungi]');
    if (add) {
      var scelta = pannello.querySelector('[data-sb-taglia].scelta');
      if (!scelta) {
        ARB.avviso('Scegli prima la taglia');
        var g = document.getElementById('sbTaglie');
        if (g) { g.classList.add('scuoti'); setTimeout(function () { g.classList.remove('scuoti'); }, 520); }
        return;
      }
      ARB.aggiungi(add.dataset.sbAggiungi, scelta.dataset.sbTaglia);
      chiudiSbircia();
    }
  });
  window.addEventListener('keydown', function (e) { if (e.key === 'Escape') chiudiSbircia(); });

  /* ---------------------------------------------------------
     Transizioni di pagina: la foto cliccata si espande
     --------------------------------------------------------- */
  function transizioni() {
    if (!document.startViewTransition) return;
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a.capo-foto[href*="prodotto.html"]');
      if (!a) return;
      var foto = a.querySelector('.foto');
      if (foto) foto.style.viewTransitionName = 'capo-in-volo';
      setTimeout(function () { if (foto) foto.style.viewTransitionName = ''; }, 1200);
    }, true);
    /* sulla scheda prodotto la foto grande riceve lo stesso nome */
    var grande = document.getElementById('pdpGrande');
    if (grande) {
      var f = grande.querySelector('.foto');
      if (f) {
        f.style.viewTransitionName = 'capo-in-volo';
        setTimeout(function () { f.style.viewTransitionName = ''; }, 1000);
      }
    }
  }


  /* ---------------------------------------------------------
     VETRINA VIVA: la fila di capi scorre da sola.
     Due file identiche: quando la prima esce a sinistra la
     seconda è già al suo posto, il giro non ha stacchi.
     Si ferma sotto il puntatore, fuori vista e al primo tocco.
     --------------------------------------------------------- */
  var VELOCITA = 52;   /* px al secondo: si legge prezzo e nome senza rincorrerli */

  function vetrina(radice) {
    (radice || document).querySelectorAll('.vetrina:not([data-vetrina-attiva])').forEach(function (v) {
      var fila = v.querySelector('.vetrina-fila');
      if (!fila || !fila.children.length) return;
      v.dataset.vetrinaAttiva = '1';

      /* su schermi molto larghi pochi capi non bastano a coprire la
         fascia: si ripetono finché la fila è più larga del contenitore,
         altrimenti nel giro comparirebbe un vuoto */
      var originali = [].slice.call(fila.children);
      var giri = 0;
      while (fila.getBoundingClientRect().width < v.getBoundingClientRect().width && giri < 4) {
        originali.forEach(function (n) { fila.appendChild(n.cloneNode(true)); });
        giri++;
      }

      if (ridotto) return;   /* fila ferma e leggibile, nient'altro: nessuna copia */

      /* la copia serve solo agli occhi: per lo screen reader non esiste */
      var copia = fila.cloneNode(true);
      copia.setAttribute('aria-hidden', 'true');
      copia.querySelectorAll('a, button, input').forEach(function (n) { n.tabIndex = -1; });
      v.appendChild(copia);


      function misura() {
        var largo = fila.getBoundingClientRect().width;
        if (largo < 40) return;
        v.style.setProperty('--vetrina-durata', Math.round(largo / VELOCITA) + 's');
      }
      misura();
      v.classList.add('corre');
      if ('ResizeObserver' in window) new ResizeObserver(misura).observe(fila);

      /* le card di una fascia che scorre entrano insieme con la fascia:
         osservarle una per una mentre si muovono farebbe lampeggiare
         mezza fila ad ogni giro */
      function scopri() {
        v.querySelectorAll('.entra:not(.dentro)').forEach(function (n) {
          n.style.transitionDelay = '';
          n.classList.add('dentro');
          alloScoperto(n);
        });
      }

      /* fuori vista l'animazione dorme: niente calore sprecato sul telefono */
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (voci) {
          var dentro = voci[0].isIntersecting;
          v.classList.toggle('fuori-vista', !dentro);
          if (dentro) scopri();
        }, { threshold: 0 }).observe(v);
      } else {
        scopri();
      }

      /* primo tocco: l'utente prende il comando e la fila torna
         una pista da trascinare. Congeliamo la posizione esatta
         travasando lo spostamento dell'animazione nello scroll. */
      function prendi() {
        if (v.classList.contains('presa')) return;
        var tr = getComputedStyle(fila).transform;
        var spostato = 0;
        try { if (tr && tr !== 'none') spostato = -(new DOMMatrix(tr).m41 || 0); } catch (e) {}
        v.classList.remove('corre');
        v.classList.add('presa');
        v.scrollLeft = spostato;
        /* se il contenitore non può scorrere fin lì teniamo il resto
           sulla fila: il capo sotto il dito non si sposta di un pixel */
        var resto = spostato - v.scrollLeft;
        fila.style.transform = resto ? 'translate3d(' + (-resto) + 'px,0,0)' : '';
      }
      v.addEventListener('pointerdown', prendi, true);   /* prima del trascinamento, che legge scrollLeft */
      v.addEventListener('wheel', prendi, { passive: true });
      v.addEventListener('keydown', prendi);
      v.prendiComando = prendi;

      /* al tocco la card sotto il dito si solleva e la segue mentre
         trascina: lo stesso linguaggio del :hover desktop.
         Servono gli eventi touch, non i pointer: appena parte lo
         scorrimento nativo il browser annulla il pointer e il
         sollevamento cadrebbe subito. */
      if (tocco) {
        var sollevata = null;
        function solleva(t) {
          if (!t) return;
          var sotto = document.elementFromPoint(t.clientX, t.clientY);
          var c = sotto && sotto.closest ? sotto.closest('.capo') : null;
          if (c === sollevata) return;
          if (sollevata) sollevata.classList.remove('sotto-dito');
          sollevata = c;
          if (c) c.classList.add('sotto-dito');
        }
        function posa() {
          if (sollevata) sollevata.classList.remove('sotto-dito');
          sollevata = null;
        }
        v.addEventListener('touchstart', function (e) { solleva(e.touches[0]); }, { passive: true });
        v.addEventListener('touchmove', function (e) { solleva(e.touches[0]); }, { passive: true });
        ['touchend', 'touchcancel'].forEach(function (ev) {
          v.addEventListener(ev, posa, { passive: true });
        });
      }
    });
  }

  /* ---------------------------------------------------------
     LA PAROLA CHE SI ACCENDE — rara e mirata, mai decorativa.
     Una sola volta per visita: al ritorno in cima non si ripete.
     --------------------------------------------------------- */
  function accendi(n, ritardo) {
    if (!n) return;
    if (ridotto) { n.classList.add('acceso'); return; }
    setTimeout(function () { n.classList.add('acceso'); }, ritardo || 0);
  }

  function accensioni() {
    var hero = document.querySelector('.hero .si-accende');
    if (hero) {
      var gia = false;
      try { gia = sessionStorage.getItem('arb-accensione') === 'fatta'; } catch (e) {}
      if (gia) hero.classList.add('acceso');
      else {
        accendi(hero, 750);
        try { sessionStorage.setItem('arb-accensione', 'fatta'); } catch (e) {}
      }
    }
    /* nel manifesto curvy l'accensione viaggia con la scala taglie:
       stesso osservatore, nessun secondo osservatore da pagare */
    var manifesto = document.querySelector('.notte .si-accende');
    if (manifesto && 'IntersectionObserver' in window) {
      var scala = document.getElementById('scalaTaglie') || manifesto;
      new IntersectionObserver(function (voci, io) {
        if (!voci[0].isIntersecting) return;
        io.disconnect();
        accendi(manifesto, 900);
      }, { threshold: .4 }).observe(scala);
    } else if (manifesto) {
      manifesto.classList.add('acceso');
    }
  }

  /* ---------------------------------------------------------
     Il prezzo conta verso l'alto quando la card entra in vista:
     l'occhio ci si posa sopra proprio mentre decide.
     --------------------------------------------------------- */
  /* Il prezzo NON si anima. Un numero che sale da 0,00 fa leggere per
     qualche frame un prezzo che non è quello vero (misurato: 150,50 al
     posto di 151,20) e ritarda l'unica informazione su cui il cliente
     decide. Rimosso di proposito: era estetica che costava conversione. */

  /* ---------------------------------------------------------
     Il monogramma dei segnaposto respira una volta: un segno di
     vita finché non arrivano le foto vere.
     --------------------------------------------------------- */
  function respiroMonogramma(card) {
    if (ridotto || !card) return;
    var m = card.querySelector('.foto-vuota-m');
    if (m && !m.classList.contains('viva')) m.classList.add('viva');
  }

  /* main.js chiama questo per ogni nodo .entra che entra in vista:
     un solo osservatore per tutto, come già faceva. */
  function alloScoperto(n) {
    if (!n) return;
    respiroMonogramma(n);
  }

  /* ---------------------------------------------------------
     Avvio
     --------------------------------------------------------- */
  function avvia() {
    scaglionaSimili();
    vetrina();
    accensioni();
    inclina();
    parallasse();
    avanzamento();
    respiroCTA();
    transizioni();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', avvia);
  else avvia();

  /* le griglie costruite da JS chiedono un secondo passaggio */
  window.ARB_MOVIMENTO = {
    scagliona: scaglionaSimili, inclina: inclina, respiro: respiroCTA,
    vola: vola, sbircia: apriSbircia,
    vetrina: vetrina, accensioni: accensioni, alloScoperto: alloScoperto
  };
})();
