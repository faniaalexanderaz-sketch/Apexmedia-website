import type { NomeIcona } from "@/components/Icona";

export type SlugServizio =
  | "pulizie-civili"
  | "pulizie-industriali"
  | "trattamento-pavimenti"
  | "vetri-infissi"
  | "tapparelle-persiane";

/** valore salvato col lead */
export type ChiaveServizio = "civili" | "industriali" | "pavimenti" | "vetri" | "tapparelle";

export type Domanda = { domanda: string; risposta: string };

export type Servizio = {
  slug: SlugServizio;
  chiave: ChiaveServizio;
  nome: string;
  /** voce del menu */
  nomeBreve: string;
  icona: NomeIcona;
  h1: string;
  metaTitolo: string;
  metaDescrizione: string;
  intro: string;
  /** riga usata in home, nel menu e nel passo 1 del form */
  riassunto: string;
  /** percorso in /public/foto. null = foto reale non ancora consegnata. */
  foto: string | null;
  fotoAlt: string;
  fotoRichiesta: string;
  problema: { titolo: string; testo: string[] };
  soluzione: { titolo: string; testo: string[] };
  incluso: { voce: string; dettaglio: string }[];
  /** argomento principale messo in evidenza nella pagina (es. vetrine grandi) */
  evidenza?: { occhiello: string; titolo: string; testo: string; punti: string[] };
  /** messaggio già scritto per WhatsApp */
  whatsapp: string;
  faq: Domanda[];
};

/*
 * Servizi presi SOLO dal foglio del titolare:
 * 1. pulizie civili (alloggi e case private)
 * 2. pulizie industriali (capannoni, aziende, uffici, fabbriche)
 * 3. trattamenti per pavimenti (dettaglio dei materiali in content/materiali.ts)
 * 4. lavaggio infissi e vetri, incluse vetrine di grandi dimensioni
 * 5. pulizia completa di tapparelle e persiane
 * Non aggiungere lavorazioni che non sono sul foglio.
 *
 * Confermato dal titolare (novembre 2026): resine epossidiche, condomini sì (nelle pulizie
 * industriali), vetrine fino a 10 metri, tempi e durata dei trattamenti indicati nel preventivo
 * perché cambiano da lavoro a lavoro.
 * Le altre risposte delle FAQ restano da far rileggere a Jonathan Germanò.
 */
