/* =============================================================
   ARABESQUE BUSALLA — accesso al database (Neon / Postgres)
   Le tabelle si creano da sole al primo utilizzo: nessuna
   migrazione manuale da lanciare a mano.
   Variabile d'ambiente richiesta su Vercel: DATABASE_URL
   ============================================================= */
const { neon } = require('@neondatabase/serverless');

/* La connessione si apre alla prima query, non al caricamento del file:
   senza DATABASE_URL le funzioni rispondono con un errore leggibile
   invece di andare in crash all'avvio (utile finché il database non è
   collegato: il sito resta navigabile e la cassa passa in dimostrativo). */
let client = null;
function sql(pezzi, ...valori) {
  if (!process.env.DATABASE_URL) {
    const e = new Error('Database non ancora configurato');
    e.codice = 'DB_ASSENTE';
    throw e;
  }
  if (!client) client = neon(process.env.DATABASE_URL);
  return client(pezzi, ...valori);
}

let schemaPronto = null;

async function assicuraSchema() {
  if (!process.env.DATABASE_URL) {
    const e = new Error('Database non ancora configurato');
    e.codice = 'DB_ASSENTE';
    throw e;
  }
  if (schemaPronto) return schemaPronto;
  schemaPronto = (async () => {
    await sql`CREATE TABLE IF NOT EXISTS ordini (
      id SERIAL PRIMARY KEY,
      numero_ordine TEXT UNIQUE NOT NULL,
      riferimento TEXT,
      email TEXT,
      articoli JSONB NOT NULL,
      totale_centesimi INTEGER NOT NULL,
      pagamento TEXT NOT NULL DEFAULT 'carta',
      consegna TEXT NOT NULL DEFAULT 'corriere',
      nome TEXT, telefono TEXT, via TEXT, cap TEXT, citta TEXT, note TEXT,
      stato TEXT NOT NULL DEFAULT 'ricevuto',
      creato_il TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
    await sql`CREATE INDEX IF NOT EXISTS ordini_numero_idx ON ordini (numero_ordine)`;

    await sql`CREATE TABLE IF NOT EXISTS scorte (
      slug TEXT NOT NULL,
      taglia TEXT NOT NULL,
      quantita INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (slug, taglia)
    )`;

    await sql`CREATE TABLE IF NOT EXISTS visite (
      id SERIAL PRIMARY KEY,
      percorso TEXT NOT NULL,
      creato_il TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;

    await sql`CREATE TABLE IF NOT EXISTS iscritti (
      email TEXT PRIMARY KEY,
      creato_il TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;

    await sql`CREATE TABLE IF NOT EXISTS avvisi_disponibilita (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      slug TEXT NOT NULL,
      creato_il TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
  })();
  return schemaPronto;
}

/* numero ordine leggibile al telefono: 4 lettere + 4 cifre */
function nuovoNumeroOrdine() {
  const lettere = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let s = '';
  for (let i = 0; i < 4; i++) s += lettere[Math.floor(Math.random() * lettere.length)];
  for (let i = 0; i < 4; i++) s += Math.floor(Math.random() * 10);
  return s;
}

module.exports = { sql, assicuraSchema, nuovoNumeroOrdine };
