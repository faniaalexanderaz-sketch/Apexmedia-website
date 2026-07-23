/* =============================================================
   ANTICA FIORERIA DEL CENTRO — pannello interno
   Accesso con password unica, poi tre schede: visite, scorte
   (modificabili a mano), ordini registrati dal webhook Stripe.
   ============================================================= */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var toastTimer = null;
  function toast(msg) {
    var t = $('toast');
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 2600);
  }

  function euro(centesimi) {
    return '€ ' + (centesimi / 100).toFixed(2).replace('.', ',');
  }

  function nomeProdotto(slug) {
    var p = typeof afcProdotto === 'function' ? afcProdotto(slug) : null;
    return p ? p.nome : slug;
  }

  /* ---------- schede ---------- */
  document.querySelectorAll('.dash-tab[data-pannello]').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.dash-tab').forEach(function (t) { t.classList.remove('attivo'); });
      tab.classList.add('attivo');
      document.querySelectorAll('.pannello').forEach(function (p) { p.hidden = true; });
      $(tab.dataset.pannello).hidden = false;
    });
  });

  /* ---------- accesso ---------- */
  var formAccesso = $('formAccesso');
  var accessoMsg = $('accessoMsg');

  formAccesso.addEventListener('submit', function (e) {
    e.preventDefault();
    accessoMsg.hidden = true;
    var pass = $('adminPass').value;
    fetch('/api/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pass })
    }).then(function (res) {
      if (!res.ok) return res.json().then(function (d) { throw new Error(d.error || 'Accesso negato'); });
      return res.json();
    }).then(function () {
      $('vistaAccesso').hidden = true;
      $('vistaPannello').hidden = false;
      caricaDati();
    }).catch(function (err) {
      accessoMsg.textContent = err.message;
      accessoMsg.hidden = false;
    });
  });

  /* ---------- dati ---------- */
  function caricaDati() {
    fetch('/api/admin-data').then(function (res) {
      if (!res.ok) throw new Error('Sessione scaduta, rientra con la password');
      return res.json();
    }).then(function (d) {
      disegnaVisite(d.visite);
      disegnaScorte(d.scorte);
      disegnaOrdini(d.ordini);
    }).catch(function (err) {
      $('vistaPannello').hidden = true;
      $('vistaAccesso').hidden = false;
      accessoMsg.textContent = err.message;
      accessoMsg.hidden = false;
    });
  }

  function disegnaVisite(v) {
    $('visiteOggi').textContent = v.oggi;
    $('visiteSettimana').textContent = v.settimana;
    $('visiteTotali').textContent = v.totali;
  }

  function disegnaScorte(righe) {
    var corpo = document.querySelector('#tabellaScorte tbody');
    corpo.innerHTML = '';
    righe.forEach(function (r) {
      var tr = document.createElement('tr');
      var input = document.createElement('input');
      input.type = 'number'; input.min = '0'; input.max = '9999';
      input.value = r.quantita; input.className = 'admin-input-scorta';

      var btn = document.createElement('button');
      btn.className = 'btn btn-ghost btn-sm'; btn.type = 'button'; btn.textContent = 'Salva';
      btn.addEventListener('click', function () {
        fetch('/api/admin-scorte', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: r.slug, quantita: parseInt(input.value, 10) })
        }).then(function (res) {
          if (!res.ok) throw new Error();
          toast('Scorta di «' + nomeProdotto(r.slug) + '» aggiornata');
        }).catch(function () { toast('Non sono riuscita a salvare, riprova'); });
      });

      var tdNome = document.createElement('td'); tdNome.textContent = nomeProdotto(r.slug);
      var tdInput = document.createElement('td'); tdInput.appendChild(input);
      var tdBtn = document.createElement('td'); tdBtn.appendChild(btn);
      tr.appendChild(tdNome); tr.appendChild(tdInput); tr.appendChild(tdBtn);
      corpo.appendChild(tr);
    });
  }

  function disegnaOrdini(ordini) {
    var lista = $('listaOrdiniAdmin');
    lista.innerHTML = '';
    $('ordiniAdminVuoto').hidden = ordini.length > 0;
    ordini.forEach(function (o) {
      var articoli = Array.isArray(o.articoli) ? o.articoli : [];
      var righeArticoli = articoli.map(function (a) {
        return nomeProdotto(a[0]) + ' ×' + a[1];
      }).join(', ');

      var li = document.createElement('li');
      li.className = 'admin-ordine';
      var data = new Date(o.creato_il).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      li.innerHTML =
        '<div class="admin-ordine-riga1"><strong>' + euro(o.totale_centesimi) + '</strong><span>' + data + '</span></div>' +
        '<p class="admin-ordine-articoli"></p>' +
        '<p class="admin-ordine-consegna"></p>';
      li.querySelector('.admin-ordine-articoli').textContent = righeArticoli || '—';
      var consegna = [o.nome_ricevente, o.via, o.cap, o.citta, o.telefono].filter(Boolean).join(' · ');
      li.querySelector('.admin-ordine-consegna').textContent = (o.email ? o.email + ' — ' : '') + consegna;
      lista.appendChild(li);
    });
  }

  /* se la sessione è già valida (cookie ancora attivo), entra subito */
  fetch('/api/admin-data').then(function (res) {
    if (res.ok) {
      $('vistaAccesso').hidden = true;
      $('vistaPannello').hidden = false;
      return res.json().then(function (d) {
        disegnaVisite(d.visite);
        disegnaScorte(d.scorte);
        disegnaOrdini(d.ordini);
      });
    }
  }).catch(function () {});
})();
