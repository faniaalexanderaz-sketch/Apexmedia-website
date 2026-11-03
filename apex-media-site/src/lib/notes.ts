import { desc, eq, sql } from "drizzle-orm";
import { db, schema } from "@/db";

/* =============================================================
   Note mensili (italiano + cinese) e spesa pubblicitaria mensile.
   Tabelle `monthly_notes` e `monthly_adspend` su Vercel Postgres.
   ============================================================= */

export type NotaMensile = { sito: string; mese: string; it: string; zh: string; aggiornato_il: string };
export type SpesaMensile = { sito: string; mese: string; importo: number; aggiornato_il: string };
const MESE_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

export async function elencaNote(sito: string): Promise<NotaMensile[]> {
  const righe = await (await db()).select().from(schema.monthlyNotes).where(eq(schema.monthlyNotes.sito, sito)).orderBy(desc(schema.monthlyNotes.mese)).limit(60);
  return righe.map((r) => ({ sito: r.sito, mese: r.mese, it: r.it, zh: r.zh, aggiornato_il: r.aggiornatoIl.toISOString() }));
}

export async function salvaNota(sito: string, mese: string, it: string, zh: string): Promise<NotaMensile | string> {
  if (!MESE_RE.test(mese)) return "mese";
  const valori = { sito, mese, it: it.trim().slice(0, 2000), zh: zh.trim().slice(0, 2000), aggiornatoIl: new Date() };
  const [r] = await (await db())
    .insert(schema.monthlyNotes)
    .values(valori)
    .onConflictDoUpdate({ target: [schema.monthlyNotes.sito, schema.monthlyNotes.mese], set: { it: valori.it, zh: valori.zh, aggiornatoIl: valori.aggiornatoIl } })
    .returning();
  return { sito: r.sito, mese: r.mese, it: r.it, zh: r.zh, aggiornato_il: r.aggiornatoIl.toISOString() };
}

export async function elencaSpese(sito: string): Promise<SpesaMensile[]> {
  const righe = await (await db()).select().from(schema.monthlyAdspend).where(eq(schema.monthlyAdspend.sito, sito)).orderBy(desc(schema.monthlyAdspend.mese)).limit(60);
  return righe.map((r) => ({ sito: r.sito, mese: r.mese, importo: Number(r.importo), aggiornato_il: r.aggiornatoIl.toISOString() }));
}

export async function salvaSpesa(sito: string, mese: string, importoRaw: string): Promise<SpesaMensile | string> {
  if (!MESE_RE.test(mese)) return "mese";
  const n = parseFloat(importoRaw.replace(",", ".").replace(/[^\d.]/g, ""));
  if (!Number.isFinite(n) || n < 0) return "importo";
  const importo = (Math.round(n * 100) / 100).toFixed(2);
  const [r] = await (await db())
    .insert(schema.monthlyAdspend)
    .values({ sito, mese, importo, aggiornatoIl: new Date() })
    .onConflictDoUpdate({ target: [schema.monthlyAdspend.sito, schema.monthlyAdspend.mese], set: { importo, aggiornatoIl: sql`now()` } })
    .returning();
  return { sito: r.sito, mese: r.mese, importo: Number(r.importo), aggiornato_il: r.aggiornatoIl.toISOString() };
}
