export const site = {
  name: "Apex Media",
  domain: "infoapex.eu",
  url: "https://infoapex.eu",
  city: "Alessandria",
  region: "Piemonte",
  address: "Via Scazzola 17",
  /**
   * SEGNAPOSTO: numero provvisorio di 11 cifre, NON è la partita IVA vera.
   * La cifra di controllo è volutamente sbagliata, così non può coincidere con quella di un’altra azienda.
   * Va sostituito con la partita IVA reale.
   */
  vat: "37833969281",
  whatsappNumber: "393515940685",
  whatsappDisplay: "+39 351 594 0685",
  whatsappUrl: "https://wa.me/393515940685",
  email: "studio@infoapex.eu",
  instagramUrl: "https://www.instagram.com/apexmedia.it",
  instagramHandle: "@apexmedia.it",
  responseTime: "Rispondiamo entro 24 ore",
  founders: ["Alex Fania", "Federico Delfino"],
  year: 2026,
} as const;

export const navLinks = [
  { label: "Lavori", href: "/#lavori" },
  { label: "Servizi", href: "/#servizi" },
  { label: "Performance", href: "/#performance" },
  { label: "Metodo", href: "/#metodo" },
  { label: "Pacchetti", href: "/#pacchetti" },
  { label: "FAQ", href: "/#faq" },
] as const;
