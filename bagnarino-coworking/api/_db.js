/* =============================================================
   BAGNARINO COWORKING — accesso al database (Neon / Postgres)
   - Le tabelle si creano da sole al primo utilizzo.
   - Senza DATABASE_URL ogni chiamata lancia un errore con
     codice 'DB_ASSENTE': le API rispondono 501 e il sito torna
     da solo in modalità dimostrativa.
   - I test usano un Postgres in memoria (PGlite) tramite
     impostaAdattatore(): stesso SQL, nessun database esterno.
   ============================================================= */
let adattatore = null;

function assente() {
  const e = new Error('Database non ancora configurato');
  e.codice = 'DB_ASSENTE';
  return e;
}

/* Neon: query semplici via HTTP, transazioni via WebSocket (Pool) */
function adattatoreNeon() {
  const { neon, Pool, neonConfig } = require('@neondatabase/serverless');
  if (typeof WebSocket !== 'undefined') neonConfig.webSocketConstructor = WebSocket;
  const http = neon(process.env.DATABASE_URL);
  return {
    query: (testo, valori) => http.query(testo, valori || []),
    transazione: async (lavoro) => {
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const esito = await lavoro((t, v) => client.query(t, v || []).then(r => r.rows));
        await client.query('COMMIT');
        return esito;
      } catch (err) {
        try { await client.query('ROLLBACK'); } catch (e) { /* già chiusa */ }
        throw err;
      } finally {
        client.release();
        await pool.end();
      }
    }
  };
}

function db() {
  if (adattatore) return adattatore;
  if (!process.env.DATABASE_URL) throw assente();
  adattatore = adattatoreNeon();
  return adattatore;
}
function impostaAdattatore(a) { adattatore = a; schemaPronto = null; }
function disponibile() { return !!(adattatore || process.env.DATABASE_URL); }

async function q(testo, valori) { await assicuraSchema(); return db().query(testo, valori); }
async function transazione(lavoro) { await assicuraSchema(); return db().transazione(lavoro); }

