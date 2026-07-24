/* =============================================================
   ANTICA FIORERIA DEL CENTRO — catalogo prodotti (fonte unica)
   Usato da collezione.html e prodotto.html. Il prezzo indicato
   è la taglia M; le altre taglie derivano dai fattori qui sotto.
   XL contiene il doppio dei fiori della M: vale 2×M ma si paga
   il 30% in meno del doppio — da qui il "risparmi il 30%".
   Gli articoli con tagliaUnica: true (decorazioni/oggettistica)
   non hanno taglie: si vendono in un formato unico.
   Campo opzionale "galleria": array di foto in più (oltre a "foto",
   che resta la copertina su card/collezione) da scorrere nella
   pagina del singolo prodotto, es. galleria: [p.foto, 'foto/x-2.jpg'].
   Se assente, la pagina prodotto mostra solo "foto".
   Campo opzionale "sconto": percentuale dei Saldi Estivi (20 o 15).
   Se assente il prodotto resta a prezzo pieno (es. borsa-lavanda).
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

/* Saldi Estivi: sconto percentuale opzionale per prodotto (campo "sconto").
   Applicato sul prezzo già calcolato per la taglia scelta. */
function afcPrezzoScontato(prezzo, prod) {
  return (prod && prod.sconto) ? Math.round(prezzo * (1 - prod.sconto / 100)) : prezzo;
}

