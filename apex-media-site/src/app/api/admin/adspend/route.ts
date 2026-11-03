import { NextResponse, type NextRequest } from "next/server";
import { salvaSpesa } from "@/lib/notes";
import { autorizza, conMessaggio, percorsoSicuro, redirect, SITO_DEFAULT } from "@/lib/pannello-server";

/** Solo admin: crea o aggiorna la spesa pubblicitaria di un mese. */
export async function POST(req: NextRequest) {
  const auth = await autorizza(req, "admin");
  if (auth instanceof NextResponse) return auth;
  const form = await req.formData();
  const next = percorsoSicuro(form.get("next"), "/admin");
  const sito = String(form.get("sito") ?? SITO_DEFAULT).slice(0, 100) || SITO_DEFAULT;
  try {
    const r = await salvaSpesa(sito, String(form.get("mese") ?? ""), String(form.get("importo") ?? ""));
    if (typeof r === "string") return redirect(req, conMessaggio(next, "errore", r));
    return redirect(req, conMessaggio(next, "ok", "spesa"));
  } catch (e) {
    console.error("[adspend]", e);
    return redirect(req, conMessaggio(next, "errore", "db"));
  }
}
