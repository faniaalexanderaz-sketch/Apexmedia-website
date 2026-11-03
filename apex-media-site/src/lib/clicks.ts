import { and, desc, gte, eq } from "drizzle-orm";
import { db, schema } from "@/db";

/* =============================================================
   Tracciamento click: tipi, lettura/scrittura su Vercel Postgres,
   aggregazioni per la dashboard. Solo lato server.
   ============================================================= */

export const AZIONI = ["whatsapp", "telefono", "prenota"] as const;
export type Azione = (typeof AZIONI)[number];
export const SORGENTI = ["google_ads", "instagram", "organico", "altro"] as const;
export type Sorgente = (typeof SORGENTI)[number];
export type Dispositivo = "mobile" | "desktop";

export type ClickEvento = {
  id: number;
  creato_il: string;
  sito: string;
  azione: Azione;
  pagina: string;
  utm_source: string | null;
  utm_medium: string | null;
  gclid: boolean;
  sorgente: Sorgente;
  dispositivo: Dispositivo;
};
export type NuovoClick = Omit<ClickEvento, "id" | "creato_il">;

/** Classifica la sorgente: Google Ads se c'è il gclid o utm_source=google (con medium cpc/paid o assente). */
export function classificaSorgente(utmSource: string | null, utmMedium: string | null, gclid: boolean): Sorgente {
  const src = (utmSource ?? "").toLowerCase();
  const med = (utmMedium ?? "").toLowerCase();
  if (gclid) return "google_ads";
  if (src === "google" && (med === "" || /cpc|ppc|paid|ads/.test(med))) return "google_ads";
  if (/instagram|ig|facebook|fb|meta/.test(src)) return "instagram";
  if (src === "" && med === "") return "organico";
  return "altro";
}

function daRiga(r: typeof schema.clicks.$inferSelect): ClickEvento {
  return {
    id: r.id,
    creato_il: r.creatoIl.toISOString(),
    sito: r.sito,
    azione: r.azione as Azione,
    pagina: r.pagina,
    utm_source: r.utmSource,
    utm_medium: r.utmMedium,
    gclid: r.gclid,
    sorgente: r.sorgente as Sorgente,
    dispositivo: r.dispositivo as Dispositivo,
  };
}

export async function inserisciClick(n: NuovoClick): Promise<ClickEvento> {
  const [r] = await (await db())
    .insert(schema.clicks)
    .values({ sito: n.sito, azione: n.azione, pagina: n.pagina, utmSource: n.utm_source, utmMedium: n.utm_medium, gclid: n.gclid, sorgente: n.sorgente, dispositivo: n.dispositivo })
    .returning();
  return daRiga(r);
}

/** Ultimi `giorni` giorni di eventi, più recenti prima. */
export async function leggiClick(giorni = 30, sito?: string): Promise<ClickEvento[]> {
  const da = new Date();
  da.setUTCDate(da.getUTCDate() - giorni);
  da.setUTCHours(0, 0, 0, 0);
  const cond = sito ? and(gte(schema.clicks.creatoIl, da), eq(schema.clicks.sito, sito)) : gte(schema.clicks.creatoIl, da);
  const righe = await (await db()).select().from(schema.clicks).where(cond).orderBy(desc(schema.clicks.creatoIl)).limit(20000);
  return righe.map(daRiga);
}

/** Elenco dei siti presenti negli ultimi 90 giorni. */
export async function elencoSiti(): Promise<string[]> {
  const da = new Date();
  da.setUTCDate(da.getUTCDate() - 90);
  const righe = await (await db()).selectDistinct({ sito: schema.clicks.sito }).from(schema.clicks).where(gte(schema.clicks.creatoIl, da));
  return righe.map((r) => r.sito).sort();
}

/* ---------- aggregazioni per la dashboard (fuso Europe/Rome) ---------- */

const FUSO = "Europe/Rome";
export function giornoLocale(iso: string): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: FUSO, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));
}
export function oggiLocale(): string {
  return giornoLocale(new Date().toISOString());
}
function giorniFa(n: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return giornoLocale(d.toISOString());
}

export type Totali = Record<Azione, { oggi: number; g7: number; g30: number }>;

export function totaliPerAzione(righe: ClickEvento[]): Totali {
  const oggi = oggiLocale(), da7 = giorniFa(6), da30 = giorniFa(29);
  const t = Object.fromEntries(AZIONI.map((a) => [a, { oggi: 0, g7: 0, g30: 0 }])) as Totali;
  for (const r of righe) {
    if (!(r.azione in t)) continue;
    const g = giornoLocale(r.creato_il);
    if (g >= da30) t[r.azione].g30++;
    if (g >= da7) t[r.azione].g7++;
    if (g === oggi) t[r.azione].oggi++;
  }
  return t;
}

export type GiornoSerie = { giorno: string; etichetta: string } & Record<Azione, number>;

export function seriePerGiorno(righe: ClickEvento[], giorni = 30): GiornoSerie[] {
  const mappa = new Map<string, GiornoSerie>();
  for (let i = giorni - 1; i >= 0; i--) {
    const g = giorniFa(i);
    const [, m, d] = g.split("-");
    mappa.set(g, { giorno: g, etichetta: `${d}/${m}`, whatsapp: 0, telefono: 0, prenota: 0 });
  }
  for (const r of righe) {
    const voce = mappa.get(giornoLocale(r.creato_il));
    if (voce && r.azione in voce) voce[r.azione]++;
  }
  return Array.from(mappa.values());
}

export type RigaTabella = { chiave: string; totale: number } & Record<Azione, number>;

export function tabellaPer(righe: ClickEvento[], campo: "sorgente" | "pagina" | "dispositivo"): RigaTabella[] {
  const mappa = new Map<string, RigaTabella>();
  for (const r of righe) {
    const k = r[campo];
    const voce = mappa.get(k) ?? { chiave: k, totale: 0, whatsapp: 0, telefono: 0, prenota: 0 };
    if (r.azione in voce) voce[r.azione]++;
    voce.totale++;
    mappa.set(k, voce);
  }
  return Array.from(mappa.values()).sort((a, b) => b.totale - a.totale);
}

export function csv(righe: ClickEvento[]): string {
  const testa = ["data_ora", "sito", "azione", "pagina", "sorgente", "utm_source", "utm_medium", "gclid", "dispositivo"];
  const cella = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const corpo = righe.map((r) =>
    [r.creato_il, r.sito, r.azione, r.pagina, r.sorgente, r.utm_source, r.utm_medium, r.gclid ? "si" : "no", r.dispositivo].map(cella).join(";"),
  );
  return "﻿" + [testa.join(";"), ...corpo].join("\r\n");
}
