/**
 * Siti mostrati nel MacBook della home, nell’ordine in cui scorrono.
 *
 * `image` è uno screenshot a pagina intera da mettere in /public/showcase/ con lo stesso nome
 * (JPG, PNG o WebP, largo almeno 1600px).
 * Finché il file non c’è, viene usato lo screenshot del portfolio indicato in `fallback`
 * (lo slug del cliente in src/data/portfolio.ts).
 * `width` e `height` sono facoltativi: servono solo a riservare lo spazio giusto prima del caricamento.
 */
export type ShowcaseItem = {
  image: string;
  name: string;
  work: string;
  url: string;
  fallback?: string;
  width?: number;
  height?: number;
};

export const showcase: ShowcaseItem[] = [
  {
    image: "/showcase/sito-1.jpg",
    name: "Bagnarino Coworking",
    work: "Sito con prenotazione online delle scrivanie e card fedeltà digitale",
    url: "https://bagnarinocoworking.it",
    fallback: "bagnarino",
  },
  {
    image: "/showcase/sito-2.jpg",
    name: "Essenza d’Oriente",
    work: "Sito con listino e prenotazione online, campagne Google e Meta",
    url: "https://essenzadoriente.it",
    fallback: "essenza",
  },
  {
    image: "/showcase/sito-3.jpg",
    name: "Antica Fioreria del Centro",
    work: "E-commerce con spedizione in tutta Italia e gestione dei social",
    url: "https://anticafioreriadelcentro.it",
    fallback: "fioreria",
  },
  {
    image: "/showcase/sito-4.jpg",
    name: "Atto Unico",
    work: "Sito per il corso di recitazione con iscrizioni online",
    url: "https://attounicojovifed.it",
    fallback: "attounico",
  },
];
