import { NextResponse, type NextRequest } from "next/server";
import { salvaImpostazione } from "@/lib/settings";
import { autorizza, conMessaggio, percorsoSicuro, redirect, SITO_DEFAULT } from "@/lib/pannello-server";

const CHIAVI: Record<string, (v: string) => string | null> = {
  treatwell_commissione: (v) => { const n = parseFloat(v.replace(",", ".")); return Number.isFinite(n) && n >= 0 && n <= 100 ? String(Math.round(n * 100) / 100) : null; },
};

/** Solo admin: salva un'impostazione (es. commissione Treatwell). */
export async function POST(req: NextRequest) {
  const auth = await autorizza(req, "admin");
  if (auth instanceof NextResponse) return auth;
  const form = await req.formData();
  const next = percorsoSicuro(form.get("next"), "/admin");
  const sito = String(form.get("sito") ?? SITO_DEFAULT).slice(0, 100) || SITO_DEFAULT;
  const chiave = String(form.get("chiave") ?? "");
  const valida = CHIAVI[chiave];
  if (!valida) return redirect(req, conMessaggio(next, "errore", "generico"));
  const valore = valida(String(form.get("valore") ?? ""));
  if (valore === null) return redirect(req, conMessaggio(next, "errore", "importo"));
  try {
    await salvaImpostazione(sito, chiave, valore);
    return redirect(req, conMessaggio(next, "ok", "commissione"));
  } catch (e) {
    console.error("[settings]", e);
    return redirect(req, conMessaggio(next, "errore", "db"));
  }
}
