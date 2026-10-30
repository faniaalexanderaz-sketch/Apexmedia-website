/* =============================================================
   ESSENZA D'ORIENTE — interazioni e tracciamento
   Zero librerie. Tutto il contenuto è visibile anche senza JS:
   questo file aggiunge solo lo sheet di prenotazione, lo stato
   di apertura in tempo reale, l'header compatto e il reveal.

   EVENTI GA4 (gtag diretto + dataLayer per GTM dopo il consenso):
   | prenota_apri    | apertura sheet (trattamento, origine)         |
   | prenota_passo   | passo raggiunto nello sheet (passo: 1,2,3)    |
   | click_treatwell | click su "Conferma su Treatwell"              |
   | click_whatsapp  | click su qualunque link wa.me                 |
   | click_chiama    | click su qualunque link tel:                  |
   ============================================================= */
(function () {
  'use strict';

  var TEL = '331 715 3533';
  var WA_BASE = 'https://wa.me/393317153533?text=';
  var APRE = 9 * 60 + 30, CHIUDE = 22 * 60 + 30;
  var ULTIMO_INGRESSO = CHIUDE - 30;   /* dopo le 22:00 "Oggi" non ha più senso */

  /* ---------- tracciamento ----------
     gtag è in Consent Mode: senza consenso invia solo ping anonimi.
     EO_COOKIE.push (cookie.js) accoda in dataLayer per GTM solo dopo
     l'accettazione. Le etichette Ads si compilano quando esistono
     le azioni di conversione: Google Ads → Obiettivi → Conversioni. */
  var AW_ID = 'AW-17997395114';
  var AW_ETICHETTE = { click_chiama: '', click_whatsapp: '', click_treatwell: '' };
  function traccia(nome, dati) {
    dati = dati || {};
    if (typeof window.gtag === 'function') window.gtag('event', nome, dati);
    if (window.EO_COOKIE) {
      var obj = { event: nome };
      for (var k in dati) obj[k] = dati[k];
      window.EO_COOKIE.push(obj);
    }
    var etichetta = AW_ETICHETTE[nome];
    if (etichetta && typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', { send_to: AW_ID + '/' + etichetta, value: 30.0, currency: 'EUR', transport_type: 'beacon' });
    }
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (href.indexOf('tel:') === 0) traccia('click_chiama');
    else if (href.indexOf('https://wa.me/') === 0) traccia('click_whatsapp');
  });

  /* ---------- orari ---------- */
  function adesso() { var d = new Date(); return d.getHours() * 60 + d.getMinutes(); }
  function testoStato() {
    var m = adesso();
    if (m >= APRE && m < CHIUDE) return { aperto: true, testo: 'Aperti oggi fino alle 22:30' };
    if (m < APRE) return { aperto: false, testo: 'Apriamo alle 9:30 · oggi fino alle 22:30' };
    return { aperto: false, testo: 'Oggi siamo chiusi · domani 9:30–22:30' };
  }
  function aggiornaStato(el) {
    if (!el) return;
    var s = testoStato();
    el.textContent = s.testo;
    el.classList.toggle('chiuso', !s.aperto);
  }
  var statoHero = document.getElementById('statoApertura');
  aggiornaStato(statoHero);
  setInterval(function () { aggiornaStato(statoHero); aggiornaStato(sheetStato); }, 60000);

  /* ---------- header compatto + barra mobile ---------- */
  var top = document.getElementById('top');
  var barra = document.getElementById('barraMobile');
  var heroCta = document.getElementById('heroCta');
  var ticking = false;
  function suScroll() {
    ticking = false;
    if (top) top.classList.toggle('is-compact', window.scrollY > 40);
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(suScroll); }
  }, { passive: true });
  suScroll();
  /* la barra fissa compare solo quando il "Prenota" della hero è uscito
     dallo schermo: un solo bottone primario per schermata */
  if (barra && heroCta && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (voci) {
      barra.classList.toggle('is-hidden', voci[0].isIntersecting);
    }, { threshold: 0 }).observe(heroCta);
  }

  /* ---------- reveal: una volta sola, 12px, 300 ms ---------- */
  var daRivelare = document.querySelectorAll('[data-reveal]');
  var menoMovimento = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('IntersectionObserver' in window) || menoMovimento) {
    daRivelare.forEach(function (el) { el.classList.add('in'); });
  } else {
    var oss = new IntersectionObserver(function (voci) {
      voci.forEach(function (v) { if (v.isIntersecting) { v.target.classList.add('in'); oss.unobserve(v.target); } });
    }, { threshold: 0.15 });
    daRivelare.forEach(function (el) { oss.observe(el); });
  }

  /* =============================================================
     SHEET DI PRENOTAZIONE — 3 passi
     1. trattamento  2. quando (giorno + fascia)  3. conferma
     ============================================================= */
  var sheet = document.getElementById('sheet');
  var scrim = document.getElementById('sheetScrim');
  if (!sheet || !scrim) return;

  var passi = sheet.querySelectorAll('.passo');
  var passiInd = document.getElementById('sheetPassi').children;
  var titolo = document.getElementById('sheetTitolo');
  var lista = document.getElementById('sheetLista');
  var scelta = document.getElementById('sheetScelta');
  var sheetStato = document.getElementById('sheetStato');
  var giorni = document.getElementById('sheetGiorni');
  var dataWrap = document.getElementById('sheetDataWrap');
  var dataInput = document.getElementById('sheetData');
  var fasce = document.getElementById('sheetFasce');
  var avanti = document.getElementById('sheetAvanti');
  var btnTw = document.getElementById('sheetTw');
  var btnWa = document.getElementById('sheetWa');
  var cerca = document.getElementById('sheetCerca');
  var cercaTesto = document.getElementById('sheetCercaTesto');
  var TITOLI = ['Scegli il trattamento', 'Quando vuoi venire?', 'Conferma la prenotazione'];
  var TW_MENU = 'https://widget.treatwell.it/salone/532986/menu/';

  var stato = { tratt: null, giorno: null, data: null, fascia: null, passo: 1 };
  var ultimoFocus = null;
  var ispirazione = document.querySelector('.pagina-tratt') ? document.body : null;

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function dataIso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function dataLeggibile(d) {
    return d.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'long' });
  }
  function dataScelta() {
    var d = new Date();
    if (stato.giorno === 'domani') d.setDate(d.getDate() + 1);
    if (stato.giorno === 'data' && stato.data) {
      var p = stato.data.split('-');
      d = new Date(+p[0], +p[1] - 1, +p[2]);
    }
    return d;
  }
  function etichettaGiorno() {
    if (stato.giorno === 'oggi') return 'Oggi, ' + dataLeggibile(new Date());
    if (stato.giorno === 'domani') return 'Domani, ' + dataLeggibile(dataScelta());
    return dataLeggibile(dataScelta());
  }
  function etichettaFascia() {
    var b = fasce.querySelector('[data-fascia="' + stato.fascia + '"]');
    return b ? b.firstChild.textContent + ' (' + b.querySelector('small').textContent + ')' : '';
  }

  function vai(n) {
    stato.passo = n;
    passi.forEach(function (p) { p.hidden = (+p.dataset.passo !== n); });
    for (var i = 0; i < passiInd.length; i++) {
      passiInd[i].className = (i + 1 === n) ? 'is-on' : (i + 1 < n ? 'is-done' : '');
    }
    titolo.textContent = TITOLI[n - 1];
    sheet.querySelector('.sheet-corpo').scrollTop = 0;
    if (n === 2) preparaPasso2();
    if (n === 3) preparaPasso3();
    traccia('prenota_passo', { passo: n, trattamento: stato.tratt ? stato.tratt.nome : '' });
    var primo = passi[n - 1].querySelector('button:not(:disabled), a, input');
    if (primo) primo.focus({ preventScroll: true });
  }

  function scegliTratt(btn) {
    stato.tratt = { id: btn.dataset.id, nome: btn.dataset.nome, durata: btn.dataset.durata, prezzo: btn.dataset.prezzo, tw: btn.dataset.tw };
    lista.querySelectorAll('.sheet-tratt').forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
  }

  function preparaPasso2() {
    var t = stato.tratt;
    scelta.innerHTML = '<strong>' + t.nome + '</strong> · ' + t.durata + ' · ' + t.prezzo;
    aggiornaStato(sheetStato);
    var m = adesso();
    var oggiBtn = giorni.querySelector('[data-giorno="oggi"]');
    oggiBtn.disabled = m >= ULTIMO_INGRESSO;
    if (!stato.giorno || (stato.giorno === 'oggi' && oggiBtn.disabled)) {
      stato.giorno = oggiBtn.disabled ? 'domani' : 'oggi';
    }
    if (dataInput && !dataInput.min) {
      dataInput.min = dataIso(new Date());
      var max = new Date(); max.setMonth(max.getMonth() + 3);
      dataInput.max = dataIso(max);
    }
    aggiornaGiorni();
  }

  function aggiornaGiorni() {
    giorni.querySelectorAll('.chip').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.giorno === stato.giorno)); });
    dataWrap.hidden = stato.giorno !== 'data';
    var m = adesso();
    fasce.querySelectorAll('.chip').forEach(function (b) {
      var passata = stato.giorno === 'oggi' && m >= (+b.dataset.fine - 30);
      b.disabled = passata;
      if (passata && stato.fascia === b.dataset.fascia) stato.fascia = null;
      b.setAttribute('aria-pressed', String(b.dataset.fascia === stato.fascia));
    });
    avanti.disabled = !(stato.fascia && (stato.giorno !== 'data' || stato.data));
  }

  function preparaPasso3() {
    var t = stato.tratt;
    document.getElementById('riepTratt').textContent = t.nome + ' · ' + t.durata;
    document.getElementById('riepPrezzo').textContent = t.prezzo;
    document.getElementById('riepGiorno').textContent = etichettaGiorno();
    document.getElementById('riepFascia').textContent = etichettaFascia();
    btnTw.href = t.tw || TW_MENU;
    var generico = !t.tw || t.tw === TW_MENU;
    cerca.hidden = !generico;
    cercaTesto.textContent = t.nome + ' · ' + t.durata;
    var msg = 'Ciao! Vorrei prenotare: ' + t.nome + ' (' + t.durata + ', ' + t.prezzo + '). ' +
      'Giorno: ' + etichettaGiorno().toLowerCase() + ', fascia: ' + etichettaFascia().toLowerCase() + '. Va bene?';
    btnWa.href = WA_BASE + encodeURIComponent(msg);
  }

  function apri(trattId, origine) {
    ultimoFocus = document.activeElement;
    var preselezionato = trattId && lista.querySelector('.sheet-tratt[data-id="' + trattId + '"]');
    sheet.hidden = false; scrim.hidden = false;
    document.body.classList.add('sheet-aperto');
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      sheet.classList.add('is-open'); scrim.classList.add('is-open');
    }); });
    traccia('prenota_apri', { trattamento: preselezionato ? preselezionato.dataset.nome : '', origine: origine || '' });
    if (preselezionato) { scegliTratt(preselezionato); vai(2); } else { vai(1); }
  }
  function chiudi() {
    sheet.classList.remove('is-open'); scrim.classList.remove('is-open');
    document.body.classList.remove('sheet-aperto');
    setTimeout(function () { sheet.hidden = true; scrim.hidden = true; }, menoMovimento ? 0 : 270);
    if (ultimoFocus && ultimoFocus.focus) ultimoFocus.focus({ preventScroll: true });
  }

  /* ogni "Prenota" del sito apre lo sheet (il link a Treatwell resta
     come fallback senza JS) */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-prenota]');
    if (!a) return;
    e.preventDefault();
    apri(a.dataset.tratt || (ispirazione ? ispirazione.dataset.tratt : null), a.dataset.origine);
  });
  document.getElementById('sheetChiudi').addEventListener('click', chiudi);
  scrim.addEventListener('click', chiudi);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !sheet.hidden) chiudi();
  });

  lista.addEventListener('click', function (e) {
    var b = e.target.closest('.sheet-tratt');
    if (!b) return;
    scegliTratt(b);
    stato.fascia = null;
    vai(2);
  });
  sheet.addEventListener('click', function (e) {
    var b = e.target.closest('[data-vai]');
    if (b) vai(+b.dataset.vai);
  });
  giorni.addEventListener('click', function (e) {
    var b = e.target.closest('.chip');
    if (!b || b.disabled) return;
    stato.giorno = b.dataset.giorno;
    aggiornaGiorni();
    if (stato.giorno === 'data') dataInput.focus();
  });
  dataInput.addEventListener('change', function () {
    stato.data = dataInput.value || null;
    aggiornaGiorni();
  });
  fasce.addEventListener('click', function (e) {
    var b = e.target.closest('.chip');
    if (!b || b.disabled) return;
    stato.fascia = b.dataset.fascia;
    aggiornaGiorni();
  });
  avanti.addEventListener('click', function () { if (!avanti.disabled) vai(3); });
  btnTw.addEventListener('click', function () {
    traccia('click_treatwell', { trattamento: stato.tratt ? stato.tratt.nome : '', giorno: stato.giorno || '', fascia: stato.fascia || '' });
  });
  /* il click su WhatsApp è già tracciato dal listener globale su wa.me */
})();
