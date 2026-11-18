/* =============================================================
   BAGNARINO — app di gestione della titolare (/gestione)
   Un solo file, senza librerie. Le pagine arrivano dal server
   (api/_gestione-pagine.js) solo dopo l'accesso; qui ci sono le
   schermate e i gesti. C'è tutto in un posto solo: richieste,
   calendario, sito, e anche "Come va" (clienti, social, Google,
   pubblicità), i clienti, gli incassi, i prezzi.
   Regole: una cosa importante per schermata, tre tocchi al
   massimo, "Fatto" grande dopo ogni salvataggio, una domanda
   prima di chiudere o togliere qualcosa, "Annulla" per qualche
   secondo dopo le risposte alle richieste.
   ============================================================= */
(function () {
  'use strict';
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return [].slice.call((c || document).querySelectorAll(s)); }
  function e(t) { return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  var SECONDI_PER_RIPENSARCI = 6;

  /* ---------- chiamate al server ---------- */
  function chiama(azione, dati, opzioni) {
    opzioni = opzioni || {};
    var url = '/api/gestione?azione=' + azione, init = { credentials: 'same-origin', headers: { 'X-Bgn-App': '1' } };
    if (opzioni.leggi) {
      Object.keys(dati || {}).forEach(function (k) { if (dati[k] != null) url += '&' + k + '=' + encodeURIComponent(dati[k]); });
    } else {
      init.method = 'POST';
      init.headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(dati || {});
      if (opzioni.resta) init.keepalive = true;
    }
    return fetch(url, init).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (r.status === 401 && j.errore === 'NON_AUTORIZZATO') { location.href = '/gestione/accedi'; throw new Error('accesso'); }
        if (!r.ok) { var err = new Error(j.messaggio || 'Non sono riuscita a farlo. Riprova tra un momento.'); err.dati = j; err.stato = r.status; throw err; }
        return j;
      });
    }, function () { throw new Error('Non c’è connessione. Controlla il Wi-Fi o i dati del telefono e riprova.'); });
  }
  function leggi(azione, dati) { return chiama(azione, dati, { leggi: true }); }

  /* il service worker: serve per installare l'app e per le notifiche */
  var swPronto = null;
  if ('serviceWorker' in navigator) {
    swPronto = navigator.serviceWorker.register('/sw-gestione.js', { scope: '/gestione' }).catch(function () { return null; });
  }

  /* Chrome su Android: quando il telefono permette di installare l'app con un
     tocco, l'occasione viene tenuta da parte per il pulsante "Metti l'app sul telefono" */
  var installaSubito = null;
  function mostraInstallaSubito() {
    $$('[data-installa-subito]').forEach(function (el) { el.hidden = !installaSubito; });
  }
  window.addEventListener('beforeinstallprompt', function (ev) {
    ev.preventDefault();
    installaSubito = ev;
    mostraInstallaSubito();
  });
  window.addEventListener('appinstalled', function () { installaSubito = null; mostraInstallaSubito(); });
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest && ev.target.closest('[data-installa-ora]');
    if (!b || !installaSubito) return;
    installaSubito.prompt();
    installaSubito = null;
    mostraInstallaSubito();
  });

  /* ---------- pagine fuori dall'app: accesso, password, risposta, installa ---------- */
  function conModulo(sel, invia) {
    var f = $(sel);
    if (!f) return;
    var err = $('[data-errore]', f), bottone = $('button[type=submit]', f), testo = bottone.textContent;
    var mostra = $('[data-mostra]', f);
    if (mostra) mostra.addEventListener('change', function () { f.password.type = mostra.checked ? 'text' : 'password'; });
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      err.hidden = true;
      bottone.disabled = true; bottone.textContent = 'Un attimo…';
      invia(f).catch(function (x) { err.textContent = x.message; err.hidden = false; })
        .then(function () { bottone.disabled = false; bottone.textContent = testo; });
    });
  }
  conModulo('[data-accedi]', function (f) {
    if (!f.email.value.trim() || !f.password.value) return Promise.reject(new Error('Scrivi email e password.'));
    return chiama('accedi', { email: f.email.value.trim(), password: f.password.value }).then(function () {
      var richiesta = new URLSearchParams(location.search).get('richiesta');
      location.href = '/gestione' + (richiesta ? '?richiesta=' + encodeURIComponent(richiesta) : '');
    });
  });
  conModulo('[data-recupero]', function (f) {
    if (!f.email.value.trim()) return Promise.reject(new Error('Scrivi la tua email.'));
    return chiama('recupero', { email: f.email.value.trim() }).then(function () { f.hidden = true; $('[data-esito]').hidden = false; });
  });
  conModulo('[data-nuova-password]', function (f) {
    if (f.password.value.replace(/\s/g, '').length < 8) return Promise.reject(new Error('La password deve avere almeno 8 caratteri.'));
    return chiama('nuova-password', { token: f.getAttribute('data-token'), password: f.password.value }).then(function () { location.href = '/gestione'; });
  });

  var risposta = $('[data-risposta]');
  if (risposta) {
    chiama('risposta', { t: risposta.getAttribute('data-token') }).then(function (r) {
      $('[data-risposta-titolo]').textContent = r.titolo;
      $('[data-risposta-testo]').textContent = r.testo;
    }, function (x) {
      $('[data-risposta-titolo]').textContent = 'Non sono riuscita a registrarla';
      $('[data-risposta-testo]').textContent = x.message + ' Puoi rispondere dall’app.';
    }).then(function () { $('[data-risposta-app]').hidden = false; });
  }

  if (document.body.classList.contains('g-installa')) {
    var schede = $$('[data-telefono]');
    var scegli = function (quale) {
      schede.forEach(function (b) {
        var si = b.getAttribute('data-telefono') === quale;
        b.setAttribute('aria-selected', si);
        b.className = 'g-btn ' + (si ? 'g-btn-primario' : 'g-btn-grigio');
      });
      $$('[data-pannello]').forEach(function (p) { p.hidden = p.getAttribute('data-pannello') !== quale; });
    };
    schede.forEach(function (b) { b.addEventListener('click', function () { scegli(b.getAttribute('data-telefono')); }); });
    /* si parte da Android; su un iPhone si apre da sola la scheda giusta */
    if (/iphone|ipad|ipod/i.test(navigator.userAgent) && location.hash !== '#notifiche') scegli('iphone');
    mostraInstallaSubito();
  }

  if (!document.body.classList.contains('g-app')) return;

  /* =============================================================
     L'APP
     ============================================================= */
  var vista = $('#vista'), titolo = $('[data-titolo]'), indietro = $('[data-indietro]'), marchio = $('[data-marchio]');
  var NOME = document.body.getAttribute('data-nome') || '';
  /* 'titolare' oppure 'apex' (Apex Media: in più aggiorna i numeri del mese) */
  var RUOLO = document.body.getAttribute('data-ruolo') || 'titolare';
  var CHIAVE_PUSH = document.body.getAttribute('data-chiave-push') || '';

  /* ---------- date in parole ---------- */
  function daIso(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2], 12); }
  function iso(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function giornoLungo(s) { return daIso(s).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }); }
  function giornoBreve(s) { return daIso(s).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' }); }
  function meseLungo(s) { return daIso(s + '-01').toLocaleDateString('it-IT', { month: 'long', year: 'numeric' }); }
  function maiuscola(t) { return t.charAt(0).toUpperCase() + t.slice(1); }

  var ICO = {
    telefono: '<path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"/>',
    messaggio: '<path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"/>',
    prima: '<path d="m15 18-6-6 6-6"/>', dopo: '<path d="m9 18 6-6-6-6"/>',
    su: '<path d="m18 15-6-6-6 6"/>', giu: '<path d="m6 9 6 6 6-6"/>',
    piu: '<path d="M12 5v14"/><path d="M5 12h14"/>'
  };
  function ico(n) { return '<svg class="g-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICO[n] + '</svg>'; }

  /* ---------- "Fatto" grande ---------- */
  var fatto = $('[data-fatto]'), fattoTimer = null;
  function mostraFatto(testo, titoloFatto) {
    $('[data-fatto-titolo]').textContent = titoloFatto || 'Fatto';
    $('[data-fatto-testo]').textContent = testo || '';
    fatto.hidden = false;
    clearTimeout(fattoTimer);
    fattoTimer = setTimeout(function () { fatto.hidden = true; }, testo ? 2600 : 1500);
  }
  fatto.addEventListener('click', function () { fatto.hidden = true; });

  /* ---------- errore chiaro, in cima alla schermata ---------- */
  function mostraErrore(messaggio) {
    var vecchio = $('.g-errore[data-volante]', vista);
    if (vecchio) vecchio.remove();
    var p = document.createElement('p');
    p.className = 'g-errore'; p.setAttribute('data-volante', ''); p.setAttribute('role', 'alert');
    p.style.marginBottom = '16px';
    p.textContent = messaggio;
    vista.insertBefore(p, vista.firstChild);
    window.scrollTo(0, 0);
  }

  /* ---------- una sola domanda prima delle azioni che non tornano indietro ---------- */
  var domanda = $('[data-domanda]'), domandaSi = null;
  function chiedi(titoloDomanda, testo, si, classeSi) {
    return new Promise(function (ok) {
      $('[data-domanda-titolo]').textContent = titoloDomanda;
      $('[data-domanda-testo]').textContent = testo || '';
      var b = $('[data-domanda-si]');
      b.textContent = si;
      b.className = 'g-btn ' + (classeSi || 'g-btn-primario');
      domandaSi = ok;
      if (domanda.showModal) domanda.showModal(); else domanda.setAttribute('open', '');
    });
  }
  function chiudiDomanda(esito) { if (domanda.open) domanda.close(); var f = domandaSi; domandaSi = null; if (f) f(esito); }
  $('[data-domanda-si]').addEventListener('click', function () { chiudiDomanda(true); });
  $('[data-domanda-no]').addEventListener('click', function () { chiudiDomanda(false); });
  domanda.addEventListener('cancel', function (ev) { ev.preventDefault(); chiudiDomanda(false); });

  /* ---------- "Annulla" per qualche secondo ----------
     L'azione parte davvero solo quando il tempo è finito. Se nel
     frattempo l'app viene chiusa, parte subito: una risposta data
     non si perde mai. */
  var ripensa = $('[data-ripensa]'), inSospeso = null;
  function conAnnulla(testo, parti, annullata) {
    concludi();
    var resto = SECONDI_PER_RIPENSARCI;
    var scrivi = function () { $('[data-ripensa-testo]').textContent = testo + ' Hai ' + resto + (resto === 1 ? ' secondo' : ' secondi') + ' per annullare.'; };
    scrivi();
    ripensa.hidden = false;
    inSospeso = {
      parti: parti, annullata: annullata,
      timer: setInterval(function () { resto--; if (resto <= 0) concludi(); else scrivi(); }, 1000)
    };
  }
  function concludi(chiusura) {
    if (!inSospeso) return;
    var s = inSospeso; inSospeso = null;
    clearInterval(s.timer); ripensa.hidden = true;
    s.parti(!!chiusura);
  }
  $('[data-ripensa-annulla]').addEventListener('click', function () {
    if (!inSospeso) return;
    var s = inSospeso; inSospeso = null;
    clearInterval(s.timer); ripensa.hidden = true;
    if (s.annullata) s.annullata();
  });
  window.addEventListener('pagehide', function () { concludi(true); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) concludi(true); });

  /* =============================================================
     Pezzi che tornano in più schermate
     ============================================================= */
  function schedaRichiesta(p) {
    return '<li class="g-scheda g-scheda-attesa" data-richiesta="' + p.id + '">' +
      '<a class="g-nome g-link" href="#prenotazione/' + p.id + '">' + e(p.nome) + '</a>' +
      '<p class="g-quando">' + e(p.quando) + '</p>' +
      '<p class="g-cosa">' + e(p.cosa) + ' · ' + e(p.prezzo) + '</p>' +
      pulsantiRisposta(p) + '</li>';
  }
  function pulsantiRisposta(p) {
    return '<div class="g-due" data-risposte>' +
      '<button class="g-btn g-btn-verde" type="button" data-rispondi="conferma" data-id="' + p.id + '" data-chi="' + e(p.nome) + '">Conferma</button>' +
      '<button class="g-btn g-btn-grigio" type="button" data-rispondi="non_disponibile" data-id="' + p.id + '" data-chi="' + e(p.nome) + '">Non disponibile</button></div>';
  }
  function etichettaStato(p) {
    if (p.stato === 'in_attesa') return '<span class="g-etichetta g-etichetta-attesa">Da confermare</span>';
    if (p.stato === 'confermata') return '<span class="g-etichetta g-etichetta-ok">Confermata</span>';
    if (p.stato === 'presente') return '<span class="g-etichetta g-etichetta-ok">È venuta/o</span>';
    if (p.stato === 'assente') return '<span class="g-etichetta g-etichetta-no">Non è venuta/o</span>';
    if (p.motivo === 'non_disponibile') return '<span class="g-etichetta g-etichetta-no">Non disponibile</span>';
    if (p.motivo === 'cliente') return '<span class="g-etichetta g-etichetta-no">Annullata dal cliente</span>';
    return '<span class="g-etichetta g-etichetta-no">Annullata</span>';
  }
  function vocePrenotazione(p, conStato) {
    return '<li><a class="g-voce" href="#prenotazione/' + p.id + '"><span><strong>' + e(p.nome) + '</strong><small>' + e(p.quando) + '</small>' +
      (conStato ? etichettaStato(p) : '') + '</span></a></li>';
  }

  /* risposta a una richiesta: parte dopo qualche secondo, con "Annulla" */
  function rispondi(bottone) {
    var id = +bottone.getAttribute('data-id'), esito = bottone.getAttribute('data-rispondi'), chi = bottone.getAttribute('data-chi');
    var zona = bottone.closest('[data-risposte]');
    var prima = zona.innerHTML;
    zona.innerHTML = '<p class="g-inviata">' + (esito === 'conferma' ? 'Hai scelto: Conferma.' : 'Hai scelto: Non disponibile.') + '</p>';
    zona.className = '';
    conAnnulla(esito === 'conferma' ? 'Confermo ' + chi + '.' : 'Rispondo “Non disponibile” a ' + chi + '.',
      function (chiusura) {
        chiama('rispondi', { id: id, esito: esito }, { resta: chiusura }).then(function () {
          mostraFatto(esito === 'conferma' ? chi + ' riceve l’email di conferma.' : chi + ' riceve il link per scegliere un altro momento.');
          ridisegna();
        }, function (x) {
          if (chiusura) return;
          ridisegna().then(function () { mostraErrore(x.dati && x.dati.errore === 'GIA_FATTO' ? 'Questa richiesta aveva già una risposta.' : x.message); });
        });
      },
      function () { zona.className = 'g-due'; zona.setAttribute('data-risposte', ''); zona.innerHTML = prima; });
  }

  /* dopo una chiusura: chi aveva già un posto in quei giorni */
  function dopoChiusura(r, tornaA) {
    var n = r.coinvolte.length, html = '';
    imposta('Chiusura', true);
    html += '<h2 class="g-titolo">' + (n === 1 ? 'C’era già una persona' : 'C’erano già ' + n + ' persone') + '</h2>';
    html += '<p class="g-testo">' + (n === 1 ? 'Aveva chiesto o prenotato un posto' : 'Avevano chiesto o prenotato un posto') + ' in ' + (r.giorni === 1 ? 'questo giorno' : 'questi giorni') +
      '. Vuoi mandare un messaggio di scuse con il link per scegliere un altro momento?</p>';
    html += '<ul class="g-lista">' + r.coinvolte.map(function (p) {
      return '<li class="g-scheda"><p class="g-nome">' + e(p.nome) + '</p><p class="g-quando">' + e(p.quando) + '</p>' + etichettaStato(p) + '</li>';
    }).join('') + '</ul>';
    html += '<div class="g-pulsanti"><button class="g-btn g-btn-primario" type="button" data-scuse>' + (n === 1 ? 'Sì, manda le scuse' : 'Sì, manda le scuse a tutti') + '</button>' +
      '<button class="g-btn g-btn-grigio" type="button" data-niente-scuse>No, ' + (n === 1 ? 'la avviso io' : 'li avviso io') + '</button></div>';
    html += abbonatiHtml(r.abbonati);
    vista.innerHTML = html;
    window.scrollTo(0, 0);
    $('[data-scuse]', vista).addEventListener('click', function () {
      this.disabled = true; this.textContent = 'Un attimo…';
      chiama('scuse', { ids: r.coinvolte.map(function (p) { return p.id; }) }).then(function (x) {
        mostraFatto(x.fatte === 1 ? 'Messaggio di scuse inviato.' : 'Messaggi di scuse inviati: ' + x.fatte + '.');
        vai(tornaA);
      }, function (x) { mostraErrore(x.message); });
    });
    $('[data-niente-scuse]', vista).addEventListener('click', function () { vai(tornaA); });
  }
  function abbonatiHtml(lista) {
    if (!lista || !lista.length) return '';
    return '<h2 class="g-sezione">Hanno l’abbonamento del mese</h2><p class="g-testo">La loro prenotazione resta valida. Avvisali tu che in quei giorni sei chiusa.</p>' +
      '<ul class="g-lista">' + lista.map(function (p) {
        return '<li class="g-scheda"><p class="g-nome">' + e(p.nome) + '</p><div class="g-due">' + contatti(p) + '</div></li>';
      }).join('') + '</ul>';
  }
  function contatti(p) {
    return (p.telefonoLink ? '<a class="g-btn g-btn-chiaro" href="tel:' + e(p.telefonoLink) + '">' + ico('telefono') + 'Chiama</a>' : '') +
      (p.whatsapp ? '<a class="g-btn g-btn-chiaro" href="https://wa.me/' + e(p.whatsapp) + '" target="_blank" rel="noopener">' + ico('messaggio') + 'Scrivi su WhatsApp</a>' : '');
  }
  /* chiude uno o più giorni e, se serve, propone le scuse */
  function chiudiGiorni(da, a, valore, tornaA, messaggio) {
    return chiama('chiudi', { da: da, a: a, valore: valore }).then(function (r) {
      if (r.coinvolte.length) { mostraFatto(messaggio); setTimeout(function () { dopoChiusura(r, tornaA); }, 300); return; }
      if (r.abbonati.length) {
        mostraFatto(messaggio);
        imposta('Chiusura', true);
        vista.innerHTML = abbonatiHtml(r.abbonati) + '<div class="g-pulsanti g-largo-su"><button class="g-btn g-btn-primario" type="button" data-fine>Ho capito</button></div>';
        $('[data-fine]', vista).addEventListener('click', function () { vai(tornaA); });
        return;
      }
      mostraFatto(messaggio);
      if (location.hash.slice(1) === tornaA) ridisegna(); else vai(tornaA);
    });
  }

  /* =============================================================
     NOTIFICHE
     ============================================================= */
  function inApp() { return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true; }
  function iPhone() { return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); }
  function android() { return /android/i.test(navigator.userAgent); }
  function chiaveBinaria(b64) {
    var pad = '='.repeat((4 - b64.length % 4) % 4), raw = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
    var out = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
  }
  /* in che stato sono le notifiche su questo telefono */
  function statoNotifiche() {
    if (!CHIAVE_PUSH) return Promise.resolve('non-pronte');
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      /* iPhone: serve l'app sulla schermata Home. Android: serve Chrome aggiornato. */
      return Promise.resolve(iPhone() ? (inApp() ? 'non-possibile' : 'serve-app') : android() ? 'aggiorna-chrome' : 'non-possibile');
    }
    if (Notification.permission === 'denied') return Promise.resolve('bloccate');
    if (Notification.permission !== 'granted') return Promise.resolve('da-attivare');
    return navigator.serviceWorker.ready.then(function (reg) { return reg.pushManager.getSubscription(); })
      .then(function (s) { return s ? 'attive' : 'da-attivare'; }, function () { return 'da-attivare'; });
  }
  /* i Chrome vecchi rispondono con una funzione, quelli nuovi con una promessa */
  function chiediPermesso() {
    return new Promise(function (ok) {
      var r;
      try { r = Notification.requestPermission(function (permesso) { ok(permesso); }); } catch (x) { ok(Notification.permission); return; }
      if (r && r.then) r.then(ok, function () { ok(Notification.permission); });
    });
  }
  function attivaNotifiche() {
    return chiediPermesso().then(function (permesso) {
      if (permesso !== 'granted') { var x = new Error('permesso'); x.bloccate = permesso === 'denied'; throw x; }
      return navigator.serviceWorker.ready;
    }).then(function (reg) {
      return reg.pushManager.getSubscription().then(function (s) {
        return s || reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: chiaveBinaria(CHIAVE_PUSH) });
      });
    }).then(function (s) { return chiama('push-iscrivi', { iscrizione: s.toJSON() }); });
  }
  /* a ogni apertura: se le notifiche sono attive, il server tiene l'iscrizione aggiornata */
  function rinfrescaNotifiche() {
    statoNotifiche().then(function (st) {
      if (st !== 'attive') return;
      navigator.serviceWorker.ready.then(function (reg) { return reg.pushManager.getSubscription(); })
        .then(function (s) { if (s) chiama('push-iscrivi', { iscrizione: s.toJSON(), prova: false }).catch(function () {}); });
    });
  }
  var TESTI_NOTIFICHE = {
    'attive': ['Le notifiche sono attive', 'Questo telefono ti avvisa a ogni nuova richiesta.'],
    'da-attivare': ['Le notifiche non sono attive', 'Attivale per sapere subito quando arriva una richiesta.'],
    'bloccate': ['Le notifiche sono spente', android()
      ? 'Su questo telefono le notifiche del Bagnarino sono spente. Si riaccendono in un minuto.'
      : 'Apri le Impostazioni del telefono, cerca “Notifiche”, poi “Bagnarino”, e scegli “Consenti”. Poi torna qui.'],
    'aggiorna-chrome': ['Per le notifiche serve Chrome aggiornato', 'Apri l’app con Chrome e aggiornalo dal Play Store. Intanto le richieste ti arrivano per email, con i due pulsanti per rispondere.'],
    'serve-app': ['Prima metti l’app sul telefono', 'Su iPhone le notifiche funzionano solo dall’app sulla schermata Home. Si fa in due minuti.'],
    'non-possibile': ['Questo telefono non riceve le notifiche', 'Le richieste ti arrivano comunque per email, con i due pulsanti per rispondere.'],
    'non-pronte': ['Le notifiche non sono ancora pronte', 'Le richieste ti arrivano comunque per email, con i due pulsanti per rispondere.']
  };
  function riquadroNotifiche(st, breve) {
    var t = TESTI_NOTIFICHE[st];
    var html = '<div class="g-riquadro' + (st === 'attive' ? ' g-riquadro-ok' : '') + '" data-notifiche><p class="g-nome">' + t[0] + '</p><p class="g-testo">' + t[1] + '</p>';
    if (st === 'da-attivare') html += '<button class="g-btn g-btn-primario" type="button" data-attiva-notifiche>Attiva le notifiche</button>';
    if (st === 'serve-app') html += '<a class="g-btn g-btn-primario" href="/gestione/installa">Come mettere l’app sul telefono</a>';
    if (st === 'bloccate' && android()) html += '<a class="g-btn g-btn-primario" href="/gestione/installa#notifiche">Come riaccenderle</a>';
    if (st === 'aggiorna-chrome') html += '<a class="g-btn g-btn-primario" href="/gestione/installa#notifiche">Come fare</a>';
    if (st === 'attive' && !breve) {
      html += '<button class="g-btn g-btn-chiaro" type="button" data-attiva-notifiche>Manda una notifica di prova</button>' +
        '<p class="g-nota"><a class="g-link" href="/gestione/installa#notifiche">Non arrivano, o arrivano tardi?</a></p>';
    }
    return html + '</div>';
  }
  function ascoltaNotifiche() {
    var b = $('[data-attiva-notifiche]', vista);
    if (!b) return;
    b.addEventListener('click', function () {
      b.disabled = true; b.textContent = 'Un attimo…';
      attivaNotifiche().then(function (r) {
        mostraFatto(r.prova === false ? 'Le notifiche sono attive.' : 'Le notifiche sono attive. Te ne ho mandata una di prova.');
        ridisegna();
      }, function (x) {
        if (x.message === 'permesso') { ridisegna(); return; }
        /* errore del telefono (per esempio manca il collegamento con i servizi di Google): parole semplici */
        var testo = x.dati ? x.message : 'Non sono riuscita ad attivare le notifiche su questo telefono. Controlla che sia collegato a internet e che Chrome sia aggiornato, poi riprova. Le richieste ti arrivano comunque per email.';
        ridisegna().then(function () { mostraErrore(testo); });
      });
    });
  }

  /* =============================================================
     SCHERMATE
     ============================================================= */
  var SCHERMATE = {};

  /* ---------- Oggi ---------- */
  SCHERMATE.oggi = { titolo: 'Oggi', voce: 'oggi', disegna: function () {
    return Promise.all([leggi('oggi'), statoNotifiche()]).then(function (v) {
      var d = v[0], st = v[1], ora = new Date().getHours();
      var html = '<p class="g-saluto">' + (ora >= 18 ? 'Buonasera ' : 'Buongiorno ') + e(d.nome || NOME) + '</p><p class="g-data">' + e(giornoLungo(d.oggi)) + '</p>';
      /* in "Oggi" il riquadro compare solo quando c'è qualcosa da fare per ricevere le notifiche */
      if (st === 'da-attivare' || st === 'serve-app' || st === 'bloccate' || st === 'aggiorna-chrome') html += riquadroNotifiche(st, true);

      html += '<h2 class="g-sezione">Richieste da confermare</h2>';
      html += d.inAttesa.length ? '<ul class="g-lista">' + d.inAttesa.map(schedaRichiesta).join('') + '</ul>' : '<p class="g-vuoto">Nessuna richiesta in attesa.</p>';

      html += '<h2 class="g-sezione">Chi arriva oggi</h2>';
      html += d.arrivi.length ? '<ul class="g-lista">' + d.arrivi.map(function (p) {
        var arrivata = p.stato === 'presente';
        return '<li class="g-scheda"><a class="g-nome g-link" href="#prenotazione/' + p.id + '">' + e(p.nome) + '</a><p class="g-quando">' + e(p.cosa) + '</p>' +
          (p.mensile ? '' : arrivata
            ? '<p class="g-inviata"><span class="g-etichetta g-etichetta-ok">È arrivata/o</span></p>'
            : '<div class="g-pulsanti"><button class="g-btn g-btn-chiaro" type="button" data-arrivo="' + p.id + '" data-chi="' + e(p.nome) + '">È arrivata/o</button></div>') + '</li>';
      }).join('') + '</ul>' : '<p class="g-vuoto">' + (d.chiusura === 'giorno' ? 'Oggi sei chiusa.' : 'Oggi non arriva nessuno.') + '</p>';

      if (d.arriviDomani && d.arriviDomani.length) {
        html += '<h2 class="g-sezione">Chi arriva domani</h2><ul class="g-lista">' + d.arriviDomani.map(function (p) {
          return '<li><a class="g-voce" href="#prenotazione/' + p.id + '"><span><strong>' + e(p.nome) + '</strong><small>' + e(p.cosa) + '</small></span></a></li>';
        }).join('') + '</ul>';
      }

      html += '<div class="g-largo-su">';
      if (d.chiusura === 'giorno') html += '<p class="g-stato g-stato-chiuso">Oggi sei chiusa: sul sito non si può prenotare per oggi.</p><div class="g-pulsanti"><button class="g-btn g-btn-chiaro" type="button" data-riapri-oggi="' + d.oggi + '">Riapri oggi</button></div>';
      else html += '<button class="g-btn g-btn-grigio" type="button" data-chiudi-oggi="' + d.oggi + '">Oggi sono chiusa</button>';
      html += '</div>';
      vista.innerHTML = html;
      ascoltaNotifiche();
    });
  } };

  /* ---------- Calendario ---------- */
  SCHERMATE.calendario = { titolo: 'Calendario', voce: 'calendario', disegna: function (mese) {
    return leggi('calendario', { mese: mese }).then(function (d) {
      var prima = iso(new Date(+d.mese.slice(0, 4), +d.mese.slice(5) - 2, 1)).slice(0, 7), dopo = iso(new Date(+d.mese.slice(0, 4), +d.mese.slice(5), 1)).slice(0, 7);
      var html = '<div class="g-mese"><button type="button" data-vai="calendario/' + prima + '" aria-label="Mese prima">' + ico('prima') + '</button>' +
        '<h2>' + e(meseLungo(d.mese)) + '</h2><button type="button" data-vai="calendario/' + dopo + '" aria-label="Mese dopo">' + ico('dopo') + '</button></div>';
      html += '<div class="g-settimana" aria-hidden="true"><span>L</span><span>M</span><span>M</span><span>G</span><span>V</span><span>S</span><span>D</span></div><div class="g-griglia">';
      for (var i = 0; i < d.primoGiornoSettimana; i++) html += '<span></span>';
      d.giorni.forEach(function (g) {
        var classi = ['g-giorno'], parole = [];
        if (g.chiusura === 'giorno') { classi.push('chiuso'); parole.push('chiuso'); }
        else {
          if (g.chiusura) { classi.push('chiuso-' + g.chiusura); parole.push(g.chiusura === 'mattina' ? 'chiuso la mattina' : 'chiuso il pomeriggio'); }
          if (g.inAttesa) { classi.push('con-attesa'); parole.push(g.inAttesa === 1 ? 'una richiesta da confermare' : g.inAttesa + ' richieste da confermare'); }
          else if (g.prenotazioni) classi.push('con-prenotazioni');
          if (g.prenotazioni) parole.push(g.prenotazioni === 1 ? 'una prenotazione' : g.prenotazioni + ' prenotazioni');
          if (!parole.length) parole.push('aperto');
        }
        if (g.data === d.oggi) classi.push('oggi');
        html += '<button type="button" class="' + classi.join(' ') + '" data-vai="giorno/' + g.data + '" aria-label="' + e(giornoLungo(g.data) + ', ' + parole.join(', ')) + '"><b>' + (+g.data.slice(8)) + '</b><i></i></button>';
      });
      html += '</div>';
      html += '<ul class="g-legenda"><li><span></span>Aperto</li><li><span class="l-pren"></span>Con prenotazioni</li><li><span class="l-attesa"></span>Con richieste da confermare</li><li><span class="l-chiuso"></span>Chiuso</li></ul>';
      html += '<div class="g-pulsanti g-largo-su"><a class="g-btn g-btn-primario" href="#chiudi-giorni">Chiudi più giorni</a></div>';
      vista.innerHTML = html;
    });
  } };

  /* ---------- un giorno ---------- */
  var PAROLE_CHIUSURA = { giorno: 'Chiuso tutto il giorno', mattina: 'Chiuso la mattina', pomeriggio: 'Chiuso il pomeriggio' };
  SCHERMATE.giorno = { titolo: 'Giorno', voce: 'calendario', interna: 'calendario', disegna: function (data) {
    return leggi('giorno', { data: data }).then(function (d) {
      imposta(maiuscola(giornoBreve(d.data)), true);
      var html = '<h2 class="g-titolo">' + e(maiuscola(giornoLungo(d.data))) + '</h2>';
      html += '<p class="g-stato' + (d.chiusura ? ' g-stato-chiuso' : '') + '">' + (d.chiusura ? PAROLE_CHIUSURA[d.chiusura] : 'Aperto su prenotazione') + (d.festa && !d.chiusura ? ' · è un giorno di festa' : '') + '</p>';
      html += '<h2 class="g-sezione">Prenotazioni</h2>';
      html += d.prenotazioni.length ? '<ul class="g-lista">' + d.prenotazioni.map(function (p) {
        return '<li><a class="g-voce" href="#prenotazione/' + p.id + '"><span><strong>' + e(p.nome) + '</strong><small>' + e(p.cosa) + '</small>' + etichettaStato(p) + '</span></a></li>';
      }).join('') + '</ul>' : '<p class="g-vuoto">Nessuna prenotazione per questo giorno.</p>';
      if (!d.passato && d.chiusura !== 'giorno') html += '<div class="g-pulsanti"><a class="g-btn g-btn-chiaro" href="#nuova/' + d.data + '">Aggiungi una prenotazione</a></div>';
      if (!d.passato) {
        html += '<h2 class="g-sezione">Vuoi chiudere?</h2><div class="g-scelte">' + ['giorno', 'mattina', 'pomeriggio'].map(function (v) {
          return '<button class="g-btn g-btn-grigio" type="button" data-chiusura="' + v + '" data-data="' + d.data + '" aria-pressed="' + (d.chiusura === v) + '">' + PAROLE_CHIUSURA[v] + '</button>';
        }).join('') + (d.chiusura ? '<button class="g-btn g-btn-chiaro" type="button" data-chiusura="aperto" data-data="' + d.data + '">Riapri questo giorno</button>' : '') + '</div>';
      }
      vista.innerHTML = html;
    });
  } };

  /* ---------- chiudi dal ... al ... ---------- */
  SCHERMATE['chiudi-giorni'] = { titolo: 'Chiudi più giorni', voce: 'calendario', interna: 'calendario', disegna: function () {
    var oggi = iso(new Date());
    vista.innerHTML = '<h2 class="g-titolo">Chiudi più giorni di fila</h2><p class="g-testo">Per ferie o ponti. In quei giorni dal sito non si potrà prenotare.</p>' +
      '<form class="g-modulo" data-periodo novalidate>' +
      '<label class="g-campo"><span>Chiudi dal</span><input type="date" name="da" min="' + oggi + '" value="' + oggi + '" required></label>' +
      '<label class="g-campo"><span>al</span><input type="date" name="a" min="' + oggi + '" value="' + oggi + '" required></label>' +
      '<p class="g-errore" data-errore role="alert" hidden></p>' +
      '<button class="g-btn g-btn-primario" type="submit">Chiudi questi giorni</button></form>';
    var f = $('[data-periodo]', vista), err = $('[data-errore]', f);
    f.da.addEventListener('change', function () { if (f.a.value < f.da.value) f.a.value = f.da.value; f.a.min = f.da.value; });
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      err.hidden = true;
      var da = f.da.value, a = f.a.value;
      if (!da || !a || a < da) { err.textContent = 'Controlla i giorni: il secondo deve venire dopo il primo.'; err.hidden = false; return; }
      chiedi(da === a ? 'Chiudo ' + giornoLungo(da) + '?' : 'Chiudo dal ' + giornoBreve(da) + ' al ' + giornoBreve(a) + '?', 'Le persone non potranno prenotare in ' + (da === a ? 'questo giorno' : 'questi giorni') + '.', 'Sì, chiudi')
        .then(function (si) {
          if (!si) return;
          return chiudiGiorni(da, a, 'giorno', 'calendario/' + da.slice(0, 7), da === a ? 'Giorno chiuso.' : 'Giorni chiusi.');
        }).catch(function (x) { err.textContent = x.message; err.hidden = false; });
    });
    return Promise.resolve();
  } };

  /* ---------- Prenotazioni ---------- */
  SCHERMATE.prenotazioni = { titolo: 'Prenotazioni', voce: 'prenotazioni', disegna: function () {
    return leggi('prenotazioni').then(function (d) {
      var html = '<div class="g-pulsanti" style="margin-top:0"><a class="g-btn g-btn-chiaro" href="#nuova">Aggiungi una prenotazione</a></div>';
      html += '<h2 class="g-sezione">Da confermare</h2>';
      html += d.daConfermare.length ? '<ul class="g-lista">' + d.daConfermare.map(schedaRichiesta).join('') + '</ul>' : '<p class="g-vuoto">Nessuna richiesta in attesa.</p>';
      html += '<h2 class="g-sezione">Confermate</h2>';
      html += d.confermate.length ? '<ul class="g-lista">' + d.confermate.map(function (p) { return vocePrenotazione(p, false); }).join('') + '</ul>' : '<p class="g-vuoto">Nessuna prenotazione confermata nei prossimi giorni.</p>';
      html += '<h2 class="g-sezione">Passate</h2>';
      html += d.passate.length ? '<ul class="g-lista">' + d.passate.map(function (p) { return vocePrenotazione(p, true); }).join('') + '</ul>' : '<p class="g-vuoto">Ancora nessuna.</p>';
      vista.innerHTML = html;
    });
  } };

  /* ---------- una prenotazione ---------- */
  SCHERMATE.prenotazione = { titolo: 'Prenotazione', voce: 'prenotazioni', interna: 'prenotazioni', disegna: function (id) {
    return leggi('prenotazione', { id: id }).then(function (p) {
      imposta(p.stato === 'in_attesa' ? 'Richiesta' : 'Prenotazione', true);
      var html = '<h2 class="g-titolo">' + e(p.nome) + '</h2>' + etichettaStato(p);
      html += '<dl class="g-dati"><div><dt>Quando</dt><dd class="g-iniziale">' + e(p.quando) + '</dd></div>' +
        '<div><dt>Cosa</dt><dd>' + e(p.cosa) + ' · ' + e(p.prezzo) + '</dd></div>' +
        '<div><dt>Telefono</dt><dd>' + e(p.telefono) + '</dd></div>' +
        (p.email ? '<div><dt>Email</dt><dd><a class="g-link" href="mailto:' + e(p.email) + '">' + e(p.email) + '</a></dd></div>' : '') +
        (p.nota ? '<div><dt>Nota del cliente</dt><dd>' + e(p.nota) + '</dd></div>' : '') +
        (p.posto && p.stato !== 'annullata' ? dato('Posto', p.posto) : '') +
        (p.arrivaDa ? dato('Arriva da', nomeCanale(p.arrivaDa)) : '') +
        dato('Bagnarino Card', p.timbri + (p.timbri === 1 ? ' timbro' : ' timbri') + ' su 10' + (p.omaggi ? ' · ' + (p.omaggi === 1 ? 'una giornata in regalo' : p.omaggi + ' giornate in regalo') : '')) +
        (p.fattura ? dato('Fattura a', p.fattura) : '') + dato('Codice', p.codice) + '</dl>';
      html += '<div class="g-due" style="margin-top:16px">' + contatti(p) + '</div>';
      html += '<p class="g-nota"><a class="g-link" href="#cliente/' + p.clienteId + '">Tutte le prenotazioni di ' + e(p.soloNome) + '</a></p>';
      if (p.stato === 'in_attesa') html += '<h2 class="g-sezione">La tua risposta</h2>' + pulsantiRisposta(p);
      else if (p.stato !== 'annullata') {
        if (p.puoSegnareArrivo) {
          html += '<div class="g-pulsanti g-largo-su">' + (p.stato === 'presente'
            ? '<button class="g-btn g-btn-chiaro" type="button" data-non-arrivo="' + p.id + '">Ho sbagliato: non è arrivata/o</button>'
            : '<button class="g-btn g-btn-verde" type="button" data-arrivo="' + p.id + '" data-chi="' + e(p.nome) + '">È arrivata/o</button>') + '</div>';
        }
        if (p.puoPagare) {
          html += '<h2 class="g-sezione">Pagamento</h2>' + (p.pagato
            ? '<p class="g-stato">Ha pagato ' + euro(p.importo) + (NOMI_METODO[p.metodo] ? ' ' + NOMI_METODO[p.metodo] : '') + (p.pagataIl ? ', il ' + e(giornoBreve(p.pagataIl)) : '') + '</p>' +
              '<div class="g-pulsanti"><button class="g-btn g-btn-chiaro" type="button" data-non-pagato="' + p.id + '">Ho sbagliato: non ha pagato</button></div>'
            : '<p class="g-testo">Da pagare: ' + euro(p.importo) + '</p><a class="g-btn g-btn-chiaro" href="#pagamento/' + p.id + '">Ha pagato</a>');
        }
        if (!p.passata && p.stato === 'confermata') {
          html += '<div class="g-pulsanti g-largo-su"><button class="g-btn g-btn-rosso" type="button" data-annulla-prenotazione="' + p.id + '" data-chi="' + e(p.nome) + '">Annulla la prenotazione</button></div>';
        }
      }
      vista.innerHTML = html;
    });
  } };

  /* ---------- Il mio sito ---------- */
  SCHERMATE.sito = { titolo: 'Il mio sito', voce: 'sito', disegna: function () {
    return leggi('sito').then(function (d) {
      vista.innerHTML = '<p class="g-testo">Qui cambi quello che si legge sul sito. Le modifiche si vedono entro un minuto.</p><ul class="g-lista">' +
        '<li><a class="g-voce" href="#sito-avviso"><span><strong>Avviso in prima pagina</strong><small>' + (d.avviso.attivo ? 'Si vede sul sito' : 'Adesso è nascosto') + '</small></span></a></li>' +
        '<li><a class="g-voce" href="#sito-foto"><span><strong>Foto dello spazio</strong><small>' + (d.foto.length === 1 ? 'Una foto' : d.foto.length + ' foto') + '</small></span></a></li>' +
        '<li><a class="g-voce" href="#sito-contatti"><span><strong>Telefono e WhatsApp</strong><small>' + e(d.contatti.telefono) + '</small></span></a></li></ul>' +
        '<div class="g-pulsanti g-largo-su"><a class="g-btn g-btn-chiaro" href="/" target="_blank" rel="noopener">Guarda il sito</a></div>';
    });
  } };

  SCHERMATE['sito-avviso'] = { titolo: 'Avviso', voce: 'sito', interna: 'sito', disegna: function () {
    return leggi('sito').then(function (d) {
      var a = d.avviso;
      vista.innerHTML = '<h2 class="g-titolo">Avviso in prima pagina</h2><p class="g-testo">Una frase breve in cima al sito, per esempio una novità o una promozione.</p>' +
        '<form class="g-modulo" data-avviso novalidate>' +
        '<label class="g-campo"><span>Testo dell’avviso</span><textarea name="testo" maxlength="' + a.massimo + '">' + e(a.testo) + '</textarea></label>' +
        '<p class="g-conta" data-conta></p>' +
        '<button class="g-interruttore" type="button" role="switch" aria-checked="' + a.attivo + '" data-leva><span><strong>Mostra l’avviso sul sito</strong><small data-leva-testo></small></span><span class="g-leva" aria-hidden="true"></span></button>' +
        '<p class="g-errore" data-errore role="alert" hidden></p>' +
        '<button class="g-btn g-btn-primario" type="submit">Salva</button></form>';
      var f = $('[data-avviso]', vista), leva = $('[data-leva]', f), err = $('[data-errore]', f);
      var aggiorna = function () {
        var acceso = leva.getAttribute('aria-checked') === 'true';
        $('[data-leva-testo]', f).textContent = acceso ? 'Sì: si vede sul sito' : 'No: è nascosto';
        var resto = a.massimo - f.testo.value.length;
        $('[data-conta]', f).textContent = resto === 1 ? 'Puoi scrivere ancora una lettera.' : 'Puoi scrivere ancora ' + resto + ' lettere.';
      };
      leva.addEventListener('click', function () { leva.setAttribute('aria-checked', leva.getAttribute('aria-checked') !== 'true'); aggiorna(); });
      f.testo.addEventListener('input', aggiorna);
      aggiorna();
      f.addEventListener('submit', function (ev) {
        ev.preventDefault();
        err.hidden = true;
        chiama('avviso', { testo: f.testo.value, attivo: leva.getAttribute('aria-checked') === 'true' }).then(function (r) {
          mostraFatto(r.attivo ? 'L’avviso si vede sul sito entro un minuto.' : 'L’avviso è nascosto.');
          vai('sito');
        }, function (x) { err.textContent = x.message; err.hidden = false; });
      });
    });
  } };

  /* ---------- foto: ridotte sul telefono prima di partire ----------
     La fotocamera scrive nel file come va girata la foto. I Chrome recenti la
     raddrizzano da soli; quelli vecchi no, e la foto finirebbe coricata sul
     sito: in quel caso si legge l'indicazione e si gira qui. */
  var RADDRIZZA_DA_SOLO = !!(window.CSS && CSS.supports && CSS.supports('image-orientation', 'from-image'));
  function leggiOrientamento(v) {
    try {
      if (v.byteLength < 12 || v.getUint16(0) !== 0xFFD8) return 1;
      var p = 2;
      while (p + 4 <= v.byteLength) {
        var marca = v.getUint16(p), lunga = v.getUint16(p + 2);
        if (marca === 0xFFE1 && v.getUint32(p + 4) === 0x45786966) {   /* "Exif" */
          var t = p + 10, piccolo = v.getUint16(t) === 0x4949;
          var elenco = t + v.getUint32(t + 4, piccolo), n = v.getUint16(elenco, piccolo);
          for (var i = 0; i < n; i++) {
            var voce = elenco + 2 + i * 12;
            if (v.getUint16(voce, piccolo) === 0x0112) { var o = v.getUint16(voce + 8, piccolo); return o >= 1 && o <= 8 ? o : 1; }
          }
          return 1;
        }
        if ((marca & 0xFF00) !== 0xFF00 || marca === 0xFFDA) break;
        p += 2 + lunga;
      }
    } catch (x) { /* file troncato o strano: si lascia com'è */ }
    return 1;
  }
  function orientamento(file) {
    return new Promise(function (ok) {
      if (!window.FileReader || !file.slice) { ok(1); return; }
      var r = new FileReader();
      r.onerror = function () { ok(1); };
      r.onload = function () { ok(leggiOrientamento(new DataView(r.result))); };
      r.readAsArrayBuffer(file.slice(0, 131072));
    });
  }
  function caricaImmagine(file) {
    return new Promise(function (ok, no) {
      var indirizzo = URL.createObjectURL(file), img = new Image();
      img.onload = function () { ok(img); };
      img.onerror = function () { URL.revokeObjectURL(indirizzo); no(new Error('foto')); };
      img.src = indirizzo;
    });
  }
  /* img: immagine o tela; orient: 1-8 come nel file; lato: misura massima */
  function disegna(img, orient, lato, qualita) {
    var l = img.naturalWidth || img.width, a = img.naturalHeight || img.height;
    var scala = Math.min(1, lato / Math.max(l, a)), w = Math.round(l * scala), h = Math.round(a * scala);
    var girata = orient >= 5, c = document.createElement('canvas');
    c.width = girata ? h : w; c.height = girata ? w : h;
    var x = c.getContext('2d');
    x.fillStyle = '#FFFFFF'; x.fillRect(0, 0, c.width, c.height);
    if (orient === 2) x.transform(-1, 0, 0, 1, w, 0);
    else if (orient === 3) x.transform(-1, 0, 0, -1, w, h);
    else if (orient === 4) x.transform(1, 0, 0, -1, 0, h);
    else if (orient === 5) x.transform(0, 1, 1, 0, 0, 0);
    else if (orient === 6) x.transform(0, 1, -1, 0, h, 0);
    else if (orient === 7) x.transform(0, -1, -1, 0, h, w);
    else if (orient === 8) x.transform(0, -1, 1, 0, 0, w);
    x.drawImage(img, 0, 0, w, h);
    var url = c.toDataURL('image/jpeg', qualita);
    return { tela: c, dati: url.slice(url.indexOf(',') + 1), larghezza: c.width, altezza: c.height };
  }
  function riduciFoto(file) {
    return Promise.all([caricaImmagine(file), RADDRIZZA_DA_SOLO ? 1 : orientamento(file)]).then(function (v) {
      var fatte = [disegna(v[0], v[1], 1440, 0.82), disegna(v[0], v[1], 720, 0.78)];
      try { URL.revokeObjectURL(v[0].src); } catch (x) { /* niente */ }   /* la foto intera non serve più: memoria libera */
      return fatte;
    });
  }
  /* solo per le prove automatiche */
  if (window.__BGN_PROVA) window.__BGN_PROVA({ leggiOrientamento: leggiOrientamento, disegna: disegna, riduciFoto: riduciFoto });

  SCHERMATE['sito-foto'] = { titolo: 'Foto', voce: 'sito', interna: 'sito', disegna: function () {
    return leggi('sito').then(function (d) {
      var n = d.foto.length, piena = n >= d.massimoFoto;
      var html = '<h2 class="g-titolo">Foto dello spazio</h2><p class="g-testo">Sono le foto della sezione “Lo spazio”. La prima è la più grande.</p>';
      html += piena ? '<p class="g-vuoto">Ci sono già ' + n + ' foto: togline una per aggiungerne un’altra.</p>'
        : '<label class="g-btn g-btn-primario g-carica">' + ico('piu') + '<span data-carica-testo>Aggiungi una foto</span><input type="file" accept="image/*" data-nuova-foto aria-label="Aggiungi una foto"></label>';
      html += '<p class="g-errore" data-errore role="alert" hidden style="margin-top:14px"></p>';
      html += '<ul class="g-lista" style="margin-top:20px">' + d.foto.map(function (f, i) {
        return '<li class="g-foto"><img src="' + e(f.src) + '" alt="Foto ' + (i + 1) + '" loading="lazy"><div class="g-foto-azioni">' +
          '<div class="g-due"><button class="g-btn g-btn-chiaro" type="button" data-sposta="-1" data-i="' + i + '"' + (i === 0 ? ' disabled' : '') + '>' + ico('su') + 'Su</button>' +
          '<button class="g-btn g-btn-chiaro" type="button" data-sposta="1" data-i="' + i + '"' + (i === n - 1 ? ' disabled' : '') + '>' + ico('giu') + 'Giù</button></div>' +
          '<button class="g-btn g-btn-rosso" type="button" data-togli-foto="' + e(f.id) + '"' + (n <= 1 ? ' disabled' : '') + '>Togli</button></div></li>';
      }).join('') + '</ul>';
      vista.innerHTML = html;
      var err = $('[data-errore]', vista), ids = d.foto.map(function (f) { return f.id; });
      var sbagliato = function (x) { err.textContent = x.message; err.hidden = false; window.scrollTo(0, 0); };
      var input = $('[data-nuova-foto]', vista);
      if (input) input.addEventListener('change', function () {
        var file = input.files && input.files[0];
        if (!file) return;
        err.hidden = true;
        $('[data-carica-testo]', vista).textContent = 'Sto caricando la foto…';
        input.disabled = true;
        riduciFoto(file).then(function (v) {
          return chiama('foto-aggiungi', { grande: v[0].dati, piccola: v[1].dati, larghezza: v[0].larghezza, altezza: v[0].altezza });
        }, function () { throw new Error('Non sono riuscita a leggere la foto. Riprova con un’altra.'); })
          .then(function () { mostraFatto('La foto si vede sul sito entro un minuto.'); ridisegna(); }, function (x) { ridisegna().then(function () { mostraErrore(x.message); }); });
      });
      $$('[data-sposta]', vista).forEach(function (b) {
        b.addEventListener('click', function () {
          var i = +b.getAttribute('data-i'), j = i + (+b.getAttribute('data-sposta'));
          var nuovo = ids.slice(); nuovo.splice(j, 0, nuovo.splice(i, 1)[0]);
          chiama('foto-ordine', { ids: nuovo }).then(function () { mostraFatto(); ridisegna(); }, sbagliato);
        });
      });
      $$('[data-togli-foto]', vista).forEach(function (b) {
        b.addEventListener('click', function () {
          chiedi('Tolgo questa foto dal sito?', 'Non si potrà recuperare: per rimetterla dovrai caricarla di nuovo.', 'Sì, toglila', 'g-btn-rosso').then(function (si) {
            if (!si) return;
            chiama('foto-togli', { id: b.getAttribute('data-togli-foto') }).then(function () { mostraFatto('Foto tolta dal sito.'); ridisegna(); }, sbagliato);
          });
        });
      });
    });
  } };

  SCHERMATE['sito-contatti'] = { titolo: 'Telefono', voce: 'sito', interna: 'sito', disegna: function () {
    return leggi('sito').then(function (d) {
      vista.innerHTML = '<h2 class="g-titolo">Telefono e WhatsApp</h2><p class="g-testo">Sono i numeri dei pulsanti “Chiama” e “WhatsApp” sul sito.</p>' +
        '<form class="g-modulo" data-contatti novalidate>' +
        '<label class="g-campo"><span>Numero di telefono</span><input type="tel" name="telefono" inputmode="tel" autocomplete="tel" value="' + e(d.contatti.telefono) + '" required></label>' +
        '<label class="g-campo"><span>Numero di WhatsApp</span><input type="tel" name="whatsapp" inputmode="tel" value="' + e(d.contatti.whatsapp) + '" required></label>' +
        '<p class="g-errore" data-errore role="alert" hidden></p>' +
        '<button class="g-btn g-btn-primario" type="submit">Salva</button></form>';
      var f = $('[data-contatti]', vista), err = $('[data-errore]', f);
      f.addEventListener('submit', function (ev) {
        ev.preventDefault();
        err.hidden = true;
        chiama('contatti', { telefono: f.telefono.value, whatsapp: f.whatsapp.value }).then(function () {
          mostraFatto('I numeri nuovi si vedono sul sito entro un minuto.');
          vai('sito');
        }, function (x) { err.textContent = x.message; err.hidden = false; });
      });
    });
  } };

  /* ---------- Profilo: Come va e Impostazioni ---------- */
  SCHERMATE.profilo = { titolo: 'Profilo', interna: 'oggi', disegna: function () {
    vista.innerHTML = '<ul class="g-lista">' +
      voce('come-va', 'Come va', 'Prenotazioni, clienti, social, Google e pubblicità') +
      voce('clienti', 'Clienti', 'Chi viene e quante volte') +
      voce('incassi', 'Incassi', 'Chi ha pagato e chi deve ancora pagare') +
      voce('impostazioni', 'Impostazioni', 'Notifiche, prezzi, password, uscita') + '</ul>';
    return Promise.resolve();
  } };

  SCHERMATE.impostazioni = { titolo: 'Impostazioni', interna: 'profilo', disegna: function () {
    return statoNotifiche().then(function (st) {
      vista.innerHTML = '<h2 class="g-sezione">Notifiche</h2>' + riquadroNotifiche(st) +
        (inApp() ? '' : '<h2 class="g-sezione">App sul telefono</h2>' +
          '<div class="g-pulsanti" style="margin-top:0"><button class="g-btn g-btn-primario" type="button" data-installa-subito data-installa-ora' + (installaSubito ? '' : ' hidden') + '>Metti l’app su questo telefono</button>' +
          '<a class="g-btn g-btn-chiaro" href="/gestione/installa">Come mettere l’app sul telefono</a></div>') +
        '<h2 class="g-sezione">Il coworking</h2><ul class="g-lista">' + voce('imp-prezzi', 'Prezzi', 'Giornata, mezza giornata, carnet, mese') +
        voce('imp-posti', 'Quanti posti ci sono', 'Le scrivanie che si possono prenotare') + voce('imp-messaggi', 'Messaggi di WhatsApp', 'Le frasi già scritte dei pulsanti del sito') + '</ul>' +
        '<h2 class="g-sezione">Password</h2><a class="g-btn g-btn-chiaro" href="/gestione/password">Cambia la password</a>' +
        '<h2 class="g-sezione">Uscita</h2><button class="g-btn g-btn-rosso" type="button" data-esci>Esci dall’app</button>';
      ascoltaNotifiche();
      $('[data-esci]', vista).addEventListener('click', function () {
        chiedi('Vuoi uscire?', 'Per rientrare dovrai scrivere di nuovo email e password.', 'Sì, esci', 'g-btn-rosso').then(function (si) {
          if (si) chiama('esci').then(function () { location.href = '/gestione/accedi'; });
        });
      });
    });
  } };

  /* =============================================================
     COME VA, CLIENTI, INCASSI, PREZZI
     Tutto quello che prima stava nell'area riservata, con le
     stesse regole dell'app: numeri grandi, parole semplici, righe
     con una barra al posto dei grafici.
     ============================================================= */
  /* numeri scritti all'italiana, sempre con il punto delle migliaia (1.240) e senza
     dipendere dal telefono: i Chrome vecchi li scrivono in modi diversi */
  function migliaia(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function intero(n) { return (n < 0 ? '-' : '') + migliaia(Math.abs(Math.round(n))); }
  function euro(c) {
    var a = Math.abs(Math.round(c)), cent = a % 100;
    return (c < 0 ? '-' : '') + '€' + migliaia(Math.floor(a / 100)) + (cent ? ',' + (cent < 10 ? '0' : '') + cent : '');
  }
  function virgola(n) { return String(n).replace('.', ','); }
  /* "a ottobre", ma "ad agosto" e "ad aprile" */
  function aMese(nome) { return (/^a/.test(nome) ? 'ad ' : 'a ') + nome; }
  function voce(dove, titoloVoce, sotto) {
    return '<li><a class="g-voce" href="#' + dove + '"><span><strong>' + e(titoloVoce) + '</strong>' + (sotto ? '<small>' + e(sotto) + '</small>' : '') + '</span></a></li>';
  }
  function dato(nome, valore) { return '<div><dt>' + e(nome) + '</dt><dd>' + e(valore) + '</dd></div>'; }
  /* confronto con il mese prima, in parole: "20% in più rispetto a ottobre" */
  function confrontoTesto(k, nomePrima, assoluto) {
    if (!k || k.valore == null || k.prima == null) return '';
    var d = k.valore - k.prima;
    if (!d) return 'Come ' + aMese(nomePrima);
    if (!assoluto && !k.prima) return '';
    var quanto = assoluto ? intero(Math.abs(d)) : Math.round(Math.abs(d) / k.prima * 100) + '%';
    return quanto + (d > 0 ? ' in più' : ' in meno') + ' rispetto ' + aMese(nomePrima);
  }
  function piccolo(testo, inSu) { return testo ? '<small' + (inSu ? ' class="g-su"' : '') + '>' + e(testo) + '</small>' : ''; }
  function conConfronto(k, nomePrima) { return piccolo(confrontoTesto(k, nomePrima), k && k.prima != null && k.valore > k.prima); }
  /* righe con una barra: il valore più alto riempie tutta la riga */
  function quote(righe, formato) {
    var max = 0;
    righe.forEach(function (r) { if (r.valore > max) max = r.valore; });
    return '<ul class="g-quote">' + righe.map(function (r) {
      return '<li><div class="g-quota-testa"><span>' + e(r.nome) + '</span><strong>' + (formato ? formato(r.valore) : intero(r.valore)) + '</strong></div>' +
        '<div class="g-quota-riga"><i style="width:' + (max && r.valore ? Math.max(3, Math.round(r.valore / max * 100)) : 0) + '%"></i></div></li>';
    }).join('') + '</ul>';
  }
  var NOMI_CANALI = {
    'Diretto': 'Direttamente dal sito', 'In sede / telefono': 'Di persona o al telefono', 'Altro': 'Da altri siti',
    'Google': 'Ricerca su Google', 'Google Ads': 'Pubblicità su Google', 'Google Maps': 'Google Maps',
    'Instagram': 'Instagram', 'Facebook': 'Facebook', 'WhatsApp': 'WhatsApp'
  };
  function nomeCanale(c) { return NOMI_CANALI[c] || c; }
  function inArrivo() {
    return '<p class="g-vuoto">' + (RUOLO === 'apex' ? 'Nessun numero per questo mese.' : 'In arrivo: questi numeri li aggiorna Apex Media a inizio mese.') + '</p>';
  }
  function mesePrimaDi(d) { return d.mesi.length > 1 ? (d.mesi[d.mesi.length - 2].marketing || {}) : {}; }
  /* un numero di social o Google con il confronto: "1.240 · 35 in più rispetto a ottobre" */
  function numeroCon(d, campo, assoluto) {
    var mk = d.marketing || {}, c = confrontoTesto({ valore: mk[campo], prima: mesePrimaDi(d)[campo] }, d.nomeMesePrima, assoluto);
    return intero(mk[campo]) + (c ? ' · ' + c.charAt(0).toLowerCase() + c.slice(1) : '');
  }
  /* un numero mese per mese (solo i mesi che ce l'hanno), dal più recente */
  function serie(d, campo) {
    var out = [];
    d.mesi.forEach(function (x) { if (x.marketing && x.marketing[campo] != null) out.unshift({ nome: meseLungo(x.mese.slice(0, 7)), valore: x.marketing[campo] }); });
    return out;
  }
  function pulsanteNumeri(d) {
    return RUOLO === 'apex' ? '<div class="g-pulsanti g-largo-su"><a class="g-btn g-btn-primario" href="#numeri-mese/' + d.mese.slice(0, 7) + '">Aggiorna i numeri di ' + e(d.nomeMese) + '</a></div>' : '';
  }

  /* ---------- Come va: il mese in tre numeri, poi "da vicino" ---------- */
  SCHERMATE['come-va'] = { titolo: 'Come va', interna: 'profilo', disegna: function (mese) {
    return leggi('come-va', { mese: mese }).then(function (d) {
      var k = d.kpi, m7 = d.mese.slice(0, 7), nome = d.nomeMese, prima = d.nomeMesePrima, mk = d.marketing || {};
      var m = d.mesi[d.mesi.length - 1], corrente = d.mese === d.corrente, g = daIso(d.mese);
      var mPrima = iso(new Date(g.getFullYear(), g.getMonth() - 1, 1)).slice(0, 7), mDopo = iso(new Date(g.getFullYear(), g.getMonth() + 1, 1)).slice(0, 7);
      var html = '<div class="g-mese"><button type="button" data-vai="come-va/' + mPrima + '" aria-label="Mese prima">' + ico('prima') + '</button><h2>' + e(meseLungo(m7)) + '</h2>' +
        '<button type="button" data-vai="come-va/' + mDopo + '" aria-label="Mese dopo"' + (corrente ? ' disabled' : '') + '>' + ico('dopo') + '</button></div>';
      html += '<p class="g-testo">' + e(d.riassunto) + '</p>';
      html += '<div class="g-numeri">' +
        '<div class="g-numero"><strong>' + intero(k.prenotazioni.valore) + '</strong><span>' + (k.prenotazioni.valore === 1 ? 'Prenotazione' : 'Prenotazioni') + ' di ' + e(nome) + '</span>' + conConfronto(k.prenotazioni, prima) + '</div>' +
        '<div class="g-numero"><strong>' + euro(k.valorePrenotato.valore) + '</strong><span>Prenotati ' + e(aMese(nome)) + '</span>' + piccolo('Già incassati: ' + euro(k.incasso.valore)) + '</div>' +
        '<div class="g-numero"><strong>' + intero(k.nuoviClienti.valore) + '</strong><span>' + (k.nuoviClienti.valore === 1 ? 'Cliente nuovo' : 'Clienti nuovi') + '</span>' + conConfronto(k.nuoviClienti, prima) + '</div></div>';

      var canali = Object.keys(m.canali).sort(function (a, b) { return m.canali[b] - m.canali[a]; });
      html += '<h2 class="g-sezione">Da vicino</h2><ul class="g-lista">' +
        voce('come-va-canali/' + m7, 'Da dove arrivano i clienti', canali.length ? 'Soprattutto: ' + nomeCanale(canali[0]).toLowerCase() : 'Ancora nessuna prenotazione') +
        voce('come-va-social/' + m7, 'Instagram e Facebook', mk.instagram_follower != null ? intero(mk.instagram_follower) + ' follower su Instagram' : mk.facebook_follower != null ? intero(mk.facebook_follower) + ' follower su Facebook' : 'Numeri in arrivo') +
        voce('come-va-google/' + m7, 'Google e chiamate', mk.google_chiamate != null ? (mk.google_chiamate === 1 ? 'Una chiamata' : intero(mk.google_chiamate) + ' chiamate') + ' da Google' : 'Numeri in arrivo') +
        voce('come-va-pubblicita/' + m7, 'Pubblicità', k.spesa.valore != null ? 'Spesi ' + euro(Math.round(k.spesa.valore * 100)) : 'Numeri in arrivo') +
        voce('come-va-anno/' + m7, 'Mese per mese', 'Gli ultimi 12 mesi') + '</ul>';

      html += '<h2 class="g-sezione">Altri numeri di ' + e(nome) + '</h2><dl class="g-dati">' +
        dato('Clienti che tornano', m.clienti ? 'Su ' + m.clienti + (m.clienti === 1 ? ' cliente' : ' clienti') + ' del mese, ' +
          (m.ritorni === 0 ? 'nessuno era già venuto' : m.ritorni === 1 ? 'uno era già venuto' : m.ritorni + ' erano già venuti') : 'Nessun cliente questo mese') +
        dato('Arrivati in sede', intero(k.arrivati.valore) + (k.nonVenuti.valore ? ' · non venuti: ' + k.nonVenuti.valore : ''));
      if (corrente) {
        var a = d.adesso, n = d.numeri;
        html += dato('Persone diverse venute', intero(a.persone)) +
          dato(/ e /.test(a.giorniPiuRichiesti) ? 'Giorni più richiesti' : 'Giorno più richiesto', a.giorniPiuRichiesti || 'Ancora presto per dirlo') +
          dato('Questa settimana', n.settimana + (n.settimana === 1 ? ' prenotazione' : ' prenotazioni') + ' · la settimana scorsa ' + n.settimanaPrima) +
          dato('Posti occupati oggi', n.occupate + ' su ' + n.postazioni) +
          dato('Da incassare', n.daIncassareN ? euro(n.daIncassare) + ' · ' + (n.daIncassareN === 1 ? 'una prenotazione' : n.daIncassareN + ' prenotazioni') : 'Niente: hanno pagato tutti');
      }
      html += '</dl>';
      if (d.note) html += '<h2 class="g-sezione">Cosa abbiamo fatto questo mese</h2><p class="g-testo g-righe">' + e(d.note) + '</p>';
      if (d.aggiornato) html += '<p class="g-nota">Numeri di social, Google e pubblicità aggiornati da Apex Media il ' + e(giornoBreve(d.aggiornato)) + '.</p>';
      vista.innerHTML = html + pulsanteNumeri(d);
    });
  } };

  /* le schermate "da vicino": stessi dati, un argomento alla volta */
  function daVicino(corpo) {
    return function (mese) {
      return leggi('come-va', { mese: mese }).then(function (d) {
        vista.innerHTML = '<p class="g-data">' + e(meseLungo(d.mese.slice(0, 7))) + '</p>' + corpo(d, d.mesi[d.mesi.length - 1], d.marketing || {}) + pulsanteNumeri(d);
      });
    };
  }

  SCHERMATE['come-va-canali'] = { titolo: 'Come va', interna: 'come-va', disegna: daVicino(function (d, m, mk) {
    var perValore = function (a, b) { return b.valore - a.valore; };
    var delMese = Object.keys(m.canali).map(function (c) { return { nome: nomeCanale(c), valore: m.canali[c] }; }).sort(perValore);
    var anno = {};
    d.mesi.forEach(function (x) { Object.keys(x.canali).forEach(function (c) { anno[c] = (anno[c] || 0) + x.canali[c]; }); });
    var dellAnno = Object.keys(anno).map(function (c) { return { nome: nomeCanale(c), valore: anno[c] }; }).sort(perValore);
    var social = mk.instagram_copertura != null || mk.facebook_copertura != null ? (mk.instagram_copertura || 0) + (mk.facebook_copertura || 0) : null;
    var passi = [['Hanno visto i social', social], ['Sono andati sul sito', mk.visite_sito != null ? mk.visite_sito : null], ['Hanno chiesto un posto', m.prenotazioni], ['Sono arrivati in sede', m.presenti]];
    return '<h2 class="g-titolo">Da dove arrivano i clienti</h2><p class="g-testo">Le prenotazioni di ' + e(d.nomeMese) + ', divise per come la persona è arrivata.</p>' +
      (delMese.length ? quote(delMese) : '<p class="g-vuoto">Ancora nessuna prenotazione questo mese.</p>') +
      '<h2 class="g-sezione">Negli ultimi 12 mesi</h2>' + (dellAnno.length ? quote(dellAnno) : '<p class="g-vuoto">Ancora nessuna prenotazione.</p>') +
      '<h2 class="g-sezione">Il percorso di ' + e(d.nomeMese) + '</h2><dl class="g-dati">' +
      passi.map(function (x) { return dato(x[0], x[1] == null ? 'Numero in arrivo' : intero(x[1])); }).join('') + '</dl>';
  }) };

  SCHERMATE['come-va-social'] = { titolo: 'Come va', interna: 'come-va', disegna: daVicino(function (d, m, mk) {
    var html = '<h2 class="g-titolo">Instagram e Facebook</h2>';
    var ig = mk.instagram_follower != null || mk.instagram_copertura != null, fb = mk.facebook_follower != null || mk.facebook_copertura != null;
    if (!ig && !fb) html += inArrivo();
    html += '<h2 class="g-sezione">Instagram</h2><dl class="g-dati">' +
      (mk.instagram_follower != null ? dato('Follower', numeroCon(d, 'instagram_follower', true)) : '') +
      (mk.instagram_copertura != null ? dato('Persone raggiunte', numeroCon(d, 'instagram_copertura')) : '') +
      dato('Prenotazioni arrivate da Instagram', intero(m.canali.Instagram || 0)) + '</dl>';
    html += '<h2 class="g-sezione">Facebook</h2><dl class="g-dati">' +
      (mk.facebook_follower != null ? dato('Follower', numeroCon(d, 'facebook_follower', true)) : '') +
      (mk.facebook_copertura != null ? dato('Persone raggiunte', numeroCon(d, 'facebook_copertura')) : '') +
      dato('Prenotazioni arrivate da Facebook', intero(m.canali.Facebook || 0)) + '</dl>';
    var sIg = serie(d, 'instagram_follower'), sFb = serie(d, 'facebook_follower');
    if (sIg.length > 1) html += '<h2 class="g-sezione">Follower su Instagram, mese per mese</h2>' + quote(sIg);
    if (sFb.length > 1) html += '<h2 class="g-sezione">Follower su Facebook, mese per mese</h2>' + quote(sFb);
    return html;
  }) };

  SCHERMATE['come-va-google'] = { titolo: 'Come va', interna: 'come-va', disegna: daVicino(function (d, m, mk) {
    var voci = [['google_chiamate', 'Chiamate'], ['google_indicazioni', 'Richieste di indicazioni stradali'], ['google_clic_sito', 'Clic sul sito'],
      ['google_visualizzazioni', 'Hanno visto la scheda su Google'], ['visite_sito', 'Visite al sito'], ['contatti_whatsapp', 'Chat su WhatsApp']];
    var presenti = voci.filter(function (v) { return mk[v[0]] != null; });
    var html = '<h2 class="g-titolo">Google e chiamate</h2>';
    if (!presenti.length && mk.recensioni_media == null && mk.recensioni_numero == null) html += inArrivo();
    html += '<dl class="g-dati">' + presenti.map(function (v) { return dato(v[1], numeroCon(d, v[0])); }).join('');
    if (mk.recensioni_media != null || mk.recensioni_numero != null) {
      html += dato('Recensioni', (mk.recensioni_media != null ? virgola(mk.recensioni_media) + ' su 5' : '') +
        (mk.recensioni_media != null && mk.recensioni_numero != null ? ' · ' : '') + (mk.recensioni_numero != null ? intero(mk.recensioni_numero) + ' in tutto' : ''));
    }
    html += dato('Prenotazioni arrivate da Google', intero((m.canali.Google || 0) + (m.canali['Google Maps'] || 0) + (m.canali['Google Ads'] || 0))) + '</dl>';
    var sChiamate = serie(d, 'google_chiamate');
    if (sChiamate.length > 1) html += '<h2 class="g-sezione">Chiamate, mese per mese</h2>' + quote(sChiamate);
    return html;
  }) };

  SCHERMATE['come-va-pubblicita'] = { titolo: 'Come va', interna: 'come-va', disegna: daVicino(function (d, m, mk) {
    var k = d.kpi, html = '<h2 class="g-titolo">Pubblicità</h2>';
    if (k.spesa.valore == null) return html + inArrivo();
    var pezzi = [];
    if (mk.spesa_meta != null) pezzi.push('Instagram e Facebook ' + euro(Math.round(mk.spesa_meta * 100)));
    if (mk.spesa_google != null) pezzi.push('Google ' + euro(Math.round(mk.spesa_google * 100)));
    html += '<div class="g-numeri"><div class="g-numero"><strong>' + euro(Math.round(k.spesa.valore * 100)) + '</strong><span>Spesi ' + e(aMese(d.nomeMese)) + '</span>' + piccolo(pezzi.join(' · ')) + '</div>';
    if (k.ritornoPubblicita.valore != null) {
      html += '<div class="g-numero"><strong>' + euro(Math.round(k.ritornoPubblicita.valore * 100)) + '</strong><span>Di prenotazioni per ogni euro speso</span>' +
        piccolo(k.prenotazioniDaPubblicita.valore === 1 ? 'Una prenotazione arrivata dalla pubblicità' : k.prenotazioniDaPubblicita.valore + ' prenotazioni arrivate dalla pubblicità') + '</div>';
    }
    if (k.costoPrenotazione.valore != null) html += '<div class="g-numero"><strong>' + euro(k.costoPrenotazione.valore) + '</strong><span>Spesa per ogni prenotazione del mese</span></div>';
    return html + '</div><p class="g-nota">Contano come arrivate dalla pubblicità le prenotazioni fatte da chi è passato da Instagram, Facebook o da un annuncio su Google.</p>';
  }) };

  SCHERMATE['come-va-anno'] = { titolo: 'Come va', interna: 'come-va', disegna: daVicino(function (d) {
    var mesi = d.mesi.slice().reverse(), nomeDi = function (x) { return meseLungo(x.mese.slice(0, 7)); };
    var html = '<h2 class="g-titolo">Mese per mese</h2><h2 class="g-sezione">Prenotazioni</h2>' +
      quote(mesi.map(function (x) { return { nome: nomeDi(x), valore: x.prenotazioni }; })) +
      '<h2 class="g-sezione">Valore delle prenotazioni</h2>' + quote(mesi.map(function (x) { return { nome: nomeDi(x), valore: x.valore }; }), euro);
    if (mesi.some(function (x) { return x.incassato > 0; })) html += '<h2 class="g-sezione">Incassato</h2>' + quote(mesi.map(function (x) { return { nome: nomeDi(x), valore: x.incassato }; }), euro);
    return html;
  }) };

  /* ---------- i numeri del mese: li scrive Apex Media ---------- */
  var GRUPPI_NUMERI = [
    { titolo: 'Instagram', campi: ['instagram_follower', 'instagram_copertura'], aiuto: 'App Instagram → Dashboard professionale → Account raggiunti (ultimi 30 giorni).' },
    { titolo: 'Facebook', campi: ['facebook_follower', 'facebook_copertura'], aiuto: 'Meta Business Suite → Insight → Copertura.' },
    { titolo: 'Google', campi: ['google_visualizzazioni', 'google_chiamate', 'google_indicazioni', 'google_clic_sito', 'recensioni_numero', 'recensioni_media'], aiuto: 'Profilo dell’attività su Google → Rendimento, mese scelto. Recensioni: totale e voto medio di oggi.' },
    { titolo: 'Sito e WhatsApp', campi: ['visite_sito', 'contatti_whatsapp'], aiuto: 'Visite: Google Analytics → Utenti del mese. WhatsApp: chat nuove arrivate dal sito.' },
    { titolo: 'Pubblicità', campi: ['spesa_meta', 'spesa_google'], aiuto: 'Quanto è stato speso nel mese, IVA inclusa (in euro).' }
  ];
  SCHERMATE['numeri-mese'] = { titolo: 'Numeri del mese', interna: 'come-va', disegna: function (mese) {
    return leggi('come-va', { mese: mese }).then(function (d) {
      if (RUOLO !== 'apex') { vista.innerHTML = '<p class="g-vuoto">Questi numeri li aggiorna Apex Media.</p>'; return; }
      var mk = d.marketing || {}, pr = mesePrimaDi(d), nomi = {}, m7 = d.mese.slice(0, 7);
      d.campi.forEach(function (c) { nomi[c.id] = c; });
      var haPrima = Object.keys(pr).length > 0;
      vista.innerHTML = '<h2 class="g-titolo">Numeri di ' + e(meseLungo(m7)) + '</h2><p class="g-testo">Social, Google e pubblicità. Un campo lasciato vuoto resta “in arrivo”.</p>' +
        '<form class="g-modulo" data-numeri novalidate>' +
        (haPrima ? '<button class="g-btn g-btn-chiaro" type="button" data-riprendi>Riprendi i numeri di ' + e(d.nomeMesePrima) + '</button>' : '') +
        GRUPPI_NUMERI.map(function (g) {
          return '<div class="g-gruppo" role="group" aria-label="' + e(g.titolo) + '"><h3>' + e(g.titolo) + '</h3><p class="g-nota">' + e(g.aiuto) + '</p>' + g.campi.map(function (id) {
            var c = nomi[id];
            return '<label class="g-campo"><span>' + e(c.nome) + '</span><input name="' + id + '" inputmode="' + (c.dec ? 'decimal' : 'numeric') + '" autocomplete="off" value="' + e(mk[id] == null ? '' : virgola(mk[id])) + '">' +
              '<small>' + (pr[id] != null ? e(maiuscola(d.nomeMesePrima)) + ': ' + e(virgola(pr[id])) : 'Nessun numero il mese prima') + '</small></label>';
          }).join('') + '</div>';
        }).join('') +
        '<label class="g-campo"><span>Cosa abbiamo fatto questo mese</span><textarea name="note" maxlength="1000">' + e(d.note || '') + '</textarea></label>' +
        '<p class="g-errore" data-errore role="alert" hidden></p><button class="g-btn g-btn-primario" type="submit">Salva i numeri</button></form>';
      var f = $('[data-numeri]', vista), err = $('[data-errore]', f), riprendi = $('[data-riprendi]', f);
      if (riprendi) riprendi.addEventListener('click', function () {
        d.campi.forEach(function (c) { if (pr[c.id] != null && !f[c.id].value) f[c.id].value = virgola(pr[c.id]); });
        mostraFatto('Numeri ripresi: correggi quelli cambiati.');
      });
      f.addEventListener('submit', function (ev) {
        ev.preventDefault();
        err.hidden = true;
        var dati = {}, b = $('button[type=submit]', f);
        d.campi.forEach(function (c) { dati[c.id] = f[c.id].value; });
        b.disabled = true;
        chiama('numeri-mese', { mese: m7, dati: dati, note: f.note.value }).then(function () {
          mostraFatto('Numeri di ' + d.nomeMese + ' salvati.');
          vai('come-va/' + m7);
        }, function (x) { b.disabled = false; err.textContent = x.message; err.hidden = false; err.scrollIntoView(false); });
      });
    });
  } };

  /* ---------- Clienti ---------- */
  function voceCliente(c) {
    var sotto = c.prenotazioni === 0 ? 'Nessuna prenotazione' : (c.prenotazioni === 1 ? 'Una prenotazione' : c.prenotazioni + ' prenotazioni') + (c.ultimo ? ' · ultima volta il ' + giornoBreve(c.ultimo) : '');
    return '<li><a class="g-voce" href="#cliente/' + c.id + '"><span><strong>' + e(c.nome) + '</strong><small>' + e(sotto) + '</small>' + etichetteCliente(c) + '</span></a></li>';
  }
  function etichetteCliente(c) {
    return (c.abituale ? '<span class="g-etichetta g-etichetta-ok">Viene spesso</span>' : '') + (c.daRisentire ? '<span class="g-etichetta g-etichetta-attesa">Non si vede da un mese</span>' : '');
  }
  SCHERMATE.clienti = { titolo: 'Clienti', interna: 'profilo', disegna: function () {
    return leggi('clienti').then(function (d) {
      var elenco = function (lista, cerca) {
        return lista.length ? '<ul class="g-lista">' + lista.map(voceCliente).join('') + '</ul>' : '<p class="g-vuoto">' + (cerca ? 'Nessun cliente con questo nome o numero.' : 'Ancora nessun cliente.') + '</p>';
      };
      vista.innerHTML = '<label class="g-campo"><span>Cerca per nome o telefono</span><input type="search" name="cerca" autocomplete="off" enterkeyhint="search" data-cerca></label>' +
        '<p class="g-nota" data-quanti>' + (d.clienti.length === 1 ? 'Un cliente' : d.clienti.length + ' clienti') + '</p><div class="g-largo-su" style="margin-top:16px" data-elenco>' + elenco(d.clienti, '') + '</div>';
      var campo = $('[data-cerca]', vista), zona = $('[data-elenco]', vista), quanti = $('[data-quanti]', vista), timer = null, ultima = 0;
      campo.addEventListener('input', function () {
        clearTimeout(timer);
        timer = setTimeout(function () {
          var mia = ++ultima, testo = campo.value.trim();
          leggi('clienti', { cerca: testo }).then(function (r) {
            if (mia !== ultima || !document.body.contains(zona)) return;
            zona.innerHTML = elenco(r.clienti, testo);
            quanti.textContent = r.clienti.length === 1 ? 'Un cliente' : r.clienti.length + ' clienti';
          }, function () { /* si riprova al prossimo tasto */ });
        }, 300);
      });
    });
  } };

  SCHERMATE.cliente = { titolo: 'Cliente', interna: 'clienti', disegna: function (id) {
    return leggi('cliente', { id: id }).then(function (c) {
      var card = c.timbri + (c.timbri === 1 ? ' timbro' : ' timbri') + ' su 10' + (c.omaggi ? ' · ' + (c.omaggi === 1 ? 'una giornata in regalo da usare' : c.omaggi + ' giornate in regalo da usare') : '');
      var html = '<h2 class="g-titolo">' + e(c.nome) + '</h2>' + etichetteCliente(c) + '<div class="g-due" style="margin-top:16px">' + contatti(c) + '</div>' +
        '<dl class="g-dati"><div><dt>Telefono</dt><dd>' + e(c.telefono) + '</dd></div>' +
        (c.email ? '<div><dt>Email</dt><dd><a class="g-link" href="mailto:' + e(c.email) + '">' + e(c.email) + '</a></dd></div>' : '') +
        dato('Prenotazioni', intero(c.prenotazioni)) + dato('Ha pagato in tutto', euro(c.speso)) +
        dato('Ultima volta', c.ultimo ? giornoLungo(c.ultimo) : 'Non è ancora venuta/o') + dato('Bagnarino Card', card) +
        (c.carnet ? dato('Carnet', c.carnet === 1 ? 'Un ingresso ancora da usare' : c.carnet + ' ingressi ancora da usare') : '') +
        (c.fattura ? dato('Fattura a', c.fattura) : '') + '</dl>';
      html += '<div class="g-pulsanti"><a class="g-btn g-btn-primario" href="#nuova/c' + c.id + '">Aggiungi una sua prenotazione</a></div>';
      html += '<h2 class="g-sezione">Le sue prenotazioni</h2>' + (c.storia.length ? '<ul class="g-lista">' + c.storia.map(function (p) {
        /* qui il nome è già in cima: in evidenza va il giorno */
        return '<li><a class="g-voce" href="#prenotazione/' + p.id + '"><span><strong>' + e(maiuscola(p.quando)) + '</strong><small>' + e(p.cosa + ' · ' + p.prezzo) + '</small>' + etichettaStato(p) + '</span></a></li>';
      }).join('') + '</ul>' : '<p class="g-vuoto">Ancora nessuna.</p>');
      html += '<div class="g-pulsanti g-largo-su"><button class="g-btn g-btn-rosso" type="button" data-elimina-cliente="' + c.id + '" data-chi="' + e(c.nome) + '" data-n="' + c.storia.length + '">Elimina questo cliente</button></div>';
      vista.innerHTML = html;
    });
  } };

  /* ---------- Incassi ---------- */
  var NOMI_METODO = { contanti: 'in contanti', carta: 'con la carta', bonifico: 'con bonifico', online: 'online' };
  function titoloPeriodo(d) {
    if (d.periodo === 'giorno') return giornoLungo(d.inizio);
    if (d.periodo === 'mese') return meseLungo(d.inizio.slice(0, 7));
    return (d.inizio.slice(0, 7) === d.fine.slice(0, 7) ? String(+d.inizio.slice(8)) : giornoBreve(d.inizio)) + ' – ' + giornoBreve(d.fine);
  }
  function voceIncasso(r) {
    var stato = r.gratis ? 'Niente da pagare' : euro(r.importo) + (r.pagato ? ' · pagato ' + (NOMI_METODO[r.metodo] || '') : r.futura ? ' · paga quando arriva' : ' · da pagare');
    return '<li><a class="g-voce" href="#prenotazione/' + r.id + '"><span><strong>' + e(r.nome) + '</strong><small>' + e(giornoBreve(r.data) + ' · ' + r.cosa) + '</small><small>' + e(stato) + '</small></span></a></li>';
  }
  SCHERMATE.incassi = { titolo: 'Incassi', interna: 'profilo', disegna: function (param) {
    var pz = String(param || '').split('/');
    return leggi('incassi', { periodo: pz[0] || 'mese', da: pz[1] || '' }).then(function (d) {
      var t = d.totali, ancora = d.oggi >= d.inizio && d.oggi <= d.fine ? d.oggi : d.inizio;
      var da = d.righe.filter(function (r) { return !r.gratis && !r.pagato; }), ok = d.righe.filter(function (r) { return !r.gratis && r.pagato; }), gratis = d.righe.filter(function (r) { return r.gratis; });
      var gruppo = function (nome, lista) { return lista.length ? '<h2 class="g-sezione">' + nome + '</h2><ul class="g-lista">' + lista.map(voceIncasso).join('') + '</ul>' : ''; };
      var html = '<div class="g-tre" role="group" aria-label="Periodo">' + [['giorno', 'Giorno'], ['settimana', 'Settimana'], ['mese', 'Mese']].map(function (p) {
        return '<button class="g-btn g-btn-grigio" type="button" data-vai="incassi/' + p[0] + '/' + ancora + '" aria-pressed="' + (d.periodo === p[0]) + '">' + p[1] + '</button>';
      }).join('') + '</div>';
      html += '<div class="g-mese"><button type="button" data-vai="incassi/' + d.periodo + '/' + d.prima + '" aria-label="Prima">' + ico('prima') + '</button><h2>' + e(titoloPeriodo(d)) + '</h2>' +
        '<button type="button" data-vai="incassi/' + d.periodo + '/' + d.dopo + '" aria-label="Dopo">' + ico('dopo') + '</button></div>';
      html += '<div class="g-numeri"><div class="g-numero"><strong>' + euro(t.incassato) + '</strong><span>Incassati</span>' + piccolo('Su ' + euro(t.previsto) + ' di prenotazioni') + '</div>' +
        '<div class="g-numero"><strong>' + euro(t.daIncassare) + '</strong><span>Da incassare</span>' +
        piccolo(!d.righe.length ? '' : !t.daIncassare ? 'Hanno pagato tutti' : t.daIncassareOra ? euro(t.daIncassareOra) + ' da chiedere adesso' : 'Pagano quando arrivano') + '</div></div>';
      html += d.righe.length ? gruppo('Da incassare', da) + gruppo('Già pagate', ok) + gruppo('Senza pagamento', gratis) : '<p class="g-vuoto" style="margin-top:16px">Nessuna prenotazione in questo periodo.</p>';
      html += '<div class="g-pulsanti g-largo-su"><a class="g-btn g-btn-chiaro" href="/api/gestione?azione=elenco&amp;da=' + d.inizio + '&amp;a=' + d.fine + '" download="incassi-bagnarino-' + d.inizio + '.csv">Scarica l’elenco</a></div>' +
        '<p class="g-nota">È un file che si apre con Excel: va bene per la commercialista.</p>';
      vista.innerHTML = html;
    });
  } };

  /* ---------- come ha pagato ---------- */
  SCHERMATE.pagamento = { titolo: 'Pagamento', voce: 'prenotazioni', interna: 'prenotazioni', disegna: function (id) {
    return leggi('prenotazione', { id: id }).then(function (p) {
      if (!p.puoPagare || p.pagato) { vai('prenotazione/' + p.id); return; }
      vista.innerHTML = '<h2 class="g-titolo">' + e(p.nome) + '</h2><p class="g-testo g-iniziale">' + e(p.quando) + ' · ' + euro(p.importo) + '</p>' +
        '<h2 class="g-sezione">Come ha pagato?</h2><div class="g-scelte">' + [['contanti', 'In contanti'], ['carta', 'Con la carta'], ['bonifico', 'Con bonifico']].map(function (m) {
          return '<button class="g-btn g-btn-chiaro" type="button" data-paga="' + m[0] + '" data-id="' + p.id + '">' + m[1] + '</button>';
        }).join('') + '</div>';
    });
  } };

  /* ---------- una prenotazione aggiunta a mano ---------- */
  var NOMI_CAMPI = { nome: 'il nome', cognome: 'il cognome', telefono: 'il telefono', email: 'l’email', data: 'il giorno', pacchetto: 'cosa prenota', fascia: 'la fascia' };
  SCHERMATE.nuova = { titolo: 'Aggiungi', voce: 'prenotazioni', interna: 'prenotazioni', disegna: function (param) {
    var idCliente = /^c\d+$/.test(param) ? +param.slice(1) : 0, giorno = /^\d{4}-\d{2}-\d{2}$/.test(param) ? param : '';
    return Promise.all([leggi('coworking'), idCliente ? leggi('cliente', { id: idCliente }) : null]).then(function (v) {
      var c = v[0], cl = v[1] || {}, oggi = iso(new Date());
      var prezzoGiornata = (c.listino.filter(function (x) { return x.id === 'giornata'; })[0] || {}).prezzo;
      vista.innerHTML = '<h2 class="g-titolo">Aggiungi una prenotazione</h2><p class="g-testo">Per chi telefona o passa di persona. È già confermata: non devi rispondere.</p>' +
        '<form class="g-modulo" data-nuova novalidate>' +
        '<label class="g-campo"><span>Nome</span><input name="nome" autocomplete="off" autocapitalize="words" value="' + e(cl.nomeProprio || '') + '" required></label>' +
        '<label class="g-campo"><span>Cognome</span><input name="cognome" autocomplete="off" autocapitalize="words" value="' + e(cl.cognome || '') + '" required></label>' +
        '<label class="g-campo"><span>Telefono</span><input type="tel" name="telefono" inputmode="tel" autocomplete="off" value="' + e(cl.telefono || '') + '" required></label>' +
        '<label class="g-campo"><span>Email</span><input type="email" name="email" inputmode="email" autocomplete="off" autocapitalize="none" value="' + e(cl.email || '') + '"><small>Non è obbligatoria. Se la scrivi, riceve la conferma.</small></label>' +
        '<label class="g-campo"><span>Cosa prenota</span><select name="pacchetto">' + c.listino.map(function (p) { return '<option value="' + e(p.id) + '">' + e(p.nome) + ' · €' + p.prezzo + '</option>'; }).join('') + '</select></label>' +
        '<label class="g-campo"><span data-etichetta-giorno>Giorno</span><input type="date" name="data" min="' + oggi + '" value="' + (giorno && giorno >= oggi ? giorno : oggi) + '" required></label>' +
        '<label class="g-campo" data-campo-fascia><span>Quando</span><select name="fascia">' + ['giornata', 'mattina', 'pomeriggio'].map(function (id) {
          var f = c.fasce.filter(function (x) { return x.id === id; })[0];
          return f ? '<option value="' + id + '">' + e(f.nome) + ' · €' + (id === 'giornata' ? prezzoGiornata : c.mezza) + '</option>' : '';
        }).join('') + '</select></label>' +
        '<label class="g-campo"><span>Nota</span><input name="note" autocomplete="off"><small>Non è obbligatoria.</small></label>' +
        '<p class="g-errore" data-errore role="alert" hidden></p><button class="g-btn g-btn-primario" type="submit">Salva la prenotazione</button></form>';
      var f = $('[data-nuova]', vista), err = $('[data-errore]', f), b = $('button[type=submit]', f);
      var adatta = function () {
        var p = c.listino.filter(function (x) { return x.id === f.pacchetto.value; })[0] || {};
        $('[data-campo-fascia]', f).hidden = f.pacchetto.value !== 'giornata';
        $('[data-etichetta-giorno]', f).textContent = p.tipoData === 'inizio' ? 'Da che giorno' : 'Giorno';
      };
      f.pacchetto.addEventListener('change', adatta);
      adatta();
      f.addEventListener('submit', function (ev) {
        ev.preventDefault();
        err.hidden = true;
        var dati = { nome: f.nome.value.trim(), cognome: f.cognome.value.trim(), telefono: f.telefono.value.trim(), email: f.email.value.trim(), pacchetto: f.pacchetto.value,
          data: f.data.value, fascia: f.pacchetto.value === 'giornata' ? f.fascia.value : 'giornata', note: f.note.value.trim() };
        if (dati.nome.length < 2 || dati.cognome.length < 2 || dati.telefono.replace(/\D/g, '').length < 8 || !dati.data) {
          err.textContent = 'Servono nome, cognome, telefono e giorno.'; err.hidden = false; return;
        }
        b.disabled = true; b.textContent = 'Un attimo…';
        chiama('prenotazione-nuova', dati).then(function (r) {
          mostraFatto(r.conEmail ? 'Prenotazione salvata. È partita l’email di conferma.' : 'Prenotazione salvata.');
          /* il modulo non resta nella cronologia: "Indietro" torna all'elenco */
          location.replace(location.pathname + location.search + '#prenotazione/' + r.id);
        }, function (x) {
          b.disabled = false; b.textContent = 'Salva la prenotazione';
          var campi = x.dati && x.dati.campi;
          err.textContent = campi && campi.length ? 'Controlla ' + campi.map(function (k) { return NOMI_CAMPI[k] || k; }).join(', ') + '.' : x.message;
          err.hidden = false;
        });
      });
    });
  } };

  /* ---------- prezzi, posti, messaggi di WhatsApp ---------- */
  function salvaCoworking(dati, messaggio, bottone, err) {
    err.hidden = true;
    bottone.disabled = true;
    return chiama('coworking', dati).then(function () { mostraFatto(messaggio); vai('impostazioni'); },
      function (x) { bottone.disabled = false; err.textContent = x.message; err.hidden = false; });
  }
  SCHERMATE['imp-prezzi'] = { titolo: 'Prezzi', interna: 'impostazioni', disegna: function () {
    return leggi('coworking').then(function (c) {
      vista.innerHTML = '<h2 class="g-titolo">Prezzi</h2><p class="g-testo">In euro, senza centesimi. I prezzi nuovi si vedono sul sito entro un minuto e valgono per le prossime richieste.</p>' +
        '<form class="g-modulo" data-prezzi novalidate>' + c.listino.map(function (p) {
          return '<label class="g-campo"><span>' + e(p.nome) + '</span><input type="number" inputmode="numeric" min="1" max="5000" step="1" name="p-' + e(p.id) + '" value="' + p.prezzo + '" required><small>' + e(maiuscola(p.unita)) + '</small></label>' +
            (p.id === 'giornata' ? '<label class="g-campo"><span>Mezza giornata</span><input type="number" inputmode="numeric" min="1" max="5000" step="1" name="mezza" value="' + c.mezza + '" required><small>Mattina oppure pomeriggio</small></label>' : '');
        }).join('') + '<p class="g-errore" data-errore role="alert" hidden></p><button class="g-btn g-btn-primario" type="submit">Salva i prezzi</button></form>';
      var f = $('[data-prezzi]', vista);
      f.addEventListener('submit', function (ev) {
        ev.preventDefault();
        var cambiati = c.listino.filter(function (p) { return String(f['p-' + p.id].value) !== String(p.prezzo); }).length + (String(f.mezza.value) !== String(c.mezza) ? 1 : 0);
        if (!cambiati) { vai('impostazioni'); return; }
        chiedi('Cambio i prezzi?', 'Sul sito si vedranno i prezzi nuovi. Le prenotazioni già fatte restano al prezzo di prima.', 'Sì, salva').then(function (si) {
          if (!si) return;
          salvaCoworking({ listino: c.listino.map(function (p) { return { id: p.id, prezzo: f['p-' + p.id].value }; }), mezza: f.mezza.value },
            'Prezzi salvati. Sul sito si vedono entro un minuto.', $('button[type=submit]', f), $('[data-errore]', f));
        });
      });
    });
  } };

  SCHERMATE['imp-posti'] = { titolo: 'Posti', interna: 'impostazioni', disegna: function () {
    return leggi('coworking').then(function (c) {
      var n = c.postazioni;
      vista.innerHTML = '<h2 class="g-titolo">Quanti posti ci sono</h2><p class="g-testo">Sono le scrivanie che si possono prenotare nello stesso momento. Quando sono tutte occupate, sul sito quel momento risulta non disponibile.</p>' +
        '<div class="g-conta"><button class="g-btn g-btn-chiaro" type="button" data-meno aria-label="Un posto in meno">−</button><strong data-posti aria-live="polite">' + n + '</strong>' +
        '<button class="g-btn g-btn-chiaro" type="button" data-piu aria-label="Un posto in più">+</button></div>' +
        '<p class="g-errore" data-errore role="alert" hidden></p><div class="g-pulsanti"><button class="g-btn g-btn-primario" type="button" data-salva-posti>Salva</button></div>';
      var scrivi = function () { $('[data-posti]', vista).textContent = n; };
      $('[data-meno]', vista).addEventListener('click', function () { n = Math.max(1, n - 1); scrivi(); });
      $('[data-piu]', vista).addEventListener('click', function () { n = Math.min(60, n + 1); scrivi(); });
      $('[data-salva-posti]', vista).addEventListener('click', function () {
        var b = this;
        if (n === c.postazioni) { vai('impostazioni'); return; }
        chiedi(n === 1 ? 'Un posto solo?' : 'I posti diventano ' + n + '?', 'Prima erano ' + c.postazioni + '. Le prenotazioni già fatte restano valide.', 'Sì, salva').then(function (si) {
          if (si) salvaCoworking({ postazioni: n }, n === 1 ? 'Adesso c’è un posto.' : 'Adesso i posti sono ' + n + '.', b, $('[data-errore]', vista));
        });
      });
    });
  } };

  SCHERMATE['imp-messaggi'] = { titolo: 'Messaggi', interna: 'impostazioni', disegna: function () {
    return leggi('coworking').then(function (c) {
      vista.innerHTML = '<h2 class="g-titolo">Messaggi di WhatsApp</h2><p class="g-testo">Sono le frasi già scritte che una persona ti manda quando tocca un pulsante WhatsApp sul sito. Le parole tra parentesi graffe, come {giorno}, le riempie il sito: lasciale come sono.</p>' +
        '<form class="g-modulo" data-messaggi novalidate>' + c.messaggi.map(function (m) {
          return '<label class="g-campo"><span>' + e(m.nome) + '</span><textarea name="m-' + e(m.id) + '" maxlength="600">' + e(m.testo) + '</textarea></label>';
        }).join('') + '<p class="g-errore" data-errore role="alert" hidden></p><button class="g-btn g-btn-primario" type="submit">Salva i messaggi</button></form>';
      var f = $('[data-messaggi]', vista);
      f.addEventListener('submit', function (ev) {
        ev.preventDefault();
        var messaggi = {};
        c.messaggi.forEach(function (m) { messaggi[m.id] = f['m-' + m.id].value; });
        salvaCoworking({ messaggi: messaggi }, 'Messaggi salvati.', $('button[type=submit]', f), $('[data-errore]', f));
      });
    });
  } };

  /* =============================================================
     Gesti comuni (un solo ascoltatore per tutta l'app)
     ============================================================= */
  vista.addEventListener('click', function (ev) {
    var b;
    if ((b = ev.target.closest('[data-vai]'))) { vai(b.getAttribute('data-vai')); return; }
    if ((b = ev.target.closest('[data-rispondi]'))) { rispondi(b); return; }

    if ((b = ev.target.closest('[data-arrivo]'))) {
      b.disabled = true;
      chiama('arrivo', { id: +b.getAttribute('data-arrivo'), arrivato: true }).then(function (r) {
        mostraFatto(r.premio ? 'Decimo timbro: la prossima giornata è in regalo.'
          : r.premioSbloccato ? 'Timbro aggiunto. Premio da consegnare: ' + r.premioSbloccato.toLowerCase() + '.'
          : r.timbro ? 'Timbro aggiunto sulla Bagnarino Card.' : '');
        ridisegna();
      }, function (x) { b.disabled = false; mostraErrore(x.message); });
      return;
    }
    if ((b = ev.target.closest('[data-non-arrivo]'))) {
      chiama('arrivo', { id: +b.getAttribute('data-non-arrivo'), arrivato: false }).then(function () { mostraFatto(); ridisegna(); }, function (x) { mostraErrore(x.message); });
      return;
    }
    if ((b = ev.target.closest('[data-annulla-prenotazione]'))) {
      var idA = +b.getAttribute('data-annulla-prenotazione'), chi = b.getAttribute('data-chi');
      chiedi('Annullo la prenotazione di ' + chi + '?', 'Riceve un messaggio di scuse con il link per scegliere un altro momento.', 'Sì, annulla', 'g-btn-rosso').then(function (si) {
        if (!si) return;
        chiama('annulla', { id: idA }).then(function () { mostraFatto(chi + ' riceve il messaggio di scuse.'); vai('prenotazioni'); }, function (x) { mostraErrore(x.message); });
      });
      return;
    }
    if ((b = ev.target.closest('[data-paga]'))) {
      var idP = +b.getAttribute('data-id');
      $$('[data-paga]', vista).forEach(function (x) { x.disabled = true; });
      chiama('pagato', { id: idP, pagato: true, metodo: b.getAttribute('data-paga') }).then(function () {
        mostraFatto('Pagamento segnato.');
        location.replace(location.pathname + location.search + '#prenotazione/' + idP);
      }, function (x) { ridisegna().then(function () { mostraErrore(x.message); }); });
      return;
    }
    if ((b = ev.target.closest('[data-non-pagato]'))) {
      chiama('pagato', { id: +b.getAttribute('data-non-pagato'), pagato: false }).then(function () { mostraFatto(); ridisegna(); }, function (x) { mostraErrore(x.message); });
      return;
    }
    if ((b = ev.target.closest('[data-elimina-cliente]'))) {
      var idC = +b.getAttribute('data-elimina-cliente'), nomeC = b.getAttribute('data-chi'), quante = +b.getAttribute('data-n');
      chiedi('Elimino ' + nomeC + '?', (quante ? 'Spariscono anche ' + (quante === 1 ? 'la sua prenotazione' : 'le sue ' + quante + ' prenotazioni') + ', i timbri e il carnet. ' : '') + 'Non si può tornare indietro.', 'Sì, elimina', 'g-btn-rosso').then(function (si) {
        if (!si) return;
        chiama('cliente-elimina', { id: idC }).then(function () { mostraFatto(nomeC + ' non è più tra i clienti.'); location.replace(location.pathname + location.search + '#clienti'); }, function (x) { mostraErrore(x.message); });
      });
      return;
    }
    if ((b = ev.target.closest('[data-chiudi-oggi]'))) {
      var oggi = b.getAttribute('data-chiudi-oggi');
      chiedi('Sicura?', 'Le persone non potranno prenotare oggi.', 'Sì, oggi sono chiusa').then(function (si) {
        if (!si) return;
        chiudiGiorni(oggi, oggi, 'giorno', 'oggi', 'Oggi sei chiusa.').catch(function (x) { mostraErrore(x.message); });
      });
      return;
    }
    if ((b = ev.target.closest('[data-riapri-oggi]'))) {
      var g = b.getAttribute('data-riapri-oggi');
      chiudiGiorni(g, g, 'aperto', 'oggi', 'Oggi sei aperta.').catch(function (x) { mostraErrore(x.message); });
      return;
    }
    if ((b = ev.target.closest('[data-chiusura]'))) {
      var valore = b.getAttribute('data-chiusura'), data = b.getAttribute('data-data');
      if (b.getAttribute('aria-pressed') === 'true') return;
      $$('[data-chiusura]', vista).forEach(function (x) { x.disabled = true; });
      chiudiGiorni(data, data, valore, 'giorno/' + data, valore === 'aperto' ? 'Giorno riaperto.' : PAROLE_CHIUSURA[valore] + '.')
        .catch(function (x) { ridisegna().then(function () { mostraErrore(x.message); }); });
      return;
    }
  });

  /* =============================================================
     Navigazione: quattro voci in basso, "Indietro" nelle schermate interne
     ============================================================= */
  var storia = [];
  function rotta() {
    var h = location.hash.replace(/^#/, '') || 'oggi', i = h.indexOf('/');
    var nome = i === -1 ? h : h.slice(0, i), parametro = i === -1 ? '' : h.slice(i + 1);
    return SCHERMATE[nome] ? { nome: nome, parametro: parametro, chiave: h } : { nome: 'oggi', parametro: '', chiave: 'oggi' };
  }
  function imposta(testo, interna) {
    titolo.textContent = testo;
    indietro.hidden = !interna;
    marchio.hidden = !!interna;
    document.title = testo + ' · Bagnarino';
  }
  function vai(dove) {
    if (location.hash.slice(1) === dove) ridisegna(); else location.hash = dove;
  }
  var giro = 0;
  function ridisegna() {
    var r = rotta(), s = SCHERMATE[r.nome], mio = ++giro;
    imposta(s.titolo, !!s.interna);
    $$('.g-barra a').forEach(function (a) {
      if (a.getAttribute('data-voce') === s.voce) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    return s.disegna(r.parametro).then(function () {
      if (mio !== giro) return;
    }, function (x) {
      if (mio !== giro || x.message === 'accesso') return;
      vista.innerHTML = '<p class="g-errore" role="alert">' + e(x.message) + '</p><div class="g-pulsanti"><button class="g-btn g-btn-primario" type="button" data-vai="' + e(r.chiave) + '">Riprova</button></div>';
    });
  }
  window.addEventListener('hashchange', function () {
    var r = rotta();
    if (storia[storia.length - 2] === r.chiave) storia.pop(); else if (storia[storia.length - 1] !== r.chiave) storia.push(r.chiave);
    concludi();
    vista.innerHTML = '<p class="g-attesa">Un attimo…</p>';
    window.scrollTo(0, 0);
    ridisegna().then(function () { vista.focus({ preventScroll: true }); });
  });
  indietro.addEventListener('click', function () {
    var s = SCHERMATE[rotta().nome];
    /* se si è arrivati qui toccando dentro l'app si torna alla schermata di prima, altrimenti a quella "sopra" */
    if (storia.length > 1) history.back(); else location.hash = s.interna || 'oggi';
  });
  /* tornando sull'app dopo un po' (o dopo aver risposto da un'email) i dati si aggiornano da soli */
  var nascostaDa = 0;
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { nascostaDa = Date.now(); return; }
    var s = SCHERMATE[rotta().nome];
    if (nascostaDa && Date.now() - nascostaDa > 20000 && !s.interna && !inSospeso && !domanda.open) ridisegna();
  });

  /* arrivo da una notifica o dal pulsante di un'email: /gestione?richiesta=12 */
  var richiesta = new URLSearchParams(location.search).get('richiesta');
  if (richiesta && /^\d+$/.test(richiesta)) history.replaceState(null, '', '/gestione#prenotazione/' + richiesta);
  storia.push(rotta().chiave);
  ridisegna();
  rinfrescaNotifiche();
})();
