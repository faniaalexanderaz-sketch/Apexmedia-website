// Testi della presentazione del progetto (pagina /presentazione).
// Scritti per essere letti dal titolare: niente gergo, ogni scelta ha un perché.

export const startingPoint = [
  {
    title: 'Online esiste solo come scheda',
    text: 'Chi cerca il negozio trova directory e mappe, con informazioni non sempre allineate (in rete compaiono civici e numeri diversi). Nessuna pagina racconta lo stile della boutique.',
  },
  {
    title: 'Il vecchio sito non c’è più',
    text: 'L’indirizzo evasionidimoda.business.site oggi non risponde: Google ha chiuso i siti “business.site” nel 2024. Chi lo trova in giro arriva su una pagina vuota.',
  },
  {
    title: 'Una scheda non fa venire voglia di entrare',
    text: 'Indirizzo e orari dicono dove sei, non perché valga la pena venire. Il sito serve proprio a questo: far vedere i capi, il gusto, il servizio.',
  },
]

export const funnel = [
  { step: 'Cerca', text: 'Google, Maps, Instagram, il passaparola.', site: 'SEO locale, dati strutturati, anteprima social curata.' },
  { step: 'Si innamora', text: 'Foto, nuovi arrivi, stile, opinioni dei clienti.', site: 'Hero, nuovi arrivi, collezioni, recensioni.' },
  { step: 'Agisce', text: 'Chiama, chiede indicazioni, scrive.', site: 'Pulsanti Chiama / Indicazioni ovunque e barra fissa su smartphone.' },
  { step: 'Entra in negozio', text: 'È lì che avviene la vendita.', site: 'Orari e stato “Aperto ora” sempre visibili.' },
]

export const sections = [
  {
    name: 'Hero con arco',
    what: 'Titolo “Lo stile è il tuo modo di evadere.”, foto in una cornice ad arco, due pulsanti, stato “Aperto ora” in tempo reale.',
    why: 'In tre secondi dice chi siete, dove siete e cosa fare. L’arco richiama vetrine e portici; il “Aperto ora · chiude alle 19:30” dà un motivo per passare oggi.',
  },
  {
    name: 'Nastro delle categorie',
    what: 'Donna, Uomo, Maglieria, Calzature… scorrono in grande e accelerano con lo scroll.',
    why: 'Chi non legge capisce comunque l’assortimento in un colpo d’occhio. Il movimento segnala un negozio vivo.',
  },
  {
    name: 'Nuovi arrivi',
    what: 'Impaginazione da rivista con sei capi; ognuno apre una scheda che finisce con “Chiama” o “Indicazioni”.',
    why: 'È il motivo per tornare sul sito e in negozio. Si aggiorna in pochi minuti da un unico file, senza toccare la grafica.',
  },
  {
    name: 'Collezioni da sfogliare',
    what: 'Su computer la pagina si ferma e le categorie scorrono in orizzontale come le pagine di un magazine; su smartphone si sfogliano col dito.',
    why: 'Uomo, donna, calzature e accessori stanno in uno spazio solo, senza pagine da caricare. La scheda bordeaux “Non sai da dove iniziare?” intercetta chi è indeciso e lo porta al telefono.',
  },
  {
    name: 'Il negozio',
    what: 'Un manifesto che si “accende” parola per parola mentre si scorre, foto e i fatti essenziali: per chi, cosa trovi, quali stili.',
    why: 'Dà un volto umano alla boutique. La lettura guidata trattiene l’attenzione proprio sul messaggio che conta.',
  },
  {
    name: 'Recensioni che scorrono',
    what: 'Due nastri di recensioni in direzioni opposte, che si fermano al passaggio del mouse, e il link per lasciarne una su Google.',
    why: 'Prima di entrare in un negozio nuovo le persone vogliono sapere cosa ne pensano gli altri. Tante voci lette di sfuggita creano fiducia senza chiedere un clic; il link a Google aiuta a raccogliere nuove recensioni, che migliorano anche la posizione su Maps.',
  },
  {
    name: 'Ispirazioni di stagione',
    what: 'Tre brevi “articoli” di stile con consigli pratici di abbinamento.',
    why: 'Vi posiziona come consulenti di stile, non come semplice negozio. Gli stessi contenuti diventano post e storie per Instagram.',
  },
  {
    name: 'Il prossimo look ti aspetta',
    what: 'Una grande immagine della boutique e un solo invito: venire a trovarvi.',
    why: 'Chiude il racconto con un’emozione e un’azione chiara, prima delle informazioni pratiche.',
  },
  {
    name: 'Contatti e mappa',
    what: 'Indirizzo, telefono, orari con stato live, pulsanti per chiamare e per il navigatore. La mappa Google si carica solo se richiesta.',
    why: 'Zero attrito per arrivare. E nessun cookie di terze parti finché il visitatore non lo sceglie.',
  },
  {
    name: 'Barra fissa su smartphone',
    what: '“Chiama” e “Indicazioni” sempre a portata di pollice mentre si scorre.',
    why: 'Da telefono la decisione arriva in qualunque punto della pagina: l’azione deve essere lì, in quel momento.',
  },
]

