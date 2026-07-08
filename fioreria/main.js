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
      'Domenica al Centro':  ''
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
  var art = document.getElementById('heroArt');
  if (art && !reduceMotion) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(function () {
          var y = Math.min(window.scrollY, window.innerHeight);
          art.style.transform = 'translate3d(0,' + (y * 0.12).toFixed(1) + 'px,0)';
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

  function euro(n) { return '€ ' + n; }
  function salva() { localStorage.setItem('afc-cart', JSON.stringify(cart)); }

  function render() {
    var items = cart.length;
    var totale = cart.reduce(function (s, r) { return s + r.prezzo * r.qty; }, 0);
    var pezzi = cart.reduce(function (s, r) { return s + r.qty; }, 0);

    elCount.hidden = pezzi === 0;
    elCount.textContent = pezzi;
    elEmpty.style.display = items ? 'none' : '';
    elFoot.hidden = !items;
    elTotal.textContent = euro(totale);

    elList.innerHTML = '';
    cart.forEach(function (r, idx) {
      var li = document.createElement('li');
      li.className = 'cart-item';
      li.innerHTML =
        '<div><div class="cart-item-name"></div>' +
        '<div class="cart-item-qty">' + r.qty + ' × ' + euro(r.prezzo) + '</div></div>' +
        '<span class="cart-item-price">' + euro(r.prezzo * r.qty) + '</span>' +
        '<button class="cart-item-remove" aria-label="Rimuovi dal carrello">×</button>';
      li.querySelector('.cart-item-name').textContent = r.nome;
      li.querySelector('.cart-item-remove').addEventListener('click', function () {
        if (r.qty > 1) r.qty -= 1; else cart.splice(idx, 1);
        salva(); render();
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

  document.querySelectorAll('.card').forEach(function (card) {
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
    salva();
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

  render();
})();
