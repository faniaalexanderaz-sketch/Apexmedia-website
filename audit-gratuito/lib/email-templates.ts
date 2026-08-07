import type { Lead } from "./types";
import { LABEL_BUDGET, LABEL_HA_SITO, LABEL_SETTORE } from "./labels";

function rigaTabella(etichetta: string, valore: string): string {
  return `<tr>
    <td style="padding:6px 12px 6px 0;color:#6b7280;font-size:14px;white-space:nowrap;">${etichetta}</td>
    <td style="padding:6px 0;color:#111827;font-size:14px;font-weight:600;">${valore}</td>
  </tr>`;
}

function datiLeadHtml(lead: Lead): string {
  return `<table cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:16px;">
    ${rigaTabella("Nome", lead.nome)}
    ${rigaTabella("Attività", lead.nome_attivita)}
    ${rigaTabella("Telefono", lead.telefono)}
    ${rigaTabella("Email", lead.email)}
    ${rigaTabella("Ha un sito?", LABEL_HA_SITO[lead.ha_sito])}
    ${rigaTabella("Settore", LABEL_SETTORE[lead.settore])}
    ${rigaTabella("Budget mensile", LABEL_BUDGET[lead.budget])}
    ${rigaTabella("Punteggio", `${lead.punteggio} / 6`)}
  </table>`;
}

export function emailNotificaInterna(lead: Lead): { subject: string; html: string } {
  const urgente = lead.temperatura === "caldo";
  const subject = urgente
    ? `🔥 LEAD CALDO: ${lead.nome_attivita}`
    : `Nuovo lead: ${lead.nome_attivita}`;

  const html = `<div style="font-family:sans-serif;max-width:480px;">
    ${
      urgente
        ? `<p style="background:#FFD84D;color:#1B0B2E;font-weight:700;padding:10px 14px;border-radius:8px;font-size:15px;margin:0 0 16px;">Chiamare entro 2 ore</p>`
        : ""
    }
    <p style="color:#111827;font-size:15px;margin:0 0 4px;">Nuova richiesta di audit gratuito dalla landing page.</p>
    ${datiLeadHtml(lead)}
  </div>`;

  return { subject, html };
}

export function emailRingraziamentoLead(lead: Lead): { subject: string; html: string } {
  return {
    subject: "Grazie, abbiamo ricevuto la tua richiesta — Apex Media",
    html: `<div style="font-family:sans-serif;max-width:480px;">
      <p style="color:#111827;font-size:15px;">Ciao ${lead.nome},</p>
      <p style="color:#111827;font-size:15px;">
        grazie per aver richiesto l'audit gratuito per <strong>${lead.nome_attivita}</strong>.
        Abbiamo ricevuto i tuoi dati: ti ricontattiamo a breve.
      </p>
      <p style="color:#111827;font-size:15px;">— Il team Apex Media</p>
    </div>`,
  };
}
