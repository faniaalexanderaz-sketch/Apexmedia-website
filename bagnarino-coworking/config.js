/* =============================================================
   BAGNARINO COWORKING — tutti i dati del sito in un punto solo.

   Prezzi, orari, numero di postazioni, contatti, testi WhatsApp
   e fidelity si cambiano QUI. Ogni pagina li legge da questo file:
   non serve toccare l'HTML.

   REGOLA: un dato non ancora confermato dalla titolare resta
   spento (false / '' / null). Il sito non mostra mai un dato
   inventato: nasconde l'elemento che lo conterrebbe.
   I punti da chiedere a Marcella Bagnarino sono segnati
   [DA CONFERMARE].
   ============================================================= */
var BGN_CONFIG = {

  /* Indirizzo pubblico del sito, SENZA barra finale.
     Vuoto = si usa l'indirizzo su cui il sito sta girando
     (l'anteprima di Vercel finché il dominio non è deciso).
     Sitemap e robots.txt leggono invece la variabile d'ambiente
     SITO_URL impostata su Vercel. */
  sitoUrl: '',

  azienda: {
    marchio: 'Bagnarino Coworking',
    ragioneSociale: 'Bagnarino S.r.l.',
    indirizzo: 'Corso Lamarmora 46',
    cap: '15121',
    citta: 'Alessandria',
    provincia: 'AL',
    piva: '01588170066',
    email: 'info@bagnarino.it',
    telefonoFissoVisibile: '0131 444845',
    telefonoFisso: '+390131444845',
    dal: 1983,
    geo: { lat: 44.9112, lng: 8.6215 }
  },

  /* Cellulare e WhatsApp della titolare: sono i contatti "caldi"
     usati da tutti i pulsanti Chiama / WhatsApp del sito.
     Il fisso del negozio resta solo nel piè di pagina. */
  contatti: {
    cellulareVisibile: '347 224 9457',
    cellulare: '+393472249457',
    whatsapp: '393472249457'
  },

  /* Giorni: 1 = lunedì … 5 = venerdì, 6 = sabato, 0 = domenica */
  orari: {
    giorni: [1, 2, 3, 4, 5],
    apertura: '9:30',
    chiusura: '18:30',
    testoBreve: 'Lun–Ven 9:30–18:30',
    testoLungo: 'Dal lunedì al venerdì, 9:30–18:30. Sabato e domenica chiuso.',
    /* dopo quest'ora non si prenota più per oggi */
    ultimaPrenotazioneOggi: '17:00'
  },

  /* Chiusure straordinarie oltre ai festivi nazionali (che il sito
     conosce già da solo, Pasquetta compresa). Formato 'AAAA-MM-GG'.
     [DA CONFERMARE] San Baudolino (10 novembre) e ponti/ferie estive. */
  chiusure: [],

  /* Postazioni prenotabili. Aumentale quando arrivano nuove scrivanie. */
  postazioni: 8,

  /* Quanti giorni avanti si può prenotare */
  giorniPrenotabili: 28,

  /* Modalità dimostrativa (fase 1): numero di posti liberi "oggi"
     mostrato in home finché il motore di prenotazione non è attivo.
     Quando le API rispondono, il sito usa i posti veri da solo. */
  demo: { postiLiberiOggi: 4 },

  /* Listino. L'ordine qui è l'ordine delle card in pagina.
     prezzo = euro (intero). tipoData: 'giorno' = un giorno preciso,
     'inizio' = giorno di partenza (carnet e mesi). */
  listino: [
    {
      id: 'giornata',
      nome: 'Giornata',
      prezzo: 25,
      unita: 'al giorno',
      nota: 'Nessun impegno',
      perChi: 'Per una prova o un uso occasionale',
      include: ['Scrivania dalle 9:30 alle 18:30', 'Wi-fi in fibra', 'Stampe e scansioni Olivetti'],
      cta: 'Prenota la giornata',
      tipoData: 'giorno',
      etichettaData: 'Scegli il giorno'
    },
    {
      id: 'carnet',
      nome: 'Carnet 10 ingressi',
      prezzo: 200,
      unita: '10 giornate',
      nota: '€20 al giorno · risparmi €50',
      perChi: 'Per chi viene una o due volte a settimana',
      include: ['10 giornate da usare quando vuoi', 'Valido 3 mesi dal primo ingresso', 'Tutto quello della giornata'],
      cta: 'Prenota il carnet',
      tipoData: 'inizio',
      etichettaData: 'Scegli il giorno del primo ingresso'
    },
    {
      id: 'mese_flessibile',
      nome: 'Mese flessibile',
      prezzo: 270,
      unita: 'al mese',
      nota: 'Circa €13 al giorno',
      perChi: 'Per chi lavora in sede quasi ogni giorno',
      include: ['Tutti i giorni di apertura', 'Una scrivania libera a scelta', 'Stampe, scansioni e wi-fi inclusi'],
      cta: 'Prenota il mese',
      tipoData: 'inizio',
      etichettaData: 'Da che giorno inizi?',
      evidenza: true,
      /* Il brief proponeva "La più scelta": lo useremo quando ci
         saranno clienti veri a dimostrarlo. Per ora è un dato di fatto. */
      etichetta: 'La più conveniente'
    },
    {
      id: 'mese_fisso',
      nome: 'Mese, postazione fissa',
      prezzo: 320,
      unita: 'al mese',
      nota: 'Circa €15 al giorno',
      perChi: 'Per chi vuole una postazione riservata',
      include: ['Sempre la stessa scrivania', 'Cassettiera personale', 'Lasci le tue cose dove sono'],
      cta: 'Prenota la postazione',
      tipoData: 'inizio',
      etichettaData: 'Da che giorno inizi?'
    }
  ],

  /* Sala riunioni [DA CONFERMARE se esiste e a che prezzo].
     Con attiva: false non compare da nessuna parte. */
  sala: { attiva: false, nome: 'Sala riunioni', prezzo: null, unita: 'all’ora' },

  carnet: { ingressi: 10, validitaMesi: 3 },

  /* Disdetta: regola mostrata nei testi (in fase 2 la applica il server) */
  disdetta: { ora: '20:00', testo: 'entro le 20:00 del giorno prima' },

  fidelity: {
    nome: 'Bagnarino Card',
    timbri: 10,
    titolo: 'Ogni 10 giornate, l’undicesima è in regalo.',
    testo: 'Un timbro per ogni giornata e quattro premi lungo il percorso, fino alla giornata in omaggio. La card è gratuita e non richiede alcuna app.',
    /* Premi lungo la card: timbri = al quale timbro si sblocca.
       I premi intermedi li consegna Marcella in sede: l'area riservata
       glielo ricorda quando segna l'arrivo. Dopo il 10° si ricomincia.
       [DA CONFERMARE] con Marcella pagine a colori e sconto in negozio. */
    premi: [
      { timbri: 3, titolo: '25 stampe a colori gratis', testo: 'Per i tuoi lavori, da usare quando vuoi.' },
      { timbri: 5, titolo: 'Porta un amico', testo: 'Venite insieme: la sua prima giornata è gratis.' },
      { timbri: 7, titolo: 'Sconto 10% in negozio', testo: 'Su carta, cartucce e accessori per l’ufficio.' },
      { timbri: 10, titolo: 'Giornata in regalo', testo: 'L’undicesima giornata la offriamo noi.' }
    ]
  },

  /* Abbonati mensili: niente timbri, ma i premi della card subito,
     ogni mese. Li consegna Marcella in sede.
     [DA CONFERMARE] con Marcella quantità e sconto sul rinnovo. */
  vantaggiMese: {
    titolo: 'Con il mese, i premi li hai subito',
    breve: 'Ogni mese: stampe a colori, un amico gratis, −10% in negozio',
    voci: [
      { titolo: '100 stampe a colori', testo: 'Ogni mese, per i tuoi lavori.' },
      { titolo: 'Un amico gratis', testo: 'Ogni mese porti chi vuoi per una giornata.' },
      { titolo: '−10% in negozio', testo: 'Su carta, cartucce e accessori, per tutto il mese.' },
      { titolo: 'Rinnovi, risparmi', testo: 'Dal quarto mese di fila, €20 in meno al mese.' }
    ]
  },

  /* Servizi non ancora confermati: restano nascosti finché sono false */
  servizi: {
    caffe: false,         /* [DA CONFERMARE] caffè/acqua a disposizione */
    climatizzazione: false /* [DA CONFERMARE] aria condizionata e riscaldamento */
  },

  /* Le recensioni compaiono solo quando ci sono recensioni Google vere.
     Metti true dopo aver inserito i testi reali in index.html. */
  recensioniAttive: false,

  /* Offerta per chi viene la prima volta. [DA CONFERMARE] con Marcella:
     resta spenta (attiva: false) finché non dà l'ok su prezzo e regole. */
  offertaPrimaVolta: {
    attiva: false,
    testo: 'Prima volta? Se torni entro 7 giorni, la seconda giornata costa €20.'
  },

  /* Messaggi WhatsApp precompilati. {giorno}, {pacchetto}, {codice},
     {riepilogo} vengono sostituiti dal sito. */
  whatsappTesti: {
    generico: 'Ciao, vorrei informazioni sul coworking Bagnarino.',
    prenota: 'Ciao, vorrei prenotare una postazione al coworking Bagnarino.',
    giorno: 'Ciao, vorrei prenotare una postazione per {giorno}.',
    pacchetto: 'Ciao, vorrei informazioni sul pacchetto {pacchetto}.',
    visita: 'Ciao, vorrei passare a vedere lo spazio prima di prenotare. Quando posso venire?',
    domanda: 'Ciao, ho una domanda sulla mia prenotazione {codice}.',
    conferma: 'Ciao, vorrei confermare questa prenotazione:\n{riepilogo}'
  },

  /* Misurazione (fase 3): si attivano da sole quando i codici sono
     inseriti, e solo dopo il consenso ai cookie di statistica. */
  ga4: 'G-E200FKTJ5G',
  metaPixel: '',  /* es. '123456789012345' */

  /* Indirizzi del motore di prenotazione (fase 2). Finché non
     rispondono il sito lavora in modalità dimostrativa. */
  api: {
    disponibilita: '/api/disponibilita',
    prenota: '/api/prenota',
    prenotazione: '/api/prenotazione',
    annulla: '/api/annulla',
    vantaggi: '/api/vantaggi',
    card: '/api/card'
  }
};

/* Le funzioni del server (cartella api/) leggono questo stesso file:
   un solo listino per sito, prenotazioni ed email. */
if (typeof module !== 'undefined' && module.exports) module.exports = BGN_CONFIG;
