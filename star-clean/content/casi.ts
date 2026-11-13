import type { Servizio } from "./servizi";

export type Caso = {
  id: string;
  ambiente: string;
  servizio: string;
  chiave: Servizio["chiave"];
  /** percorsi in /public/foto. null = foto reale non ancora consegnata. */
  prima: string | null;
  dopo: string | null;
};

/*
 * Casi prima/dopo. Quando arrivano le foto reali:
 * 1. salvale in public/foto/ (stessa inquadratura, stesso formato 4:3)
 * 2. metti il percorso in `prima` e `dopo`, es. "/foto/scala-prima.jpg"
 * 3. correggi ambiente e servizio con quelli veri
 */
export const casi: Caso[] = [
  { id: "scala", ambiente: "Scala condominiale", servizio: "Pulizia civile", chiave: "civili", prima: null, dopo: null },
  { id: "capannone", ambiente: "Capannone con pavimento in cemento", servizio: "Pulizia industriale con lavasciuga", chiave: "industriali", prima: null, dopo: null },
  { id: "androne", ambiente: "Androne in marmo", servizio: "Lavaggio di fondo con monospazzola", chiave: "pavimenti", prima: null, dopo: null },
  { id: "ufficio", ambiente: "Ufficio con pavimento in gres", servizio: "Pulizia civile", chiave: "civili", prima: null, dopo: null },
];
