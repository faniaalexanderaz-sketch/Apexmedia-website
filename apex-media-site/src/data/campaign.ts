/**
 * Pannello "Campagne" della home.
 *
 * ATTENZIONE: i numeri qui sotto sono SEGNAPOSTO, non risultati di un cliente.
 * Finché `isRealData` è false, sul sito il pannello è marcato come "Dati di esempio".
 * Quando inserisci i numeri di una campagna vera, metti `isRealData: true`:
 * solo allora compare l’etichetta "Dati di una campagna reale".
 */
export const campaign = {
  isRealData: false,
  realLabel: "Dati di una campagna reale",
  placeholderLabel: "Dati di esempio",

  /** Riga in alto nel pannello */
  name: "Report campagna",
  period: "Ultimi 30 giorni",

  /** Contatori in alto: value è il numero finale, decimals le cifre dopo la virgola */
  kpis: [
    { label: "Contatti ricevuti", value: 120, decimals: 0, prefix: "", suffix: "" },
    { label: "Costo per contatto", value: 4.5, decimals: 2, prefix: "", suffix: " €" },
    { label: "Spesa pubblicitaria", value: 540, decimals: 0, prefix: "", suffix: " €" },
  ],

  /** Grafico a linea: un valore per settimana (o per giorno), dal più vecchio al più recente */
  lineLabel: "Contatti a settimana",
  line: [4, 6, 5, 8, 7, 10, 9, 12, 11, 14, 15, 19],
  lineStart: "Sett. 1",
  lineEnd: "Sett. 12",

  /** Barre: da dove arrivano i contatti */
  barsLabel: "Contatti per canale",
  bars: [
    { label: "Google Ads", value: 52 },
    { label: "Meta Ads", value: 41 },
    { label: "Sito web", value: 18 },
    { label: "WhatsApp", value: 9 },
  ],
};
