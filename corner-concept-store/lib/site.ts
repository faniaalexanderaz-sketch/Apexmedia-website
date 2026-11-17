// Dati reali del negozio: un solo posto dove correggerli.

function siteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  // Su Vercel: in produzione il dominio del progetto, nelle anteprime l'indirizzo dell'anteprima stessa.
  if (process.env.VERCEL_ENV === "production" && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  const preview = process.env.VERCEL_BRANCH_URL ?? process.env.VERCEL_URL;
  if (preview) return `https://${preview}`;
  return "http://localhost:3000";
}

export const SITE = {
  name: "CORNER Concept Store",
  shortName: "CORNER",
  url: siteUrl(),
  slogan: "for modern gentlemen & not ordinary women",
  since: 2017,
  description:
    "Dal 2017, CORNER è un mix unico di ricerca, passione e stile: concept store in via Modena 15 ad Alessandria, con spedizione in tutta Italia in 24/48h.",
  address: {
    street: "via Modena 15",
    zip: "15121",
    city: "Alessandria",
    province: "AL",
    country: "IT",
  },
  phone: "+39 393 2025358",
  phoneHref: "tel:+393932025358",
  whatsappNumber: "393932025358",
  instagram: "cornerstoreal",
  instagramUrl: "https://www.instagram.com/cornerstoreal/",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=CORNER+Concept+Store%2C+via+Modena+15%2C+15121+Alessandria",
  hours: [
    { days: "Lunedì", slots: ["9:30–19:30"] },
    { days: "Da martedì a sabato", slots: ["9:30–12:30", "15:30–19:30"] },
    { days: "Domenica", slots: ["Chiuso"] },
  ],
} as const;

export function whatsappLink(text: string): string {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

export const PAYMENT_METHODS = ["Carta", "PayPal", "Satispay", "Klarna in 3 rate"] as const;
