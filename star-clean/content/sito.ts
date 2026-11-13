/**
 * Dati unici del sito. Tutto quello che cambia tra demo e sito vero sta qui.
 * I campi vuoti NON vanno inventati: finché `demo` è true compaiono come "da inserire".
 */
export const sito = {
  /**
   * true  = demo: sito non indicizzato, recensioni di esempio visibili con etichetta.
   * false = sito vero: le recensioni di esempio spariscono e Google può indicizzare.
   */
  demo: true,

  nome: "Star Clean",
  titolare: "Jonathan Germanò",
  anniAttivita: 30,
  oreRisposta: 24,

  // DA SOSTITUIRE con il numero vero (anche in formato internazionale per il link).
  telefono: { mostrato: "0131 000000", href: "tel:+390131000000", segnaposto: true },

  // DA COMPILARE con i dati reali. Vuoto = "da inserire" in demo, nascosto online.
  legale: {
    ragioneSociale: "",
    piva: "",
    sede: "",
    pec: "",
    email: "",
  },

  zone: ["Alessandria", "Valenza", "Casale Monferrato", "Tortona", "Novi Ligure"],
} as const;

export function urlSito(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}
