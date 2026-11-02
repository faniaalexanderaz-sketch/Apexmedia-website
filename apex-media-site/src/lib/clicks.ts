
/* =============================================================
   Tracciamento click: tipi, storage su Vercel Blob, aggregazioni.
   Solo lato server (API e pagina /admin).
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

/* ---------- storage: Vercel Blob ----------
   Un blob per evento, dentro la cartella del giorno. Tutti i campi
   sono codificati anche nel nome del file (base64url del JSON), così
   la dashboard legge solo l'elenco dei blob, senza scaricare nulla.
   Il corpo del blob contiene lo stesso JSON, per sicurezza.
   ============================================================= */
const PREFISSO = "click/";
const ACCESSO = (process.env.BLOB_ACCESS === "public" ? "public" : "private") as "public" | "private";

function codifica(riga: NuovoClick & { creato_il: string }): string {
  return Buffer.from(JSON.stringify(riga), "utf8").toString("base64url");
}
function decodifica(pathname: string): ClickEvento | null {
  // click/2026-11-02/1762083600000-ab12.<base64url>.json
  const m = pathname.match(/^click\/\d{4}-\d{2}-\d{2}\/(\d+)-[a-z0-9]+\.([A-Za-z0-9_-]+)\.json$/);
  if (!m) return null;
  try {
    const d = JSON.parse(Buffer.from(m[2], "base64url").toString("utf8")) as NuovoClick & { creato_il: string };
    if (!AZIONI.includes(d.azione) || !SORGENTI.includes(d.sorgente)) return null;
    return { id: Number(m[1]), ...d };
  } catch {
    return null;
  }
}

export async function inserisciClick(riga: NuovoClick): Promise<void> {
  const { put } = await import("@vercel/blob");
  const creato_il = new Date().toISOString();
  const completo = { ...riga, creato_il };
  const giorno = creato_il.slice(0, 10);
  const nome = `${PREFISSO}${giorno}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${codifica(completo)}.json`;
  await put(nome, JSON.stringify(completo), { access: ACCESSO, addRandomSuffix: false, contentType: "application/json" });
}

/** Ultimi `giorni` giorni di eventi, più recenti prima. */
export async function leggiClick(giorni = 30, sito?: string): Promise<ClickEvento[]> {
  const { list } = await import("@vercel/blob");
  const da = new Date();
  da.setUTCDate(da.getUTCDate() - giorni);
  da.setUTCHours(0, 0, 0, 0);
  const daGiorno = da.toISOString().slice(0, 10);
  const righe: ClickEvento[] = [];
  let cursor: string | undefined;
  do {
    const pagina = await list({ prefix: PREFISSO, limit: 1000, cursor });
    for (const b of pagina.blobs) {
      const giorno = b.pathname.slice(PREFISSO.length, PREFISSO.length + 10);
      if (giorno < daGiorno) continue;
      const r = decodifica(b.pathname);
      if (r && (!sito || r.sito === sito)) righe.push(r);
    }
    cursor = pagina.hasMore ? pagina.cursor : undefined;
  } while (cursor);
  righe.sort((x, y) => (x.creato_il < y.creato_il ? 1 : -1));
  return righe;
}

/** Elenco dei siti presenti negli ultimi 90 giorni. */
export async function elencoSiti(): Promise<string[]> {
  const righe = await leggiClick(90);
  return Array.from(new Set(righe.map((r) => r.sito))).sort();
}

/* ---------- aggregazioni per la dashboard (fuso Europe/Rome) ---------- */

const FUSO = "Europe/Rome";
export function giornoLocale(iso: string): string {
  // YYYY-MM-DD nel fuso del centro, così "oggi" è l'oggi italiano
  return new Intl.DateTimeFormat("sv-SE", { timeZone: FUSO, year: "numeric", month: "2-digit", day: "2-digit" }).format(
    new Date(iso),
  );
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
  const oggi = oggiLocale();
  const da7 = giorniFa(6);
  const da30 = giorniFa(29);
  const t = Object.fromEntries(AZIONI.map((a) => [a, { oggi: 0, g7: 0, g30: 0 }])) as Totali;
  for (const r of righe) {
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
    if (voce) voce[r.azione]++;
  }
  return Array.from(mappa.values());
}

export type RigaTabella = { chiave: string; totale: number } & Record<Azione, number>;

export function tabellaPer(righe: ClickEvento[], campo: "sorgente" | "pagina" | "dispositivo"): RigaTabella[] {
  const mappa = new Map<string, RigaTabella>();
  for (const r of righe) {
    const k = r[campo];
    const voce = mappa.get(k) ?? { chiave: k, totale: 0, whatsapp: 0, telefono: 0, prenota: 0 };
    voce[r.azione]++;
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
    [r.creato_il, r.sito, r.azione, r.pagina, r.sorgente, r.utm_source, r.utm_medium, r.gclid ? "si" : "no", r.dispositivo]
      .map(cella)
      .join(";"),
  );
  return "﻿" + [testa.join(";"), ...corpo].join("\r\n");
}
