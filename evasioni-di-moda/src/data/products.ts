import { images, type ImageAsset } from './images'

// Catalogo "prenota e ritira in negozio".
// DEMO: prodotti, prezzi e disponibilità sono d'esempio, costruiti sulle foto dimostrative.
// Con il negozio si sostituiscono con i capi reali: un oggetto per prodotto, nessun codice da toccare.

export type SizeOption = {
  label: string
  /** false = esaurita (mostrata barrata, non selezionabile) */
  available: boolean
}

export type Product = {
  slug: string
  name: string
  /** id della collezione in collections.ts */
  collection: string
  price: number
  description: string
  details: string[]
  color: string
  image: ImageAsset
  sizes: SizeOption[]
  isNew?: boolean
}

const S = (labels: string[], soldOut: string[] = []): SizeOption[] =>
  labels.map((label) => ({ label, available: !soldOut.includes(label) }))

const CLOTHES = ['XS', 'S', 'M', 'L', 'XL']
const MEN = ['S', 'M', 'L', 'XL', 'XXL']
const DENIM = ['26', '27', '28', '29', '30', '31', '32']
const SHOES_W = ['36', '37', '38', '39', '40', '41']
const SHOES_M = ['40', '41', '42', '43', '44', '45']
const ONE = ['Taglia unica']

