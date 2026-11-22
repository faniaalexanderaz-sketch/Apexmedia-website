import type { NextRequest } from "next/server";
import { controlla, rispondi } from "@/lib/studio/api";
import { caricaDati, Errore, esegui } from "@/lib/studio/dati";

/** Tutte le modifiche dello Studio: { tipo, ...campi } → dati aggiornati. */
export async function POST(req: NextRequest) {
  const no = await controlla(req);
  if (no) return no;
  try {
    const corpo = (await req.json()) as Record<string, unknown>;
    const nuovoId = corpo.tipo === "aggiorna" ? undefined : await esegui(String(corpo.tipo ?? ""), corpo);
    return rispondi({ ok: true, dati: await caricaDati(), nuovoId });
  } catch (e) {
    if (e instanceof Errore) return rispondi({ ok: false, errore: e.message }, 400);
    console.error("[studio] azione", e);
    return rispondi({ ok: false, errore: "Non sono riuscito a salvare. Riprova." }, 500);
  }
}
