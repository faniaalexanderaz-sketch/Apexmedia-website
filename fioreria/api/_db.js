/* =============================================================
   ANTICA FIORERIA DEL CENTRO — accesso al database (Vercel Postgres)
   Un unico punto da cui tutte le funzioni leggono/scrivono. Le
   tabelle si creano da sole al primo utilizzo (CREATE TABLE IF NOT
   EXISTS), così non serve una migrazione manuale separata.
   ============================================================= */
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

/* scorte iniziali: usate solo per popolare la tabella la prima
   volta che viene letta, se è ancora vuota. Da quel momento in poi
   il valore vero vive solo nel database. */
const SCORTE_INIZIALI = {
  vendemmia: 18,
  agrumi: 22,
  romanza: 25,
  positano: 6,
  frutteto: 16,
  velluto: 3,
  raccolto: 20,
  cristalli: 4,
  scrigno: 14
};

let schemaPronto = null;

async function assicuraSchema() {
  if (schemaPronto) return schemaPronto;
  schemaPronto = (async () => {
    await sql`CREATE TABLE IF NOT EXISTS prodotti_scorte (
      slug TEXT PRIMARY KEY,
      quantita INTEGER NOT NULL DEFAULT 0
    )`;
    await sql`CREATE TABLE IF NOT EXISTS ordini (
      id SERIAL PRIMARY KEY,
      sessione_stripe TEXT UNIQUE NOT NULL,
      email TEXT,
      articoli JSONB NOT NULL,
      totale_centesimi INTEGER NOT NULL,
      nome_ricevente TEXT,
      telefono TEXT,
      via TEXT,
      cap TEXT,
      citta TEXT,
      messaggio TEXT,
      creato_il TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
    await sql`CREATE TABLE IF NOT EXISTS visite (
      id SERIAL PRIMARY KEY,
      percorso TEXT NOT NULL,
      creato_il TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;

    const esistenti = await sql`SELECT slug FROM prodotti_scorte`;
    if (esistenti.length === 0) {
      for (const slug of Object.keys(SCORTE_INIZIALI)) {
        await sql`INSERT INTO prodotti_scorte (slug, quantita)
                   VALUES (${slug}, ${SCORTE_INIZIALI[slug]})
                   ON CONFLICT (slug) DO NOTHING`;
      }
    }
  })();
  return schemaPronto;
}

module.exports = { sql, assicuraSchema };
