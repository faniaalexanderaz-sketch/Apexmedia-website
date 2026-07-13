/* =============================================================
   ANTICA FIORERIA DEL CENTRO — catalogo prodotti (fonte unica)
   Usato da collezione.html e prodotto.html. Il prezzo indicato
   è la taglia M; le altre taglie derivano dai fattori qui sotto.
   XL contiene il doppio dei fiori della M: vale 2×M ma si paga
   il 30% in meno del doppio — da qui il "risparmi il 30%".
   ============================================================= */
var AFC_TAGLIE = [
  { id: 'S',  nome: 'S',  fattore: 0.75, nota: 'Un pensiero: 5–7 steli' },
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
    slug: 'mattino',
    nome: 'Mattino in Bottega',
    prezzo: 38,
    foto: 'foto/p-mattino.jpg',
    cat: ['bouquet', 'stagione', 'mamma'],
    badge: 'Più venduto',
    rating: ['4,9', 31],
    avail: 'Spedizione in 24/48h',
    desc: 'Ranuncoli cipria, fiori di campo e salvia in seta.',
    descLunga: 'Ranuncoli color cipria, fiori di campo e salvia in tessuto di alta gamma, montati a mano sul nostro banco di legno. La luce del mattino in una composizione che resta così, giorno dopo giorno, senza un filo d\'acqua.'
  },
  {
    slug: 'domenica',
    nome: 'Domenica al Centro',
    prezzo: 48,
    foto: 'foto/p-domenica.jpg',
    cat: ['bouquet', 'anniversario', 'mamma'],
    badge: 'Più venduto',
    rating: ['5,0', 18],
    avail: 'Ultimi 2 disponibili',
    availBassa: true,
    desc: 'Tre peonie piene nei toni della domenica mattina.',
    descLunga: 'Tre peonie piene e morbide in real touch, con verde leggero nei toni caldi della domenica mattina. La nostra composizione più amata per gli anniversari: sembra appena colta, e lo sembrerà anche l\'anno prossimo.'
  },
  {
    slug: 'lettera',
    nome: "Lettera d'Aprile",
    prezzo: 32,
    foto: 'foto/p-lettera.jpg',
    cat: ['bouquet', 'stagione'],
    badge: null,
    rating: ['4,8', 24],
    avail: 'Spedizione in 24/48h',
    desc: 'Tulipani rosa cipria in tre altezze, con verde leggero.',
    descLunga: 'Tulipani rosa cipria su tre altezze, come una frase scritta a mano. Semplice e luminosa, perfetta sul tavolo dell\'ingresso: non chiede acqua, solo uno sguardo ogni tanto.'
  },
  {
    slug: 'verde',
    nome: 'Verde Silenzio',
    prezzo: 29,
    foto: 'foto/p-verde.jpg',
    cat: ['bouquet', 'regali', 'condoglianze'],
    badge: 'Nuovo',
    rating: ['4,9', 12],
    avail: 'Spedizione in 24/48h',
    desc: 'Eucalipto, nebbiolina e una sola peonia bianca.',
    descLunga: 'Eucalipto, nebbiolina a nuvola e una sola peonia bianca al centro. Una composizione sobria e gentile, pensata per i momenti in cui servono presenza e discrezione più che colore.'
  },
  {
    slug: 'oradorata',
    nome: 'Ora Dorata',
    prezzo: 42,
    foto: 'foto/p-oradorata.jpg',
    cat: ['bouquet', 'anniversario', 'premium'],
    badge: 'Nuovo',
    rating: ['4,8', 16],
    avail: 'Spedizione in 24/48h',
    desc: 'Toni miele e champagne, per la luce del tardo pomeriggio.',
    descLunga: 'Toni miele, champagne e crema, come la luce dorata del tardo pomeriggio. Un bouquet caldo ed elegante che sta benissimo sulle tavole apparecchiate e nelle foto di famiglia.'
  },
  {
    slug: 'poesia',
    nome: 'Piccola Poesia',
    prezzo: 26,
    foto: 'foto/p-poesia.jpg',
    cat: ['rose', 'regali', 'sanvalentino'],
    badge: 'Nuovo',
    rating: ['4,9', 27],
    avail: 'Spedizione in 24/48h',
    desc: 'Nebbiolina a nuvola e una rosa chiara al centro.',
    descLunga: 'Una nuvola di nebbiolina con una sola rosa chiara al centro: il regalo piccolo che non sbaglia mai. Sta in una mano, costa poco, dice tantissimo.'
  },
  {
    slug: 'limitata',
    nome: 'Prima Fioritura',
    prezzo: 65,
    foto: 'foto/p-limitata.jpg',
    cat: ['bouquet', 'novita', 'premium'],
    badge: 'Edizione limitata',
    badgeOro: true,
    rating: ['5,0', 6],
    avail: 'Spedizione in 24/48h',
    desc: 'La composizione più ricca della bottega, numerata — solo 20 pezzi.',
    descLunga: 'La composizione più ricca della collezione: peonie, dalie e bacche in materiali di pregio, montata a mano e numerata pezzo per pezzo. Ne realizziamo solo 20: quando finiscono, finiscono.'
  },
  {
    slug: 'settimana',
    nome: 'Il Mazzo del Sabato',
    prezzo: 34,
    foto: 'foto/p-settimana.jpg',
    cat: ['bouquet', 'stagione', 'novita'],
    badge: 'Della settimana',
    rating: ['4,9', 44],
    avail: 'Serie stagionale',
    desc: 'La composizione della stagione: dalie, astri e verde d\'ulivo.',
    descLunga: 'Ogni stagione una composizione nuova, a un prezzo gentile. Questa stagione: dalie, astri e verde d\'ulivo. Il modo più semplice per rinnovare casa senza pensarci più.'
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