var AFC_PRODOTTI = [
  {
    slug: 'provenza',
    nome: 'Brezza di Provenza',
    prezzo: 75,
    sconto: 20,
    taglie: [
      { id: 'S',  nome: 'S',  prezzo: 56,  nota: 'Un pensiero: composizione raccolta' },
      { id: 'M',  nome: 'M',  prezzo: 75,  nota: 'Il formato classico della bottega' },
      { id: 'L',  nome: 'L',  prezzo: 106, nota: 'Abbondante, per fare scena' },
      { id: 'XL', nome: 'XL', prezzo: 138, doppio: true, nota: 'Il doppio dei fiori della M' }
    ],
    tagliaFoto: 'M',
    foto: 'foto/p-provenza.jpg',
    cat: ['stagione', 'regali', 'estate'],
    rating: ['4,8', 12],
    avail: 'Spedizione in 48/72h',
    desc: 'Lisianthus viola e giallo, lavanda e limoni veri al tatto, in un\'urna bianca scolpita.',
    descLunga: 'Lisianthus color prugna e giallo miele, spighe dorate, lavanda e piccoli limoni real touch, composti in un\'urna di ceramica bianca dalle decorazioni scolpite a mano. Un tripudio di colore che profuma di Provenza anche senza profumare affatto: perfetta su un tavolo luminoso o come regalo per chi ama i colori vivaci.'
  },
  {
    slug: 'cesta-primavera',
    nome: 'Cesta di Primavera',
    prezzo: 60,
    sconto: 20,
    taglie: [
      { id: 'L', nome: 'L', prezzo: 60, nota: 'Formato generoso, unica taglia disponibile' }
    ],
    foto: 'foto/p-cesta-primavera.jpg',
    cat: ['bouquet', 'regali', 'primavera', 'mamma'],
    rating: ['4,9', 15],
    avail: 'Spedizione in 48/72h',
    desc: 'Peonie rosa e margherite viola, in una cesta intrecciata con manico.',
    descLunga: 'Peonie rosa carico, margherite viola e lilla tra foglie di felce, raccolte in una graziosa cesta di bambù intrecciato con manico — pronta da regalare così com\'è, senza bisogno di un vaso. Il formato più informale e conviviale della collezione: perfetta per una visita, un compleanno o un pensiero portato a mano.'
  },
  {
    slug: 'cesta-maggio',
    nome: 'Cesta di Maggio',
    prezzo: 43,
    sconto: 20,
    taglie: [
      { id: 'M', nome: 'M', prezzo: 43, nota: 'Formato classico, unica taglia disponibile' }
    ],
    foto: 'foto/p-cesta-maggio.jpg',
    cat: ['bouquet', 'matrimonio', 'primavera'],
    rating: ['4,8', 11],
    avail: 'Spedizione in 48/72h',
    desc: 'Calle viola, rose crema e mughetto, in una cesta intrecciata con manico.',
    descLunga: 'Calle viola intense, rose color crema e delicati steli di mughetto, tra fili d\'erba e lavanda, raccolti in una cesta di bambù intrecciato con manico. Elegante e romantica, è la composizione giusta per un matrimonio in primavera o per chi ama i toni sfumati tra il viola e il crema.'
  },
  {
    slug: 'orto',
    nome: 'L\'Orto in Casa',
    prezzo: 78,
    sconto: 20,
    taglie: [
      { id: 'S',  nome: 'S',  prezzo: 59,  nota: 'Un pensiero: composizione raccolta' },
      { id: 'M',  nome: 'M',  prezzo: 78,  nota: 'Il formato classico della bottega' },
      { id: 'L',  nome: 'L',  prezzo: 106, nota: 'Abbondante, per fare scena' },
      { id: 'XL', nome: 'XL', prezzo: 138, doppio: true, nota: 'Il doppio dei fiori della M' }
    ],
    foto: 'foto/p-orto.jpg',
    galleria: ['foto/p-orto.jpg', 'foto/p-orto-2.jpg', 'foto/p-orto-3.jpg'],
    cat: ['regali', 'novita', 'autunno'],
    badge: 'Novità',
    rating: ['5,0', 7],
    avail: 'Spedizione in 48/72h',
    desc: 'Peperoni, cipollotto, cipolla e peperoncini veri al tatto, su un tagliere in legno.',
    descLunga: 'Un peperone giallo, cipollotti, una cipolla dorata, peperoncini piccanti, foglie di insalata e piccoli pomodorini, tutti realizzati real touch, composti su un tagliere in legno naturale con un tocco di cannella e iuta. Un centrotavola originale e sorprendente per la cucina o la sala da pranzo: sembra appena raccolto dall\'orto, ma resta così per sempre.'
  },
  {
    slug: 'sole-campagna',
    nome: 'Sole di Campagna',
    prezzo: 69,
    sconto: 20,
    taglie: [
      { id: 'S',  nome: 'S',  prezzo: 48,  nota: 'Un pensiero: composizione raccolta' },
      { id: 'M',  nome: 'M',  prezzo: 69,  nota: 'Il formato classico della bottega' },
      { id: 'L',  nome: 'L',  prezzo: 94,  nota: 'Abbondante, per fare scena' },
      { id: 'XL', nome: 'XL', prezzo: 131, doppio: true, nota: 'Il doppio dei fiori della M' }
    ],
    tagliaFoto: 'S',
    foto: 'foto/p-sole-campagna.jpg',
    galleria: ['foto/p-sole-campagna.jpg', 'foto/p-sole-campagna-2.jpg', 'foto/p-sole-campagna-3.jpg'],
    cat: ['stagione', 'regali', 'estate'],
    rating: ['4,7', 10],
    avail: 'Spedizione in 48/72h',
    desc: 'Girasole e margherite lilla su una fetta di legno naturale, con fiocco giallo.',
    descLunga: 'Un grande girasole al centro, circondato da margherite lilla e bianche, rose color crema e rametti di verde, appoggiato su una fetta di legno grezzo con un fiocco di raso giallo. Un piccolo centrotavola solare, perfetto per portare l\'estate in tavola tutto l\'anno.'
  },
  {
    slug: 'cuore-rose',
    nome: 'Cuore di Rose',
    prezzo: 85,
    sconto: 20,
    taglie: [
      { id: 'S',  nome: 'S',  prezzo: 69,  nota: 'Un pensiero: composizione raccolta' },
      { id: 'M',  nome: 'M',  prezzo: 85,  nota: 'Il formato classico della bottega' },
      { id: 'L',  nome: 'L',  prezzo: 106, nota: 'Abbondante, per fare scena' },
      { id: 'XL', nome: 'XL', prezzo: 138, doppio: true, nota: 'Il doppio dei fiori della M' }
    ],
    tagliaFoto: 'S',
    foto: 'foto/p-cuore-rose.jpg',
    cat: ['anniversario', 'mamma', 'regali', 'inverno'],
    badge: 'Più venduto',
    rating: ['4,9', 18],
    avail: 'Spedizione in 48/72h',
    desc: 'Rose e peonie rosa cipria, anemone, in un vaso verde con nastro e dettagli a cuore.',
    descLunga: 'Rose inglesi color cipria, peonie e un anemone dai toni rosa antico, raccolti in un piccolo vaso verde smeraldo con perline in rilievo, impreziositi da un nastro viola e un tocco di stoffa a cuoricini. Romantica e delicata, è la composizione ideale per San Valentino, un anniversario o semplicemente per dire "ti penso".'
  },
  {
    slug: 'sole-agrumi',
    nome: 'Sole e Agrumi',
    prezzo: 80,
    sconto: 20,
    taglie: [
      { id: 'S',  nome: 'S',  prezzo: 58,  nota: 'Un pensiero: composizione raccolta' },
      { id: 'M',  nome: 'M',  prezzo: 80,  nota: 'Il formato classico della bottega' },
      { id: 'L',  nome: 'L',  prezzo: 105, nota: 'Abbondante, per fare scena' },
      { id: 'XL', nome: 'XL', prezzo: 138, doppio: true, nota: 'Il doppio dei fiori della M' }
    ],
    tagliaFoto: 'M',
    foto: 'foto/p-sole-agrumi.jpg',
    cat: ['stagione', 'regali', 'autunno'],
    rating: ['4,8', 13],
    avail: 'Spedizione in 48/72h',
    desc: 'Girasoli, limoni e mele veri al tatto, con iuta, in un vaso verde scolpito.',
    descLunga: 'Girasoli dorati, piccole rose color miele, limoni e mele real touch tra foglie lucide e un fiocco di iuta grezza, composti in un vaso verde scolpito a foglie. Allegra e abbondante, è la composizione perfetta per la cucina, un regalo di benvenuto o per chi ama i colori caldi della campagna.'
  },

  /* ---------- decorazioni / oggettistica — formato unico, no taglie ---------- */
  {
    slug: 'gatto-giardiniere',
    nome: 'Gatto Giardiniere',
    prezzo: 92,
    sconto: 15,
    tagliaUnica: true,
    foto: 'foto/p-vaso-gatto.jpg',
    galleria: ['foto/p-vaso-gatto.jpg', 'foto/p-vaso-gatto-2.jpg'],
    cat: ['decorazioni', 'regali', 'novita'],
    badge: 'Novità',
    rating: ['5,0', 5],
    avail: 'Spedizione in 48/72h',
    desc: 'Un simpatico gatto ricoperto di muschio sintetico, accanto a un cestino con ortensia bianca.',
    descLunga: 'Un gatto scultoreo interamente ricoperto di muschio sintetico verde, seduto accanto a un piccolo cestino di vimini con un\'ortensia bianca real touch. Un pezzo d\'arredo originale e simpatico, perfetto per un davanzale, un ingresso o come regalo a chi ama gli oggetti fuori dal comune. Il vaso a forma di gatto è l\'oggetto in vendita; l\'ortensia lo accompagna.'
  },
  {
    slug: 'pannello-verde',
    nome: 'Giardino Verticale',
    prezzo: 100,
    sconto: 15,
    taglie: [
      { id: '1', nome: '1 pezzo', prezzo: 100, nota: 'Un pannello singolo, da appoggiare o appendere' },
      { id: '2', nome: '2 pezzi', prezzo: 165, nota: 'Coppia di pannelli: parete verde più ampia, a prezzo ridotto' }
    ],
    foto: 'foto/p-pannello-verde.jpg',
    cat: ['decorazioni', 'novita'],
    badge: 'Novità',
    rating: ['4,7', 4],
    avail: 'Spedizione in 48/72h',
    desc: 'Giardino verticale in verde stabilizzato, per una parete sempre in fiore.',
    descLunga: 'Un giardino verticale ricoperto di muschi e licheni stabilizzati in diverse tonalità di verde, con rami decorativi intrecciati. Si appoggia o si appende, e trasforma una parete spoglia in un piccolo angolo di verde, senza bisogno di luce, acqua o manutenzione. Disponibile in formato singolo o in coppia, per comporre una parete più ampia.'
  },
  {
    slug: 'tiffany',
    nome: 'Tiffany',
    prezzo: 75,
    sconto: 15,
    taglie: [
      { id: 'M', nome: 'M', prezzo: 75, nota: 'Formato classico, unica taglia disponibile' }
    ],
    foto: 'foto/p-tiffany.jpg',
    galleria: ['foto/p-tiffany.jpg', 'foto/p-tiffany-2.jpg', 'foto/p-tiffany-3.jpg'],
    cat: ['decorazioni', 'regali'],
    rating: ['4,9', 6],
    avail: 'Spedizione in 48/72h',
    desc: 'Quadro con fiori e foglie pressate sotto vetro, cornice color acqua.',
    descLunga: 'Una composizione di fiori e foglie dai toni verde-azzurro, pressata e racchiusa sotto vetro in una cornice in legno dipinta color acqua. Un piccolo quadro botanico da appendere o appoggiare, che porta in casa la delicatezza di un giardino d\'altri tempi.'
  },
  {
    slug: 'cappello-fiorito',
    nome: 'Cappello Fiorito',
    prezzo: 38,
    sconto: 15,
    taglie: [
      { id: 'S', nome: 'S', prezzo: 38, nota: 'Un pensiero: versione più raccolta' },
      { id: 'M', nome: 'M', prezzo: 49, nota: 'Il formato classico della bottega' }
    ],
    foto: 'foto/p-cappello.jpg',
    cat: ['decorazioni', 'regali'],
    rating: ['4,8', 8],
    avail: 'Spedizione in 48/72h',
    desc: 'Cappello di paglia con rosa lilla e fiori di campo applicati.',
    descLunga: 'Un cappello a tesa larga in paglia naturale, decorato con una grande rosa color lilla, fiori di campo e un nastro con scritte vintage. Un accessorio scenografico, perfetto da appendere in un ingresso country-chic o da regalare a chi ama lo stile boho.'
  },

  /* ---------- nuovi arrivi ---------- */
  {
    slug: 'girasoli-cannella',
    nome: 'Girasoli e Cannella',
    prezzo: 80,
    sconto: 20,
    taglie: [
      { id: 'S',  nome: 'S',  prezzo: 58,  nota: 'Un pensiero: composizione raccolta' },
      { id: 'M',  nome: 'M',  prezzo: 80,  nota: 'Il formato classico della bottega' },
      { id: 'L',  nome: 'L',  prezzo: 106, nota: 'Abbondante, per fare scena' },
      { id: 'XL', nome: 'XL', prezzo: 138, doppio: true, nota: 'Il doppio dei fiori della M' }
    ],
    foto: 'foto/p-girasoli-cannella.jpg',
    galleria: ['foto/p-girasoli-cannella.jpg', 'foto/p-girasoli-cannella-2.jpg', 'foto/p-girasoli-cannella-3.jpg'],
    cat: ['stagione', 'autunno', 'regali', 'novita'],
    badge: 'Novità',
    rating: ['4,8', 2],
    avail: 'Spedizione in 48/72h',
    desc: 'Girasoli, rosa gialla e limone vero al tatto, con cannella e cardo secco, su piattino verde smerlato con fiocco di iuta.',
    descLunga: 'Grandi girasoli dai petali dorati si aprono accanto a una rosa gialla e a un limone real touch, tra bastoncini di cannella veri, cardo secco viola e spighe dorate, il tutto raccolto su un piattino verde smerlato e chiuso da un fiocco di iuta grezza. Una composizione calda e materica che profuma d\'autunno anche senza profumare — perfetta come centrotavola o come regalo per chi ama i toni caldi della stagione.'
  },
  {
    slug: 'autunno-in-tavola',
    nome: 'Autunno in Tavola',
    prezzo: 79,
    sconto: 20,
    taglie: [
      { id: 'S',  nome: 'S',  prezzo: 60,  nota: 'Un pensiero: composizione raccolta' },
      { id: 'M',  nome: 'M',  prezzo: 79,  nota: 'Il formato classico della bottega' },
      { id: 'L',  nome: 'L',  prezzo: 109, nota: 'Abbondante, per fare scena' },
      { id: 'XL', nome: 'XL', prezzo: 138, doppio: true, nota: 'Il doppio dei fiori della M' }
    ],
    foto: 'foto/p-autunno-in-tavola.jpg',
    galleria: ['foto/p-autunno-in-tavola.jpg', 'foto/p-autunno-in-tavola-2.jpg', 'foto/p-autunno-in-tavola-3.jpg'],
    cat: ['stagione', 'autunno', 'regali'],
    rating: ['4,7', 6],
    avail: 'Spedizione in 48/72h',
    desc: 'Peperone, funghi e mela veri al tatto, con fiore lilla a sfera e spighe dorate, su vassoio in ceramica.',
    descLunga: 'Un peperone giallo lucido, funghetti e una mela rossa real touch, accanto a un fiore lilla a sfera vellutata, ortensie rosse e spighe di avena dorate, composti su un vassoio ovale in ceramica marrone. Un centrotavola caldo e materico che porta l\'autunno in casa senza mai appassire.'
  },
  {
    slug: 'bosco-di-rose',
    nome: 'Bosco di Rose',
    prezzo: 80,
    sconto: 20,
    taglie: [
      { id: 'S',  nome: 'S',  prezzo: 60,  nota: 'Un pensiero: composizione raccolta' },
      { id: 'M',  nome: 'M',  prezzo: 80,  nota: 'Il formato classico della bottega' },
      { id: 'L',  nome: 'L',  prezzo: 106, nota: 'Abbondante, per fare scena' },
      { id: 'XL', nome: 'XL', prezzo: 188, nota: 'Il formato più grande, per un\'occasione importante' }
    ],
    foto: 'foto/p-bosco-di-rose.jpg',
    cat: ['anniversario', 'regali', 'mamma'],
    rating: ['4,9', 9],
    avail: 'Spedizione in 48/72h',
    desc: 'Rose rosse e bordeaux con ortensie color malva, su una fetta di legno naturale.',
    descLunga: 'Rose rosse e bordeaux di diverse sfumature, aperte tra ortensie color malva e fogliame verde, raccolte in una composizione compatta su una fetta di legno grezzo. Un pensiero romantico e senza tempo, perfetto per un anniversario o per dire "ti voglio bene" senza troppe parole.'
  },
  {
    slug: 'trittico-di-rose',
    nome: 'Trittico di Rose',
    prezzo: 100,
    sconto: 15,
    tagliaUnica: true,
    foto: 'foto/p-trittico-di-rose.jpg',
    cat: ['regali', 'anniversario', 'decorazioni'],
    badge: 'Novità',
    rating: ['4,9', 5],
    avail: 'Spedizione in 48/72h',
    desc: 'Tre piccole composizioni di rose rosse e crema, vendute insieme: coppa, spilla e piattino.',
    descLunga: 'Un trittico pensato per essere regalato o esposto insieme: una coppa di vetro con rose rosse e crema e nastro a cuoricini, una spilla-decorazione con rosa rossa e foglie autunnali, e un piattino con rose rosse, rosa cipria e bacche. Il prezzo comprende tutti e tre i pezzi, ciascuno perfetto anche da solo su una mensola diversa.'
  },
  {
    slug: 'agrumi-oro',
    nome: 'Agrumi d\'Oro',
    prezzo: 83,
    sconto: 20,
    taglie: [
      { id: 'S',  nome: 'S',  prezzo: 68,  nota: 'Un pensiero: composizione raccolta' },
      { id: 'M',  nome: 'M',  prezzo: 83,  nota: 'Il formato classico della bottega' },
      { id: 'L',  nome: 'L',  prezzo: 104, nota: 'Abbondante, per fare scena' },
      { id: 'XL', nome: 'XL', prezzo: 134, doppio: true, nota: 'Il doppio dei fiori della M' }
    ],
    foto: 'foto/p-agrumi-oro.jpg',
    galleria: ['foto/p-agrumi-oro.jpg', 'foto/p-agrumi-oro-2.jpg', 'foto/p-agrumi-oro-3.jpg'],
    cat: ['stagione', 'autunno', 'regali'],
    rating: ['4,8', 7],
    avail: 'Spedizione in 48/72h',
    desc: 'Limone, melagrana, rosa rossa e tulipani gialli con cannella, su piatto bianco smerlato.',
    descLunga: 'Un grande limone e una melagrana real touch, una rosa rossa vellutata e tulipani gialli aperti, tra bacche, rametti di cannella e fiori color avorio, composti su un piatto bianco dal bordo smerlato. Una composizione solare, perfetta come centrotavola d\'autunno.'
  },
  {
    slug: 'casetta-welcome',
    nome: 'Casetta "Welcome"',
    prezzo: 73,
    sconto: 15,
    tagliaUnica: true,
    foto: 'foto/p-casetta-welcome.jpg',
    cat: ['decorazioni', 'regali'],
    badge: 'Novità',
    rating: ['4,8', 4],
    avail: 'Spedizione in 48/72h',
    desc: 'Casetta per uccellini in legno con cartello "Welcome" e tulipani rosa alla base.',
    descLunga: 'Una casetta per uccellini in legno naturale, col tetto a punta legato con corda di iuta e un piccolo uccellino dipinto sull\'ingresso, un cartello "Welcome" inciso e un cuscino di tulipani rosa e fiori bianchi alla base. Un pezzo d\'arredo country-chic per un balcone, un ingresso o un davanzale: si espone così com\'è, senza annaffiature.'
  },
  {
    slug: 'mezzanotte-in-fiore',
    nome: 'Mezzanotte in Fiore',
    prezzo: 82,
    sconto: 20,
    taglie: [
      { id: 'S',  nome: 'S',  prezzo: 65,  nota: 'Un pensiero: composizione raccolta' },
      { id: 'M',  nome: 'M',  prezzo: 82,  nota: 'Il formato classico della bottega' },
      { id: 'L',  nome: 'L',  prezzo: 123, nota: 'Abbondante, per fare scena' },
      { id: 'XL', nome: 'XL', prezzo: 115, doppio: true, nota: 'Il doppio dei fiori della M' }
    ],
    foto: 'foto/p-mezzanotte-in-fiore.jpg',
    galleria: ['foto/p-mezzanotte-in-fiore.jpg', 'foto/p-mezzanotte-in-fiore-2.jpg', 'foto/p-mezzanotte-in-fiore-3.jpg'],
    cat: ['premium', 'novita', 'regali'],
    badge: 'Novità',
    rating: ['4,9', 4],
    avail: 'Spedizione in 48/72h',
    desc: 'Rose nere e bianche tra spirali d\'argento e cardo verde, su piatto specchiato.',
    descLunga: 'Rose vellutate nere e rose bianche avorio, incorniciate da eleganti spirali metalliche color argento, cardo verde e foglie d\'edera, su un piatto dal riflesso specchiato. Una composizione moderna e di forte carattere, per chi cerca qualcosa di diverso dal solito bouquet — perfetta per un regalo scenografico o per un tavolo di design.'
  },
  {
    slug: 'cristallo-autunno',
    nome: 'Cristallo d\'Autunno',
    prezzo: 78,
    sconto: 20,
    taglie: [
      { id: 'S',  nome: 'S',  prezzo: 62,  nota: 'Un pensiero: composizione raccolta' },
      { id: 'M',  nome: 'M',  prezzo: 78,  nota: 'Il formato classico della bottega' },
      { id: 'L',  nome: 'L',  prezzo: 117, nota: 'Abbondante, per fare scena' },
      { id: 'XL', nome: 'XL', prezzo: 109, doppio: true, nota: 'Il doppio dei fiori della M' }
    ],
    foto: 'foto/p-cristallo-autunno.jpg',
    galleria: ['foto/p-cristallo-autunno.jpg', 'foto/p-cristallo-autunno-2.jpg', 'foto/p-cristallo-autunno-3.jpg'],
    cat: ['autunno', 'anniversario', 'regali'],
    rating: ['4,8', 6],
    avail: 'Spedizione in 48/72h',
    desc: 'Rose rosse e bianche, foglie ambrate e coda di coniglio, in una coppa di vetro.',
    descLunga: 'Rose rosse e bianche aperte tra foglie color ambra, cardo verde e morbide code di coniglio, composte in una coppa di vetro su base svasata, con un nastro a cuoricini rossi. Elegante e luminosa, porta un tocco d\'autunno romantico su qualsiasi tavolo o mensola.'
  },
  {
    slug: 'nautilus-ambra',
    nome: 'Nautilus d\'Ambra',
    prezzo: 76,
    sconto: 20,
    taglie: [
      { id: 'S', nome: 'S', prezzo: 61, nota: 'Crisantemi ragno color avorio, composizione raccolta' },
      { id: 'M', nome: 'M', prezzo: 76, nota: 'Rose e mughetto, più abbondante' }
    ],
    foto: 'foto/p-nautilus-ambra.jpg',
    galleria: ['foto/p-nautilus-ambra.jpg', 'foto/p-nautilus-ambra-2.jpg', 'foto/p-nautilus-ambra-3.jpg'],
    cat: ['regali', 'anniversario'],
    rating: ['4,7', 3],
    avail: 'Spedizione in 48/72h',
    desc: 'Vaso in vetro ambrato a spirale: taglia S con crisantemi ragno avorio, taglia M con rose e mughetto.',
    descLunga: 'Un vaso in vetro ambrato dalla forma a spirale, come una conchiglia di nautilus. Nella taglia S accoglie crisantemi ragno color avorio e foglie scure; nella taglia M si arricchisce di rose giallo-rosa, mughetto bianco e bacche verdi, per una composizione più abbondante. Stesso vaso, la stessa cura artigianale, due modi diversi di viverlo.'
  },
  {
    slug: 'malva-lavanda',
    nome: 'Malva e Lavanda',
    prezzo: 79,
    sconto: 20,
    taglie: [
      { id: 'S',  nome: 'S',  prezzo: 63,  nota: 'Un pensiero: composizione raccolta' },
      { id: 'M',  nome: 'M',  prezzo: 79,  nota: 'Il formato classico della bottega' },
      { id: 'L',  nome: 'L',  prezzo: 119, nota: 'Abbondante, per fare scena' },
      { id: 'XL', nome: 'XL', prezzo: 111, doppio: true, nota: 'Il doppio dei fiori della M' }
    ],
    foto: 'foto/p-malva-lavanda.jpg',
    galleria: ['foto/p-malva-lavanda.jpg', 'foto/p-malva-lavanda-2.jpg', 'foto/p-malva-lavanda-3.jpg'],
    cat: ['primavera', 'anniversario', 'regali'],
    rating: ['4,8', 5],
    avail: 'Spedizione in 48/72h',
    desc: 'Ranuncolo malva, lavanda e orchidea screziata, in vaso argento martellato.',
    descLunga: 'Ranuncoli color malva, spighe di lavanda, fiori bianchi a spruzzo e un\'orchidea screziata viola, composti in un vaso argento dalla superficie martellata con un anello decorativo. Una palette delicata tra il malva e il lavanda, per un regalo elegante e mai scontato.'
  },
  {
    slug: 'bonsai-premium',
    nome: 'Pino Bonsai Premium',
    prezzo: 385,
    sconto: 15,
    tagliaUnica: true,
    foto: 'foto/p-bonsai-premium.jpg',
    cat: ['decorazioni', 'premium'],
    rating: ['5,0', 2],
    avail: 'Spedizione in 48/72h',
    desc: 'Grande bonsai di pino, alto 1,70 m e largo 1,50 m, con rose bianche tra i rami. Pezzo unico di altissima qualità.',
    descLunga: 'Un bonsai di pino artificiale di grandi dimensioni — alto circa 1,70 m e largo 1,50 m — dal tronco intrecciato e nodoso, legato con corda naturale alla base in muschio, con rose bianche e felci che spuntano discretamente tra i rami. Realizzato con una cura fuori dal comune, ramo per ramo, per un effetto realistico che si nota solo da vicino. Un pezzo d\'arredo importante per un ingresso, uno studio o una hall: la presenza scenica di un albero vero, senza bisogno di luce né di annaffiature.'
  },
  {
    slug: 'pettirosso-in-fiore',
    nome: 'Pettirosso in Fiore',
    prezzo: 80,
    sconto: 20,
    taglie: [
      { id: 'S',  nome: 'S',  prezzo: 64,  nota: 'Un pensiero: composizione raccolta' },
      { id: 'M',  nome: 'M',  prezzo: 80,  nota: 'Il formato classico della bottega' },
      { id: 'L',  nome: 'L',  prezzo: 120, nota: 'Abbondante, per fare scena' },
      { id: 'XL', nome: 'XL', prezzo: 112, doppio: true, nota: 'Il doppio dei fiori della M' }
    ],
    foto: 'foto/p-pettirosso-in-fiore.jpg',
    galleria: ['foto/p-pettirosso-in-fiore.jpg', 'foto/p-pettirosso-in-fiore-2.jpg', 'foto/p-pettirosso-in-fiore-3.jpg'],
    cat: ['primavera', 'regali'],
    rating: ['4,8', 4],
    avail: 'Spedizione in 48/72h',
    desc: 'Calle bianche, amarillide arancio, rosa e orchidee, in vaso con pettirosso dipinto.',
    descLunga: 'Calle bianche e un\'amarillide color arancio si aprono accanto a una rosa e delicate orchidee bianche, in un vaso di ceramica decorato con un pettirosso dipinto a mano. Fresca e luminosa, è la composizione giusta per augurare buona primavera o per un regalo di benvenuto.'
  },
  {
    slug: 'zaffiro-lavanda',
    nome: 'Zaffiro e Lavanda',
    prezzo: 79,
    sconto: 20,
    taglie: [
      { id: 'S',  nome: 'S',  prezzo: 63,  nota: 'Un pensiero: composizione raccolta' },
      { id: 'M',  nome: 'M',  prezzo: 79,  nota: 'Il formato classico della bottega' },
      { id: 'L',  nome: 'L',  prezzo: 119, nota: 'Abbondante, per fare scena' },
      { id: 'XL', nome: 'XL', prezzo: 111, doppio: true, nota: 'Il doppio dei fiori della M' }
    ],
    foto: 'foto/p-zaffiro-lavanda.jpg',
    galleria: ['foto/p-zaffiro-lavanda.jpg', 'foto/p-zaffiro-lavanda-2.jpg', 'foto/p-zaffiro-lavanda-3.jpg'],
    cat: ['premium', 'regali', 'anniversario'],
    badge: 'Novità',
    rating: ['4,9', 3],
    avail: 'Spedizione in 48/72h',
    desc: 'Rosa blu notte, lavanda e fiori rosa cipria, su piatto vintage con fiocco blu.',
    descLunga: 'Una rosa color blu notte, rara e sorprendente, circondata da lavanda, fiori rosa cipria e foglie argentate, composta su un piatto ovale dal decoro floreale vintage e chiusa da un grande fiocco blu zaffiro. Una composizione fuori dal comune per chi ama i colori insoliti e i regali che si notano.'
  },
  {
    slug: 'dame-fiorite',
    nome: 'Le Dame Fiorite',
    prezzo: 91,
    sconto: 15,
    foto: 'foto/p-dame-fiorite.jpg',
    cat: ['regali', 'decorazioni'],
    badge: 'Novità',
    rating: ['4,9', 4],
    avail: 'Spedizione in 48/72h',
    desc: 'Coppia di vasi a testa di dama in ceramica dipinta a mano, con tulipani bianchi e ranuncoli rosa.',
    descLunga: 'Due vasi in ceramica a forma di testa di dama, dipinti a mano con dettagli diversi — una con fiocchi rossi a pois, l\'altra con collo arancio a pois neri — riempiti l\'una di tulipani bianchi, l\'altra di ranuncoli rosa e fiori di campo. Si vendono in coppia, per essere esposte insieme su una mensola o un comò. Nella foto sono raffigurate in taglia M.'
  },
  {
    slug: 'pinguino-panda',
    nome: 'Pinguino e Panda Platino',
    prezzo: 22,
    sconto: 15,
    tagliaUnica: true,
    foto: 'foto/p-pinguino-panda.jpg',
    cat: ['decorazioni', 'regali'],
    rating: ['4,7', 3],
    avail: 'Spedizione in 48/72h',
    desc: 'Coppia di statuine in ceramica argentata: un pinguino e un panda.',
    descLunga: 'Una coppia di piccole statuine in ceramica smaltata color platino, un pinguino e un panda dal design essenziale e moderno. Un tocco decorativo minimal da abbinare a una composizione floreale o da regalare così com\'è.'
  },
  {
    slug: 'borsa-lavanda',
    nome: 'Borsa di Lavanda',
    prezzo: 75,
    taglie: [
      { id: 'XL', nome: 'XL', prezzo: 75, nota: 'Formato generoso, unica taglia disponibile — scontata del 20%' }
    ],
    foto: 'foto/p-borsa-lavanda.jpg',
    galleria: ['foto/p-borsa-lavanda.jpg', 'foto/p-borsa-lavanda-2.jpg', 'foto/p-borsa-lavanda-3.jpg'],
    cat: ['regali', 'primavera', 'mamma'],
    badge: '-20%',
    rating: ['4,8', 6],
    avail: 'Spedizione in 48/72h',
    desc: 'Borsa in paglia ricamata a paillettes, con rose rosa, ortensia lilla e lavanda. Solo in taglia XL, scontata del 20%.',
    descLunga: 'Una borsa intrecciata in paglia naturale, impreziosita da un ricamo a paillettes nei toni del lilla e del malva, colma di rose rosa, un\'ortensia color malva e lavanda. Un\'idea regalo originale, doppiamente utile: si può tenere in vista come composizione o svuotare e usare come borsa vera. Disponibile solo nel formato XL, il più generoso, scontato del 20%.'
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

/* esportato solo lato server (Node/Vercel): il browser ignora questo blocco,
   così le funzioni API possono riusare lo stesso catalogo senza duplicarlo */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AFC_PRODOTTI: AFC_PRODOTTI, AFC_TAGLIE: AFC_TAGLIE, afcProdotto: afcProdotto, afcPrezzoScontato: afcPrezzoScontato };
}
