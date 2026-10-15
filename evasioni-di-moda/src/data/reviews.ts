// Recensioni Google reali del negozio (solo 5 stelle), trascritte dalla scheda Google Maps.
// Nome mostrato come nome + iniziale del cognome. Per aggiungerne: copiare testo e nome da Google.
// `sample: true` va usato solo per testi d'esempio: nel sito vengono etichettati come tali.

export type Review = {
  text: string
  author: string
  rating: 1 | 2 | 3 | 4 | 5
  source: string
  sample?: boolean
}

export const reviews: Review[] = [
  {
    text: 'Pur abitandovi vicino non ero mai entrato. Ho trovato del personale più che gentile, mi hanno fatto sentire come fossi andato a trovare dei parenti lontani.',
    author: 'Alessandro F.',
    rating: 5,
    source: 'Google',
  },
  { text: 'Personale gentile e disponibile. Marchi importanti ad un ottimo prezzo.', author: 'Cliente Google', rating: 5, source: 'Google' },
  { text: 'Merce varia, per tutte le tasche, scelta con cura, personale gentile e familiare.', author: 'Elena C.', rating: 5, source: 'Google' },
  { text: 'Qualità eccelsa, capi alla moda ad un buon prezzo.', author: 'Lie92', rating: 5, source: 'Google' },
  { text: 'Ottimo posto per acquisti di vestiario a buon prezzo e di ottima qualità.', author: 'Pietro R.', rating: 5, source: 'Google' },
  { text: 'Personale oltre disponibile, ti sanno consigliare.', author: 'Mariafranca A.', rating: 5, source: 'Google' },
  { text: "Bel negozio, ha un bel po' di abbigliamento vario!", author: 'Sara V.', rating: 5, source: 'Google' },
]
