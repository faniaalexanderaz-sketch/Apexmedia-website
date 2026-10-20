/* =============================================================
   BAGNARINO COWORKING — area riservata (interfaccia)
   Cinque schede: Oggi, Calendario, Clienti, Incassi, Impostazioni.
   Tutti i dati arrivano da /api/admin; i grafici sono SVG fatti a
   mano (nessuna libreria). Ogni azione mostra un breve messaggio
   di conferma in basso.
   ============================================================= */
(function () {
  'use strict';
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return [].slice.call((c || document).querySelectorAll(s)); }
  function h(t) { return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function euro(c) { return '€' + (c / 100).toLocaleString('it-IT', { minimumFractionDigits: c % 100 ? 2 : 0, maximumFractionDigits: 2 }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function daIso(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function piu(s, n) { var d = daIso(s); d.setDate(d.getDate() + n); return iso(d); }
  function piuMesi(s, n) { var d = daIso(s); d.setMonth(d.getMonth() + n); return iso(d); }
  function dataTesto(s, op) { return daIso(s).toLocaleDateString('it-IT', op || { weekday: 'long', day: 'numeric', month: 'long' }); }
  function cap(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
  function tel(t) { return String(t || '').replace(/[^\d+]/g, ''); }
  function wa(t) { var n = String(t || '').replace(/\D/g, ''); if (/^3\d{8,9}$/.test(n)) n = '39' + n; return 'https://wa.me/' + n; }

  /* ---------- chiamate al server ---------- */
  function api(azione, opzioni) {
    opzioni = opzioni || {};
    var url = '/api/admin?azione=' + azione + (opzioni.query ? '&' + opzioni.query : '');
    var init = { credentials: 'same-origin', headers: {} };
    if (opzioni.dati) { init.method = 'POST'; init.headers['Content-Type'] = 'application/json'; init.body = JSON.stringify(opzioni.dati); }
    return fetch(url, init).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (r.status === 401 && azione !== 'login') { mostraAccesso(); throw new Error(j.messaggio || 'Accesso scaduto'); }
        if (r.status === 501) { avvisoDb(j.messaggio); }
        if (!r.ok) { var e = new Error(j.messaggio || 'Qualcosa non ha funzionato. Riprova.'); e.stato = r.status; throw e; }
        return j;
      });
    });
  }
  var timerToast;
  function toast(t, errore) {
    var el = $('[data-toast]');
    el.textContent = t; el.classList.toggle('errore', !!errore); el.hidden = false;
    clearTimeout(timerToast); timerToast = setTimeout(function () { el.hidden = true; }, 3200);
  }
  function avvisoDb(t) { var el = $('[data-avviso-db]'); el.textContent = t || 'Il database non è ancora collegato.'; el.hidden = false; }

  /* ---------- accesso ---------- */
  function mostraAccesso() { $('[data-vista="app"]').hidden = true; $('[data-vista="accesso"]').hidden = false; setTimeout(function () { $('#password').focus(); }, 50); }
  function mostraApp() { $('[data-vista="accesso"]').hidden = true; $('[data-vista="app"]').hidden = false; vai(schedaIniziale()); }
  $('[data-mostra]').addEventListener('click', function () {
    var p = $('#password'), vis = p.type === 'password';
    p.type = vis ? 'text' : 'password'; this.textContent = vis ? 'Nascondi' : 'Mostra';
  });
  $('[data-login]').addEventListener('submit', function (e) {
    e.preventDefault();
    var err = $('[data-login-errore]'); err.textContent = '';
    api('login', { dati: { password: $('#password').value } })
      .then(function () { $('#password').value = ''; mostraApp(); })
      .catch(function (x) { err.textContent = x.message; });
  });
  $('[data-esci]').addEventListener('click', function () { api('esci', { dati: {} }).then(mostraAccesso, mostraAccesso); });

  /* ---------- schede ---------- */
  var caricatori = {};
  function schedaIniziale() { var s = location.hash.slice(1); return caricatori[s] ? s : 'oggi'; }
  function vai(nome) {
    $$('[data-pannello]').forEach(function (p) { p.hidden = p.getAttribute('data-pannello') !== nome; });
    $$('[data-scheda]').forEach(function (b) { if (b.getAttribute('data-scheda') === nome) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
    if (location.hash.slice(1) !== nome) history.replaceState(null, '', '#' + nome);
    window.scrollTo(0, 0);
    caricatori[nome]();
  }
  $$('[data-scheda]').forEach(function (b) { b.addEventListener('click', function () { vai(b.getAttribute('data-scheda')); }); });

  /* =============================================================
     OGGI
     ============================================================= */
  function delta(a, b, cosa) {
    if (!b) return a ? '<span class="su">' + (cosa === 'mese' ? 'Primo mese con incassi' : 'Prima settimana con prenotazioni') + '</span>' : '';
    var p = Math.round((a - b) / b * 100);
    return '<span class="' + (p >= 0 ? 'su' : 'giu') + '">' + (p >= 0 ? '▲ +' : '▼ ') + p + '%</span> rispetto ' + (cosa === 'mese' ? 'al mese scorso' : 'alla settimana scorsa');
  }

  function schedaArrivo(a, conAzioni) {
    var mese = /^mese/.test(a.pacchetto);
    var stato = a.stato === 'presente' ? '<span class="arrivo-stato stato-presente">✓ Arrivato</span>'
      : a.stato === 'assente' ? '<span class="arrivo-stato stato-assente">Non è venuto</span>'
      : mese ? '<span class="arrivo-stato stato-mese">Abbonamento</span>' : '';
    var info = a.nomePacchetto + ' · ' + a.postazione +
      (mese ? ' · fino al ' + dataTesto(a.data_fine, { day: 'numeric', month: 'long' }) : '') +
      (a.omaggio ? ' · giornata omaggio' : a.carnet_id && a.pacchetto === 'giornata' ? ' · dal carnet' : '');
    var azioni = '';
    if (conAzioni && a.conPresenza && a.stato !== 'confermata') {
      azioni = '<button class="link-azione" type="button" data-presenza="confermata" data-id="' + a.id + '">Correggi</button>';
    } else if (conAzioni && a.conPresenza) {
      azioni = '<div class="arrivo-azioni">' +
        '<button class="btn btn-verde" type="button" data-presenza="presente" data-id="' + a.id + '">È arrivato</button>' +
        '<button class="btn btn-grigio" type="button" data-presenza="assente" data-id="' + a.id + '">Non è venuto</button></div>';
    }
    if (conAzioni && a.primoGiorno && !a.pagato && a.prezzo_centesimi > 0) {
      azioni += '<div class="incassa-scelta"><button class="btn btn-filo" type="button" data-incassa="contanti" data-id="' + a.id + '">Incassato ' + euro(a.prezzo_centesimi) + ' in contanti</button>' +
        '<button class="btn btn-filo" type="button" data-incassa="carta" data-id="' + a.id + '">Incassato ' + euro(a.prezzo_centesimi) + ' con carta</button></div>';
    } else if (a.pagato && a.prezzo_centesimi > 0 && conAzioni && a.primoGiorno) {
      azioni += '<p class="pagato-ok">✓ Pagato ' + euro(a.prezzo_centesimi) + (a.metodo_pagamento ? ' (' + a.metodo_pagamento + ')' : '') + '</p>';
    }
    return '<article class="arrivo">' +
      '<div class="arrivo-testa"><div><h3>' + h(a.nome + ' ' + a.cognome) + '</h3><p class="arrivo-info">' + h(info) + '</p>' +
      (a.note ? '<p class="arrivo-info">Nota: ' + h(a.note) + '</p>' : '') + '</div>' + stato + '</div>' +
      '<div class="arrivo-contatti"><a href="tel:' + h(tel(a.telefono)) + '"><svg class="ico" aria-hidden="true"><use href="#i-phone"/></svg>Chiama</a>' +
      '<a href="' + h(wa(a.telefono)) + '" target="_blank" rel="noopener"><svg class="ico" aria-hidden="true"><use href="#i-whatsapp"/></svg>WhatsApp</a></div>' +
      azioni + '</article>';
  }

  /* grafico a barre: SVG semplice, valori scritti sopra ogni barra */
  function grafico(valori, etichette, formato, colore) {
    var W = 520, H = 220, basso = 34, alto = 26, max = Math.max.apply(null, valori.concat([1]));
    var passo = W / valori.length, larg = Math.min(46, passo * 0.62);
    var barre = valori.map(function (v, i) {
      var hh = Math.round((H - basso - alto) * v / max), x = Math.round(i * passo + (passo - larg) / 2), y = H - basso - hh;
      return '<rect x="' + x + '" y="' + y + '" width="' + Math.round(larg) + '" height="' + Math.max(hh, v ? 3 : 0) + '" rx="6" fill="' + (i === valori.length - 1 ? colore : '#C5CDD6') + '"/>' +
        '<text class="valore" x="' + (x + larg / 2) + '" y="' + (y - 8) + '" text-anchor="middle" font-size="15">' + formato(v) + '</text>' +
        '<text x="' + (x + larg / 2) + '" y="' + (H - 10) + '" text-anchor="middle" font-size="14">' + h(etichette[i]) + '</text>';
    }).join('');
    return '<svg class="grafico" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + h(etichette.map(function (e, i) { return e + ': ' + formato(valori[i]); }).join(', ')) + '">' +
      '<line x1="0" x2="' + W + '" y1="' + (H - basso) + '" y2="' + (H - basso) + '" stroke="#E2DDD1" stroke-width="2"/>' + barre + '</svg>';
  }

  caricatori.oggi = function () {
    var ora = new Date().getHours();
    $('[data-saluto]').textContent = (ora < 13 ? 'Buongiorno' : ora < 18 ? 'Buon pomeriggio' : 'Buonasera') + ', Marcella';
    $('[data-data-oggi]').textContent = cap(new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }));
    return api('oggi').then(function (d) {
      var k = d.kpi;
      $('[data-k-incasso]').textContent = euro(k.incassoMese);
      $('[data-k-incasso-d]').innerHTML = delta(k.incassoMese, k.incassoMesePrima, 'mese');
      $('[data-k-sett]').textContent = k.settimana;
      $('[data-k-sett-d]').innerHTML = delta(k.settimana, k.settimanaPrima, 'settimana');
      $('[data-k-occ]').textContent = k.occupate + ' su ' + k.postazioni;
      $('[data-k-occ-barra]').style.width = Math.min(100, Math.round(k.occupate / Math.max(1, k.postazioni) * 100)) + '%';
      var inc = $('[data-da-incassare]');
      inc.hidden = !k.daIncassare;
      inc.textContent = 'Da incassare: ' + euro(k.daIncassare) + ' (' + k.daIncassareN + (k.daIncassareN === 1 ? ' prenotazione' : ' prenotazioni') + ') →';
      inc.onclick = function () { vai('incassi'); };

      $('[data-arrivi-oggi]').innerHTML = d.arriviOggi.length ? d.arriviOggi.map(function (a) { return schedaArrivo(a, true); }).join('')
        : '<p class="vuoto">Oggi non arriva nessuno.</p>';
      var rel = d.prossimo === piu(d.oggi, 1) ? 'domani' : dataTesto(d.prossimo, { weekday: 'long' });
      $('[data-titolo-prossimo]').textContent = 'Chi arriva ' + (rel === 'domani' ? 'domani' : rel) + ' (' + dataTesto(d.prossimo, { day: 'numeric', month: 'long' }) + ')';
      $('[data-arrivi-prossimo]').innerHTML = d.arriviProssimo.length ? d.arriviProssimo.map(function (a) { return schedaArrivo(a, false); }).join('')
        : '<p class="vuoto">Per ora nessuna prenotazione.</p>';

      $('[data-grafico-settimane]').innerHTML = grafico(d.settimane.map(function (s) { return s.n; }),
        d.settimane.map(function (s) { return dataTesto(s.inizio, { day: 'numeric', month: 'numeric' }); }), String, '#1B2A3A');
      $('[data-grafico-mesi]').innerHTML = grafico(d.mesi.map(function (m) { return Math.round(m.centesimi / 100); }),
        d.mesi.map(function (m) { return dataTesto(m.inizio, { month: 'short' }).replace('.', ''); }), function (v) { return '€' + v; }, '#C9973B');
      var tot = d.fonti.reduce(function (t, f) { return t + f.n; }, 0);
      $('[data-fonti]').innerHTML = tot ? d.fonti.map(function (f) {
        return '<div class="fonte"><span>' + h(f.fonte) + '</span><strong>' + f.n + '</strong><div class="fonte-barra"><span style="width:' + Math.round(f.n / tot * 100) + '%"></span></div></div>';
      }).join('') : '<p class="vuoto">Ancora nessuna prenotazione.</p>';
    }).catch(function (e) { if (e.stato !== 501) toast(e.message, true); });
  };

  /* azioni sugli arrivi: presenza e incasso */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-presenza]');
    if (b) {
      b.disabled = true;
      api('presenza', { dati: { id: +b.getAttribute('data-id'), stato: b.getAttribute('data-presenza') } }).then(function (r) {
        toast(r.stato === 'presente' ? (r.premio ? '🎁 Arrivato! Ha appena guadagnato una giornata in omaggio.' : 'Arrivato. Timbri sulla card: ' + r.timbri + ' su 10.')
          : r.stato === 'assente' ? 'Segnato: non è venuto.' : 'Corretto: di nuovo in attesa.');
        caricatori.oggi();
      }).catch(function (x) { b.disabled = false; toast(x.message, true); });
      return;
    }
    var c = e.target.closest('[data-incassa]');
    if (c) {
      c.disabled = true;
      api('pagato', { dati: { id: +c.getAttribute('data-id'), pagato: true, metodo: c.getAttribute('data-incassa') } }).then(function () {
        toast('Incasso registrato.');
        var p = $('[data-pannello="incassi"]');
        if (!p.hidden) caricatori.incassi(); else caricatori.oggi();
      }).catch(function (x) { c.disabled = false; toast(x.message, true); });
      return;
    }
    var n = e.target.closest('[data-non-pagato]');
    if (n) {
      api('pagato', { dati: { id: +n.getAttribute('data-id'), pagato: false } }).then(function () { toast('Segnato come da incassare.'); caricatori.incassi(); })
        .catch(function (x) { toast(x.message, true); });
    }
  });

  /* =============================================================
     CALENDARIO
     ============================================================= */
  var calDa = null;
  caricatori.calendario = function () {
    return api('calendario', { query: calDa ? 'da=' + calDa : '' }).then(function (d) {
      calDa = d.inizio;
      $('[data-cal-titolo]').textContent = dataTesto(d.inizio, { day: 'numeric', month: 'long' }) + ' – ' + dataTesto(piu(d.inizio, 6), { day: 'numeric', month: 'long' });
      $('[data-settimana]').innerHTML = d.giorni.map(function (g) {
        var weekend = [0, 6].indexOf(daIso(g.data).getDay()) !== -1;
        if (weekend && !g.posti.some(function (p) { return p.prenotazione; })) return '';
        var occupati = g.posti.filter(function (p) { return p.prenotazione; }).length;
        var stato = g.aperto ? occupati + ' su ' + g.posti.length + ' occupate'
          : g.chiusoDaTe ? 'Chiuso' + (g.motivo ? ': ' + h(g.motivo) : '') : g.festivo ? 'Festivo' : 'Chiuso';
        var bottone = g.data < d.oggi || weekend || g.festivo ? ''
          : g.chiusoDaTe ? '<button class="link-azione" type="button" data-riapri="' + g.data + '">Riapri questo giorno</button>'
          : '<button class="link-azione" type="button" data-chiudi="' + g.data + '">Chiudi questo giorno</button>';
        return '<article class="giorno-cal' + (g.data === d.oggi ? ' oggi' : '') + (g.aperto ? '' : ' chiuso') + '">' +
          '<div class="giorno-cal-testa"><h2>' + cap(dataTesto(g.data)) + '</h2><span>' + stato + '</span></div>' +
          (g.aperto ? g.posti.map(function (p) {
            var r = p.prenotazione;
            return '<div class="posto"><span class="posto-nome">' + h(p.postazione) + '</span>' +
              (r ? '<span class="posto-chi">' + h(r.nome) + '<small>' + h(r.pacchetto) + ' · <a href="tel:' + h(tel(r.telefono)) + '">' + h(r.telefono) + '</a> · ' +
                '<button class="link-azione" type="button" data-annulla-id="' + r.id + '" data-chi="' + h(r.nome) + '">annulla</button></small></span>'
                : '<span class="posto-libero">Libera</span>') + '</div>';
          }).join('') : '') + bottone + '</article>';
      }).join('');
    }).catch(function (e) { if (e.stato !== 501) toast(e.message, true); });
  };
  $('[data-cal-prima]').addEventListener('click', function () { calDa = piu(calDa, -7); caricatori.calendario(); });
  $('[data-cal-dopo]').addEventListener('click', function () { calDa = piu(calDa, 7); caricatori.calendario(); });
  $('[data-settimana]').addEventListener('click', function (e) {
    var c = e.target.closest('[data-chiudi]'), r = e.target.closest('[data-riapri]'), a = e.target.closest('[data-annulla-id]');
    if (c) {
      var motivo = prompt('Perché chiudi ' + dataTesto(c.getAttribute('data-chiudi')) + '? (es. ferie, ponte)', 'Chiuso');
      if (motivo === null) return;
      api('chiusura', { dati: { data: c.getAttribute('data-chiudi'), motivo: motivo, chiudi: true } }).then(function (x) {
        toast(x.giaPrenotati ? 'Giorno chiuso. Attenzione: ci sono ' + x.giaPrenotati + ' prenotazioni da avvisare.' : 'Giorno chiuso: nessuno potrà prenotarlo.');
        caricatori.calendario();
      }).catch(function (x) { toast(x.message, true); });
    }
    if (r) api('chiusura', { dati: { data: r.getAttribute('data-riapri'), chiudi: false } }).then(function () { toast('Giorno riaperto.'); caricatori.calendario(); });
    if (a && confirm('Annullare la prenotazione di ' + a.getAttribute('data-chi') + '? Il posto torna libero e il cliente riceve un’email.')) {
      api('annulla', { dati: { id: +a.getAttribute('data-annulla-id') } }).then(function () { toast('Prenotazione annullata.'); caricatori.calendario(); })
        .catch(function (x) { toast(x.message, true); });
    }
  });

  /* nuova prenotazione a mano */
  var listinoCache = null;
  function riempiFormule() {
    var sel = $('[data-sel-pacchetto]');
    if (sel.options.length) return Promise.resolve();
    return api('impostazioni').then(function (d) {
      listinoCache = d;
      sel.innerHTML = d.listino.map(function (p) { return '<option value="' + p.id + '">' + h(p.nome) + ' – €' + p.prezzo + '</option>'; }).join('');
    });
  }
  $('[data-nuova]').addEventListener('click', function () {
    riempiFormule().then(function () {
      var f = $('[data-modulo-nuova]'); f.hidden = false;
      var oggi = iso(new Date());
      f.data.value = calDa && calDa > oggi ? calDa : oggi;
      f.nome.focus();
    }).catch(function (x) { toast(x.message, true); });
  });
  $('[data-annulla-nuova]').addEventListener('click', function () { $('[data-modulo-nuova]').hidden = true; });
  $('[data-modulo-nuova]').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = this, dati = {};
    ['nome', 'cognome', 'telefono', 'email', 'pacchetto', 'data', 'note'].forEach(function (k) { dati[k] = f[k].value.trim(); });
    if (dati.nome.length < 2 || dati.cognome.length < 2 || dati.telefono.replace(/\D/g, '').length < 8 || !dati.data) {
      toast('Servono nome, cognome, telefono e giorno.', true); return;
    }
    api('prenotazione', { dati: dati }).then(function (r) {
      toast('Prenotazione salvata: ' + r.codice);
      f.reset(); f.hidden = true;
      calDa = dati.data; caricatori.calendario();
    }).catch(function (x) { toast(x.message, true); });
  });

  /* =============================================================
     CLIENTI
     ============================================================= */
  var timerCerca;
  caricatori.clienti = function () {
    var cerca = $('[data-cerca]').value;
    return api('clienti', { query: 'cerca=' + encodeURIComponent(cerca) }).then(function (d) {
      $('[data-clienti]').innerHTML = d.clienti.length ? d.clienti.map(function (c) {
        return '<article class="cliente"><h3>' + h(c.nome + ' ' + c.cognome) + '</h3>' +
          '<div class="etichette">' + (c.abituale ? '<span class="etichetta etichetta-verde">Abituale</span>' : '') +
          (c.daRichiamare ? '<span class="etichetta etichetta-ocra">Da richiamare</span>' : '') + '</div>' +
          '<div class="arrivo-contatti"><a href="tel:' + h(tel(c.telefono)) + '"><svg class="ico" aria-hidden="true"><use href="#i-phone"/></svg>' + h(c.telefono) + '</a>' +
          '<a href="' + h(wa(c.telefono)) + '" target="_blank" rel="noopener"><svg class="ico" aria-hidden="true"><use href="#i-whatsapp"/></svg>WhatsApp</a>' +
          (c.email ? '<a href="mailto:' + h(c.email) + '">Email</a>' : '') + '</div>' +
          '<dl class="cliente-dati">' +
            '<div><dt>Prenotazioni</dt><dd>' + c.prenotazioni + '</dd></div>' +
            '<div><dt>Totale speso</dt><dd>' + euro(c.speso) + '</dd></div>' +
            '<div><dt>Carnet</dt><dd>' + (c.carnet ? c.carnet + ' ingressi' : '—') + '</dd></div>' +
            '<div><dt>Card</dt><dd>' + c.timbri + ' su 10' + (c.omaggi ? ' · 🎁 ' + c.omaggi : '') + '</dd></div>' +
            '<div><dt>Ultimo ingresso</dt><dd>' + (c.ultimo ? dataTesto(c.ultimo, { day: 'numeric', month: 'short' }) : '—') + '</dd></div>' +
          '</dl>' + (c.piva_cf ? '<p class="nota">Fattura a: ' + h(c.piva_cf) + '</p>' : '') + '</article>';
      }).join('') : '<p class="vuoto">' + (cerca ? 'Nessun cliente trovato.' : 'Ancora nessun cliente.') + '</p>';
    }).catch(function (e) { if (e.stato !== 501) toast(e.message, true); });
  };
  $('[data-cerca]').addEventListener('input', function () { clearTimeout(timerCerca); timerCerca = setTimeout(caricatori.clienti, 250); });

  /* =============================================================
     INCASSI
     ============================================================= */
  var incPeriodo = 'mese', incDa = iso(new Date());
  caricatori.incassi = function () {
    $$('[data-periodo]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-periodo') === incPeriodo); });
    return api('incassi', { query: 'periodo=' + incPeriodo + '&da=' + incDa }).then(function (d) {
      $('[data-inc-titolo]').textContent = incPeriodo === 'giorno' ? dataTesto(d.inizio)
        : incPeriodo === 'settimana' ? dataTesto(d.inizio, { day: 'numeric', month: 'short' }) + ' – ' + dataTesto(d.fine, { day: 'numeric', month: 'short' })
        : dataTesto(d.inizio, { month: 'long', year: 'numeric' });
      $('[data-inc-incassato]').textContent = euro(d.totali.incassato);
      $('[data-inc-previsto]').textContent = euro(d.totali.previsto);
      $('[data-righe-incassi]').innerHTML = d.righe.length ? d.righe.map(function (r) {
        var gratis = r.prezzo_centesimi === 0;
        return '<article class="riga-incasso"><div class="riga-incasso-testa"><strong>' + h(r.nome + ' ' + r.cognome) + '</strong>' +
          '<span class="riga-importo">' + (gratis ? '€0' : euro(r.prezzo_centesimi)) + '</span></div>' +
          '<p>' + dataTesto(r.data, { weekday: 'short', day: 'numeric', month: 'short' }) + ' · ' + h(r.nomePacchetto) +
          (r.omaggio ? ' · omaggio' : r.carnet_id && r.pacchetto === 'giornata' ? ' · dal carnet' : '') + (r.piva_cf ? ' · fattura ' + h(r.piva_cf) : '') + '</p>' +
          (gratis ? '' : r.pagato
            ? '<div class="pagato-ok"><span>✓ Pagato' + (r.metodo_pagamento ? ' (' + r.metodo_pagamento + ')' : '') + '</span><button class="link-azione" type="button" data-non-pagato data-id="' + r.id + '">Annulla</button></div>'
            : '<div class="incassa-scelta"><button class="btn btn-filo" type="button" data-incassa="contanti" data-id="' + r.id + '">Contanti</button>' +
              '<button class="btn btn-filo" type="button" data-incassa="carta" data-id="' + r.id + '">Carta</button></div>') +
          '</article>';
      }).join('') : '<p class="vuoto">Nessuna prenotazione in questo periodo.</p>';
      $('[data-csv]').href = '/api/admin?azione=csv&da=' + d.inizio + '&a=' + d.fine;
      $('[data-csv]').setAttribute('download', 'incassi-bagnarino-' + d.inizio + '.csv');
    }).catch(function (e) { if (e.stato !== 501) toast(e.message, true); });
  };
  $$('[data-periodo]').forEach(function (b) { b.addEventListener('click', function () { incPeriodo = b.getAttribute('data-periodo'); caricatori.incassi(); }); });
  function spostaInc(segno) {
    incDa = incPeriodo === 'giorno' ? piu(incDa, segno) : incPeriodo === 'settimana' ? piu(incDa, 7 * segno) : piuMesi(incDa.slice(0, 8) + '01', segno);
    caricatori.incassi();
  }
  $('[data-inc-prima]').addEventListener('click', function () { spostaInc(-1); });
  $('[data-inc-dopo]').addEventListener('click', function () { spostaInc(1); });

  /* =============================================================
     IMPOSTAZIONI
     ============================================================= */
  var ETICHETTE_WA = {
    generico: 'Domanda generica', prenota: 'Voglio prenotare', giorno: 'Prenotare un giorno preciso ({giorno})',
    pacchetto: 'Informazioni su una formula ({pacchetto})', visita: 'Vedere lo spazio prima', domanda: 'Domanda su una prenotazione ({codice})',
    conferma: 'Conferma prenotazione (sito in prova) ({riepilogo})'
  };
  function hhmm(s) { var p = String(s).split(':'); return pad(+p[0]) + ':' + p[1]; }
  caricatori.impostazioni = function () {
    return api('impostazioni').then(function (d) {
      listinoCache = d;
      $('[data-imp-prezzi]').innerHTML = d.listino.map(function (p) {
        return '<label class="prezzo-campo"><span>' + h(p.nome) + ' <small class="nota">' + h(p.unita) + '</small></span>' +
          '<span class="euro-input"><input type="number" inputmode="decimal" min="0" max="5000" step="1" name="prezzo-' + p.id + '" value="' + p.prezzo + '" aria-label="Prezzo ' + h(p.nome) + '"></span></label>';
      }).join('');
      $('[data-imp-postazioni]').value = d.postazioni;
      $('[data-imp-postazioni]').textContent = d.postazioni;
      $('[data-imp-apertura]').value = hhmm(d.orari.apertura);
      $('[data-imp-chiusura]').value = hhmm(d.orari.chiusura);
      $('[data-imp-chiusure]').innerHTML = d.chiusure.length ? d.chiusure.map(function (c) {
        return '<li><span><strong>' + dataTesto(c.data) + '</strong>' + (c.motivo ? ' · ' + h(c.motivo) : '') + '</span>' +
          '<button class="link-azione" type="button" data-riapri-imp="' + c.data + '">Riapri</button></li>';
      }).join('') : '<li>Nessuna chiusura in programma.</li>';
      $('[data-imp-wa]').innerHTML = Object.keys(d.whatsappTesti).map(function (k) {
        return '<label class="campo-wa">' + h(ETICHETTE_WA[k] || k) + '<textarea name="wa-' + k + '">' + h(d.whatsappTesti[k]) + '</textarea></label>';
      }).join('');
    }).catch(function (e) { if (e.stato !== 501) toast(e.message, true); });
  };
  function cambiaPostazioni(n) {
    var o = $('[data-imp-postazioni]'), v = Math.max(1, Math.min(60, (+o.textContent || 1) + n));
    o.textContent = v; o.value = v;
  }
  $('[data-post-meno]').addEventListener('click', function () { cambiaPostazioni(-1); });
  $('[data-post-piu]').addEventListener('click', function () { cambiaPostazioni(1); });
  $('[data-ch-aggiungi]').addEventListener('click', function () {
    var d = $('[data-ch-data]').value;
    if (!d) { toast('Scegli prima il giorno.', true); return; }
    api('chiusura', { dati: { data: d, motivo: $('[data-ch-motivo]').value || 'Chiuso', chiudi: true } }).then(function (x) {
      toast(x.giaPrenotati ? 'Giorno chiuso. Ci sono ' + x.giaPrenotati + ' prenotazioni da avvisare.' : 'Giorno chiuso.');
      $('[data-ch-data]').value = ''; $('[data-ch-motivo]').value = '';
      caricatori.impostazioni();
    }).catch(function (x) { toast(x.message, true); });
  });
  $('[data-imp-chiusure]').addEventListener('click', function (e) {
    var b = e.target.closest('[data-riapri-imp]');
    if (b) api('chiusura', { dati: { data: b.getAttribute('data-riapri-imp'), chiudi: false } }).then(function () { toast('Giorno riaperto.'); caricatori.impostazioni(); });
  });
  $('[data-impostazioni]').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = this, wa = {};
    Object.keys(ETICHETTE_WA).forEach(function (k) { if (f['wa-' + k]) wa[k] = f['wa-' + k].value; });
    var dati = {
      listino: (listinoCache ? listinoCache.listino : []).map(function (p) { return { id: p.id, prezzo: f['prezzo-' + p.id].value }; }),
      postazioni: +$('[data-imp-postazioni]').textContent,
      orari: { apertura: $('[data-imp-apertura]').value, chiusura: $('[data-imp-chiusura]').value },
      whatsappTesti: wa
    };
    api('impostazioni', { dati: dati }).then(function () { toast('Salvato. Il sito si aggiorna entro un minuto.'); caricatori.impostazioni(); $('[data-sel-pacchetto]').innerHTML = ''; })
      .catch(function (x) { toast(x.message, true); });
  });

  /* ---------- avvio: se la sessione è valida si entra direttamente ---------- */
  api('oggi').then(function () { mostraApp(); }).catch(function (e) {
    if (e.stato === 501) { mostraApp(); return; }
    mostraAccesso();
  });
})();
