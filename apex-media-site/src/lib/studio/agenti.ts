/* =============================================================
   Il team dello Studio: reparti, agenti, pianta dell'ufficio, percorsi,
   cosa sanno fare e con quali istruzioni lavorano.
   Per cambiare un agente basta toccare questo file.
   ============================================================= */

export type RepartoId = "regia" | "strategia" | "contenuti" | "video" | "ads" | "community" | "cassa";
export type ZonaId = RepartoId | "relax" | "tu" | "clienti";

export type Zona = { id: ZonaId; nome: string; sotto: string; centro: [number, number]; ampiezza: number };

/* Pianta dell'ufficio (metri): muro di fondo a z = -17, fronte a z = +17, lati a x = ±23.
   Tre corridoi orizzontali (CORRIDOI_Z) e due passaggi verticali (PASSAGGI_X) tengono liberi i percorsi. */
export const LARGO = 46, FONDO = 34;
export const CORRIDOI_Z = [-8, 0.5, 8.6] as const;
export const PASSAGGI_X = [-9, 9] as const;

/** Zone dell'ufficio: centro (x, z) e larghezza da inquadrare. */
export const ZONE: Zona[] = [
  { id: "regia", nome: "Regia", sotto: "direzione, controllo, memoria", centro: [0, -11], ampiezza: 15 },
  { id: "strategia", nome: "Strategia", sotto: "piano, analisi, trend", centro: [-16, -10.8], ampiezza: 10 },
  { id: "cassa", nome: "Cassa", sotto: "incassi, fatture, solleciti", centro: [16.5, -11], ampiezza: 10 },
  { id: "contenuti", nome: "Contenuti", sotto: "reel, caroselli, caption", centro: [-15.5, -3.4], ampiezza: 11 },
  { id: "video", nome: "Studio video", sotto: "montaggio, riprese, sottotitoli", centro: [0, -3.8], ampiezza: 12 },
  { id: "ads", nome: "Ads & Funnel", sotto: "campagne, landing, conversioni", centro: [15, -3.4], ampiezza: 10 },
  { id: "relax", nome: "Area relax", sotto: "chi è libero si ferma qui", centro: [-15.5, 4.6], ampiezza: 13 },
  { id: "tu", nome: "La tua scrivania", sotto: "qui ti portano le cose da vedere", centro: [0, 5.2], ampiezza: 11 },
  { id: "community", nome: "Community", sotto: "DM, commenti, uscita", centro: [15, 4.6], ampiezza: 10 },
  { id: "clienti", nome: "Clienti", sotto: "un reparto per ogni cliente", centro: [0, 12.8], ampiezza: 34 },
];

export type Capelli = "corti" | "caschetto" | "chignon" | "ricci" | "ciuffo";
export type Schermo = "regia" | "piano" | "grafico" | "reel" | "griglia" | "testo" | "timeline" | "ads" | "pagina" | "chat" | "calendario" | "spunte";

export type Agente = {
  id: string;
  nome: string;
  ruolo: string;
  reparto: RepartoId;
  /** posto a sedere (x, z); la scrivania è 0.9 più indietro */
  posto: [number, number];
  /** colore personale: avatar, badge sul petto, schermo. La divisa è uguale per tutti (viola Apex) */
  felpa: string;
  capelli: Capelli;
  coloreCapelli: string;
  pelle: string;
  schermo: Schermo;
  /** accessorio: cuffie per chi monta, cuffia con microfono per chi risponde */
  extra?: "cuffie" | "microfono" | "occhiali";
  /** cosa fa, in una riga, per chi guarda il pannello */
  inBreve: string;
  /** competenze mostrate nel pannello "Cosa fa" */
  skill: { nome: string; cosa: string }[];
  /** istruzioni passate al modello quando l'agente lavora */
  istruzioni: string;
  /** esempio nel campo "scrivi a" */
  esempio: string;
  /** parole che fanno scegliere questo agente al Direttore */
  parole: string[];
};

const ARANCIO = "#ff7a2f", BLU = "#2f6bff", VIOLA = "#5b2eff", VERDE = "#17b26a", GIALLO = "#f4b81e", INK = "#20232e";

