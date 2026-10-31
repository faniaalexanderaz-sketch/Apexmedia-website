export type Accent = "blu" | "giallo" | "viola" | "ink" | "tricolor";

export type Service = {
  id: string;
  name: string;
  /** Colore del servizio nella sezione "Cosa facciamo" */
  accent: Accent;
  tagline: string;
  description: string;
  /** Cosa facciamo, in concreto */
  includes: string[];
  /** Cosa ricevi tu */
  deliverables: string[];
  /** Strumenti che usiamo */
  tools: string[];
  /** Valore della voce corrispondente nel form contatti */
  formValue: string;
};

export const services: Service[] = [
  {
    id: "social",
    name: "Social media marketing",
    accent: "blu",
    tagline: "Gestione professionale dei social media: strategia, contenuti e community per far crescere la tua attività.",
    description:
      "Strategia, piano editoriale, grafiche, testi, pubblicazione e risposte. Ti diciamo cosa pubblicare, lo prepariamo noi e tu approvi dal telefono.",
    includes: [
      "Strategia mensile: obiettivo, pubblico, tono di voce",
      "Piano editoriale con date, formati e temi",
      "Grafiche su misura, coerenti con il tuo marchio",
      "Testi, didascalie, hashtag e call to action",
      "Pubblicazione e gestione di commenti e messaggi",
      "Ottimizzazione del profilo: bio, highlight, link",
    ],
    deliverables: ["Calendario del mese da approvare", "Report con numeri spiegati semplici", "Supporto WhatsApp"],
    tools: ["Meta Business Suite", "Photoshop", "Illustrator", "Canva Pro"],
    formValue: "Social media",
  },
  {
    id: "video",
    name: "Video marketing",
    accent: "giallo",
    tagline: "Produzione video per i social: Reel, TikTok e Shorts girati nella tua attività, con te davanti alla camera.",
    description:
      "Veniamo da te con attrezzatura e idee già pronte. In mezza giornata giriamo i contenuti di settimane. Montaggio, sottotitoli, musica e formati per ogni piattaforma li facciamo noi.",
    includes: [
      "Idee e copione prima di ogni riprese",
      "Riprese in sede, luci e audio compresi",
      "Montaggio con ritmo da social, sottotitoli e grafiche",
      "Versioni verticali per Reel, TikTok e Shorts",
      "Coaching davanti alla camera per te e il tuo staff",
      "Archivio ordinato dei contenuti girati",
    ],
    deliverables: ["Video pronti da pubblicare", "Copertine e titoli", "Clip extra per le campagne"],
    tools: ["Premiere Pro", "After Effects", "CapCut", "DaVinci Resolve"],
    formValue: "Video",
  },
  {
    id: "ads",
    name: "Pubblicità online",
    accent: "viola",
    tagline: "Campagne Google Ads, Meta Ads e TikTok Ads ottimizzate per generare richieste, prenotazioni e chiamate.",
    description:
      "Impostiamo il tracciamento prima di spendere un euro: chiamate, messaggi WhatsApp e prenotazioni contati uno a uno. Poi ottimizziamo ogni settimana su quello che converte.",
    includes: [
      "Ricerca di parole chiave e pubblici per la tua zona",
      "Campagne Google Search, Meta e TikTok",
      "Creatività e testi in più versioni, da testare",
      "Tracciamento di chiamate, WhatsApp e prenotazioni",
      "Ottimizzazione settimanale di offerte, budget e pubblici",
      "Pagine di arrivo fatte per convertire",
    ],
    deliverables: ["Report chiaro: cosa è stato speso e cosa è arrivato", "Accesso ai tuoi account pubblicitari", "Piano delle prossime mosse"],
    tools: ["Google Ads", "Meta Ads Manager", "TikTok Ads", "Google Analytics 4", "Tag Manager"],
    formValue: "Pubblicità",
  },
  {
    id: "web",
    name: "Siti web e app",
    accent: "ink",
    tagline: "Realizzazione di siti web, web app e applicazioni native per App Store e Play Store, progettati per trasformare le visite in contatti.",
    description:
      "Come quelli che vedi nel portfolio: design su misura, prenotazioni online o WhatsApp in un tocco, testi scritti per Google e per chi legge dal telefono. E quando un sito non basta, sviluppiamo web app e app native con Xcode, pubblicate su App Store e Play Store.",
    includes: [
      "Design su misura, niente template",
      "Prenotazioni online, listini, e-commerce",
      "WhatsApp e chiamata sempre a portata di pollice",
      "Testi, foto e struttura pensati per convertire",
      "SEO di base e velocità da primo posto",
      "Web app: gestionali, prenotazioni, aree riservate",
      "App native per iPhone e Android, sviluppate con Xcode e pubblicate su App Store e Play Store",
      "Hosting, dominio e manutenzione",
    ],
    deliverables: ["Sito o app pronti e online", "Accessi e guida per aggiornarli", "Statistiche delle visite e dei contatti"],
    tools: ["Next.js", "Xcode", "Swift", "Figma", "Vercel", "Search Console"],
    formValue: "Sito web",
  },
  {
    id: "brand",
    name: "Brand identity",
    accent: "tricolor",
    tagline: "Brand identity completa: naming, logo, immagine coordinata e materiali di stampa per la tua attività.",
    description:
      "Se parti da zero o vuoi rifare tutto, costruiamo il brand completo: logo, colori, font, tono di voce, e poi biglietti, insegna, menu, volantini, vetrofanie. Tutto coerente, dal profilo Instagram al bancone.",
    includes: [
      "Naming e logo, con varianti per ogni uso",
      "Identità visiva: colori, font, regole d’uso",
      "Materiali stampati: biglietti, menu, flyer, insegne, vetrofanie",
      "Template per social e presentazioni",
      "Foto e video di lancio",
      "Manuale del marchio in PDF",
    ],
    deliverables: ["File sorgente e per la stampa", "Manuale del marchio", "Kit social pronto"],
    tools: ["Illustrator", "Photoshop", "InDesign", "Figma"],
    formValue: "Non lo so ancora",
  },
  {
    id: "analisi",
    name: "Analisi e report",
    accent: "ink",
    tagline: "Analisi di mercato, studio dei competitor e report periodici: ogni decisione parte dai dati.",
    description:
      "Ogni progetto parte da un’analisi scritta: cosa fanno i tuoi concorrenti in zona, cosa cercano le persone, dove perdi clienti oggi. E ogni mese ricevi un report che si capisce senza essere del mestiere.",
    includes: [
      "Analisi dei concorrenti: social, sito, recensioni, offerte",
      "Ricerca di cosa cerca la gente nella tua zona",
      "Audit del tuo profilo e del tuo sito",
      "Obiettivi misurabili e priorità",
      "Report mensile o quindicinale",
      "Riunione di revisione e prossime mosse",
    ],
    deliverables: ["Documento di analisi iniziale", "Report periodico", "Piano delle priorità"],
    tools: ["Google Analytics 4", "Search Console", "Meta Insights", "Looker Studio"],
    formValue: "Non lo so ancora",
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
