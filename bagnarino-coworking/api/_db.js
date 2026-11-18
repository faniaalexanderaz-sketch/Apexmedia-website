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
     stato TEXT NOT NULL DEFAULT 'confermata' CHECK (stato IN ('in_attesa','confermata','annullata','presente','assente')),
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
  /* una riga per postazione, giorno e mezza giornata ('mattina' o
     'pomeriggio'; la giornata intera ne occupa due): il vincolo di
     unicità rende impossibile assegnare due volte lo stesso posto.
     Il valore predefinito serve solo al codice precedente, in caso
     di ritorno a una versione vecchia del sito. */
  `CREATE TABLE IF NOT EXISTS occupazioni (
     postazione_id INTEGER NOT NULL REFERENCES postazioni(id),
     data DATE NOT NULL,
     prenotazione_id INTEGER NOT NULL REFERENCES prenotazioni(id) ON DELETE CASCADE,
     fascia TEXT NOT NULL DEFAULT 'mattina',
     PRIMARY KEY (postazione_id, data, fascia)
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
  /* richieste dal sito che la titolare deve ancora accettare (le vecchie restano accettate) */
  `ALTER TABLE prenotazioni ADD COLUMN IF NOT EXISTS accettata BOOLEAN NOT NULL DEFAULT true`,
  /* email per far tornare i clienti: ognuna parte una volta sola */
  `ALTER TABLE prenotazioni ADD COLUMN IF NOT EXISTS grazie_inviato BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE prenotazioni ADD COLUMN IF NOT EXISTS avviso_rinnovo BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE carnet ADD COLUMN IF NOT EXISTS avviso_scadenza BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE clienti ADD COLUMN IF NOT EXISTS ultimo_richiamo DATE`,
  /* impostazioni modificabili dall'area riservata (fase 3) */
  `CREATE TABLE IF NOT EXISTS impostazioni (
     chiave TEXT PRIMARY KEY,
     valore JSONB NOT NULL,
     aggiornato_il TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  /* scheda Crescita: numeri di social, Google e pubblicità, uno per
     mese, inseriti a mano da Apex Media (nessuna chiave di accesso
     ai servizi esterni). mese = primo giorno del mese. */
  `CREATE TABLE IF NOT EXISTS marketing_mesi (
     mese DATE PRIMARY KEY,
     dati JSONB NOT NULL DEFAULT '{}'::jsonb,
     note TEXT,
     aggiornato_il TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  /* --- prenotazione su richiesta: fascia, risposta della titolare, promemoria --- */
  `ALTER TABLE prenotazioni ADD COLUMN IF NOT EXISTS fascia TEXT NOT NULL DEFAULT 'giornata'`,
  /* 'cliente' | 'titolare' | 'non_disponibile' */
  `ALTER TABLE prenotazioni ADD COLUMN IF NOT EXISTS motivo_annullamento TEXT`,
  `ALTER TABLE prenotazioni ADD COLUMN IF NOT EXISTS risposta_il TIMESTAMPTZ`,
  `ALTER TABLE prenotazioni ADD COLUMN IF NOT EXISTS sollecito_inviato BOOLEAN NOT NULL DEFAULT false`,
  `CREATE INDEX IF NOT EXISTS prenotazioni_stato_idx ON prenotazioni (stato, creato_il)`,
  /* chiusure: 'giorno' (tutto il giorno), 'mattina' o 'pomeriggio' */
  `ALTER TABLE chiusure ADD COLUMN IF NOT EXISTS fascia TEXT NOT NULL DEFAULT 'giorno'`,
  /* --- app di gestione: accesso, sessioni di 90 giorni, recupero password --- */
  `CREATE TABLE IF NOT EXISTS utenti (
     id SERIAL PRIMARY KEY,
     email TEXT NOT NULL UNIQUE,
     nome TEXT NOT NULL DEFAULT '',
     password_hash TEXT NOT NULL,
     creato_il TIMESTAMPTZ NOT NULL DEFAULT now(),
     password_il TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  /* del gettone di sessione si salva solo l'impronta */
  `CREATE TABLE IF NOT EXISTS sessioni (
     token_hash TEXT PRIMARY KEY,
     utente_id INTEGER NOT NULL REFERENCES utenti(id) ON DELETE CASCADE,
     scade_il TIMESTAMPTZ NOT NULL,
     creato_il TIMESTAMPTZ NOT NULL DEFAULT now(),
     ultimo_uso TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE TABLE IF NOT EXISTS recuperi (
     token_hash TEXT PRIMARY KEY,
     utente_id INTEGER NOT NULL REFERENCES utenti(id) ON DELETE CASCADE,
     scade_il TIMESTAMPTZ NOT NULL,
     usato BOOLEAN NOT NULL DEFAULT false
   )`,
  /* telefoni che ricevono le notifiche (Web Push) */
  `CREATE TABLE IF NOT EXISTS push_iscrizioni (
     endpoint TEXT PRIMARY KEY,
     utente_id INTEGER REFERENCES utenti(id) ON DELETE CASCADE,
     p256dh TEXT NOT NULL,
     auth TEXT NOT NULL,
     creato_il TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  /* foto caricate dall'app (galleria): già ridotte dal telefono, in
     due misure, salvate in base64 */
  `CREATE TABLE IF NOT EXISTS foto (
     id TEXT PRIMARY KEY,
     grande TEXT NOT NULL,
     piccola TEXT NOT NULL,
     tipo TEXT NOT NULL DEFAULT 'image/jpeg',
     larghezza INTEGER NOT NULL DEFAULT 0,
     altezza INTEGER NOT NULL DEFAULT 0,
     creato_il TIMESTAMPTZ NOT NULL DEFAULT now()
   )`
];

/* Cambia quando cambia lo schema: finché il numero salvato nel database
   è questo, all'avvio basta una sola lettura invece di tutti i comandi. */
const VERSIONE_SCHEMA = 7;

/* Passaggi per i database creati prima della prenotazione su richiesta.
   Ognuno controlla da solo se è già stato fatto e avviene in una
   transazione con lo stesso lucchetto delle prenotazioni: nessuna
   richiesta può infilarsi a metà. */
async function migra(a) {
  /* 1. lo stato 'in_attesa' entra tra quelli ammessi */
  const vincoloStato = () => a.query(
    `SELECT c.conname, pg_get_constraintdef(c.oid) AS def FROM pg_constraint c
     WHERE c.conrelid = 'prenotazioni'::regclass AND c.contype = 'c' AND pg_get_constraintdef(c.oid) LIKE '%confermata%'`);
  let v = await vincoloStato();
  if (!v.some(r => r.def.indexOf('in_attesa') !== -1)) {
    await a.transazione(async (x) => {
      await x('SELECT pg_advisory_xact_lock(7231983)');
      const ora = await x(
        `SELECT c.conname, pg_get_constraintdef(c.oid) AS def FROM pg_constraint c
         WHERE c.conrelid = 'prenotazioni'::regclass AND c.contype = 'c' AND pg_get_constraintdef(c.oid) LIKE '%confermata%'`);
      if (ora.some(r => r.def.indexOf('in_attesa') !== -1)) return;
      for (const r of ora) await x('ALTER TABLE prenotazioni DROP CONSTRAINT "' + r.conname.replace(/"/g, '') + '"');
      await x(`ALTER TABLE prenotazioni ADD CONSTRAINT prenotazioni_stato_check
               CHECK (stato IN ('in_attesa','confermata','annullata','presente','assente'))`);
    });
  }
  /* 2. le occupazioni passano da "posto per giorno" a "posto per mezza
        giornata": ogni riga esistente (giornata intera) diventa due */
  const haFascia = (esegui) => esegui(
    `SELECT 1 FROM information_schema.columns
     WHERE table_schema = current_schema() AND table_name = 'occupazioni' AND column_name = 'fascia'`);
  if (!(await haFascia(a.query)).length) {
    await a.transazione(async (x) => {
      await x('SELECT pg_advisory_xact_lock(7231983)');
      if ((await haFascia(x)).length) return;
      const pk = await x(`SELECT conname FROM pg_constraint WHERE conrelid = 'occupazioni'::regclass AND contype = 'p'`);
      await x(`ALTER TABLE occupazioni ADD COLUMN fascia TEXT NOT NULL DEFAULT 'mattina'`);
      for (const r of pk) await x('ALTER TABLE occupazioni DROP CONSTRAINT "' + r.conname.replace(/"/g, '') + '"');
      await x(`INSERT INTO occupazioni (postazione_id, data, prenotazione_id, fascia)
               SELECT postazione_id, data, prenotazione_id, 'pomeriggio' FROM occupazioni`);
      await x('ALTER TABLE occupazioni ADD PRIMARY KEY (postazione_id, data, fascia)');
    });
  }
}

let schemaPronto = null;
function assicuraSchema() {
  if (schemaPronto) return schemaPronto;
  const a = db();
  schemaPronto = (async () => {
    /* schema già aggiornato: una lettura e via */
    try {
      const v = await a.query("SELECT valore FROM impostazioni WHERE chiave = 'schema'");
      if (v.length && Number(v[0].valore) === VERSIONE_SCHEMA) return;
    } catch (e) { /* database nuovo: la tabella non c'è ancora */ }
    for (const s of SCHEMA) await a.query(s);
    await migra(a);
    /* prime postazioni dal file di configurazione */
    const n = await a.query('SELECT COUNT(*)::int AS n FROM postazioni');
    if (n[0].n === 0) {
      const cfg = require('../config.js');
      for (let i = 1; i <= cfg.postazioni; i++) await a.query('INSERT INTO postazioni (nome) VALUES ($1)', ['Postazione ' + i]);
    }
    await a.query(
      `INSERT INTO impostazioni (chiave, valore, aggiornato_il) VALUES ('schema', $1, now())
       ON CONFLICT (chiave) DO UPDATE SET valore = EXCLUDED.valore, aggiornato_il = now()`, [JSON.stringify(VERSIONE_SCHEMA)]);
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

module.exports = { q, transazione, assicuraSchema, impostaAdattatore, disponibile, nuovoCodice, SCHEMA, migra };
