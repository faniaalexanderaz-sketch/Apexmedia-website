/* =============================================================
   ANTICA FIORERIA DEL CENTRO — catalogo prodotti (fonte unica)
   Usato da collezione.html e prodotto.html. Il prezzo indicato
   è la taglia M; le altre taglie derivano dai fattori qui sotto.
   XL contiene il doppio dei fiori della M: vale 2×M ma si paga
   il 30% in meno del doppio — da qui il "risparmi il 30%".
   ============================================================= */
var AFC_TAGLIE = [
  { id: 'S',  nome: 'S',  fattore: 0.75, nota: 'Un pensiero: composizione raccolta' },
  { id: 'M',  nome: 'M',  fattore: 1,    nota: 'Il formato classico della bottega' },
  { id: 'L',  nome: 'L',  fattore: 1.5,  nota: 'Abbondante, per fare scena' },
  { id: 'XL', nome: 'XL', fattore: 1.4,  doppio: true, nota: 'Il doppio dei fiori della M' }
];

function afcPrezzoTaglia(prezzoM, taglia) {
  return Math.round(prezzoM * taglia.fattore);
}
/* valore pieno della XL (2 × M): serve per mostrare quanto risparmi */
function afcValoreXL(prezzoM) { return prezzoM * 2; }

var AFC_PRODOTTI = [
  {
    slug: 'vendemmia',
    nome: 'Vendemmia Toscana',
    prezzo: 72,
    foto: 'foto/p-vendemmia.jpg',
    cat: ['stagione', 'premium', 'regali'],
    badge: 'Più venduto',
    rating: ['4,9', 34],
    avail: 'Spedizione in 24/48h',
    desc: 'Dalie bordeaux, melograni e mini zucche in un\'anfora dipinta a mano.',
    descLunga: 'Un\'anfora in ceramica dipinta a mano, decorata a motivi floreali come le trovi nelle botteghe di campagna toscane, colma di dalie color bordeaux, rose ambrate, melograni, fichi e mini zucche tra foglie di quercia e ulivo. È la composizione che porti in tavola quando l\'autunno va festeggiato, non subito: un centrotavola importante che non appassisce mai, pensato per restare protagonista da ottobre a Natale.'
  },
  {
    slug: 'agrumi',
    nome: 'Giardino di Agrumi',
    prezzo: 58,
    foto: 'foto/p-agrumi.jpg',
    cat: ['bouquet', 'mamma', 'stagione'],
    badge: 'Nuovo',
    rating: ['4,9', 21],
    avail: 'Spedizione in 24/48h',
    desc: 'Rose bianche, orchidee e limoni veri al tatto, in un\'urna in marmo.',
    descLunga: 'Rose bianche, orchidee, ranuncoli gialli e ciuffi di limoni e kumquat real touch, composti in un\'urna in marmo bianco venato. Profuma di agrumeto anche se non profuma affatto: la luce e il colore di un pomeriggio in Costiera, fermi per sempre sul tuo tavolo. Il regalo giusto per chi ama il giallo limone più del rosa.'
  },
  {
    slug: 'romanza',
    nome: 'Romanza in Rosa',
    prezzo: 64,
    foto: 'foto/p-romanza.jpg',
    cat: ['anniversario', 'matrimonio', 'mamma'],
    badge: 'Più venduto',
    rating: ['5,0', 27],
    avail: 'Spedizione in 24/48h',
    desc: 'Peonie cipria e rose tea in un\'urna di porcellana bordata d\'oro.',
    descLunga: 'Peonie color cipria, rose tea e ortensie bianche, morbide come un\'acquerello, composte in un\'urna di porcellana crema con bordure dorate e rilievi decorati. La nostra composizione più scelta per gli anniversari e i regali importanti: romantica senza essere stucchevole, elegante anche vista da lontano su una mensola o un tavolo d\'ingresso.'
  },
  {
    slug: 'positano',
    nome: 'Riflessi di Positano',
    prezzo: 68,
    foto: 'foto/p-positano.jpg',
    cat: ['premium', 'novita', 'regali'],
    badge: 'Edizione limitata',
    badgeOro: true,
    rating: ['4,9', 9],
    avail: 'Spedizione in 24/48h',
    desc: 'Ortensie turchesi, orchidee e conchiglie in un vaso di vetro ondulato.',
    descLunga: 'Ortensie color turchese, orchidee bianche, foglie di palma e un tocco di conchiglie e perle, composte in un vaso di vetro colorato dalle forme morbide, come modellato dall\'acqua. Un pezzo scenografico pensato per chi ama il mare più dei fiori classici: perfetto in un ingresso, in un bagno importante o su una consolle vista finestra. Edizione limitata, pochi pezzi disponibili.'
  },
  {
    slug: 'frutteto',
    nome: 'Frutteto in Fiore',
    prezzo: 70,
    foto: 'foto/p-frutteto.jpg',
    cat: ['premium', 'matrimonio', 'regali'],
    badge: 'Nuovo',
    rating: ['4,8', 14],
    avail: 'Spedizione in 24/48h',
    desc: 'Orchidee, rose bianche e grappoli d\'uva in un vaso scultoreo in travertino.',
    descLunga: 'Orchidee bianche, rose, ortensie e calle si intrecciano a grappoli d\'uva, fichi, carciofi e mele verdi real touch, in un vaso scultoreo bicolore in marmo e travertino. Una composizione abbondante e scenografica, ispirata alle nature morte italiane: perfetta per un ricevimento, un ingresso importante o come regalo a chi ha già tutto.'
  },
  {
    slug: 'velluto',
    nome: 'Notte di Velluto',
    prezzo: 85,
    foto: 'foto/p-velluto.jpg',
    cat: ['premium', 'novita'],
    badge: 'Edizione limitata',
    badgeOro: true,
    rating: ['5,0', 8],
    avail: 'Ultimi pezzi',
    availBassa: true,
    desc: 'Rose nere, orchidee viola e dettagli dorati in un vaso scultoreo nero e oro.',
    descLunga: 'Rose nere, dalie bordeaux, orchidee viola e rose champagne, tra foglie scure e ramage dorato, in un vaso scultoreo nero con venature d\'oro colato. La composizione più audace della collezione: drammatica, quasi teatrale, pensata per chi vuole stupire davvero — un compleanno importante, un\'inaugurazione, un regalo che si ricorda. Numero di pezzi limitato.'
  },
  {
    slug: 'raccolto',
    nome: 'Cesto del Raccolto',
    prezzo: 54,
    foto: 'foto/p-raccolto.jpg',
    cat: ['regali', 'stagione', 'novita'],
    rating: ['4,8', 19],
    avail: 'Spedizione in 24/48h',
    desc: 'Rose color miele, stecche di cannella e mini zucche in un cesto di vimini.',
    descLunga: 'Rose color miele, ortensie, orchidee gialle, stecche di cannella, fette d\'arancia essiccate e mini zucche, raccolte in un cesto di vimini con tanto di manico. Il formato più informale e conviviale della collezione: si regala com\'è, senza bisogno di un vaso, ed è perfetto per un tavolo di cucina, una cesta di benvenuto o un pensiero per chi cambia casa.'
  },
  {
    slug: 'cristalli',
    nome: 'Cristalli di Viola',
    prezzo: 82,
    foto: 'foto/p-cristalli.jpg',
    cat: ['premium', 'anniversario', 'novita'],
    badge: 'Edizione limitata',
    badgeOro: true,
    rating: ['5,0', 11],
    avail: 'Ultimi pezzi',
    availBassa: true,
    desc: 'Ortensie viola, orchidee e perle in un vaso di cristallo intagliato.',
    descLunga: 'Ortensie viola e blu, orchidee, rose bianche e foglie argentate, punteggiate di perle e bacche brinate, in un vaso di cristallo dalle linee sinuose. Una composizione preziosa, quasi gioiello, per chi cerca qualcosa di davvero fuori dal comune: perfetta per un anniversario importante o per arredare uno spazio che deve lasciare il segno.'
  },
  {
    slug: 'scrigno',
    nome: 'Scrigno di Borgogna',
    prezzo: 76,
    foto: 'foto/p-scrigno.jpg',
    cat: ['premium', 'regali', 'stagione'],
    rating: ['4,9', 16],
    avail: 'Spedizione in 24/48h',
    desc: 'Rose bordeaux, peonie bianche e grappoli d\'uva in un baule intagliato.',
    descLunga: 'Rose color bordeaux, peonie bianche, orchidee scure, grappoli d\'uva e fichi tra rami di ulivo, composti sopra un baule in legno intagliato con serratura in ottone. Una composizione importante, quasi un pezzo d\'arredamento a sé: ideale per una sala importante, un regalo aziendale o chi ama i fiori come oggetti da collezione più che come bouquet.'
  }
];

var AFC_CATEGORIE = [
  ['tutti', 'Tutti'],
  ['rose', 'Rose'],
  ['bouquet', 'Bouquet'],
  ['stagione', 'Fiori di stagione'],
  ['compleanno', 'Compleanno'],
  ['anniversario', 'Anniversario'],
  ['laurea', 'Laurea'],
  ['matrimonio', 'Matrimonio'],
  ['sanvalentino', 'San Valentino'],
  ['mamma', 'Festa della Mamma'],
  ['piante', 'Piante'],
  ['premium', 'Bouquet Premium'],
  ['regali', 'Regali floreali'],
  ['condoglianze', 'Condoglianze'],
  ['novita', 'Novità']
];

function afcProdotto(slug) {
  for (var i = 0; i < AFC_PRODOTTI.length; i++) {
    if (AFC_PRODOTTI[i].slug === slug) return AFC_PRODOTTI[i];
  }
  return null;
}
