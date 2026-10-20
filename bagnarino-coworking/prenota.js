/* =============================================================
   BAGNARINO COWORKING — flusso di prenotazione
   Tre passi sulla stessa pagina: formula → giorno → dati.
   Il riepilogo e il prezzo restano sempre in vista.

   Modalità:
   - REALE: se /api/disponibilita risponde, i posti sono veri e la
     prenotazione va a /api/prenota (fase 2).
   - DIMOSTRATIVA: altrimenti posti finti ma realistici; alla
     conferma la prenotazione non viene salvata e si propone di
     inviarla su WhatsApp, così nessun cliente vero va perso.
   ============================================================= */
(function () {
  'use strict';
  var B = window.BGN;
  if (!B || !document.querySelector('[data-modulo]')) return;
  var C = B.cfg, $ = B.$, $$ = B.$$;

  var stato = { pacchetto: null, data: null, liberi: {}, reale: false, sceltoGiornoUnaVolta: false };
  var modulo = $('[data-modulo]');

  /* ---------- utilità date ---------- */
  function oggi() { var d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function aggiungiGiorni(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function aggiungiMesi(d, n) { var x = new Date(d); x.setMonth(x.getMonth() + n); return x; }
  function maiuscola(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function dataLunga(s) { return B.data(B.daIso(s), 'lungo'); }
  function fineMese(s) { return aggiungiGiorni(aggiungiMesi(B.daIso(s), 1), -1); }

  function etichettaGiorno(p) {
    if (!p) return 'Giorno';
    if (p.id === 'carnet') return 'Primo ingresso';
    return p.tipoData === 'inizio' ? 'Periodo' : 'Giorno';
  }

  /* =============================================================
     PASSO 1 — formula
     ============================================================= */
  var opzioni = $('[data-opzioni]');
  opzioni.innerHTML = C.listino.map(function (p) {
    return '<label class="opzione">' +
      '<input type="radio" name="pacchetto" value="' + p.id + '">' +
      '<span class="opzione-corpo">' +
        '<span class="opzione-nome">' + p.nome + (p.etichetta ? '<span class="opzione-etichetta">' + p.etichetta + '</span>' : '') + '</span>' +
        '<span class="opzione-nota">' + p.nota + '</span>' +
        '<span class="opzione-prezzo">' + B.euro(p.prezzo) + '<small>' + p.unita + '</small></span>' +
      '</span></label>';
  }).join('');

  function scegliPacchetto(id, scorri) {
    var p = B.pacchetto(id);
    if (!p) return;
    stato.pacchetto = p;
    var r = $('input[value="' + id + '"]', opzioni);
    if (r) r.checked = true;
    $('[data-etichetta-data]').textContent = p.etichettaData;
    /* il passo 1 si chiude in una riga: meno scroll, focus sul giorno */
    opzioni.hidden = true;
    $('[data-sintesi="1"]').hidden = false;
    $('[data-sintesi-testo]').textContent = p.nome + ' · ' + B.euro(p.prezzo);
    $('[data-blocco="1"]').classList.add('completo');
    aggiornaInfoGiorno();
    aggiorna();
    if (scorri) vaiA(2);
    /* motore attivo: i posti dipendono dalla formula (un mese chiede
       posti liberi per tutto il periodo) */
    if (stato.reale) caricaDisponibilita();
    controllaVantaggi();
  }
  opzioni.addEventListener('change', function (e) {
    if (e.target.name === 'pacchetto') scegliPacchetto(e.target.value, true);
  });
  $('[data-cambia="1"]').addEventListener('click', function () {
    document.documentElement.classList.remove('con-pacchetto');
    opzioni.hidden = false;
    $('[data-sintesi="1"]').hidden = true;
    $('[data-blocco="1"]').classList.remove('completo');
    var r = $('input:checked', opzioni) || $('input', opzioni);
    if (r) r.focus();
  });

  /* =============================================================
     PASSO 2 — giorno
     ============================================================= */
  var griglia = $('[data-giorni]');
  var inizio = oggi();
  /* giorni mostrati: almeno quelli prenotabili, fino a 5 settimane intere */
  var giorni = Math.max(C.giorniPrenotabili || 28, 35 - (inizio.getDay() + 6) % 7);

  function statoGiorno(d) {
    var s = B.iso(d), liberi = stato.liberi[s];
    if (!B.aperto(d)) {
      var festivo = d.getDay() !== 0 && d.getDay() !== 6;
      return { attivo: false, classe: 'stato-chiuso', testo: festivo ? 'Festivo' : 'Chiuso', aria: festivo ? 'festivo, chiuso' : 'chiuso' };
    }
    if (s === B.iso(oggi()) && !B.oggiPrenotabile()) return { attivo: false, classe: 'stato-chiuso', testo: 'Chiuso', aria: 'non più prenotabile oggi' };
    if (liberi == null) return { attivo: true, classe: 'stato-chiuso', testo: '…', aria: 'disponibilità in caricamento' };
    if (liberi <= 0) return { attivo: false, classe: 'stato-pieno', testo: 'Pieno', aria: 'completo' };
    if (liberi <= 2) return { attivo: true, classe: 'stato-pochi', testo: liberi === 1 ? 'Ultimo posto' : 'Ultimi ' + liberi, aria: liberi === 1 ? 'un solo posto libero' : liberi + ' posti liberi, ultimi' };
    return { attivo: true, classe: 'stato-ok', testo: liberi + ' liberi', aria: liberi + ' posti liberi' };
  }

  function disegnaGiorni() {
    var html = ['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom'].map(function (g) {
      return '<span class="giorno-intestazione" aria-hidden="true">' + g + '</span>';
    }).join('');
    /* su schermi larghi la griglia parte dal lunedì: caselle vuote prima di oggi */
    var vuoti = (inizio.getDay() + 6) % 7;
    for (var v = 0; v < vuoti; v++) html += '<span class="giorno-vuoto" aria-hidden="true"></span>';
    /* 5 settimane intere: la griglia ha sempre la stessa altezza */
    for (var i = 0; i < giorni; i++) {
      var d = aggiungiGiorni(inizio, i), s = B.iso(d), st = statoGiorno(d);
      var scelto = stato.data === s;
      html += '<button type="button" class="giorno' + (scelto ? ' scelto' : '') + '" data-data="' + s + '"' +
        (st.attivo ? '' : ' disabled') + ' role="radio" aria-checked="' + scelto + '"' +
        ' aria-label="' + B.data(d, 'lungo') + ', ' + st.aria + '">' +
        '<span class="giorno-sett">' + d.toLocaleDateString('it-IT', { weekday: 'short' }).replace('.', '') + '</span>' +
        '<span class="giorno-num">' + d.getDate() + '</span>' +
        '<span class="giorno-mese">' + d.toLocaleDateString('it-IT', { month: 'short' }).replace('.', '') + '</span>' +
        '<span class="giorno-stato ' + st.classe + '">' + st.testo + '</span>' +
        '</button>';
    }
    griglia.innerHTML = html;
  }

  function scegliGiorno(s, scorri) {
    var d = B.daIso(s);
    if (!statoGiorno(d).attivo) return false;
    stato.data = s;
    $$('.giorno', griglia).forEach(function (b) {
      var si = b.getAttribute('data-data') === s;
      b.classList.toggle('scelto', si);
      b.setAttribute('aria-checked', si);
    });
    $('[data-errore-giorno]').style.display = 'none';
    $('[data-blocco="2"]').classList.add('completo');
    aggiornaInfoGiorno();
    aggiorna();
    if (scorri && !stato.sceltoGiornoUnaVolta) { stato.sceltoGiornoUnaVolta = true; vaiA(3); }
    controllaVantaggi();
    return true;
  }
  griglia.addEventListener('click', function (e) {
    var b = e.target.closest('.giorno');
    if (b && !b.disabled) scegliGiorno(b.getAttribute('data-data'), true);
  });
  /* frecce da tastiera tra i giorni disponibili */
  griglia.addEventListener('keydown', function (e) {
    if (['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].indexOf(e.key) === -1) return;
    var attivi = $$('.giorno:not(:disabled)', griglia), i = attivi.indexOf(document.activeElement);
    if (i === -1) return;
    e.preventDefault();
    var passo = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowDown' ? 5 : -5;
    var prossimo = attivi[Math.max(0, Math.min(attivi.length - 1, i + passo))];
    prossimo.focus();
  });

  function aggiornaInfoGiorno() {
    var info = $('[data-giorno-info]'), p = stato.pacchetto, s = stato.data;
    if (!s) { info.innerHTML = ''; return; }
    var d = B.daIso(s), testo;
    if (!p || p.id === 'giornata') {
      testo = '<strong>' + maiuscola(B.data(d, 'lungo')) + '</strong>, dalle ' + C.orari.apertura + ' alle ' + C.orari.chiusura + '.';
    } else if (p.id === 'carnet') {
      var resto = C.carnet.ingressi - 1;
      testo = 'Primo ingresso <strong>' + B.data(d, 'lungo') + '</strong>. Gli altri ' + resto +
        ' li prenoti quando vuoi, entro il ' + aggiungiMesi(d, C.carnet.validitaMesi).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }) + '.';
    } else {
      testo = 'Dal <strong>' + B.data(d, 'lungo') + '</strong> al <strong>' + B.data(fineMese(s), 'lungo') + '</strong>, tutti i giorni di apertura.';
    }
    info.innerHTML = testo;
  }

  /* =============================================================
     Riepilogo, indicatore, barra mobile
     ============================================================= */
  /* con giornata omaggio o carnet attivo la giornata non si paga */
  function prezzoAttuale() {
    var p = stato.pacchetto, v = stato.vantaggi;
    if (!p) return null;
    if (p.id === 'giornata' && v) {
      var omaggio = $('#usa_omaggio');
      if (v.omaggi > 0 && omaggio && omaggio.checked) return 0;
      if (v.carnet) return 0;
    }
    return p.prezzo;
  }
  function aggiorna() {
    var p = stato.pacchetto, s = stato.data, prezzo = prezzoAttuale();
    $('[data-r-formula]').textContent = p ? p.nome : '—';
    $('[data-r-etichetta-giorno]').textContent = etichettaGiorno(p);
    $('[data-r-giorno]').textContent = s ? (p && p.tipoData === 'inizio' && p.id !== 'carnet'
      ? B.data(B.daIso(s), 'breve') + ' → ' + B.data(fineMese(s), 'breve')
      : maiuscola(B.data(B.daIso(s), 'lungo'))) : 'da scegliere';
    $('[data-r-totale]').textContent = p ? B.euro(prezzo) : '—';

    var passo = !p ? 1 : !s ? 2 : 3;
    $$('[data-indicatore]').forEach(function (li) {
      var n = +li.getAttribute('data-indicatore');
      li.classList.toggle('fatto', n < passo);
      li.classList.toggle('attivo', n === passo);
      if (n === passo) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    });

    $('[data-b-totale]').textContent = p ? B.euro(prezzo) : 'da ' + B.euro(Math.min.apply(null, C.listino.map(function (x) { return x.prezzo; })));
    $('[data-b-testo]').textContent = !p ? 'Scegli la formula' : p.nome + (s ? ' · ' + B.data(B.daIso(s), 'breve') : '');
    $('[data-b-avanti]').textContent = !p ? 'Inizia' : !s ? 'Scegli il giorno' : 'Conferma';
  }
  $('[data-b-avanti]').addEventListener('click', function () {
    if (!stato.pacchetto) return vaiA(1);
    if (!stato.data) return vaiA(2);
    if (modulo.requestSubmit) modulo.requestSubmit(); else $('[data-invia]').click();
  });

  function vaiA(n) {
    var el = $('[data-blocco="' + n + '"]');
    if (!el) return;
    var ridotto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var y = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: y, behavior: ridotto ? 'auto' : 'smooth' });
  }

  /* =============================================================
     PASSO 3 — dati e validazione
     ============================================================= */
  var REGOLE = {
    nome: function (v) { return v.trim().length >= 2; },
    cognome: function (v) { return v.trim().length >= 2; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); },
    telefono: function (v) { var n = v.replace(/[\s().\/-]/g, '').replace(/^(\+|00)39/, ''); return /^\d{8,11}$/.test(n); },
    piva_cf: function (v) { v = v.trim(); return v === '' || /^\d{11}$/.test(v) || /^[A-Za-z0-9]{16}$/.test(v); },
    privacy: function (_, el) { return el.checked; }
  };
  function controlla(nome) {
    var el = modulo.elements[nome], box = $('[data-campo="' + nome + '"]');
    if (!el || !box) return true;
    var ok = REGOLE[nome](el.value || '', el);
    box.classList.toggle('errore', !ok);
    box.classList.toggle('valido', ok && el.type !== 'checkbox' && el.value.trim() !== '');
    el.setAttribute('aria-invalid', !ok);
    return ok;
  }
  Object.keys(REGOLE).forEach(function (nome) {
    var el = modulo.elements[nome];
    if (!el) return;
    el.addEventListener('blur', function () { if (el.value || el.type === 'checkbox') controlla(nome); });
    el.addEventListener(el.type === 'checkbox' ? 'change' : 'input', function () {
      if ($('[data-campo="' + nome + '"]').classList.contains('errore')) controlla(nome);
    });
  });

  /* Giornate omaggio e carnet: si chiedono al server quando email e
     telefono sono validi. Il server risponde solo se combaciano. */
  var boxVantaggi = $('[data-vantaggi]'), ultimaChiave = '';
  function controllaVantaggi() {
    if (!boxVantaggi) return;
    var f = modulo.elements, p = stato.pacchetto;
    var ok = stato.reale && p && p.id === 'giornata' && REGOLE.email(f.email.value) && REGOLE.telefono(f.telefono.value);
    if (!ok) { stato.vantaggi = null; boxVantaggi.hidden = true; aggiorna(); return; }
    var chiave = f.email.value.trim().toLowerCase() + '|' + f.telefono.value + '|' + (stato.data || '');
    if (chiave === ultimaChiave) return;
    ultimaChiave = chiave;
    B.chiamaApi(C.api.vantaggi, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: f.email.value.trim(), telefono: f.telefono.value, data: stato.data }) })
      .then(function (v) {
        stato.vantaggi = (v.omaggi > 0 || v.carnet) ? v : null;
        if (!stato.vantaggi) { boxVantaggi.hidden = true; aggiorna(); return; }
        boxVantaggi.innerHTML = v.omaggi > 0
          ? '<label class="spunta" for="usa_omaggio"><input type="checkbox" id="usa_omaggio" checked>' +
            '<span><strong>Hai una giornata in omaggio</strong> con la Bagnarino Card. Vuoi usarla adesso?</span></label>'
          : '<p><strong>Questa giornata la scaliamo dal tuo carnet</strong>: dopo ti resteranno ' + (v.carnet.residui - 1) + ' ingressi. Niente da pagare.</p>';
        boxVantaggi.hidden = false;
        var o = $('#usa_omaggio');
        if (o) o.addEventListener('change', aggiorna);
        aggiorna();
      }).catch(function () { stato.vantaggi = null; boxVantaggi.hidden = true; });
  }
  ['email', 'telefono'].forEach(function (n) { modulo.elements[n].addEventListener('blur', controllaVantaggi); });

  var erroreGenerale = $('[data-errore-generale]');
  function mostraErrore(html) { erroreGenerale.innerHTML = html; erroreGenerale.classList.add('visibile'); }

  modulo.addEventListener('submit', function (e) {
    e.preventDefault();
    erroreGenerale.classList.remove('visibile');
    if (!stato.pacchetto) { vaiA(1); return; }
    if (!stato.data) { $('[data-errore-giorno]').style.display = 'block'; vaiA(2); return; }
    var primoErrore = null;
    Object.keys(REGOLE).forEach(function (n) { if (!controlla(n) && !primoErrore) primoErrore = modulo.elements[n]; });
    if (primoErrore) { primoErrore.focus(); return; }
    invia();
  });

  /* =============================================================
     Invio
     ============================================================= */
  function codiceDemo() {
    var a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', c = '';
    for (var i = 0; i < 4; i++) c += a.charAt(Math.floor(Math.random() * a.length));
    return 'BGN-' + c;
  }
  var idEvento = 'bgn-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  function datiModulo() {
    var f = modulo.elements;
    return {
      pacchetto: stato.pacchetto.id,
      data: stato.data,
      nome: f.nome.value.trim(),
      cognome: f.cognome.value.trim(),
      email: f.email.value.trim().toLowerCase(),
      telefono: f.telefono.value.trim(),
      piva_cf: f.piva_cf.value.trim().toUpperCase(),
      note: f.note.value.trim(),
      consenso_privacy: f.privacy.checked,
      consenso_marketing: f.marketing.checked,
      origine: B.origine(),
      usa_omaggio: !!($('#usa_omaggio') && $('#usa_omaggio').checked && stato.vantaggi && stato.vantaggi.omaggi > 0),
      consenso_misurazione: B.consensoMisurazione(),
      event_id: idEvento,
      sito_web: f.sito_web.value   /* trappola anti-spam: deve restare vuoto */
    };
  }

  function invia() {
    var bottone = $('[data-invia]'), testoBottone = bottone.innerHTML;
    bottone.disabled = true;
    bottone.textContent = 'Invio in corso…';
    var dati = datiModulo();

    var richiesta = stato.reale
      ? B.chiamaApi(C.api.prenota, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dati) })
      : new Promise(function (ok) { setTimeout(function () { ok({ codice: codiceDemo(), demo: true }); }, 500); });

    richiesta.then(function (r) {
      mostraSuccesso(dati, r);
    }).catch(function (err) {
      bottone.disabled = false;
      bottone.innerHTML = testoBottone;
      var wa = '<a href="' + B.linkWa('giorno', { giorno: dataLunga(dati.data) }) + '" target="_blank" rel="noopener">scrivici su WhatsApp</a>';
      if (err && err.stato === 409 && err.dati && err.dati.errore === 'POSTO_ESAURITO') {
        /* il posto è stato preso nel frattempo: si ricaricano i posti */
        mostraErrore('Questo giorno si è appena riempito. Scegline un altro qui sopra oppure ' + wa + '.');
        stato.data = null;
        caricaDisponibilita().then(function () { vaiA(2); });
      } else {
        mostraErrore((err && err.dati && err.dati.messaggio) ||
          'Non siamo riusciti a registrare la prenotazione. Riprova tra un momento oppure ' + wa + ': ti rispondiamo in giornata.');
      }
    });
  }

  /* =============================================================
     Conferma
     ============================================================= */
  var ultima = null;
  function mostraSuccesso(dati, r) {
    var p = stato.pacchetto, demo = !!r.demo || !stato.reale;
    ultima = { codice: r.codice, dati: dati, pacchetto: p };

    $('[data-modulo-zona]').hidden = true;
    $('[data-barra-flusso]').hidden = true;
    var box = $('[data-successo]');
    box.hidden = false;

    $('[data-codice]').textContent = r.codice;
    $('[data-s-formula]').textContent = p.nome;
    $('[data-s-etichetta-giorno]').textContent = etichettaGiorno(p);
    $('[data-s-giorno]').textContent = p.tipoData === 'inizio' && p.id !== 'carnet'
      ? B.data(B.daIso(dati.data), 'breve') + ' → ' + B.data(fineMese(dati.data), 'breve')
      : maiuscola(dataLunga(dati.data));
    var prezzoFinale = r.prezzo != null ? r.prezzo / 100 : p.prezzo;
    $('[data-s-totale]').textContent = prezzoFinale === 0 ? 'Niente: già pagato' : B.euro(prezzoFinale);

    if (demo) {
      $('[data-successo-titolo]').textContent = 'Prenotazione pronta, ' + dati.nome + '!';
      $('[data-successo-sotto]').textContent = 'Manca solo l’invio: un tocco e il messaggio parte già compilato.';
      $('[data-successo-demo]').hidden = false;
      var riepilogo = [
        'Codice: ' + r.codice,
        'Formula: ' + p.nome + ' (' + B.euro(p.prezzo) + ')',
        etichettaGiorno(p) + ': ' + $('[data-s-giorno]').textContent,
        'Nome: ' + dati.nome + ' ' + dati.cognome,
        'Cellulare: ' + dati.telefono,
        'Email: ' + dati.email
      ];
      if (dati.piva_cf) riepilogo.push('Fattura a: ' + dati.piva_cf);
      if (dati.note) riepilogo.push('Note: ' + dati.note);
      $('[data-wa-conferma]').href = B.linkWa('conferma', { riepilogo: riepilogo.join('\n') });
      $('[data-wa-conferma]').target = '_blank';
      $('[data-wa-conferma]').rel = 'noopener';
    } else {
      $('[data-successo-titolo]').textContent = 'Prenotazione confermata, ' + dati.nome + '!';
      var sotto = r.emailInviata ? 'Ti abbiamo mandato il riepilogo a ' + dati.email + '. Ti aspettiamo!'
        : 'Salva il codice qui sotto: ti serve per gestire la prenotazione. Ti aspettiamo!';
      if (r.omaggio) sotto += ' Questa giornata è in omaggio con la tua Bagnarino Card.';
      else if (r.carnet) sotto += ' Ti restano ' + r.carnet.residui + ' ingressi nel carnet.';
      $('[data-successo-sotto]').textContent = sotto;
      var g = $('[data-gestisci]');
      g.href = '/prenotazione?codice=' + encodeURIComponent(r.codice) + '&email=' + encodeURIComponent(dati.email);
      g.hidden = false;
    }
    var dom = $('[data-wa-domanda]');
    dom.href = B.linkWa('domanda', { codice: r.codice });
    dom.target = '_blank'; dom.rel = 'noopener';

    /* in modalità dimostrativa non è un acquisto vero: evento separato,
       così le campagne non imparano da prenotazioni mai salvate */
    if (demo) B.traccia('prenotazione_demo', { value: p.prezzo, item_id: p.id });
    else B.traccia('purchase', { value: prezzoFinale, currency: 'EUR', transaction_id: r.codice, item_id: p.id, event_id: dati.event_id });
    window.scrollTo(0, 0);
    box.focus({ preventScroll: true });
  }

  /* file .ics: si apre nel calendario del telefono */
  $('[data-ics]').addEventListener('click', function () {
    if (!ultima) return;
    var d = ultima.dati.data.replace(/-/g, ''), p = ultima.pacchetto;
    function ora(hhmm) { var x = hhmm.split(':'); return (x[0].length < 2 ? '0' : '') + x[0] + x[1] + '00'; }
    function esc(t) { return String(t).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n'); }
    var luogo = C.azienda.indirizzo + ', ' + C.azienda.cap + ' ' + C.azienda.citta;
    var descr = 'Codice prenotazione ' + ultima.codice + '\n' + p.nome + ' – ' + B.euro(p.prezzo) + ', da pagare in sede.\n' +
      'Domande? WhatsApp ' + C.contatti.cellulareVisibile;
    var ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Bagnarino Coworking//Prenotazioni//IT', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:' + ultima.codice + '@bagnarino-coworking',
      'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''),
      'DTSTART:' + d + 'T' + ora(C.orari.apertura),
      'DTEND:' + d + 'T' + ora(C.orari.chiusura),
      'SUMMARY:' + esc('Coworking Bagnarino – ' + p.nome),
      'LOCATION:' + esc(luogo),
      'DESCRIPTION:' + esc(descr),
      'BEGIN:VALARM', 'TRIGGER:-PT1H', 'ACTION:DISPLAY', 'DESCRIPTION:' + esc('Coworking Bagnarino tra un’ora'), 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n');
    var url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    var a = document.createElement('a');
    a.href = url; a.download = 'bagnarino-coworking-' + ultima.codice + '.ics';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  });

  /* =============================================================
     Avvio
     ============================================================= */
  function caricaDisponibilita() {
    return B.disponibilita(inizio, giorni, stato.pacchetto && stato.pacchetto.id).then(function (r) {
      stato.reale = r.reale;
      stato.liberi = r.giorni;
      /* il giorno scelto non è più disponibile con questa formula */
      if (stato.data && !(r.giorni[stato.data] > 0)) {
        stato.data = null;
        $('[data-blocco="2"]').classList.remove('completo');
        aggiornaInfoGiorno(); aggiorna();
      }
      $('[data-avviso-demo]').hidden = r.reale;
      disegnaGiorni();
      return r;
    });
  }

  var q = new URLSearchParams(location.search);
  disegnaGiorni(); /* subito, con i posti "pieni di default": nessuna attesa visiva */
  if (B.pacchetto(q.get('pacchetto'))) scegliPacchetto(q.get('pacchetto'), false);
  aggiorna();
  B.traccia('begin_checkout', stato.pacchetto ? { item_id: stato.pacchetto.id, value: stato.pacchetto.prezzo, currency: 'EUR' } : {});

  caricaDisponibilita().then(function () {
    var dq = q.get('data');
    if (dq && /^\d{4}-\d{2}-\d{2}$/.test(dq)) scegliGiorno(dq, false);
  });
})();
