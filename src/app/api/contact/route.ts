import { NextResponse } from "next/server";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Richiesta non valida." }, { status: 400 });
  }

  const { name, email, message } = body as Record<string, unknown>;

  if (typeof name !== "string" || name.trim().length < 2) {
    return NextResponse.json({ error: "Il nome inserito non è valido." }, { status: 400 });
  }

  if (typeof email !== "string" || !emailPattern.test(email)) {
    return NextResponse.json({ error: "L'indirizzo email inserito non è valido." }, { status: 400 });
  }

  if (typeof message !== "string" || message.trim().length < 10) {
    return NextResponse.json(
      { error: "Il messaggio deve contenere almeno 10 caratteri." },
      { status: 400 },
    );
  }

  console.log("Nuova richiesta di contatto Apex Media:", { name, email, message });

  return NextResponse.json({ ok: true });
}
