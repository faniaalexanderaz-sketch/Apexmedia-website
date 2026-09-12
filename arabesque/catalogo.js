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

  var stato = { taglia: '', sotto: '', ordina: 'consigliati', disponibili: true, filtro: '' };

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

    box.innerHTML =
      '<div class="wrap filtri-in">' +
        '<div class="filtri-taglie" role="group" aria-label="Filtra per taglia">' +
          '<span class="filtri-eti">Taglia</span>' +
          '<button type="button" class="chip-t' + (stato.taglia ? '' : ' scelta') + '" data-taglia="">Tutte</button>' +
          taglieDisponibili.map(function (t) {
            return '<button type="button" class="chip-t' + (stato.taglia === t ? ' scelta' : '') + '" data-taglia="' + t + '">' + t + '</button>';
          }).join('') +
        '</div>' +
        '<div class="filtri-select">' +
          '<select id="fSotto" aria-label="Tipo di capo">' +
            '<option value="">Tutti i capi</option>' +
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
        '</div>' +
      '</div>';
  }

  function render() {
    var out = applica();
    griglia.innerHTML = out.map(function (p) { return ARB.cardProdotto(p); }).join('');
    var conta = document.getElementById('conta');
    if (conta) conta.textContent = out.length + (out.length === 1 ? ' capo' : ' capi');
    var vuoto = document.getElementById('vuoto');
    if (vuoto) vuoto.hidden = out.length > 0;
    ARB.reveal(griglia);
    url();
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('.chip-t');
    if (!t) return;
    stato.taglia = t.dataset.taglia;
    renderFiltri();
    render();
  });
  document.addEventListener('change', function (e) {
    if (e.target.id === 'fSotto') stato.sotto = e.target.value;
    else if (e.target.id === 'fOrdina') stato.ordina = e.target.value;
    else if (e.target.id === 'fFiltro') stato.filtro = e.target.value;
    else return;
    render();
  });

  renderFiltri();
  render();
})();
