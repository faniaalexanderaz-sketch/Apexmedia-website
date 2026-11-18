/**
 * Telefono 3D dell’hero: le richieste che arrivano a un’attività quando il marketing funziona.
 *
 * È una SIMULAZIONE, non il risultato di un cliente: sul sito è scritto sotto il telefono.
 * Il contatore parte da `start` e sale di uno a ogni notifica, ogni `every` secondi,
 * finché il telefono è in vista. Testi e ordine delle notifiche si cambiano qui.
 */
export const heroPhone = {
  label: "Richieste ricevute",
  period: "oggi",
  note: "Simulazione: così arrivano le richieste quando il marketing lavora per te.",
  start: 3,
  every: 2.1,
  notifications: [
    { kind: "messaggio", title: "WhatsApp", text: "Buongiorno, vorrei un preventivo per sabato" },
    { kind: "prenotazione", title: "Prenotazione online", text: "Sabato ore 10:30, confermata" },
    { kind: "chiamata", title: "Chiamata in arrivo", text: "Nuovo cliente dalla campagna Google" },
    { kind: "modulo", title: "Modulo dal sito", text: "Richiesta informazioni sui prezzi" },
    { kind: "messaggio", title: "Instagram", text: "Avete disponibilità questa settimana?" },
    { kind: "prenotazione", title: "Prenotazione online", text: "Martedì ore 18:00, confermata" },
  ],
} as const;

export type HeroNotification = (typeof heroPhone.notifications)[number];
