import { SERVIZI_FORM, type Lead } from "./lead";

const chiave = process.env.RESEND_API_KEY;
// OWNER_EMAIL ed EMAIL_FROM sono i nomi usati dal progetto Vercel già esistente: valgono come riserva.
const destinatario = process.env.LEAD_NOTIFY_EMAIL ?? process.env.OWNER_EMAIL;
// Finché il dominio non è verificato su Resend si può usare onboarding@resend.dev.
const mittente = process.env.RESEND_FROM ?? process.env.EMAIL_FROM ?? "Star Clean <onboarding@resend.dev>";

export const emailConfigurata = Boolean(chiave && destinatario);

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function notificaLead(lead: Lead, id: number | null): Promise<void> {
  if (!chiave || !destinatario) throw new Error("Resend non configurato");

  const servizio = SERVIZI_FORM.find((s) => s.valore === lead.servizio)!.nome;
  const utm = Object.entries(lead.utm).map(([k, v]) => `${k}=${v}`).join(", ");
  const righe: [string, string][] = [
    ["Servizio", servizio],
    ["Comune", lead.comune],
    ["Metri quadri", lead.mq],
    ["Nome", lead.nome],
    ["Telefono", lead.telefono],
    ["Email", lead.email ?? "non indicata"],
    ["Pagina", lead.pagina ?? "non rilevata"],
    ["Provenienza", utm || "diretta"],
  ];
  if (id !== null) righe.push(["Numero richiesta", String(id)]);

  const tel = lead.telefono.replace(/[^\d+]/g, "");
  const html = `
    <div style="font-family:Arial,sans-serif;color:#083D4F;font-size:16px;line-height:1.5">
      <p style="font-size:20px;font-weight:bold;margin:0 0 16px">Nuova richiesta di preventivo</p>
      <table cellpadding="0" cellspacing="0" style="border-collapse:collapse">
        ${righe
          .map(
            ([k, v]) =>
              `<tr><td style="padding:6px 24px 6px 0;color:#4d6f7b">${esc(k)}</td><td style="padding:6px 0;font-weight:bold">${esc(v)}</td></tr>`,
          )
          .join("")}
      </table>
      <p style="margin:24px 0 0"><a href="tel:${esc(tel)}" style="background:#FFC72C;color:#083D4F;font-weight:bold;text-decoration:none;padding:12px 20px;border-radius:4px;display:inline-block">Chiama ${esc(lead.nome)}</a></p>
      <p style="margin:16px 0 0;color:#4d6f7b">Promessa sul sito: risposta entro 24 ore.</p>
    </div>`;

  const risposta = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${chiave}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: mittente,
      to: destinatario.split(",").map((e) => e.trim()),
      reply_to: lead.email ?? undefined,
      subject: `Preventivo ${servizio}, ${lead.comune}, ${lead.nome}`,
      html,
      text: righe.map(([k, v]) => `${k}: ${v}`).join("\n"),
    }),
  });
  if (!risposta.ok) throw new Error(`Resend ${risposta.status}: ${await risposta.text()}`);
}
