import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";

/* Impostazioni per sito, tabella `settings` (chiave/valore). */

export const COMMISSIONE_DEFAULT = 20;

export async function leggiImpostazione(sito: string, chiave: string): Promise<string | null> {
  const [r] = await (await db()).select().from(schema.settings).where(and(eq(schema.settings.sito, sito), eq(schema.settings.chiave, chiave))).limit(1);
  return r?.valore ?? null;
}

export async function salvaImpostazione(sito: string, chiave: string, valore: string): Promise<void> {
  await (await db())
    .insert(schema.settings)
    .values({ sito, chiave, valore, aggiornatoIl: new Date() })
    .onConflictDoUpdate({ target: [schema.settings.sito, schema.settings.chiave], set: { valore, aggiornatoIl: new Date() } });
}

export async function commissioneTreatwell(sito: string): Promise<number> {
  const v = await leggiImpostazione(sito, "treatwell_commissione");
  const n = v === null ? NaN : parseFloat(v);
  return Number.isFinite(n) && n >= 0 && n <= 100 ? n : COMMISSIONE_DEFAULT;
}
