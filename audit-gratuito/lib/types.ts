export type HaSito = "si" | "no" | "non_funziona";
export type Settore = "ristorazione" | "retail" | "servizi" | "benessere" | "altro";
export type Budget = "under300" | "300-800" | "800-1500" | "over1500" | "non_so";
export type Temperatura = "caldo" | "medio" | "freddo";
export type Stato = "da_chiamare" | "contattato" | "chiuso";

export interface LeadInput {
  nome: string;
  telefono: string;
  email: string;
  nomeAttivita: string;
  haSito: HaSito;
  settore: Settore;
  budget: Budget;
}

export interface Lead {
  id: string;
  created_at: string;
  nome: string;
  telefono: string;
  email: string;
  nome_attivita: string;
  ha_sito: HaSito;
  settore: Settore;
  budget: Budget;
  punteggio: number;
  temperatura: Temperatura;
  stato: Stato;
  email_notifica_inviata: boolean;
  email_ringraziamento_inviata: boolean;
}
