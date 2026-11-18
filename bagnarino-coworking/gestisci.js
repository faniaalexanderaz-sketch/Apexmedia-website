/* =============================================================
   BAGNARINO COWORKING — "La mia prenotazione"
   Codice + email → stato della richiesta o della prenotazione.
   Una richiesta in attesa si può ritirare quando si vuole; una
   prenotazione confermata si annulla gratis fino alle 20:00 del
   giorno prima (regola del server).
   ============================================================= */
(function () {
  'use strict';
  var B = window.BGN;
  if (!B) return;
  var C = B.cfg, $ = B.$;
  var form = $('[data-cerca]'), scheda = $('[data-scheda]'), errore = $('[data-errore]');
  var STATI = { in_attesa: 'In attesa di conferma', confermata: 'Confermata', annullata: 'Annullata', presente: 'Usata', assente: 'Non presentato' };
  var corrente = null;

  function mostraErrore(t) { errore.textContent = t; errore.classList.add('visibile'); }
  function dataLunga(s) { return B.data(B.daIso(s), 'lungo'); }

  function disegna(p) {
    corrente = p;
    try { localStorage.setItem('bgn-ultima', JSON.stringify({ codice: p.codice, email: form.email.value.trim() })); } catch (x) {}
    scheda.hidden = false;
    var attesa = p.stato === 'in_attesa', nonDisponibile = p.stato === 'annullata' && p.motivo === 'non_disponibile';
    $('[data-s-stato]').textContent = nonDisponibile ? 'Non disponibile' : (STATI[p.stato] || p.stato);
    $('[data-s-titolo]').textContent = nonDisponibile ? 'In quella fascia lo spazio non è disponibile.'
      : p.stato === 'annullata' ? 'Questa prenotazione è annullata.'
      : attesa ? 'Ciao ' + p.nome + ', abbiamo ricevuto la tua richiesta.'
      : 'Ciao ' + p.nome + ', ecco la tua prenotazione.';
    var notaAttesa = $('[data-s-attesa]');
    notaAttesa.hidden = !(attesa || nonDisponibile);
    notaAttesa.innerHTML = attesa ? 'Ti confermiamo la disponibilità a breve via email. Il posto sarà tuo appena ricevi la conferma.'
      : nonDisponibile ? 'Scegli un altro momento, ti confermiamo subito: <a href="/prenota?pacchetto=' + encodeURIComponent(p.pacchetto) + '#giorno">apri il calendario</a>.' : '';
    $('[data-s-codice]').textContent = p.codice;
    $('[data-s-formula]').textContent = p.nomePacchetto;
    var mese = /^mese/.test(p.pacchetto);
    $('[data-s-etichetta]').textContent = mese ? 'Periodo' : p.pacchetto === 'carnet' ? 'Primo ingresso' : 'Giorno';
    $('[data-s-giorno]').textContent = mese ? B.data(B.daIso(p.data_inizio), 'breve') + ' → ' + B.data(B.daIso(p.data_fine), 'breve') : dataLunga(p.data_inizio);
    $('[data-s-fascia-riga]').hidden = p.pacchetto !== 'giornata';
    $('[data-s-fascia]').textContent = p.nomeFascia || '';
    $('[data-s-prezzo]').textContent = p.prezzo === 0 ? 'Niente: già pagato' : p.pagato ? p.prezzoTesto + ' (pagato)' : p.prezzoTesto;
    $('[data-zona-annulla]').hidden = !p.annullabile;
    var parti = p.scadenzaDisdetta.split(' ');
    $('[data-s-scadenza]').textContent = attesa ? 'Hai cambiato programma? Puoi ritirare la richiesta in qualsiasi momento.'
      : 'Puoi annullare gratis fino alle ' + parti[1] + ' di ' + dataLunga(parti[0]) + '.';
    $('[data-annulla-testo]').textContent = attesa ? 'Ritira la richiesta' : 'Annulla la prenotazione';
    var tardi = $('[data-s-tardi]');
    tardi.hidden = !(p.stato === 'confermata' && !p.annullabile);
    tardi.textContent = 'Il termine per annullare online è passato. Se hai un imprevisto scrivici su WhatsApp: troviamo una soluzione.';
    $('[data-s-wa]').href = B.linkWa('domanda', { codice: p.codice });
    $('[data-s-wa]').target = '_blank';
  }

  function cerca(codice, email) {
    errore.classList.remove('visibile');
    return B.chiamaApi(C.api.prenotazione + '?codice=' + encodeURIComponent(codice) + '&email=' + encodeURIComponent(email))
      .then(disegna)
      .catch(function (e) {
        scheda.hidden = true;
        if (e.message === 'api-assente' || e.stato === 501) mostraErrore('La gestione online delle prenotazioni non è ancora attiva: scrivici su WhatsApp.');
        else mostraErrore((e.dati && e.dati.messaggio) || 'Prenotazione non trovata: controlla codice ed email.');
      });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var codice = form.codice.value.trim().toUpperCase(), email = form.email.value.trim();
    if (!/^BGN-[A-Z0-9]{4}$/.test(codice)) { mostraErrore('Il codice ha questa forma: BGN-4K7Q.'); form.codice.focus(); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { mostraErrore('Controlla l’email.'); form.email.focus(); return; }
    cerca(codice, email);
  });

  $('[data-annulla]').addEventListener('click', function () { $('[data-conferma]').hidden = false; $('[data-annulla]').hidden = true; });
  $('[data-conferma-no]').addEventListener('click', function () { $('[data-conferma]').hidden = true; $('[data-annulla]').hidden = false; });
  $('[data-conferma-si]').addEventListener('click', function () {
    var b = this;
    b.disabled = true; b.textContent = 'Annullo…';
    B.chiamaApi(C.api.annulla, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codice: corrente.codice, email: form.email.value.trim() }) })
      .then(function () {
        $('[data-conferma]').hidden = true; $('[data-annulla]').hidden = false;
        B.traccia('annullamento', { item_id: corrente.pacchetto });
        return cerca(corrente.codice, form.email.value.trim());
      })
      .catch(function (e) { mostraErrore((e.dati && e.dati.messaggio) || 'Non è stato possibile annullare. Scrivici su WhatsApp.'); })
      .then(function () { b.disabled = false; b.textContent = 'Sì, annulla'; });
  });

  /* arrivo dal link nell'email (codice ed email nell'indirizzo) oppure
     prenotazione già fatta da questo telefono: la mostriamo subito */
  var q = new URLSearchParams(location.search), salvata = null;
  try { salvata = JSON.parse(localStorage.getItem('bgn-ultima') || 'null'); } catch (x) {}
  var codiceIniziale = q.get('codice') || (salvata && salvata.codice);
  var emailIniziale = q.get('email') || (salvata && salvata.email);
  /* togli email e codice dall'indirizzo prima che lo leggano le statistiche */
  if (q.get('codice') || q.get('email')) { try { history.replaceState(null, '', location.pathname); } catch (x) {} }
  if (codiceIniziale) form.codice.value = codiceIniziale;
  if (emailIniziale) form.email.value = emailIniziale;
  if (codiceIniziale && emailIniziale) cerca(String(codiceIniziale).toUpperCase(), emailIniziale);
})();
