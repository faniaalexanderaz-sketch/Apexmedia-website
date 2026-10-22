/* =============================================================
   BAGNARINO COWORKING — script comune a tutte le pagine
   Legge config.js e riempie la pagina: prezzi, contatti, link
   WhatsApp, orari, posti liberi, dati strutturati per Google.
   Espone window.BGN con le utilità usate anche da prenota.js.
   ============================================================= */
(function () {
  'use strict';
  var C = window.BGN_CONFIG;
  if (!C) return;

  /* ---------- utilità di base ---------- */
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return [].slice.call((c || document).querySelectorAll(s)); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function euro(n) { return '€' + String(n).replace('.', ','); }
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function daIso(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function minuti(hhmm) { var p = String(hhmm).split(':'); return (+p[0]) * 60 + (+p[1] || 0); }
  function leggi(percorso) {
    return percorso.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, C);
  }
  function pacchetto(id) {
    for (var i = 0; i < C.listino.length; i++) if (C.listino[i].id === id) return C.listino[i];
    return null;
  }

  /* ---------- calendario: festivi, aperture ---------- */
  var cacheFestivi = {};
  function pasqua(y) { /* algoritmo di Gauss/Meeus */
    var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4,
        f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3),
        h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4,
        l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451),
        mese = Math.floor((h + l - 7 * m + 114) / 31), giorno = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(y, mese - 1, giorno);
  }
  function festivi(y) {
    if (cacheFestivi[y]) return cacheFestivi[y];
    var f = ['01-01', '01-06', '04-25', '05-01', '06-02', '08-15', '11-01', '12-08', '12-25', '12-26']
      .map(function (md) { return y + '-' + md; });
    var p = pasqua(y); p.setDate(p.getDate() + 1); f.push(iso(p)); /* Pasquetta */
    return (cacheFestivi[y] = f);
  }
  function aperto(d) {
    var s = iso(d);
    return C.orari.giorni.indexOf(d.getDay()) !== -1 &&
      festivi(d.getFullYear()).indexOf(s) === -1 &&
      (C.chiusure || []).indexOf(s) === -1;
  }
  function oggiPrenotabile(ora) {
    ora = ora || new Date();
    return aperto(ora) && ora.getHours() * 60 + ora.getMinutes() < minuti(C.orari.ultimaPrenotazioneOggi);
  }
  /* primo giorno in cui si può ancora prenotare */
  function primoGiornoUtile(ora) {
    ora = ora || new Date();
    var d = new Date(ora.getFullYear(), ora.getMonth(), ora.getDate());
    if (oggiPrenotabile(ora)) return d;
    for (var i = 0; i < 30; i++) { d.setDate(d.getDate() + 1); if (aperto(d)) return d; }
    return d;
  }

  /* ---------- posti liberi in modalità dimostrativa ----------
     Numeri finti ma realistici e stabili (stesso giorno = stesso
     numero). Oggi usa il valore di config.js. In fase 2 tutto
     questo viene sostituito dai dati di /api/disponibilita. */
  function liberiDemo(d) {
    var tot = C.postazioni;
    if (!aperto(d)) return 0;
    if (iso(d) === iso(primoGiornoUtile())) return Math.max(0, Math.min(tot, C.demo.postiLiberiOggi));
    var s = iso(d), h = 0;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    var scala = [tot - 1, tot - 2, tot - 2, tot - 3, 2, 1, 0, tot - 1, 3];
    return Math.max(0, Math.min(tot, scala[h % scala.length]));
  }

  /* ---------- date in italiano ---------- */
  var FMT = {
    lungo: { weekday: 'long', day: 'numeric', month: 'long' },
    breve: { weekday: 'short', day: 'numeric', month: 'short' }
  };
  function data(d, tipo) { return d.toLocaleDateString('it-IT', FMT[tipo || 'lungo']); }
  function relativa(d) {
    var oggi = new Date(); oggi.setHours(0, 0, 0, 0);
    var diff = Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - oggi) / 864e5);
    if (diff === 0) return 'Oggi';
    if (diff === 1) return 'Domani';
    var g = d.toLocaleDateString('it-IT', { weekday: 'long' });
    return g.charAt(0).toUpperCase() + g.slice(1);
  }

  /* ---------- WhatsApp ---------- */
  function testoWa(chiave, valori) {
    var t = (C.whatsappTesti && C.whatsappTesti[chiave]) || C.whatsappTesti.generico;
    return t.replace(/\{(\w+)\}/g, function (_, k) { return valori && valori[k] != null ? valori[k] : ''; });
  }
  function linkWa(chiave, valori) {
    return 'https://wa.me/' + C.contatti.whatsapp + '?text=' + encodeURIComponent(testoWa(chiave, valori));
  }

  /* ---------- misurazione (si accende in fase 3) ----------
     Un solo punto da cui passano tutti gli eventi: GA4 via
     dataLayer e Meta Pixel, solo se caricati dopo il consenso. */
  var META = { view_item: 'ViewContent', begin_checkout: 'InitiateCheckout', generate_lead: 'Contact', purchase: 'Schedule' };
  function consensoMisurazione() { try { return localStorage.getItem('bgn-cookie') === 'tutti'; } catch (e) { return false; } }
  function traccia(evento, dati) {
    dati = dati || {};
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: evento, parametri: dati });
      if (window.gtag && C.ga4) window.gtag('event', evento, dati);
      /* eventID: lo stesso codice parte anche dal server (Conversions API),
         così Meta conta la prenotazione una volta sola */
      if (window.fbq && META[evento]) window.fbq('track', META[evento], dati.value ? { value: dati.value, currency: 'EUR' } : {}, dati.event_id ? { eventID: dati.event_id } : undefined);
    } catch (e) {}
  }

  /* ---------- provenienza della visita (utm) ----------
     Salvata alla prima pagina vista e allegata alla prenotazione:
     in fase 3 la dashboard dice da dove arrivano i clienti. */
  function origine() {
    try { return JSON.parse(sessionStorage.getItem('bgn-origine') || '{}'); } catch (e) { return {}; }
  }
  (function salvaOrigine() {
    try {
      if (sessionStorage.getItem('bgn-origine')) return;
      var q = new URLSearchParams(location.search), o = {};
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'gclid', 'fbclid'].forEach(function (k) {
        if (q.get(k)) o[k] = q.get(k);
      });
      if (document.referrer && document.referrer.indexOf(location.host) === -1) o.referrer = document.referrer;
      o.pagina = location.pathname;
      sessionStorage.setItem('bgn-origine', JSON.stringify(o));
    } catch (e) {}
  })();

  /* ---------- API (fase 2): risponde? ----------
     Se l'indirizzo non esiste ancora (404) o non risponde entro
     pochi secondi, si resta in modalità dimostrativa. */
  function chiamaApi(url, opzioni) {
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = ctrl && setTimeout(function () { ctrl.abort(); }, 6000);
    opzioni = opzioni || {};
    if (ctrl) opzioni.signal = ctrl.signal;
    return fetch(url, opzioni).then(function (r) {
      if (timer) clearTimeout(timer);
      var tipo = r.headers.get('content-type') || '';
      if (tipo.indexOf('application/json') === -1) throw new Error('api-assente');
      return r.json().then(function (j) { if (!r.ok) { var e = new Error(j.errore || 'errore'); e.dati = j; e.stato = r.status; throw e; } return j; });
    });
  }
  function disponibilita(da, giorni, pacchettoId) {
    return chiamaApi(C.api.disponibilita + '?da=' + iso(da) + '&giorni=' + giorni + (pacchettoId ? '&pacchetto=' + pacchettoId : ''))
      .then(function (j) { if (j.modalita === 'demo' || !j.giorni) throw new Error('demo'); return { reale: true, giorni: j.giorni }; })
      .catch(function () {
        if (console && console.info) console.info('[Bagnarino] Motore di prenotazione non attivo: modalità dimostrativa.');
        var out = {}, d = new Date(da);
        for (var i = 0; i < giorni; i++) { out[iso(d)] = liberiDemo(d); d.setDate(d.getDate() + 1); }
        return { reale: false, giorni: out };
      });
  }

  window.BGN = {
    cfg: C, $: $, $$: $$, euro: euro, iso: iso, daIso: daIso, pacchetto: pacchetto,
    aperto: aperto, oggiPrenotabile: oggiPrenotabile, primoGiornoUtile: primoGiornoUtile,
    data: data, relativa: relativa, testoWa: testoWa, linkWa: linkWa, traccia: traccia,
    origine: origine, chiamaApi: chiamaApi, disponibilita: disponibilita, consensoMisurazione: consensoMisurazione
  };

  /* =============================================================
     Riempimento della pagina
     ============================================================= */
  function sitoUrl() { return (C.sitoUrl || location.origin).replace(/\/$/, ''); }

  /* testi semplici: <span data-cfg="azienda.indirizzo"> */
  $$('[data-cfg]').forEach(function (el) {
    var v = leggi(el.getAttribute('data-cfg'));
    if (v != null && v !== '') el.textContent = v;
  });
  /* prezzi: <span data-prezzo="giornata"> */
  $$('[data-prezzo]').forEach(function (el) {
    var p = pacchetto(el.getAttribute('data-prezzo'));
    if (p) el.textContent = euro(p.prezzo);
  });
  $$('[data-prezzo-concorrenza]').forEach(function (el) { el.textContent = euro(C.concorrenza.prezzoGiorno); });
  /* blocchi legati a un dato non confermato */
  $$('[data-cfg-attivo]').forEach(function (el) {
    if (!leggi(el.getAttribute('data-cfg-attivo'))) el.hidden = true; else el.hidden = false;
  });
  $$('[data-anno]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  $$('[data-anni]').forEach(function (el) { el.textContent = new Date().getFullYear() - C.azienda.dal; });

  /* telefoni, email, WhatsApp, mappe */
  $$('[data-tel]').forEach(function (el) {
    var fisso = el.getAttribute('data-tel') === 'fisso';
    el.href = 'tel:' + (fisso ? C.azienda.telefonoFisso : C.contatti.cellulare);
    if (el.hasAttribute('data-tel-testo')) el.textContent = fisso ? C.azienda.telefonoFissoVisibile : C.contatti.cellulareVisibile;
  });
  $$('[data-mail]').forEach(function (el) { el.href = 'mailto:' + C.azienda.email; if (!el.children.length) el.textContent = C.azienda.email; });
  $$('[data-wa]').forEach(function (el) {
    var chiave = el.getAttribute('data-wa') || 'generico';
    var valori = {};
    if (chiave === 'pacchetto') { var p = pacchetto(el.getAttribute('data-wa-pacchetto')); valori.pacchetto = p ? p.nome.toLowerCase() : ''; }
    el.href = linkWa(chiave, valori);
    el.target = '_blank'; el.rel = 'noopener';
  });
  var indirizzoCompleto = C.azienda.indirizzo + ', ' + C.azienda.cap + ' ' + C.azienda.citta + ' ' + C.azienda.provincia;
  $$('[data-indicazioni]').forEach(function (el) {
    el.href = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent('Bagnarino, ' + indirizzoCompleto);
    el.target = '_blank'; el.rel = 'noopener';
  });

  /* ogni contatto diretto è un contatto commerciale */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a');
    if (!a) return;
    if (a.href.indexOf('wa.me') !== -1) traccia('generate_lead', { metodo: 'whatsapp', posizione: a.getAttribute('data-pos') || '' });
    else if (a.href.indexOf('tel:') === 0) traccia('generate_lead', { metodo: 'telefono', posizione: a.getAttribute('data-pos') || '' });
    else if (a.href.indexOf('prenota') !== -1 && a.hasAttribute('data-pos')) traccia('select_item', { posizione: a.getAttribute('data-pos') });
  });

  /* ---------- listino (home): card generate da config.js ---------- */
  var listino = $('[data-listino]');
  if (listino) {
    listino.innerHTML = C.listino.map(function (p) {
      var cifra = euro(p.prezzo).replace('€', '');
      return '<article class="prezzo' + (p.evidenza ? ' prezzo-evidenza' : '') + '" data-card-prezzo>' +
        '<div class="prezzo-testa"><h3 class="prezzo-nome">' + p.nome + '</h3>' +
        (p.etichetta ? '<p class="prezzo-etichetta">' + p.etichetta + '</p>' : '') + '</div>' +
        '<p class="prezzo-cifra"><span class="visually-hidden">' + euro(p.prezzo) + ' ' + p.unita + '</span><span class="prezzo-valuta" aria-hidden="true">€</span>' +
        '<span class="prezzo-valore" aria-hidden="true" data-cifra="' + p.prezzo + '">' + cifra + '</span>' +
        '<span class="prezzo-unita" aria-hidden="true">' + p.unita + '</span></p>' +
        '<p class="prezzo-nota">' + p.nota + '</p>' +
        '<ul class="prezzo-include">' + p.include.map(function (x) {
          return '<li><span class="prezzo-spunta"><svg class="ico" aria-hidden="true"><use href="#i-check"/></svg></span>' + x + '</li>';
        }).join('') + '</ul>' +
        '<a class="btn ' + (p.evidenza ? 'btn-ocra' : 'btn-pieno') + ' btn-largo" href="/prenota?pacchetto=' + p.id + '" data-pos="prezzi-' + p.id + '">' + p.cta +
        '<svg class="ico" aria-hidden="true"><use href="#i-arrow-right"/></svg></a>' +
        '</article>';
    }).join('');
    if ('IntersectionObserver' in window) {
      var visto = false;
      new IntersectionObserver(function (voci, oss) {
        if (visto || !voci[0].isIntersecting) return;
        visto = true; oss.disconnect();
        traccia('view_item', { item_list: 'listino', value: pacchetto('giornata') ? pacchetto('giornata').prezzo : 0 });
      }, { threshold: 0.3 }).observe(listino);
    }
  }

  /* ---------- posti liberi: badge dell'apertura ---------- */
  var badge = $$('[data-posti-oggi]');
  if (badge.length) {
    var giornoBadge = primoGiornoUtile();
    var mostraBadge = function (liberi) {
      var quando = relativa(giornoBadge);
      var testo = liberi === 0 ? quando + ': completo' :
        quando + ': ' + liberi + (liberi === 1 ? ' posto libero' : ' posti liberi');
      badge.forEach(function (el) {
        el.textContent = testo;
        el.closest('.badge') && el.closest('.badge').classList.toggle('badge-pieno', liberi === 0);
      });
    };
    mostraBadge(liberiDemo(giornoBadge));
    disponibilita(giornoBadge, 1).then(function (r) { if (r.reale && r.giorni[iso(giornoBadge)] != null) mostraBadge(r.giorni[iso(giornoBadge)]); });
  }

  /* ---------- disponibilità: scegli il giorno, vedi le scrivanie ----------
     Le scrivanie si assegnano in automatico: qui mostriamo quante sono
     libere quel giorno, non una scrivania precisa da scegliere. */
  var disp = $('[data-disp]');
  if (disp) {
    var boxGiorni = $('[data-disp-giorni]', disp), listaScr = $('[data-disp-scrivanie]', disp);
    /* tante scrivanie quante ne dice la configurazione */
    var modello = $('[data-scrivania]', listaScr);
    if (modello) {
      var html = '';
      for (var n = 1; n <= C.postazioni; n++) html += modello.outerHTML.replace(/data-scrivania="\d+"/, 'data-scrivania="' + n + '"').replace(/<span class="disp-num">\d+<\/span>/, '<span class="disp-num">' + n + '</span>');
      listaScr.innerHTML = html;
    }
    var scrivanie = $$('[data-scrivania]', listaScr);
    var giorniDisp = [], cursore = primoGiornoUtile();
    for (var k = 0; giorniDisp.length < 5 && k < 30; k++) {
      if (aperto(cursore)) giorniDisp.push(new Date(cursore.getFullYear(), cursore.getMonth(), cursore.getDate()));
      cursore.setDate(cursore.getDate() + 1);
    }
    var liberiDi = {};
    giorniDisp.forEach(function (g) { liberiDi[iso(g)] = liberiDemo(g); });
    var scelto = giorniDisp.length ? iso(giorniDisp[0]) : null;
    var breve = function (g) {
      var r = relativa(g);
      return r === 'Oggi' || r === 'Domani' ? r : g.toLocaleDateString('it-IT', { weekday: 'short' }).replace('.', '');
    };
    var disegnaGiorniDisp = function () {
      boxGiorni.innerHTML = giorniDisp.map(function (g) {
        var key = iso(g), lib = liberiDi[key], pieno = lib === 0;
        return '<button type="button" class="disp-giorno' + (pieno ? ' pieno' : lib <= 2 ? ' pochi' : '') + '" data-giorno="' + key + '" aria-pressed="' + (key === scelto) + '">' +
          '<span class="dg-sett">' + breve(g) + '</span><span class="dg-num">' + g.getDate() + '</span>' +
          '<span class="dg-liberi">' + (pieno ? 'completo' : lib + (lib === 1 ? ' libera' : ' libere')) + '</span></button>';
      }).join('');
    };
    var ordine = [2, 5, 1, 4, 6, 3];
    var aggiornaSala = function () {
      if (!scelto) return;
      var g = daIso(scelto), lib = liberiDi[scelto], occupate = C.postazioni - lib;
      /* ordine di riempimento realistico, non in fila */
      var seq = ordine.filter(function (x) { return x <= C.postazioni; });
      for (var x = 1; x <= C.postazioni; x++) if (seq.indexOf(x) === -1) seq.push(x);
      scrivanie.forEach(function (sc) {
        var num = +sc.getAttribute('data-scrivania'), occ = seq.indexOf(num) < occupate;
        sc.classList.toggle('occupata', occ); sc.classList.toggle('libera', !occ);
        $('.disp-stato', sc).textContent = occ ? 'Occupata' : 'Libera';
        sc.setAttribute('aria-label', 'Scrivania ' + num + ': ' + (occ ? 'occupata' : 'libera'));
      });
      var quando = relativa(g);
      var quandoTesto = quando === 'Oggi' || quando === 'Domani' ? quando.toLowerCase() : quando.toLowerCase() + ' ' + g.getDate();
      $('[data-disp-conta]', disp).textContent = lib + ' su ' + C.postazioni;
      $('[data-disp-quando]', disp).textContent = (lib === 1 ? 'scrivania libera ' : 'scrivanie libere ') + quandoTesto;
      var cta = $('[data-disp-cta]', disp);
      if (lib === 0) {
        cta.href = '/prenota?pacchetto=giornata';
        $('[data-disp-cta-testo]', disp).textContent = 'Completo: scegli un altro giorno';
      } else {
        cta.href = '/prenota?pacchetto=giornata&data=' + scelto;
        $('[data-disp-cta-testo]', disp).textContent = 'Prenota per ' + quandoTesto;
      }
    };
    boxGiorni.addEventListener('click', function (e) {
      var b = e.target.closest('[data-giorno]');
      if (!b) return;
      scelto = b.getAttribute('data-giorno');
      $$('[data-giorno]', boxGiorni).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      disp.classList.remove('cambia'); void disp.offsetWidth; disp.classList.add('cambia');
      aggiornaSala();
    });
    disegnaGiorniDisp(); aggiornaSala();
    if (giorniDisp.length) {
      var ultimo = giorniDisp[giorniDisp.length - 1];
      var span = Math.round((ultimo - giorniDisp[0]) / 864e5) + 1;
      disponibilita(giorniDisp[0], span).then(function (r) {
        if (!r.reale) return;
        giorniDisp.forEach(function (g) { var key = iso(g); if (r.giorni[key] != null) liberiDi[key] = r.giorni[key]; });
        $('[data-disp-fonte]', disp).textContent = 'Posti liberi in tempo reale';
        disp.classList.add('reale');
        disegnaGiorniDisp(); aggiornaSala();
      });
    }
  }

  /* ---------- orari (piè di pagina, dove siamo) ---------- */
  $$('[data-orari]').forEach(function (el) { el.textContent = C.orari.testoLungo; });

  /* ---------- mappa: si carica solo al tocco ----------
     L'iframe di Google pesa ~1 MB e usa cookie di terze parti:
     finché non serve, al suo posto c'è un'anteprima leggera. */
  $$('[data-mappa]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = 'https://www.google.com/maps?q=' + encodeURIComponent('Bagnarino, ' + indirizzoCompleto) + '&z=16&output=embed';
      f.title = 'Mappa: ' + indirizzoCompleto;
      f.loading = 'lazy';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      f.className = 'mappa-iframe';
      btn.parentNode.replaceChild(f, btn);
    });
  });

  /* ---------- FAQ: una risposta aperta alla volta ---------- */
  var faq = $$('.faq details');
  faq.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) faq.forEach(function (x) { if (x !== d) x.open = false; });
    });
  });

  /* ---------- testata: ombra quando si scorre ---------- */
  var testata = $('.testata');
  if (testata) {
    var su = function () { testata.classList.toggle('scorsa', window.scrollY > 8); };
    window.addEventListener('scroll', su, { passive: true }); su();
  }

  /* ---------- barra delle schede: evidenzia dove si trova l'utente ---------- */
  var schede = $$('.tab-app [data-tab]');
  if (schede.length) {
    var segna = function (nome) {
      schede.forEach(function (t) {
        if (t.getAttribute('data-tab') === nome) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current');
      });
    };
    var percorso = location.pathname.replace(/\/$/, '') || '/';
    if (percorso === '/' || percorso === '/index') {
      segna(location.hash === '#prezzi' ? 'prezzi' : 'home');
      var sezPrezzi = $('#prezzi');
      if (sezPrezzi && 'IntersectionObserver' in window) {
        new IntersectionObserver(function (voci) { segna(voci[0].isIntersecting ? 'prezzi' : 'home'); },
          { rootMargin: '-45% 0px -45% 0px' }).observe(sezPrezzi);
      }
    } else if (percorso === '/prenotazione') segna('prenotazione');
  }

  /* ---------- menu (hamburger in alto, "Contatti" in basso) ---------- */
  var menu = $('#menu');
  if (menu && typeof menu.showModal === 'function') {
    var pulsanti = $$('[data-menu-apri]');
    var chiudi = function () { if (menu.open) menu.close(); };
    menu.addEventListener('close', function () {
      document.body.classList.remove('menu-aperto');
      pulsanti.forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    });
    pulsanti.forEach(function (b) {
      b.addEventListener('click', function () {
        menu.showModal();
        document.body.classList.add('menu-aperto');
        b.setAttribute('aria-expanded', 'true');
        var soloContatti = b.getAttribute('data-menu-apri') === 'contatti';
        menu.classList.toggle('solo-contatti', soloContatti);
        menu.scrollTop = 0;
        if (soloContatti) traccia('apri_contatti', { posizione: 'tab' });
      });
    });
    $$('[data-menu-chiudi]', menu).forEach(function (b) { b.addEventListener('click', chiudi); });
    /* tocco fuori dal pannello = chiudi */
    menu.addEventListener('click', function (e) { if (e.target === menu) chiudi(); });
    /* le voci del menu portano altrove o a una sezione: chiudi subito */
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setTimeout(chiudi, 0); }); });
  } else if (menu) {
    /* browser molto vecchi: il menu resta una lista in fondo alla pagina */
    menu.setAttribute('open', '');
    menu.style.position = 'static';
  }

  /* ---------- SEO: indirizzi assoluti e dati strutturati ---------- */
  var base = sitoUrl();
  var can = $('link[rel="canonical"]');
  if (can) can.href = base + (can.getAttribute('href') || '/').replace(base, '');
  $$('meta[property="og:url"], meta[property="og:image"], meta[name="twitter:image"]').forEach(function (m) {
    var v = m.getAttribute('content') || '';
    if (v.charAt(0) === '/') m.setAttribute('content', base + v);
  });

  function jsonLd(oggetto) {
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(oggetto);
    document.head.appendChild(s);
  }
  if (document.body.hasAttribute('data-schema-attivita')) {
    jsonLd({
      '@context': 'https://schema.org',
      '@type': ['LocalBusiness', 'CoworkingSpace'],
      '@id': base + '/#coworking',
      name: C.azienda.marchio,
      legalName: C.azienda.ragioneSociale,
      description: 'Coworking nel centro di Alessandria: postazioni a giornata, carnet e mensili con wi-fi in fibra e stampante incluse. Da ' + euro(C.listino[0].prezzo) + ' al giorno.',
      areaServed: { '@type': 'City', name: C.azienda.citta },
      url: base + '/',
      logo: base + '/img/logo.svg',
      image: base + '/img/og-bagnarino-coworking.jpg',
      telephone: C.contatti.cellulare,
      email: C.azienda.email,
      vatID: 'IT' + C.azienda.piva,
      foundingDate: String(C.azienda.dal),
      priceRange: euro(C.listino[0].prezzo) + ' - ' + euro(Math.max.apply(null, C.listino.map(function (p) { return p.prezzo; }))),
      address: {
        '@type': 'PostalAddress', streetAddress: C.azienda.indirizzo, postalCode: C.azienda.cap,
        addressLocality: C.azienda.citta, addressRegion: C.azienda.provincia, addressCountry: 'IT'
      },
      geo: { '@type': 'GeoCoordinates', latitude: C.azienda.geo.lat, longitude: C.azienda.geo.lng },
      openingHoursSpecification: [{
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].filter(function (_, i) { return C.orari.giorni.indexOf(i + 1) !== -1; }),
        opens: C.orari.apertura.length === 4 ? '0' + C.orari.apertura : C.orari.apertura,
        closes: C.orari.chiusura
      }],
      makesOffer: C.listino.map(function (p) {
        return {
          '@type': 'Offer', name: p.nome, price: p.prezzo, priceCurrency: 'EUR',
          url: base + '/prenota?pacchetto=' + p.id,
          itemOffered: { '@type': 'Service', name: 'Postazione coworking: ' + p.nome }
        };
      })
    });
  }
  if (faq.length) {
    jsonLd({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map(function (d) {
        return {
          '@type': 'Question',
          name: $('summary', d).textContent.trim(),
          acceptedAnswer: { '@type': 'Answer', text: $('.faq-risposta', d).textContent.trim().replace(/\s+/g, ' ') }
        };
      })
    });
  }
})();