export const servizi: Servizio[] = [
  {
    slug: "pulizie-civili",
    chiave: "civili",
    nome: "Pulizie civili",
    nomeBreve: "Case",
    icona: "casa",
    h1: "Pulizie di case e appartamenti ad Alessandria",
    metaTitolo: "Pulizie civili ad Alessandria: case e appartamenti, preventivo in 24 ore",
    metaDescrizione:
      "Pulizia di fondo di case e appartamenti privati ad Alessandria e provincia: cambio inquilino, prima o dopo un trasloco. Preventivo scritto in 24 ore.",
    intro:
      "Pulizia di fondo della tua casa: quando cambia l'inquilino, prima di entrare o dopo un trasloco. Il preventivo scritto arriva in 24 ore.",
    riassunto: "Case e appartamenti privati. Pulizia di fondo, cambio inquilino, trasloco.",
    foto: null,
    fotoAlt: "",
    fotoRichiesta: "soggiorno di un appartamento appena pulito, luce naturale",
    problema: {
      titolo: "Devi consegnare o abitare una casa e non sai da dove cominciare.",
      testo: [
        "Dopo un trasloco restano polvere, calcare e aloni in ogni stanza. Se l'appartamento è in affitto, il nuovo inquilino arriva tra pochi giorni.",
        "Farlo da soli costa un fine settimana, e spesso il risultato non basta.",
      ],
    },
    soluzione: {
      titolo: "Veniamo nel giorno concordato e puliamo la casa da cima a fondo.",
      testo: [
        "Star Clean è un'impresa di famiglia che pulisce ad Alessandria da 30 anni. Fissi il giorno con Jonathan Germanò e trovi la casa pronta.",
        "Se qualcosa non ti convince, chiami lui e si sistema.",
      ],
    },
    // Civili = solo case e appartamenti privati. I condomini stanno nelle pulizie industriali.
    incluso: [
      { voce: "Pulizia di fondo", dettaglio: "Tutte le stanze, dai pavimenti al bagno e alla cucina." },
      { voce: "Cambio inquilino", dettaglio: "Casa pronta da consegnare o da affittare di nuovo." },
      { voce: "Prima o dopo un trasloco", dettaglio: "Casa vuota, prima che entrino i mobili o dopo che sono usciti." },
      { voce: "Vetri e infissi di casa", dettaglio: "Se servono, li aggiungiamo allo stesso intervento." },
      { voce: "Pavimenti da trattare", dettaglio: "Marmo, cotto o parquet: possiamo anche lucidarli." },
    ],
    whatsapp: "Ciao, vorrei un preventivo per la pulizia di una casa.",
    faq: [
      {
        domanda: "Pulite anche la casa vuota dopo un trasloco?",
        risposta: "Sì. Possiamo pulire la casa vuota, prima che entrino i mobili o dopo che sono usciti.",
      },
      {
        domanda: "Devo essere a casa durante la pulizia?",
        risposta: "Ne parliamo quando fissiamo il giorno. Ci accordiamo su come entrare e su quando ripassi a controllare.",
      },
      {
        domanda: "Pulite anche le scale dei condomini?",
        risposta: "Sì. Scale, androni e parti comuni dei condomini li seguiamo con le pulizie industriali, a giorni fissi.",
      },
    ],
  },
  {
    slug: "pulizie-industriali",
    chiave: "industriali",
    nome: "Pulizie industriali",
    nomeBreve: "Aziende",
    icona: "fabbrica",
    h1: "Pulizie industriali ad Alessandria",
    metaTitolo: "Pulizie industriali ad Alessandria: capannoni, uffici e condomini",
    metaDescrizione:
      "Pulizia di capannoni, fabbriche, aziende, uffici e condomini in provincia di Alessandria, negli orari che non fermano il lavoro. Preventivo scritto in 24 ore.",
    intro:
      "Capannoni, fabbriche, aziende, uffici e condomini. Puliamo negli orari in cui non blocchiamo il lavoro.",
    riassunto: "Capannoni, fabbriche, aziende, uffici e condomini, negli orari in cui siete fermi.",
    foto: "/foto/industriali.webp",
    fotoAlt: "Lavasciuga uomo a bordo al lavoro in un capannone",
    fotoRichiesta: "lavasciuga al lavoro in un capannone",
    problema: {
      titolo: "Polvere e sporco rallentano il lavoro e fanno brutta figura.",
      testo: [
        "In un capannone o in una fabbrica lo sporco si accumula in fretta: polvere sulla merce, macchie dove passano i muletti.",
        "In ufficio i clienti notano subito vetri opachi e bagni trascurati.",
      ],
    },
    soluzione: {
      titolo: "Giorni fissi, orari scelti da te e un titolare che risponde.",
      testo: [
        "Usiamo macchine fatte per le grandi superfici e lasciamo il pavimento asciutto dove si lavora.",
        "Concordi giorni e orari con Jonathan Germanò, anche a reparto fermo, e quelli restano.",
      ],
    },
    incluso: [
      { voce: "Capannoni e magazzini", dettaglio: "Pavimenti lavati con macchine per grandi superfici." },
      { voce: "Fabbriche e reparti", dettaglio: "Aree di lavoro pulite negli orari di fermo." },
      { voce: "Uffici", dettaglio: "Scrivanie, pavimenti, bagni e zone comuni." },
      { voce: "Sedi aziendali", dettaglio: "Ingressi, sale riunioni e spazi dove ricevi i clienti." },
      { voce: "Condomini", dettaglio: "Scale, androni, pianerottoli e parti comuni, a giorni fissi." },
      { voce: "Una volta o con regolarità", dettaglio: "Ogni settimana, ogni mese o un intervento singolo." },
    ],
    whatsapp: "Ciao, vorrei un preventivo per le pulizie della mia azienda.",
    faq: [
      {
        domanda: "Lavorate fuori dall'orario di lavoro?",
        risposta: "Sì. Concordiamo giorni e orari per non fermare il reparto o l'ufficio.",
      },
      {
        domanda: "Pulite anche gli uffici dentro l'azienda?",
        risposta: "Sì, uffici e zone comuni rientrano nelle pulizie industriali, nello stesso preventivo.",
      },
      {
        domanda: "Fate un sopralluogo prima del preventivo?",
        risposta: "Per capannoni e fabbriche di solito sì: veniamo a vedere gli spazi e poi ti mandiamo il prezzo scritto.",
      },
    ],
  },
  {
    slug: "trattamento-pavimenti",
    chiave: "pavimenti",
    nome: "Trattamento pavimenti",
    nomeBreve: "Pavimenti",
    icona: "pavimento",
    h1: "Trattamento pavimenti ad Alessandria",
    metaTitolo: "Trattamento pavimenti ad Alessandria: cristallizzazione marmo, cotto, parquet",
    metaDescrizione:
      "Cristallizzazione di marmo e graniglia, cementine, vetrificazione del cemento, cotto e parquet ad Alessandria e provincia. Preventivo scritto in 24 ore.",
    intro:
      "Ogni pavimento ha il suo trattamento. Scegli il tuo materiale e ricevi il preventivo scritto in 24 ore.",
    riassunto: "Marmo, graniglia, cementine, cemento, cotto e parquet: il trattamento giusto per ognuno.",
    foto: "/foto/pavimenti.webp",
    fotoAlt: "Monospazzola su un pavimento in marmo lucidato",
    fotoRichiesta: "monospazzola su un pavimento, metà già trattata",
    problema: {
      titolo: "Lavi tutti i giorni e il pavimento resta opaco.",
      testo: [
        "Lo straccio sposta lo sporco, non lo toglie. Col tempo il marmo perde lucentezza, il cotto si ingrigisce e il cemento fa polvere.",
        "Più lavi, più sembra spento.",
      ],
    },
    soluzione: {
      titolo: "Prima capiamo che pavimento hai, poi scegliamo il trattamento.",
      testo: [
        "Cristallizzazione, vetrificazione, lavaggio a macchina o lucidatura: ogni materiale ha la sua lavorazione.",
        "Non sai che pavimento hai? Mandaci una foto su WhatsApp e te lo diciamo noi.",
      ],
    },
    incluso: [
      { voce: "Graniglia, marmettone e marmo", dettaglio: "Cristallizzazione." },
      { voce: "Cementine", dettaglio: "Trattamento con acrilico metallizzato." },
      { voce: "Cemento", dettaglio: "Vetrificazione con resine epossidiche combinate." },
      { voce: "Cotto", dettaglio: "Lavaggio a macchina e lucidatura." },
      { voce: "Parquet", dettaglio: "Pulizia di base e lucidatura." },
    ],
    whatsapp: "Ciao, vorrei un preventivo per il trattamento di un pavimento.",
    // Tempi e durata cambiano da lavoro a lavoro: si indicano nel preventivo (confermato dal titolare).
    faq: [
      {
        domanda: "Quanto dura la cristallizzazione?",
        risposta:
          "Dipende dal pavimento, da quanto è calpestato e da come viene lavato dopo. Te lo scriviamo nel preventivo, con i consigli per farla durare.",
      },
      {
        domanda: "Dopo quanto tempo si può camminare sul pavimento?",
        risposta: "Ogni lavoro ha tempi diversi: li trovi scritti nel preventivo, così organizzi la giornata.",
      },
      {
        domanda: "Non so che pavimento ho. Come faccio?",
        risposta: "Nel modulo scegli «Non lo so», oppure mandaci una foto su WhatsApp: lo riconosciamo noi.",
      },
    ],
  },
  {
    slug: "vetri-infissi",
    chiave: "vetri",
    nome: "Vetri e infissi",
    nomeBreve: "Vetri",
    icona: "finestra",
    h1: "Pulizia vetrine, vetri e infissi ad Alessandria",
    metaTitolo: "Pulizia vetrine e vetri ad Alessandria, anche di grandi dimensioni",
    metaDescrizione:
      "Lavaggio di vetrine di negozi e showroom anche di grandi dimensioni, fino a 10 metri di altezza, vetrate e infissi ad Alessandria e provincia. Preventivo in 24 ore.",
    intro:
      "Vetrine di negozi e showroom, anche di grandi dimensioni. Vetrate e infissi di case e uffici, senza aloni.",
    riassunto: "Vetrine anche di grandi dimensioni, vetrate e infissi. Senza aloni.",
    foto: "/foto/civili.webp",
    fotoAlt: "Pulizia delle grandi vetrate di un ufficio con il tergivetro",
    fotoRichiesta: "vetrina di un negozio durante il lavaggio",
    problema: {
      titolo: "Una vetrina opaca allontana i clienti prima che entrino.",
      testo: [
        "Smog, pioggia e impronte si vedono subito, soprattutto controluce. E una vetrina grande pulita male lascia righe e aloni.",
        "Negli infissi lo sporco si ferma nelle guide e sui telai.",
      ],
    },
    soluzione: {
      titolo: "Vetri trasparenti e infissi puliti, telaio compreso.",
      testo: [
        "Laviamo vetrine e vetrate grandi con l'attrezzatura adatta e asciughiamo senza lasciare righe.",
        "Puliamo anche telai, guide e davanzali, negli orari che vanno bene a te.",
      ],
    },
    // Altezza: tutte le vetrine fino a 10 metri (confermato dal titolare).
    evidenza: {
      occhiello: "Vetrine di grandi dimensioni",
      titolo: "La vetrina è la prima cosa che vede il tuo cliente.",
      testo: "Negozi, showroom e ingressi di aziende: puliamo anche le vetrine più grandi, fino a 10 metri di altezza, dentro e fuori.",
      punti: ["Vetrine di negozi e showroom, fino a 10 metri", "Vetrate d'ingresso di aziende e uffici", "Passaggi regolari, così la vetrina è sempre in ordine"],
    },
    incluso: [
      { voce: "Vetrine grandi", dettaglio: "Negozi e showroom, dentro e fuori." },
      { voce: "Vetrate", dettaglio: "Ingressi e pareti vetrate di aziende e uffici." },
      { voce: "Finestre e porte-finestre", dettaglio: "Vetri di case e uffici, su entrambi i lati." },
      { voce: "Infissi", dettaglio: "Telai, guide e davanzali." },
      { voce: "Una volta o con regolarità", dettaglio: "Un intervento singolo o passaggi fissi." },
    ],
    whatsapp: "Ciao, vorrei un preventivo per la pulizia di vetri e vetrine.",
    faq: [
      {
        domanda: "Pulite vetrine alte?",
        risposta:
          "Sì, puliamo vetrine di grandi dimensioni fino a 10 metri di altezza. Dicci quanto è alta la tua e la mettiamo nel preventivo.",
      },
      {
        domanda: "Pulite anche i telai e le guide?",
        risposta: "Sì. Telai, guide e davanzali sono compresi nel lavaggio degli infissi.",
      },
      {
        domanda: "Potete passare con regolarità per il mio negozio?",
        risposta: "Sì, concordiamo la frequenza e l'orario. Nel preventivo trovi il prezzo per ogni passaggio.",
      },
    ],
  },
  {
    slug: "tapparelle-persiane",
    chiave: "tapparelle",
    nome: "Tapparelle e persiane",
    nomeBreve: "Tapparelle",
    icona: "tapparella",
    h1: "Pulizia di tapparelle e persiane ad Alessandria",
    metaTitolo: "Pulizia tapparelle e persiane ad Alessandria, preventivo in 24 ore",
    metaDescrizione:
      "Pulizia completa di tapparelle e persiane, su entrambi i lati, ad Alessandria e provincia. Preventivo scritto in 24 ore.",
    intro:
      "Puliamo tapparelle e persiane su entrambi i lati, insieme alle guide. Il preventivo scritto arriva in 24 ore.",
    riassunto: "Pulizia completa di tapparelle e persiane, dentro e fuori.",
    foto: null,
    fotoAlt: "",
    fotoRichiesta: "tapparella o persiana durante la pulizia",
    problema: {
      titolo: "Le tapparelle sono la parte più sporca della casa, e nessuno le pulisce.",
      testo: [
        "Smog e polvere si attaccano alle stecche e finiscono sui vetri appena lavati.",
        "Pulirle da soli è scomodo e, ai piani alti, pericoloso.",
      ],
    },
    soluzione: {
      titolo: "Una pulizia completa, dentro e fuori.",
      testo: [
        "Laviamo tapparelle e persiane su tutti e due i lati, comprese le guide.",
        "Se vuoi, nello stesso giorno puliamo anche vetri e infissi.",
      ],
    },
    incluso: [
      { voce: "Tapparelle", dettaglio: "Stecche lavate su entrambi i lati." },
      { voce: "Persiane", dettaglio: "Lamelle e telaio, da tutti e due i lati." },
      { voce: "Guide", dettaglio: "Pulite insieme a stecche e lamelle." },
      { voce: "Insieme ai vetri", dettaglio: "Un solo intervento per tapparelle, vetri e infissi." },
    ],
    whatsapp: "Ciao, vorrei un preventivo per la pulizia di tapparelle e persiane.",
    faq: [
      {
        domanda: "Bisogna smontare le tapparelle?",
        risposta: "Dipende dal tipo di tapparella. Te lo diciamo quando fissiamo l'intervento.",
      },
      {
        domanda: "Si può fare insieme ai vetri?",
        risposta: "Sì. Nello stesso intervento puliamo tapparelle, persiane, vetri e infissi.",
      },
      {
        domanda: "Quanto tempo ci vuole?",
        risposta: "Dipende da quante sono. Nel preventivo trovi anche la durata del lavoro.",
      },
    ],
  },
];

export const servizioDaSlug = (slug: SlugServizio) => servizi.find((s) => s.slug === slug)!;
export const servizioDaChiave = (chiave: string) => servizi.find((s) => s.chiave === chiave);
