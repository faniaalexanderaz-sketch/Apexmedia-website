import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { Lead, Stato } from "./types";

/**
 * Ripiego locale usato solo quando SUPABASE_URL / SUPABASE_ANON_KEY non sono
 * ancora configurate (es. sviluppo in locale). Scrive i lead in un file JSON.
 * ATTENZIONE: su Vercel il filesystem e' effimero, quindi in produzione va
 * sempre configurato Supabase — vedi README.md.
 */
const FILE_PATH = path.join(process.cwd(), ".data", "leads.json");

async function leggiFile(): Promise<Lead[]> {
  try {
    const contenuto = await readFile(FILE_PATH, "utf-8");
    return JSON.parse(contenuto) as Lead[];
  } catch {
    return [];
  }
}

async function scriviFile(lead: Lead[]): Promise<void> {
  await mkdir(path.dirname(FILE_PATH), { recursive: true });
  await writeFile(FILE_PATH, JSON.stringify(lead, null, 2), "utf-8");
}

export async function salvaLeadSuFile(
  riga: Omit<Lead, "id" | "created_at" | "stato" | "email_notifica_inviata" | "email_ringraziamento_inviata">
): Promise<Lead> {
  const lead: Lead = {
    ...riga,
    id: randomUUID(),
    created_at: new Date().toISOString(),
    stato: "da_chiamare",
    email_notifica_inviata: false,
    email_ringraziamento_inviata: false,
  };

  const tutti = await leggiFile();
  tutti.unshift(lead);
  await scriviFile(tutti);
  return lead;
}

export async function leggiLeadDaFile(): Promise<Lead[]> {
  return leggiFile();
}

export async function aggiornaStatoSuFile(id: string, stato: Stato): Promise<void> {
  const tutti = await leggiFile();
  const aggiornati = tutti.map((lead) => (lead.id === id ? { ...lead, stato } : lead));
  await scriviFile(aggiornati);
}
