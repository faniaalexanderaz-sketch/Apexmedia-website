/* =============================================================
   ESSENZA D'ORIENTE — interazioni, prenotazione in 3 passi,
   tracciamento conversioni. Nessuna libreria esterna.
   =============================================================

   EVENTI DATALAYER (da importare in GA4 e poi in Google Ads):

   | Evento           | Significato                                   |
   |------------------|-----------------------------------------------|
   | prenota_apri     | Aperto il pannello di prenotazione            |
   | prenota_passo    | Completato un passo (passo: 1, 2, 3)          |
   | click_treatwell  | Click su "Conferma su Treatwell" (conversione) |
   | click_whatsapp   | Click su un link wa.me (conversione)           |
   | click_chiama     | Click su un link tel: (conversione)            |
   ============================================================= */
(function () {
  'use strict';

  var APRE = 9 * 60 + 30, CHIUDE = 22 * 60 + 30;
  var TEL = '+393317153533';
  var WA_BASE = 'https://wa.me/393317153533?text=';
  var TREATWELL_MENU = 'https://widget.treatwell.it/salone/532986/menu/';
  var base = document.body.getAttribute('data-base') || '';

  /* Un trattamento, una riga. `treatwell`: deep link al servizio nel
     widget Treatwell; finché è null si apre il menu generico e il
     pannello dice all'utente cosa cercare. */
  var TRATTAMENTI = [
    { id: 'oli',           nome: 'Massaggio Oli Essenziali', meta: 'Cervicale e schiena · 60 min', prezzo: '60 €', file: 'massaggio-oli-essenziali.html', treatwell: null },
    { id: 'tuina',         nome: 'Tuina Shiatsu',            meta: '50 min',                        prezzo: '50 €', file: 'tuina-shiatsu.html',            treatwell: null },
    { id: 'riflessologia', nome: 'Riflessologia Plantare',   meta: '40 min · 60 min a 50 €',        prezzo: '35 €', file: 'riflessologia-plantare.html',   treatwell: null },
    { id: 'spa',           nome: 'Massaggio Spa',            meta: 'Corpo completo · 90 min',       prezzo: '90 €', file: 'massaggio-spa.html',            treatwell: null },
    { id: 'coppettazione', nome: 'Coppettazione',            meta: 'Cupping · seduta breve',        prezzo: '25 €', file: 'coppettazione.html',            treatwell: null },
    { id: 'guasha',        nome: 'Gua Sha',                  meta: 'Seduta breve',                  prezzo: '25 €', file: 'gua-sha.html',                  treatwell: null },
    { id: 'orecchie',      nome: 'Pulizia delle Orecchie',   meta: 'Tecnica tradizionale cinese',   prezzo: '25 €', file: 'pulizia-orecchie.html',         treatwell: null },
    { id: 'pedicure',      nome: 'Pedicure',                 meta: 'Stile tradizionale cinese',     prezzo: '35 €', file: 'pedicure.html',                 treatwell: null }
  ];
  var FASCE = [
    { id: 'mattina',    nome: 'Mattina',    meta: '9:30 – 13:00',  da: 9 * 60 + 30,  a: 13 * 60 },
    { id: 'pomeriggio', nome: 'Pomeriggio', meta: '13:00 – 18:00', da: 13 * 60,      a: 18 * 60 },
    { id: 'sera',       nome: 'Sera',       meta: '18:00 – 22:30', da: 18 * 60,      a: 22 * 60 + 30 }
  ];

  /* ---------- tracciamento ---------- */
  var AW_ID = 'AW-17997395114';
  var AW_ETICHETTE = { PREDEFINITA: '', click_chiama: '', click_whatsapp: '', click_treatwell: '' };
  function traccia(obj) {
    if (window.EO_COOKIE) window.EO_COOKIE.push(obj);
    var etichetta = AW_ETICHETTE[obj.event] || AW_ETICHETTE.PREDEFINITA;
    if (!etichetta || typeof window.gtag !== 'function') return;
    if (obj.event !== 'click_chiama' && obj.event !== 'click_whatsapp' && obj.event !== 'click_treatwell') return;
    window.gtag('event', 'conversion', { send_to: AW_ID + '/' + etichetta, value: 30.0, currency: 'EUR', transport_type: 'beacon' });
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (href.indexOf('tel:') === 0) traccia({ event: 'click_chiama' });
    else if (href.indexOf('https://wa.me/') === 0) traccia({ event: 'click_whatsapp' });
  });

  /* ---------- header compatto allo scroll ---------- */
  var top = document.getElementById('top');
  if (top) {
    var ultimo = false;
    var aggiornaTop = function () {
      var compatto = window.scrollY > 24;
      if (compatto !== ultimo) { top.classList.toggle('compatto', compatto); ultimo = compatto; }
    };
    window.addEventListener('scroll', aggiornaTop, { passive: true });
    aggiornaTop();
  }

  /* ---------- ingresso sezioni: un fade, una volta sola ---------- */
  var reveal = document.querySelectorAll('[data-reveal]');
  if (reveal.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (voci) {
      voci.forEach(function (v) {
        if (v.isIntersecting) { v.target.classList.add('visibile'); io.unobserve(v.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' });
    reveal.forEach(function (el) { io.observe(el); });
  } else {
    reveal.forEach(function (el) { el.classList.add('visibile'); });
  }

  /* ---------- stato di apertura in tempo reale ---------- */
  function minutiOra() { var d = new Date(); return d.getHours() * 60 + d.getMinutes(); }
  function apertoOra() { var m = minutiOra(); return m >= APRE && m < CHIUDE; }
  var stato = document.getElementById('statoApertura');
  if (stato) {
    if (apertoOra()) stato.textContent = 'Aperti oggi fino alle 22:30';
    else { stato.textContent = 'Ora siamo chiusi: riapriamo alle 9:30. Puoi prenotare comunque.'; stato.classList.add('chiuso'); }
  }

  /* =============================================================
     PRENOTAZIONE IN 3 PASSI (bottom-sheet / pannello laterale)
     1. trattamento → 2. giorno + fascia → 3. conferma
     Il pannello è costruito qui una volta sola, così home, pagine
     trattamento e pagine legali condividono lo stesso codice.
     ============================================================= */
  var WA_SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.4-3c-.3-.4 0-.5.1-.7l.5-.6c.1-.2.1-.3 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1.1 2.7c.1.2 1.8 2.8 4.4 3.9 2.6 1.1 2.6.7 3.1.7.5 0 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.2-.3-.2-.6-.3Z"/></svg>';

  var scelta = { tratt: null, giorno: null, data: null, fascia: null };
  var passo = 1;
  var apertoDa = null;

  var scrim = document.createElement('div');
  scrim.className = 'sheet-scrim'; scrim.hidden = true;
  var sheet = document.createElement('aside');
  sheet.className = 'sheet'; sheet.hidden = true;
  sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'true');
  sheet.setAttribute('aria-labelledby', 'sheetTitolo');
  sheet.innerHTML =
    '<div class="sheet-testa"><h2 id="sheetTitolo">Prenota</h2><button type="button" class="sheet-chiudi" aria-label="Chiudi">×</button></div>' +
    '<div class="sheet-passi" aria-hidden="true"><span class="fatto"></span><span></span><span></span></div>' +
    '<div class="sheet-corpo">' +
      '<div class="sheet-passo" data-passo="1"><h3>Quale trattamento?</h3><div class="scelte" id="sheetTratt"></div></div>' +
      '<div class="sheet-passo" data-passo="2" hidden>' +
        '<h3>Quando?</h3>' +
        '<div class="scelte scelte-2" id="sheetGiorni"></div>' +
        '<div class="sheet-campo" id="sheetDataCampo" hidden><label for="sheetData">Scegli la data</label><input type="date" id="sheetData" /></div>' +
        '<div class="sheet-gruppo"><span>Fascia oraria preferita</span><div class="scelte" id="sheetFasce"></div></div>' +
      '</div>' +
      '<div class="sheet-passo" data-passo="3" hidden>' +
        '<h3>Conferma</h3>' +
        '<div class="riepilogo" id="sheetRiepilogo"></div>' +
        '<div class="conferma-azioni">' +
          '<a class="btn btn-primario" id="sheetTreatwell" target="_blank" rel="noopener" href="' + TREATWELL_MENU + '">Conferma su Treatwell</a>' +
          '<a class="btn btn-wa" id="sheetWa" target="_blank" rel="noopener">' + WA_SVG + 'Conferma su WhatsApp</a>' +
        '</div>' +
        '<p class="conferma-nota" id="sheetNota"></p>' +
        '<p class="conferma-tel">oppure chiama <a class="link" href="tel:' + TEL + '">331 715 3533</a></p>' +
      '</div>' +
    '</div>' +
    '<div class="sheet-piede"><button type="button" class="btn btn-secondario" id="sheetIndietro">Indietro</button><button type="button" class="btn btn-primario" id="sheetAvanti">Continua</button></div>';
  document.body.appendChild(scrim);
  document.body.appendChild(sheet);

  var elTratt = sheet.querySelector('#sheetTratt');
  var elGiorni = sheet.querySelector('#sheetGiorni');
  var elDataCampo = sheet.querySelector('#sheetDataCampo');
  var elData = sheet.querySelector('#sheetData');
  var elFasce = sheet.querySelector('#sheetFasce');
  var elRiepilogo = sheet.querySelector('#sheetRiepilogo');
  var elTreatwell = sheet.querySelector('#sheetTreatwell');
  var elWa = sheet.querySelector('#sheetWa');
  var elNota = sheet.querySelector('#sheetNota');
  var btnIndietro = sheet.querySelector('#sheetIndietro');
  var btnAvanti = sheet.querySelector('#sheetAvanti');

  function bottoneScelta(nome, meta, destra, dati) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'scelta'; b.setAttribute('aria-pressed', 'false');
    Object.keys(dati).forEach(function (k) { b.setAttribute('data-' + k, dati[k]); });
    b.innerHTML = '<span><span class="scelta-nome">' + nome + '</span>' + (meta ? '<span class="scelta-meta">' + meta + '</span>' : '') + '</span>' +
      (destra ? '<span class="scelta-prezzo">' + destra + '</span>' : '');
    return b;
  }
  function premi(contenitore, attivo) {
    Array.prototype.forEach.call(contenitore.querySelectorAll('.scelta'), function (b) {
      b.setAttribute('aria-pressed', b === attivo ? 'true' : 'false');
    });
  }

  /* passo 1: trattamenti */
  TRATTAMENTI.forEach(function (t) {
    var b = bottoneScelta(t.nome, t.meta, t.prezzo, { id: t.id });
    b.addEventListener('click', function () {
      scelta.tratt = t; premi(elTratt, b);
      traccia({ event: 'prenota_passo', passo: 1, trattamento: t.nome });
      vaiA(2);
    });
    elTratt.appendChild(b);
  });

  /* passo 2: giorno */
  var GIORNI = [{ id: 'oggi', nome: 'Oggi' }, { id: 'domani', nome: 'Domani' }, { id: 'altro', nome: 'Scelgo io la data' }];
  var MESI = ['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'];
  var SETT = ['domenica','lunedì','martedì','mercoledì','giovedì','venerdì','sabato'];
  function dataLeggibile(d) { return SETT[d.getDay()] + ' ' + d.getDate() + ' ' + MESI[d.getMonth()]; }
  function dataISO(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function dataDaISO(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }

  GIORNI.forEach(function (g) {
    var d = new Date();
    if (g.id === 'domani') d.setDate(d.getDate() + 1);
    var meta = g.id === 'altro' ? '' : dataLeggibile(d);
    var b = bottoneScelta(g.nome, meta, '', { id: g.id });
    if (g.id === 'oggi' && minutiOra() >= CHIUDE - 60) { b.disabled = true; b.querySelector('.scelta-meta').textContent = 'per oggi siamo al completo'; }
    b.addEventListener('click', function () {
      scelta.giorno = g.id;
      if (g.id === 'altro') {
        elDataCampo.hidden = false;
        var min = new Date(); elData.min = dataISO(min);
        if (!elData.value) { var dom = new Date(); dom.setDate(dom.getDate() + 2); elData.value = dataISO(dom); }
        scelta.data = dataDaISO(elData.value);
      } else {
        elDataCampo.hidden = true;
        scelta.data = d;
      }
      premi(elGiorni, b); aggiornaFasce(); aggiornaAvanti();
    });
    elGiorni.appendChild(b);
  });
  elData.addEventListener('change', function () {
    if (elData.value) { scelta.data = dataDaISO(elData.value); aggiornaFasce(); aggiornaAvanti(); }
  });

  /* passo 2: fasce */
  FASCE.forEach(function (f) {
    var b = bottoneScelta(f.nome, f.meta, '', { id: f.id });
    b.addEventListener('click', function () { scelta.fascia = f; premi(elFasce, b); aggiornaAvanti(); });
    elFasce.appendChild(b);
  });
  function aggiornaFasce() {
    var oggi = scelta.giorno === 'oggi';
    var m = minutiOra();
    Array.prototype.forEach.call(elFasce.querySelectorAll('.scelta'), function (b, i) {
      var passata = oggi && m >= FASCE[i].a - 45;
      b.disabled = passata;
      if (passata && scelta.fascia === FASCE[i]) { scelta.fascia = null; b.setAttribute('aria-pressed', 'false'); }
    });
  }
  function aggiornaAvanti() {
    if (passo === 2) btnAvanti.disabled = !(scelta.giorno && scelta.data && scelta.fascia);
  }

  /* passo 3: riepilogo e link */
  function testoQuando() {
    return dataLeggibile(scelta.data) + ', ' + scelta.fascia.nome.toLowerCase() + ' (' + scelta.fascia.meta + ')';
  }
  function compilaConferma() {
    var t = scelta.tratt;
    elRiepilogo.innerHTML =
      '<div><strong>' + t.nome + '</strong> · ' + t.prezzo + ' <a class="link cambia" href="#" data-vai="1">cambia</a></div>' +
      '<div>' + testoQuando() + ' <a class="link cambia" href="#" data-vai="2">cambia</a></div>';
    var msg = 'Ciao! Vorrei prenotare: ' + t.nome + ' (' + t.prezzo + ') per ' + testoQuando() + '. Avete disponibilità?';
    elWa.href = WA_BASE + encodeURIComponent(msg);
    if (t.treatwell) {
      elTreatwell.href = t.treatwell;
      elNota.textContent = 'Su Treatwell scegli l’orario e conferma: ricevi subito l’email di conferma.';
    } else {
      elTreatwell.href = TREATWELL_MENU;
      elNota.innerHTML = 'Su Treatwell cerca <strong>' + t.nome + '</strong>, scegli l’orario e conferma. Oppure scrivici su WhatsApp con la richiesta già compilata.';
    }
  }
  elRiepilogo.addEventListener('click', function (e) {
    var a = e.target.closest('[data-vai]');
    if (!a) return;
    e.preventDefault(); vaiA(+a.getAttribute('data-vai'));
  });
  elTreatwell.addEventListener('click', function () {
    traccia({ event: 'click_treatwell', trattamento: scelta.tratt ? scelta.tratt.nome : '' });
    traccia({ event: 'prenota_passo', passo: 3, canale: 'treatwell' });
  });
  elWa.addEventListener('click', function () { traccia({ event: 'prenota_passo', passo: 3, canale: 'whatsapp' }); });

  /* navigazione fra i passi */
  function vaiA(n) {
    passo = n;
    Array.prototype.forEach.call(sheet.querySelectorAll('.sheet-passo'), function (p) { p.hidden = +p.getAttribute('data-passo') !== n; });
    Array.prototype.forEach.call(sheet.querySelectorAll('.sheet-passi span'), function (s, i) { s.classList.toggle('fatto', i < n); });
    btnIndietro.hidden = n === 1;
    btnAvanti.hidden = n !== 2;
    sheet.querySelector('.sheet-corpo').scrollTop = 0;
    if (n === 2) aggiornaAvanti();
    if (n === 3) compilaConferma();
    var h3 = sheet.querySelector('.sheet-passo[data-passo="' + n + '"] h3');
    if (h3) { h3.setAttribute('tabindex', '-1'); h3.focus({ preventScroll: true }); }
  }
  btnIndietro.addEventListener('click', function () { vaiA(Math.max(1, passo - 1)); });
  btnAvanti.addEventListener('click', function () {
    if (passo === 2 && !btnAvanti.disabled) { traccia({ event: 'prenota_passo', passo: 2 }); vaiA(3); }
  });

  function apri(idTratt, origine) {
    apertoDa = origine || null;
    scrim.hidden = false; sheet.hidden = false;
    requestAnimationFrame(function () { requestAnimationFrame(function () { document.documentElement.classList.add('sheet-aperto'); }); });
    traccia({ event: 'prenota_apri', trattamento: idTratt || '' });
    var t = null;
    if (idTratt) TRATTAMENTI.some(function (x) { if (x.id === idTratt) { t = x; return true; } return false; });
    if (t) {
      scelta.tratt = t;
      premi(elTratt, elTratt.querySelector('[data-id="' + t.id + '"]'));
      vaiA(scelta.giorno && scelta.fascia ? 3 : 2);
    } else {
      vaiA(scelta.tratt ? (scelta.giorno && scelta.fascia ? 3 : 2) : 1);
    }
  }
  function chiudi() {
    document.documentElement.classList.remove('sheet-aperto');
    setTimeout(function () { scrim.hidden = true; sheet.hidden = true; }, 280);
    if (apertoDa && apertoDa.focus) apertoDa.focus();
  }
  scrim.addEventListener('click', chiudi);
  sheet.querySelector('.sheet-chiudi').addEventListener('click', chiudi);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !sheet.hidden) chiudi(); });

  /* ogni [data-prenota] apre il pannello; il valore (se c'è) è il
     trattamento da preselezionare. Senza JS gli stessi link portano
     a #prenota o direttamente a Treatwell. */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-prenota]');
    if (!el) return;
    e.preventDefault();
    var id = el.getAttribute('data-prenota') || document.body.getAttribute('data-tratt') || '';
    apri(id, el);
  });
})();
