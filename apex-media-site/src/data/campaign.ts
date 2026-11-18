/**
 * Sezione "Ogni euro investito, misurato." della home.
 *
 * ATTENZIONE: i numeri qui sotto sono SEGNAPOSTO, non risultati di un cliente.
 * Finché `isRealData` è false, in fondo alla sezione compare "Dati di esempio".
 * Quando inserisci i numeri di una campagna vera, metti `isRealData: true`:
 * solo allora la scritta diventa "Dati di una campagna reale".
 *
 * I tre blocchi sono coerenti tra loro: la somma delle settimane e quella dei canali
 * fanno i "Contatti ricevuti", e spesa ÷ contatti fa il "Costo per contatto".
 */
export const campaign = {
  isRealData: false,
  realLabel: "Dati di una campagna reale",
  placeholderLabel: "Dati di esempio",

  period: "Ultime 12 settimane",

  /** I tre numeri grandi: value è il numero finale, decimals le cifre dopo la virgola */
  kpis: [
    { label: "Contatti ricevuti", value: 120, decimals: 0, suffix: "" },
    { label: "Costo per contatto", value: 4.5, decimals: 2, suffix: " €" },
    { label: "Spesa pubblicitaria", value: 540, decimals: 0, suffix: " €" },
  ],

  /** Grafico 3D: contatti di ogni settimana, dalla più vecchia alla più recente (una colonna ciascuna) */
  weeksLabel: "Contatti a settimana",
  weeks: [4, 6, 5, 8, 7, 10, 9, 12, 11, 14, 15, 19],

  /** Blocchi impilati: da dove arrivano i contatti, dal canale più grande (in basso) al più piccolo */
  channelsLabel: "Contatti per canale",
  channels: [
    { label: "Google Ads", value: 52 },
    { label: "Meta Ads", value: 41 },
    { label: "Sito web", value: 18 },
    { label: "WhatsApp", value: 9 },
  ],
};
