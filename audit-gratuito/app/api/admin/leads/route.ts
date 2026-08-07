import { NextResponse } from "next/server";
import { sessioneValida, adminConfigurato } from "@/lib/admin-auth";
import { elencaLead, usaAdminSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!adminConfigurato()) {
    return NextResponse.json(
      { ok: false, errore: "Pannello non ancora configurato. Manca ADMIN_PASSWORD." },
      { status: 501 }
    );
  }

  if (!(await sessioneValida())) {
    return NextResponse.json({ ok: false, errore: "Accesso richiesto." }, { status: 401 });
  }

  try {
    const lead = await elencaLead();
    return NextResponse.json({ ok: true, lead, fonte: usaAdminSupabase() ? "supabase" : "file" });
  } catch (err) {
    console.error("Errore lettura lead:", err);
    return NextResponse.json({ ok: false, errore: "Errore nel caricamento dei lead." }, { status: 500 });
  }
}
