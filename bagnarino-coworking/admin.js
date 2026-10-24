/* =============================================================
   BAGNARINO COWORKING — area riservata (interfaccia)
   Cinque schede: Oggi, Calendario, Clienti, Incassi, Crescita
   (+ Impostazioni dall'ingranaggio in alto).
   Due ruoli: "titolare" (Marcella) e "apex" (Apex Media): solo
   Apex vede il pulsante per aggiornare i numeri di marketing.
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
    clearTimeout(timerToast); timerToast = setTimeout(function () { el.hidden = true; }, t.indexOf('🎁') === 0 ? 9000 : 3200);
  }
  function avvisoDb(t) { var el = $('[data-avviso-db]'); el.textContent = t || 'Il database non è ancora collegato.'; el.hidden = false; }

  /* ---------- accesso ---------- */
  function nascondiCaricamento() { var c = $('[data-vista="caricamento"]'); if (c) c.hidden = true; }
  function mostraAccesso() { nascondiCaricamento(); $('[data-vista="app"]').hidden = true; $('[data-vista="accesso"]').hidden = false; setTimeout(function () { $('#password').focus(); }, 50); }
  function mostraApp() { nascondiCaricamento(); $('[data-vista="accesso"]').hidden = true; $('[data-vista="app"]').hidden = false; vai(schedaIniziale()); }
  $('[data-mostra]').addEventListener('click', function () {
    var p = $('#password'), vis = p.type === 'password';
    p.type = vis ? 'text' : 'password'; this.textContent = vis ? 'Nascondi' : 'Mostra';
  });
  $('[data-login]').addEventListener('submit', function (e) {
    e.preventDefault();
    var err = $('[data-login-errore]'); err.textContent = '';
    api('login', { dati: { password: $('#password').value } })
      .then(function (r) { ruolo = r.ruolo || 'titolare'; $('#password').value = ''; mostraApp(); apriDaEmail(); })
      .catch(function (x) { err.textContent = x.message; });
  });
  $('[data-esci]').addEventListener('click', function () { api('esci', { dati: {} }).then(mostraAccesso, mostraAccesso); });

  /* ---------- schede ---------- */
  var caricatori = {};
  var ruolo = 'titolare';
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
     OGGI — le cose da fare adesso, le richieste da accettare e
     chi arriva. Ogni prenotazione ha tre passi:
       1 Accettata → 2 È arrivato → 3 Pagato
     Ogni riga mostra un solo pulsante: il passo che viene dopo.
     Toccando la riga si apre la scheda con tutte le funzioni.
     ============================================================= */
  var oggiIso = iso(new Date());
  function delta(a, b, cosa) {
    if (!b) return a ? '<span class="su">' + (cosa === 'mese' ? 'Primo mese con incassi' : 'Prima settimana con prenotazioni') + '</span>' : '';
    var p = Math.round((a - b) / b * 100);
    return '<span class="' + (p >= 0 ? 'su' : 'giu') + '">' + (p >= 0 ? '▲ +' : '▼ ') + p + '%</span> rispetto ' + (cosa === 'mese' ? 'al mese scorso' : 'alla settimana scorsa');
  }
  function giornoBreve(s) { return cap(dataTesto(s, { weekday: 'short', day: 'numeric', month: 'short' }).replace(/\./g, '')); }
  function isMese(a) { return /^mese/.test(a.pacchetto); }
  function conArrivo(a) { return a.pacchetto === 'giornata' || a.pacchetto === 'carnet'; }
  function postoBreve(t) { return String(t || '').replace(/^(Postazione|Scrivania)\s*/i, 'Scr. '); }
  function prezzoTesto(a) { return a.prezzo_centesimi ? euro(a.prezzo_centesimi) : a.omaggio ? 'in regalo' : 'dal carnet'; }

  /* a che punto è una prenotazione e qual è il passo successivo */
  function situazione(a) {
    var gratis = !a.prezzo_centesimi, pagatoOk = a.pagato || gratis, arrivo = conArrivo(a);
    var iniziata = a.data_inizio <= oggiIso;
    var passi = [
      { nome: 'Accettata', fatto: a.accettata },
      arrivo ? { nome: a.stato === 'assente' ? 'Non è venuto' : 'Arrivato', fatto: a.stato === 'presente', no: a.stato === 'assente' }
             : { nome: 'Abbonamento', fatto: true },
      { nome: gratis ? 'Niente da pagare' : 'Pagato', fatto: pagatoOk }
    ];
    var azione = null;
    if (a.stato === 'annullata') azione = null;
    else if (!a.accettata) azione = 'accetta';
    else if (arrivo && a.stato === 'confermata' && iniziata) azione = 'arrivato';
    else if (!pagatoOk && a.stato !== 'assente' && iniziata) azione = 'incassa';
    var fatto = a.accettata && pagatoOk && (!arrivo || a.stato === 'presente');
    return { passi: passi, azione: azione, assente: a.stato === 'assente', fatto: fatto, iniziata: iniziata };
  }
  function passiHtml(s) {
    return '<ol class="passi-mini">' + s.passi.map(function (p) {
      return '<li class="' + (p.fatto ? 'fatto' : p.no ? 'no' : '') + '">' + (p.fatto ? '✓ ' : p.no ? '✕ ' : '') + h(p.nome) + '</li>';
    }).join('') + '</ol>';
  }
  function bottoneAzione(a, azione) {
    if (azione === 'accetta') return '<button class="btn btn-s btn-ocra" type="button" data-accetta="' + a.id + '"><svg class="ico" aria-hidden="true"><use href="#i-check"/></svg>Accetta</button>';
    if (azione === 'arrivato') return '<button class="btn btn-s btn-verde" type="button" data-presenza="presente" data-id="' + a.id + '"><svg class="ico" aria-hidden="true"><use href="#i-user-check"/></svg>È arrivato</button>';
    if (azione === 'incassa') return '<button class="btn btn-s btn-pieno" type="button" data-apri-incasso="' + a.id + '"><svg class="ico" aria-hidden="true"><use href="#i-euro"/></svg>Incassa ' + euro(a.prezzo_centesimi) + '</button>';
    return '';
  }
  function rigaPren(a, richiesta) {
    var s = situazione(a);
    var quando = richiesta ? giornoBreve(a.data_inizio) : postoBreve(a.postazione);
    var info = h(a.nomePacchetto) + ' · ' + prezzoTesto(a) +
      (isMese(a) ? ' · fino al ' + dataTesto(a.data_fine, { day: 'numeric', month: 'short' }) : '') +
      (richiesta && a.fonte ? ' · dal sito, via ' + h(a.fonte) : '');
    var destra = s.azione ? bottoneAzione(a, s.azione)
      : s.assente ? '<span class="pill pill-rosso">Non è venuto</span>'
      : s.fatto ? '<span class="pill pill-verde">✓ Tutto fatto</span>'
      : '<span class="pill">In attesa</span>';
    return '<article class="pren' + (s.fatto ? ' pren-fatta' : '') + (s.assente ? ' pren-assente' : '') + (!a.accettata ? ' pren-nuova' : '') + '" data-apri="' + a.id + '" tabindex="0" role="button" aria-label="Apri la prenotazione di ' + h(a.nome + ' ' + a.cognome) + '">' +
      '<div class="pren-quando">' + h(quando) + '</div>' +
      '<div class="pren-corpo"><p class="pren-nome">' + h(a.nome + ' ' + a.cognome) + '</p><p class="pren-info">' + info + '</p>' + passiHtml(s) + '</div>' +
      '<div class="pren-azione">' + destra + '<span class="pren-apri">Dettagli ›</span></div></article>';
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

  function aggiornaBadge(n) {
    var b = $('[data-badge]');
    b.hidden = !n; b.textContent = n > 9 ? '9+' : n;
  }

  caricatori.oggi = function () {
    var ora = new Date().getHours();
    oggiIso = iso(new Date());
    $('[data-saluto]').textContent = ruolo === 'apex' ? 'Ciao, Apex Media' : (ora < 13 ? 'Buongiorno' : ora < 18 ? 'Buon pomeriggio' : 'Buonasera') + ', Marcella';
    $('[data-data-oggi]').textContent = cap(new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }));
    return api('oggi').then(function (d) {
      var k = d.kpi, rich = d.richieste || [];
      oggiIso = d.oggi;

      /* la giornata in quattro riquadri: scrivanie, richieste, arrivi, incassi */
      var daSegnare = d.arriviOggi.filter(function (a) { return situazione(a).azione === 'arrivato'; }).length;
      var libere = Math.max(0, k.postazioni - k.occupate), scrivanie = '';
      for (var i = 0; i < k.postazioni; i++) scrivanie += '<i class="' + (i < k.occupate ? 'piena' : '') + '"></i>';
      function riquadro(o) {
        return '<button type="button" class="cr' + (o.fatto ? ' cr-fatto' : '') + '" style="--c:' + o.c + ';--c-chiaro:' + o.chiaro + '"' + (o.vai ? ' ' + o.vai : '') + '>' +
          '<span class="cr-icona"><svg class="ico" aria-hidden="true"><use href="#i-' + (o.fatto ? 'check' : o.icona) + '"/></svg></span>' +
          '<span class="cr-nome">' + o.nome + '</span><strong class="cr-valore">' + o.valore + '</strong>' +
          (o.extra || '') + '<span class="cr-spiega">' + o.spiega + '</span></button>';
      }
      $('[data-cruscotto]').innerHTML = [
        riquadro({ icona: 'scrivania', c: '#1B2A3A', chiaro: '#DDE3EA', nome: 'Scrivanie oggi', valore: k.occupate + '<small> su ' + k.postazioni + '</small>',
          extra: '<span class="cr-scrivanie" aria-hidden="true">' + scrivanie + '</span>',
          spiega: libere ? libere + (libere === 1 ? ' libera: si può ancora prenotare' : ' libere: si può ancora prenotare') : 'Tutte occupate', vai: 'data-vai-scheda="calendario"' }),
        riquadro({ icona: 'inbox', c: '#B4620A', chiaro: '#FDF0DC', nome: 'Da accettare', valore: rich.length, fatto: !rich.length,
          spiega: rich.length ? (rich.length === 1 ? 'Richiesta arrivata dal sito' : 'Richieste arrivate dal sito') : 'Nessuna richiesta in attesa', vai: rich.length ? 'data-vai-a="[data-blocco-richieste]"' : '' }),
        riquadro({ icona: 'user-check', c: '#166A3A', chiaro: '#DCEFE2', nome: 'Arrivi da segnare', valore: daSegnare, fatto: !daSegnare,
          spiega: daSegnare ? 'Tocca «È arrivato» quando entrano' : d.arriviOggi.length ? 'Tutti segnati' : 'Oggi non arriva nessuno', vai: 'data-vai-a="[data-arrivi-oggi]"' }),
        riquadro({ icona: 'euro', c: '#9A6B12', chiaro: '#F5DFAE', nome: 'Da incassare', valore: euro(k.daIncassare), fatto: !k.daIncassare,
          spiega: k.daIncassare ? k.daIncassareN + (k.daIncassareN === 1 ? ' prenotazione da far pagare' : ' prenotazioni da far pagare') : 'Tutto incassato', vai: 'data-vai-scheda="incassi"' })
      ].join('');
      aggiornaBadge(rich.length);

      /* richieste da accettare */
      $('[data-blocco-richieste]').hidden = !rich.length;
      $('[data-n-richieste]').textContent = rich.length;
      $('[data-richieste]').innerHTML = rich.map(function (a) { return rigaPren(a, true); }).join('');

      /* arrivi */
      $('[data-oggi-occ]').textContent = k.occupate + ' su ' + k.postazioni + ' scrivanie occupate';
      $('[data-arrivi-oggi]').innerHTML = d.arriviOggi.length ? d.arriviOggi.map(function (a) { return rigaPren(a, false); }).join('')
        : '<p class="vuoto">Oggi non arriva nessuno.</p>';
      var rel = d.prossimo === piu(d.oggi, 1) ? 'domani' : dataTesto(d.prossimo, { weekday: 'long' });
      $('[data-titolo-prossimo]').textContent = 'Chi arriva ' + rel + ' (' + dataTesto(d.prossimo, { day: 'numeric', month: 'long' }) + ')';
      $('[data-arrivi-prossimo]').innerHTML = d.arriviProssimo.length ? d.arriviProssimo.map(function (a) { return rigaPren(a, false); }).join('')
        : '<p class="vuoto">Per ora nessuna prenotazione.</p>';

      /* come va il mese: ogni numero con accanto il suo andamento */
      var nomeMeseOra = dataTesto(d.oggi, { month: 'long' }), nomeMesePrima = dataTesto(piuMesi(d.oggi.slice(0, 8) + '01', -1), { month: 'long' });
      function confrontoTesto(a, b, rispetto) {
        if (!b) return a ? '<span class="cre-var su">Primo dato</span>' : '';
        var p = Math.round((a - b) / b * 100);
        return '<span class="cre-var ' + (p > 0 ? 'su' : p < 0 ? 'giu' : '') + '">' + (p > 0 ? '▲ +' : p < 0 ? '▼ ' : '= ') + p + '%</span> ' + rispetto;
      }
      $('[data-andamento]').innerHTML =
        '<article class="and" style="--c:#1E6B52;--c-chiaro:#D6EADF"><div class="and-testa"><span class="cr-icona"><svg class="ico" aria-hidden="true"><use href="#i-euro"/></svg></span>' +
          '<div><p class="and-nome">Incassato a ' + nomeMeseOra + '</p><p class="and-valore">' + euro(k.incassoMese) + '</p>' +
          '<p class="and-delta">' + confrontoTesto(k.incassoMese, k.incassoMesePrima, 'rispetto a ' + nomeMesePrima) + '</p></div></div>' +
          '<p class="and-sotto">Gli ultimi 6 mesi</p>' +
          grafico(d.mesi.map(function (m) { return Math.round(m.centesimi / 100); }), d.mesi.map(function (m) { return dataTesto(m.inizio, { month: 'short' }).replace('.', ''); }), function (v) { return '€' + v; }, '#1E6B52') + '</article>' +
        '<article class="and" style="--c:#1B2A3A;--c-chiaro:#DDE3EA"><div class="and-testa"><span class="cr-icona"><svg class="ico" aria-hidden="true"><use href="#i-calendar-check"/></svg></span>' +
          '<div><p class="and-nome">Prenotazioni questa settimana</p><p class="and-valore">' + k.settimana + '</p>' +
          '<p class="and-delta">' + confrontoTesto(k.settimana, k.settimanaPrima, 'rispetto alla settimana scorsa') + '</p></div></div>' +
          '<p class="and-sotto">Le ultime 8 settimane</p>' +
          grafico(d.settimane.map(function (x) { return x.n; }), d.settimane.map(function (x) { return dataTesto(x.inizio, { day: 'numeric', month: 'numeric' }); }), String, '#1B2A3A') + '</article>';
      var tot = d.fonti.reduce(function (t, f) { return t + f.n; }, 0);
      $('[data-fonti]').innerHTML = tot ? d.fonti.map(function (f) {
        var col = COLORI_CANALI[f.fonte] || '#7A8794';
        return '<div class="fonte"><span><i style="background:' + col + '"></i>' + h(f.fonte) + '</span><strong>' + f.n + ' <small>(' + Math.round(f.n / tot * 100) + '%)</small></strong><div class="fonte-barra"><span style="width:' + Math.round(f.n / tot * 100) + '%;background:' + col + '"></span></div></div>';
      }).join('') : '<p class="vuoto">Ancora nessuna prenotazione.</p>';
    }).catch(function (e) { if (e.stato !== 501) toast(e.message, true); });
  };

  /* =============================================================
     SCHEDA DI UNA PRENOTAZIONE — tutti i dettagli, i tre passi
     spiegati uno per uno e tutte le azioni possibili
     ============================================================= */
  var dlgScheda = $('[data-scheda-dlg]'), dlgNuova = $('[data-nuova-dlg]'), schedaId = null;
  function apriDlg(d) { if (typeof d.showModal === 'function') { if (!d.open) d.showModal(); } else d.setAttribute('open', ''); }
  function chiudiDlg(d) { if (d && d.open) { if (typeof d.close === 'function') d.close(); else d.removeAttribute('open'); } }
  $$('[data-chiudi-dlg]').forEach(function (b) { b.addEventListener('click', function () { chiudiDlg(b.closest('dialog')); }); });
  [dlgScheda, dlgNuova].forEach(function (d) {
    d.addEventListener('click', function (e) { if (e.target === d) chiudiDlg(d); });
    d.addEventListener('close', function () { if (d === dlgScheda) schedaId = null; });
  });

  function apriScheda(id, punto) {
    var nuova = schedaId !== id;
    schedaId = id;
    if (nuova) { $('[data-sc-nome]').textContent = 'Prenotazione'; $('[data-sc-sotto]').textContent = ''; $('[data-sc-corpo]').innerHTML = '<p class="nota">Un attimo…</p>'; }
    apriDlg(dlgScheda);
    return api('scheda', { query: 'id=' + id }).then(function (x) {
      disegnaScheda(x);
      if (punto) { var el = $('[data-passo="' + punto + '"]', dlgScheda); if (el) el.scrollIntoView({ block: 'center' }); }
    }).catch(function (e) { toast(e.message, true); chiudiDlg(dlgScheda); });
  }
  function fattoHtml(t) { return '<p class="passo-fatto"><svg class="ico" aria-hidden="true"><use href="#i-check"/></svg>' + t + '</p>'; }
  function passoHtml(n, titolo, stato, corpo, chiave) {
    return '<section class="passo passo-' + stato + '" data-passo="' + chiave + '"><div class="passo-n">' + (stato === 'fatto' ? '✓' : n) + '</div>' +
      '<div class="passo-corpo"><h3>' + titolo + '</h3>' + corpo + '</div></section>';
  }
  function disegnaScheda(x) {
    var annullata = x.stato === 'annullata', s = situazione(x), id = x.id, chi = h(x.nome + ' ' + x.cognome);
    $('[data-sc-nome]').textContent = x.nome + ' ' + x.cognome;
    $('[data-sc-sotto]').textContent = x.nomePacchetto + ' · codice ' + x.codice;
    var quando = isMese(x) ? 'dal ' + dataTesto(x.data_inizio, { day: 'numeric', month: 'long' }) + ' al ' + dataTesto(x.data_fine, { day: 'numeric', month: 'long' })
      : cap(dataTesto(x.data_inizio));
    var html = '';

    /* cosa fare adesso */
    var adesso = annullata ? '<strong>Prenotazione annullata.</strong> Il posto è di nuovo libero.'
      : s.azione === 'accetta' ? '<strong>Cosa fare adesso:</strong> controlla la richiesta e accettala (passo 1).'
      : s.azione === 'arrivato' ? '<strong>Cosa fare adesso:</strong> quando entra in negozio tocca “È arrivato” (passo 2).'
      : s.azione === 'incassa' ? '<strong>Cosa fare adesso:</strong> incassa ' + euro(x.prezzo_centesimi) + ' e scegli come ha pagato (passo 3).'
      : s.assente ? '<strong>Non è venuto.</strong> Se ti sei sbagliata, tocca “Correggi” al passo 2.'
      : s.fatto ? '<strong>Tutto fatto.</strong> Non c’è altro da fare per questa prenotazione.'
      : '<strong>Tutto a posto per ora.</strong> Il giorno della prenotazione potrai segnare l’arrivo e l’incasso.';
    html += '<p class="adesso' + (s.fatto && !annullata ? ' adesso-ok' : '') + (annullata ? ' adesso-no' : '') + '">' + adesso + '</p>';

    if (!annullata) {
      /* passo 1: accettare */
      html += passoHtml(1, 'Accetta la richiesta', x.accettata ? 'fatto' : 'ora', x.accettata
        ? fattoHtml(x.manuale ? 'Inserita da te: già accettata' : 'Accettata')
        : '<p class="nota">Il cliente ha già ricevuto la conferma via email. Se va tutto bene, accettala. Se non va bene (per esempio quel giorno sei chiusa), rifiutala: gli arriva un’email di annullamento e il posto torna libero.</p>' +
          '<div class="azioni-riga"><button class="btn btn-ocra" type="button" data-accetta="' + id + '"><svg class="ico" aria-hidden="true"><use href="#i-check"/></svg>Accetta</button>' +
          '<button class="btn btn-rosso-filo" type="button" data-rifiuta="' + id + '" data-chi="' + chi + '"><svg class="ico" aria-hidden="true"><use href="#i-x"/></svg>Rifiuta</button></div>', 'accetta');

      /* passo 2: arrivo */
      var corpo2, stato2;
      if (!conArrivo(x)) { stato2 = 'fatto'; corpo2 = fattoHtml('Abbonamento: non serve segnare gli arrivi'); }
      else if (x.stato === 'presente') { stato2 = 'fatto'; corpo2 = fattoHtml('È arrivato · timbro aggiunto alla Bagnarino Card') + '<button class="link-azione" type="button" data-presenza="confermata" data-id="' + id + '">Correggi: non è ancora arrivato</button>'; }
      else if (x.stato === 'assente') { stato2 = 'no'; corpo2 = '<p class="pill pill-rosso">Non è venuto</p><button class="link-azione" type="button" data-presenza="confermata" data-id="' + id + '">Correggi</button>'; }
      else if (x.conPresenza) {
        stato2 = x.accettata ? 'ora' : 'dopo';
        corpo2 = '<p class="nota">Quando entra in negozio tocca “È arrivato”: il timbro sulla sua Bagnarino Card si aggiunge da solo.</p>' +
          '<div class="azioni-riga"><button class="btn btn-verde" type="button" data-presenza="presente" data-id="' + id + '"><svg class="ico" aria-hidden="true"><use href="#i-user-check"/></svg>È arrivato</button>' +
          '<button class="btn btn-filo" type="button" data-presenza="assente" data-id="' + id + '">Non è venuto</button></div>';
      } else { stato2 = 'dopo'; corpo2 = '<p class="nota">Si segna il giorno della prenotazione: ' + dataTesto(x.data_inizio) + '.</p>'; }
      html += passoHtml(2, 'Il giorno dell’arrivo', stato2, corpo2, 'arrivo');

      /* passo 3: pagamento */
      var corpo3, stato3;
      if (!x.prezzo_centesimi) { stato3 = 'fatto'; corpo3 = fattoHtml(x.omaggio ? 'Niente da incassare: giornata in regalo con la Card' : 'Niente da incassare: ingresso del carnet, già pagato'); }
      else if (x.pagato) {
        stato3 = 'fatto';
        corpo3 = fattoHtml('Pagato ' + euro(x.prezzo_centesimi) + (x.metodo_pagamento ? ' · ' + x.metodo_pagamento : '') + (x.pagato_il ? ' · ' + dataTesto(x.pagato_il, { day: 'numeric', month: 'long' }) : '')) +
          '<button class="link-azione" type="button" data-non-pagato data-id="' + id + '">Annulla l’incasso</button>';
      } else {
        stato3 = s.azione === 'incassa' ? 'ora' : 'dopo';
        corpo3 = '<p class="nota">Da incassare: <strong class="importo">' + euro(x.prezzo_centesimi) + '</strong>. Come ha pagato?</p>' +
          '<div class="azioni-3"><button class="btn btn-pieno" type="button" data-incassa="contanti" data-id="' + id + '">Contanti</button>' +
          '<button class="btn btn-pieno" type="button" data-incassa="carta" data-id="' + id + '">Carta</button>' +
          '<button class="btn btn-filo" type="button" data-incassa="bonifico" data-id="' + id + '">Bonifico</button></div>';
      }
      html += passoHtml(3, 'Il pagamento', stato3, corpo3, 'incasso');
    }

    /* dettagli */
    var righe = [
      ['Quando', quando], ['Formula', x.nomePacchetto], ['Scrivania', x.postazione || '—'],
      ['Prezzo', x.prezzo_centesimi ? euro(x.prezzo_centesimi) : x.omaggio ? '€0 · in regalo con la Card' : '€0 · dal carnet'],
      ['Bagnarino Card', x.timbri + ' timbri su 10' + (x.omaggi ? ' · ' + x.omaggi + (x.omaggi === 1 ? ' giornata' : ' giornate') + ' in regalo' : '')],
      x.piva_cf ? ['Fattura a', x.piva_cf] : null, x.note ? ['Note', x.note] : null,
      ['Arrivata da', x.manuale ? 'Inserita da te' : 'Sito · ' + x.fonte],
      ['Prenotata il', dataTesto(x.creato_il.slice(0, 10), { day: 'numeric', month: 'long' }) + ' alle ' + x.creato_il.slice(11, 16)],
      ['È venuto', x.prenotazioni_cliente === 1 ? 'Prima prenotazione' : x.prenotazioni_cliente + ' prenotazioni in tutto']
    ].filter(Boolean);
    html += '<h3 class="foglio-sottotitolo">Dettagli</h3><dl class="dettagli">' + righe.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + h(r[1]) + '</dd></div>'; }).join('') + '</dl>';

    /* contatti */
    html += '<div class="contatti-riga"><a class="btn btn-filo btn-s" href="tel:' + h(tel(x.telefono)) + '"><svg class="ico" aria-hidden="true"><use href="#i-phone"/></svg>Chiama</a>' +
      '<a class="btn btn-filo btn-s" href="' + h(wa(x.telefono)) + '" target="_blank" rel="noopener"><svg class="ico" aria-hidden="true"><use href="#i-whatsapp"/></svg>WhatsApp</a>' +
      (x.email ? '<a class="btn btn-filo btn-s" href="mailto:' + h(x.email) + '"><svg class="ico" aria-hidden="true"><use href="#i-mail"/></svg>Email</a>' : '') + '</div>';

    if (!annullata) {
      html += '<div class="zona-annulla"><button class="link-azione link-rosso" type="button" data-annulla-id="' + id + '" data-chi="' + chi + '">Annulla questa prenotazione</button>' +
        '<p class="nota">Il posto torna libero e il cliente riceve un’email.</p></div>';
    }
    $('[data-sc-corpo]').innerHTML = html;
  }

  /* dopo ogni azione: si aggiorna la scheda aperta e la pagina sotto */
  function aggiorna() {
    var attivo = schedaAttiva();
    if (caricatori[attivo]) caricatori[attivo]();
    if (schedaId && dlgScheda.open) apriScheda(schedaId);
  }
  function schedaAttiva() { var p = $$('[data-pannello]').filter(function (x) { return !x.hidden; })[0]; return p ? p.getAttribute('data-pannello') : 'oggi'; }

  document.addEventListener('click', function (e) {
    var t = e.target;
    var b;
    if ((b = t.closest('[data-accetta]'))) {
      b.disabled = true;
      api('accetta', { dati: { id: +b.getAttribute('data-accetta') } }).then(function () {
        toast('Richiesta accettata.');
        var badge = $('[data-badge]'); if (!badge.hidden) aggiornaBadge(Math.max(0, (+badge.textContent || 1) - 1));
        aggiorna();
      }).catch(function (x) { b.disabled = false; toast(x.message, true); });
      return;
    }
    if ((b = t.closest('[data-rifiuta]'))) {
      if (!confirm('Rifiutare la richiesta di ' + b.getAttribute('data-chi') + '?\nGli arriva un’email di annullamento e il posto torna libero.')) return;
      api('annulla', { dati: { id: +b.getAttribute('data-rifiuta') } }).then(function () {
        toast('Richiesta rifiutata: il cliente riceve un’email.'); chiudiDlg(dlgScheda); aggiorna();
      }).catch(function (x) { toast(x.message, true); });
      return;
    }
    if ((b = t.closest('[data-presenza]'))) {
      b.disabled = true;
      api('presenza', { dati: { id: +b.getAttribute('data-id'), stato: b.getAttribute('data-presenza') } }).then(function (r) {
        toast(r.stato === 'presente' ? (r.premio ? '🎁 Arrivato! Ha appena guadagnato una giornata in regalo.' : r.premioSbloccato ? '🎁 Arrivato! Con ' + r.timbri + ' timbri ha sbloccato: ' + r.premioSbloccato + '. Ricordati di darglielo.' : 'Arrivato. Timbri sulla card: ' + r.timbri + ' su 10.')
          : r.stato === 'assente' ? 'Segnato: non è venuto.' : 'Corretto.');
        aggiorna();
      }).catch(function (x) { b.disabled = false; toast(x.message, true); });
      return;
    }
    if ((b = t.closest('[data-incassa]'))) {
      b.disabled = true;
      api('pagato', { dati: { id: +b.getAttribute('data-id'), pagato: true, metodo: b.getAttribute('data-incassa') } }).then(function () {
        toast('Incasso registrato (' + b.getAttribute('data-incassa') + ').'); aggiorna();
      }).catch(function (x) { b.disabled = false; toast(x.message, true); });
      return;
    }
    if ((b = t.closest('[data-non-pagato]'))) {
      api('pagato', { dati: { id: +b.getAttribute('data-id'), pagato: false } }).then(function () { toast('Segnato come da incassare.'); aggiorna(); })
        .catch(function (x) { toast(x.message, true); });
      return;
    }
    if ((b = t.closest('[data-elimina-cliente]'))) {
      var n = +b.getAttribute('data-n') || 0;
      if (!confirm('Eliminare per sempre ' + b.getAttribute('data-chi') + '?\n' + (n === 1 ? 'Si cancella anche la sua prenotazione, con l’eventuale incasso.\n' : n ? 'Si cancellano anche le sue ' + n + ' prenotazioni e gli incassi collegati.\n' : '') + 'Non si può tornare indietro.')) return;
      b.disabled = true;
      api('elimina-cliente', { dati: { id: +b.getAttribute('data-elimina-cliente') } }).then(function () {
        toast('Cliente eliminato.'); aggiorna();
      }).catch(function (x) { b.disabled = false; toast(x.message, true); });
      return;
    }
    if ((b = t.closest('[data-annulla-id]'))) {
      if (!confirm('Annullare la prenotazione di ' + b.getAttribute('data-chi') + '?\nIl posto torna libero e il cliente riceve un’email.')) return;
      api('annulla', { dati: { id: +b.getAttribute('data-annulla-id') } }).then(function () {
        toast('Prenotazione annullata.'); chiudiDlg(dlgScheda); aggiorna();
      }).catch(function (x) { toast(x.message, true); });
      return;
    }
    if ((b = t.closest('[data-apri-incasso]'))) { apriScheda(+b.getAttribute('data-apri-incasso'), 'incasso'); return; }
    if ((b = t.closest('[data-vai-a]'))) { var el = $(b.getAttribute('data-vai-a')); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    if ((b = t.closest('[data-vai-scheda]'))) { vai(b.getAttribute('data-vai-scheda')); return; }
    if ((b = t.closest('[data-nuova]'))) { apriNuova(b.getAttribute('data-data')); return; }
    if ((b = t.closest('[data-apri]')) && !t.closest('a, button:not([data-apri])')) { apriScheda(+b.getAttribute('data-apri')); return; }
  });
  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('article[data-apri]')) { e.preventDefault(); apriScheda(+e.target.getAttribute('data-apri')); }
  });

  /* =============================================================
     CALENDARIO — come un gestionale: scrivanie × giorni.
     Computer: tutta la settimana in griglia.
     Telefono: un giorno alla volta, con i giorni in alto.
     Colori: da accettare (ocra), accettata (blu), arrivato (verde);
     "€✓" = pagato. Una scrivania libera si tocca per prenotarla.
     ============================================================= */
  var calDa = null, calGiorno = null, calDati = null;
  function statoCella(r) {
    if (r.stato === 'assente') return 'st-assente';
    if (!r.accettata) return 'st-nuova';
    if (r.stato === 'presente' || (!/^(giornata|carnet)$/.test(r.idPacchetto) && !r.primoGiorno)) return 'st-arrivato';
    return 'st-accettata';
  }
  function nomeCorto(n) { var p = String(n).split(' '); return p[0] + (p[1] ? ' ' + p[1].charAt(0) + '.' : ''); }
  function cellaPren(r, lungo) {
    var pagato = r.pagato || !r.prezzo;
    return '<button class="cella ' + statoCella(r) + '" type="button" data-apri="' + r.id + '" title="' + h(r.nome + ' · ' + r.pacchetto) + '">' +
      '<span class="cella-nome">' + h(lungo ? r.nome : nomeCorto(r.nome)) + '</span>' +
      '<span class="cella-info">' + h(r.pacchetto) + (pagato ? ' <b class="euro-ok" title="Pagato">€✓</b>' : '') + '</span></button>';
  }
  function giorniVisibili(d) {
    return d.giorni.filter(function (g) {
      var we = [0, 6].indexOf(daIso(g.data).getDay()) !== -1;
      return !we || g.aperto || g.posti.some(function (p) { return p.prenotazione; });
    });
  }
  function statoGiorno(g) {
    var occ = g.posti.filter(function (p) { return p.prenotazione; }).length;
    return g.aperto ? occ + ' su ' + g.posti.length : g.chiusoDaTe ? 'Chiuso' + (g.motivo ? ' · ' + g.motivo : '') : g.festivo ? 'Festivo' : 'Chiuso';
  }
  function bottoneChiusura(g, oggi) {
    var we = [0, 6].indexOf(daIso(g.data).getDay()) !== -1;
    if (g.data < oggi || we || g.festivo) return '';
    return g.chiusoDaTe ? '<button class="link-azione" type="button" data-riapri="' + g.data + '">Riapri questo giorno</button>'
      : '<button class="link-azione link-piccolo" type="button" data-chiudi="' + g.data + '">Chiudi questo giorno</button>';
  }
  caricatori.calendario = function () {
    return api('calendario', { query: calDa ? 'da=' + calDa : '' }).then(function (d) {
      calDa = d.inizio; calDati = d;
      var fine = piu(d.inizio, 6);
      if (!calGiorno || calGiorno < d.inizio || calGiorno > fine) calGiorno = d.oggi >= d.inizio && d.oggi <= fine ? d.oggi : d.inizio;
      $('[data-cal-titolo]').textContent = dataTesto(d.inizio, { day: 'numeric', month: 'long' }) + ' – ' + dataTesto(fine, { day: 'numeric', month: 'long' });
      $('[data-cal-oggi]').hidden = d.oggi >= d.inizio && d.oggi <= fine;
      var giorni = giorniVisibili(d);
      if (!giorni.some(function (g) { return g.data === calGiorno; }) && giorni.length) calGiorno = giorni[0].data;

      /* griglia (computer) */
      var n = Math.max.apply(null, d.giorni.map(function (g) { return g.posti.length; }).concat([0]));
      var testa = '<thead><tr><th class="cal-angolo">Scrivania</th>' + giorni.map(function (g) {
        return '<th class="' + (g.data === d.oggi ? 'oggi' : '') + (g.aperto ? '' : ' chiuso') + '"><span class="th-giorno">' + giornoBreve(g.data) + '</span>' +
          '<span class="th-stato">' + h(statoGiorno(g)) + '</span>' + bottoneChiusura(g, d.oggi) + '</th>';
      }).join('') + '</tr></thead>';
      var corpo = '<tbody>';
      for (var i = 0; i < n; i++) {
        corpo += '<tr><th class="cal-posto">' + h((giorni[0] && giorni[0].posti[i] ? giorni[0].posti[i].postazione : 'Scrivania ' + (i + 1))) + '</th>';
        giorni.forEach(function (g) {
          var p = g.posti[i];
          if (!g.aperto) { corpo += '<td class="chiuso"></td>'; return; }
          if (p && p.prenotazione) { corpo += '<td>' + cellaPren(p.prenotazione, false) + '</td>'; return; }
          corpo += '<td>' + (g.data >= d.oggi ? '<button class="cella cella-libera" type="button" data-nuova data-data="' + g.data + '" aria-label="Prenota ' + h(p ? p.postazione : '') + ' ' + dataTesto(g.data) + '">+</button>' : '<span class="cella cella-vuota"></span>') + '</td>';
        });
        corpo += '</tr>';
      }
      $('[data-cal-griglia]').innerHTML = testa + corpo + '</tbody>';

      /* giorni in alto (telefono) */
      $('[data-cal-giorni]').innerHTML = giorni.map(function (g) {
        return '<button type="button" role="tab" class="giorno-pill' + (g.data === d.oggi ? ' oggi' : '') + (g.aperto ? '' : ' chiuso') + '" aria-selected="' + (g.data === calGiorno) + '" data-cal-sel="' + g.data + '">' +
          '<span>' + cap(dataTesto(g.data, { weekday: 'short' }).replace('.', '')) + '</span><strong>' + daIso(g.data).getDate() + '</strong>' +
          '<small>' + (g.aperto ? g.posti.filter(function (p) { return p.prenotazione; }).length + '/' + g.posti.length : 'chiuso') + '</small></button>';
      }).join('');
      disegnaGiorno();
    }).catch(function (e) { if (e.stato !== 501) toast(e.message, true); });
  };
  function disegnaGiorno() {
    var d = calDati, g = d && d.giorni.filter(function (x) { return x.data === calGiorno; })[0];
    if (!g) { $('[data-cal-giorno]').innerHTML = ''; return; }
    var html = '<div class="cal-giorno-testa"><h2>' + cap(dataTesto(g.data)) + '</h2><span class="occupazione">' + h(statoGiorno(g)) + '</span></div>';
    if (g.aperto) {
      html += g.posti.map(function (p) {
        var r = p.prenotazione;
        return '<div class="posto-riga"><span class="posto-nome">' + h(p.postazione) + '</span>' +
          (r ? cellaPren(r, true) : g.data >= d.oggi ? '<button class="cella cella-libera" type="button" data-nuova data-data="' + g.data + '">Libera · <b>+ Prenota</b></button>' : '<span class="cella cella-vuota">Libera</span>') + '</div>';
      }).join('');
    } else html += '<p class="vuoto">Giorno chiuso: nessuno può prenotare.</p>';
    html += '<div class="cal-giorno-piede">' + bottoneChiusura(g, d.oggi) + '</div>';
    $('[data-cal-giorno]').innerHTML = html;
  }
  $('[data-cal-giorni]').addEventListener('click', function (e) {
    var b = e.target.closest('[data-cal-sel]'); if (!b) return;
    calGiorno = b.getAttribute('data-cal-sel');
    $$('[data-cal-sel]').forEach(function (x) { x.setAttribute('aria-selected', x === b); });
    disegnaGiorno();
  });
  $('[data-cal-prima]').addEventListener('click', function () { calDa = piu(calDa, -7); caricatori.calendario(); });
  $('[data-cal-dopo]').addEventListener('click', function () { calDa = piu(calDa, 7); caricatori.calendario(); });
  $('[data-cal-oggi]').addEventListener('click', function () { calDa = null; calGiorno = null; caricatori.calendario(); });
  $('[data-pannello="calendario"]').addEventListener('click', function (e) {
    var c = e.target.closest('[data-chiudi]'), r = e.target.closest('[data-riapri]');
    if (c) {
      var motivo = prompt('Perché chiudi ' + dataTesto(c.getAttribute('data-chiudi')) + '? (es. ferie, ponte)', 'Chiuso');
      if (motivo === null) return;
      api('chiusura', { dati: { data: c.getAttribute('data-chiudi'), motivo: motivo, chiudi: true } }).then(function (x) {
        toast(x.giaPrenotati ? 'Giorno chiuso. Attenzione: ci sono ' + x.giaPrenotati + ' prenotazioni da avvisare.' : 'Giorno chiuso: nessuno potrà prenotarlo.');
        caricatori.calendario();
      }).catch(function (x) { toast(x.message, true); });
    }
    if (r) api('chiusura', { dati: { data: r.getAttribute('data-riapri'), chiudi: false } }).then(function () { toast('Giorno riaperto.'); caricatori.calendario(); });
  });

  /* nuova prenotazione a mano (telefono o negozio) */
  var listinoCache = null;
  function riempiFormule() {
    var sel = $('[data-sel-pacchetto]');
    if (sel.options.length) return Promise.resolve();
    return api('impostazioni').then(function (d) {
      listinoCache = d;
      sel.innerHTML = d.listino.map(function (p) { return '<option value="' + p.id + '">' + h(p.nome) + ' – €' + p.prezzo + '</option>'; }).join('');
    });
  }
  function apriNuova(data) {
    riempiFormule().then(function () {
      var f = $('[data-modulo-nuova]'), oggi = iso(new Date());
      f.reset();
      f.data.value = data && data >= oggi ? data : oggi;
      apriDlg(dlgNuova);
      setTimeout(function () { f.nome.focus(); }, 60);
    }).catch(function (x) { toast(x.message, true); });
  }
  $('[data-modulo-nuova]').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = this, dati = {};
    ['nome', 'cognome', 'telefono', 'email', 'pacchetto', 'data', 'note'].forEach(function (k) { dati[k] = f[k].value.trim(); });
    if (dati.nome.length < 2 || dati.cognome.length < 2 || dati.telefono.replace(/\D/g, '').length < 8 || !dati.data) {
      toast('Servono nome, cognome, telefono e giorno.', true); return;
    }
    var b = f.querySelector('button[type=submit]'); b.disabled = true;
    api('prenotazione', { dati: dati }).then(function (r) {
      toast('Prenotazione salvata: ' + r.codice);
      chiudiDlg(dlgNuova);
      if (schedaAttiva() === 'calendario') { calDa = null; calGiorno = dati.data; var l = daIso(dati.data); l.setDate(l.getDate() - ((l.getDay() + 6) % 7)); calDa = iso(l); }
      aggiorna();
    }).catch(function (x) { toast(x.message, true); }).then(function () { b.disabled = false; });
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
          '</dl>' + (c.piva_cf ? '<p class="nota">Fattura a: ' + h(c.piva_cf) + '</p>' : '') +
          '<button class="link-azione cliente-elimina" type="button" data-elimina-cliente="' + c.id + '" data-chi="' + h(c.nome + ' ' + c.cognome) + '" data-n="' + c.prenotazioni + '">Elimina cliente</button></article>';
      }).join('') : '<p class="vuoto">' + (cerca ? 'Nessun cliente trovato.' : 'Ancora nessun cliente.') + '</p>';
    }).catch(function (e) { if (e.stato !== 501) toast(e.message, true); });
  };
  $('[data-cerca]').addEventListener('input', function () { clearTimeout(timerCerca); timerCerca = setTimeout(caricatori.clienti, 250); });

  /* =============================================================
     INCASSI
     ============================================================= */
  var incPeriodo = 'mese', incDa = iso(new Date()), incFiltro = 'tutte', incDati = null;
  var METODI = { contanti: ['Contanti', 'banconota'], carta: ['Carta', 'carta'], bonifico: ['Bonifico', 'receipt'], online: ['Online', 'globe'] };
  function rigaIncasso(r) {
    var gratis = r.prezzo_centesimi === 0, d = daIso(r.data), futura = r.data > oggiIso;
    var info = h(r.nomePacchetto) + (r.omaggio ? ' · regalo della Card' : r.carnet_id && r.pacchetto === 'giornata' ? ' · ingresso del carnet' : '') +
      (r.piva_cf ? ' · fattura a ' + h(r.piva_cf) : '');
    var stato;
    if (gratis) stato = '<span class="inc-stato inc-stato-gratis"><svg class="ico" aria-hidden="true"><use href="#i-gift"/></svg>Niente da pagare</span>';
    else if (r.pagato) {
      var m = METODI[r.metodo_pagamento] || ['Pagato', 'check'];
      stato = '<span class="inc-stato inc-stato-ok"><svg class="ico" aria-hidden="true"><use href="#i-' + m[1] + '"/></svg>Pagato' + (r.metodo_pagamento ? ' · ' + m[0].toLowerCase() : '') + '</span>' +
        '<button class="link-azione" type="button" data-non-pagato data-id="' + r.id + '">Annulla</button>';
    } else stato = (futura ? '<span class="inc-quando">Paga quando arriva</span>' : '') +
      '<span class="inc-bottoni"><button class="btn btn-s btn-pieno" type="button" data-incassa="contanti" data-id="' + r.id + '"><svg class="ico" aria-hidden="true"><use href="#i-banconota"/></svg>Contanti</button>' +
      '<button class="btn btn-s btn-pieno" type="button" data-incassa="carta" data-id="' + r.id + '"><svg class="ico" aria-hidden="true"><use href="#i-carta"/></svg>Carta</button></span>';
    return '<article class="inc-riga' + (r.pagato || gratis ? ' inc-riga-ok' : '') + '">' +
      '<div class="inc-data"><span>' + dataTesto(r.data, { weekday: 'short' }).replace('.', '') + '</span><strong>' + d.getDate() + '</strong><span>' + dataTesto(r.data, { month: 'short' }).replace('.', '') + '</span></div>' +
      '<div class="inc-chi"><strong>' + h(r.nome + ' ' + r.cognome) + '</strong><span>' + info + '</span></div>' +
      '<div class="inc-importo">' + (gratis ? '€0' : euro(r.prezzo_centesimi)) + '</div>' +
      '<div class="inc-azione">' + stato + '</div></article>';
  }
  /* "1 da far pagare ora · 3 pagano quando arrivano" */
  function spiegaDa(da) {
    var ora = da.filter(function (r) { return r.data <= oggiIso; }).length, dopo = da.length - ora;
    return [ora ? ora + ' da far pagare ora' : '', dopo ? dopo + (dopo === 1 ? ' paga quando arriva' : ' pagano quando arrivano') : ''].filter(Boolean).join(' · ');
  }
  function disegnaIncassi() {
    var d = incDati, righe = d.righe;
    var da = righe.filter(function (r) { return r.prezzo_centesimi > 0 && !r.pagato; });
    var ok = righe.filter(function (r) { return r.prezzo_centesimi > 0 && r.pagato; });
    var gratis = righe.filter(function (r) { return r.prezzo_centesimi === 0; });
    var somma = function (l) { return l.reduce(function (t, r) { return t + r.prezzo_centesimi; }, 0); };
    var perc = d.totali.previsto ? Math.round(d.totali.incassato / d.totali.previsto * 100) : 0;
    var metodi = {};
    ok.forEach(function (r) { var m = r.metodo_pagamento || 'altro'; metodi[m] = (metodi[m] || 0) + r.prezzo_centesimi; });
    var pezzi = Object.keys(metodi).map(function (m) {
      var x = METODI[m] || ['Altro', 'check'];
      return '<li><svg class="ico" aria-hidden="true"><use href="#i-' + x[1] + '"/></svg>' + x[0] + ' <strong>' + euro(metodi[m]) + '</strong></li>';
    });
    $('[data-inc-riassunto]').innerHTML =
      '<article class="inc-totale">' +
        '<div class="inc-totale-riga"><div><p class="inc-etichetta">Incassato</p><p class="inc-grande">' + euro(d.totali.incassato) + '</p></div>' +
        '<p class="inc-di">su <strong>' + euro(d.totali.previsto) + '</strong> prenotati</p></div>' +
        '<div class="inc-barra" role="img" aria-label="Incassato il ' + perc + '% del prenotato"><span style="width:' + perc + '%"></span></div>' +
        (pezzi.length ? '<ul class="inc-metodi">' + pezzi.join('') + '</ul>' : '') +
      '</article>' +
      '<button type="button" class="inc-manca' + (da.length ? '' : ' inc-manca-ok') + '" data-inc-filtro="da">' +
        '<span class="cr-icona"><svg class="ico" aria-hidden="true"><use href="#i-' + (da.length ? 'clessidra' : 'check') + '"/></svg></span>' +
        '<span><span class="inc-etichetta">Da incassare</span><strong class="inc-medio">' + euro(somma(da)) + '</strong>' +
        '<span class="inc-spiega">' + (da.length ? spiegaDa(da) : 'Hanno pagato tutti') + '</span></span></button>';
    var filtri = [['tutte', 'Tutte', righe.length], ['da', 'Da incassare', da.length], ['pagate', 'Pagate', ok.length]];
    $('[data-inc-filtri]').innerHTML = filtri.map(function (f) {
      return '<button type="button" data-inc-filtro="' + f[0] + '" aria-pressed="' + (incFiltro === f[0]) + '">' + f[1] + ' <span>' + f[2] + '</span></button>';
    }).join('');
    function gruppo(titolo, icona, lista, classe) {
      if (!lista.length) return '';
      return '<section class="inc-gruppo ' + classe + '"><h2><svg class="ico" aria-hidden="true"><use href="#i-' + icona + '"/></svg>' + titolo +
        ' <span>' + lista.length + ' · ' + euro(somma(lista)) + '</span></h2>' + lista.map(rigaIncasso).join('') + '</section>';
    }
    var html = '';
    if (incFiltro !== 'pagate') html += gruppo('Da incassare', 'clessidra', da, 'inc-gruppo-da');
    if (incFiltro !== 'da') html += gruppo('Già pagate', 'check', ok, 'inc-gruppo-ok') + gruppo('Senza pagamento', 'gift', gratis, 'inc-gruppo-gratis');
    $('[data-righe-incassi]').innerHTML = html || '<p class="vuoto">' + (righe.length ? 'Niente in questo elenco.' : 'Nessuna prenotazione in questo periodo.') + '</p>';
  }
  caricatori.incassi = function () {
    $$('[data-periodo]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-periodo') === incPeriodo); });
    return api('incassi', { query: 'periodo=' + incPeriodo + '&da=' + incDa }).then(function (d) {
      incDati = d;
      $('[data-inc-titolo]').textContent = cap(incPeriodo === 'giorno' ? dataTesto(d.inizio)
        : incPeriodo === 'settimana' ? dataTesto(d.inizio, { day: 'numeric', month: 'short' }) + ' – ' + dataTesto(d.fine, { day: 'numeric', month: 'short' })
        : dataTesto(d.inizio, { month: 'long', year: 'numeric' }));
      disegnaIncassi();
      $('[data-csv]').href = '/api/admin?azione=csv&da=' + d.inizio + '&a=' + d.fine;
      $('[data-csv]').setAttribute('download', 'incassi-bagnarino-' + d.inizio + '.csv');
    }).catch(function (e) { if (e.stato !== 501) toast(e.message, true); });
  };
  $('[data-pannello="incassi"]').addEventListener('click', function (e) {
    var b = e.target.closest('[data-inc-filtro]');
    if (!b || !incDati) return;
    incFiltro = b.getAttribute('data-inc-filtro'); disegnaIncassi();
  });
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

  /* =============================================================
     CRESCITA: come sta andando il coworking, mese per mese.
     Numeri automatici (prenotazioni, incassi, clienti, canali) +
     numeri di social, Google e pubblicità inseriti da Apex Media.
     Grafici SVG fatti a mano, animati quando si apre la scheda.
     ============================================================= */
  /* icone delle carte (per lo sprite): #i-calendar-check #i-euro #i-user-plus #i-repeat #i-check #i-heart
     #i-eye #i-mouse-pointer-click #i-map-pin #i-star #i-megaphone #i-target #i-trending-up #i-arrow-right */
  var MESI_BREVI = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
  var COLORI_CANALI = {
    'Instagram': '#B4457E', 'Facebook': '#3B5BDB', 'Google': '#C9973B', 'Google Ads': '#E3B95F', 'Google Maps': '#0C8599',
    'WhatsApp': '#1A9E4B', 'Diretto': '#1B2A3A', 'In sede / telefono': '#7A8794', 'Altro': '#C5BDAD'
  };
  /* i blocchi di social, Google e pubblicità: stessi nomi, icone e colori
     nella scheda di Marcella e nel modulo di Apex Media */
  var GRUPPI = [
    { id: 'instagram', titolo: 'Instagram', icona: 'instagram', c: '#B4457E', chiaro: '#F7E1EC',
      campi: ['instagram_follower', 'instagram_copertura'], aiuto: 'App Instagram → Dashboard professionale → Account raggiunti (ultimi 30 giorni).' },
    { id: 'facebook', titolo: 'Facebook', icona: 'facebook', c: '#3B5BDB', chiaro: '#E3E9FB',
      campi: ['facebook_follower', 'facebook_copertura'], aiuto: 'Meta Business Suite → Insight → Copertura.' },
    { id: 'google', titolo: 'Google', icona: 'google', c: '#9A6B12', chiaro: '#F5DFAE',
      campi: ['google_visualizzazioni', 'google_chiamate', 'google_indicazioni', 'google_clic_sito', 'recensioni_numero', 'recensioni_media'], aiuto: 'Profilo dell’attività su Google → Rendimento, mese scelto. Recensioni: totale e voto medio di oggi.' },
    { id: 'sito', titolo: 'Sito e WhatsApp', icona: 'globe', c: '#1E6B52', chiaro: '#D6EADF',
      campi: ['visite_sito', 'contatti_whatsapp'], aiuto: 'Visite: Google Analytics → Utenti del mese. WhatsApp: chat nuove arrivate dal sito.' },
    { id: 'pubblicita', titolo: 'Pubblicità', icona: 'megaphone', c: '#1B2A3A', chiaro: '#DDE3EA',
      campi: ['spesa_meta', 'spesa_google'], aiuto: 'Quanto è stato speso nel mese, IVA inclusa (in euro).' }
  ];
  /* nomi brevi e icone dei singoli numeri, per le righe dei blocchi */
  var VOCI = {
    instagram_follower: ['Follower', 'heart'], instagram_copertura: ['Persone raggiunte', 'eye'],
    facebook_follower: ['Follower', 'heart'], facebook_copertura: ['Persone raggiunte', 'eye'],
    google_visualizzazioni: ['Hanno visto la scheda', 'eye'], google_chiamate: ['Chiamate', 'phone'],
    google_indicazioni: ['Indicazioni stradali', 'navigation'], google_clic_sito: ['Clic sul sito', 'mouse-pointer-click'],
    recensioni_numero: ['Recensioni', 'star'], recensioni_media: ['Voto medio', 'star'],
    visite_sito: ['Visite al sito', 'globe'], contatti_whatsapp: ['Chat WhatsApp', 'whatsapp'],
    spesa_meta: ['Spesa Instagram e Facebook', 'euro'], spesa_google: ['Spesa Google', 'euro']
  };
  var creMese = null, creDati = null;

  function intero(n) { return Math.round(n).toLocaleString('it-IT'); }
  function compatto(n) {
    if (n >= 10000) return (n / 1000).toLocaleString('it-IT', { maximumFractionDigits: 1 }) + 'k';
    return intero(n);
  }
  function etichettaMese(m) { var i = +m.slice(5, 7) - 1; return MESI_BREVI[i] + (i === 0 ? ' ' + m.slice(2, 4) : ''); }
  function nomeMeseLungo(m) { return cap(daIso(m).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })); }

  /* ---------- confronto con il mese prima, in parole ---------- */
  function confronto(v, prima, tipo, nomePrima) {
    var aM = (/^a/.test(nomePrima || '') ? 'ad ' : 'a ') + nomePrima;
    if (v == null) return '';
    if (prima == null || (tipo !== 'abs' && !prima)) {
      return prima == null && v ? '<span class="neutro">Primo mese con questo dato</span>' : '';
    }
    if (tipo === 'abs') {
      var d = v - prima;
      if (!d) return '<span class="neutro">= uguale ' + aM + '</span>';
      return '<span class="' + (d > 0 ? 'su' : 'giu') + '">' + (d > 0 ? '▲ +' : '▼ ') + intero(d) + '</span> rispetto ' + aM;
    }
    var p = Math.round((v - prima) / prima * 100);
    if (!p) return '<span class="neutro">= come ' + aM + '</span>';
    return '<span class="' + (p > 0 ? 'su' : 'giu') + '">' + (p > 0 ? '▲ +' : '▼ ') + p + '%</span> rispetto ' + aM;
  }
  /* piccola etichetta con la variazione rispetto al mese prima */
  function variazione(v, prima, tipo) {
    if (v == null || prima == null) return '';
    var d = tipo === 'abs' ? v - prima : (prima ? Math.round((v - prima) / prima * 100) : null);
    if (d == null) return '';
    if (!d) return '<span class="cre-var neutro">=</span>';
    return '<span class="cre-var ' + (d > 0 ? 'su' : 'giu') + '">' + (d > 0 ? '▲ +' : '▼ ') + intero(d) + (tipo === 'abs' ? '' : '%') + '</span>';
  }
  /* una tessera del coworking: icona colorata, numero grande, una frase */
  function tessera(o) {
    return '<article class="cre-tessera" style="--c:' + o.c + ';--c-chiaro:' + o.chiaro + '">' +
      '<span class="cre-tessera-icona"><svg class="ico" aria-hidden="true"><use href="#i-' + o.icona + '"/></svg></span>' +
      '<p class="cre-tessera-nome">' + h(o.nome) + '</p>' +
      '<p class="cre-tessera-valore">' + o.valore + '</p>' +
      '<p class="cre-tessera-spiega">' + o.spiega + '</p>' +
      (o.delta ? '<p class="cre-tessera-delta">' + o.delta + '</p>' : '') + '</article>';
  }

  /* ---------- grafici ---------- */
  var W = 560, H = 250, BASSO = 34, ALTO = 30, SX = 8, DX = 8;
  function svg(contenuto, titolo) {
    return '<svg class="grafico cre-anim" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + h(titolo) + '"><title>' + h(titolo) + '</title>' +
      '<line x1="0" x2="' + W + '" y1="' + (H - BASSO) + '" y2="' + (H - BASSO) + '" stroke="#E2DDD1" stroke-width="2"/>' + contenuto + '</svg>';
  }
  function xPasso(n) { return (W - SX - DX) / n; }
  function assiMesi(mesi) {
    var p = xPasso(mesi.length);
    return mesi.map(function (m, i) {
      var ultimo = i === mesi.length - 1;
      return '<text x="' + (SX + p * i + p / 2) + '" y="' + (H - 11) + '" text-anchor="middle" font-size="13"' + (ultimo ? ' class="valore"' : '') + '>' + etichettaMese(m.mese) + '</text>';
    }).join('');
  }
  function testoTitolo(nome, mesi, valori, fmt) {
    return nome + ', ultimi 12 mesi: ' + mesi.map(function (m, i) { return etichettaMese(m.mese) + ' ' + fmt(valori[i]); }).join(', ');
  }

  /* linea con area sotto: un punto per mese */
  function graficoLinea(mesi, valori, fmt, colore, nome) {
    var max = Math.max.apply(null, valori.concat([1])), p = xPasso(mesi.length), alt = H - BASSO - ALTO;
    var pt = valori.map(function (v, i) { return [SX + p * i + p / 2, H - BASSO - alt * v / max]; });
    var linea = pt.map(function (q, i) { return (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join(' ');
    var area = linea + ' L' + pt[pt.length - 1][0].toFixed(1) + ' ' + (H - BASSO) + ' L' + pt[0][0].toFixed(1) + ' ' + (H - BASSO) + ' Z';
    var id = 'g' + Math.random().toString(36).slice(2, 8);
    var punti = pt.map(function (q, i) {
      var ultimo = i === pt.length - 1, mostra = ultimo || valori[i] === max || mesi.length <= 6;
      return '<circle cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="' + (ultimo ? 6 : 3.5) + '" fill="' + (ultimo ? colore : '#fff') + '" stroke="' + colore + '" stroke-width="2.5" class="punto" style="--i:' + i + '"/>' +
        (mostra && valori[i] ? '<text class="valore" x="' + q[0].toFixed(1) + '" y="' + (q[1] - 12).toFixed(1) + '" text-anchor="middle" font-size="14">' + fmt(valori[i]) + '</text>' : '');
    }).join('');
    return svg('<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + colore + '" stop-opacity=".28"/><stop offset="1" stop-color="' + colore + '" stop-opacity="0"/></linearGradient></defs>' +
      '<path class="area" d="' + area + '" fill="url(#' + id + ')"/>' +
      '<path class="traccia" d="' + linea + '" fill="none" stroke="' + colore + '" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" pathLength="1"/>' +
      punti + assiMesi(mesi), testoTitolo(nome, mesi, valori, fmt));
  }

  /* barre: pieno = incassato, contorno = prenotato */
  function graficoIncassi(mesi) {
    var inc = mesi.map(function (m) { return m.incassato; }), pre = mesi.map(function (m) { return m.valore; });
    var max = Math.max.apply(null, inc.concat(pre, [1])), p = xPasso(mesi.length), larg = Math.min(30, p * 0.6), alt = H - BASSO - ALTO;
    var c = mesi.map(function (m, i) {
      var x = SX + p * i + (p - larg) / 2, hp = alt * pre[i] / max, hi = alt * inc[i] / max, ultimo = i === mesi.length - 1;
      return (pre[i] ? '<rect class="barra-g" style="--i:' + i + '" x="' + x.toFixed(1) + '" y="' + (H - BASSO - hp).toFixed(1) + '" width="' + larg.toFixed(1) + '" height="' + hp.toFixed(1) + '" rx="5" fill="none" stroke="#B9B2A3" stroke-width="2" stroke-dasharray="4 3"/>' : '') +
        (inc[i] ? '<rect class="barra-g" style="--i:' + i + '" x="' + x.toFixed(1) + '" y="' + (H - BASSO - hi).toFixed(1) + '" width="' + larg.toFixed(1) + '" height="' + hi.toFixed(1) + '" rx="5" fill="' + (ultimo ? '#C9973B' : '#1B2A3A') + '"/>' : '') +
        (ultimo || inc[i] === Math.max.apply(null, inc) && inc[i] ? '<text class="valore" x="' + (x + larg / 2).toFixed(1) + '" y="' + (H - BASSO - Math.max(hp, hi) - 9).toFixed(1) + '" text-anchor="middle" font-size="14">' + euro(inc[i] || pre[i]).replace(/,00$/, '') + '</text>' : '');
    }).join('');
    return svg(c + assiMesi(mesi), testoTitolo('Incassato', mesi, inc, euro));
  }

  /* barre impilate: una fetta per voce, totale sopra */
  function graficoImpilato(mesi, voci, valoreDi, nome) {
    var tot = mesi.map(function (m) { return voci.reduce(function (t, v) { return t + (valoreDi(m, v.id) || 0); }, 0); });
    var max = Math.max.apply(null, tot.concat([1])), p = xPasso(mesi.length), larg = Math.min(30, p * 0.6), alt = H - BASSO - ALTO;
    var c = mesi.map(function (m, i) {
      var x = SX + p * i + (p - larg) / 2, y = H - BASSO, pezzi = '';
      voci.forEach(function (v) {
        var val = valoreDi(m, v.id) || 0; if (!val) return;
        var hh = alt * val / max; y -= hh;
        pezzi += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + larg.toFixed(1) + '" height="' + Math.max(hh - 1.5, 1.5).toFixed(1) + '" rx="3" fill="' + v.colore + '"><title>' + h(etichettaMese(m.mese) + ' · ' + v.nome + ': ' + intero(val)) + '</title></rect>';
      });
      return '<g class="barra-g" style="--i:' + i + '">' + pezzi + '</g>' +
        (tot[i] ? '<text class="valore" x="' + (x + larg / 2).toFixed(1) + '" y="' + (y - 8).toFixed(1) + '" text-anchor="middle" font-size="13">' + compatto(tot[i]) + '</text>' : '');
    }).join('');
    return svg(c + assiMesi(mesi), testoTitolo(nome, mesi, tot, intero));
  }

  /* più linee, con i buchi dove manca il dato (scala che parte vicino al minimo) */
  function graficoLinee(mesi, serie, nome) {
    var tutti = [];
    serie.forEach(function (s) { mesi.forEach(function (m) { var v = s.valore(m); if (v != null) tutti.push(v); }); });
    if (!tutti.length) return '';
    var min = Math.min.apply(null, tutti), max = Math.max.apply(null, tutti);
    var basso = Math.max(0, Math.floor(min - (max - min) * 0.25 - 1)), alto = max + Math.max(1, (max - min) * 0.1);
    var p = xPasso(mesi.length), alt = H - BASSO - ALTO;
    var y = function (v) { return H - BASSO - alt * (v - basso) / (alto - basso); };
    var c = serie.map(function (s) {
      var d = '', prima = false, ultimo = null;
      mesi.forEach(function (m, i) {
        var v = s.valore(m), x = SX + p * i + p / 2;
        if (v == null) { prima = false; return; }
        d += (prima ? 'L' : 'M') + x.toFixed(1) + ' ' + y(v).toFixed(1) + ' '; prima = true; ultimo = [x, y(v), v];
      });
      var punti = mesi.map(function (m, i) { var v = s.valore(m); return v == null ? '' : '<circle class="punto" style="--i:' + i + '" cx="' + (SX + p * i + p / 2).toFixed(1) + '" cy="' + y(v).toFixed(1) + '" r="3.5" fill="#fff" stroke="' + s.colore + '" stroke-width="2.5"/>'; }).join('');
      return '<path class="traccia" d="' + d + '" fill="none" stroke="' + s.colore + '" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" pathLength="1"/>' + punti +
        (ultimo ? '<text class="valore" x="' + Math.min(ultimo[0], W - 30).toFixed(1) + '" y="' + (ultimo[1] - 12).toFixed(1) + '" text-anchor="middle" font-size="14">' + compatto(ultimo[2]) + '</text>' : '');
    }).join('');
    return svg(c + assiMesi(mesi), nome + ': ' + serie.map(function (s) {
      var u = mesi.map(s.valore).filter(function (v) { return v != null; }); return s.nome + ' ' + (u.length ? intero(u[u.length - 1]) : 'nessun dato');
    }).join(', '));
  }
  function legenda(voci) {
    return voci.map(function (v) { return '<span><i style="background:' + v.colore + '"></i>' + h(v.nome) + '</span>'; }).join('');
  }

  /* il percorso del cliente: quattro passi con icona, sempre tutti e quattro,
     "—" dove il numero non c'è ancora (niente barre che escono dal riquadro) */
  function disegnaPercorso(d) {
    var mk = d.marketing || {}, m = d.mesi[d.mesi.length - 1];
    var soc = mk.instagram_copertura != null || mk.facebook_copertura != null ? (mk.instagram_copertura || 0) + (mk.facebook_copertura || 0) : null;
    var passi = [
      { nome: 'Hanno visto i social', icona: 'eye', valore: soc },
      { nome: 'Sono andati sul sito', icona: 'globe', valore: mk.visite_sito != null ? mk.visite_sito : null },
      { nome: 'Hanno prenotato', icona: 'calendar-check', valore: m.prenotazioni },
      { nome: 'Sono arrivati in sede', icona: 'check', valore: m.presenti != null ? m.presenti : d.kpi.arrivati.valore }
    ];
    return passi.map(function (x, i) {
      var prima = i ? passi[i - 1].valore : null;
      var quota = i && x.valore != null && prima ? Math.round(x.valore / prima * 1000) / 10 : null;
      return (i ? '<li class="cre-passo-freccia" aria-hidden="true"><svg class="ico"><use href="#i-arrow-down"/></svg>' +
          (quota != null ? '<span>' + String(Math.min(quota, 999)).replace('.', ',') + '%</span>' : '') + '</li>' : '') +
        '<li class="cre-passo' + (x.valore == null ? ' cre-passo-vuoto' : '') + (i === passi.length - 1 ? ' cre-passo-fine' : '') + '">' +
        '<span class="cre-passo-icona"><svg class="ico" aria-hidden="true"><use href="#i-' + x.icona + '"/></svg></span>' +
        '<strong>' + (x.valore == null ? '—' : intero(x.valore)) + '</strong>' +
        '<span class="cre-passo-nome">' + h(x.nome) + (x.valore == null ? '<small>Ancora da inserire</small>' : '') +
        (quota != null ? '<span class="sr-solo"> (' + String(quota).replace('.', ',') + '% del passo prima)</span>' : '') + '</span></li>';
    }).join('');
  }

  /* un blocco di social / Google / pubblicità */
  function disegnaBlocco(g, d) {
    var mk = d.marketing || {}, pr = d.mesi.length > 1 ? (d.mesi[d.mesi.length - 2].marketing || {}) : {}, k = d.kpi;
    var apex = ruolo === 'apex', righe = [];
    function riga(icona, nome, valore, delta) {
      righe.push('<li><span class="cre-riga-nome"><svg class="ico" aria-hidden="true"><use href="#i-' + icona + '"/></svg>' + h(nome) + '</span>' +
        '<span class="cre-riga-valore">' + valore + delta + '</span></li>');
    }
    var conDati = g.campi.some(function (id) { return mk[id] != null; });
    if (g.id === 'google') {
      ['google_visualizzazioni', 'google_chiamate', 'google_indicazioni', 'google_clic_sito'].forEach(function (id) {
        if (mk[id] != null) riga(VOCI[id][1], VOCI[id][0], intero(mk[id]), variazione(mk[id], pr[id], 'pct'));
      });
      if (mk.recensioni_media != null || mk.recensioni_numero != null) riga('star', 'Recensioni',
        (mk.recensioni_media != null ? String(mk.recensioni_media).replace('.', ',') + ' <span class="stelle">★</span>' : '') +
        (mk.recensioni_numero != null ? ' <small>' + intero(mk.recensioni_numero) + ' in tutto</small>' : ''), variazione(mk.recensioni_numero, pr.recensioni_numero, 'abs'));
    } else if (g.id === 'pubblicita') {
      if (k.spesa.valore != null) riga('euro', 'Spesa del mese', euro(Math.round(k.spesa.valore * 100)), '');
      if (k.costoPrenotazione.valore != null) riga('target', 'Costo per prenotazione', euro(k.costoPrenotazione.valore), '');
      if (k.ritornoPubblicita.valore != null) riga('trending-up', 'Rende, per ogni €1', euro(Math.round(k.ritornoPubblicita.valore * 100)), '');
    } else {
      g.campi.forEach(function (id) {
        if (mk[id] != null) riga(VOCI[id][1], VOCI[id][0], intero(mk[id]), variazione(mk[id], pr[id], /follower/.test(id) ? 'abs' : 'pct'));
      });
    }
    var corpo = righe.length ? '<ul class="cre-righe">' + righe.join('') + '</ul>'
      : '<p class="cre-blocco-vuoto">' + (apex ? 'Nessun numero per questo mese.' : 'In arrivo: lo aggiorna Apex Media a inizio mese.') + '</p>';
    return '<article class="cre-blocco' + (conDati ? '' : ' cre-blocco-senza') + '" style="--c:' + g.c + ';--c-chiaro:' + g.chiaro + '">' +
      '<header class="cre-blocco-testa"><span class="cre-blocco-icona"><svg class="ico" aria-hidden="true"><use href="#i-' + g.icona + '"/></svg></span>' +
      '<h3>' + h(g.titolo) + '</h3>' +
      (apex ? '<button type="button" class="cre-blocco-modifica" data-cre-apri="' + g.id + '"><svg class="ico" aria-hidden="true"><use href="#i-pencil"/></svg>' + (conDati ? 'Modifica' : 'Inserisci') + '</button>' : '') +
      '</header>' + corpo + '</article>';
  }

  /* ---------- la scheda ---------- */
  caricatori.crescita = function () {
    return api('crescita', { query: creMese ? 'mese=' + creMese.slice(0, 7) : '' }).then(function (d) {
      creDati = d; creMese = d.mese; ruolo = d.ruolo || ruolo;
      var k = d.kpi, apex = ruolo === 'apex', nomeM = nomeMeseLungo(d.mese);
      $('[data-cre-titolo]').textContent = nomeM;
      $('[data-cre-dopo]').disabled = d.mese >= d.corrente;
      $('[data-cre-apex]').hidden = !apex;
      $('[data-cre-apex-testo]').textContent = d.aggiornato
        ? 'Dati di ' + nomeM.toLowerCase() + ' inseriti il ' + dataTesto(d.aggiornato, { day: 'numeric', month: 'long' }) + '. Tocca «Modifica» su un blocco per cambiarli.'
        : 'I dati di ' + nomeM.toLowerCase() + ' non sono ancora stati inseriti: Marcella vede «In arrivo».';
      $('[data-cre-riassunto]').textContent = d.riassunto;

      /* il coworking: cinque tessere che si spiegano da sole */
      var ultimo = d.mesi[d.mesi.length - 1];
      $('[data-cre-tessere]').innerHTML = [
        tessera({ icona: 'calendar-check', c: '#1B2A3A', chiaro: '#DDE3EA', nome: 'Prenotazioni', valore: intero(k.prenotazioni.valore),
          spiega: 'Arrivate questo mese, dal sito e in sede.', delta: variazione(k.prenotazioni.valore, k.prenotazioni.prima, 'pct') }),
        tessera({ icona: 'euro', c: '#1E6B52', chiaro: '#D6EADF', nome: 'Incassato', valore: euro(k.incasso.valore),
          spiega: 'Soldi già entrati. Prenotato in tutto: ' + euro(k.valorePrenotato.valore) + '.', delta: variazione(k.incasso.valore, k.incasso.prima, 'pct') }),
        tessera({ icona: 'user-plus', c: '#9A6B12', chiaro: '#F5DFAE', nome: 'Nuovi clienti', valore: intero(k.nuoviClienti.valore),
          spiega: 'Persone venute per la prima volta.', delta: variazione(k.nuoviClienti.valore, k.nuoviClienti.prima, 'pct') }),
        tessera({ icona: 'repeat', c: '#1E6471', chiaro: '#D3E6EA', nome: 'Clienti che tornano', valore: k.quotaRitorni.valore == null ? '—' : k.quotaRitorni.valore + '%',
          spiega: k.quotaRitorni.valore == null ? 'Nessun cliente questo mese.' : 'Dei ' + ultimo.clienti + ' clienti del mese, quanti erano già venuti.' }),
        tessera({ icona: 'check', c: '#166A3A', chiaro: '#DCEFE2', nome: 'Arrivati in sede', valore: intero(k.arrivati.valore),
          spiega: k.nonVenuti.valore ? 'Segnati «È arrivato». Non venuti: ' + k.nonVenuti.valore + '.' : 'Giornate segnate con «È arrivato».', delta: variazione(k.arrivati.valore, k.arrivati.prima, 'pct') })
      ].join('');

      $('[data-cre-percorso]').innerHTML = disegnaPercorso(d);
      $('[data-cre-blocchi]').innerHTML = GRUPPI.map(function (g) { return disegnaBlocco(g, d); }).join('');
      $$('[data-cre-apri]').forEach(function (b) { b.addEventListener('click', function () { apriModulo(b.getAttribute('data-cre-apri')); }); });

      $('[data-cre-nota-box]').hidden = !d.note;
      $('[data-cre-nota]').textContent = d.note || '';

      /* grafici degli ultimi 12 mesi */
      var mesi = d.mesi;
      $('[data-cre-g-prenotazioni]').innerHTML = graficoLinea(mesi, mesi.map(function (m) { return m.prenotazioni; }), intero, '#1B2A3A', 'Prenotazioni');
      $('[data-cre-g-incassi]').innerHTML = graficoIncassi(mesi);
      var voci = d.canali.map(function (c) { return { id: c, nome: c, colore: COLORI_CANALI[c] || '#C5BDAD' }; });
      $('[data-cre-g-canali]').innerHTML = voci.length ? graficoImpilato(mesi, voci, function (m, id) { return m.canali[id]; }, 'Prenotazioni per canale') : '<p class="vuoto">Ancora nessuna prenotazione negli ultimi 12 mesi.</p>';
      $('[data-cre-l-canali]').innerHTML = legenda(voci);
      var social = [
        { nome: 'Instagram', colore: '#B4457E', valore: function (m) { return m.marketing && m.marketing.instagram_follower != null ? m.marketing.instagram_follower : null; } },
        { nome: 'Facebook', colore: '#3B5BDB', valore: function (m) { return m.marketing && m.marketing.facebook_follower != null ? m.marketing.facebook_follower : null; } }
      ].filter(function (s) { return mesi.some(function (m) { return s.valore(m) != null; }); });
      $('[data-cre-g-social]').innerHTML = social.length ? graficoLinee(mesi, social, 'Follower') : '<p class="vuoto">Nessun dato dei social per ora.</p>';
      $('[data-cre-l-social]').innerHTML = legenda(social);
      var vociG = [{ id: 'google_chiamate', nome: 'Chiamate', colore: '#1B2A3A' }, { id: 'google_indicazioni', nome: 'Indicazioni', colore: '#0C8599' }, { id: 'google_clic_sito', nome: 'Clic sul sito', colore: '#C9973B' }];
      var conG = mesi.some(function (m) { return m.marketing && vociG.some(function (v) { return m.marketing[v.id]; }); });
      $('[data-cre-g-google]').innerHTML = conG ? graficoImpilato(mesi, vociG, function (m, id) { return m.marketing ? m.marketing[id] : 0; }, 'Azioni sul profilo Google') : '<p class="vuoto">Nessun dato di Google per ora.</p>';
      $('[data-cre-l-google]').innerHTML = conG ? legenda(vociG) : '';
      $('[data-cre-aggiornato]').textContent = d.aggiornato ? 'Numeri di social e Google aggiornati da Apex Media il ' + dataTesto(d.aggiornato, { day: 'numeric', month: 'long', year: 'numeric' }) + '.' : '';
    }).catch(function (x) { toast(x.message, true); });
  };
  $('[data-cre-prima]').addEventListener('click', function () { creMese = piuMesi(creMese, -1); caricatori.crescita(); });
  $('[data-cre-dopo]').addEventListener('click', function () { creMese = piuMesi(creMese, 1); caricatori.crescita(); });

  /* ---------- modulo per Apex Media: un blocco per canale ---------- */
  var dialogo = $('[data-cre-dialogo]'), modulo = $('[data-cre-form]');
  function valoreCampo(v) { return v == null ? '' : String(v).replace('.', ','); }
  function apriModulo(gruppo) {
    if (!creDati) return;
    var mk = creDati.marketing || {}, nomi = {};
    var pr = creDati.mesi.length > 1 ? (creDati.mesi[creDati.mesi.length - 2].marketing || {}) : {};
    var nomePrima = cap(creDati.nomeMesePrima || 'mese prima');
    creDati.campi.forEach(function (c) { nomi[c.id] = c; });
    $('[data-cre-mod-titolo]').textContent = 'Dati di ' + nomeMeseLungo(creDati.mese).toLowerCase();
    $('[data-cre-campi]').innerHTML = GRUPPI.map(function (g) {
      var haPrima = g.campi.some(function (id) { return pr[id] != null; });
      return '<fieldset class="cre-gruppo" data-gruppo="' + g.id + '" style="--c:' + g.c + ';--c-chiaro:' + g.chiaro + '">' +
        '<legend class="cre-gruppo-testa"><span class="cre-blocco-icona"><svg class="ico" aria-hidden="true"><use href="#i-' + g.icona + '"/></svg></span>' + h(g.titolo) + '</legend>' +
        '<p class="nota cre-aiuto">' + h(g.aiuto) + '</p>' +
        (haPrima ? '<button type="button" class="cre-copia" data-cre-copia="' + g.id + '"><svg class="ico" aria-hidden="true"><use href="#i-history"/></svg>Riprendi i numeri di ' + h(nomePrima.toLowerCase()) + '</button>' : '') +
        '<div class="cre-campi">' + g.campi.map(function (id) {
          var c = nomi[id], v = VOCI[id];
          return '<label class="cre-campo"><span class="cre-campo-nome"><svg class="ico" aria-hidden="true"><use href="#i-' + v[1] + '"/></svg>' + h(c.nome) + '</span>' +
            '<input name="' + id + '" inputmode="' + (c.dec ? 'decimal' : 'numeric') + '" autocomplete="off" placeholder="—" value="' + h(valoreCampo(mk[id])) + '">' +
            '<small>' + (pr[id] != null ? nomePrima + ': ' + h(valoreCampo(pr[id])) : 'Nessun dato il mese prima') + '</small></label>';
        }).join('') + '</div></fieldset>';
    }).join('');
    $$('[data-cre-copia]').forEach(function (b) {
      b.addEventListener('click', function () {
        var g = GRUPPI.filter(function (x) { return x.id === b.getAttribute('data-cre-copia'); })[0];
        g.campi.forEach(function (id) { if (pr[id] != null && !modulo[id].value) modulo[id].value = valoreCampo(pr[id]); });
        toast('Numeri ripresi: correggi quelli cambiati.');
      });
    });
    modulo.note.value = creDati.note || '';
    $('[data-cre-errore]').textContent = '';
    if (typeof dialogo.showModal === 'function') dialogo.showModal(); else dialogo.setAttribute('open', '');
    var dove = typeof gruppo === 'string' && modulo.querySelector('[data-gruppo="' + gruppo + '"]');
    if (dove) { dove.scrollIntoView({ block: 'start' }); var primo = dove.querySelector('input'); if (primo) primo.focus({ preventScroll: true }); }
    else modulo.scrollTop = 0;
  }
  function chiudiModulo() { if (dialogo.open) { if (typeof dialogo.close === 'function') dialogo.close(); else dialogo.removeAttribute('open'); } }
  $('[data-cre-modifica]').addEventListener('click', function () { apriModulo(); });
  $$('[data-cre-chiudi]').forEach(function (b) { b.addEventListener('click', chiudiModulo); });
  dialogo.addEventListener('click', function (e) { if (e.target === dialogo) chiudiModulo(); });
  modulo.addEventListener('submit', function (e) {
    e.preventDefault();
    var dati = {};
    creDati.campi.forEach(function (c) { if (modulo[c.id]) dati[c.id] = modulo[c.id].value; });
    var b = modulo.querySelector('button[type=submit]'); b.disabled = true;
    api('marketing', { dati: { mese: creDati.mese.slice(0, 7), dati: dati, note: modulo.note.value } }).then(function () {
      chiudiModulo(); toast('Dati di ' + nomeMeseLungo(creDati.mese).toLowerCase() + ' salvati.'); caricatori.crescita();
    }).catch(function (x) { $('[data-cre-errore]').textContent = x.message; })
      .then(function () { b.disabled = false; });
  });

  /* ---------- avvio: se la sessione è valida si entra direttamente ---------- */
  /* se il server è lento a svegliarsi (prima apertura dopo un po'), dopo
     5 secondi mostriamo comunque l'accesso: nessuna pagina bianca */
  var deciso = false;
  var lento = setTimeout(function () { if (!deciso) mostraAccesso(); }, 5000);
  /* dal pulsante dell'email "Apri e accetta la richiesta": /admin?pren=ID */
  var prenDaAprire = +(new URLSearchParams(location.search).get('pren') || 0);
  function apriDaEmail() {
    if (!prenDaAprire) return;
    var id = prenDaAprire; prenDaAprire = 0;
    try { history.replaceState(null, '', location.pathname + location.hash); } catch (x) {}
    apriScheda(id);
  }
  api('chi').then(function (r) { deciso = true; clearTimeout(lento); ruolo = r.ruolo || 'titolare'; mostraApp(); apriDaEmail(); }).catch(function (e) {
    deciso = true; clearTimeout(lento);
    if (e.stato === 501) { mostraApp(); return; }
    mostraAccesso();
  });
})();
