/* =============================================================
   BAGNARINO COWORKING — "La mia Bagnarino Card"
   Email + codice di una prenotazione → timbri, omaggi, carnet.
   ============================================================= */
(function () {
  'use strict';
  var B = window.BGN;
  if (!B) return;
  var C = B.cfg, $ = B.$;
  var form = $('[data-cerca]'), scheda = $('[data-scheda]'), errore = $('[data-errore]');

  function mostraErrore(t) { errore.textContent = t; errore.classList.add('visibile'); }

  function disegna(c) {
    scheda.hidden = false;
    var tot = c.timbriPerOmaggio || 10, html = '';
    var premi = (C.fidelity && C.fidelity.premi) || [];
    var soglie = premi.map(function (z) { return z.timbri; });
    for (var i = 0; i < tot; i++) html += '<li class="timbro' + (i < c.timbri ? ' pieno' : '') + (soglie.indexOf(i + 1) !== -1 ? ' premio' : '') + '" aria-hidden="true"></li>';
    $('[data-timbri]').innerHTML = html;
    $('[data-c-nome]').textContent = 'Card di ' + c.nome;
    $('[data-c-conta]').textContent = c.timbri + (c.timbri === 1 ? ' timbro' : ' timbri') + ' su ' + tot;
    $('[data-c-premio]').textContent = (tot + 1) + 'ª giornata in regalo';
    var mancano = tot - c.timbri;
    $('[data-c-omaggi]').innerHTML = c.omaggi > 0
      ? '<strong>Hai ' + (c.omaggi === 1 ? 'una giornata' : c.omaggi + ' giornate') + ' in regalo!</strong> Quando prenoti con la tua email e il tuo cellulare te la proponiamo noi.'
      : prossimo();
    function prossimo() {
      var z = premi.filter(function (p) { return p.timbri > c.timbri; })[0];
      if (!z) return 'Ti ' + (mancano === 1 ? 'manca 1 giornata' : 'mancano ' + mancano + ' giornate') + ' per la prossima in regalo.';
      var m = z.timbri - c.timbri;
      return 'Ti ' + (m === 1 ? 'manca 1 giornata' : 'mancano ' + m + ' giornate') + ' per il prossimo premio: <strong>' + z.titolo + '</strong>.';
    }
    var scala = $('[data-premi-card]');
    if (scala && B.premiScala) scala.innerHTML = B.premiScala(c.timbri);
    var k = $('[data-c-carnet]');
    k.hidden = !c.carnet;
    if (c.carnet) k.textContent = 'Carnet attivo: ' + c.carnet.residui + ' ingressi da usare entro il ' +
      B.daIso(c.carnet.scadenza).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }) + '.';
    scheda.setAttribute('aria-label', $('[data-c-conta]').textContent);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    errore.classList.remove('visibile');
    var codice = form.codice.value.trim().toUpperCase(), email = form.email.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { mostraErrore('Controlla l’email.'); form.email.focus(); return; }
    if (!/^BGN-[A-Z0-9]{4}$/.test(codice)) { mostraErrore('Il codice ha questa forma: BGN-4K7Q.'); form.codice.focus(); return; }
    B.chiamaApi(C.api.card, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email, codice: codice }) })
      .then(disegna)
      .catch(function (err) {
        scheda.hidden = true;
        if (err.message === 'api-assente' || err.stato === 501) mostraErrore('La card digitale si attiva con le prenotazioni online: per ora i timbri li segniamo noi in sede.');
        else mostraErrore((err.dati && err.dati.messaggio) || 'Non troviamo la tua card: controlla email e codice.');
      });
  });
  var q = new URLSearchParams(location.search), salvata = null;
  try { salvata = JSON.parse(localStorage.getItem('bgn-ultima') || 'null'); } catch (x) {}
  var email0 = q.get('email') || (salvata && salvata.email), codice0 = q.get('codice') || (salvata && salvata.codice);
  if (q.get('codice') || q.get('email')) { try { history.replaceState(null, '', location.pathname); } catch (x) {} }
  if (email0) form.email.value = email0;
  if (codice0) form.codice.value = codice0;
  /* cliente già riconosciuto su questo telefono: apri subito la card */
  if (email0 && codice0 && form.requestSubmit) form.requestSubmit();
})();