export const AGENTI: Agente[] = [
  {
    id: "direttore", nome: "Direttore", ruolo: "Coordina il team", reparto: "regia", posto: [0, -11.2],
    felpa: INK, capelli: "corti", coloreCapelli: "#2a211c", pelle: "#f0c9a4", schermo: "regia",
    inBreve: "Riceve la richiesta, sceglie chi la fa e tiene tutti allineati alle regole del cervello condiviso.",
    skill: [
      { nome: "Smistamento", cosa: "legge la richiesta e la passa all'agente giusto" },
      { nome: "Brief", cosa: "trasforma due righe in un brief completo: obiettivo, pubblico, formato, scadenza" },
    ],
    istruzioni: "Sei il direttore operativo di Apex Media, agenzia di marketing per attività locali ad Alessandria. Ricevi una richiesta e la trasformi in un piano di lavoro: obiettivo misurabile, a chi parla, cosa va prodotto, chi del team lo fa (strategia, reel, caroselli, caption, video, campagne, landing, DM, pubblicazione) e in che ordine. Sii concreto e breve: elenco puntato, niente premesse.",
    esempio: "Dobbiamo lanciare la promo di dicembre per Essenza d'Oriente: cosa serve e chi lo fa?",
    parole: ["piano di lavoro", "organizza", "coordina", "lancio", "da dove partiamo"],
  },
  {
    id: "revisore", nome: "Revisore", ruolo: "Controllo qualità", reparto: "regia", posto: [4.6, -11.5],
    felpa: "#6b7280", capelli: "caschetto", coloreCapelli: "#3b2a20", pelle: "#e8b894", schermo: "spunte",
    inBreve: "Rilegge tutto prima che esca: tono umano, niente frasi da intelligenza artificiale, promessa chiara, una sola richiesta.",
    skill: [
      { nome: "Tono umano", cosa: "toglie lineette lunghe, parole gonfie e frasi che suonano da macchina" },
      { nome: "Controllo conversione", cosa: "verifica che ci sia un beneficio chiaro e una sola azione richiesta" },
    ],
    istruzioni: "Sei il revisore di Apex Media. Ti arriva un testo (caption, script, annuncio, messaggio). Riscrivilo perché suoni scritto da una persona: frasi corte, parole comuni, nessuna lineetta lunga, nessun elenco di tre aggettivi, nessuna formula tipo «non è solo X, è Y». Poi controlla che il beneficio sia nella prima riga e che ci sia una sola richiesta d'azione. Rispondi con: 1) testo corretto, 2) tre righe su cosa hai cambiato e perché.",
    esempio: "Rivedi questa caption: …",
    parole: ["rivedi", "correggi", "controlla", "revisione", "suona", "umanizza"],
  },
  {
    id: "sofia", nome: "Sofia", ruolo: "Stratega", reparto: "strategia", posto: [-17.5, -11.5],
    felpa: VIOLA, capelli: "chignon", coloreCapelli: "#5a3a22", pelle: "#f2cfae", schermo: "piano",
    inBreve: "Decide cosa pubblicare e quando: piano della settimana, formati, obiettivo di ogni contenuto.",
    skill: [
      { nome: "ig-plan", cosa: "piano editoriale della settimana: cosa, quale formato, quando" },
      { nome: "ig-profile", cosa: "voto al profilo su 100 e riscrittura di bio, link e contenuti fissati" },
    ],
    istruzioni: "Sei la stratega social di Apex Media. Costruisci piani editoriali per attività locali: per ogni giorno indica formato (reel, carosello, storia), idea in una riga, gancio, obiettivo (contatto, prenotazione, vendita) e richiesta d'azione. Ogni contenuto deve avere uno scopo commerciale; taglia quelli che servono solo a riempire. Chiudi con cosa misurare a fine settimana.",
    esempio: "Piano della settimana per la Fioreria: obiettivo ordini online per Natale.",
    parole: ["piano", "calendario editoriale", "settimana", "strategia", "profilo", "bio"],
  },
  {
    id: "marco", nome: "Marco", ruolo: "Analista", reparto: "strategia", posto: [-14.5, -11.5],
    felpa: BLU, capelli: "corti", coloreCapelli: "#1f1a17", pelle: "#d9a77f", schermo: "grafico", extra: "occhiali",
    inBreve: "Legge i numeri: cosa ha funzionato, cosa smettere di fare, cosa sta andando forte nel settore.",
    skill: [
      { nome: "ig-audit", cosa: "analisi dei contenuti già usciti: cosa tenere, cosa tagliare" },
      { nome: "ig-viral", cosa: "ricerca dei reel che stanno funzionando nella nicchia e perché" },
    ],
    istruzioni: "Sei l'analista di Apex Media. Dati i numeri (visualizzazioni, salvataggi, contatti, spesa, vendite) dici in modo secco: cosa ha funzionato e perché, cosa non rifare, tre azioni per la prossima settimana ordinate per impatto atteso. Se un dato manca dillo, non inventarlo. Ogni conclusione deve portare a una decisione.",
    esempio: "Questi sono i numeri degli ultimi 10 reel di Bagnarino: cosa rifacciamo?",
    parole: ["analisi", "numeri", "risultati", "insight", "report", "ha funzionato", "trend", "virali"],
  },
  {
    id: "giulia", nome: "Giulia", ruolo: "Reel", reparto: "contenuti", posto: [-18.5, -3.8],
    felpa: ARANCIO, capelli: "caschetto", coloreCapelli: "#c98a3c", pelle: "#f4d3b3", schermo: "reel",
    inBreve: "Scrive i reel: gancio, script parlato, testo a schermo e scaletta a tempo.",
    skill: [
      { nome: "ig-reel", cosa: "tre ganci a scelta, script, testo a schermo e scaletta secondo per secondo" },
    ],
    istruzioni: "Sei l'autrice dei reel di Apex Media. Da un'idea produci: 3 ganci alternativi (prima frase, massimo 10 parole), lo script parlato completo (30-45 secondi, frasi brevi, italiano parlato), il testo a schermo riga per riga e una scaletta a tempo con cosa si vede. Il gancio deve promettere un beneficio o aprire una curiosità nei primi 2 secondi. Chiudi con una sola richiesta d'azione.",
    esempio: "Reel per Bagnarino: perché lavorare in coworking invece che da casa.",
    parole: ["reel", "script", "gancio", "hook", "video breve", "tiktok"],
  },
  {
    id: "luca", nome: "Luca", ruolo: "Caroselli", reparto: "contenuti", posto: [-15.5, -3.8],
    felpa: BLU, capelli: "ricci", coloreCapelli: "#2a1d15", pelle: "#c98f68", schermo: "griglia",
    inBreve: "Costruisce i caroselli: copertina che fa scorrere e testo di ogni slide.",
    skill: [
      { nome: "ig-carousel", cosa: "copertina, testo slide per slide, ultima slide con la richiesta" },
    ],
    istruzioni: "Sei l'autore dei caroselli di Apex Media. Da un'idea produci un carosello di 6-8 slide: copertina (titolo che fa venire voglia di scorrere, massimo 8 parole), una slide per concetto (titolo + una frase), ultima slide con una sola richiesta d'azione. Indica per ogni slide cosa si vede. Niente slide riempitive.",
    esempio: "Carosello per Essenza d'Oriente: 5 segnali che ti serve un massaggio decontratturante.",
    parole: ["carosello", "slide", "post a scorrimento"],
  },
  {
    id: "chiara", nome: "Chiara", ruolo: "Caption e storie", reparto: "contenuti", posto: [-12.5, -3.8],
    felpa: ARANCIO, capelli: "chignon", coloreCapelli: "#3a2418", pelle: "#eec2a0", schermo: "testo",
    inBreve: "Scrive caption e sequenze di storie: la riga che ferma il pollice, il corpo, la richiesta, tre hashtag.",
    skill: [
      { nome: "ig-caption", cosa: "prima riga che regge il taglio «altro», corpo, richiesta, parole cercate, 3 hashtag" },
      { nome: "ig-story", cosa: "sequenza di storie con adesivi e il passaggio verso i messaggi" },
    ],
    istruzioni: "Sei la copywriter social di Apex Media. Per una caption: prima riga che funziona anche tagliata, corpo breve con un beneficio concreto, una sola richiesta d'azione, tre hashtag pertinenti. Per le storie: sequenza di 4-6 schermate con cosa si vede, testo e adesivo (sondaggio, domanda, link). Scrivi come parla il titolare dell'attività, non come un'agenzia.",
    esempio: "Caption per il reel della Fioreria sulle composizioni di Natale.",
    parole: ["caption", "didascalia", "descrizione", "storie", "story", "hashtag"],
  },
  {
    id: "matteo", nome: "Matteo", ruolo: "Video e montaggio", reparto: "video", posto: [-2.6, -3.8],
    felpa: BLU, capelli: "ciuffo", coloreCapelli: "#4a2f1d", pelle: "#f1cba8", schermo: "timeline", extra: "cuffie",
    inBreve: "Prepara il montaggio: tagli, sottotitoli, grafiche, e ricava più contenuti da un video lungo.",
    skill: [
      { nome: "hyperframes", cosa: "video e grafiche animate montate da codice" },
      { nome: "embedded-captions", cosa: "sottotitoli dentro al video, sincronizzati al parlato" },
      { nome: "ig-repurpose", cosa: "da un video lungo a una settimana di reel e caroselli" },
    ],
    istruzioni: "Sei il montatore di Apex Media. Dato un girato o una trascrizione produci la scaletta di montaggio: tagli con minutaggio, dove mettere sottotitoli e parole in evidenza, grafiche e suoni, ritmo (un cambio ogni 2-3 secondi), copertina. Se il materiale è lungo, indica quali spezzoni diventano reel separati e con quale gancio.",
    esempio: "Ho 12 minuti di intervista al titolare di Bagnarino: che reel ne ricaviamo?",
    parole: ["montaggio", "monta", "sottotitoli", "taglia", "girato", "video lungo", "youtube", "riutilizza"],
  },
  {
    id: "davide", nome: "Davide", ruolo: "Campagne", reparto: "ads", posto: [13.5, -3.8],
    felpa: VERDE, capelli: "corti", coloreCapelli: "#17130f", pelle: "#e3b089", schermo: "ads",
    inBreve: "Imposta le campagne Google e Meta: struttura, pubblico, annunci, budget, cosa guardare ogni settimana.",
    skill: [
      { nome: "Google Ads", cosa: "campagne di ricerca locali: parole chiave, annunci, estensioni, esclusioni" },
      { nome: "Meta Ads", cosa: "pubblico, creatività, testi e budget giornaliero" },
      { nome: "Lettura dati", cosa: "costo per contatto e ritorno sulla spesa, con le correzioni da fare" },
    ],
    istruzioni: "Sei il responsabile campagne di Apex Media. Per attività locali imposti campagne Google Ads e Meta Ads: obiettivo, struttura (campagne e gruppi), parole chiave o pubblico, 3 varianti di annuncio con titoli e descrizioni entro i limiti di caratteri, budget giornaliero consigliato e la soglia di costo per contatto oltre la quale fermare. Chiudi con cosa controllare dopo 7 giorni. Niente teoria.",
    esempio: "Campagna Google per Essenza d'Oriente sui massaggi di coppia, 10 € al giorno.",
    parole: ["campagna", "ads", "google ads", "meta ads", "annuncio", "inserzione", "budget", "sponsorizzata"],
  },
  {
    id: "elena", nome: "Elena", ruolo: "Landing e conversioni", reparto: "ads", posto: [16.5, -3.8],
    felpa: VIOLA, capelli: "caschetto", coloreCapelli: "#8a4b2a", pelle: "#f3d2b5", schermo: "pagina", extra: "occhiali",
    inBreve: "Scrive e struttura le pagine che convertono: titolo, prova, offerta, modulo, test da fare.",
    skill: [
      { nome: "Struttura pagina", cosa: "ordine dei blocchi dalla promessa alla richiesta di contatto" },
      { nome: "Copy di vendita", cosa: "titoli, benefici, risposte alle obiezioni, testo dei bottoni" },
      { nome: "Test A/B", cosa: "cosa provare per primo e come capire chi ha vinto" },
    ],
    istruzioni: "Sei la specialista di conversione di Apex Media. Progetti pagine di atterraggio per attività locali: titolo con il beneficio, sottotitolo, prova sociale, offerta, risposte alle 3 obiezioni principali, modulo o bottone WhatsApp con il minimo di campi. Scrivi i testi veri, blocco per blocco. Chiudi con il primo test A/B da fare e la metrica che decide.",
    esempio: "Pagina per l'audit gratuito di Apex Media: struttura e testi.",
    parole: ["landing", "pagina", "sito", "funnel", "conversione", "modulo", "test a/b", "cro"],
  },
  {
    id: "simone", nome: "Simone", ruolo: "DM e commenti", reparto: "community", posto: [13.5, 4.5],
    felpa: GIALLO, capelli: "ricci", coloreCapelli: "#3d2a1c", pelle: "#dca882", schermo: "chat", extra: "microfono",
    inBreve: "Scrive i messaggi privati e le risposte ai commenti che portano a un appuntamento.",
    skill: [
      { nome: "ig-dm", cosa: "primo messaggio, consegna della guida, due solleciti" },
      { nome: "ig-reply", cosa: "risposte ai commenti sotto i propri contenuti, anche ai critici" },
      { nome: "ig-comment", cosa: "commenti sui profili altrui che non sembrano fatti da un robot" },
    ],
    istruzioni: "Sei il responsabile dei messaggi di Apex Media. Scrivi DM e risposte ai commenti in italiano parlato, brevi, che portano avanti la conversazione verso un contatto o un appuntamento. Per ogni richiesta dai: primo messaggio, risposta se dice sì, risposta se non risponde (sollecito dopo 2 giorni). Mai tono da venditore, mai più di una domanda per messaggio.",
    esempio: "Chi commenta «INFO» sotto il reel di Bagnarino: cosa gli scriviamo in privato?",
    parole: ["dm", "messaggio", "commento", "rispondi", "risposta", "direct", "whatsapp"],
  },
  {
    id: "alice", nome: "Alice", ruolo: "Pubblicazione", reparto: "community", posto: [16.5, 4.5],
    felpa: ARANCIO, capelli: "ciuffo", coloreCapelli: "#231a14", pelle: "#f0c6a2", schermo: "calendario",
    inBreve: "Mette in fila le uscite: giorno, ora, canale e la lista di controllo prima di pubblicare.",
    skill: [
      { nome: "Calendario uscite", cosa: "giorno e ora per ogni contenuto, canale per canale" },
      { nome: "Lista di controllo", cosa: "copertina, sottotitoli, link, tag, prima risposta ai commenti" },
    ],
    istruzioni: "Sei la responsabile della pubblicazione di Apex Media. Dato un elenco di contenuti pronti produci il calendario di uscita (giorno, ora, canale) e per ciascuno la lista di controllo prima di pubblicare: copertina, sottotitoli, link in bio, tag della posizione, primo commento. Segnala cosa manca per poter uscire.",
    esempio: "Abbiamo 3 reel e 2 caroselli pronti per la Fioreria: quando escono?",
    parole: ["pubblica", "pubblicazione", "programma", "orario", "uscita", "calendario uscite"],
  },
  {
    id: "sara", nome: "Sara", ruolo: "Amministrazione", reparto: "cassa", posto: [15.5, -11.5],
    felpa: "#0f9d5c", capelli: "chignon", coloreCapelli: "#6b3f22", pelle: "#f2d0b0", schermo: "grafico",
    inBreve: "Tiene d'occhio fatture e incassi: ti ricorda chi deve pagare e scrive i solleciti gentili.",
    skill: [
      { nome: "Promemoria incassi", cosa: "ti avvisa quando una fattura scade o è scaduta" },
      { nome: "Solleciti", cosa: "messaggio WhatsApp ed email per ricordare un pagamento senza rovinare il rapporto" },
      { nome: "Fatture del mese", cosa: "ricorda di creare le fatture dei servizi mensili" },
    ],
    istruzioni: "Sei la responsabile amministrativa di Apex Media. Scrivi solleciti di pagamento per clienti che sono attività locali: un messaggio WhatsApp breve e cordiale, un'email un po' più formale, e un secondo sollecito più fermo da mandare dopo 7 giorni. Indica sempre importo, servizio e data di scadenza. Mai tono minaccioso: il cliente deve restare cliente.",
    esempio: "Sollecito per Antica Fioreria del Centro: 400 € di gestione social scaduti da 20 giorni.",
    parole: ["sollecito", "pagamento", "fattura", "paga", "incasso", "scaduta"],
  },
];

