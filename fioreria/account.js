/* =============================================================
   ANTICA FIORERIA — pagina account
   Accesso, registrazione (con welcome bonus), recupero password,
   dashboard: profilo, ordini+riordina, wishlist, coupon,
   indirizzi, newsletter. Regole UX: validazione al blur, toggle
   password, feedback dopo ogni submit.
   ============================================================= */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var toastTimer = null;
  function toast(msg) {
    var t = $('toast');
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 2600);
  }

  /* ---------- toggle mostra/nascondi password ---------- */
  document.querySelectorAll('.pass-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var input = btn.parentElement.querySelector('input');
      var visibile = input.type === 'text';
      input.type = visibile ? 'password' : 'text';
      btn.setAttribute('aria-label', visibile ? 'Mostra password' : 'Nascondi password');
      btn.classList.toggle('attivo', !visibile);
      input.focus();
    });
  });

  /* ---------- validazione al blur ---------- */
  function erroreCampo(input, msg) {
    var p = input.closest('.field').querySelector('.field-err');
    if (!p) return;
    p.textContent = msg || ''; p.hidden = !msg;
    input.classList.toggle('invalido', !!msg);
  }
  function collegaBlur(input, controlla) {
    input.addEventListener('blur', function () { erroreCampo(input, controlla(input.value)); });
    input.addEventListener('input', function () { erroreCampo(input, null); });
  }
  if ($('loginEmail')) {
    collegaBlur($('loginEmail'), function (v) { return AFC.emailValida(v.trim()) ? null : 'Controlla l’indirizzo email.'; });
    collegaBlur($('regEmail'), function (v) { return AFC.emailValida(v.trim()) ? null : 'Controlla l’indirizzo email.'; });
    collegaBlur($('regNome'), function (v) { return v.trim() ? null : 'Il nome serve per il biglietto e la consegna.'; });
    collegaBlur($('regPass'), function (v) { return v.length >= 8 ? null : 'Minimo 8 caratteri.'; });
  }

  /* ---------- viste ---------- */
  function mostra(vista) {
    $('vistaAuth').hidden = vista !== 'auth';
    $('vistaDash').hidden = vista !== 'dash';
  }
  function msgForm(el, testo, ok) {
    el.textContent = testo; el.hidden = !testo;
    el.classList.toggle('ok', !!ok);
  }

  /* ---------- tabs accedi / registrati ---------- */
  function tabAuth(quale) {
    $('tabAccedi').setAttribute('aria-selected', quale === 'login');
    $('tabRegistrati').setAttribute('aria-selected', quale === 'reg');
    $('formLogin').hidden = quale !== 'login';
    $('formRegistra').hidden = quale !== 'reg';
    $('formRecupero').hidden = true;
  }
  $('tabAccedi').addEventListener('click', function () { tabAuth('login'); });
  $('tabRegistrati').addEventListener('click', function () { tabAuth('reg'); });

  /* ---------- login ---------- */
  $('formLogin').addEventListener('submit', function (e) {
    e.preventDefault();
    var r = AFC.accedi($('loginEmail').value, $('loginPass').value);
    if (r.errore) { msgForm($('loginMsg'), r.errore); $('loginEmail').focus(); return; }
    msgForm($('loginMsg'), '');
    apriDashboard(r.user);
    toast('Bentornata, ' + r.user.nome.split(' ')[0] + ' 🌿');
  });

  /* ---------- registrazione + welcome bonus ---------- */
  $('formRegistra').addEventListener('submit', function (e) {
    e.preventDefault();
    if (!$('regPrivacy').checked) {
      msgForm($('regMsg'), 'Per creare l’account serve il consenso privacy (obbligatorio).');
      $('regPrivacy').focus();
      return;
    }
    var r = AFC.registra($('regNome').value, $('regEmail').value, $('regPass').value, {
      newsletter: $('regNews').checked,
      marketing: $('regNews').checked
    });
    if (r.errore) { msgForm($('regMsg'), r.errore); return; }
    msgForm($('regMsg'), '');
    apriDashboard(r.user);
    toast('Account creato: il coupon BENVENUTO20 è tuo ✦');
    try {
      fetch('/api/invia-benvenuto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: r.user.email })
      }).catch(function () {});
    } catch (e) {}
  });

  /* ---------- recupero password ---------- */
  var recuperoFase = 1;
  $('apriRecupero').addEventListener('click', function () {
    $('formLogin').hidden = true; $('formRegistra').hidden = true;
    $('formRecupero').hidden = false;
    recuperoFase = 1;
    document.querySelector('.recupero-step2').hidden = true;
    $('recAzione').textContent = 'Invia codice';
    $('recEmail').focus();
  });
  $('chiudiRecupero').addEventListener('click', function () { tabAuth('login'); });
  $('formRecupero').addEventListener('submit', function (e) {
    e.preventDefault();
    if (recuperoFase === 1) {
      var r = AFC.generaReset($('recEmail').value);
      if (r.errore) { msgForm($('recMsg'), r.errore); return; }
      msgForm($('recMsg'), '');
      $('recCodice').textContent = r.codice;
      document.querySelector('.recupero-step2').hidden = false;
      $('recAzione').textContent = 'Imposta nuova password';
      recuperoFase = 2;
      $('recInput').focus();
    } else {
      var r2 = AFC.resetPassword($('recEmail').value, $('recInput').value.trim(), $('recNuova').value);
      if (r2.errore) { msgForm($('recMsg'), r2.errore); return; }
      apriDashboard(r2.user);
      toast('Password aggiornata ✓');
    }
  });

  /* =============================================================
     DASHBOARD
     ============================================================= */
  function apriDashboard(user) {
    mostra('dash');
    $('dashNome').textContent = user.nome.split(' ')[0];
    $('proNome').value = user.nome;
    $('proTel').value = user.telefono || '';
    $('proEmail').value = user.email;
    $('proMarketing').checked = !!user.privacyMarketing;
    $('newsToggle').checked = !!user.newsletter;
    disegnaOrdini(user);
    disegnaWishlist(user);
    disegnaCoupon(user);
    disegnaIndirizzi(user);
  }

  /* tabs dashboard */
  document.querySelectorAll('.dash-tab[data-pannello]').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.dash-tab').forEach(function (t) { t.classList.remove('attivo'); });
      tab.classList.add('attivo');
      document.querySelectorAll('.pannello').forEach(function (p) { p.hidden = true; });
      $(tab.dataset.pannello).hidden = false;
    });
  });

  $('btnEsci').addEventListener('click', function () {
    AFC.esci();
    mostra('auth'); tabAuth('login');
    toast('A presto 🌷');
  });

  /* profilo */
  $('formProfilo').addEventListener('submit', function (e) {
    e.preventDefault();
    var u = AFC.utenteCorrente(); if (!u) return;
    u.nome = $('proNome').value.trim() || u.nome;
    u.telefono = $('proTel').value.trim();
    u.privacyMarketing = $('proMarketing').checked;
    AFC.aggiorna(u);
    $('dashNome').textContent = u.nome.split(' ')[0];
    $('proMsg').hidden = false;
    setTimeout(function () { $('proMsg').hidden = true; }, 2400);
  });

  /* ordini + riordina */
  function disegnaOrdini(u) {
    var lista = $('listaOrdini');
    lista.innerHTML = '';
    $('ordiniVuoto').hidden = u.ordini.length > 0;
    u.ordini.forEach(function (o) {
      var li = document.createElement('li');
      li.className = 'ordine';
      var righe = o.items.map(function (r) { return r.nome + ' × ' + r.qty; }).join(' · ');
      li.innerHTML =
        '<div class="ordine-info"><strong>' + new Date(o.data).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }) + '</strong>' +
        '<span class="ordine-righe"></span>' +
        '<span class="ordine-tot">Totale € ' + o.totale + (o.sconto ? ' <em>(coupon −' + o.sconto + '%)</em>' : '') + '</span></div>' +
        '<button class="btn btn-ghost btn-sm">Riordina</button>';
      li.querySelector('.ordine-righe').textContent = righe;
      li.querySelector('button').addEventListener('click', function () {
        localStorage.setItem('afc-cart', JSON.stringify(o.items));
        location.href = 'index.html?carrello=1';
      });
      lista.appendChild(li);
    });
  }

  /* wishlist */
  function disegnaWishlist(u) {
    var lista = $('listaWishlist');
    lista.innerHTML = '';
    $('wlVuoto').hidden = u.wishlist.length > 0;
    u.wishlist.forEach(function (nome) {
      var li = document.createElement('li');
      li.className = 'wl-item';
      li.innerHTML = '<span class="wl-nome"></span>' +
        '<span class="wl-azioni"><a class="btn btn-primary btn-sm" href="index.html#shop">Vai al bouquet</a>' +
        '<button class="wl-togli" aria-label="Rimuovi dalla wishlist">×</button></span>';
      li.querySelector('.wl-nome').textContent = nome;
      li.querySelector('.wl-togli').addEventListener('click', function () {
        AFC.toggleWishlist(nome);
        disegnaWishlist(AFC.utenteCorrente());
      });
      lista.appendChild(li);
    });
  }

  /* coupon */
  function disegnaCoupon(u) {
    var lista = $('listaCoupon');
    lista.innerHTML = '';
    u.coupon.forEach(function (c) {
      var li = document.createElement('li');
      li.className = 'coupon-item' + (c.usato ? ' usato' : '');
      li.innerHTML = '<span class="coupon-codice">' + c.codice + '</span>' +
        '<span class="coupon-desc">' + c.descrizione + '</span>' +
        '<span class="coupon-stato">' + (c.usato ? 'Utilizzato' : 'Disponibile — inseriscilo nel carrello') + '</span>';
      lista.appendChild(li);
    });
  }

  /* indirizzi */
  function disegnaIndirizzi(u) {
    var lista = $('listaIndirizzi');
    lista.innerHTML = '';
    u.indirizzi.forEach(function (ind, i) {
      var li = document.createElement('li');
      li.className = 'ind-item';
      li.innerHTML = '<div><strong class="ind-et"></strong><span class="ind-txt"></span></div>' +
        '<button class="wl-togli" aria-label="Rimuovi indirizzo">×</button>';
      li.querySelector('.ind-et').textContent = ind.etichetta;
      li.querySelector('.ind-txt').textContent = ind.via + ', ' + ind.cap + ' ' + ind.citta;
      li.querySelector('button').addEventListener('click', function () {
        var user = AFC.utenteCorrente();
        user.indirizzi.splice(i, 1);
        AFC.aggiorna(user);
        disegnaIndirizzi(user);
      });
      lista.appendChild(li);
    });
  }
  $('formIndirizzo').addEventListener('submit', function (e) {
    e.preventDefault();
    var u = AFC.utenteCorrente(); if (!u) return;
    u.indirizzi.push({
      etichetta: $('indEt').value.trim(),
      via: $('indVia').value.trim(),
      cap: $('indCap').value.trim(),
      citta: $('indCitta').value.trim()
    });
    AFC.aggiorna(u);
    e.target.reset();
    disegnaIndirizzi(u);
    toast('Indirizzo salvato ✓');
  });

  /* newsletter */
  $('newsToggle').addEventListener('change', function () {
    var u = AFC.utenteCorrente(); if (!u) return;
    if ($('newsToggle').checked) {
      AFC.iscriviNewsletter(u.email);
      msgOkNews('Iscrizione attiva: la prossima uscita arriva nella tua casella ✓');
    } else {
      AFC.disiscriviNewsletter(u.email);
      msgOkNews('Iscrizione annullata. Puoi tornare quando vuoi.');
    }
  });
  function msgOkNews(t) {
    $('newsMsg').textContent = t; $('newsMsg').hidden = false;
    setTimeout(function () { $('newsMsg').hidden = true; }, 3000);
  }

  /* ---------- avvio ---------- */
  var corrente = AFC.utenteCorrente();
  if (corrente) { apriDashboard(corrente); }
  else {
    mostra('auth');
    tabAuth(/registrati/.test(location.hash) ? 'reg' : 'login');
  }
})();
