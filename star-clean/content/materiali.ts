import type { NomeIcona } from "@/components/Icona";

export type IdMateriale = "marmo" | "cementine" | "cemento" | "cotto" | "parquet";

export type Materiale = {
  /** usato come ancora (#marmo) e nel link al modulo (?materiale=marmo) */
  id: IdMateriale;
  nome: string;
  /** nome corto per il modulo */
  breve: string;
  icona: NomeIcona;
  trattamento: string;
  risultato: string;
  descrizione: string;
};

/* Materiali e trattamenti dal foglio del titolare. */
export const materiali: Materiale[] = [
  {
    id: "marmo",
    nome: "Graniglia, marmettone e marmo",
    breve: "Marmo e graniglia",
    icona: "marmo",
    trattamento: "Cristallizzazione",
    risultato: "Superficie lucida e più resistente al calpestio.",
    descrizione:
      "Una lavorazione a macchina che indurisce e lucida lo strato in superficie. Il pavimento torna a riflettere la luce.",
  },
  {
    id: "cementine",
    nome: "Cementine",
    breve: "Cementine",
    icona: "cementine",
    trattamento: "Acrilico metallizzato",
    risultato: "Disegni ravvivati e una protezione lucida.",
    descrizione:
      "Dopo la pulizia stendiamo un trattamento acrilico metallizzato che protegge le cementine e fa risaltare i disegni.",
  },
  {
    id: "cemento",
    nome: "Cemento",
    breve: "Cemento",
    icona: "cemento",
    // Confermato dal titolare: resine epossidiche (sul foglio "eposilici"), lasciano uno strato lucido sul cemento.
    trattamento: "Vetrificazione con resine epossidiche",
    risultato: "Superficie compatta che non fa più polvere.",
    descrizione:
      "Combiniamo resine epossidiche per creare uno strato duro e lucido sopra il cemento, adatto anche a garage e capannoni.",
  },
  {
    id: "cotto",
    nome: "Cotto",
    breve: "Cotto",
    icona: "cotto",
    trattamento: "Lavaggio a macchina e lucidatura",
    risultato: "Il colore caldo del cotto torna visibile.",
    descrizione: "Laviamo a fondo con la macchina per togliere lo sporco entrato nei pori, poi lucidiamo.",
  },
  {
    id: "parquet",
    nome: "Parquet",
    breve: "Parquet",
    icona: "parquet",
    trattamento: "Pulizia di base e lucidatura",
    risultato: "Legno pulito e di nuovo luminoso.",
    descrizione: "Una pulizia di fondo adatta al legno, seguita dalla lucidatura.",
  },
];
