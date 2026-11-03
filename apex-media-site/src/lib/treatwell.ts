import { createHash } from "node:crypto";
import type { NuovaPrenotazione } from "@/lib/bookings";

/* =============================================================
   Import del report Treatwell Connect (CSV).
   Riconosce le colonne per nome (in più lingue), tiene solo le
   prenotazioni completate, non salva dati personali: del cliente
   resta solo un hash, usato per il dedup e per nuovo/ritorno.
   ============================================================= */

export type RigaTreatwell = NuovaPrenotazione & { cliente_hash: string | null; nuovo_cliente: boolean | null; dedup_key: string };
export type EsitoParse = { righe: RigaTreatwell[]; scartate: number; totali: number; colonne: string[]; errore?: string };

const COL = {
  data: ["data", "date", "appointment date", "data appuntamento", "booking date", "start", "inizio", "giorno"],
  trattamento: ["trattamento", "treatment", "servizio", "service", "service name", "nome servizio", "prestazione"],
  cliente: ["cliente", "customer", "client", "customer name", "nome cliente", "client name", "nome"],
  prezzo: ["prezzo", "price", "importo", "amount", "total", "totale", "valore", "gross", "lordo"],
  stato: ["stato", "status", "booking status", "stato prenotazione"],
  nuovo: ["nuovo cliente", "new customer", "new client", "first visit", "prima visita", "customer type", "tipo cliente"],
};
const COMPLETATI = ["completed", "completato", "completata", "confirmed", "confermata", "confermato", "done", "eseguita", "eseguito", "paid", "pagato", "pagata", "checked out", "fatturata"];

function spezza(r: string, sep: string): string[] {
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
}
const norm = (s: string) => s.toLowerCase().replace(/[_\-]+/g, " ").replace(/\s+/g, " ").trim();
function trova(testa: string[], nomi: string[]): number {
  for (const n of nomi) { const i = testa.indexOf(n); if (i >= 0) return i; }
  for (const n of nomi) { const i = testa.findIndex((h) => h.includes(n)); if (i >= 0) return i; }
  return -1;
}
function normData(v: string): string | null {
  const s = v.trim();
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = s.match(/^(\d{1,2})[\/.](\d{1,2})[\/.](\d{4})/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}
function normPrezzo(v: string): number | null {
  const s = v.replace(/[€\s]/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  const n = parseFloat(s);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
}
export function hashCliente(nome: string): string | null {
  const n = nome.toLowerCase().replace(/\s+/g, " ").trim();
  return n ? createHash("sha256").update("eo-cliente:" + n).digest("hex").slice(0, 24) : null;
}
export function chiaveDedup(data: string, trattamento: string, importo: number | null, clienteHash: string | null): string {
  return createHash("sha256").update([data, trattamento.toLowerCase().trim(), importo ?? "", clienteHash ?? ""].join("|")).digest("hex").slice(0, 32);
}

export function parseTreatwell(testo: string, sito: string): EsitoParse {
  const righe = testo.replace(/^﻿/, "").split(/\r?\n/).filter((r) => r.trim());
  if (righe.length < 2) return { righe: [], scartate: 0, totali: 0, colonne: [], errore: "vuoto" };
  const sep = (righe[0].match(/;/g) ?? []).length >= (righe[0].match(/,/g) ?? []).length ? ";" : (righe[0].includes("\t") ? "\t" : ",");
  const testa = spezza(righe[0], sep).map(norm);
  const iData = trova(testa, COL.data), iTr = trova(testa, COL.trattamento), iCl = trova(testa, COL.cliente), iPr = trova(testa, COL.prezzo), iSt = trova(testa, COL.stato), iNu = trova(testa, COL.nuovo);
  if (iData < 0 || iTr < 0 || iPr < 0) return { righe: [], scartate: 0, totali: righe.length - 1, colonne: testa, errore: "colonne" };
  const out: RigaTreatwell[] = [];
  let scartate = 0;
  const visti = new Set<string>();
  for (const r of righe.slice(1)) {
    const c = spezza(r, sep);
    const data = normData(c[iData] ?? "");
    const trattamento = (c[iTr] ?? "").trim().slice(0, 80);
    const importo = normPrezzo(c[iPr] ?? "");
    const stato = norm(c[iSt] ?? "");
    const okStato = iSt < 0 || COMPLETATI.some((k) => stato.includes(k));
    if (!data || !trattamento || !okStato) { scartate++; continue; }
    const cliente_hash = iCl >= 0 ? hashCliente(c[iCl] ?? "") : null;
    let nuovo_cliente: boolean | null = null;
    if (iNu >= 0) {
      const v = norm(c[iNu] ?? "");
      if (/^(s[iì]|yes|true|1|nuovo|new)$/.test(v) || v.includes("new") || v.includes("nuov")) nuovo_cliente = true;
      else if (v) nuovo_cliente = false;
    }
    const dedup_key = chiaveDedup(data, trattamento, importo, cliente_hash);
    if (visti.has(dedup_key)) { scartate++; continue; }
    visti.add(dedup_key);
    out.push({ sito, data, trattamento, canale: "treatwell", importo, note: null, cliente_hash, nuovo_cliente, dedup_key });
  }
  return { righe: out, scartate, totali: righe.length - 1, colonne: testa };
}
