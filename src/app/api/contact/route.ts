import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Richiesta non valida." }, { status: 400 });
  }

  const { name, business, city, contact, service, budget, goal, message } =
    body as Record<string, unknown>;

  if (typeof name !== "string" || name.trim().length < 2) {
    return NextResponse.json({ error: "Il nome inserito non è valido." }, { status: 400 });
  }

  if (typeof business !== "string" || business.trim().length < 2) {
    return NextResponse.json(
      { error: "Inserisci il nome della tua attività o brand." },
      { status: 400 },
    );
  }

  if (typeof service !== "string" || service.trim().length < 2) {
    return NextResponse.json({ error: "Indica il servizio di tuo interesse." }, { status: 400 });
  }

  console.log("Nuova richiesta di consulenza Apex Media:", {
    name,
    business,
    city,
    contact,
    service,
    budget,
    goal,
    message,
  });

  return NextResponse.json({ ok: true });
}
