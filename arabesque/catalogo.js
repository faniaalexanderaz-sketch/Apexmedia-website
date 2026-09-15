/* =============================================================
   ARABESQUE BUSALLA — catalogo con filtri
   Legge la categoria dal body (data-categoria / data-linea) e i
   filtri dalla querystring, così ogni selezione resta nell'URL ed
   è condivisibile. Nessun ricaricamento di pagina.
   ============================================================= */
(function () {
  'use strict';
  var griglia = document.getElementById('griglia');
  if (!griglia) return;

  var base = {
    categoria: document.body.dataset.categoria || '',
    linea: document.body.dataset.linea || ''
  };

  /* una sciarpa non è un "capo": il contatore e il filtro restano
     accurati anche sulla pagina accessori, unica categoria non-abbigliamento */
  var UNITA = { accessori: ['pezzo', 'pezzi', 'Tutti gli accessori'] };
  var unita = UNITA[base.categoria] || ['capo', 'capi', 'Tutti i capi'];

  var stato = { taglia: '', sotto: '', ordina: 'consigliati', disponibili: true, filtro: '' };

  /* se torni indietro dalla scheda prodotto ritrovi i filtri come li avevi */
  try {
    var memoria = JSON.parse(sessionStorage.getItem(ARB.LS_FILTRI + ':' + location.pathname) || 'null');
    if (memoria && !location.search) stato = Object.assign(stato, memoria);
  } catch (e) {}

  var q = new URLSearchParams(location.search);
  ['taglia', 'sotto', 'ordina', 'filtro'].forEach(function (k) {
    if (q.get(k)) stato[k] = q.get(k);
  });
  if (q.get('disponibili') === '0') stato.disponibili = false;

  function insieme() {
    return ARB_PRODOTTI.filter(function (p) {
      if (base.categoria && p.categoria !== base.categoria) return false;
      if (base.linea && (p.linea || []).indexOf(base.linea) === -1) return false;
      return true;
    });
  }

  function applica() {
    var out = insieme().filter(function (p) {
      if (stato.filtro === 'novita' && (p.linea || []).indexOf('novita') === -1) return false;
      if (stato.filtro === 'saldi' && !p.sconto) return false;
      if (stato.filtro === 'cerimonia' && (p.linea || []).indexOf('cerimonia') === -1) return false;
      if (stato.sotto && p.sottocategoria !== stato.sotto) return false;
      if (stato.taglia && !(p.taglie || []).some(function (t) { return t.id === stato.taglia && t.stock > 0; })) return false;
      if (stato.disponibili && !arbDisponibile(p)) return false;
      return true;
    });

    if (stato.ordina === 'prezzo-su') out.sort(function (a, b) { return arbPrezzoFinale(a) - arbPrezzoFinale(b); });
    else if (stato.ordina === 'prezzo-giu') out.sort(function (a, b) { return arbPrezzoFinale(b) - arbPrezzoFinale(a); });
    else if (stato.ordina === 'sconto') out.sort(function (a, b) { return (b.sconto || 0) - (a.sconto || 0); });
    return out;
  }

  function url() {
    var p = new URLSearchParams();
    if (stato.taglia) p.set('taglia', stato.taglia);
    if (stato.sotto) p.set('sotto', stato.sotto);
    if (stato.filtro) p.set('filtro', stato.filtro);
    if (stato.ordina !== 'consigliati') p.set('ordina', stato.ordina);
    if (!stato.disponibili) p.set('disponibili', '0');
    var s = p.toString();
    history.replaceState(null, '', s ? '?' + s : location.pathname);
    try { sessionStorage.setItem(ARB.LS_FILTRI + ':' + location.pathname, JSON.stringify(stato)); } catch (e) {}
  }

  function renderFiltri() {
    var box = document.getElementById('filtri');
    if (!box) return;
    var tutti = insieme();

    var taglieDisponibili = ARB_SCALA.filter(function (t) {
      return tutti.some(function (p) {
        return (p.taglie || []).some(function (x) { return x.id === t && x.stock > 0; });
      });
    });
    var sottocat = [];
    tutti.forEach(function (p) { if (sottocat.indexOf(p.sottocategoria) === -1) sottocat.push(p.sottocategoria); });

    var corpoFiltri =
        '<div class="filtri-taglie" role="group" aria-label="Filtra per taglia">' +
          '<span class="filtri-eti">Taglia</span>' +
          '<button type="button" class="chip-f' + (stato.taglia ? '' : ' scelta') + '" data-taglia="">Tutte</button>' +
          taglieDisponibili.map(function (t) {
            return '<button type="button" class="chip-f' + (stato.taglia === t ? ' scelta' : '') + '" data-taglia="' + t + '">' + t + '</button>';
          }).join('') +
        '</div>' +
        '<div class="filtri-select">' +
          '<select id="fSotto" aria-label="Tipo di capo">' +
            '<option value="">' + unita[2] + '</option>' +
            sottocat.map(function (s) {
              return '<option value="' + s + '"' + (stato.sotto === s ? ' selected' : '') + '>' + s.charAt(0).toUpperCase() + s.slice(1) + '</option>';
            }).join('') +
          '</select>' +
          '<select id="fFiltro" aria-label="Selezione">' +
            '<option value="">Tutta la collezione</option>' +
            '<option value="novita"' + (stato.filtro === 'novita' ? ' selected' : '') + '>Novità</option>' +
            '<option value="saldi"' + (stato.filtro === 'saldi' ? ' selected' : '') + '>In saldo</option>' +
            '<option value="cerimonia"' + (stato.filtro === 'cerimonia' ? ' selected' : '') + '>Cerimonia</option>' +
          '</select>' +
          '<select id="fOrdina" aria-label="Ordina">' +
            '<option value="consigliati">Consigliati</option>' +
            '<option value="prezzo-su"' + (stato.ordina === 'prezzo-su' ? ' selected' : '') + '>Prezzo crescente</option>' +
            '<option value="prezzo-giu"' + (stato.ordina === 'prezzo-giu' ? ' selected' : '') + '>Prezzo decrescente</option>' +
            '<option value="sconto"' + (stato.ordina === 'sconto' ? ' selected' : '') + '>Sconto maggiore</option>' +
          '</select>' +
        '</div>';

    box.innerHTML = '<div class="wrap filtri-in">' +
      '<button type="button" class="btn btn-filo btn-piccolo btn-senza-icona filtri-apri" data-apri-filtri>Filtra e ordina</button>' +
      corpoFiltri + '</div>';
    var pannello = document.getElementById('filtriPannelloCorpo');
    if (pannello) pannello.innerHTML = corpoFiltri;
  }

  /* 6 — inserti editoriali: rompono la fila e portano un messaggio
     commerciale dove l'attenzione è già alta. Mai due nella stessa
     schermata: per questo la distanza minima è di sei capi. */
  var INSERTI = [
    { dopo: 6, html: '<div class="inserto scuro entra">' +
        '<p class="occhiello">La nostra differenza</p>' +
        '<p class="inserto-citazione">La 5XL costa quanto la M.</p>' +
        '<p>Taglie calibrate, non taglie ingrandite. Stesso prezzo, stessa cura.</p>' +
        '<a class="btn btn-primario btn-piccolo" href="curvy.html">Vedi la linea curvy</a></div>' },
    { dopo: 14, html: '<div class="inserto entra">' +
        '<p class="occhiello">Camerino a distanza</p>' +
        '<h3>Dubbio sulla taglia?</h3>' +
        '<p>Scrivici altezza, peso e la taglia che porti di solito: ti rispondiamo noi dal negozio.</p>' +
        '<a class="btn btn-oro btn-piccolo" data-cfg-wa href="#" target="_blank" rel="noopener">Chiedi su WhatsApp</a></div>' },
    { dopo: 22, html: '<div class="inserto entra">' +
        '<p class="occhiello">A Busalla</p>' +
        '<h3>Ordina online, ritiri qui</h3>' +
        '<p>Nessun costo di spedizione, pronto entro 24 ore. Provi e cambi taglia sul momento.</p>' +
        '<a class="btn btn-filo btn-piccolo" href="negozio.html">Il negozio</a></div>' }
  ];

  /* 8 — scheletri mentre la griglia si ricostruisce */
  function scheletri(n) {
    var uno = '<div class="capo scheletro-capo">' +
      '<div class="scheletro sk-foto"></div>' +
      '<div class="scheletro sk-riga corta"></div>' +
      '<div class="scheletro sk-riga"></div></div>';
    return new Array(n).fill(uno).join('');
  }

  var primoGiro = true;
  function render() {
    var out = applica();

    if (primoGiro) { griglia.innerHTML = scheletri(8); primoGiro = false; }

    var pezzi = [];
    out.forEach(function (p, i) {
      pezzi.push(ARB.cardProdotto(p));
      INSERTI.forEach(function (ins) { if (ins.dopo === i + 1) pezzi.push(ins.html); });
    });
    griglia.innerHTML = pezzi.join('');
    var conta = document.getElementById('conta');
    if (conta) conta.textContent = out.length + ' ' + (out.length === 1 ? unita[0] : unita[1]);
    var vuoto = document.getElementById('vuoto');
    if (vuoto) vuoto.hidden = out.length > 0;
    if (!out.length) griglia.innerHTML = '';
    ARB.riaggancia(griglia);
    ARB.config();
    ARB.evento('view_item_list', { item_list_name: document.title, items: out.slice(0, 12).map(function (x) { return { item_id: x.slug, item_name: x.nome, price: arbPrezzoFinale(x) }; }) });
    url();
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-azzera-filtri]')) {
      stato.taglia = ''; stato.sotto = ''; stato.filtro = ''; stato.disponibili = true;
      renderFiltri(); render();
      return;
    }
    var t = e.target.closest('.chip-f');
    if (!t) return;
    stato.taglia = t.dataset.taglia;
    ARB.evento('filter_applied', { filtro: 'taglia', valore: stato.taglia });
    renderFiltri();
    render();
  });
  document.addEventListener('change', function (e) {
    if (e.target.id === 'fSotto') stato.sotto = e.target.value;
    else if (e.target.id === 'fOrdina') stato.ordina = e.target.value;
    else if (e.target.id === 'fFiltro') stato.filtro = e.target.value;
    else return;
    ARB.evento('filter_applied', { filtro: e.target.id, valore: e.target.value });
    render();
  });

  renderFiltri();
  render();
})();