export const animations = [
  { name: 'Ingresso dell’hero', why: 'La foto si scopre, il titolo entra lettera per lettera: la prima impressione è quella di un brand curato.' },
  { name: 'Titoli dalle maschere', why: 'Le parole salgono come in un titolo di testa: danno ritmo alla lettura e segnano l’inizio di ogni capitolo.' },
  { name: 'Foto che si svelano', why: 'Ogni immagine si apre dal basso e si “posa”: crea curiosità e valorizza la fotografia.' },
  { name: 'Galleria orizzontale', why: 'Unico momento in cui la pagina si ferma: le collezioni si sfogliano come una rivista.' },
  { name: 'Manifesto che si accende', why: 'Le parole prendono colore mentre si legge: l’attenzione resta sul messaggio.' },
  { name: 'Nastri in movimento', why: 'Categorie e recensioni scorrono: il sito sembra vivo, come una vetrina.' },
  { name: 'Cursore “Scopri” e pulsanti magnetici', why: 'Sulle foto il cursore diventa un invito; i pulsanti “attirano” il mouse. Piccoli dettagli che fanno cliccare.' },
]

export const animationRules = [
  'Mai bloccare lo scroll o nascondere contenuti a Google',
  'Leggere su smartphone: niente effetti pesanti',
  'Chi disattiva le animazioni nel telefono vede un sito statico e completo',
  'Funziona anche senza JavaScript',
]

export const tech = [
  { title: 'Si apre subito', text: 'La pagina arriva già pronta nell’HTML: il contenuto è visibile prima ancora che partano le animazioni.' },
  { title: 'Immagini leggere', text: 'Ogni foto esiste in 4 misure WebP: il telefono scarica solo quella che gli serve.' },
  { title: 'SEO locale', text: 'Titolo e descrizione per “negozio di abbigliamento ad Alessandria”, dati strutturati ClothingStore con indirizzo e telefono.' },
  { title: 'Privacy', text: 'Nessun cookie finché il visitatore non apre la mappa. Font ospitati sul sito, non su server esterni.' },
  { title: 'Accessibile', text: 'Navigabile da tastiera, contrasti verificati, testi alternativi per ogni foto.' },
  { title: 'Facile da aggiornare', text: 'Nuovi arrivi, collezioni, orari e recensioni vivono in file di testo separati dalla grafica.' },
]

export const needs = [
  'Foto reali: vetrina, interni, capi, dettagli, staff (le attuali sono dimostrative)',
  'Conferma degli orari (oggi presi da una scheda pubblica)',
  'Conferma di civico e numero di telefono (in rete compaiono 91/94 e due numeri diversi)',
  'Numero WhatsApp, se volete ricevere messaggi',
  'Profili Instagram e Facebook ufficiali',
  'Permesso di mostrare le recensioni Google nel sito (già inserite le 5 stelle) e nuove recensioni da aggiungere nel tempo',
  'Seconda sede al Centro Commerciale Gli Archi: se attiva, la aggiungiamo',
  'Marchi trattati, se volete metterli in evidenza',
]

export const nextSteps = [
  { title: 'Messa online', text: 'Dominio, foto reali e dati confermati: il sito diventa quello ufficiale.' },
  { title: 'Google Business Profile', text: 'Scheda allineata al sito (orari, foto, link), il primo punto di contatto su Maps.' },
  { title: 'Più recensioni', text: 'QR code in cassa e link diretto: ogni cliente soddisfatto diventa visibilità.' },
  { title: 'Nuovi arrivi ogni mese', text: 'Aggiornamento costante della vetrina digitale, ripreso sui social.' },
  { title: 'Campagne locali', text: 'Annunci Meta e Google su Alessandria e dintorni, diretti alla pagina dei nuovi arrivi.' },
  { title: 'Misurare', text: 'Ogni clic su “Chiama” e “Indicazioni” viene contato: report mensile chiaro.' },
]
