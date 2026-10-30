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

/** Pacchetto su misura per chi parte da zero o vuole rifare tutto */
export const brandPlan = {
  id: "brand",
  kicker: "Su misura",
  name: "Brand da zero",
  title: "Brand identity e lancio: per chi vuole costruire un marchio, non solo una pagina.",
  text: "Nome, logo, identità visiva, materiali stampati, sito, social e campagna di lancio: un unico progetto, un unico team, un preventivo scritto dopo la call.",
  features: [
    "Analisi di mercato e dei concorrenti",
    "Naming, logo e identità visiva",
    "Stampe: biglietti, insegna, menu, volantini",
    "Sito web con prenotazioni o e-commerce",
    "Profili social aperti e impostati",
    "Shooting foto e video di lancio",
    "Campagna di lancio su Meta e Google",
    "Gestione dei primi mesi",
  ],
  cta: "Parliamo del tuo brand",
  formValue: "Non lo so ancora",
};

export const formatPrice = (n: number) => `${n.toLocaleString("it-IT")} €`;
