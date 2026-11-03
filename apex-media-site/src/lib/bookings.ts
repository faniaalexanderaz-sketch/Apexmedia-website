import { and, desc, eq, gte } from "drizzle-orm";
import { db, schema } from "@/db";

/* =============================================================
   Prenotazioni inserite a mano (o importate da CSV) dall'admin.
   Tabella `bookings` su Vercel Postgres.
   ============================================================= */

export const CANALI = ["treatwell", "telefono", "whatsapp", "walk-in"] as const;
export type Canale = (typeof CANALI)[number];

export type Prenotazione = {
  id: string;
  sito: string;
  data: string; // YYYY-MM-DD
  trattamento: string;
  canale: Canale;
  importo: number | null;
  note: string | null;
  creato_il: string;
};
export type NuovaPrenotazione = Omit<Prenotazione, "id" | "creato_il">;

const DATA_RE = /^\d{4}-\d{2}-\d{2}$/;

export const TRATTAMENTI_NOTI = [
  "Massaggio Oli Essenziali",
  "Tuina Shiatsu",
  "Riflessologia Plantare",
  "Massaggio Spa",
  "Coppettazione",
  "Gua Sha",
  "Pulizia delle Orecchie",
  "Pedicure",
];

function daRiga(r: typeof schema.bookings.$inferSelect): Prenotazione {
  return {
    id: String(r.id),
    sito: r.sito,
    data: r.data,
    trattamento: r.trattamento,
    canale: r.canale as Canale,
    importo: r.importo === null ? null : Number(r.importo),
    note: r.note,
    creato_il: r.creatoIl.toISOString(),
  };
}

/** Valida e normalizza i campi che arrivano da form o CSV. */
export function normalizza(input: Record<string, unknown>, sito: string): NuovaPrenotazione | string {
  const data = String(input.data ?? "").trim();
  if (!DATA_RE.test(data)) return "data";
  const trattamento = String(input.trattamento ?? "").trim().slice(0, 80);
  if (!trattamento) return "trattamento";
  const canale = String(input.canale ?? "").trim().toLowerCase() as Canale;
  if (!CANALI.includes(canale)) return "canale";
  const impRaw = String(input.importo ?? "").replace(",", ".").replace(/[^\d.]/g, "");
  const importo = impRaw ? Math.round(parseFloat(impRaw) * 100) / 100 : null;
  if (importo !== null && !Number.isFinite(importo)) return "importo";
  const note = String(input.note ?? "").trim().slice(0, 160) || null;
  return { sito, data, trattamento, canale, importo, note };
}

export async function elencaPrenotazioni(giorni = 365, sito?: string): Promise<Prenotazione[]> {
  const da = new Date();
  da.setUTCDate(da.getUTCDate() - giorni);
  const daGiorno = da.toISOString().slice(0, 10);
  const cond = sito ? and(gte(schema.bookings.data, daGiorno), eq(schema.bookings.sito, sito)) : gte(schema.bookings.data, daGiorno);
  const righe = await (await db()).select().from(schema.bookings).where(cond).orderBy(desc(schema.bookings.data), desc(schema.bookings.id)).limit(5000);
  return righe.map(daRiga);
}

export async function inserisciPrenotazione(n: NuovaPrenotazione): Promise<Prenotazione> {
  const [r] = await (await db())
    .insert(schema.bookings)
    .values({ sito: n.sito, data: n.data, trattamento: n.trattamento, canale: n.canale, importo: n.importo === null ? null : n.importo.toFixed(2), note: n.note })
    .returning();
  return daRiga(r);
}

export async function inserisciPrenotazioni(lista: NuovaPrenotazione[]): Promise<number> {
  if (!lista.length) return 0;
  const righe = await (await db())
    .insert(schema.bookings)
    .values(lista.map((n) => ({ sito: n.sito, data: n.data, trattamento: n.trattamento, canale: n.canale, importo: n.importo === null ? null : n.importo.toFixed(2), note: n.note })))
    .returning({ id: schema.bookings.id });
  return righe.length;
}

export async function eliminaPrenotazione(id: string): Promise<boolean> {
  const n = Number(id);
  if (!Number.isInteger(n)) return false;
  const righe = await (await db()).delete(schema.bookings).where(eq(schema.bookings.id, n)).returning({ id: schema.bookings.id });
  return righe.length > 0;
}

/** CSV con intestazione: data;trattamento;canale;importo;note (separatore ; o ,). Date anche gg/mm/aaaa. */
export function parseCsv(testo: string, sito: string): { ok: NuovaPrenotazione[]; errori: string[] } {
  const righe = testo.replace(/^﻿/, "").split(/\r?\n/).filter((r) => r.trim());
  if (righe.length < 2) return { ok: [], errori: ["CSV vuoto"] };
  const sep = righe[0].includes(";") ? ";" : ",";
  const spezza = (r: string) => {
    const out: string[] = [];
    let cur = "", q = false;
    for (let i = 0; i < r.length; i++) {
      const c = r[i];
      if (c === '"') { if (q && r[i + 1] === '"') { cur += '"'; i++; } else q = !q; }
      else if (c === sep && !q) { out.push(cur); cur = ""; }
      else cur += c;
    }
    out.push(cur);
    return out.map((s) => s.trim());
  };
  const testa = spezza(righe[0]).map((h) => h.toLowerCase());
  const idx = (n: string) => testa.indexOf(n);
  const iData = idx("data"), iTr = idx("trattamento"), iCan = idx("canale"), iImp = idx("importo"), iNote = idx("note");
  if (iData < 0 || iTr < 0 || iCan < 0) return { ok: [], errori: ["Intestazione richiesta: data;trattamento;canale;importo;note"] };
  const ok: NuovaPrenotazione[] = [];
  const errori: string[] = [];
  righe.slice(1).forEach((r, i) => {
    const c = spezza(r);
    let data = c[iData] ?? "";
    const it = data.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (it) data = `${it[3]}-${it[2].padStart(2, "0")}-${it[1].padStart(2, "0")}`;
    const n = normalizza({ data, trattamento: c[iTr], canale: c[iCan], importo: iImp >= 0 ? c[iImp] : "", note: iNote >= 0 ? c[iNote] : "" }, sito);
    if (typeof n === "string") errori.push(`Riga ${i + 2}: campo "${n}" non valido`);
    else ok.push(n);
  });
  return { ok, errori };
}

export function csvPrenotazioni(righe: Prenotazione[]): string {
  const cella = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return "﻿" + ["data;trattamento;canale;importo;note", ...righe.map((p) => [p.data, p.trattamento, p.canale, p.importo ?? "", p.note ?? ""].map(cella).join(";"))].join("\r\n");
}
