/* Tipi condivisi tra server e client dello Studio Apex. */

export type StatoLavoro = "in_coda" | "in_lavorazione" | "da_guardare" | "fatto";
export type Ricorrenza = "mensile" | "una_tantum";

export type Cliente = { id: number; nome: string; settore: string; colore: string; sito: string | null; attivo: boolean; note: string };
export type Servizio = { id: number; clienteId: number; nome: string; importo: number; ricorrenza: Ricorrenza; dal: string; al: string | null };
export type Fattura = {
  id: number; clienteId: number; servizioId: number | null; mese: string | null;
  descrizione: string; importo: number; emessaIl: string; scadenza: string; pagataIl: string | null;
};
/** `auto: true` = riga calcolata dal tracciamento del sito (click, prenotazioni, spesa), non modificabile qui. */
export type Campagna = { id: number; clienteId: number; mese: string; canale: string; spesa: number; contatti: number; ricavo: number | null; auto?: boolean };
export type Lavoro = {
  id: number; agente: string; clienteId: number | null; titolo: string; brief: string;
  stato: StatoLavoro; risultato: string | null; revisione: string | null; creatoIl: string; aggiornatoIl: string;
  /** YYYY-MM-DD; se c'è, l'agente te la ricorda quando si avvicina */
  scadenza: string | null;
};
export type Regola = { id: number; testo: string; agente: string | null; creatoIl: string };

export type Dati = {
  /** true = nessun database collegato: dati di esempio che spariscono al riavvio */
  demo: boolean;
  /** true = ANTHROPIC_API_KEY presente: gli agenti scrivono davvero */
  ai: boolean;
  oggi: string; // YYYY-MM-DD, fuso Europe/Rome
  ora: number; // 0-23, per il saluto
  obiettivoMese: number;
  clienti: Cliente[];
  servizi: Servizio[];
  fatture: Fattura[];
  campagne: Campagna[];
  lavori: Lavoro[];
  regole: Regola[];
};

export type Risposta = { ok: true; dati: Dati; nuovoId?: number } | { ok: false; errore: string };

export const CANALI = ["Google Ads", "Meta Ads", "TikTok Ads", "Altro"] as const;
export const COLORI_CLIENTE = ["#5b2eff", "#2f6bff", "#17b26a", "#ff8a3d", "#e5484d", "#0fb5ae", "#d6409f", "#8a6d1f"] as const;
export const SERVIZI_SUGGERITI = ["Gestione social", "Google Ads", "Meta Ads", "Sito web", "Manutenzione sito", "Video e reel", "Shooting foto"] as const;
