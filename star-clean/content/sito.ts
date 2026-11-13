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

  telefono: { mostrato: "349 308 7310", href: "tel:+393493087310", segnaposto: false },

  // DA COMPILARE con i dati reali. Vuoto = "da inserire" in demo, nascosto online.
  legale: {
    ragioneSociale: "",
    // Come nel progetto Vercel esistente: si imposta con la variabile NEXT_PUBLIC_VAT (solo il numero).
    piva: process.env.NEXT_PUBLIC_VAT ?? "",
    sede: "",
    pec: "",
    // starclean.it appartiene a un'altra azienda: l'email vera va inserita qui quando arriva.
    email: "",
  },

  // Foto in /public/foto. L'hero ha due tagli: orizzontale su mobile, verticale accanto al titolo su desktop.
  fotoHero: { orizzontale: "/foto/hero.webp", verticale: "/foto/hero-verticale.webp" } as { orizzontale: string; verticale: string } | null,
  fotoFurgone: "/foto/furgone.webp" as string | null,

  zone: ["Alessandria", "Valenza", "Casale Monferrato", "Tortona", "Novi Ligure"],
} as const;

export function urlSito(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}
