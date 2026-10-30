/**
 * Sezione "Performance": tre blocchi (pubblicità, funnel, social).
 * Nessun numero o risultato: solo cosa facciamo e come.
 */

export const performanceIntro = {
  label: "Performance",
  title: "Siamo un’agenzia di performance marketing.",
  text: "Non ci interessa quante persone vedono un post. Ci interessa quante ti scrivono, prenotano o entrano in negozio. Ogni campagna, video e pagina è costruita per quello.",
};

export const adsBlock = {
  kicker: "Pubblicità su Google, Meta e TikTok",
  title: "Gestione campagne Google Ads e Meta Ads orientate alle conversioni.",
  text: "Su Google intercettiamo chi sta già cercando il tuo servizio in zona. Su Meta e TikTok lo mostriamo a chi non ti conosce ancora. In entrambi i casi misuriamo chiamate, messaggi e prenotazioni, non le visualizzazioni.",
  /** Cosa ottimizziamo ogni settimana sulle campagne attive */
  checklist: [
    { what: "Parole chiave e termini di ricerca", how: "Teniamo quelle che portano richieste, escludiamo quelle che bruciano budget." },
    { what: "Offerte e budget", how: "Spostiamo i soldi sulle campagne e sugli orari che convertono di più." },
    { what: "Creatività e testi", how: "Proviamo più versioni e teniamo quelle che fanno agire." },
    { what: "Pagina di arrivo", how: "Chi clicca deve poter prenotare o scriverti in pochi secondi." },
    { what: "Tracciamento", how: "Ogni chiamata, messaggio WhatsApp e prenotazione viene contata e attribuita." },
  ],
  platforms: ["Google Ads", "Meta Ads", "TikTok Ads"],
};

export const funnelBlock = {
  kicker: "Funnel personalizzato",
  title: "Funnel di marketing personalizzato per la tua attività.",
  text: "Un funnel è la strada che una persona fa da quando ti scopre a quando diventa cliente e poi torna. La disegniamo noi, attività per attività: un ristorante non è un centro estetico e uno studio professionale non è un negozio.",
  steps: [
    { n: "01", name: "Scoperta", text: "Video, Reel, TikTok e annunci fanno vedere la tua attività alle persone giuste, nella tua zona." },
    { n: "02", name: "Fiducia", text: "Profilo social curato e sito chiaro: chi ti cerca capisce cosa fai e chi sei." },
    { n: "03", name: "Contatto", text: "Un passo solo: WhatsApp, prenotazione online o chiamata. Niente moduli lunghi." },
    { n: "04", name: "Cliente", text: "Rispondi, prenoti, vendi. Noi misuriamo da dove è arrivato ogni contatto." },
    { n: "05", name: "Ritorno", text: "Promemoria, offerte e contenuti per chi è già stato da te: il cliente più facile da riportare." },
  ],
};

export const socialBlock = {
  kicker: "Social media management",
  title: "Social media management: strategia, piano editoriale e gestione completa.",
  text: "Un social media manager dedicato pensa cosa dire, quando dirlo e in che formato. Tu non devi inventare niente: ricevi il piano del mese, approvi, e i contenuti escono da soli.",
  points: [
    { what: "Strategia", how: "Obiettivo, pubblico e tono decisi insieme, poi rivisti ogni mese sui numeri." },
    { what: "Piano editoriale", how: "Calendario mensile con formati, temi e date. Lo vedi prima che esca qualsiasi cosa." },
    { what: "Produzione", how: "Riprese nella tua attività, montaggio, testi e grafiche. Con te davanti alla camera, se vuoi." },
    { what: "Gestione", how: "Pubblicazione, risposte ai commenti e ai messaggi nelle prime ore, report chiaro." },
  ],
  /** Settimana tipo del piano editoriale: giorno → formato (etichette, nessun numero) */
  week: [
    { day: "Lun", slot: "Reel" },
    { day: "Mar", slot: "Storia" },
    { day: "Mer", slot: "Post" },
    { day: "Gio", slot: "TikTok" },
    { day: "Ven", slot: "Storia" },
    { day: "Sab", slot: "Reel" },
    { day: "Dom", slot: "" },
  ],
};