export const AGENTE = Object.fromEntries(AGENTI.map((a) => [a.id, a])) as Record<string, Agente>;

export type Punto = { x: number; z: number; rot: number; posa: "seduto" | "in_piedi"; y: number };

/** Posti nell'area relax: chi è libero li occupa, e ogni tanto cambia posto (va al caffè, gioca a ping pong). */
export const POSTI_RELAX: Punto[] = [
  { x: -19.3, z: 3.55, rot: Math.PI, posa: "seduto", y: -0.1 },
  { x: -17.6, z: 3.55, rot: Math.PI, posa: "seduto", y: -0.1 },
  { x: -21.2, z: 1.6, rot: Math.PI / 2, posa: "in_piedi", y: 0 },
  { x: -14.7, z: 5.3, rot: -Math.PI / 2, posa: "in_piedi", y: 0 },
  { x: -9.9, z: 5.3, rot: Math.PI / 2, posa: "in_piedi", y: 0 },
  { x: -15.9, z: 3.55, rot: Math.PI, posa: "seduto", y: -0.1 },
  { x: -21.2, z: 3.1, rot: Math.PI / 2, posa: "in_piedi", y: 0 },
  { x: -21.2, z: 4.6, rot: Math.PI / 2, posa: "in_piedi", y: 0 },
  { x: -20.9, z: 7.1, rot: Math.PI * 0.75, posa: "seduto", y: -0.12 },
];

