import type { Budget, HaSito, LeadInput, Settore } from "./types";

const HA_SITO_VALIDI: HaSito[] = ["si", "no", "non_funziona"];
const SETTORI_VALIDI: Settore[] = ["ristorazione", "retail", "servizi", "benessere", "altro"];
const BUDGET_VALIDI: Budget[] = ["under300", "300-800", "800-1500", "over1500", "non_so"];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validaLead(body: unknown): { ok: true; dati: LeadInput } | { ok: false; errore: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, errore: "Dati non validi." };
  }

  const b = body as Record<string, unknown>;
  const nome = String(b.nome ?? "").trim();
  const telefono = String(b.telefono ?? "").trim();
  const email = String(b.email ?? "").trim();
  const nomeAttivita = String(b.nomeAttivita ?? "").trim();
  const haSito = String(b.haSito ?? "") as HaSito;
  const settore = String(b.settore ?? "") as Settore;
  const budget = String(b.budget ?? "") as Budget;

  if (nome.length < 2 || nome.length > 100) {
    return { ok: false, errore: "Inserisci il tuo nome." };
  }
  if (telefono.length < 6 || telefono.length > 30) {
    return { ok: false, errore: "Inserisci un numero di telefono valido." };
  }
  if (!EMAIL_REGEX.test(email)) {
    return { ok: false, errore: "Inserisci un'email valida." };
  }
  if (nomeAttivita.length < 2 || nomeAttivita.length > 120) {
    return { ok: false, errore: "Inserisci il nome della tua attività." };
  }
  if (!HA_SITO_VALIDI.includes(haSito)) {
    return { ok: false, errore: "Seleziona se hai già un sito." };
  }
  if (!SETTORI_VALIDI.includes(settore)) {
    return { ok: false, errore: "Seleziona il tipo di attività." };
  }
  if (!BUDGET_VALIDI.includes(budget)) {
    return { ok: false, errore: "Seleziona il budget indicativo." };
  }

  return {
    ok: true,
    dati: { nome, telefono, email, nomeAttivita, haSito, settore, budget },
  };
}
