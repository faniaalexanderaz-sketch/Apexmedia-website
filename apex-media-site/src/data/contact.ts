export const serviceOptions = [
  "Social media",
  "Video",
  "Pubblicità",
  "Sito web",
  "Pacchetto Starter",
  "Pacchetto Growth",
  "Pacchetto Domination",
  "Non lo so ancora",
] as const;

export const budgetOptions = ["meno di 500 €", "500-1.000 €", "oltre 1.000 €"] as const;

export type ServiceOption = (typeof serviceOptions)[number];
export type BudgetOption = (typeof budgetOptions)[number];
