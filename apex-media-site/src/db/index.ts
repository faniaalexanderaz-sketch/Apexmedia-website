import * as schema from "./schema";

/* =============================================================
   Connessione al database.
   - Produzione / Vercel: POSTGRES_URL (generata da Vercel Postgres)
     tramite @vercel/postgres + drizzle-orm/vercel-postgres.
   - Sviluppo e test senza database: DB_LOCAL_DIR=cartella usa PGlite
     (Postgres in-process), stesso schema, stesse query.
   ============================================================= */

type Db = import("drizzle-orm/pg-core").PgDatabase<import("drizzle-orm/pg-core").PgQueryResultHKT, typeof schema>;

let istanza: Promise<Db> | null = null;

async function crea(): Promise<Db> {
  if (process.env.POSTGRES_URL) {
    const { sql } = await import("@vercel/postgres");
    const { drizzle } = await import("drizzle-orm/vercel-postgres");
    return drizzle(sql, { schema }) as unknown as Db;
  }
  if (process.env.DB_LOCAL_DIR) {
    const { PGlite } = await import("@electric-sql/pglite");
    const { drizzle } = await import("drizzle-orm/pglite");
    const client = new PGlite(process.env.DB_LOCAL_DIR);
    return drizzle(client, { schema }) as unknown as Db;
  }
  throw new Error("POSTGRES_URL mancante: collega un database Vercel Postgres al progetto (Storage → Postgres) e fai `vercel env pull`.");
}

export function db(): Promise<Db> {
  if (!istanza) istanza = crea();
  return istanza;
}

export { schema };
