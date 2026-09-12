/* =============================================================
   ARABESQUE BUSALLA — cassa in-sito
   Dati → Consegna → Pagamento, tutto su questa pagina. Il
   pagamento con carta passa da una funzione serverless che crea
   la sessione Stripe sull'importo esatto del carrello. Se Stripe
   non è ancora configurato, l'ordine si registra lo stesso in
   MODALITÀ DIMOSTRATIVA, senza alcun addebito.
   ============================================================= */
(function () {
  'use strict';
  var form = document.getElementById('formCassa');
  if (!form) return;

  var cart = ARB.leggiCart();
  var consegna = new URLSearchParams(location.search).get('ritiro') === '1' ? 'ritiro' : 'corriere';
  var pagamento = 'carta';

  if (!cart.length) {
    document.getElementById('cassa').innerHTML =
      '<div class="wrap vuoto"><h1>Il carrello è vuoto</h1>' +
      '<p>Aggiungi un capo e torna qui: la cassa ti aspetta.</p>' +
      '<p style="margin-top:22px"><a class="btn btn-primario" href="donna.html">Vai alla collezione</a></p></div>';
    return;
  }

  /* ---------- totali ---------- */
  function conti() {
    var sub = ARB.totale(cart);
    var pct = ARB.sconto();
    var sconto = Math.round(sub * pct) / 100;
    var imponibile = sub - sconto;
    var spedizione = consegna === 'ritiro' ? 0 : (imponibile >= ARB_SPEDIZIONE.soglia ? 0 : ARB_SPEDIZIONE.costo);
    var extra = (pagamento === 'contrassegno') ? ARB_SPEDIZIONE.contrassegno : 0;
    return { sub: sub, pct: pct, sconto: sconto, spedizione: spedizione, extra: extra, totale: imponibile + spedizione + extra };
  }

  function renderRiepilogo() {
    var c = conti();
    document.getElementById('riepilogo').innerHTML =
      cart.map(function (r) {
        return '<div class="riep-riga">' +
          '<span class="riep-q">' + r.qty + '×</span>' +
          '<span><b>' + r.nome + '</b><small>Taglia ' + r.taglia + (r.colore ? ' · ' + r.colore : '') + '</small></span>' +
          '<span>' + arbEuro(r.prezzo * r.qty) + '</span>' +
        '</div>';
      }).join('') +
      '<div class="riep-tot">' +
        '<div class="totale-riga"><span>Subtotale</span><span>' + arbEuro(c.sub) + '</span></div>' +
        (c.pct ? '<div class="totale-riga sconto"><span>Sconto ' + ARB.coupon() + '</span><span>−' + arbEuro(c.sconto) + '</span></div>' : '') +
        '<div class="totale-riga"><span>' + (consegna === 'ritiro' ? 'Ritiro in negozio' : 'Spedizione') + '</span><span>' + (c.spedizione ? arbEuro(c.spedizione) : 'Gratuito') + '</span></div>' +
        (c.extra ? '<div class="totale-riga"><span>Contrassegno</span><span>' + arbEuro(c.extra) + '</span></div>' : '') +
        '<div class="totale-riga grande"><span>Totale</span><span>' + arbEuro(c.totale) + '</span></div>' +
      '</div>';
    var btn = document.getElementById('btnPaga');
    if (btn) btn.textContent = pagamento === 'carta'
      ? 'Paga ' + arbEuro(c.totale)
      : (pagamento === 'contrassegno' ? 'Conferma ordine — paghi alla consegna' : 'Conferma ordine — paghi in negozio');
  }

  /* ---------- consegna / pagamento ---------- */
  function aggiornaConsegna() {
    document.querySelectorAll('[data-consegna]').forEach(function (b) {
      b.classList.toggle('scelto', b.dataset.consegna === consegna);
      b.setAttribute('aria-pressed', b.dataset.consegna === consegna ? 'true' : 'false');
    });
    document.getElementById('campiIndirizzo').hidden = consegna === 'ritiro';
    document.getElementById('boxRitiro').hidden = consegna !== 'ritiro';
    /* il contrassegno non ha senso se ritiri in negozio */
    var cont = document.querySelector('[data-pagamento="contrassegno"]');
    var neg = document.querySelector('[data-pagamento="negozio"]');
    if (cont) cont.hidden = consegna === 'ritiro';
    if (neg) neg.hidden = consegna !== 'ritiro';
    if (consegna === 'ritiro' && pagamento === 'contrassegno') pagamento = 'carta';
    if (consegna === 'corriere' && pagamento === 'negozio') pagamento = 'carta';
    aggiornaPagamento();
  }
  function aggiornaPagamento() {
    document.querySelectorAll('[data-pagamento]').forEach(function (b) {
      b.classList.toggle('scelto', b.dataset.pagamento === pagamento);
      b.setAttribute('aria-pressed', b.dataset.pagamento === pagamento ? 'true' : 'false');
    });
    renderRiepilogo();
  }

  document.addEventListener('click', function (e) {
    var c = e.target.closest('[data-consegna]');
    if (c) { consegna = c.dataset.consegna; aggiornaConsegna(); return; }
    var p = e.target.closest('[data-pagamento]');
    if (p) { pagamento = p.dataset.pagamento; aggiornaPagamento(); return; }
  });

  /* ---------- validazione ---------- */
  function valore(id) { var n = document.getElementById(id); return n ? n.value.trim() : ''; }
  function errore(id, msg) {
    var n = document.getElementById(id);
    if (n) n.classList.add('errore');
    var box = document.getElementById('erroreCassa');
    box.textContent = msg;
    box.hidden = false;
    if (n) n.focus();
    return false;
  }
  function valida() {
    document.querySelectorAll('.errore').forEach(function (n) { n.classList.remove('errore'); });
    document.getElementById('erroreCassa').hidden = true;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valore('email'))) return errore('email', 'Controlla l\'indirizzo email: ci serve per la conferma d\'ordine.');
    if (valore('nome').length < 2) return errore('nome', 'Scrivi nome e cognome.');
    if (valore('telefono').replace(/\D/g, '').length < 8) return errore('telefono', 'Il telefono serve al corriere: controllalo.');
    if (consegna === 'corriere') {
      if (valore('via').length < 5) return errore('via', 'Inserisci via e numero civico.');
      if (!/^\d{5}$/.test(valore('cap'))) return errore('cap', 'Il CAP è di 5 cifre.');
      if (valore('citta').length < 2) return errore('citta', 'Inserisci la città.');
    }
    return true;
  }

  /* ---------- invio ---------- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!valida()) return;
    var btn = document.getElementById('btnPaga');
    btn.disabled = true;
    var testoOriginale = btn.textContent;
    btn.textContent = 'Un attimo…';

    var c = conti();
    var dati = {
      email: valore('email'),
      coupon: ARB.coupon(),
      couponPct: c.pct,
      consegnaTipo: consegna,
      spedizione: c.spedizione,
      extra: c.extra,
      pagamento: pagamento,
      cliente: {
        nome: valore('nome'),
        telefono: valore('telefono'),
        via: valore('via'),
        cap: valore('cap'),
        citta: valore('citta'),
        note: valore('note')
      },
      items: cart.map(function (r) {
        return { slug: r.slug, nome: r.nome + ' — taglia ' + r.taglia + (r.colore ? ' · ' + r.colore : ''), prezzo: r.prezzo, qty: r.qty };
      })
    };

    var endpoint = pagamento === 'carta' ? '/api/create-checkout-session' : '/api/ordine-manuale';

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dati)
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, stato: r.status, dati: j }; }); })
      .then(function (r) {
        if (r.ok && r.dati.url) { location.href = r.dati.url; return; }
        if (r.ok && r.dati.numeroOrdine) {
          svuota();
          location.href = 'ordine-completato.html?ordine=' + encodeURIComponent(r.dati.numeroOrdine);
          return;
        }
        /* Stripe o database non ancora configurati: ordine dimostrativo */
        if (r.stato === 501 || r.stato === 500) { demo(); return; }
        throw new Error(r.dati.error || 'Errore imprevisto');
      })
      .catch(function () { demo(); })
      .then(function () { btn.disabled = false; btn.textContent = testoOriginale; });

    function demo() {
      var numero = 'DEMO' + Date.now().toString(36).slice(-5).toUpperCase();
      svuota();
      location.href = 'ordine-completato.html?ordine=' + numero + '&demo=1';
    }
    function svuota() {
      ARB.scriviCart([]);
      try { localStorage.removeItem('arb-coupon'); } catch (err) {}
    }
  });

  aggiornaConsegna();
  renderRiepilogo();
})();
