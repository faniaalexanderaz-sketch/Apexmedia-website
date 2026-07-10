/* =============================================================
   ANTICA FIORERIA DEL CENTRO — interazioni
   1) Scroll reveal + parallasse hero
   2) Carrello persistente (localStorage)
   3) Checkout Stripe (client-only) con modalità demo
   4) Suoni discreti opzionali (WebAudio, nessun file)
   ============================================================= */
(function () {
  'use strict';

  /* =============================================================
     CONFIGURAZIONE STRIPE — inserisci qui le tue chiavi.
     Dashboard Stripe → Sviluppatori → Chiavi API (pk_live_… o pk_test_…)
     e per ogni bouquet crea un Prodotto con Prezzo → copia il price_…
     Richiede: Impostazioni → Checkout → abilita "Client-only integration".
     Finché la chiave è vuota, il checkout gira in MODALITÀ DEMO.
     ============================================================= */
  var STRIPE = {
    publishableKey: '',                  // es. 'pk_live_...'
    prices: {
      'Mattino in Bottega':  '',         // es. 'price_1ABC...'
      "Lettera d'Aprile":    '',
      'Verde Silenzio':      '',
      'Ora Dorata':          '',
      'Piccola Poesia':      '',
      'Domenica al Centro':  '',
      'Prima Fioritura':     '',
      'Il Mazzo del Sabato': ''
    }
  };

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  function totali() {
    var sub = cart.reduce(function (s, r) { return s + r.prezzo * r.qty; }, 0);
    var c = couponAttivo();
    var sconto = c ? Math.round(sub * c.pct) / 100 : 0;
    return { sub: sub, coupon: c, sconto: sconto, tot: Math.round((sub - sconto) * 100) / 100 };
  }

  function render() {
    var items = cart.length;
    var t = totali();
    var pezzi = cart.reduce(function (s, r) { return s + r.qty; }, 0);

    elCount.hidden = pezzi === 0;
    elCount.textContent = pezzi;
    elEmpty.style.display = items ? 'none' : '';
    elFoot.hidden = !items;

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

  function add(nome, prezzo) {
    var found = cart.find(function (r) { return r.nome === nome; });
    if (found) found.qty += 1;
    else cart.push({ nome: nome, prezzo: prezzo, qty: 1 });
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
     3) CHECKOUT — Stripe Checkout (client-only), demo se non configurato
     ============================================================= */
  function stripePronto() {
    return STRIPE.publishableKey &&
      cart.every(function (r) { return STRIPE.prices[r.nome]; });
  }

  function caricaStripeJs() {
    return new Promise(function (resolve, reject) {
      if (window.Stripe) return resolve();
      var s = document.createElement('script');
      s.src = 'https://js.stripe.com/v3/';
      s.onload = resolve;
      s.onerror = function () { reject(new Error('Stripe.js non raggiungibile')); };
      document.head.appendChild(s);
    });
  }

  function urlBase() {
    // pagina corrente senza il nome file → funziona in root o sottocartella
    return location.origin + location.pathname.replace(/[^/]*$/, '');
  }

  function checkout(e) {
    e.preventDefault();
    if (!cart.length) return;
    if (stripePronto() && typeof AFC_COOKIE !== 'undefined' && AFC_COOKIE.stato() !== 'accettato') {
      toast('Accetta i cookie per procedere al pagamento sicuro con Stripe.');
      AFC_COOKIE.richiedi(function () {});
      return;
    }
    salva();
    var t = totali();
    localStorage.setItem('afc-ordine-pending', JSON.stringify({
      items: cart, totale: t.tot,
      sconto: t.coupon ? t.coupon.pct : 0,
      coupon: t.coupon ? t.coupon.codice : null,
      data: new Date().toISOString()
    }));
    elOrder.classList.add('btn-wait');
    elOrder.textContent = 'Un momento…';

    if (!stripePronto()) {
      // MODALITÀ DEMO: simula l'esito positivo del pagamento
      setTimeout(function () { location.href = urlBase() + 'ordine-completato.html?demo=1'; }, 600);
      return;
    }

    caricaStripeJs().then(function () {
      var stripe = window.Stripe(STRIPE.publishableKey);
      return stripe.redirectToCheckout({
        lineItems: cart.map(function (r) {
          return { price: STRIPE.prices[r.nome], quantity: r.qty };
        }),
        mode: 'payment',
        successUrl: urlBase() + 'ordine-completato.html',
        cancelUrl: urlBase() + 'pagamento-annullato.html',
        shippingAddressCollection: { allowedCountries: ['IT'] },
        allowPromotionCodes: true,
        locale: 'it'
      });
    }).then(function (res) {
      if (res && res.error) throw res.error;
    }).catch(function (err) {
      elOrder.classList.remove('btn-wait');
      elOrder.textContent = 'Procedi all’ordine';
      toast('Il pagamento non è partito: ' + (err && err.message ? err.message : 'riprova tra poco.'));
    });
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
