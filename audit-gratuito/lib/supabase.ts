import type { Lead, LeadInput, Stato, Temperatura } from "./types";
import { calcolaPunteggio, classificaTemperatura } from "./scoring";
import { salvaLeadSuFile, leggiLeadDaFile, aggiornaStatoSuFile } from "./fallback-storage";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function supabaseConfigurato(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

function adminConfigurato(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Salva un nuovo lead. Usa Supabase (chiave anon, insert-only via RLS) quando
 * configurato; altrimenti scrive su file locale, cosi' il modulo funziona
 * anche in sviluppo senza credenziali.
 */
export async function creaLead(
  input: LeadInput
): Promise<{ lead: Lead; salvatoSuSupabase: boolean }> {
  const punteggio = calcolaPunteggio(input);
  const temperatura = classificaTemperatura(punteggio);

  const riga = {
    nome: input.nome,
    telefono: input.telefono,
    email: input.email,
    nome_attivita: input.nomeAttivita,
    ha_sito: input.haSito,
    settore: input.settore,
    budget: input.budget,
    punteggio,
    temperatura,
  };

  if (!supabaseConfigurato()) {
    const lead = await salvaLeadSuFile(riga);
    return { lead, salvatoSuSupabase: false };
  }

  const risposta = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY as string,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(riga),
  });

  if (!risposta.ok) {
    const testo = await risposta.text();
    throw new Error(`Errore salvataggio Supabase (${risposta.status}): ${testo}`);
  }

  const righe = (await risposta.json()) as Lead[];
  return { lead: righe[0], salvatoSuSupabase: true };
}

export async function elencaLead(): Promise<Lead[]> {
  if (!adminConfigurato()) {
    return leggiLeadDaFile();
  }

  const risposta = await fetch(
    `${SUPABASE_URL}/rest/v1/leads?select=*&order=created_at.desc`,
    {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY as string,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      cache: "no-store",
    }
  );

  if (!risposta.ok) {
    const testo = await risposta.text();
    throw new Error(`Errore lettura Supabase (${risposta.status}): ${testo}`);
  }

  return (await risposta.json()) as Lead[];
}

export async function aggiornaStatoLead(id: string, stato: Stato): Promise<void> {
  if (!adminConfigurato()) {
    await aggiornaStatoSuFile(id, stato);
    return;
  }

  const risposta = await fetch(`${SUPABASE_URL}/rest/v1/leads?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY as string,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ stato }),
  });

  if (!risposta.ok) {
    const testo = await risposta.text();
    throw new Error(`Errore aggiornamento Supabase (${risposta.status}): ${testo}`);
  }
}

export async function segnaEmailInviata(
  id: string,
  campo: "email_notifica_inviata" | "email_ringraziamento_inviata"
): Promise<void> {
  if (!adminConfigurato()) return;

  await fetch(`${SUPABASE_URL}/rest/v1/leads?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY as string,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ [campo]: true }),
  }).catch(() => {
    /* non bloccante: il lead resta comunque salvato */
  });
}

export function usaAdminSupabase(): boolean {
  return adminConfigurato();
}
