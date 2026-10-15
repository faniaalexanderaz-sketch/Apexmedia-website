import { images, type ImageAsset } from './images'

// Categorie di stile: indicative, da adattare all'assortimento reale del negozio.

export type Collection = {
  id: string
  title: string
  /** parola in corsivo nel titolo */
  accent?: string
  text: string
  image: ImageAsset
}

export const collections: Collection[] = [
  {
    id: 'donna',
    title: 'Abbigliamento',
    accent: 'donna',
    text: 'Capi scelti per accompagnare le giornate vere: dal mattino in ufficio alla cena con le amiche.',
    image: images.collDonna,
  },
  {
    id: 'look',
    title: 'Outfit e',
    accent: 'look',
    text: 'Abbinamenti pensati per intero, da riprendere così come sono o da reinventare con un tuo capo.',
    image: images.collLook,
  },
  {
    id: 'maglieria',
    title: 'Maglieria',
    text: 'Coste, trecce, filati morbidi in tonalità naturali: il guardaroba della stagione fredda parte da qui.',
    image: images.collMaglieria,
  },
  {
    id: 'denim',
    title: 'Pantaloni e',
    accent: 'denim',
    text: 'Vestibilità dritte, ampie, a sigaretta. Il pantalone giusto è quello che ti fa dimenticare di averlo addosso.',
    image: images.collDenim,
  },
  {
    id: 'accessori',
    title: 'Borse e',
    accent: 'accessori',
    text: 'Il dettaglio che firma un look: una borsa in pelle, un gioiello sottile, un foulard.',
    image: images.collAccessori,
  },
  {
    id: 'regalo',
    title: 'Idee',
    accent: 'regalo',
    text: 'Quando non sai cosa scegliere, ti aiutiamo noi: raccontaci per chi è, troviamo insieme il pensiero giusto.',
    image: images.collRegalo,
  },
]
