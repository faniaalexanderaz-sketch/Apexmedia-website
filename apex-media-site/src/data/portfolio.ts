export type Shot = { src: string; width: number; height: number };

export type PortfolioItem = {
  slug: string;
  name: string;
  sector: string;
  work: string;
  url: string;
  domain: string;
  /** Riga sotto la cornice nell’hero */
  caption: string;
  shots: { desktop: Shot; mobile: Shot; full: Shot };
};

const shot = (slug: string): PortfolioItem["shots"] => ({
  desktop: { src: `/work/${slug}-desktop.webp`, width: 1600, height: 1000 },
  mobile: { src: `/work/${slug}-mobile.webp`, width: 640, height: 1385 },
  full: { src: `/work/${slug}-full.webp`, width: 1200, height: 0 },
});

export const portfolio: PortfolioItem[] = [
  {
    slug: "bagnarino",
    name: "Bagnarino Coworking",
    sector: "Coworking nel centro di Alessandria",
    work: "Sito con prenotazione online delle scrivanie e card fedeltà digitale",
    url: "https://bagnarinocoworking.it",
    domain: "bagnarinocoworking.it",
    caption: "bagnarinocoworking.it — sito e prenotazioni online",
    shots: { ...shot("bagnarino"), full: { src: "/work/bagnarino-full.webp", width: 1200, height: 9668 } },
  },
  {
    slug: "essenza",
    name: "Essenza d’Oriente",
    sector: "Centro olistico e massaggi",
    work: "Sito con listino e prenotazione online, campagne Google e Meta",
    url: "https://essenzadoriente.it",
    domain: "essenzadoriente.it",
    caption: "essenzadoriente.it — sito, prenotazioni e campagne",
    shots: { ...shot("essenza"), full: { src: "/work/essenza-full.webp", width: 1200, height: 5869 } },
  },
  {
    slug: "fioreria",
    name: "Antica Fioreria del Centro",
    sector: "Composizioni floreali artificiali, bottega dal 1953",
    work: "E-commerce con spedizione in tutta Italia e gestione dei social",
    url: "https://anticafioreriadelcentro.it",
    domain: "anticafioreriadelcentro.it",
    caption: "anticafioreriadelcentro.it — e-commerce e social",
    shots: { ...shot("fioreria"), full: { src: "/work/fioreria-full.webp", width: 1200, height: 6712 } },
  },
  {
    slug: "attounico",
    name: "Atto Unico",
    sector: "Compagnia teatrale",
    work: "Sito per il corso di recitazione con iscrizioni online",
    url: "https://attounicojovifed.it",
    domain: "attounicojovifed.it",
    caption: "attounicojovifed.it — sito e iscrizioni al corso",
    shots: { ...shot("attounico"), full: { src: "/work/attounico-full.webp", width: 1200, height: 5579 } },
  },
  {
    slug: "starclean",
    name: "Star Clean",
    sector: "Impresa di pulizie civili e industriali",
    work: "Sito orientato ai preventivi, con richiesta in tre domande e confronto prima e dopo",
    url: "https://star-clean-gamma.vercel.app",
    domain: "star-clean-gamma.vercel.app",
    caption: "Star Clean — sito e richieste di preventivo",
    shots: { ...shot("starclean"), full: { src: "/work/starclean-full.webp", width: 1200, height: 6686 } },
  },
];
