import { NextResponse, type NextRequest } from "next/server";
import { chiaviEsistenti, inserisciTreatwell } from "@/lib/bookings";
import { parseTreatwell } from "@/lib/treatwell";
import { cancellaFileTemporaneo, leggiFileTemporaneo, salvaFileTemporaneo } from "@/lib/treatwell-temp";
import { autorizza, conMessaggio, percorsoSicuro, redirect, SITO_DEFAULT } from "@/lib/pannello-server";

/* Solo admin. Due passi:
   - _azione=anteprima: riceve il CSV, lo mette da parte e torna al
     pannello con ?anteprima=<token> (il pannello mostra cosa verrà importato)
   - _azione=conferma: rilegge il file dal token, importa saltando i doppioni */
export async function POST(req: NextRequest) {
  const auth = await autorizza(req, "admin");
  if (auth instanceof NextResponse) return auth;
  const form = await req.formData();
  const next = percorsoSicuro(form.get("next"), "/admin");
  const sito = String(form.get("sito") ?? SITO_DEFAULT).slice(0, 100) || SITO_DEFAULT;
  const azione = String(form.get("_azione") ?? "anteprima");
  try {
    if (azione === "anteprima") {
      const file = form.get("file");
      if (!(file instanceof File) || file.size === 0) return redirect(req, conMessaggio(next, "errore", "file"));
      if (file.size > 5_000_000) return redirect(req, conMessaggio(next, "errore", "file"));
      const token = await salvaFileTemporaneo(await file.text());
      return redirect(req, conMessaggio(next, "anteprima", token));
    }
    const token = String(form.get("token") ?? "");
    const testo = await leggiFileTemporaneo(token);
    if (testo === null) return redirect(req, conMessaggio(next, "errore", "file"));
    const esito = parseTreatwell(testo, sito);
    const esistenti = await chiaviEsistenti(sito, esito.righe.map((r) => r.dedup_key));
    const nuove = esito.righe.filter((r) => !esistenti.has(r.dedup_key));
    const n = await inserisciTreatwell(nuove);
    await cancellaFileTemporaneo(token);
    return redirect(req, conMessaggio(next, "ok", `importate:${n}`));
  } catch (e) {
    console.error("[treatwell]", e);
    return redirect(req, conMessaggio(next, "errore", "db"));
  }
}
