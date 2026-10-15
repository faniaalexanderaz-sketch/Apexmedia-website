import { images, type ImageAsset } from './images'

// Nuovi arrivi. Per aggiungere un capo basta aggiungere un oggetto all'elenco:
// la griglia editoriale si adatta da sola (il ritmo delle dimensioni si ripete ogni 6 voci).
// I nomi sono descrittivi, non nomi ufficiali di prodotto o marchi.

export type NewArrival = {
  id: string
  title: string
  category: string
  description: string
  image: ImageAsset
  /** Prezzo da mostrare solo se confermato dal negozio (es. "€ 129") */
  price?: string
  isNew?: boolean
}

export const newArrivals: NewArrival[] = [
  {
    id: 'giacca-utility',
    title: 'La giacca utility',
    category: 'Capispalla',
    description:
      'Verde oliva, tasche importanti, linea morbida: sopra una camicia bianca diventa il capo che usi tutti i giorni.',
    image: images.arrivoGiaccaUtility,
    isNew: true,
  },
  {
    id: 'volant-avorio',
    title: 'Volant e luce',
    category: 'Bluse e camicie',
    description:
      'Il bianco che incornicia il viso. Un capo romantico da rendere contemporaneo con un pantalone dritto.',
    image: images.arrivoVolantAvorio,
    isNew: true,
  },
  {
    id: 'maglia-panna',
    title: 'Essential knitwear',
    category: 'Maglieria',
    description:
      'Coste ampie, colore panna, volume morbido: la maglia che si indossa da ottobre a marzo senza pensarci.',
    image: images.arrivoMagliaPanna,
    isNew: true,
  },
  {
    id: 'cappello-feltro',
    title: 'Dettagli di stagione',
    category: 'Accessori',
    description:
      'Un cappello in feltro e una camicia avorio: due elementi semplici che cambiano il carattere di un look.',
    image: images.arrivoCappelloFeltro,
    isNew: true,
  },
  {
    id: 'chemisier-avorio',
    title: 'Chemisier avorio',
    category: 'Abiti',
    description:
      'Linea pulita, cintura in vita, tessuto che si muove. Da portare con stivali ora, con sandali più avanti.',
    image: images.arrivoChemisierAvorio,
    isNew: true,
  },
  {
    id: 'tailleur-avorio',
    title: 'Tailleur con un accento',
    category: 'Look',
    description:
      'Il completo chiaro diventa personale con un solo dettaglio: un fiore, una spilla, un rossetto deciso.',
    image: images.arrivoTailleurRosa,
    isNew: true,
  },
]
