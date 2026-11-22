import type { NextRequest } from "next/server";
import { controlla, rispondi } from "@/lib/studio/api";
import { faiLavorare } from "@/lib/studio/claude";
import { caricaDati, Errore } from "@/lib/studio/dati";

// Un agente può impiegare più di un minuto a consegnare.
export const maxDuration = 300;

/** Fa lavorare l'agente sul lavoro indicato e ritorna i dati aggiornati. */
export async function POST(req: NextRequest) {
  const no = await controlla(req);
  if (no) return no;
  try {
    const { id } = (await req.json()) as { id?: number };
    await faiLavorare(Number(id));
    return rispondi({ ok: true, dati: await caricaDati() });
  } catch (e) {
    if (e instanceof Errore) return rispondi({ ok: false, errore: e.message }, 400);
    console.error("[studio] agente", e);
    return rispondi({ ok: false, errore: "L'agente si è fermato per un errore. Riprova." }, 500);
  }
}
