import { defineConfig } from "drizzle-kit";

/* `npm run db:push` applica lo schema al database.
   Con POSTGRES_URL (Vercel Postgres) va sul database vero;
   senza, con DB_LOCAL_DIR, su PGlite locale (sviluppo/test). */
const url = process.env.POSTGRES_URL;
const locale = process.env.DB_LOCAL_DIR;

export default defineConfig(
  url
    ? { dialect: "postgresql", schema: "./src/db/schema.ts", out: "./drizzle", dbCredentials: { url } }
    : { dialect: "postgresql", schema: "./src/db/schema.ts", out: "./drizzle", driver: "pglite", dbCredentials: { url: locale ?? "./.pglite" } },
);
