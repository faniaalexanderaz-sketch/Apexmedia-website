import { neon } from "@neondatabase/serverless";
import type { Lead } from "./lead";

// Vercel Postgres (integrazione Neon) espone POSTGRES_URL / DATABASE_URL.
const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;

export const dbConfigurato = Boolean(url);

let tabellaPronta: Promise<unknown> | null = null;

export async function salvaLead(lead: Lead): Promise<number> {
  if (!url) throw new Error("Database non configurato");
  const sql = neon(url);

  // Crea la tabella al primo lead: nessuna migrazione manuale da ricordare.
  tabellaPronta ??= sql`
    CREATE TABLE IF NOT EXISTS leads (
      id            BIGSERIAL PRIMARY KEY,
      creato_il     TIMESTAMPTZ NOT NULL DEFAULT now(),
      servizio      TEXT NOT NULL,
      comune        TEXT NOT NULL,
      mq            TEXT NOT NULL,
      nome          TEXT NOT NULL,
      telefono      TEXT NOT NULL,
      email         TEXT,
      pagina        TEXT,
      utm_source    TEXT,
      utm_medium    TEXT,
      utm_campaign  TEXT,
      utm_term      TEXT,
      utm_content   TEXT
    )`;
  await tabellaPronta;

  const righe = await sql`
    INSERT INTO leads (servizio, comune, mq, nome, telefono, email, pagina,
                       utm_source, utm_medium, utm_campaign, utm_term, utm_content)
    VALUES (${lead.servizio}, ${lead.comune}, ${lead.mq}, ${lead.nome}, ${lead.telefono}, ${lead.email}, ${lead.pagina},
            ${lead.utm.utm_source ?? null}, ${lead.utm.utm_medium ?? null}, ${lead.utm.utm_campaign ?? null},
            ${lead.utm.utm_term ?? null}, ${lead.utm.utm_content ?? null})
    RETURNING id`;
  return Number(righe[0].id);
}
