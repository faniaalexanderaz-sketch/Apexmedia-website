/* =============================================================
   ANTICA FIORERIA DEL CENTRO — assistente virtuale (widget)
   Parla SOLO con /api/assistente (funzione sul nostro server): non
   contiene, non ha mai visto e non deve mai contenere una chiave
   Anthropic. Il server è l'unico posto dove la chiave esiste.
   ============================================================= */
(function () {
  'use strict';

  var STORAGE_KEY = 'afc_assistente_storico';
  var storico = [];
  try {
    var salvato = sessionStorage.getItem(STORAGE_KEY);
    if (salvato) storico = JSON.parse(salvato);
  } catch (e) { /* storage non disponibile: si riparte da zero, pazienza */ }

  var bottone = document.createElement('button');
  bottone.type = 'button';
  bottone.className = 'assistente-float';
  bottone.setAttribute('aria-label', 'Apri l\'assistente virtuale');
  bottone.innerHTML =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M4 4h16v12H8l-4 4V4Z"/><path d="M8 9h8M8 12h5" /></svg>';

  var pannello = document.createElement('div');
  pannello.className = 'assistente-pannello';
  pannello.hidden = true;
  pannello.innerHTML =
    '<div class="assistente-testa">' +
      '<span>Assistente Antica Fioreria</span>' +
      '<button type="button" class="assistente-chiudi" aria-label="Chiudi">&times;</button>' +
    '</div>' +
    '<div class="assistente-corpo" id="assistenteCorpo"></div>' +
    '<form class="assistente-form" id="assistenteForm">' +
      '<input type="text" id="assistenteInput" placeholder="Chiedi su composizioni, spedizioni, resi..." maxlength="500" autocomplete="off" />' +
      '<button type="submit" aria-label="Invia">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h16M14 6l6 6-6 6"/></svg>' +
      '</button>' +
    '</form>';

  document.body.appendChild(bottone);
  document.body.appendChild(pannello);

  var corpo = pannello.querySelector('#assistenteCorpo');
  var form = pannello.querySelector('#assistenteForm');
  var input = pannello.querySelector('#assistenteInput');

  function aggiungiMessaggio(ruolo, testo) {
    var riga = document.createElement('div');
    riga.className = 'assistente-msg assistente-msg-' + ruolo;
    riga.textContent = testo;
    corpo.appendChild(riga);
    corpo.scrollTop = corpo.scrollHeight;
  }

  function salvaStorico() {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(storico.slice(-10))); }
    catch (e) { /* pazienza */ }
  }

  function messaggioBenvenuto() {
    if (corpo.children.length) return;
    aggiungiMessaggio('assistente', 'Ciao! Sono qui per rispondere a domande su composizioni, prezzi, spedizioni, resi o personalizzazioni. Cosa vuoi sapere?');
  }

  storico.forEach(function (m) { aggiungiMessaggio(m.ruolo, m.testo); });

  bottone.addEventListener('click', function () {
    pannello.hidden = !pannello.hidden;
    if (!pannello.hidden) {
      messaggioBenvenuto();
      input.focus();
    }
  });
  pannello.querySelector('.assistente-chiudi').addEventListener('click', function () {
    pannello.hidden = true;
  });

  var inCorso = false;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var testo = input.value.trim();
    if (!testo || inCorso) return;
    input.value = '';
    aggiungiMessaggio('utente', testo);
    storico.push({ ruolo: 'utente', testo: testo });
    salvaStorico();

    var attesa = document.createElement('div');
    attesa.className = 'assistente-msg assistente-msg-assistente assistente-attesa';
    attesa.textContent = '...';
    corpo.appendChild(attesa);
    corpo.scrollTop = corpo.scrollHeight;
    inCorso = true;

    fetch('/api/assistente', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ messaggio: testo, storico: storico.slice(-8) })
    })
      .then(function (r) { return r.json().then(function (dati) { return { ok: r.ok, dati: dati }; }); })
      .then(function (risultato) {
        attesa.remove();
        var testoRisposta = risultato.ok
          ? risultato.dati.risposta
          : (risultato.dati && risultato.dati.error) || 'Assistente momentaneamente non disponibile, riprova tra poco.';
        aggiungiMessaggio('assistente', testoRisposta);
        storico.push({ ruolo: 'assistente', testo: testoRisposta });
        salvaStorico();
      })
      .catch(function () {
        attesa.remove();
        aggiungiMessaggio('assistente', 'Problema di connessione, riprova tra poco o scrivici su WhatsApp.');
      })
      .then(function () { inCorso = false; });
  });
})();
