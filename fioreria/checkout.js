/* =============================================================
   ANTICA FIORERIA DEL CENTRO — checkout in-sito
   Extra → Consegna → Pagamento, tutto su questa pagina.

   Il pagamento vero avviene tramite una funzione serverless
   (netlify/functions/create-checkout-session.js) che crea al volo
   una sessione di pagamento per l'importo esatto del carrello —
   nessun prodotto da registrare uno per uno. Finché la funzione
   non è online (Netlify Functions + chiave segreta configurati),
   il pagamento gira in MODALITÀ DEMO: l'ordine si registra lo
   stesso ma nessun addebito reale viene tentato.
   ============================================================= */
(function () {
  'use strict';

  var cart = [];
  try { cart = JSON.parse(localStorage.getItem('afc-cart') || '[]'); } catch (e) { cart = []; }

  var elToast = document.getElementById('toast');
  var toastTimer = null;
  function toast(msg) {
    elToast.textContent = msg;
    elToast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { elToast.hidden = true; }, 2600);
  }

  function euro(n) {
    return '€ ' + (Number.isInteger(n) ? n : n.toFixed(2).replace('.', ','));
  }
  function salva() { localStorage.setItem('afc-cart', JSON.stringify(cart)); }

  /* carrello vuoto: invita a tornare allo shop */
  if (!cart.length) {
    document.getElementById('coVuoto').hidden = false;
    document.getElementById('sezExtra').hidden = true;
    document.getElementById('sezConsegna').hidden = true;
    document.getElementById('riep').hidden = true;
    return;
  }

  /* ---------- riepilogo ---------- */
  function coupon() {
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
    var c = coupon();
    var sconto = c ? Math.round(sub * c.pct) / 100 : 0;
    var spedizione = spedizioneCorrente();
    return { sub: sub, coupon: c, sconto: sconto, spedizione: spedizione, tot: Math.round((sub - sconto) * 100) / 100 + spedizione };
  }
  function riepilogo() {
    var lista = document.getElementById('riepLista');
    lista.innerHTML = '';
    cart.forEach(function (r) {
      var li = document.createElement('li');
      li.innerHTML = '<span class="riep-nome"></span><span>' + r.qty + ' × ' + euro(r.prezzo) + '</span>';
      li.querySelector('.riep-nome').textContent = r.nome;
      lista.appendChild(li);
    });
    var t = totali();
    var elSconto = document.getElementById('riepSconto');
    if (t.coupon) {
      elSconto.textContent = 'Coupon ' + t.coupon.codice + ': −' + t.coupon.pct + '% (' + euro(t.sconto) + ')';
      elSconto.hidden = false;
    } else {
      elSconto.hidden = true;
    }
    var elSped = document.getElementById('riepSpedizione');
    if (elSped) elSped.textContent = 'Spedizione assicurata: ' + euro(t.spedizione);
    document.getElementById('riepTot').textContent = euro(t.tot);
    document.getElementById('btnPagaTesto').textContent = 'Paga ' + euro(t.tot);
  }
  riepilogo();

  /* ---------- extra ---------- */
  document.querySelectorAll('.extra-card').forEach(function (card) {
    var nome = card.getAttribute('data-extra');
    var prezzo = parseInt(card.getAttribute('data-prezzo'), 10);
    var btn = card.querySelector('.extra-piu');

    function inCarrello() {
      return cart.some(function (r) { return r.nome === nome; });
    }
    function dipingi() {
      var dentro = inCarrello();
      card.classList.toggle('scelto', dentro);
      btn.textContent = dentro ? '✓' : '+';
      btn.setAttribute('aria-label', (dentro ? 'Rimuovi' : 'Aggiungi') + ' ' + nome.toLowerCase());
    }
    btn.addEventListener('click', function () {
      if (inCarrello()) {
        cart = cart.filter(function (r) { return r.nome !== nome; });
        toast('«' + nome + '» tolto dall\'ordine');
      } else {
        cart.push({ nome: nome, prezzo: prezzo, qty: 1 });
        toast('«' + nome + '» aggiunto all\'ordine ✓');
      }
      salva(); riepilogo(); dipingi();
    });
    dipingi();
  });

  /* ---------- consegna ---------- */
  var formConsegna = document.getElementById('formConsegna');
  var sezPag = document.getElementById('sezPagamento');
  var passoCon = document.getElementById('passoConsegna');
  var passoPag = document.getElementById('passoPagamento');

  /* data minima = tra due giorni: il corriere consegna in 48/72 ore */
  var oggi = new Date();
  var dataInput = document.getElementById('coData');
  function isoData(d) { return d.toISOString().slice(0, 10); }
  var minima = new Date(oggi);
  minima.setDate(minima.getDate() + 2);
  dataInput.min = isoData(minima);
  dataInput.value = isoData(minima);

  /* precompila per chi è già cliente */
  if (typeof AFC !== 'undefined' && AFC.utenteCorrente()) {
    var u = AFC.utenteCorrente();
    document.getElementById('coEmail').value = u.email || '';
    if (u.telefono) document.getElementById('coTel').value = u.telefono;
    if (u.indirizzi && u.indirizzi.length) {
      document.getElementById('coVia').value = u.indirizzi[0].via || '';
      document.getElementById('coCap').value = u.indirizzi[0].cap || '';
      document.getElementById('coCitta').value = u.indirizzi[0].citta || '';
    }
  }

  function segnaErrore(input, msg) {
    var err = input.closest('.field').querySelector('.field-err');
    if (msg) {
      input.classList.add('invalido');
      if (err) { err.textContent = msg; err.hidden = false; }
      return true;
    }
    input.classList.remove('invalido');
    if (err) err.hidden = true;
    return false;
  }

  var emailOk = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); };

  formConsegna.addEventListener('submit', function (e) {
    e.preventDefault();
    var errori = 0;
    var nome = document.getElementById('coNome');
    var tel = document.getElementById('coTel');
    var via = document.getElementById('coVia');
    var cap = document.getElementById('coCap');
    var citta = document.getElementById('coCitta');
    var email = document.getElementById('coEmail');

    errori += segnaErrore(nome, nome.value.trim().length < 3 ? 'Scrivi il nome di chi riceve i fiori.' : '');
    errori += segnaErrore(tel, tel.value.replace(/\D/g, '').length < 8 ? 'Serve un numero vero: lo usa solo il fattorino.' : '');
    errori += segnaErrore(via, via.value.trim().length < 5 ? 'Scrivi via e numero civico.' : '');
    errori += segnaErrore(cap, !/^\d{5}$/.test(cap.value.trim()) ? 'Il CAP ha 5 cifre.' : '');
    errori += segnaErrore(citta, citta.value.trim().length < 2 ? 'Scrivi la città di consegna.' : '');
    errori += segnaErrore(email, !emailOk(email.value.trim()) ? 'Serve un\'email valida per la conferma d\'ordine.' : '');
    if (!dataInput.value) { errori += segnaErrore(dataInput, 'Scegli il giorno di consegna.'); }
    else segnaErrore(dataInput, '');

    if (errori) {
      formConsegna.querySelector('.invalido').focus();
      return;
    }

    sezPag.hidden = false;
    passoCon.classList.remove('attivo');
    passoCon.classList.add('fatto');
    passoCon.innerHTML = '<span aria-hidden="true">✓</span> Consegna';
    passoPag.classList.add('attivo');
    sezPag.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  document.getElementById('tornaConsegna').addEventListener('click', function () {
    sezPag.hidden = true;
    passoPag.classList.remove('attivo');
    passoCon.classList.add('attivo');
    passoCon.classList.remove('fatto');
    passoCon.textContent = 'Consegna';
    document.getElementById('sezConsegna').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* ---------- pagamento ---------- */
  var btnPaga = document.getElementById('btnPaga');
  var pagMsg = document.getElementById('pagMsg');

  btnPaga.addEventListener('click', function () {
    pagMsg.hidden = true;
    btnPaga.disabled = true;
    btnPaga.classList.add('btn-wait');
    document.getElementById('btnPagaTesto').textContent = 'Un momento…';

    var t = totali();
    var consegna = {
      nome: document.getElementById('coNome').value.trim(),
      telefono: document.getElementById('coTel').value.trim(),
      via: document.getElementById('coVia').value.trim(),
      cap: document.getElementById('coCap').value.trim(),
      citta: document.getElementById('coCitta').value.trim(),
      giorno: dataInput.value,
      messaggio: document.getElementById('coMsg').value.trim(),
      email: document.getElementById('coEmail').value.trim()
    };
    var ordine = {
      items: cart,
      totale: t.tot,
      spedizione: t.spedizione,
      sconto: t.coupon ? t.coupon.pct : 0,
      coupon: t.coupon ? t.coupon.codice : null,
      consegna: consegna,
      data: new Date().toISOString()
    };
    localStorage.setItem('afc-ordine-pending', JSON.stringify(ordine));

    function demo(motivo) {
      if (motivo) console.warn('Checkout in modalità demo: ' + motivo);
      setTimeout(function () { location.href = 'ordine-completato.html?demo=1'; }, 700);
    }

    /* prova il pagamento reale tramite la funzione serverless.
       Se non è ancora configurata (funzione assente, chiave mancante,
       errore di rete) l'ordine resta comunque registrato e si passa
       in modalità demo, senza bloccare mai il cliente. */
    fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart.map(function (r) { return { nome: r.nome, prezzo: r.prezzo, qty: r.qty, slug: r.slug }; }),
        totale: t.tot,
        spedizione: t.spedizione,
        couponPct: t.coupon ? t.coupon.pct : 0,
        coupon: t.coupon ? t.coupon.codice : '',
        email: consegna.email,
        consegna: consegna
      })
    }).then(function (res) {
      if (!res.ok) return res.json().catch(function () { return {}; }).then(function (d) {
        throw new Error(d.error || ('HTTP ' + res.status));
      });
      return res.json();
    }).then(function (data) {
      if (!data || !data.url) throw new Error('Risposta senza URL di pagamento');
      location.href = data.url;
    }).catch(function (err) {
      demo(err && err.message);
    });
  });
})();
