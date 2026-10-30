export type Plan = {
  id: string;
  name: string;
  price: number;
  highlight?: boolean;
  badge?: string;
  /** Sfondo della colonna: carta, bianco con striscia, inchiostro */
  tone: "paper" | "surface" | "ink";
  features: string[];
  cta: string;
  /** Valore della voce corrispondente nel form contatti */
  formValue: string;
};

export const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 300,
    tone: "paper",
    features: [
      "3 piattaforme gestite",
      "8 contenuti al mese",
      "Strategia base",
      "Ottimizzazione del profilo",
      "Supporto WhatsApp",
      "Report mensile",
    ],
    cta: "Scegli Starter",
    formValue: "Pacchetto Starter",
  },
  {
    id: "growth",
    name: "Growth",
    price: 500,
    tone: "surface",
    highlight: true,
    badge: "Il più scelto",
    features: [
      "3 piattaforme gestite",
      "14 contenuti al mese",
      "Strategia personalizzata",
      "Reel e TikTok studiati",
      "Supporto prioritario",
      "Report quindicinale",
    ],
    cta: "Scegli Growth",
    formValue: "Pacchetto Growth",
  },
  {
    id: "domination",
    name: "Domination",
    price: 700,
    tone: "ink",
    features: [
      "3 piattaforme gestite",
      "18 contenuti al mese",
      "ADS Meta e TikTok complete",
      "Funnel di conversione",
      "Shooting e direzione",
      "Landing page inclusa",
    ],
    cta: "Scegli Domination",
    formValue: "Pacchetto Domination",
  },
];

export const customPlanNote =
  "Ti serve qualcosa di diverso? Costruiamo un pacchetto su misura.";

export const formatPrice = (n: number) => `${n.toLocaleString("it-IT")} €`;
