/* =============================================================
   BAGNARINO — app di gestione della titolare (/gestione)
   Un solo file, senza librerie. Le pagine arrivano dal server
   (api/_gestione-pagine.js) solo dopo l'accesso; qui ci sono le
   schermate e i gesti. C'è tutto in un posto solo: richieste,
   calendario, "Come va" (previsione, clienti, social, Google,
   pubblicità, i grafici dell'ultimo anno), clienti, incassi, sito,
   prezzi. In basso: Oggi, Calendario, Prenotazioni, Come va; il
   resto dal pulsante in alto a destra.
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
      html += cruscottoHtml(d);

      html += '<h2 class="g-sezione">Richieste da confermare</h2>';
      html += d.inAttesa.length ? '<ul class="g-lista">' + d.inAttesa.map(schedaRichiesta).join('') + '</ul>' : '<p class="g-vuoto">Nessuna richiesta in attesa.</p>';

      html += '<h2 class="g-sezione">Chi arriva oggi</h2>';
      html += d.arrivi.length ? '<ul class="g-lista">' + d.arrivi.map(function (p) {
        var arrivata = p.stato === 'presente';
        return '<li class="g-scheda"><a class="g-nome g-link" href="#prenotazione/' + p.id + '">' + e(p.nome) + '</a><p class="g-quando">' + e(p.cosa) + '</p>' +
          (p.mensile ? '' : arrivata
            ? '<p class="g-inviata"><span class="g-etichetta g-etichetta-ok">È arrivata/o</span>' + (p.importo > 0 && p.pagato ? ' <span class="g-etichetta g-etichetta-ok">Pagato</span>' : '') + '</p>' +
              /* dopo l'arrivo, il passo che resta: il pagamento */
              (p.importo > 0 && !p.pagato ? '<div class="g-pulsanti"><a class="g-btn g-btn-chiaro" href="#pagamento/' + p.id + '">Ha pagato ' + euro(p.importo) + '</a></div>' : '')
            : '<div class="g-pulsanti"><button class="g-btn g-btn-chiaro" type="button" data-arrivo="' + p.id + '" data-chi="' + e(p.nome) + '">È arrivata/o</button></div>') + '</li>';
      }).join('') + '</ul>' : '<p class="g-vuoto">' + (d.chiusura === 'giorno' ? 'Oggi sei chiusa.' : 'Oggi non arriva nessuno.') + '</p>';

      if (d.arriviDomani && d.arriviDomani.length) {
        html += '<h2 class="g-sezione">Chi arriva domani</h2><ul class="g-lista">' + d.arriviDomani.map(function (p) {
          return '<li><a class="g-voce" href="#prenotazione/' + p.id + '"><span><strong>' + e(p.nome) + '</strong><small>' + e(p.cosa) + '</small></span></a></li>';
        }).join('') + '</ul>';
      }

      html += '<div class="g-pulsanti g-largo-su"><a class="g-btn g-btn-chiaro" href="#nuova">Aggiungi una prenotazione</a></div>';
      html += '<div class="g-largo-su">';
      if (d.chiusura === 'giorno') html += '<p class="g-stato g-stato-chiuso">Oggi sei chiusa: sul sito non si può prenotare per oggi.</p><div class="g-pulsanti"><button class="g-btn g-btn-chiaro" type="button" data-riapri-oggi="' + d.oggi + '">Riapri oggi</button></div>';
      else html += '<button class="g-btn g-btn-grigio" type="button" data-chiudi-oggi="' + d.oggi + '">Oggi sono chiusa</button>';
      html += '</div>';
      html += andamentoHtml(d);
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
      if (d.posti && d.posti.length && d.chiusura !== 'giorno') {
        var chiC = function (x) { return x ? '<a class="g-link" href="#prenotazione/' + x.id + '">' + e(x.nome) + '</a>' : 'libera'; };
        var occupate = d.posti.filter(function (x) { return x.mattina || x.pomeriggio; }).length;
        html += '<h2 class="g-sezione">Le scrivanie</h2><p class="g-nota g-sotto-sezione">' + (occupate === 0 ? 'Tutte libere.' : occupate + ' su ' + d.posti.length + ' con qualcuno.') + '</p><ul class="g-lista" data-scrivanie>' + d.posti.map(function (x) {
          var intera = x.mattina && x.pomeriggio && x.mattina.id === x.pomeriggio.id;
          return '<li class="g-scheda' + (x.mattina || x.pomeriggio ? '' : ' g-scheda-libera') + '"><p class="g-nome">' + e(x.nome) + '</p><p class="g-quando">' +
            (intera ? chiC(x.mattina) + ' · tutto il giorno' : !x.mattina && !x.pomeriggio ? 'Libera tutto il giorno' : 'Mattina: ' + chiC(x.mattina) + ' · pomeriggio: ' + chiC(x.pomeriggio)) + '</p></li>';
        }).join('') + '</ul>';
      }
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
      /* i tre passi di ogni prenotazione: confermata, arrivata, pagata */
      if (p.stato !== 'in_attesa' && p.stato !== 'annullata') {
        var passoArrivo = p.mensile ? ['fatto', 'Abbonamento'] : p.stato === 'presente' ? ['fatto', '2. È arrivata/o'] : p.stato === 'assente' ? ['no', '2. Non è venuta/o'] : ['', '2. Arrivo da segnare'];
        var passoPagato = !p.importo ? ['fatto', 'Niente da pagare'] : p.pagato ? ['fatto', '3. Pagato'] : ['', '3. Da pagare'];
        html += '<ol class="g-tre-passi" aria-label="A che punto è"><li class="fatto">1. Confermata</li><li class="' + passoArrivo[0] + '">' + passoArrivo[1] + '</li><li class="' + passoPagato[0] + '">' + passoPagato[1] + '</li></ol>';
      }
      html += '<dl class="g-dati"><div><dt>Quando</dt><dd class="g-iniziale">' + e(p.quando) + '</dd></div>' +
        '<div><dt>Cosa</dt><dd>' + e(p.cosa) + ' · ' + e(p.prezzo) + '</dd></div>' +
        '<div><dt>Telefono</dt><dd>' + e(p.telefono) + '</dd></div>' +
        (p.email ? '<div><dt>Email</dt><dd><a class="g-link" href="mailto:' + e(p.email) + '">' + e(p.email) + '</a></dd></div>' : '') +
        (p.nota ? '<div><dt>Nota del cliente</dt><dd>' + e(p.nota) + '</dd></div>' : '') +
        (p.posto && p.stato !== 'annullata' ? dato('Posto', p.posto) : '') +
        (p.arrivaDa ? dato('Arriva da', nomeCanale(p.arrivaDa)) : '') +
        dato('Bagnarino Card', p.timbri + (p.timbri === 1 ? ' timbro' : ' timbri') + ' su 10' + (p.omaggi ? ' · ' + (p.omaggi === 1 ? 'una giornata in regalo' : p.omaggi + ' giornate in regalo') : '')) +
        (p.fattura ? dato('Fattura a', p.fattura) : '') + dato('Codice', p.codice) +
        (p.ricevuta ? dato(p.arrivaDa === 'Aggiunta da te' ? 'Aggiunta' : 'Richiesta arrivata', 'il ' + giornoBreve(p.ricevuta.slice(0, 10)) + ' alle ' + p.ricevuta.slice(11, 16)) : '') +
        (p.quante ? dato('È cliente da', p.quante === 1 ? 'questa prenotazione: è la prima' : p.quante + ' prenotazioni in tutto') : '') + '</dl>';
      html += '<div class="g-due" style="margin-top:16px">' + contatti(p) + '</div>';
      html += '<p class="g-nota"><a class="g-link" href="#cliente/' + p.clienteId + '">Tutte le prenotazioni di ' + e(p.soloNome) + '</a></p>';
      if (p.stato === 'in_attesa') html += '<h2 class="g-sezione">La tua risposta</h2>' + pulsantiRisposta(p);
      else if (p.stato !== 'annullata') {
        if (p.puoSegnareArrivo) {
          html += '<div class="g-pulsanti g-largo-su">' + (p.stato === 'presente'
            ? '<button class="g-btn g-btn-chiaro" type="button" data-non-arrivo="' + p.id + '">Ho sbagliato: non è arrivata/o</button>'
            : p.stato === 'assente'
            ? '<button class="g-btn g-btn-chiaro" type="button" data-non-arrivo="' + p.id + '">Ho sbagliato: rimetti da segnare</button>'
            : '<button class="g-btn g-btn-verde" type="button" data-arrivo="' + p.id + '" data-chi="' + e(p.nome) + '">È arrivata/o</button>' +
              '<button class="g-btn g-btn-grigio" type="button" data-assente="' + p.id + '">Non è venuta/o</button>') + '</div>';
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
  SCHERMATE.sito = { titolo: 'Il mio sito', interna: 'profilo', disegna: function () {
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
  SCHERMATE.profilo = { titolo: 'Altro', interna: 'oggi', disegna: function () {
    vista.innerHTML = '<ul class="g-lista">' +
      voce('clienti', 'Clienti', 'Chi viene e quante volte') +
      voce('incassi', 'Incassi', 'Chi ha pagato e chi deve ancora pagare') +
      voce('sito', 'Il mio sito', 'Avviso, foto, telefono e WhatsApp') +
      voce('impostazioni', 'Impostazioni', 'Notifiche, prezzi, chiusure, password') + '</ul>';
    return Promise.resolve();
  } };

  SCHERMATE.impostazioni = { titolo: 'Impostazioni', interna: 'profilo', disegna: function () {
    return statoNotifiche().then(function (st) {
      vista.innerHTML = '<h2 class="g-sezione">Notifiche</h2>' + riquadroNotifiche(st) +
        (inApp() ? '' : '<h2 class="g-sezione">App sul telefono</h2>' +
          '<div class="g-pulsanti" style="margin-top:0"><button class="g-btn g-btn-primario" type="button" data-installa-subito data-installa-ora' + (installaSubito ? '' : ' hidden') + '>Metti l’app su questo telefono</button>' +
          '<a class="g-btn g-btn-chiaro" href="/gestione/installa">Come mettere l’app sul telefono</a></div>') +
        '<h2 class="g-sezione">Il coworking</h2><ul class="g-lista">' + voce('imp-prezzi', 'Prezzi', 'Giornata, mezza giornata, carnet, mese') +
        voce('imp-posti', 'Quanti posti ci sono', 'Le scrivanie che si possono prenotare') + voce('imp-chiusure', 'Giorni di chiusura', 'I giorni chiusi in programma') + voce('imp-messaggi', 'Messaggi di WhatsApp', 'Le frasi già scritte dei pulsanti del sito') + '</ul>' +
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
  function piccolo(testo, inSu) { return testo ? '<small' + (inSu ? ' class="g-su"' : '') + '>' + e(testo) + '</small>' : ''; }
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
  function mesePrimaDi(d) { return d.mesi.length > 1 ? (d.mesi[d.mesi.length - 2].marketing || {}) : {}; }
  /* un numero mese per mese (solo i mesi che ce l'hanno), dal più recente */
  function serie(d, campo) {
    var out = [];
    d.mesi.forEach(function (x) { if (x.marketing && x.marketing[campo] != null) out.unshift({ nome: meseLungo(x.mese.slice(0, 7)), valore: x.marketing[campo] }); });
    return out;
  }
  function pulsanteNumeri(d) {
    return RUOLO === 'apex' ? '<div class="g-pulsanti g-largo-su"><a class="g-btn g-btn-primario" href="#numeri-mese/' + d.mese.slice(0, 7) + '">Aggiorna i numeri di ' + e(d.nomeMese) + '</a></div>' : '';
  }

  /* ---------- grafici: disegnati qui in SVG, senza librerie ----------
     Larghi quanto lo schermo del telefono. Sotto ogni grafico c'è sempre
     una riga di testo con il numero che conta, per chi non legge i grafici. */
  var GW = 360, GH = 220, G_BASSO = 30, G_ALTO = 26, G_LATO = 6;
  var MESI_BREVI = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
  var COLORI_CANALI = {
    'Instagram': '#B4457E', 'Facebook': '#3B5BDB', 'Google': '#C9973B', 'Google Ads': '#8A4B06', 'Google Maps': '#0C8599',
    'WhatsApp': '#1E7A46', 'Diretto': '#1B2A3A', 'In sede / telefono': '#5B6470', 'Altro': '#9AA3AE'
  };
  function etichettaMese(m) { return MESI_BREVI[+m.slice(5, 7) - 1]; }
  function compatto(n) { return n >= 10000 ? virgola(Math.round(n / 100) / 10) + 'k' : intero(n); }
  function svgGrafico(contenuto, descrizione) {
    return '<svg class="g-grafico" viewBox="0 0 ' + GW + ' ' + GH + '" role="img" aria-label="' + e(descrizione) + '">' +
      '<line x1="0" x2="' + GW + '" y1="' + (GH - G_BASSO) + '" y2="' + (GH - G_BASSO) + '" stroke="#B9C0CA" stroke-width="2"/>' + contenuto + '</svg>';
  }
  function passoX(n) { return (GW - 2 * G_LATO) / n; }
  function centro(i, n) { return G_LATO + passoX(n) * i + passoX(n) / 2; }
  function assi(etichette) {
    return etichette.map(function (t, i) {
      return '<text x="' + centro(i, etichette.length).toFixed(1) + '" y="' + (GH - 9) + '" text-anchor="middle" font-size="13"' + (i === etichette.length - 1 ? ' class="forte"' : '') + '>' + e(t) + '</text>';
    }).join('');
  }
  function massimo(valori) { return Math.max.apply(null, valori.concat([1])); }
  function descrivi(nome, etichette, valori, formato) {
    return nome + ': ' + etichette.map(function (t, i) { return t + ' ' + formato(valori[i] || 0); }).join(', ');
  }
  /* barre semplici, con il valore sopra ognuna (poche barre: 6 mesi, 8 settimane) */
  function graficoBarre(nome, valori, etichette, formato, colore) {
    var max = massimo(valori), alt = GH - G_BASSO - G_ALTO, larg = Math.min(34, passoX(valori.length) * 0.62);
    return svgGrafico(valori.map(function (v, i) {
      var hh = Math.round(alt * v / max), x = centro(i, valori.length) - larg / 2, y = GH - G_BASSO - hh, ultimo = i === valori.length - 1;
      return '<rect x="' + x.toFixed(1) + '" y="' + y + '" width="' + larg.toFixed(1) + '" height="' + Math.max(hh, v ? 3 : 0) + '" rx="5" fill="' + (ultimo ? colore : '#B9C0CA') + '"/>' +
        '<text class="forte" x="' + (x + larg / 2).toFixed(1) + '" y="' + (y - 7) + '" text-anchor="middle" font-size="13">' + formato(v) + '</text>';
    }).join('') + assi(etichette), descrivi(nome, etichette, valori, formato));
  }
  /* una linea con l'area sotto: un punto per mese; scritti solo l'ultimo valore e il più alto */
  function graficoLinea(nome, valori, etichette, formato, colore) {
    var max = massimo(valori), alt = GH - G_BASSO - G_ALTO, n = valori.length;
    var pt = valori.map(function (v, i) { return [centro(i, n), GH - G_BASSO - alt * v / max]; });
    var linea = pt.map(function (q, i) { return (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join(' ');
    var area = linea + ' L' + pt[n - 1][0].toFixed(1) + ' ' + (GH - G_BASSO) + ' L' + pt[0][0].toFixed(1) + ' ' + (GH - G_BASSO) + ' Z';
    var scrittoMax = false;
    return svgGrafico('<path d="' + area + '" fill="' + colore + '" fill-opacity=".12"/>' +
      '<path d="' + linea + '" fill="none" stroke="' + colore + '" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>' +
      pt.map(function (q, i) {
        var ultimo = i === n - 1, eMax = valori[i] === max && valori[i] > 0 && !scrittoMax && !ultimo;
        if (eMax) scrittoMax = true;
        return '<circle cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="' + (ultimo ? 6 : 3.5) + '" fill="' + (ultimo ? colore : '#fff') + '" stroke="' + colore + '" stroke-width="2.5"/>' +
          ((ultimo || eMax) && valori[i] ? '<text class="forte" x="' + Math.min(q[0], GW - 16).toFixed(1) + '" y="' + (q[1] - 11).toFixed(1) + '" text-anchor="middle" font-size="13">' + formato(valori[i]) + '</text>' : '');
      }).join('') + assi(etichette), descrivi(nome, etichette, valori, formato));
  }
  /* due barre una dentro l'altra: piena = incassato, contorno = prenotato */
  function graficoIncassi(mesi, etichette) {
    var inc = mesi.map(function (m) { return m.incassato; }), pre = mesi.map(function (m) { return m.valore; });
    var max = massimo(inc.concat(pre)), alt = GH - G_BASSO - G_ALTO, n = mesi.length, larg = Math.min(22, passoX(n) * 0.6), incMax = massimo(inc);
    return svgGrafico(mesi.map(function (m, i) {
      var x = centro(i, n) - larg / 2, hp = alt * pre[i] / max, hi = alt * inc[i] / max, ultimo = i === n - 1;
      return (pre[i] ? '<rect x="' + x.toFixed(1) + '" y="' + (GH - G_BASSO - hp).toFixed(1) + '" width="' + larg.toFixed(1) + '" height="' + hp.toFixed(1) + '" rx="4" fill="none" stroke="#5B6470" stroke-width="2" stroke-dasharray="4 3"/>' : '') +
        (inc[i] ? '<rect x="' + x.toFixed(1) + '" y="' + (GH - G_BASSO - hi).toFixed(1) + '" width="' + larg.toFixed(1) + '" height="' + hi.toFixed(1) + '" rx="4" fill="' + (ultimo ? '#1E7A46' : '#1B2A3A') + '"/>' : '') +
        ((ultimo || (inc[i] === incMax && inc[i])) && (inc[i] || pre[i]) ? '<text class="forte" x="' + Math.min(x + larg / 2, GW - 20).toFixed(1) + '" y="' + (GH - G_BASSO - Math.max(hp, hi) - 7).toFixed(1) + '" text-anchor="middle" font-size="13">' + euro(inc[i] || pre[i]) + '</text>' : '');
    }).join('') + assi(etichette), descrivi('Incassato', etichette, inc, euro));
  }
  /* barre a pezzi: un colore per voce, il totale sopra */
  function graficoImpilato(nome, voci, etichette) {
    var n = etichette.length, tot = [], i;
    for (i = 0; i < n; i++) tot.push(voci.reduce(function (t, v) { return t + (v.valori[i] || 0); }, 0));
    var max = massimo(tot), alt = GH - G_BASSO - G_ALTO, larg = Math.min(22, passoX(n) * 0.6), out = '';
    for (i = 0; i < n; i++) {
      var x = centro(i, n) - larg / 2, y = GH - G_BASSO;
      voci.forEach(function (v) {
        var val = v.valori[i] || 0;
        if (!val) return;
        var hh = alt * val / max; y -= hh;
        out += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + larg.toFixed(1) + '" height="' + Math.max(hh - 1.5, 1.5).toFixed(1) + '" rx="3" fill="' + v.colore + '"/>';
      });
      if (tot[i]) out += '<text class="forte" x="' + (x + larg / 2).toFixed(1) + '" y="' + (y - 7).toFixed(1) + '" text-anchor="middle" font-size="13">' + compatto(tot[i]) + '</text>';
    }
    return svgGrafico(out + assi(etichette), descrivi(nome, etichette, tot, intero));
  }
  /* più linee, con i buchi dove il numero manca; la scala parte vicino al minimo */
  function graficoLinee(nome, serieLinee, etichette) {
    var tutti = [], n = etichette.length;
    serieLinee.forEach(function (s) { s.valori.forEach(function (v) { if (v != null) tutti.push(v); }); });
    if (!tutti.length) return '';
    var min = Math.min.apply(null, tutti), max = Math.max.apply(null, tutti);
    var basso = Math.max(0, Math.floor(min - (max - min) * 0.25 - 1)), alto = max + Math.max(1, (max - min) * 0.1), alt = GH - G_BASSO - G_ALTO;
    var y = function (v) { return GH - G_BASSO - alt * (v - basso) / (alto - basso); };
    return svgGrafico(serieLinee.map(function (s) {
      var d = '', attaccato = false, ultimo = null, punti = '';
      s.valori.forEach(function (v, i) {
        if (v == null) { attaccato = false; return; }
        var x = centro(i, n);
        d += (attaccato ? 'L' : 'M') + x.toFixed(1) + ' ' + y(v).toFixed(1) + ' '; attaccato = true; ultimo = [x, y(v), v];
        punti += '<circle cx="' + x.toFixed(1) + '" cy="' + y(v).toFixed(1) + '" r="3.5" fill="#fff" stroke="' + s.colore + '" stroke-width="2.5"/>';
      });
      return '<path d="' + d + '" fill="none" stroke="' + s.colore + '" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>' + punti +
        (ultimo ? '<text class="forte" x="' + Math.min(ultimo[0], GW - 22).toFixed(1) + '" y="' + (ultimo[1] - 11).toFixed(1) + '" text-anchor="middle" font-size="13">' + compatto(ultimo[2]) + '</text>' : '');
    }).join('') + assi(etichette), nome + ': ' + serieLinee.map(function (s) {
      var u = s.valori.filter(function (v) { return v != null; }); return s.nome + ' ' + (u.length ? intero(u[u.length - 1]) : 'nessun numero');
    }).join(', '));
  }
  function legenda(voci) {
    return '<p class="g-legenda-grafico">' + voci.map(function (v) { return '<span><i class="g-pallino" style="background:' + v.colore + '"></i>' + e(v.nome) + '</span>'; }).join('') + '</p>';
  }
  /* riquadro di un grafico: titolo, cosa mostra, grafico, la riga in parole */
  function riquadroGrafico(titoloGrafico, sotto, grafico, parole, legendaHtml) {
    return '<div class="g-blocco"><h3>' + e(titoloGrafico) + '</h3><p class="g-nota">' + e(sotto) + '</p>' + grafico + (legendaHtml || '') + (parole ? '<p class="g-in-parole">' + e(parole) + '</p>' : '') + '</div>';
  }

  /* ---------- pezzi di "Come va" e del cruscotto ---------- */
  /* quanto è cambiato rispetto a prima: "▲ +20%" oppure "▼ −3" */
  function variazione(v, prima, assoluta) {
    if (v == null || prima == null) return '';
    var d = assoluta ? v - prima : (prima ? Math.round((v - prima) / prima * 100) : null);
    if (d == null) return '';
    if (!d) return '<span class="g-var">= uguale</span>';
    return '<span class="g-var ' + (d > 0 ? 'g-var-su' : 'g-var-giu') + '">' + (d > 0 ? '▲ +' : '▼ −') + intero(Math.abs(d)) + (assoluta ? '' : '%') + '</span>';
  }
  function tessera(nome, valore, spiega, varHtml) {
    return '<div class="g-tessera"><p class="g-tessera-nome">' + e(nome) + '</p><strong>' + valore + '</strong>' + (varHtml ? '<p class="g-tessera-var">' + varHtml + '</p>' : '') + '<p class="g-tessera-spiega">' + e(spiega) + '</p></div>';
  }
  function rigaNumero(nome, valore, varHtml) { return '<li><span>' + e(nome) + '</span><strong>' + valore + (varHtml ? ' ' + varHtml : '') + '</strong></li>'; }
  function quantePrenotazioni(n) { return n === 1 ? '1 prenotazione' : intero(n) + ' prenotazioni'; }
  /* da dove arrivano: una riga per canale, con quante e in percentuale */
  function canaliHtml(lista) {
    var tot = 0;
    lista.forEach(function (f) { tot += f.n; });
    if (!tot) return '<p class="g-vuoto">Ancora nessuna prenotazione.</p>';
    return '<ul class="g-quote">' + lista.map(function (f) {
      var pc = Math.round(f.n / tot * 100), colore = COLORI_CANALI[f.fonte] || '#5B6470';
      return '<li><div class="g-quota-testa"><span>' + e(nomeCanale(f.fonte)) + '</span><strong>' + f.n + ' · ' + pc + '%</strong></div>' +
        '<div class="g-quota-riga"><i style="width:' + Math.max(3, pc) + '%;background:' + colore + '"></i></div></li>';
    }).join('') + '</ul>';
  }
  /* il percorso: dai social alla scrivania, con quanti fanno ogni passo */
  function percorsoHtml(m, mk) {
    var social = mk.instagram_copertura != null || mk.facebook_copertura != null ? (mk.instagram_copertura || 0) + (mk.facebook_copertura || 0) : null;
    var passi = [['Hanno visto i social', social], ['Sono andati sul sito', mk.visite_sito != null ? mk.visite_sito : null], ['Hanno chiesto un posto', m.prenotazioni], ['Sono arrivati in sede', m.presenti]];
    return '<ol class="g-percorso">' + passi.map(function (x, i) {
      var prima = i ? passi[i - 1][1] : null, quota = i && x[1] != null && prima ? Math.round(x[1] / prima * 1000) / 10 : null;
      return (i ? '<li class="g-percorso-freccia" aria-hidden="true">' + (quota != null ? '↓ ' + virgola(Math.min(quota, 999)) + '%' : '↓') + '</li>' : '') +
        '<li class="g-percorso-passo"><strong>' + (x[1] == null ? '—' : intero(x[1])) + '</strong><span>' + e(x[0]) + (x[1] == null ? ' · numero in arrivo' : '') + '</span></li>';
    }).join('') + '</ol>';
  }
  var NOMI_VOCI = {
    instagram_follower: 'Follower', instagram_copertura: 'Persone raggiunte', facebook_follower: 'Follower', facebook_copertura: 'Persone raggiunte',
    google_visualizzazioni: 'Hanno visto la scheda', google_chiamate: 'Chiamate', google_indicazioni: 'Indicazioni stradali', google_clic_sito: 'Clic sul sito',
    visite_sito: 'Visite al sito', contatti_whatsapp: 'Chat su WhatsApp'
  };
  /* un blocco di social, Google o pubblicità: i numeri del mese con accanto come sono cambiati */
  function bloccoNumeri(g, d, m) {
    var mk = d.marketing || {}, pr = mesePrimaDi(d), k = d.kpi, righe = '';
    var conDati = g.campi.some(function (id) { return mk[id] != null; });
    if (g.id === 'pubblicita') {
      if (k.spesa.valore != null) righe += rigaNumero('Spesa del mese', euro(Math.round(k.spesa.valore * 100)));
      if (mk.spesa_meta != null) righe += rigaNumero('Su Instagram e Facebook', euro(Math.round(mk.spesa_meta * 100)));
      if (mk.spesa_google != null) righe += rigaNumero('Su Google', euro(Math.round(mk.spesa_google * 100)));
      if (k.spesa.valore != null) righe += rigaNumero('Prenotazioni arrivate dalla pubblicità', intero(k.prenotazioniDaPubblicita.valore));
      if (k.costoPrenotazione.valore != null) righe += rigaNumero('Costo per ogni prenotazione', euro(k.costoPrenotazione.valore));
      if (k.ritornoPubblicita.valore != null) righe += rigaNumero('Rende, per ogni €1 speso', euro(Math.round(k.ritornoPubblicita.valore * 100)));
    } else {
      g.campi.forEach(function (id) {
        if (mk[id] == null || !NOMI_VOCI[id]) return;
        righe += rigaNumero(NOMI_VOCI[id], intero(mk[id]), variazione(mk[id], pr[id], /follower/.test(id)));
      });
      if (g.id === 'google' && (mk.recensioni_media != null || mk.recensioni_numero != null)) {
        righe += rigaNumero('Recensioni', (mk.recensioni_media != null ? virgola(mk.recensioni_media) + ' su 5' : '') + (mk.recensioni_media != null && mk.recensioni_numero != null ? ' · ' : '') +
          (mk.recensioni_numero != null ? intero(mk.recensioni_numero) + ' in tutto' : ''), variazione(mk.recensioni_numero, pr.recensioni_numero, true));
      }
      if (g.id === 'instagram') righe += rigaNumero('Prenotazioni arrivate da Instagram', intero(m.canali.Instagram || 0));
      if (g.id === 'facebook') righe += rigaNumero('Prenotazioni arrivate da Facebook', intero(m.canali.Facebook || 0));
      if (g.id === 'google') righe += rigaNumero('Prenotazioni arrivate da Google', intero((m.canali.Google || 0) + (m.canali['Google Maps'] || 0) + (m.canali['Google Ads'] || 0)));
      if (g.id === 'sito') righe += rigaNumero('Prenotazioni arrivate da WhatsApp', intero(m.canali.WhatsApp || 0));
    }
    return '<div class="g-blocco" data-blocco="' + g.id + '"><h3>' + e(g.titolo) + '</h3>' +
      (conDati ? '' : '<p class="g-in-arrivo">' + (RUOLO === 'apex' ? 'Nessun numero per questo mese.' : 'In arrivo: lo aggiorna Apex Media a inizio mese.') + '</p>') +
      (righe ? '<ul class="g-righe-numeri">' + righe + '</ul>' : '') +
      (RUOLO === 'apex' ? '<div class="g-pulsanti"><a class="g-btn g-btn-chiaro" href="#numeri-mese/' + d.mese.slice(0, 7) + '">' + (conDati ? 'Modifica' : 'Inserisci') + '</a></div>' : '') + '</div>';
  }
  /* la previsione: dove si arriva a fine mese con il ritmo di adesso, e cosa c'è già in calendario */
  function previsioneHtml(d) {
    var p = d.numeri.previsione, html = '<h2 class="g-sezione">Previsione</h2><div class="g-blocco" data-previsione>';
    if (p.stima) {
      html += '<p class="g-previsione">A fine ' + e(d.nomeMese) + ': <strong>circa ' + quantePrenotazioni(p.stima.prenotazioni) + ' e ' + euro(p.stima.valore) + '</strong>, se si continua con il ritmo di questi ' + p.giorno + ' giorni.</p>';
    } else {
      html += '<p class="g-previsione">' + (p.giorno < 4 ? 'Il mese è appena iniziato: la previsione di fine mese arriva dal quarto giorno.' : 'Questo mese non ci sono ancora prenotazioni: la previsione arriva con la prima.') + '</p>';
    }
    return html + '<ul class="g-righe-numeri">' +
      rigaNumero('Finora, ' + d.nomeMese, quantePrenotazioni(p.finora.prenotazioni) + ' · ' + euro(p.finora.valore)) +
      rigaNumero(maiuscola(d.nomeMesePrima) + ' si è chiuso con', quantePrenotazioni(p.mesePrima.prenotazioni) + ' · ' + euro(p.mesePrima.valore)) +
      rigaNumero('Già in calendario, prossimi 30 giorni', quantePrenotazioni(p.inCalendario.prenotazioni) + ' · ' + euro(p.inCalendario.valore)) +
      rigaNumero('Devono ancora entrare', euro(p.daEntrare)) + '</ul>' +
      '<p class="g-nota">La previsione è un conto fatto sui giorni passati finora: più il mese va avanti, più è precisa.</p></div>';
  }
  /* "Come va il mese", in fondo a Oggi: incasso e prenotazioni con i loro grafici, e da dove arrivano */
  function andamentoHtml(d) {
    var n = d.numeri, g = daIso(d.oggi), nomeOra = g.toLocaleDateString('it-IT', { month: 'long' });
    var nomePrima = new Date(g.getFullYear(), g.getMonth() - 1, 1, 12).toLocaleDateString('it-IT', { month: 'long' });
    var varMese = variazione(n.incassoMese, n.incassoMesePrima), varSett = variazione(n.settimana, n.settimanaPrima);
    return '<h2 class="g-sezione">Come va il mese</h2>' +
      '<div class="g-blocco"><p class="g-tessera-nome">Incassato ' + e(aMese(nomeOra)) + '</p><strong class="g-grande">' + euro(n.incassoMese) + '</strong>' +
      (varMese ? '<p class="g-tessera-var">' + varMese + ' rispetto ' + e(aMese(nomePrima)) + '</p>' : '') + '<p class="g-nota">Gli ultimi 6 mesi</p>' +
      graficoBarre('Incassato', n.mesi.map(function (x) { return Math.round(x.centesimi / 100); }), n.mesi.map(function (x) { return etichettaMese(x.inizio); }), function (v) { return '€' + intero(v); }, '#1E7A46') + '</div>' +
      '<div class="g-blocco"><p class="g-tessera-nome">Prenotazioni questa settimana</p><strong class="g-grande">' + intero(n.settimana) + '</strong>' +
      (varSett ? '<p class="g-tessera-var">' + varSett + ' rispetto alla settimana scorsa</p>' : '') + '<p class="g-nota">Le ultime 8 settimane</p>' +
      graficoBarre('Prenotazioni', n.settimane.map(function (x) { return x.n; }), n.settimane.map(function (x) { var s = daIso(x.inizio); return s.getDate() + '/' + (s.getMonth() + 1); }), intero, '#1B2A3A') + '</div>' +
      '<div class="g-blocco"><h3>Da dove arrivano le prenotazioni</h3><p class="g-nota">Ultimi 90 giorni</p>' + canaliHtml(n.fonti) + '</div>' +
      '<div class="g-pulsanti"><a class="g-btn g-btn-chiaro" href="#come-va">Tutti i numeri in Come va</a></div>';
  }
  /* la giornata in quattro riquadri: scrivanie, richieste, arrivi, incassi */
  function cruscottoHtml(d) {
    var n = d.numeri, libere = Math.max(0, n.postazioni - n.occupate);
    var daSegnare = d.arrivi.filter(function (p) { return !p.mensile && p.stato === 'confermata'; }).length;
    return '<div class="g-cruscotto">' +
      '<a class="g-cr" href="#giorno/' + d.oggi + '"><span>Scrivanie oggi</span><strong>' + n.occupate + '<small> su ' + n.postazioni + '</small></strong><em>' + (libere ? libere + (libere === 1 ? ' libera' : ' libere') : 'Tutte occupate') + '</em></a>' +
      '<div class="g-cr"><span>Da confermare</span><strong>' + d.inAttesa.length + '</strong><em>' + (d.inAttesa.length ? 'Aspettano la risposta' : 'Nessuna richiesta') + '</em></div>' +
      '<div class="g-cr"><span>Arrivi da segnare</span><strong>' + daSegnare + '</strong><em>' + (daSegnare ? 'Tocca “È arrivata/o”' : d.arrivi.length ? 'Tutti segnati' : 'Oggi nessuno') + '</em></div>' +
      '<a class="g-cr" href="#incassi"><span>Da incassare</span><strong>' + euro(n.daIncassare) + '</strong><em>' + (n.daIncassare ? (n.daIncassareN === 1 ? 'Una prenotazione' : n.daIncassareN + ' prenotazioni') : 'Tutto incassato') + '</em></a></div>';
  }

  /* ---------- Come va: tutto in una pagina, come un resoconto ---------- */
  var GRUPPI_NUMERI = [
    { id: 'instagram', titolo: 'Instagram', campi: ['instagram_follower', 'instagram_copertura'], aiuto: 'App Instagram → Dashboard professionale → Account raggiunti (ultimi 30 giorni).' },
    { id: 'facebook', titolo: 'Facebook', campi: ['facebook_follower', 'facebook_copertura'], aiuto: 'Meta Business Suite → Insight → Copertura.' },
    { id: 'google', titolo: 'Google', campi: ['google_visualizzazioni', 'google_chiamate', 'google_indicazioni', 'google_clic_sito', 'recensioni_numero', 'recensioni_media'], aiuto: 'Profilo dell’attività su Google → Rendimento, mese scelto. Recensioni: totale e voto medio di oggi.' },
    { id: 'sito', titolo: 'Sito e WhatsApp', campi: ['visite_sito', 'contatti_whatsapp'], aiuto: 'Visite: Google Analytics → Utenti del mese. WhatsApp: chat nuove arrivate dal sito.' },
    { id: 'pubblicita', titolo: 'Pubblicità', campi: ['spesa_meta', 'spesa_google'], aiuto: 'Quanto è stato speso nel mese, IVA inclusa (in euro).' }
  ];
  SCHERMATE['come-va'] = { titolo: 'Come va', voce: 'come-va', disegna: function (mese) {
    return leggi('come-va', { mese: mese }).then(function (d) {
      var k = d.kpi, m7 = d.mese.slice(0, 7), nome = d.nomeMese, prima = d.nomeMesePrima, mk = d.marketing || {};
      var m = d.mesi[d.mesi.length - 1], corrente = d.mese === d.corrente, g = daIso(d.mese), mesi = d.mesi;
      var mPrima = iso(new Date(g.getFullYear(), g.getMonth() - 1, 1)).slice(0, 7), mDopo = iso(new Date(g.getFullYear(), g.getMonth() + 1, 1)).slice(0, 7);
      var rispetto = function (varHtml) { return varHtml ? varHtml + ' rispetto ' + e(aMese(prima)) : ''; };
      var html = '<div class="g-mese"><button type="button" data-vai="come-va/' + mPrima + '" aria-label="Mese prima">' + ico('prima') + '</button><h2>' + e(meseLungo(m7)) + '</h2>' +
        '<button type="button" data-vai="come-va/' + mDopo + '" aria-label="Mese dopo"' + (corrente ? ' disabled' : '') + '>' + ico('dopo') + '</button></div>';
      html += '<div class="g-blocco g-in-breve"><h3>In breve</h3><p>' + e(d.riassunto) + '</p></div>';
      if (corrente) html += previsioneHtml(d);

      html += '<h2 class="g-sezione">Il coworking</h2><p class="g-nota g-sotto-sezione">Questi numeri si aggiornano da soli.</p><div class="g-tessere">' +
        tessera('Prenotazioni', intero(k.prenotazioni.valore), 'Arrivate questo mese, dal sito e in sede.', rispetto(variazione(k.prenotazioni.valore, k.prenotazioni.prima))) +
        tessera('Incassato', euro(k.incasso.valore), 'Soldi già entrati. Prenotato in tutto: ' + euro(k.valorePrenotato.valore) + '.', rispetto(variazione(k.incasso.valore, k.incasso.prima))) +
        tessera('Clienti nuovi', intero(k.nuoviClienti.valore), 'Persone arrivate per la prima volta.', rispetto(variazione(k.nuoviClienti.valore, k.nuoviClienti.prima))) +
        tessera('Clienti che tornano', k.quotaRitorni.valore == null ? '—' : k.quotaRitorni.valore + '%', k.quotaRitorni.valore == null ? 'Nessun cliente questo mese.' :
          'Su ' + m.clienti + (m.clienti === 1 ? ' cliente' : ' clienti') + ' del mese, ' + (m.ritorni === 0 ? 'nessuno era già venuto.' : m.ritorni === 1 ? 'uno era già venuto.' : m.ritorni + ' erano già venuti.'), '') +
        tessera('Arrivati in sede', intero(k.arrivati.valore), k.nonVenuti.valore ? 'Segnati “È arrivata/o”. Non venuti: ' + k.nonVenuti.valore + '.' : 'Giornate segnate con “È arrivata/o”.', rispetto(variazione(k.arrivati.valore, k.arrivati.prima))) +
        (corrente ? tessera('Scrivanie occupate oggi', d.numeri.occupate + ' su ' + d.numeri.postazioni, d.adesso.giorniPiuRichiesti ? (/ e /.test(d.adesso.giorniPiuRichiesti) ? 'I giorni più richiesti: ' : 'Il giorno più richiesto: ') + d.adesso.giorniPiuRichiesti.toLowerCase() + '.' : 'Ancora presto per dire qual è il giorno più richiesto.', '') : '') +
        '</div>';

      html += '<h2 class="g-sezione">Il percorso del cliente</h2><p class="g-nota g-sotto-sezione">Dai social alla scrivania: quante persone fanno ogni passo nel mese.</p>' + percorsoHtml(m, mk);

      html += '<h2 class="g-sezione">Social, Google e pubblicità</h2><p class="g-nota g-sotto-sezione">Li aggiorna Apex Media ogni mese.</p>' +
        GRUPPI_NUMERI.map(function (x) { return bloccoNumeri(x, d, m); }).join('');
      if (d.note) html += '<div class="g-blocco"><h3>Cosa abbiamo fatto questo mese</h3><p class="g-righe">' + e(d.note) + '</p><p class="g-nota">Apex Media</p></div>';

      html += '<h2 class="g-sezione">Da dove arrivano le prenotazioni</h2><p class="g-nota g-sotto-sezione">Quelle di ' + e(nome) + ', divise per come la persona è arrivata.</p>' +
        canaliHtml(Object.keys(m.canali).map(function (c) { return { fonte: c, n: m.canali[c] }; }).sort(function (a, b) { return b.n - a.n; }));

      /* l'ultimo anno, in cinque grafici */
      var etichette = mesi.map(function (x) { return etichettaMese(x.mese); }), totP = 0, totI = 0, totV = 0;
      mesi.forEach(function (x) { totP += x.prenotazioni; totI += x.incassato; totV += x.valore; });
      html += '<h2 class="g-sezione">L’ultimo anno</h2>' +
        riquadroGrafico('Prenotazioni al mese', 'Ultimi 12 mesi', graficoLinea('Prenotazioni', mesi.map(function (x) { return x.prenotazioni; }), etichette, intero, '#1B2A3A'), 'In 12 mesi: ' + quantePrenotazioni(totP) + '.') +
        riquadroGrafico('Incassi al mese', 'Pieno = incassato, contorno = prenotato', graficoIncassi(mesi, etichette), 'In 12 mesi: ' + euro(totI) + ' incassati su ' + euro(totV) + ' prenotati.');
      var voci = d.canali.map(function (c) { return { nome: nomeCanale(c), colore: COLORI_CANALI[c] || '#5B6470', valori: mesi.map(function (x) { return x.canali[c] || 0; }) }; });
      html += riquadroGrafico('Da dove arrivano, mese per mese', 'Prenotazioni divise per canale', voci.length ? graficoImpilato('Prenotazioni per canale', voci, etichette) : '<p class="g-vuoto">Ancora nessuna prenotazione negli ultimi 12 mesi.</p>', '', voci.length ? legenda(voci) : '');
      var social = [['Instagram', 'instagram_follower', '#B4457E'], ['Facebook', 'facebook_follower', '#3B5BDB']].map(function (s) {
        return { nome: s[0], colore: s[2], valori: mesi.map(function (x) { return x.marketing && x.marketing[s[1]] != null ? x.marketing[s[1]] : null; }) };
      }).filter(function (s) { return s.valori.some(function (v) { return v != null; }); });
      html += riquadroGrafico('Follower sui social', 'A fine mese', social.length ? graficoLinee('Follower', social, etichette) : '<p class="g-vuoto">Nessun numero dei social per ora.</p>', '', social.length ? legenda(social) : '');
      var google = [['Chiamate', 'google_chiamate', '#1B2A3A'], ['Indicazioni', 'google_indicazioni', '#0C8599'], ['Clic sul sito', 'google_clic_sito', '#C9973B']].map(function (s) {
        return { nome: s[0], colore: s[2], valori: mesi.map(function (x) { return x.marketing && x.marketing[s[1]] ? x.marketing[s[1]] : 0; }) };
      });
      var conGoogle = google.some(function (s) { return s.valori.some(function (v) { return v > 0; }); });
      html += riquadroGrafico('Azioni sul profilo Google', 'Chiamate, indicazioni e clic sul sito', conGoogle ? graficoImpilato('Azioni su Google', google, etichette) : '<p class="g-vuoto">Nessun numero di Google per ora.</p>', '', conGoogle ? legenda(google) : '');

      html += '<div class="g-pulsanti"><a class="g-btn g-btn-chiaro" href="#come-va-anno/' + m7 + '">I numeri mese per mese, in elenco</a></div>';
      if (d.aggiornato) html += '<p class="g-nota">Numeri di social, Google e pubblicità aggiornati da Apex Media il ' + e(giornoBreve(d.aggiornato)) + '.</p>';
      vista.innerHTML = html + pulsanteNumeri(d);
    });
  } };

  /* gli stessi numeri dell'ultimo anno, scritti in elenco */
  SCHERMATE['come-va-anno'] = { titolo: 'Come va', voce: 'come-va', interna: 'come-va', disegna: function (mese) {
    return leggi('come-va', { mese: mese }).then(function (d) {
      var mesi = d.mesi.slice().reverse(), nomeDi = function (x) { return meseLungo(x.mese.slice(0, 7)); };
      var html = '<h2 class="g-titolo">Mese per mese</h2><h2 class="g-sezione">Prenotazioni</h2>' +
        quote(mesi.map(function (x) { return { nome: nomeDi(x), valore: x.prenotazioni }; })) +
        '<h2 class="g-sezione">Valore delle prenotazioni</h2>' + quote(mesi.map(function (x) { return { nome: nomeDi(x), valore: x.valore }; }), euro) +
        '<h2 class="g-sezione">Incassato</h2>' + quote(mesi.map(function (x) { return { nome: nomeDi(x), valore: x.incassato }; }), euro) +
        '<h2 class="g-sezione">Clienti nuovi</h2>' + quote(mesi.map(function (x) { return { nome: nomeDi(x), valore: x.nuoviClienti }; }));
      [['Follower su Instagram', 'instagram_follower'], ['Follower su Facebook', 'facebook_follower'], ['Chiamate da Google', 'google_chiamate'], ['Visite al sito', 'visite_sito']].forEach(function (s) {
        var righe = serie(d, s[1]);
        if (righe.length) html += '<h2 class="g-sezione">' + s[0] + '</h2>' + quote(righe);
      });
      vista.innerHTML = html;
    });
  } };

  /* ---------- i numeri del mese: li scrive Apex Media ---------- */
  SCHERMATE['numeri-mese'] = { titolo: 'Numeri del mese', voce: 'come-va', interna: 'come-va', disegna: function (mese) {
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
        '<p class="g-nota" data-quanti>' + (d.clienti.length === 1 ? 'Un cliente' : d.clienti.length + ' clienti') + '</p><div class="g-largo-su" style="margin-top:16px" data-elenco>' + elenco(d.clienti, '') + '</div>' +
        '<p class="g-nota">“Viene spesso”: almeno quattro giorni nell’ultimo mese. “Non si vede da un mese”: l’ultima volta è stata più di 30 giorni fa.</p>';
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

  /* ---------- Incassi: quanto è entrato, cosa manca, chi deve ancora pagare ---------- */
  var NOMI_METODO = { contanti: 'in contanti', carta: 'con la carta', bonifico: 'con bonifico', online: 'online' };
  var NOMI_METODO_BREVI = { contanti: 'Contanti', carta: 'Carta', bonifico: 'Bonifico', online: 'Online' };
  function titoloPeriodo(d) {
    if (d.periodo === 'giorno') return giornoLungo(d.inizio);
    if (d.periodo === 'mese') return meseLungo(d.inizio.slice(0, 7));
    return (d.inizio.slice(0, 7) === d.fine.slice(0, 7) ? String(+d.inizio.slice(8)) : giornoBreve(d.inizio)) + ' – ' + giornoBreve(d.fine);
  }
  function voceIncasso(r) {
    var stato = r.gratis ? 'Niente da pagare' : euro(r.importo) + ' · pagato ' + (NOMI_METODO[r.metodo] || '');
    return '<li><a class="g-voce" href="#prenotazione/' + r.id + '"><span><strong>' + e(r.nome) + '</strong><small>' + e(giornoBreve(r.data) + ' · ' + r.cosa) + '</small><small>' + e(stato) + '</small></span></a></li>';
  }
  /* chi deve ancora pagare: due pulsanti per incassare subito, senza aprire la prenotazione */
  function schedaDaIncassare(r) {
    return '<li class="g-scheda" data-da-incassare="' + r.id + '"><a class="g-nome g-link" href="#prenotazione/' + r.id + '">' + e(r.nome) + '</a><p class="g-quando">' + e(giornoBreve(r.data) + ' · ' + r.cosa) + '</p>' +
      '<p class="g-cosa">' + euro(r.importo) + (r.futura ? ' · paga quando arriva' : ' · da pagare') + '</p>' +
      '<div class="g-due"><button class="g-btn g-btn-chiaro" type="button" data-incassa="contanti" data-id="' + r.id + '">Contanti</button>' +
      '<button class="g-btn g-btn-chiaro" type="button" data-incassa="carta" data-id="' + r.id + '">Carta</button></div></li>';
  }
  SCHERMATE.incassi = { titolo: 'Incassi', interna: 'profilo', disegna: function (param) {
    var pz = String(param || '').split('/');
    return leggi('incassi', { periodo: pz[0] || 'mese', da: pz[1] || '' }).then(function (d) {
      var t = d.totali, ancora = d.oggi >= d.inizio && d.oggi <= d.fine ? d.oggi : d.inizio;
      var da = d.righe.filter(function (r) { return !r.gratis && !r.pagato; }), ok = d.righe.filter(function (r) { return !r.gratis && r.pagato; }), gratis = d.righe.filter(function (r) { return r.gratis; });
      var perc = t.previsto ? Math.round(t.incassato / t.previsto * 100) : 0, metodi = {};
      ok.forEach(function (r) { var k = r.metodo || 'altro'; metodi[k] = (metodi[k] || 0) + r.importo; });
      var comePagato = Object.keys(metodi).map(function (k) { return (NOMI_METODO_BREVI[k] || 'Altro') + ' ' + euro(metodi[k]); }).join(' · ');
      var gruppo = function (nome, lista, riga) { return lista.length ? '<h2 class="g-sezione">' + nome + '</h2><ul class="g-lista">' + lista.map(riga).join('') + '</ul>' : ''; };
      var html = '<div class="g-tre" role="group" aria-label="Periodo">' + [['giorno', 'Giorno'], ['settimana', 'Settimana'], ['mese', 'Mese']].map(function (p) {
        return '<button class="g-btn g-btn-grigio" type="button" data-vai="incassi/' + p[0] + '/' + ancora + '" aria-pressed="' + (d.periodo === p[0]) + '">' + p[1] + '</button>';
      }).join('') + '</div>';
      html += '<div class="g-mese"><button type="button" data-vai="incassi/' + d.periodo + '/' + d.prima + '" aria-label="Prima">' + ico('prima') + '</button><h2>' + e(titoloPeriodo(d)) + '</h2>' +
        '<button type="button" data-vai="incassi/' + d.periodo + '/' + d.dopo + '" aria-label="Dopo">' + ico('dopo') + '</button></div>';
      html += '<div class="g-numeri"><div class="g-numero"><strong>' + euro(t.incassato) + '</strong><span>Incassati</span>' + piccolo('Su ' + euro(t.previsto) + ' prenotati' + (t.previsto ? ' · ' + perc + '%' : '')) +
        '<div class="g-quota-riga g-quota-verde" role="img" aria-label="Incassato il ' + perc + '% del prenotato"><i style="width:' + perc + '%"></i></div>' + piccolo(comePagato) + '</div>' +
        '<div class="g-numero"><strong>' + euro(t.daIncassare) + '</strong><span>Da incassare</span>' +
        piccolo(!d.righe.length ? '' : !t.daIncassare ? 'Hanno pagato tutti' : t.daIncassareOra ? euro(t.daIncassareOra) + ' da chiedere adesso' : 'Pagano quando arrivano') + '</div></div>';
      html += d.righe.length ? gruppo('Da incassare', da, schedaDaIncassare) + gruppo('Già pagate', ok, voceIncasso) + gruppo('Senza pagamento', gratis, voceIncasso) : '<p class="g-vuoto" style="margin-top:16px">Nessuna prenotazione in questo periodo.</p>';
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

  SCHERMATE['imp-chiusure'] = { titolo: 'Chiusure', interna: 'impostazioni', disegna: function () {
    return leggi('chiusure').then(function (d) {
      vista.innerHTML = '<h2 class="g-titolo">Giorni di chiusura</h2><p class="g-testo">I giorni chiusi da oggi in poi: in quei giorni dal sito non si può prenotare. Per chiuderne uno solo, toccalo nel Calendario.</p>' +
        (d.chiusure.length ? '<ul class="g-lista">' + d.chiusure.map(function (c) {
          return '<li class="g-scheda"><p class="g-nome g-iniziale">' + e(giornoLungo(c.data)) + '</p><p class="g-quando">' + PAROLE_CHIUSURA[c.valore] + '</p>' +
            '<div class="g-pulsanti"><button class="g-btn g-btn-chiaro" type="button" data-riapri-giorno="' + c.data + '">Riapri</button></div></li>';
        }).join('') + '</ul>' : '<p class="g-vuoto">Nessuna chiusura in programma.</p>') +
        '<div class="g-pulsanti g-largo-su"><a class="g-btn g-btn-primario" href="#chiudi-giorni">Chiudi più giorni</a></div>';
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
    if ((b = ev.target.closest('[data-incassa]'))) {
      $$('[data-incassa]', vista).forEach(function (x) { x.disabled = true; });
      chiama('pagato', { id: +b.getAttribute('data-id'), pagato: true, metodo: b.getAttribute('data-incassa') }).then(function () { mostraFatto('Incasso segnato.'); ridisegna(); },
        function (x) { ridisegna().then(function () { mostraErrore(x.message); }); });
      return;
    }
    if ((b = ev.target.closest('[data-assente]'))) {
      chiama('arrivo', { id: +b.getAttribute('data-assente'), assente: true }).then(function () { mostraFatto(); ridisegna(); }, function (x) { mostraErrore(x.message); });
      return;
    }
    if ((b = ev.target.closest('[data-riapri-giorno]'))) {
      var giornoR = b.getAttribute('data-riapri-giorno');
      b.disabled = true;
      chiama('chiudi', { da: giornoR, a: giornoR, valore: 'aperto' }).then(function () { mostraFatto('Giorno riaperto.'); ridisegna(); }, function (x) { b.disabled = false; mostraErrore(x.message); });
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
