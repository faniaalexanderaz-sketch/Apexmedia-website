import { NextResponse, type NextRequest } from "next/server";
import { eliminaPrenotazione, inserisciPrenotazione, normalizza, parseCsv } from "@/lib/bookings";
import { autorizza, conMessaggio, percorsoSicuro, redirect, SITO_DEFAULT } from "@/lib/pannello-server";

/* Solo admin. Un'unica rotta, il campo `_azione` del form decide:
   - "aggiungi": una prenotazione dai campi del form
   - "elimina":  per id
   - "importa":  file CSV (multipart) */
export async function POST(req: NextRequest) {
  const auth = await autorizza(req, "admin");
  if (auth instanceof NextResponse) return auth;
  const form = await req.formData();
  const next = percorsoSicuro(form.get("next"), "/admin");
  const sito = String(form.get("sito") ?? SITO_DEFAULT).slice(0, 100) || SITO_DEFAULT;
  const azione = String(form.get("_azione") ?? "aggiungi");

  try {
    if (azione === "elimina") {
      const id = String(form.get("id") ?? "").replace(/[^a-z0-9]/g, "");
      if (!id) return redirect(req, conMessaggio(next, "errore", "id"));
      await eliminaPrenotazione(id);
      return redirect(req, conMessaggio(next, "ok", "eliminata"));
    }
    if (azione === "importa") {
      const file = form.get("file");
      if (!(file instanceof File) || file.size === 0) return redirect(req, conMessaggio(next, "errore", "file"));
      if (file.size > 2_000_000) return redirect(req, conMessaggio(next, "errore", "file_grande"));
      const { ok, errori } = parseCsv(await file.text(), sito);
      for (const n of ok) await inserisciPrenotazione(n);
      const u = conMessaggio(next, "ok", `importate:${ok.length}`);
      return redirect(req, errori.length ? conMessaggio(u, "errore", `righe:${errori.length}`) : u);
    }
    // aggiungi
    const trattamento = String(form.get("trattamento") ?? "") === "__altro" ? String(form.get("trattamento_altro") ?? "") : String(form.get("trattamento") ?? "");
    const n = normalizza({ data: form.get("data"), trattamento, canale: form.get("canale"), importo: form.get("importo"), note: form.get("note") }, sito);
    if (typeof n === "string") return redirect(req, conMessaggio(next, "errore", n));
    await inserisciPrenotazione(n);
    return redirect(req, conMessaggio(next, "ok", "salvata"));
  } catch (e) {
    console.error("[bookings]", e);
    return redirect(req, conMessaggio(next, "errore", "storage"));
  }
}
