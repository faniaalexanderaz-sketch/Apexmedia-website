import type { Budget, HaSito, Settore, Stato, Temperatura } from "./types";

export const LABEL_HA_SITO: Record<HaSito, string> = {
  si: "Sì, ho già un sito",
  no: "No, non ho un sito",
  non_funziona: "Sì, ma non funziona bene",
};

export const LABEL_SETTORE: Record<Settore, string> = {
  ristorazione: "Ristorazione",
  retail: "Retail / negozio",
  servizi: "Servizi",
  benessere: "Benessere",
  altro: "Altro",
};

export const LABEL_BUDGET: Record<Budget, string> = {
  under300: "Meno di 300€",
  "300-800": "300€ – 800€",
  "800-1500": "800€ – 1.500€",
  over1500: "Più di 1.500€",
  non_so: "Non so",
};

export const LABEL_TEMPERATURA: Record<Temperatura, string> = {
  caldo: "Caldo",
  medio: "Medio",
  freddo: "Freddo",
};

export const LABEL_STATO: Record<Stato, string> = {
  da_chiamare: "Da chiamare",
  contattato: "Contattato",
  chiuso: "Chiuso",
};
