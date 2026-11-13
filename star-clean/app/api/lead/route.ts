import { NextResponse } from "next/server";
import { sito } from "@/content/sito";
import { dbConfigurato, salvaLead } from "@/lib/db";
import { emailConfigurata, notificaLead } from "@/lib/email";
import { validaLead } from "@/lib/lead";

export async function POST(richiesta: Request) {
  let corpo: unknown;
  try {
    corpo = await richiesta.json();
  } catch {
    return NextResponse.json({ errore: "Richiesta non valida." }, { status: 400 });
  }

  // Campo trappola: le persone non lo vedono, i bot lo compilano. Rispondiamo ok senza salvare.
  if (typeof (corpo as Record<string, unknown>)?.sito_web === "string" && (corpo as Record<string, string>).sito_web) {
    return NextResponse.json({ ok: true });
  }

  const esito = validaLead(corpo);
  if (!esito.ok) return NextResponse.json({ errore: esito.errore }, { status: 422 });
  const { lead } = esito;

  let id: number | null = null;
  let salvato = false;
  let notificato = false;

  if (dbConfigurato) {
    try {
      id = await salvaLead(lead);
      salvato = true;
    } catch (e) {
      console.error("[lead] salvataggio fallito", e);
    }
  }

  if (emailConfigurata) {
    try {
      await notificaLead(lead, id);
      notificato = true;
    } catch (e) {
      console.error("[lead] notifica fallita", e);
    }
  }

  // Il lead è al sicuro se è arrivato almeno da una parte (database o email).
  if (salvato || notificato) return NextResponse.json({ ok: true });

  // Demo senza database né Resend: il percorso si può provare, ma il lead finisce solo nei log.
  if (sito.demo && !dbConfigurato && !emailConfigurata) {
    console.warn("[lead] DEMO: database e Resend non configurati, lead non salvato", lead);
    return NextResponse.json({ ok: true, demo: true });
  }

  return NextResponse.json(
    { errore: "Non siamo riusciti a registrare la richiesta. Chiamaci, facciamo prima." },
    { status: 500 },
  );
}
