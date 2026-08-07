import { NextRequest, NextResponse } from "next/server";
import { adminConfigurato, impostaCookieSessione, passwordCorretta } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  if (!adminConfigurato()) {
    return NextResponse.json(
      { ok: false, errore: "Pannello non ancora configurato. Manca ADMIN_PASSWORD." },
      { status: 501 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, errore: "Dati non validi." }, { status: 400 });
  }

  const password = String((body as Record<string, unknown>)?.password ?? "");

  if (!passwordCorretta(password)) {
    return NextResponse.json({ ok: false, errore: "Password errata." }, { status: 401 });
  }

  await impostaCookieSessione();
  return NextResponse.json({ ok: true });
}
