/* =============================================================
   ANTICA FIORERIA DEL CENTRO — catalogo prodotti (fonte unica)
   Usato da collezione.html e prodotto.html. Il prezzo indicato
   è la taglia M; le altre taglie derivano dai fattori qui sotto.
   XL contiene il doppio dei fiori della M: vale 2×M ma si paga
   il 30% in meno del doppio — da qui il "risparmi il 30%".
   Gli articoli con tagliaUnica: true (decorazioni/oggettistica)
   non hanno taglie: si vendono in un formato unico.
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
    slug: 'provenza',
    nome: 'Brezza di Provenza',
    prezzo: 75,
    tagliaFoto: 'M',
    foto: 'foto/p-provenza.jpg',
    cat: ['stagione', 'regali', 'estate'],
    rating: ['4,8', 12],
    avail: 'Spedizione in 24/48h',
    desc: 'Lisianthus viola e giallo, lavanda e limoni veri al tatto, in un\'urna bianca scolpita.',
    descLunga: 'Lisianthus color prugna e giallo miele, spighe dorate, lavanda e piccoli limoni real touch, composti in un\'urna di ceramica bianca dalle decorazioni scolpite a mano. Un tripudio di colore che profuma di Provenza anche senza profumare affatto: perfetta su un tavolo luminoso o come regalo per chi ama i colori vivaci.'
  },
  {
    slug: 'cesta-primavera',
    nome: 'Cesta di Primavera',
    prezzo: 56,
    foto: 'foto/p-cesta-primavera.jpg',
    cat: ['bouquet', 'regali', 'primavera', 'mamma'],
    rating: ['4,9', 15],
    avail: 'Spedizione in 24/48h',
    desc: 'Peonie rosa e margherite viola, in una cesta intrecciata con manico.',
    descLunga: 'Peonie rosa carico, margherite viola e lilla tra foglie di felce, raccolte in una graziosa cesta di bambù intrecciato con manico — pronta da regalare così com\'è, senza bisogno di un vaso. Il formato più informale e conviviale della collezione: perfetta per una visita, un compleanno o un pensiero portato a mano.'
  },
  {
    slug: 'cesta-maggio',
    nome: 'Cesta di Maggio',
    prezzo: 38,
    foto: 'foto/p-cesta-maggio.jpg',
    cat: ['bouquet', 'matrimonio', 'primavera'],
    rating: ['4,8', 11],
    avail: 'Spedizione in 24/48h',
    desc: 'Calle viola, rose crema e mughetto, in una cesta intrecciata con manico.',
    descLunga: 'Calle viola intense, rose color crema e delicati steli di mughetto, tra fili d\'erba e lavanda, raccolti in una cesta di bambù intrecciato con manico. Elegante e romantica, è la composizione giusta per un matrimonio in primavera o per chi ama i toni sfumati tra il viola e il crema.'
  },
  {
    slug: 'orto',
    nome: 'L\'Orto in Casa',
    prezzo: 78,
    foto: 'foto/p-orto.jpg',
    cat: ['regali', 'novita', 'autunno'],
    badge: 'Novità',
    rating: ['5,0', 7],
    avail: 'Spedizione in 24/48h',
    desc: 'Peperoni, cipollotto, cipolla e peperoncini veri al tatto, su un tagliere in legno.',
    descLunga: 'Un peperone giallo, cipollotti, una cipolla dorata, peperoncini piccanti, foglie di insalata e piccoli pomodorini, tutti realizzati real touch, composti su un tagliere in legno naturale con un tocco di cannella e iuta. Un centrotavola originale e sorprendente per la cucina o la sala da pranzo: sembra appena raccolto dall\'orto, ma resta così per sempre.'
  },
  {
    slug: 'sole-campagna',
    nome: 'Sole di Campagna',
    prezzo: 59,
    tagliaFoto: 'S',
    foto: 'foto/p-sole-campagna.jpg',
    cat: ['stagione', 'regali', 'estate'],
    rating: ['4,7', 10],
    avail: 'Spedizione in 24/48h',
    desc: 'Girasole e margherite lilla su una fetta di legno naturale, con fiocco giallo.',
    descLunga: 'Un grande girasole al centro, circondato da margherite lilla e bianche, rose color crema e rametti di verde, appoggiato su una fetta di legno grezzo con un fiocco di raso giallo. Un piccolo centrotavola solare, perfetto per portare l\'estate in tavola tutto l\'anno.'
  },
  {
    slug: 'cuore-rose',
    nome: 'Cuore di Rose',
    prezzo: 76,
    tagliaFoto: 'S',
    foto: 'foto/p-cuore-rose.jpg',
    cat: ['anniversario', 'mamma', 'regali', 'inverno'],
    badge: 'Più venduto',
    rating: ['4,9', 18],
    avail: 'Spedizione in 24/48h',
    desc: 'Rose e peonie rosa cipria, anemone, in un vaso verde con nastro e dettagli a cuore.',
    descLunga: 'Rose inglesi color cipria, peonie e un anemone dai toni rosa antico, raccolti in un piccolo vaso verde smeraldo con perline in rilievo, impreziositi da un nastro viola e un tocco di stoffa a cuoricini. Romantica e delicata, è la composizione ideale per San Valentino, un anniversario o semplicemente per dire "ti penso".'
  },
  {
    slug: 'sole-agrumi',
    nome: 'Sole e Agrumi',
    prezzo: 72,
    tagliaFoto: 'M',
    foto: 'foto/p-sole-agrumi.jpg',
    cat: ['stagione', 'regali', 'autunno'],
    rating: ['4,8', 13],
    avail: 'Spedizione in 24/48h',
    desc: 'Girasoli, limoni e mele veri al tatto, con iuta, in un vaso verde scolpito.',
    descLunga: 'Girasoli dorati, piccole rose color miele, limoni e mele real touch tra foglie lucide e un fiocco di iuta grezza, composti in un vaso verde scolpito a foglie. Allegra e abbondante, è la composizione perfetta per la cucina, un regalo di benvenuto o per chi ama i colori caldi della campagna.'
  },

  /* ---------- decorazioni / oggettistica — formato unico, no taglie ---------- */
  {
    slug: 'gatto-giardiniere',
    nome: 'Gatto Giardiniere',
    prezzo: 65,
    tagliaUnica: true,
    foto: 'foto/p-vaso-gatto.jpg',
    cat: ['decorazioni', 'regali', 'novita'],
    badge: 'Novità',
    rating: ['5,0', 5],
    avail: 'Spedizione in 24/48h',
    desc: 'Un simpatico gatto ricoperto di muschio sintetico, accanto a un cestino con ortensia bianca.',
    descLunga: 'Un gatto scultoreo interamente ricoperto di muschio sintetico verde, seduto accanto a un piccolo cestino di vimini con un\'ortensia bianca real touch. Un pezzo d\'arredo originale e simpatico, perfetto per un davanzale, un ingresso o come regalo a chi ama gli oggetti fuori dal comune. Il vaso a forma di gatto è l\'oggetto in vendita; l\'ortensia lo accompagna.'
  },
  {
    slug: 'pannello-verde',
    nome: 'Giardino Verticale',
    prezzo: 75,
    taglie: [
      { id: '1', nome: '1 pezzo', prezzo: 75,  nota: 'Un pannello singolo, da appoggiare o appendere' },
      { id: '2', nome: '2 pezzi', prezzo: 140, nota: 'Coppia di pannelli: parete verde più ampia, a prezzo ridotto' }
    ],
    foto: 'foto/p-pannello-verde.jpg',
    cat: ['decorazioni', 'novita'],
    badge: 'Novità',
    rating: ['4,7', 4],
    avail: 'Spedizione in 24/48h',
    desc: 'Giardino verticale in verde stabilizzato, per una parete sempre in fiore.',
    descLunga: 'Un giardino verticale ricoperto di muschi e licheni stabilizzati in diverse tonalità di verde, con rami decorativi intrecciati. Si appoggia o si appende, e trasforma una parete spoglia in un piccolo angolo di verde, senza bisogno di luce, acqua o manutenzione. Disponibile in formato singolo o in coppia, per comporre una parete più ampia.'
  },
  {
    slug: 'tiffany',
    nome: 'Tiffany',
    prezzo: 75,
    tagliaUnica: true,
    foto: 'foto/p-tiffany.jpg',
    cat: ['decorazioni', 'regali'],
    rating: ['4,9', 6],
    avail: 'Spedizione in 24/48h',
    desc: 'Quadro con fiori e foglie pressate sotto vetro, cornice color acqua.',
    descLunga: 'Una composizione di fiori e foglie dai toni verde-azzurro, pressata e racchiusa sotto vetro in una cornice in legno dipinta color acqua. Un piccolo quadro botanico da appendere o appoggiare, che porta in casa la delicatezza di un giardino d\'altri tempi.'
  },
  {
    slug: 'cappello-fiorito',
    nome: 'Cappello Fiorito',
    prezzo: 35,
    tagliaUnica: true,
    foto: 'foto/p-cappello.jpg',
    cat: ['decorazioni', 'regali'],
    rating: ['4,8', 8],
    avail: 'Spedizione in 24/48h',
    desc: 'Cappello di paglia con rosa lilla e fiori di campo applicati.',
    descLunga: 'Un cappello a tesa larga in paglia naturale, decorato con una grande rosa color lilla, fiori di campo e un nastro con scritte vintage. Un accessorio scenografico, perfetto da appendere in un ingresso country-chic o da regalare a chi ama lo stile boho.'
  }
];

var AFC_CATEGORIE = [
  ['tutti', 'Tutti'],
  ['novita', 'Novità'],
  ['stagione', 'Fiori di stagione'],
  ['regali', 'Regali floreali'],
  ['anniversario', 'Anniversario'],
  ['matrimonio', 'Matrimonio'],
  ['mamma', 'Festa della Mamma'],
  ['bouquet', 'Bouquet'],
  ['primavera', 'Primavera'],
  ['estate', 'Estate'],
  ['autunno', 'Autunno'],
  ['inverno', 'Inverno'],
  ['decorazioni', 'Decorazioni']
];

function afcProdotto(slug) {
  for (var i = 0; i < AFC_PRODOTTI.length; i++) {
    if (AFC_PRODOTTI[i].slug === slug) return AFC_PRODOTTI[i];
  }
  return null;
}
