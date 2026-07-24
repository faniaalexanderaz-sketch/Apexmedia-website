/* =============================================================
   ANTICA FIORERIA DEL CENTRO — interazioni
   1) Scroll reveal + parallasse hero
   2) Carrello persistente (localStorage)
   3) Checkout in-sito (checkout.html)
   4) Suoni discreti opzionali (WebAudio, nessun file)
   ============================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 0) Visita pagina (anonima, per il pannello interno) ---------- */
  try {
    var datiVisita = JSON.stringify({ percorso: location.pathname });
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', new Blob([datiVisita], { type: 'application/json' }));
    } else {
      fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: datiVisita, keepalive: true }).catch(function () {});
    }
  } catch (e) {}

  /* ---------- 1) Reveal ---------- */
  if (!reduceMotion && 'IntersectionObserver' in window) {
    document.querySelectorAll('.section-head, .hero-copy, .atelier-copy').forEach(function (blk) {
      blk.querySelectorAll('.reveal').forEach(function (el, i) {
        el.style.setProperty('--d', (i * 90) + 'ms');
      });
    });
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Parallasse hero ---------- */
  var art = document.querySelector('.hero-img');
  if (art && !reduceMotion) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(function () {
          var y = Math.min(window.scrollY, window.innerHeight);
          art.style.transform = 'translate3d(0,' + (y * 0.1).toFixed(1) + 'px,0) scale(1.06)';
          ticking = false;
        });
      }
    }, { passive: true });
  }

  /* =============================================================
     4) SUONI — campanellino generato, volume minimo, disattivabile
     ============================================================= */
  var soundOn = localStorage.getItem('afc-sound') !== 'off';
  var actx = null;

  function chime(freqs, vol) {
    if (!soundOn) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
      var t = actx.currentTime;
      freqs.forEach(function (f, i) {
        var o = actx.createOscillator();
        var g = actx.createGain();
        o.type = 'sine';
        o.frequency.value = f;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(vol, t + 0.012 + i * 0.05);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22 + i * 0.05);
        o.connect(g).connect(actx.destination);
        o.start(t + i * 0.05);
        o.stop(t + 0.3 + i * 0.05);
      });
    } catch (e) { /* audio non disponibile: silenzio */ }
  }
  var suonoAggiunta = function () { chime([659.3, 880], 0.05); };   // E5 → A5
  var suonoCarrello = function () { chime([523.3], 0.035); };       // C5, più sommesso

  var soundBtn = document.getElementById('soundBtn');
  function paintSound() {
    if (!soundBtn) return;
    soundBtn.setAttribute('aria-pressed', String(soundOn));
    soundBtn.classList.toggle('sound-off', !soundOn);
    soundBtn.title = soundOn ? 'Suoni attivi — disattiva' : 'Suoni disattivati — attiva';
  }
  if (soundBtn) {
    soundBtn.addEventListener('click', function () {
      soundOn = !soundOn;
      localStorage.setItem('afc-sound', soundOn ? 'on' : 'off');
      paintSound();
      if (soundOn) suonoAggiunta();
    });
    paintSound();
  }

  /* =============================================================
     2) CARRELLO — persistente tra pagine e ricariche
     ============================================================= */
  var cart = [];
  try { cart = JSON.parse(localStorage.getItem('afc-cart') || '[]'); } catch (e) { cart = []; }

  var elCart = document.getElementById('cart');
  var elScrim = document.getElementById('cartScrim');
  var elList = document.getElementById('cartList');
  var elEmpty = document.getElementById('cartEmpty');
  var elFoot = document.getElementById('cartFoot');
  var elTotal = document.getElementById('cartTotal');
  var elCount = document.getElementById('cartCount');
  var elOrder = document.getElementById('cartOrder');
  var elToast = document.getElementById('toast');
  var toastTimer = null;

  function euro(n) {
    return '€ ' + (Number.isInteger(n) ? n : n.toFixed(2).replace('.', ','));
  }
  function salva() { localStorage.setItem('afc-cart', JSON.stringify(cart)); }

  /* coupon attivo (codice applicato nel carrello) */
  function couponAttivo() {
    var code = localStorage.getItem('afc-coupon-attivo');
    if (!code || typeof AFC === 'undefined') return null;
    return AFC.couponValido(code);
  }

  /* spedizione assicurata: 12€ se il carrello ha solo pacchi S/M, 15€ se
     contiene anche solo un pacco L/XL (un unico invio, tariffa più alta) */
  function spedizioneCorrente() {
    if (!cart.length) return 0;
    var haLXL = cart.some(function (r) { return r.tier === 'lxl'; });
    return haLXL ? 15 : 12;
  }

  function totali() {
    var sub = cart.reduce(function (s, r) { return s + r.prezzo * r.qty; }, 0);
    var c = couponAttivo();
    var sconto = c ? Math.round(sub * c.pct) / 100 : 0;
    var spedizione = spedizioneCorrente();
    return { sub: sub, coupon: c, sconto: sconto, spedizione: spedizione, tot: Math.round((sub - sconto) * 100) / 100 + spedizione };
  }

  function render() {
    var items = cart.length;
    var t = totali();
    var pezzi = cart.reduce(function (s, r) { return s + r.qty; }, 0);

    elCount.hidden = pezzi === 0;
    elCount.textContent = pezzi;
    elEmpty.style.display = items ? 'none' : '';
    elFoot.hidden = !items;

    var elSped = document.getElementById('cartSpedizione');
    if (elSped) {
      elSped.textContent = items ? 'Spedizione assicurata: ' + euro(t.spedizione) : '';
    }

    /* riga sconto nel totale */
    var lblTot = elTotal.previousElementSibling;
    if (t.coupon) {
      lblTot.innerHTML = 'Totale <em class="tot-sconto">coupon ' + t.coupon.codice + ' −' + t.coupon.pct + '%</em>';
      elTotal.innerHTML = '<s>' + euro(t.sub) + '</s> ' + euro(t.tot);
    } else {
      lblTot.textContent = 'Totale';
      elTotal.textContent = euro(t.tot);
    }

    elList.innerHTML = '';
    cart.forEach(function (r, idx) {
      var li = document.createElement('li');
      li.className = 'cart-item';
      li.innerHTML =
        '<div class="cart-item-info"><div class="cart-item-name"></div>' +
        '<div class="stepper"><button class="step-btn meno" aria-label="Riduci quantità">−</button>' +
        '<span class="step-n">' + r.qty + '</span>' +
        '<button class="step-btn piu" aria-label="Aumenta quantità">+</button></div></div>' +
        '<span class="cart-item-price">' + euro(r.prezzo * r.qty) + '</span>' +
        '<button class="cart-item-remove" aria-label="Rimuovi dal carrello">×</button>';
      li.querySelector('.cart-item-name').textContent = r.nome;
      li.querySelector('.meno').addEventListener('click', function () {
        if (r.qty > 1) r.qty -= 1; else cart.splice(idx, 1);
        salva(); render();
      });
      li.querySelector('.piu').addEventListener('click', function () {
        r.qty += 1; salva(); render();
      });
      li.querySelector('.cart-item-remove').addEventListener('click', function () {
        cart.splice(idx, 1); salva(); render();
      });
      elList.appendChild(li);
    });
    salva();
  }

  function toast(msg) {
    elToast.textContent = msg;
    elToast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { elToast.hidden = true; }, 2600);
  }

  function add(nome, prezzo, slug, tier) {
    var found = cart.find(function (r) { return r.nome === nome; });
    if (found) found.qty += 1;
    else cart.push({ nome: nome, prezzo: prezzo, qty: 1, slug: slug || null, tier: tier || 'sm' });
    render();
    suonoAggiunta();
    toast('«' + nome + '» aggiunto al carrello');
  }

  function openCart() {
    elCart.hidden = false; elScrim.hidden = false;
    document.body.style.overflow = 'hidden';
    suonoCarrello();
    document.getElementById('cartClose').focus();
  }
  function closeCart() {
    elCart.hidden = true; elScrim.hidden = true;
    document.body.style.overflow = '';
    document.getElementById('cartBtn').focus();
  }

  document.getElementById('cartBtn').addEventListener('click', openCart);
  document.getElementById('cartClose').addEventListener('click', closeCart);
  elScrim.addEventListener('click', closeCart);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !elCart.hidden) closeCart();
  });

  document.querySelectorAll('[data-nome]').forEach(function (card) {
    var nome = card.getAttribute('data-nome');
    var prezzo = parseInt(card.getAttribute('data-prezzo'), 10);
    card.querySelector('.add').addEventListener('click', function () { add(nome, prezzo); });
    card.querySelector('.buy').addEventListener('click', function () { add(nome, prezzo); openCart(); });
  });

  // ritorno da /pagamento-annullato: riapri il carrello
  if (/[?&#]carrello/.test(location.search + location.hash)) {
    setTimeout(openCart, 350);
  }

  /* =============================================================
     3) CHECKOUT — tutto sul sito: il carrello porta a checkout.html
     (extra, indirizzo di consegna e pagamento in un'unica pagina)
     ============================================================= */
  function checkout(e) {
    e.preventDefault();
    if (!cart.length) return;
    salva();
    location.href = 'checkout.html';
  }

  if (elOrder) {
    elOrder.removeAttribute('href');
    elOrder.setAttribute('role', 'button');
    elOrder.setAttribute('tabindex', '0');
    elOrder.addEventListener('click', checkout);
    elOrder.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') checkout(e);
    });
  }

  /* =============================================================
     MENU CATEGORIE — drawer da sinistra (hamburger in nav)
     ============================================================= */
  (function () {
    var btn = document.getElementById('menuBtn');
    var menu = document.getElementById('menu');
    var scrim = document.getElementById('menuScrim');
    var close = document.getElementById('menuClose');
    if (!btn || !menu || !scrim) return;

    function apri() {
      menu.hidden = false; scrim.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      close.focus();
    }
    function chiudi() {
      menu.hidden = true; scrim.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      btn.focus();
    }
    btn.addEventListener('click', apri);
    close.addEventListener('click', chiudi);
    scrim.addEventListener('click', chiudi);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) chiudi();
    });
    /* ogni voce chiude il menu (il filtro lo applica catalogo.js) */
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        menu.hidden = true; scrim.hidden = true;
        btn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  })();

  /* =============================================================
     COUPON nel carrello — campo codice sopra il totale
     ============================================================= */
  (function () {
    if (!elFoot || typeof AFC === 'undefined') return;
    var box = document.createElement('div');
    box.className = 'coupon-box';
    box.innerHTML =
      '<label class="sr-only" for="couponInput">Codice sconto</label>' +
      '<input id="couponInput" type="text" placeholder="Hai un codice sconto?" autocomplete="off" />' +
      '<button class="btn btn-ghost btn-sm" id="couponApplica" type="button">Applica</button>' +
      '<p class="coupon-msg" id="couponMsg" role="status" hidden></p>';
    elFoot.insertBefore(box, elFoot.firstChild);
    var input = box.querySelector('#couponInput');
    var msg = box.querySelector('#couponMsg');

    var attivo = couponAttivo();
    if (attivo) { input.value = attivo.codice; }

    box.querySelector('#couponApplica').addEventListener('click', function () {
      var code = input.value.trim().toUpperCase();
      if (!code) return;
      if (!AFC.utenteCorrente()) {
        msg.textContent = 'Accedi al tuo account per usare i coupon.';
        msg.hidden = false; return;
      }
      var c = AFC.couponValido(code);
      if (!c) {
        msg.textContent = 'Codice non valido o già utilizzato.';
        msg.hidden = false;
        localStorage.removeItem('afc-coupon-attivo');
      } else {
        msg.textContent = c.descrizione + ' — applicato ✓';
        msg.hidden = false;
        localStorage.setItem('afc-coupon-attivo', code);
      }
      render();
    });
  })();

  /* =============================================================
     WISHLIST — cuore su card e banner
     ============================================================= */
  (function () {
    if (typeof AFC === 'undefined') return;
    document.querySelectorAll('[data-nome]').forEach(function (el) {
      var nome = el.getAttribute('data-nome');
      var foto = el.querySelector('.card-photo, .banner-foto');
      if (!foto) return;
      var heart = document.createElement('button');
      heart.className = 'heart';
      heart.setAttribute('aria-label', 'Salva nei preferiti');
      heart.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 20.5C7 16.6 3.5 13.4 3.5 9.8 3.5 7.2 5.5 5.2 8 5.2c1.6 0 3.1.8 4 2.1.9-1.3 2.4-2.1 4-2.1 2.5 0 4.5 2 4.5 4.6 0 3.6-3.5 6.8-8.5 10.7Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>';
      if (AFC.inWishlist(nome)) heart.classList.add('salvato');
      heart.addEventListener('click', function (ev) {
        ev.preventDefault();
        var r = AFC.toggleWishlist(nome);
        if (r.richiedeLogin) {
          toast('Accedi per salvare i preferiti — tocca il profilo in alto');
          return;
        }
        heart.classList.toggle('salvato', r.salvato);
        heart.classList.remove('pop'); void heart.offsetWidth; heart.classList.add('pop');
        if (r.salvato) { toast('«' + nome + '» salvato nei preferiti ♥'); suonoAggiunta(); }
      });
      foto.appendChild(heart);
    });
  })();

  /* =============================================================
     RECENSIONI — rating sintetico sulle card (dati bottega)
     ============================================================= */
  (function () {
    var RATING = {
      'Mattino in Bottega':  ['4,9', 31],
      'Domenica al Centro':  ['5,0', 18],
      "Lettera d'Aprile":    ['4,8', 24],
      'Verde Silenzio':      ['4,9', 12],
      'Ora Dorata':          ['4,8', 16],
      'Piccola Poesia':      ['4,9', 27],
      'Prima Fioritura':     ['5,0', 6],
      'Il Mazzo del Sabato': ['4,9', 44]
    };
    document.querySelectorAll('[data-nome]').forEach(function (el) {
      var r = RATING[el.getAttribute('data-nome')];
      if (!r) return;
      var riga = document.createElement('p');
      riga.className = 'rating';
      riga.innerHTML = '<span class="stelle" aria-hidden="true">★★★★★</span> ' +
        '<span>' + r[0] + '</span> <span class="rating-n">(' + r[1] + ' recensioni)</span>';
      riga.setAttribute('aria-label', 'Valutazione ' + r[0] + ' su 5, ' + r[1] + ' recensioni');
      var dopo = el.querySelector('.card-name, .banner-body .display');
      if (dopo) dopo.insertAdjacentElement('afterend', riga);
    });
  })();

  /* richiede l'invio dell'email di benvenuto con BENVENUTO10 (server-side,
     non blocca mai il sito: se l'email non parte, l'iscrizione resta comunque valida) */
  function richiediEmailBenvenuto(email) {
    try {
      fetch('/api/invia-benvenuto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
      }).catch(function () {});
    } catch (e) {}
  }

  /* =============================================================
     NEWSLETTER — footer
     ============================================================= */
  (function () {
    var form = document.getElementById('newsForm');
    if (!form || typeof AFC === 'undefined') return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = document.getElementById('newsEmail').value;
      var r = AFC.iscriviNewsletter(email);
      var ok = document.getElementById('newsOk');
      if (r.errore) { toast(r.errore); return; }
      form.hidden = true;
      ok.hidden = false;
      suonoAggiunta();
      richiediEmailBenvenuto(email);
    });
  })();

  /* =============================================================
     BARRA SCONTO PRIMO ORDINE — sopra la nav, richiudibile
     ============================================================= */
  (function () {
    var bar = document.getElementById('promoBar');
    if (!bar) return;
    if (localStorage.getItem('afc-promo-chiusa') === '1') { bar.remove(); return; }
    document.body.classList.add('promo-attiva');
    function misura() {
      document.documentElement.style.setProperty('--promo-h', bar.offsetHeight + 'px');
    }
    misura();
    window.addEventListener('resize', misura);
    var chiudi = document.getElementById('promoBarChiudi');
    if (chiudi) chiudi.addEventListener('click', function () {
      bar.remove();
      document.body.classList.remove('promo-attiva');
      localStorage.setItem('afc-promo-chiusa', '1');
    });
  })();

  /* =============================================================
     POPUP NEWSLETTER — sconto di benvenuto (10s o exit-intent)
     ============================================================= */
  (function () {
    var pop = document.getElementById('newsPop');
    var scrimPop = document.getElementById('newsPopScrim');
    if (!pop || !scrimPop || typeof AFC === 'undefined') return;
    if (localStorage.getItem('afc-news-pop-visto') === '1') return;
    if (AFC.utenteCorrente()) return;

    var mostrato = false;
    function apri() {
      if (mostrato) return;
      mostrato = true;
      pop.hidden = false; scrimPop.hidden = false;
      document.body.style.overflow = 'hidden';
    }
    function chiudi(ricorda) {
      pop.hidden = true; scrimPop.hidden = true;
      document.body.style.overflow = '';
      if (ricorda) localStorage.setItem('afc-news-pop-visto', '1');
    }

    var timer = setTimeout(apri, 10000);

    if (matchMedia('(min-width: 900px)').matches) {
      document.addEventListener('mouseout', function (e) {
        if (!e.relatedTarget && e.clientY <= 0) apri();
      });
    }

    document.getElementById('newsPopChiudi').addEventListener('click', function () { chiudi(true); });
    scrimPop.addEventListener('click', function () { chiudi(true); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !pop.hidden) chiudi(true);
    });

    document.getElementById('newsPopForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var campo = document.getElementById('newsPopEmail');
      var r = AFC.iscriviNewsletter(campo.value);
      if (r.errore) { campo.focus(); return; }
      document.getElementById('newsPopForm').hidden = true;
      document.getElementById('newsPopOk').hidden = false;
      localStorage.setItem('afc-news-pop-visto', '1');
      richiediEmailBenvenuto(campo.value);
      clearTimeout(timer);
      setTimeout(function () { chiudi(false); }, 2200);
    });
  })();

  /* account: pallino oro se loggato */
  (function () {
    var btn = document.getElementById('accountBtn');
    if (btn && typeof AFC !== 'undefined' && AFC.utenteCorrente()) btn.classList.add('loggato');
  })();

  /* API esposta per il catalogo (catalogo.js): aggiungere al carrello e
     aprire il drawer da fuori questa IIFE, senza duplicare la logica. */
  window.AFC_CART = { add: add, openCart: openCart, render: render };

  render();
})();
