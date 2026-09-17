/**
 * APEX MEDIA — copy delle cold email, per scenario.
 *
 * Tono: diretto. La prima riga deve essere il problema, non la presentazione.
 * Un titolare non apre una mail per sapere chi siamo: la apre perché qualcuno
 * gli sta dicendo che una cosa sua non funziona.
 *
 * Regola che non si tocca: il problema deve essere VERO e verificabile in dieci
 * secondi col telefono in mano. Non per scrupolo, ma perché il primo che clicca
 * e vede che il sito funziona ha in mano la prova che gli abbiamo mentito per
 * vendergli qualcosa — e in una provincia piccola quella cosa si racconta.
 *
 * Campi disponibili in `p`: attivita, referente, sito, scenario, dettaglio, citta
 */

/* ---------------- scenari ---------------- */

export const SCENARI = {
  /* Il sito non si apre: dominio scaduto, errore, timeout. */
  sito_down: {
    subject: (p) => `Il sito di ${p.attivita} non si apre`,
    preheader: () => "Chi vi cerca su Google trova una pagina di errore.",
    apertura: (p) =>
      `le scrivo per un motivo solo: <strong>ieri ho provato ad aprire ${p.sito} e non ci sono riuscito.</strong> Ho riprovato oggi, da due dispositivi diversi. Niente.`,
    problema: (p) => p.dettaglio,
    conseguenza: () =>
      "Vuol dire che in questo momento chi vi cerca su Google trova il vostro link, clicca, e finisce su una pagina di errore. Non vi chiama e non vi scrive: torna indietro e apre il risultato sotto. E lei non se ne accorge, perché non arriva nessuna segnalazione. Arrivano solo meno telefonate.",
  },

  /* Il sito si apre ma da telefono è inutilizzabile. */
  sito_lento_mobile: {
    subject: (p) => `${p.attivita}: dal vostro sito non riesco a chiamarvi`,
    preheader: () => "L'ho aperto dal telefono, come fa un cliente. Ecco cosa succede.",
    apertura: (p) =>
      `ho aperto <strong>${p.sito} dal telefono</strong>, non dal computer: come fa un cliente che vi cerca mentre è per strada. È andata così.`,
    problema: (p) => p.dettaglio,
    conseguenza: () =>
      "Non è un dettaglio estetico. Oggi quasi tutte le ricerche locali arrivano da cellulare, e chi cerca da cellulare vuole fare una cosa sola: toccare il numero e chiamare. Se deve zoomare, copiare a mano o mettersi a cercare dove siete, nella maggior parte dei casi non lo fa. Chiude e apre il risultato sotto — che è un vostro concorrente.",
  },

  /* Il sito è fermo a anni fa. */
  sito_vecchio: {
    subject: (p) => `Una cosa sul sito di ${p.attivita} che vi sta costando clienti`,
    preheader: () => "Chi non vi conosce si sta chiedendo se siete ancora aperti.",
    apertura: (p) =>
      `ho guardato <strong>${p.sito}</strong> prima di scriverle, e c'è una cosa che salta all'occhio subito.`,
    problema: (p) => p.dettaglio,
    conseguenza: () =>
      "So che a lei sembra un dettaglio, perché lei sa benissimo di essere aperto. Ma chi non vi conosce no: apre la pagina, vede quella data e la legge come un'attività che ha chiuso o che non segue più niente. Decide in pochi secondi, e decide senza chiedervelo. Il problema non è il sito in sé: è che sta raccontando un'attività che non siete.",
  },

  /* Non hanno un sito. */
  senza_sito: {
    subject: (p) => `Su Google, di ${p.attivita} parla qualcun altro`,
    preheader: () => "Chi vi cerca legge quello che hanno scritto altri su di voi.",
    apertura: (p) =>
      `ho cercato <strong>${p.attivita} su Google</strong>, come farebbe un cliente nuovo. Un vostro sito non c'è.`,
    problema: (p) => p.dettaglio,
    conseguenza: () =>
      "Questo significa una cosa precisa: tutto quello che un cliente nuovo sa di voi lo ha scritto qualcun altro. Le recensioni, due foto caricate da chissà chi, orari che magari sono pure sbagliati. Non i vostri prezzi, non quello che fate meglio degli altri, non il motivo per cui dovrebbe venire da voi invece che dal concorrente in fondo alla via. Su quella pagina non avete voce.",
  },
};

/* ---------------- offerta, allegato, chiusura ---------------- */

export const OFFERTA = (p) =>
  `Le propongo una cosa concreta: le preparo <strong>gratis una demo della nuova home di ${p.attivita}</strong>, ` +
  `costruita sui vostri dati veri — nome, servizi, foto, orari. Non un modello con dentro «Lorem ipsum». ` +
  `La guarda con calma dal suo telefono. Se non la convince finisce lì: non mi deve niente e non le scrivo più.`;

export const ALLEGATO = () =>
  `Nell'allegato trova la nostra presentazione: cosa facciamo con social, sito e advertising, ` +
  `e i tre livelli con i prezzi in chiaro. Così sa già tutto prima ancora di parlarmi.`;

export const CTA_TESTO = "Voglio vedere la demo";

export const CHIUSURA = () =>
  `Le basta rispondere a questa mail. Quindici minuti di call quando ha un momento, ` +
  `oppure passo io in negozio: siamo di Alessandria, in zona ci veniamo volentieri.`;

export const FIRMA_NOME = "Alexander";
