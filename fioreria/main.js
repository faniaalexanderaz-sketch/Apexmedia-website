/* =============================================================
   ANTICA FIORERIA DEL CENTRO — interazioni
   1) Scroll reveal (IntersectionObserver, stagger leggero)
   2) Parallasse morbida sull'illustrazione hero
   3) Carrello: aggiungi/rimuovi, badge, toast, ordine via email
   ============================================================= */
(function () {
  'use strict';

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

  /* ---------- 2) Parallasse hero ---------- */
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

  /* ---------- 3) Carrello ---------- */
  var cart = [];                      // { nome, prezzo, qty }
  var EMAIL = 'ordini@anticafioreriadelcentro.it';

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
        render();
      });
      elList.appendChild(li);
    });

    // ordine via email con riepilogo
    var righe = cart.map(function (r) { return '- ' + r.nome + ' × ' + r.qty + ' (' + euro(r.prezzo * r.qty) + ')'; });
    var body = 'Buongiorno,%0D%0Avorrei ordinare:%0D%0A' +
      encodeURIComponent(righe.join('\n')) +
      '%0D%0A%0D%0ATotale: ' + encodeURIComponent(euro(totale)) +
      '%0D%0A%0D%0AIndirizzo di consegna:%0D%0ABiglietto da allegare:%0D%0A';
    elOrder.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Ordine bouquet') + '&body=' + body;
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
    toast('«' + nome + '» aggiunto al carrello');
  }

  function openCart() {
    elCart.hidden = false; elScrim.hidden = false;
    document.body.style.overflow = 'hidden';
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

  // bottoni card: Aggiungi = aggiunge · Acquista = aggiunge + apre il carrello
  document.querySelectorAll('.card').forEach(function (card) {
    var nome = card.getAttribute('data-nome');
    var prezzo = parseInt(card.getAttribute('data-prezzo'), 10);
    card.querySelector('.add').addEventListener('click', function () { add(nome, prezzo); });
    card.querySelector('.buy').addEventListener('click', function () { add(nome, prezzo); openCart(); });
  });

  render();
})();
