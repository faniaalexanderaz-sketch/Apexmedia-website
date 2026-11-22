import { NextResponse, type NextRequest } from "next/server";
import { dentroLoStudio } from "./auth";
import type { Risposta } from "./tipi";

/* Controlli comuni alle API dello Studio: sessione valida e richiesta dalla stessa origine. */

export function rispondi(r: Risposta, status = 200) { return NextResponse.json(r, { status }); }

export async function controlla(req: NextRequest): Promise<NextResponse | null> {
  const origine = req.headers.get("origin");
  if (origine && new URL(origine).host !== req.headers.get("host")) return rispondi({ ok: false, errore: "Richiesta non valida." }, 403);
  if (!(await dentroLoStudio())) return rispondi({ ok: false, errore: "Sessione scaduta: rientra con la password." }, 401);
  return null;
}
