import { NextResponse, type NextRequest } from "next/server";
import { sessione, type Ruolo } from "@/lib/admin-auth";

/* Helper comuni alle API del pannello. */

/** Percorso di ritorno sicuro: solo /admin o /jenny (con query). */
export function percorsoSicuro(v: unknown, predefinito = "/admin"): string {
  const s = typeof v === "string" ? v : "";
  return /^\/(admin|jenny|stampa)(\?[^\s]*)?$/.test(s) ? s : predefinito;
}

export function conMessaggio(percorso: string, chiave: string, valore: string): string {
  const u = new URL(percorso, "http://x");
  u.searchParams.set(chiave, valore);
  return u.pathname + u.search;
}

/** Verifica la sessione; per le modifiche serve il ruolo admin. */
export async function autorizza(req: NextRequest, richiesto: Ruolo | "qualsiasi"): Promise<Ruolo | NextResponse> {
  const r = await sessione();
  if (!r) return NextResponse.json({ ok: false, errore: "non_autenticato" }, { status: 401 });
  if (richiesto === "admin" && r !== "admin") return NextResponse.json({ ok: false, errore: "sola_lettura" }, { status: 403 });
  return r;
}

export function redirect(req: NextRequest, percorso: string) {
  return NextResponse.redirect(new URL(percorso, req.url), 303);
}

export const SITO_DEFAULT = "essenzadoriente.it";
