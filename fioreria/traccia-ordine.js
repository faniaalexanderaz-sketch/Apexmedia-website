/* =============================================================
   ANTICA FIORERIA DEL CENTRO — traccia il tuo ordine
   Ricerca per numero ordine + email, con la cronologia di stato
   aggiornata a mano dalla titolare nel pannello admin.
   ============================================================= */
(function () {
  'use strict';

  var STATI_ORDINE = ['ricevuto', 'in_preparazione', 'spedito', 'consegnato'];

  var cardRicerca = document.getElementById('cardRicerca');
  var cardRisultato = document.getElementById('cardRisultato');
  var form = document.getElementById('formTraccia');
  var inputNumero = document.getElementById('trNumero');
  var inputEmail = document.getElementById('trEmail');
  var msg = document.getElementById('trMsg');
  var btn = document.getElementById('trBtn');

  function euro(centesimi) {
    return '€ ' + (centesimi / 100).toFixed(2).replace('.', ',');
  }

  function mostraErrore(testo) {
    msg.textContent = testo;
    msg.hidden = false;
  }

  function disegnaTimeline(stato) {
    var indiceCorrente = STATI_ORDINE.indexOf(stato);
    document.querySelectorAll('.traccia-step').forEach(function (li) {
      var indice = STATI_ORDINE.indexOf(li.getAttribute('data-stato'));
      li.classList.remove('fatto', 'attivo');
      if (indice < indiceCorrente) li.classList.add('fatto');
      else if (indice === indiceCorrente) li.classList.add('attivo');
    });
  }

  function disegnaRisultato(dati) {
    document.getElementById('trNumeroMostrato').textContent = '#' + dati.numeroOrdine;
    var data = new Date(dati.creatoIl).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
    document.getElementById('trData').textContent = 'Ordinato il ' + data;

    disegnaTimeline(dati.stato);

    var lista = document.getElementById('trLista');
    lista.innerHTML = '';
    dati.articoli.forEach(function (a) {
      var li = document.createElement('li');
      li.innerHTML = '<span class="ri-nome"></span><span class="ri-prezzo"></span>';
      li.querySelector('.ri-nome').textContent = a.nome;
      li.querySelector('.ri-prezzo').textContent = '× ' + a.qty;
      lista.appendChild(li);
    });
    document.getElementById('trTotale').textContent = euro(dati.totaleCentesimi);

    cardRicerca.hidden = true;
    cardRisultato.hidden = false;
    cardRisultato.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function cerca(numeroOrdine, email) {
    msg.hidden = true;
    btn.disabled = true;
    btn.textContent = 'Cerco…';

    fetch('/api/traccia-ordine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ numeroOrdine: numeroOrdine, email: email })
    }).then(function (res) {
      return res.json().then(function (d) { return { ok: res.ok, dati: d }; });
    }).then(function (r) {
      btn.disabled = false;
      btn.textContent = 'Cerca il mio ordine';
      if (!r.ok) {
        mostraErrore(r.dati.error || 'Ordine non trovato.');
        return;
      }
      disegnaRisultato(r.dati);
    }).catch(function () {
      btn.disabled = false;
      btn.textContent = 'Cerca il mio ordine';
      mostraErrore('Qualcosa è andato storto, riprova tra poco.');
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var numero = inputNumero.value.trim();
    var email = inputEmail.value.trim();
    if (!numero || !email) {
      mostraErrore('Inserisci numero ordine ed email.');
      return;
    }
    cerca(numero, email);
  });

  document.getElementById('trNuovaRicerca').addEventListener('click', function () {
    cardRisultato.hidden = true;
    cardRicerca.hidden = false;
    msg.hidden = true;
  });

  /* dal link nell'email di conferma: numero+email già pronti, si cerca subito */
  var parametri = new URLSearchParams(location.search);
  var numeroUrl = parametri.get('numero');
  var emailUrl = parametri.get('email');
  if (numeroUrl) inputNumero.value = numeroUrl;
  if (emailUrl) inputEmail.value = emailUrl;
  if (numeroUrl && emailUrl) cerca(numeroUrl, emailUrl);
})();