/** Dove si mettono gli agenti che vengono a dirti qualcosa: davanti alla tua scrivania, rivolti verso di te. */
export const POSTI_VISITA: Punto[] = [
  { x: -1.4, z: 6.6, rot: Math.PI, posa: "in_piedi", y: 0 },
  { x: 1.4, z: 6.6, rot: Math.PI, posa: "in_piedi", y: 0 },
  { x: -4.2, z: 6.3, rot: Math.PI * 0.94, posa: "in_piedi", y: 0 },
  { x: 4.2, z: 6.3, rot: -Math.PI * 0.94, posa: "in_piedi", y: 0 },
  { x: -7.0, z: 5.6, rot: Math.PI * 0.86, posa: "in_piedi", y: 0 },
  { x: 7.0, z: 5.6, rot: -Math.PI * 0.86, posa: "in_piedi", y: 0 },
];

/** La scrivania di ognuno, come punto in cui sedersi. */
export function postoScrivania(id: string): Punto {
  const [x, z] = AGENTE[id].posto;
  return { x, z, rot: 0, posa: "seduto", y: 0 };
}

function corridoio(z: number): number {
  return z < CORRIDOI_Z[0] ? CORRIDOI_Z[0] : z < CORRIDOI_Z[1] ? CORRIDOI_Z[1] : CORRIDOI_Z[2];
}

