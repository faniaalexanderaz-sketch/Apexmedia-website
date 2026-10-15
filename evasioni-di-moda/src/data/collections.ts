import { images, type ImageAsset } from './images'

// Categorie di stile: indicative, da adattare all'assortimento reale del negozio.
// Il negozio tratta abbigliamento, calzature e accessori uomo e donna.

export type Collection = {
  id: string
  title: string
  /** parola in corsivo nel titolo */
  accent?: string
  text: string
  image: ImageAsset
  /** formato della scheda nella galleria orizzontale */
  shape: 'portrait' | 'landscape'
}

export const collections: Collection[] = [
  {
    id: 'donna',
    title: 'Donna',
    text: 'Capi scelti per accompagnare le giornate vere: dal mattino in ufficio alla cena con le amiche.',
    image: images.collDonna,
    shape: 'portrait',
  },
  {
    id: 'uomo',
    title: 'Uomo',
    text: 'Giacche, maglieria e pantaloni dal taglio pulito, per uno stile curato senza sforzo.',
    image: images.collUomo,
    shape: 'portrait',
  },
  {
    id: 'maglieria',
    title: 'Maglieria',
    text: 'Coste, trecce, filati morbidi in tonalità naturali: il guardaroba della stagione fredda parte da qui.',
    image: images.collMaglieria,
    shape: 'landscape',
  },
  {
    id: 'look',
    title: 'Outfit e',
    accent: 'look',
    text: 'Abbinamenti pensati per intero, da riprendere così come sono o da reinventare con un tuo capo.',
    image: images.collLook,
    shape: 'portrait',
  },
  {
    id: 'calzature',
    title: 'Calzature',
    text: 'Dalla stringata in pelle alla sneaker: la scarpa giusta completa il look e lo rende tuo.',
    image: images.collCalzature,
    shape: 'landscape',
  },
  {
    id: 'denim',
    title: 'Pantaloni e',
    accent: 'denim',
    text: 'Vestibilità dritte, ampie, a sigaretta. Il pantalone giusto è quello che ti fa dimenticare di averlo addosso.',
    image: images.collDenim,
    shape: 'portrait',
  },
  {
    id: 'accessori',
    title: 'Borse e',
    accent: 'accessori',
    text: 'Il dettaglio che firma un look: una borsa in pelle, un gioiello sottile, un foulard.',
    image: images.collAccessori,
    shape: 'portrait',
  },
  {
    id: 'regalo',
    title: 'Idee',
    accent: 'regalo',
    text: 'Quando non sai cosa scegliere, ti aiutiamo noi: raccontaci per chi è, troviamo insieme il pensiero giusto.',
    image: images.collRegalo,
    shape: 'landscape',
  },
]

/** Parole del nastro tipografico sotto l'hero */
export const marqueeWords = ['Nuovi arrivi', 'Donna', 'Uomo', 'Maglieria', 'Calzature', 'Denim', 'Accessori', 'Idee regalo']
