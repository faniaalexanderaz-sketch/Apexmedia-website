import * as schema from "./schema";

/* =============================================================
   Connessione al database.
   - Produzione / Vercel: POSTGRES_URL o DATABASE_URL (generate collegando Neon/Postgres)
     tramite @vercel/postgres + drizzle-orm/vercel-postgres.
   - Sviluppo senza database: DB_LOCAL_DIR=cartella usa PGlite su disco.
   - Nessuna delle due: MODALITÀ DEMO, PGlite in memoria con lo schema
     e 12 mesi di dati di esempio (si rigenerano a ogni avvio; le
     modifiche fatte dall'admin durano finché il server resta acceso).
     Appena esiste POSTGRES_URL, la demo sparisce da sola.
   ============================================================= */

type Db = import("drizzle-orm/pg-core").PgDatabase<import("drizzle-orm/pg-core").PgQueryResultHKT, typeof schema>;

let istanza: Promise<Db> | null = null;
let demo = false;

async function pglite(dir?: string): Promise<Db> {
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const client = dir ? new PGlite(dir) : new PGlite();
  const db = drizzle(client, { schema }) as unknown as Db;
  if (!dir) {
    const { SCHEMA_SQL } = await import("./schema.sql");
    for (const stmt of SCHEMA_SQL.split("--> statement-breakpoint")) { const s = stmt.trim(); if (s) await client.exec(s); }
    const { seminaDemo } = await import("./demo");
    await seminaDemo(db);
  }
  return db;
}

/** Indirizzo del database: Vercel lo chiama POSTGRES_URL (Vercel Postgres) o DATABASE_URL (Neon dal Marketplace). */
export function indirizzoDb(): string | undefined {
  return process.env.POSTGRES_URL || process.env.DATABASE_URL || undefined;
}

async function crea(): Promise<Db> {
  const url = indirizzoDb();
  if (url) {
    const { createPool } = await import("@vercel/postgres");
    const { drizzle } = await import("drizzle-orm/vercel-postgres");
    return drizzle(createPool({ connectionString: url }), { schema }) as unknown as Db;
  }
  if (process.env.DB_LOCAL_DIR) return pglite(process.env.DB_LOCAL_DIR);
  demo = true;
  return pglite();
}

export function db(): Promise<Db> {
  if (!istanza) istanza = crea();
  return istanza;
}

/** True quando il pannello gira sui dati di esempio (nessun POSTGRES_URL). */
export function modalitaDemo(): boolean {
  return !indirizzoDb() && !process.env.DB_LOCAL_DIR;
}
export function demoAttiva(): boolean { return demo; }

export { schema };
