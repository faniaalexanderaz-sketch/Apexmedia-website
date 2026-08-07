import type { Budget, HaSito, Settore, Temperatura } from "./types";

const SETTORI_FORTI: Settore[] = ["retail", "benessere", "servizi"];

export function calcolaPunteggio(input: {
  budget: Budget;
  haSito: HaSito;
  settore: Settore;
}): number {
  let punti = 0;

  if (input.budget === "800-1500" || input.budget === "over1500") {
    punti += 3;
  } else if (input.budget === "300-800") {
    punti += 2;
  }

  if (input.haSito === "no" || input.haSito === "non_funziona") {
    punti += 2;
  }

  if (SETTORI_FORTI.includes(input.settore)) {
    punti += 1;
  }

  return punti;
}

export function classificaTemperatura(punteggio: number): Temperatura {
  if (punteggio >= 4) return "caldo";
  if (punteggio >= 2) return "medio";
  return "freddo";
}
