import type { Servizio } from "./servizi";

export type Caso = {
  id: string;
  ambiente: string;
  servizio: string;
  /** pagine servizio in cui compare il caso */
  chiavi: Servizio["chiave"][];
  /** percorsi in /public/foto. null = foto non ancora consegnata. */
  prima: string | null;
  dopo: string | null;
  /**
   * true = coppia dimostrativa generata, NON la foto di un lavoro fatto da Star Clean.
   * Si vede solo con sito.demo = true e sempre con la nota "immagini dimostrative".
   */
  esempio: boolean;
};

/*
 * Casi prima/dopo. Le tre coppie attuali sono immagini generate per la demo.
 * Mostrare un prima/dopo non reale come risultato di un proprio lavoro è pubblicità ingannevole:
 * prima di andare online vanno sostituite con foto vere degli interventi
 * (stessa inquadratura, formato quadrato) e con esempio: false.
 */
export const casi: Caso[] = [
  {
    id: "scale",
    ambiente: "Scale condominiali in marmo",
    servizio: "Pulizia e lucidatura",
    chiavi: ["civili", "pavimenti"],
    prima: "/foto/scale-prima.webp",
    dopo: "/foto/scale-dopo.webp",
    esempio: true,
  },
  {
    id: "cotto",
    ambiente: "Pavimento in cotto",
    servizio: "Lavaggio di fondo e ceratura",
    chiavi: ["pavimenti"],
    prima: "/foto/cotto-prima.webp",
    dopo: "/foto/cotto-dopo.webp",
    esempio: true,
  },
  {
    id: "gres",
    ambiente: "Pavimento in gres di un negozio",
    servizio: "Lavaggio con lavasciuga",
    chiavi: ["civili", "pavimenti"],
    prima: "/foto/gres-prima.webp",
    dopo: "/foto/gres-dopo.webp",
    esempio: true,
  },
];
