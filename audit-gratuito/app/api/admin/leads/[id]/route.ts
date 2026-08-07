import { NextRequest, NextResponse } from "next/server";
import { sessioneValida } from "@/lib/admin-auth";
import { aggiornaStatoLead } from "@/lib/supabase";
import type { Stato } from "@/lib/types";

const STATI_VALIDI: Stato[] = ["da_chiamare", "contattato", "chiuso"];

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await sessioneValida())) {
    return NextResponse.json({ ok: false, errore: "Accesso richiesto." }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, errore: "Dati non validi." }, { status: 400 });
  }

  const stato = (body as Record<string, unknown>)?.stato as Stato;
  if (!STATI_VALIDI.includes(stato)) {
    return NextResponse.json({ ok: false, errore: "Stato non valido." }, { status: 400 });
  }

  try {
    await aggiornaStatoLead(id, stato);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Errore aggiornamento lead:", err);
    return NextResponse.json({ ok: false, errore: "Errore nell'aggiornamento." }, { status: 500 });
  }
}
