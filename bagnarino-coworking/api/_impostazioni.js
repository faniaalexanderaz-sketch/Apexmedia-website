/* =============================================================
   BAGNARINO COWORKING — impostazioni correnti
   Base: config.js. Sopra: le modifiche fatte dalla titolare
   nell'area riservata (tabella impostazioni, chiave 'config').
   Il listino si fonde per id: si può cambiare un prezzo senza
   riscrivere tutta la formula.
   ============================================================= */
const BASE = require('../config.js');
const { q, disponibile } = require('./_db');

function copia(o) { return JSON.parse(JSON.stringify(o)); }

function fondi(base, extra) {
  if (!extra || typeof extra !== 'object') return base;
  Object.keys(extra).forEach(k => {
    const v = extra[k];
    if (k === 'listino' && Array.isArray(v)) {
      base.listino = base.listino.map(p => {
        const m = v.find(x => x && x.id === p.id);
        return m ? Object.assign({}, p, m) : p;
      });
    } else if (v && typeof v === 'object' && !Array.isArray(v) && base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) {
      base[k] = fondi(base[k], v);
    } else {
      base[k] = v;
    }
  });
  return base;
}

/* le modifiche salvate (oggetto parziale) */
async function modifiche() {
  if (!disponibile()) return {};
  try {
    const r = await q("SELECT valore FROM impostazioni WHERE chiave = 'config'");
    return r.length ? r[0].valore : {};
  } catch (e) { return {}; }
}

/* impostazioni complete: config.js + modifiche + chiusure dal database */
async function impostazioni() {
  const cfg = fondi(copia(BASE), await modifiche());
  cfg.chiusureTutte = (cfg.chiusure || []).slice();
  if (disponibile()) {
    try {
      const r = await q("SELECT to_char(data, 'YYYY-MM-DD') AS d FROM chiusure WHERE data >= CURRENT_DATE - 1");
      r.forEach(x => cfg.chiusureTutte.push(x.d));
    } catch (e) { /* tabella non pronta: solo config.js */ }
  }
  return cfg;
}

function pacchetto(cfg, id) { return cfg.listino.find(p => p.id === id) || null; }

module.exports = { impostazioni, modifiche, fondi, pacchetto, BASE };
