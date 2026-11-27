export type Recensione = {
  nome: string;
  luogo: string;
  data: string;
  testo: string;
  /** true = testo di esempio scritto per la demo, NON una recensione vera. */
  esempio: boolean;
};

/*
 * ATTENZIONE: queste sono recensioni di ESEMPIO, servono solo a mostrare la sezione nella demo.
 * Compaiono solo con sito.demo = true e sempre con l'etichetta "esempio".
 * Prima di andare online vanno sostituite con le recensioni Google reali
 * (nome, data e testo copiati dalla scheda) e con esempio: false.
 * Pubblicare recensioni inventate come vere è una pratica commerciale scorretta.
 */
export const recensioni: Recensione[] = [
  {
    nome: "Laura B.",
    luogo: "Valenza",
    data: "ottobre 2026",
    testo:
      "Ho un negozio in centro con due vetrine grandi. Le puliscono ogni settimana prima dell'apertura e non si vede mai un alone.",
    esempio: true,
  },
  {
    nome: "Marco R.",
    luogo: "Tortona",
    data: "settembre 2026",
    testo:
      "Hanno lavato il pavimento del magazzino di sabato mattina. Lunedì abbiamo ripreso a lavorare senza perdere un'ora.",
    esempio: true,
  },
  {
    nome: "Giulia P.",
    luogo: "Alessandria",
    data: "luglio 2026",
    testo:
      "Ho scritto la sera, il giorno dopo avevo il preventivo. Dopo la cristallizzazione il marmo dell'ingresso è tornato lucido.",
    esempio: true,
  },
];