/* ---------- schema ---------- */
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS postazioni (
     id SERIAL PRIMARY KEY,
     nome TEXT NOT NULL,
     tipo TEXT NOT NULL DEFAULT 'flessibile' CHECK (tipo IN ('flessibile','fissa')),
     attiva BOOLEAN NOT NULL DEFAULT true
   )`,
  `CREATE TABLE IF NOT EXISTS clienti (
     id SERIAL PRIMARY KEY,
     nome TEXT NOT NULL,
     cognome TEXT NOT NULL,
     email TEXT NOT NULL UNIQUE,
     telefono TEXT NOT NULL,
     piva_cf TEXT,
     consenso_marketing BOOLEAN NOT NULL DEFAULT false,
     creato_il TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE TABLE IF NOT EXISTS carnet (
     id SERIAL PRIMARY KEY,
     cliente_id INTEGER NOT NULL REFERENCES clienti(id),
     ingressi_totali INTEGER NOT NULL DEFAULT 10,
     ingressi_usati INTEGER NOT NULL DEFAULT 0,
     scadenza DATE,
     creato_il TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE TABLE IF NOT EXISTS prenotazioni (
     id SERIAL PRIMARY KEY,
     codice TEXT NOT NULL UNIQUE,
     cliente_id INTEGER NOT NULL REFERENCES clienti(id),
     pacchetto TEXT NOT NULL CHECK (pacchetto IN ('giornata','carnet','mese_flessibile','mese_fisso','sala')),
     data_inizio DATE NOT NULL,
     data_fine DATE NOT NULL,
     postazione_id INTEGER REFERENCES postazioni(id),
     prezzo_centesimi INTEGER NOT NULL DEFAULT 0,
     stato TEXT NOT NULL DEFAULT 'confermata' CHECK (stato IN ('confermata','annullata','presente','assente')),
     pagato BOOLEAN NOT NULL DEFAULT false,
     metodo_pagamento TEXT,
     note TEXT,
     origine JSONB,
     carnet_id INTEGER REFERENCES carnet(id),
     omaggio BOOLEAN NOT NULL DEFAULT false,
     promemoria_inviato BOOLEAN NOT NULL DEFAULT false,
     creato_il TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS prenotazioni_date_idx ON prenotazioni (data_inizio, data_fine)`,
  `CREATE INDEX IF NOT EXISTS prenotazioni_cliente_idx ON prenotazioni (cliente_id)`,
  /* una riga per postazione per giorno: il vincolo di unicità rende
     impossibile assegnare due volte lo stesso posto lo stesso giorno */
  `CREATE TABLE IF NOT EXISTS occupazioni (
     postazione_id INTEGER NOT NULL REFERENCES postazioni(id),
     data DATE NOT NULL,
     prenotazione_id INTEGER NOT NULL REFERENCES prenotazioni(id) ON DELETE CASCADE,
     PRIMARY KEY (postazione_id, data)
   )`,
  `CREATE INDEX IF NOT EXISTS occupazioni_data_idx ON occupazioni (data)`,
  `CREATE TABLE IF NOT EXISTS fidelity (
     cliente_id INTEGER PRIMARY KEY REFERENCES clienti(id),
     timbri INTEGER NOT NULL DEFAULT 0,
     omaggi_disponibili INTEGER NOT NULL DEFAULT 0,
     omaggi_usati INTEGER NOT NULL DEFAULT 0
   )`,
  `CREATE TABLE IF NOT EXISTS chiusure (
     data DATE PRIMARY KEY,
     motivo TEXT
   )`,
  `CREATE TABLE IF NOT EXISTS eventi (
     id SERIAL PRIMARY KEY,
     tipo TEXT NOT NULL,
     dati JSONB,
     creato_il TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS eventi_tipo_idx ON eventi (tipo, creato_il)`,
  /* limite anti-spam: solo un'impronta dell'IP, mai l'indirizzo */
  `CREATE TABLE IF NOT EXISTS tentativi (
     impronta TEXT NOT NULL,
     creato_il TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS tentativi_idx ON tentativi (impronta, creato_il)`,
  /* area riservata: data dell'incasso e prenotazioni inserite a mano */
  `ALTER TABLE prenotazioni ADD COLUMN IF NOT EXISTS pagato_il TIMESTAMPTZ`,
  `ALTER TABLE prenotazioni ADD COLUMN IF NOT EXISTS manuale BOOLEAN NOT NULL DEFAULT false`,
  /* impostazioni modificabili dall'area riservata (fase 3) */
  `CREATE TABLE IF NOT EXISTS impostazioni (
     chiave TEXT PRIMARY KEY,
     valore JSONB NOT NULL,
     aggiornato_il TIMESTAMPTZ NOT NULL DEFAULT now()
   )`
];

let schemaPronto = null;
function assicuraSchema() {
  if (schemaPronto) return schemaPronto;
  const a = db();
  schemaPronto = (async () => {
    for (const s of SCHEMA) await a.query(s);
    /* prime postazioni dal file di configurazione */
    const n = await a.query('SELECT COUNT(*)::int AS n FROM postazioni');
    if (n[0].n === 0) {
      const cfg = require('../config.js');
      for (let i = 1; i <= cfg.postazioni; i++) await a.query('INSERT INTO postazioni (nome) VALUES ($1)', ['Postazione ' + i]);
    }
  })().catch(err => { schemaPronto = null; throw err; });
  return schemaPronto;
}

/* codice leggibile al telefono: BGN-4K7Q (niente 0/O, 1/I) */
function nuovoCodice() {
  const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let c = '';
  for (let i = 0; i < 4; i++) c += a[Math.floor(Math.random() * a.length)];
  return 'BGN-' + c;
}

module.exports = { q, transazione, assicuraSchema, impostaAdattatore, disponibile, nuovoCodice };