export const products: Product[] = [
  // Donna
  {
    slug: 'cappotto-rosa-cipria',
    name: 'Cappotto rosa cipria',
    collection: 'donna',
    price: 189,
    description: 'Il cappotto che illumina l’inverno: linea dritta, lunghezza al ginocchio, un colore morbido che sta bene sul grigio e sul nero.',
    details: ['Linea dritta, lunghezza al ginocchio', 'Tasche laterali', 'Da abbinare a un foulard stampato'],
    color: 'Rosa cipria',
    image: images.collDonna,
    sizes: S(CLOTHES, ['XS']),
    isNew: true,
  },
  {
    slug: 'abito-chemisier-avorio',
    name: 'Abito chemisier avorio',
    collection: 'donna',
    price: 89,
    description: 'Linea pulita, cintura in vita, tessuto che si muove. Da portare con stivali ora, con sandali più avanti.',
    details: ['Abbottonatura frontale', 'Cintura in vita coordinata', 'Maniche lunghe con polsino'],
    color: 'Avorio',
    image: images.arrivoChemisierAvorio,
    sizes: S(CLOTHES),
    isNew: true,
  },
  {
    slug: 'blusa-volant-bianca',
    name: 'Blusa con volant',
    collection: 'donna',
    price: 59,
    description: 'Il bianco che incornicia il viso: scollo a barchetta e volant, da rendere contemporaneo con un pantalone dritto.',
    details: ['Scollo a barchetta', 'Doppio volant', 'Polsini arricciati'],
    color: 'Bianco',
    image: images.arrivoVolantAvorio,
    sizes: S(CLOTHES, ['L']),
  },
  {
    slug: 'tailleur-avorio',
    name: 'Tailleur avorio',
    collection: 'donna',
    price: 169,
    description: 'Il completo chiaro che diventa personale con un solo dettaglio: un fiore, una spilla, un rossetto deciso.',
    details: ['Giacca monopetto con revers a contrasto', 'Vestibilità morbida', 'Si abbina anche separato'],
    color: 'Avorio',
    image: images.arrivoTailleurRosa,
    sizes: S(CLOTHES),
    isNew: true,
  },

  // Uomo
  {
    slug: 'blazer-cammello-uomo',
    name: 'Blazer cammello',
    collection: 'uomo',
    price: 179,
    description: 'Spalla morbida e tono caldo: sopra una t-shirt bianca per il giorno, con camicia e pantalone scuro la sera.',
    details: ['Monopetto due bottoni', 'Tasche a filetto', 'Vestibilità regular'],
    color: 'Cammello',
    image: images.collUomo,
    sizes: S(MEN, ['XXL']),
    isNew: true,
  },
  {
    slug: 'abito-blu-uomo',
    name: 'Abito blu',
    collection: 'uomo',
    price: 249,
    description: 'Il blu che non sbaglia mai: giacca sciancrata e pantalone slim, perfetto per cerimonie e ufficio.',
    details: ['Giacca e pantalone coordinati', 'Taglio slim', 'Ideale con scarpa in cuoio'],
    color: 'Blu navy',
    image: images.prodAbitoBluUomo,
    sizes: S(['46', '48', '50', '52', '54'], ['54']),
  },
  {
    slug: 'camicia-chambray',
    name: 'Camicia in chambray',
    collection: 'uomo',
    price: 59,
    description: 'Azzurro chambray con micro pois: la camicia casual che regge anche la giacca.',
    details: ['Collo classico', 'Micro fantasia a pois', 'Tessuto leggero'],
    color: 'Azzurro',
    image: images.prodCamiciaDenim,
    sizes: S(MEN),
  },
  {
    slug: 'bomber-ruggine',
    name: 'Bomber ruggine',
    collection: 'uomo',
    price: 119,
    description: 'Leggero, da mezza stagione, in un colore che scalda il guardaroba neutro.',
    details: ['Zip frontale', 'Polsini e fondo in maglia', 'Tasca sulla manica'],
    color: 'Ruggine',
    image: images.prodBomberRuggine,
    sizes: S(MEN, ['S']),
  },

  // Maglieria
  {
    slug: 'maglione-coste-panna',
    name: 'Maglione a coste panna',
    collection: 'maglieria',
    price: 79,
    description: 'Coste ampie, colore panna, volume morbido: la maglia che si indossa da ottobre a marzo senza pensarci.',
    details: ['Collo alto morbido', 'Coste larghe', 'Vestibilità oversize'],
    color: 'Panna',
    image: images.arrivoMagliaPanna,
    sizes: S(['S', 'M', 'L']),
    isNew: true,
  },
  {
    slug: 'poncho-traforato-avorio',
    name: 'Poncho traforato',
    collection: 'maglieria',
    price: 65,
    description: 'Maglia traforata e frange: si appoggia sulle spalle e completa con leggerezza il look di mezza stagione.',
    details: ['Scollo a V', 'Frange sul fondo', 'Taglia unica'],
    color: 'Avorio',
    image: images.prodPonchoAvorio,
    sizes: S(ONE),
  },
  {
    slug: 'dolcevita-nero',
    name: 'Dolcevita nero',
    collection: 'maglieria',
    price: 49,
    description: 'La tela perfetta: pulito, essenziale, pronto per un gioiello importante.',
    details: ['Collo alto', 'Maglia fine', 'Vestibilità aderente'],
    color: 'Nero',
    image: images.editorialeDolcevita,
    sizes: S(CLOTHES),
  },

  // Outfit e look
  {
    slug: 'giacca-principe-di-galles',
    name: 'Giacca principe di Galles',
    collection: 'look',
    price: 149,
    description: 'Il classico che ringiovanisce tutto: sopra un jeans, un dolcevita o un abito.',
    details: ['Fantasia principe di Galles', 'Spalle strutturate', 'Lunghezza sotto i fianchi'],
    color: 'Grigio',
    image: images.collLook,
    sizes: S(CLOTHES, ['XL']),
  },
  {
    slug: 'giacca-utility-oliva',
    name: 'Giacca utility oliva',
    collection: 'look',
    price: 119,
    description: 'Verde oliva, tasche importanti, linea morbida: sopra una camicia bianca diventa il capo di tutti i giorni.',
    details: ['Quattro tasche applicate', 'Coulisse in vita', 'Cotone resistente'],
    color: 'Verde oliva',
    image: images.arrivoGiaccaUtility,
    sizes: S(CLOTHES),
    isNew: true,
  },
  {
    slug: 'cappotto-quadri-verde',
    name: 'Cappotto a quadri',
    collection: 'look',
    price: 199,
    description: 'Un capospalla di carattere: sotto bastano tinte unite e una scarpa pulita.',
    details: ['Quadri verde bosco e blu', 'Doppiopetto', 'Lunghezza a metà coscia'],
    color: 'Verde bosco',
    image: images.editorialeQuadri,
    sizes: S(CLOTHES, ['S']),
  },
  {
    slug: 'cappotto-nero-rouches',
    name: 'Cappotto nero con rouches',
    collection: 'look',
    price: 229,
    description: 'Un solo protagonista: la rouche che scende lungo l’abbottonatura gioiello.',
    details: ['Rouches sul davanti', 'Bottoni gioiello', 'Linea scivolata'],
    color: 'Nero',
    image: images.editorialeCappelloNero,
    sizes: S(CLOTHES),
  },

  // Calzature
  {
    slug: 'stringate-cuoio',
    name: 'Stringate in cuoio',
    collection: 'calzature',
    price: 119,
    description: 'Pelle color cuoio con lavorazione traforata: la scarpa che completa abito e jeans.',
    details: ['Pelle liscia e traforata', 'Allacciatura derby', 'Suola in cuoio'],
    color: 'Cuoio',
    image: images.collCalzature,
    sizes: S(SHOES_M, ['45']),
  },
  {
    slug: 'stivaletti-suede-sabbia',
    name: 'Stivaletti in suede',
    collection: 'calzature',
    price: 99,
    description: 'Suede color sabbia e tacco medio: sotto il jeans risvolto, il passe-partout della stagione.',
    details: ['Suede morbido', 'Tacco a blocco 6 cm', 'Zip laterale'],
    color: 'Sabbia',
    image: images.prodStivalettiSuede,
    sizes: S(SHOES_W, ['36']),
  },

  // Pantaloni e denim
  {
    slug: 'jeans-classico',
    name: 'Jeans classico',
    collection: 'denim',
    price: 79,
    description: 'Lavaggio medio, gamba dritta: il jeans che fa da base a tutto il guardaroba.',
    details: ['Cinque tasche', 'Gamba dritta', 'Lavaggio medio'],
    color: 'Blu medio',
    image: images.collDenim,
    sizes: S(DENIM, ['26', '32']),
  },
  {
    slug: 'jogger-cipria',
    name: 'Pantalone jogger cipria',
    collection: 'denim',
    price: 49,
    description: 'Comodo come una tuta, elegante con un sandalo: elastico in vita e tasche applicate.',
    details: ['Elastico in vita', 'Tasche applicate', 'Fondo con polsino'],
    color: 'Cipria',
    image: images.prodJoggerCipria,
    sizes: S(CLOTHES),
  },
  {
    slug: 'chino-kaki',
    name: 'Chino kaki',
    collection: 'denim',
    price: 59,
    description: 'Il pantalone casual per eccellenza: con sneakers bianche e giubbotto in denim.',
    details: ['Taglio slim', 'Cotone elasticizzato', 'Fondo con risvolto'],
    color: 'Kaki',
    image: images.prodChinoKaki,
    sizes: S(['44', '46', '48', '50', '52']),
  },

  // Borse e accessori
  {
    slug: 'borsa-tracolla-cuoio',
    name: 'Borsa a tracolla in cuoio',
    collection: 'accessori',
    price: 99,
    description: 'Pelle color cuoio e dettagli dorati: la borsa che accompagna dal giorno alla sera.',
    details: ['Patta con chiusura', 'Tracolla regolabile', 'Dettagli dorati'],
    color: 'Cuoio',
    image: images.collAccessori,
    sizes: S(ONE),
  },
  {
    slug: 'cappello-feltro',
    name: 'Cappello in feltro',
    collection: 'accessori',
    price: 45,
    description: 'Falda media e tono beige: cambia il carattere di qualsiasi cappotto.',
    details: ['Feltro', 'Nastro tono su tono', 'Falda media'],
    color: 'Beige',
    image: images.arrivoCappelloFeltro,
    sizes: S(['S/M', 'M/L']),
    isNew: true,
  },
  {
    slug: 'bracciale-catena-dorata',
    name: 'Bracciale a catena',
    collection: 'accessori',
    price: 35,
    description: 'Maglie grandi e metallo caldo: il punto luce sul polso.',
    details: ['Finitura dorata', 'Chiusura a moschettone'],
    color: 'Oro',
    image: images.heroDettaglio,
    sizes: S(ONE),
  },
  {
    slug: 'collane-sottili',
    name: 'Collane sottili sovrapposte',
    collection: 'accessori',
    price: 39,
    description: 'Due catene sottili con medaglietta: da portare insieme o separate.',
    details: ['Set di due collane', 'Finitura dorata', 'Medaglietta pendente'],
    color: 'Oro',
    image: images.storiaDettaglio,
    sizes: S(ONE),
  },

  // Idee regalo
  {
    slug: 'buono-regalo',
    name: 'Buono regalo',
    collection: 'regalo',
    price: 50,
    description: 'Quando non sai cosa scegliere: un buono da spendere in boutique, consegnato in una busta regalo.',
    details: ['Ritiro in negozio con busta regalo', 'Importo a scelta'],
    color: '—',
    image: images.collRegalo,
    sizes: S(['25 €', '50 €', '100 €', '150 €']),
  },
]

export const productBySlug = (slug: string) => products.find((p) => p.slug === slug)
export const productsIn = (collection: string) => products.filter((p) => p.collection === collection)

/** prezzo del buono regalo = taglio scelto */
export function priceFor(product: Product, size?: string): number {
  if (product.slug === 'buono-regalo' && size) return Number.parseInt(size, 10) || product.price
  return product.price
}

export const formatPrice = (n: number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
