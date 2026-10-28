export type Service = {
  id: string;
  name: string;
  description: string;
  includes: string[];
  /** Valore della voce corrispondente nel form contatti */
  formValue: string;
};

export const services: Service[] = [
  {
    id: "social",
    name: "Social media",
    description:
      "Piano editoriale, pubblicazione e gestione dei profili. Ti diciamo cosa pubblicare e lo facciamo noi.",
    includes: ["strategia mensile", "testi e grafiche", "report"],
    formValue: "Social media",
  },
  {
    id: "video",
    name: "Video",
    description:
      "Reel e TikTok girati da noi nella tua attività, con te o il tuo staff davanti alla camera.",
    includes: ["idee e copione", "riprese in sede", "montaggio"],
    formValue: "Video",
  },
  {
    id: "ads",
    name: "Pubblicità",
    description:
      "Campagne su Meta, Google e TikTok per portare richieste, prenotazioni e chiamate.",
    includes: ["tracciamento", "creatività", "ottimizzazione continua"],
    formValue: "Pubblicità",
  },
  {
    id: "web",
    name: "Siti web",
    description:
      "Siti e landing page veloci, fatti per farti contattare o prenotare. Come quelli qui sopra.",
    includes: ["design", "prenotazioni o WhatsApp", "SEO di base"],
    formValue: "Sito web",
  },
];

export const methodSteps = [
  { n: "01", title: "Call gratuita", text: "Capiamo la tua attività e dove perdi clienti." },
  { n: "02", title: "Proposta", text: "Ti mandiamo un piano scritto, con costi chiari." },
  { n: "03", title: "Produzione", text: "Scriviamo, giriamo, lanciamo. Tu fai il tuo lavoro." },
  { n: "04", title: "Report", text: "Ti mostriamo i numeri, spiegati semplici." },
] as const;

export const methodNumbers = [
  { value: "30", label: "attività seguite" },
  { value: "4", label: "canali: Meta, Google, TikTok, web" },
  { value: "1", label: "team, dalla strategia al montaggio" },
] as const;