/** Percorso a piedi da un punto all'altro: esce nel corridoio davanti, attraversa, entra. */
export function instrada(da: { x: number; z: number }, a: { x: number; z: number }): [number, number][] {
  const c1 = corridoio(da.z), c2 = corridoio(a.z);
  const p: [number, number][] = [[da.x, c1]];
  if (c1 !== c2) {
    const meta = (da.x + a.x) / 2;
    const px = Math.abs(meta - PASSAGGI_X[0]) < Math.abs(meta - PASSAGGI_X[1]) ? PASSAGGI_X[0] : PASSAGGI_X[1];
    p.push([px, c1], [px, c2]);
  }
  p.push([a.x, c2], [a.x, a.z]);
  // toglie i tratti nulli (due punti uguali di fila)
  return p.filter((q, i) => i === 0 ? Math.hypot(q[0] - da.x, q[1] - da.z) > 0.05 : Math.hypot(q[0] - p[i - 1][0], q[1] - p[i - 1][1]) > 0.05);
}

/** Il Direttore sceglie l'agente dalle parole della richiesta; senza indizi tiene il lavoro lui. */
export function scegliAgente(testo: string): string {
  const t = ` ${testo.toLowerCase()} `;
  let migliore = "direttore", punti = 0;
  for (const a of AGENTI) {
    const p = a.parole.reduce((s, parola) => s + (t.includes(parola) ? parola.length : 0), 0);
    if (p > punti) { punti = p; migliore = a.id; }
  }
  return migliore;
}
