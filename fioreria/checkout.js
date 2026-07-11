/* =============================================================
   ANTICA FIORERIA DEL CENTRO — checkout in-sito
   Extra → Consegna → Pagamento, tutto su questa pagina.

   NOTA ONESTA: la schermata di pagamento è completa e convalida
   i dati come un vero terminale, ma per INCASSARE davvero serve
   collegare un fornitore di pagamenti (Stripe, Nexi, PayPal…):
   nessun sito può addebitare una carta da solo, senza un
   circuito alle spalle. Finché non è collegato, l'esito del
   pagamento viene simulato e l'ordine registrato normalmente.
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
  function totali() {
    var sub = cart.reduce(function (s, r) { return s + r.prezzo * r.qty; }, 0);
    var c = coupon();
    var sconto = c ? Math.round(sub * c.pct) / 100 : 0;
    return { sub: sub, coupon: c, sconto: sconto, tot: Math.round((sub - sconto) * 100) / 100 };
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

  /* data minima = oggi; consegna in giornata entro le 13 */
  var oggi = new Date();
  var dataInput = document.getElementById('coData');
  function isoData(d) { return d.toISOString().slice(0, 10); }
  var minima = new Date(oggi);
  if (oggi.getHours() >= 13) minima.setDate(minima.getDate() + 1);
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
      document.getElementById('coCitta').value = u.indirizzi[0].citta || 'Alessandria';
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
  var formCarta = document.getElementById('formCarta');
  var ccNumero = document.getElementById('ccNumero');
  var ccScadenza = document.getElementById('ccScadenza');

  /* formattazione live: spazi ogni 4 cifre, slash nella scadenza */
  ccNumero.addEventListener('input', function () {
    var v = ccNumero.value.replace(/\D/g, '').slice(0, 19);
    ccNumero.value = v.replace(/(.{4})/g, '$1 ').trim();
  });
  ccScadenza.addEventListener('input', function () {
    var v = ccScadenza.value.replace(/\D/g, '').slice(0, 4);
    ccScadenza.value = v.length > 2 ? v.slice(0, 2) + '/' + v.slice(2) : v;
  });

  /* metodo selezionato: evidenzia e mostra/nasconde i campi carta */
  var metodi = document.querySelectorAll('.pag-metodo input');
  function metodoScelto() {
    return document.querySelector('.pag-metodo input:checked').value;
  }
  metodi.forEach(function (r) {
    r.addEventListener('change', function () {
      document.querySelectorAll('.pag-metodo').forEach(function (m) {
        m.classList.toggle('attivo', m.contains(r) && r.checked);
      });
      formCarta.hidden = metodoScelto() !== 'carta';
    });
  });

  function luhn(num) {
    var s = 0, alt = false;
    for (var i = num.length - 1; i >= 0; i--) {
      var d = parseInt(num[i], 10);
      if (alt) { d *= 2; if (d > 9) d -= 9; }
      s += d; alt = !alt;
    }
    return s % 10 === 0;
  }

  function validaCarta() {
    var errori = 0;
    var nome = document.getElementById('ccNome');
    var cvv = document.getElementById('ccCvv');
    var num = ccNumero.value.replace(/\s/g, '');

    errori += segnaErrore(nome, nome.value.trim().length < 3 ? 'Il nome come scritto sulla carta.' : '');
    errori += segnaErrore(ccNumero, (num.length < 13 || !luhn(num)) ? 'Controlla il numero: non risulta valido.' : '');

    var sc = ccScadenza.value.split('/');
    var scOk = sc.length === 2 && /^\d{2}$/.test(sc[0]) && /^\d{2}$/.test(sc[1]);
    if (scOk) {
      var mese = parseInt(sc[0], 10), anno = 2000 + parseInt(sc[1], 10);
      var ora = new Date();
      scOk = mese >= 1 && mese <= 12 &&
        (anno > ora.getFullYear() || (anno === ora.getFullYear() && mese >= ora.getMonth() + 1));
    }
    errori += segnaErrore(ccScadenza, !scOk ? 'Scadenza MM/AA, nel futuro.' : '');
    errori += segnaErrore(cvv, !/^\d{3,4}$/.test(cvv.value) ? 'Le 3 o 4 cifre sul retro.' : '');
    return errori === 0;
  }

  var btnPaga = document.getElementById('btnPaga');
  var pagMsg = document.getElementById('pagMsg');

  btnPaga.addEventListener('click', function () {
    pagMsg.hidden = true;
    var metodo = metodoScelto();
    if (metodo === 'carta' && !validaCarta()) {
      pagMsg.textContent = 'Controlla i dati della carta qui sopra.';
      pagMsg.hidden = false;
      return;
    }

    btnPaga.disabled = true;
    btnPaga.classList.add('btn-wait');
    document.getElementById('btnPagaTesto').textContent =
      metodo === 'carta' ? 'Pagamento in corso…' : 'Apertura di ' +
      (metodo === 'paypal' ? 'PayPal' : metodo === 'applepay' ? 'Apple Pay' : 'Google Pay') + '…';

    var t = totali();
    var ordine = {
      items: cart,
      totale: t.tot,
      sconto: t.coupon ? t.coupon.pct : 0,
      coupon: t.coupon ? t.coupon.codice : null,
      metodo: metodo,
      consegna: {
        nome: document.getElementById('coNome').value.trim(),
        telefono: document.getElementById('coTel').value.trim(),
        via: document.getElementById('coVia').value.trim(),
        cap: document.getElementById('coCap').value.trim(),
        citta: document.getElementById('coCitta').value.trim(),
        giorno: dataInput.value,
        messaggio: document.getElementById('coMsg').value.trim(),
        email: document.getElementById('coEmail').value.trim()
      },
      data: new Date().toISOString()
    };
    localStorage.setItem('afc-ordine-pending', JSON.stringify(ordine));

    /* esito del pagamento (simulato finché non è collegato un
       fornitore di pagamenti reale) */
    setTimeout(function () {
      location.href = 'ordine-completato.html';
    }, 1400);
  });
})();
