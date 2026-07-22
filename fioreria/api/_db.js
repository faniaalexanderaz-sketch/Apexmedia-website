/* =============================================================
   ANTICA FIORERIA DEL CENTRO — accesso al database (Vercel Postgres)
   Un unico punto da cui tutte le funzioni leggono/scrivono. Le
   tabelle si creano da sole al primo utilizzo (CREATE TABLE IF NOT
   EXISTS), così non serve una migrazione manuale separata.
   ============================================================= */
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

/* scorte iniziali: ogni slug qui sotto viene inserito una sola
   volta (ON CONFLICT DO NOTHING), la prima volta che compare in
   questo elenco — così si può cambiare catalogo ed espandere
   questa lista senza toccare le quantità già in uso nel database. */
const SCORTE_INIZIALI = {
  provenza: 16,
  'cesta-primavera': 18,
  'cesta-maggio': 15,
  orto: 20,
  'sole-campagna': 17,
  'cuore-rose': 20,
  'sole-agrumi': 16,
  'gatto-giardiniere': 6,
  'pannello-verde': 5,
  tiffany: 4,
  'cappello-fiorito': 9,
  'autunno-in-tavola': 8,
  'bosco-di-rose': 10,
  'trittico-di-rose': 6,
  'agrumi-oro': 9,
  'casetta-welcome': 5,
  'mezzanotte-in-fiore': 5,
  'cristallo-autunno': 8,
  'nautilus-ambra': 7,
  'malva-lavanda': 8,
  'bonsai-premium': 2,
  'pettirosso-in-fiore': 9,
  'zaffiro-lavanda': 5,
  'dame-fiorite': 6,
  'pinguino-panda': 12,
  'borsa-lavanda': 9
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

    // ON CONFLICT DO NOTHING rende l'inserimento sicuro anche se la
    // tabella ha già righe di un catalogo precedente: aggiunge solo
    // gli slug nuovi, senza mai toccare le quantità già esistenti.
    for (const slug of Object.keys(SCORTE_INIZIALI)) {
      await sql`INSERT INTO prodotti_scorte (slug, quantita)
                 VALUES (${slug}, ${SCORTE_INIZIALI[slug]})
                 ON CONFLICT (slug) DO NOTHING`;
    }
  })();
  return schemaPronto;
}

module.exports = { sql, assicuraSchema };
