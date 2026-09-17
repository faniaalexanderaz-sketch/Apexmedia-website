/**
 * APEX MEDIA — copy delle cold email per scenario.
 *
 * Un solo principio: la frase in PROBLEMA deve essere una cosa che abbiamo
 * verificato davvero sul suo sito. E' l'unica ragione per cui un titolare
 * apre una mail da uno sconosciuto. Se non abbiamo un problema verificato,
 * il prospect non si contatta: si torna a cercarne un altro.
 *
 * Campi disponibili in `p` (una riga di prospects.csv):
 *   attivita, referente, sito, problema, dettaglio, citta
 */

const nome = (p) => (p.referente && p.referente.trim() ? p.referente.trim() : null);

const saluto = (p) => {
  const n = nome(p);
  return n ? `Buongiorno ${n},` : "Buongiorno,";
};

export const SCENARI = {
  /* Il sito non si apre proprio: errore, dominio scaduto, timeout. */
  sito_down: {
    subject: (p) => `Il sito di ${p.attivita} non si apre`,
    preheader: () => "Un problema tecnico che le sta costando chiamate ogni giorno.",
    apertura: (p) =>
      `sono Alexander di Apex Media, studio di ${p.citta || "Alessandria"}. Ieri ho provato ad aprire ${p.sito} e non sono riuscito a vederlo.`,
    problema: (p) => `<strong>${p.dettaglio}</strong>`,
    conseguenza: () =>
      "Chi la cerca su Google trova il link, clicca, vede una pagina di errore e torna indietro. Nove volte su dieci finisce dal concorrente che sta due righe sotto. E lei non lo vede succedere: non arriva nessuna segnalazione, arrivano solo meno telefonate.",
  },

  /* Il sito si apre ma da telefono e' inutilizzabile o lentissimo. */
  sito_lento_mobile: {
    subject: (p) => `${p.attivita}: il sito da telefono`,
    preheader: () => "Sette clienti su dieci la cercano dal cellulare.",
    apertura: (p) =>
      `sono Alexander di Apex Media, studio di ${p.citta || "Alessandria"}. Ho aperto ${p.sito} dal telefono, come fa un cliente che vi cerca per strada.`,
    problema: (p) => `<strong>${p.dettaglio}</strong>`,
    conseguenza: () =>
      "Oggi la stragrande maggioranza delle ricerche locali arriva da cellulare. Se in tre secondi uno non capisce cosa fate, dove siete e come chiamarvi, chiude. Non e' pigrizia del cliente: e' che ha altre dieci schede aperte.",
  },

  /* Il sito e' fermo a anni fa: grafica vecchia, dati non aggiornati. */
  sito_vecchio: {
    subject: (p) => `Una cosa sul sito di ${p.attivita}`,
    preheader: () => "Il sito racconta un'attivita' diversa da quella che siete oggi.",
    apertura: (p) =>
      `sono Alexander di Apex Media, studio di ${p.citta || "Alessandria"}. Ho dato un'occhiata a ${p.sito} prima di scriverle.`,
    problema: (p) => `<strong>${p.dettaglio}</strong>`,
    conseguenza: () =>
      "Il punto non e' l'estetica. E' che un sito fermo comunica un'attivita' ferma, e chi non vi conosce decide in pochi secondi se siete ancora aperti e se vale la pena venire. Voi siete meglio di come vi presenta quella pagina.",
  },

  /* Non hanno sito: solo Google Maps o una pagina Facebook. */
  senza_sito: {
    subject: (p) => `${p.attivita} su Google`,
    preheader: () => "Chi vi cerca trova solo una scheda, e spesso non basta.",
    apertura: (p) =>
      `sono Alexander di Apex Media, studio di ${p.citta || "Alessandria"}. Cercando ${p.attivita} su Google non ho trovato un vostro sito.`,
    problema: (p) => `<strong>${p.dettaglio}</strong>`,
    conseguenza: () =>
      "Vuol dire che tutto quello che un nuovo cliente sa di voi lo decidono le recensioni e due foto. Non i vostri prezzi, non i vostri servizi, non il motivo per cui dovrebbe scegliere voi.",
  },
};

/* Offerta e CTA: identiche in tutti gli scenari, e' il nostro standard. */
export const OFFERTA = (p) =>
  `Le propongo una cosa semplice: le preparo <strong>gratis una demo della nuova home di ${p.attivita}</strong>, fatta sui vostri dati veri. La guarda con calma. Se non la convince finisce li', non mi deve niente e non le scrivo piu'.`;

export const CTA_TESTO = "Mi va bene, sentiamoci";

export const CHIUSURA = () =>
  "Le basta rispondere a questa mail. Facciamo una call di 15 minuti quando ha un momento, oppure se preferisce di persona passo io in negozio: sono in zona.";

export const FIRMA_NOME = "Alexander";
