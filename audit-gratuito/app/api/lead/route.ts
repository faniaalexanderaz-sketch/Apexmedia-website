import { NextRequest, NextResponse } from "next/server";
import { validaLead } from "@/lib/validate";
import { creaLead, segnaEmailInviata } from "@/lib/supabase";
import { inviaEmail } from "@/lib/email";
import { emailNotificaInterna, emailRingraziamentoLead } from "@/lib/email-templates";

export const dynamic = "force-dynamic";

const EMAIL_STUDIO = "studio@infoapex.eu";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, errore: "Dati non validi." }, { status: 400 });
  }

  const validazione = validaLead(body);
  if (!validazione.ok) {
    return NextResponse.json({ ok: false, errore: validazione.errore }, { status: 400 });
  }

  // Honeypot: campo nascosto che un utente reale non compila mai.
  if (typeof (body as Record<string, unknown>).sito_web === "string" && (body as Record<string, unknown>).sito_web) {
    return NextResponse.json({ ok: true });
  }

  let lead;
  try {
    const risultato = await creaLead(validazione.dati);
    lead = risultato.lead;
  } catch (err) {
    console.error("Errore salvataggio lead:", err);
    return NextResponse.json(
      { ok: false, errore: "Non siamo riusciti a salvare la richiesta. Riprova tra poco." },
      { status: 500 }
    );
  }

  // Le email sono "best effort": se falliscono (o la chiave Resend non è
  // ancora configurata) il lead resta comunque salvato e la richiesta va a buon fine.
  try {
    if (lead.temperatura === "caldo" || lead.temperatura === "medio") {
      const { subject, html } = emailNotificaInterna(lead);
      const { inviata } = await inviaEmail({ to: EMAIL_STUDIO, subject, html, replyTo: lead.email });
      if (inviata) await segnaEmailInviata(lead.id, "email_notifica_inviata");
    } else {
      const { subject, html } = emailRingraziamentoLead(lead);
      const { inviata } = await inviaEmail({ to: lead.email, subject, html });
      if (inviata) await segnaEmailInviata(lead.id, "email_ringraziamento_inviata");
    }
  } catch (err) {
    console.error("Errore invio email (non bloccante):", err);
  }

  return NextResponse.json({ ok: true });
}
