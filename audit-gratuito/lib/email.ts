/**
 * Invio email via Resend, chiamata diretta alla loro API REST (nessuna
 * dipendenza extra da installare). Se RESEND_API_KEY non e' ancora
 * configurata, la funzione non fa nulla e non genera errori: il resto del
 * flusso (salvataggio del lead) continua a funzionare normalmente.
 */
export async function inviaEmail(opts: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<{ inviata: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  const mittente = process.env.RESEND_FROM || "Apex Media <onboarding@resend.dev>";

  if (!apiKey) {
    console.warn("RESEND_API_KEY non configurata: email non inviata.", {
      to: opts.to,
      subject: opts.subject,
    });
    return { inviata: false };
  }

  try {
    const risposta = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: mittente,
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
        ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
      }),
    });

    if (!risposta.ok) {
      const testo = await risposta.text();
      console.error("Resend errore:", risposta.status, testo);
      return { inviata: false };
    }

    return { inviata: true };
  } catch (err) {
    console.error("Resend errore:", (err as Error).message);
    return { inviata: false };
  }
}
