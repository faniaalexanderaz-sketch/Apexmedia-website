/* =============================================================
   ARABESQUE BUSALLA — cassa a pagina unica
   Pagamenti espressi in cima, tre blocchi che si aprono in
   sequenza, riepilogo sempre visibile. Ospite di default: la
   registrazione si propone dopo l'acquisto, mai prima.
   ============================================================= */
(function () {
  'use strict';
  var form = document.getElementById('formCassa');
  if (!form) return;

  var cart = ARB.leggiCart();
  var consegna = new URLSearchParams(location.search).get('ritiro') === '1' ? 'ritiro' : 'corriere';
  var pagamento = 'carta';
  var cons = ARB.consegna();
  var emailSalvata = false;

  if (!cart.length) {
    document.getElementById('cassa').innerHTML =
      '<div class="wrap vuoto" style="padding-block:90px"><h1>Il carrello è vuoto</h1>' +
      '<p>Aggiungi un capo e torna qui: la cassa ti aspetta.</p>' +
      '<p style="margin-top:24px"><a class="btn btn-primario btn-senza-icona" href="donna.html">Vai alla collezione</a></p></div>';
    return;
  }
  ARB.evento('begin_checkout', { currency: 'EUR', value: ARB.totale(cart) });

  /* prefissi CAP → provincia, solo quelli non ambigui */
  var PROVINCE = { '00':'RM','06':'PG','07':'SS','09':'CA','10':'TO','12':'CN','14':'AT','15':'AL','16':'GE','17':'SV','18':'IM','19':'SP',
    '20':'MI','21':'VA','22':'CO','24':'BG','25':'BS','27':'PV','28':'NO','29':'PC','30':'VE','31':'TV','34':'TS','35':'PD','36':'VI',
    '37':'VR','38':'TN','39':'BZ','40':'BO','41':'MO','42':'RE','43':'PR','44':'FE','45':'RO','46':'MN','48':'RA','50':'FI','51':'PT',
    '52':'AR','53':'SI','55':'LU','56':'PI','57':'LI','58':'GR','60':'AN','61':'PU','62':'MC','64':'TE','65':'PE','66':'CH','67':'AQ',
    '70':'BA','71':'FG','72':'BR','73':'LE','74':'TA','75':'MT','76':'BT','80':'NA','81':'CE','82':'BN','83':'AV','84':'SA','85':'PZ',
    '87':'CS','88':'CZ','89':'RC','90':'PA','91':'TP','92':'AG','93':'CL','94':'EN','95':'CT','96':'SR','97':'RG','98':'ME' };

  /* ---------------- conti ---------------- */
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
        var p = arbProdotto(r.slug);
        return '<div class="riep-riga">' +
          '<span class="riep-foto">' + ARB.boxFoto(arbFoto(p || { slug: r.slug }, 1), r.nome, 'A', '') + '</span>' +
          '<span><b>' + r.nome + '</b><small>' + r.taglia + (r.colore ? ' · ' + r.colore : '') + ' · ×' + r.qty + '</small></span>' +
          '<span>' + arbEuro(r.prezzo * r.qty) + '</span>' +
        '</div>';
      }).join('') +
      '<div class="riep-tot">' +
        '<div class="riga-tot"><span>Subtotale</span><span>' + arbEuro(c.sub) + '</span></div>' +
        (c.pct ? '<div class="riga-tot sconto"><span>Sconto ' + ARB.coupon() + '</span><span>−' + arbEuro(c.sconto) + '</span></div>' : '') +
        '<div class="riga-tot"><span>' + (consegna === 'ritiro' ? 'Ritiro in negozio' : 'Spedizione') + '</span><span>' + (c.spedizione ? arbEuro(c.spedizione) : 'Gratuito') + '</span></div>' +
        (c.extra ? '<div class="riga-tot"><span>Contrassegno</span><span>' + arbEuro(c.extra) + '</span></div>' : '') +
        '<div class="riga-tot grande"><span>Totale</span><span>' + arbEuro(c.totale) + '</span></div>' +
        '<p style="font-family:var(--f-dati);font-size:11.5px;color:var(--fumo);margin-top:14px">' +
          (consegna === 'ritiro' ? 'Pronto in negozio ' + cons.testoRitiro : 'Consegna stimata ' + cons.testoCorriere) + '</p>' +
      '</div>';
    var btn = document.getElementById('btnPaga');
    if (btn) btn.firstChild.textContent = pagamento === 'carta'
      ? 'Paga ' + arbEuro(c.totale) + ' '
      : (pagamento === 'contrassegno' ? 'Conferma — paghi alla consegna ' : 'Conferma — paghi in negozio ');
  }

  /* ---------------- passi che si aprono in sequenza ---------------- */
  function apriPasso(n) {
    document.querySelectorAll('.passo').forEach(function (s, i) {
      s.classList.toggle('attivo', i === n);
      s.classList.toggle('fatto', i < n);
    });
    aggiornaRiepiloghiBrevi();
  }
  function aggiornaRiepiloghiBrevi() {
    var v = function (id) { var n = document.getElementById(id); return n ? n.value.trim() : ''; };
    var r1 = document.getElementById('breve1'), r2 = document.getElementById('breve2'), r3 = document.getElementById('breve3');
    if (r1) r1.textContent = v('email') ? v('email') : '';
    if (r2) r2.textContent = consegna === 'ritiro' ? 'Ritiro a Busalla' : (v('citta') ? v('via') + ', ' + v('citta') : '');
    if (r3) r3.textContent = pagamento === 'carta' ? 'Carta / PayPal' : (pagamento === 'contrassegno' ? 'Contrassegno' : 'In negozio');
  }

  function aggiornaConsegna() {
    document.querySelectorAll('[data-consegna]').forEach(function (b) {
      b.classList.toggle('scelto', b.dataset.consegna === consegna);
      b.setAttribute('aria-pressed', b.dataset.consegna === consegna ? 'true' : 'false');
    });
    document.getElementById('campiIndirizzo').hidden = consegna === 'ritiro';
    document.getElementById('boxRitiro').hidden = consegna !== 'ritiro';
    var cont = document.querySelector('[data-pagamento="contrassegno"]');
    var neg = document.querySelector('[data-pagamento="negozio"]');
    if (cont) cont.hidden = consegna === 'ritiro';
    if (neg) neg.hidden = consegna !== 'ritiro';
    if (consegna === 'ritiro' && pagamento === 'contrassegno') pagamento = 'carta';
    if (consegna === 'corriere' && pagamento === 'negozio') pagamento = 'carta';
    if (consegna === 'ritiro') ARB.evento('pickup_selected', {});
    aggiornaPagamento();
  }
  function aggiornaPagamento() {
    document.querySelectorAll('[data-pagamento]').forEach(function (b) {
      b.classList.toggle('scelto', b.dataset.pagamento === pagamento);
      b.setAttribute('aria-pressed', b.dataset.pagamento === pagamento ? 'true' : 'false');
    });
    renderRiepilogo();
    aggiornaRiepiloghiBrevi();
  }

  document.addEventListener('click', function (e) {
    var c = e.target.closest('[data-consegna]');
    if (c) { consegna = c.dataset.consegna; aggiornaConsegna(); ARB.evento('add_shipping_info', { shipping_tier: consegna }); return; }
    var pg = e.target.closest('[data-pagamento]');
    if (pg) { pagamento = pg.dataset.pagamento; aggiornaPagamento(); ARB.evento('add_payment_info', { payment_type: pagamento }); return; }
    var ap = e.target.closest('[data-passo]');
    if (ap) { apriPasso(+ap.dataset.passo); return; }
    var av = e.target.closest('[data-avanti]');
    if (av) {
      var n = +av.dataset.avanti;
      if (n === 1 && !validaContatti()) return;
      if (n === 2 && !validaConsegna()) return;
      apriPasso(n);
      return;
    }
    var ex = e.target.closest('[data-espresso]');
    if (ex) {
      if (!validaContatti()) { apriPasso(0); return; }
      ARB.evento('add_payment_info', { payment_type: ex.dataset.espresso });
      invia(ex.dataset.espresso);
    }
  });

  /* ---------------- validazione gentile: all'uscita dal campo ---------------- */
  function valore(id) { var n = document.getElementById(id); return n ? n.value.trim() : ''; }
  function segnala(id, msg) {
    var n = document.getElementById(id);
    if (!n) return false;
    n.classList.add('errore'); n.classList.remove('valido');
    var box = document.getElementById('err-' + id);
    if (box) { box.textContent = msg; box.hidden = false; }
    return false;
  }
  function pulisci(id) {
    var n = document.getElementById(id);
    if (!n) return;
    n.classList.remove('errore');
    if (n.value.trim()) n.classList.add('valido');
    var box = document.getElementById('err-' + id);
    if (box) box.hidden = true;
  }
  var REGOLE = {
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Controlla l\'indirizzo: ci serve per mandarti la conferma.'; },
    nome: function (v) { return v.length >= 2 ? '' : 'Scrivi nome e cognome.'; },
    telefono: function (v) { return v.replace(/\D/g, '').length >= 8 ? '' : 'Serve al corriere per avvisarti della consegna.'; },
    via: function (v) { return consegna === 'ritiro' || v.length >= 5 ? '' : 'Inserisci via e numero civico.'; },
    cap: function (v) { return consegna === 'ritiro' || /^\d{5}$/.test(v) ? '' : 'Il CAP è di 5 cifre.'; },
    citta: function (v) { return consegna === 'ritiro' || v.length >= 2 ? '' : 'Inserisci la città.'; }
  };
  form.addEventListener('blur', function (e) {
    var id = e.target.id;
    if (!REGOLE[id]) return;
    var msg = REGOLE[id](e.target.value.trim());
    if (msg) segnala(id, msg); else pulisci(id);
    if (id === 'cap') {
      var pr = PROVINCE[e.target.value.trim().slice(0, 2)];
      var campoPr = document.getElementById('provincia');
      if (pr && campoPr && !campoPr.value) campoPr.value = pr;
    }
    if (id === 'email' && !msg) salvaCarrello(e.target.value.trim());
    aggiornaRiepiloghiBrevi();
  }, true);

  function validaContatti() {
    var ok = true;
    ['email', 'nome', 'telefono'].forEach(function (id) {
      var msg = REGOLE[id](valore(id));
      if (msg) { segnala(id, msg); ok = false; } else pulisci(id);
    });
    if (!ok) { var primo = form.querySelector('.errore'); if (primo) primo.focus(); }
    return ok;
  }
  function validaConsegna() {
    if (consegna === 'ritiro') return true;
    var ok = true;
    ['via', 'cap', 'citta'].forEach(function (id) {
      var msg = REGOLE[id](valore(id));
      if (msg) { segnala(id, msg); ok = false; } else pulisci(id);
    });
    if (!ok) { var primo = form.querySelector('.errore'); if (primo) primo.focus(); }
    return ok;
  }

  /* ---------------- carrello abbandonato ---------------- */
  function salvaCarrello(email) {
    if (emailSalvata || !email) return;
    emailSalvata = true;
    fetch('/api/carrello-abbandonato', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, articoli: cart.map(function (r) { return { slug: r.slug, nome: r.nome, taglia: r.taglia, qty: r.qty, prezzo: r.prezzo }; }), totale: conti().totale })
    }).catch(function () {});
  }

  /* ---------------- invio ---------------- */
  form.addEventListener('submit', function (e) { e.preventDefault(); if (!validaContatti() || !validaConsegna()) return; invia(pagamento); });

  function invia(metodo) {
    var btn = document.getElementById('btnPaga');
    if (btn) { btn.disabled = true; }
    var c = conti();
    var dati = {
      email: valore('email'), coupon: ARB.coupon(), couponPct: c.pct,
      consegnaTipo: consegna, spedizione: c.spedizione, extra: c.extra,
      pagamento: metodo === 'contrassegno' || metodo === 'negozio' ? metodo : 'carta',
      metodoEspresso: ['apple', 'google', 'paypal'].indexOf(metodo) !== -1 ? metodo : null,
      cliente: { nome: valore('nome'), telefono: valore('telefono'), via: valore('via'), cap: valore('cap'),
                 citta: valore('citta'), provincia: valore('provincia'), note: valore('note') },
      items: cart.map(function (r) {
        return { slug: r.slug, nome: r.nome + ' — taglia ' + r.taglia + (r.colore ? ' · ' + r.colore : ''), prezzo: r.prezzo, qty: r.qty };
      })
    };
    var endpoint = (metodo === 'contrassegno' || metodo === 'negozio') ? '/api/ordine-manuale' : '/api/create-checkout-session';

    fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dati) })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, stato: r.status, dati: j }; }); })
      .then(function (r) {
        if (r.ok && r.dati.url) { location.href = r.dati.url; return; }
        if (r.ok && r.dati.numeroOrdine) { chiudi(r.dati.numeroOrdine, ''); return; }
        if (r.stato === 501 || r.stato === 500) { demo(); return; }
        throw new Error(r.dati.error || 'Errore imprevisto');
      })
      .catch(function () { demo(); })
      .then(function () { if (btn) btn.disabled = false; });

    function demo() { chiudi('DEMO' + Date.now().toString(36).slice(-5).toUpperCase(), '&demo=1'); }
    function chiudi(numero, extra) {
      ARB.evento('purchase', { transaction_id: numero, value: c.totale, currency: 'EUR', shipping: c.spedizione });
      ARB.scriviCart([]);
      try { localStorage.removeItem('arb-coupon'); } catch (err) {}
      location.href = 'ordine-completato.html?ordine=' + encodeURIComponent(numero) +
        '&consegna=' + consegna + extra;
    }
  }

  aggiornaConsegna();
  renderRiepilogo();
  apriPasso(0);
})();
