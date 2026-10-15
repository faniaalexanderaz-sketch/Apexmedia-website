// Recensioni mostrate nel nastro a scorrimento.
//
// ATTENZIONE: finché `sample` è true sono TESTI D'ESEMPIO, etichettati come tali nel sito.
// Prima della pubblicazione vanno sostituiti con recensioni Google reali del negozio
// (copiate con il nome come appare su Google, es. "Giulia R.") e `sample` va messo a false.

export type Review = {
  text: string
  author: string
  rating: 1 | 2 | 3 | 4 | 5
  source: string
  sample?: boolean
}

export const reviews: Review[] = [
  { text: 'Personale gentile e disponibile, ti consigliano davvero senza fretta. Sono uscita con un look completo per una cerimonia.', author: 'Esempio di recensione', rating: 5, source: 'Google', sample: true },
  { text: 'Bella selezione di capi e accessori, sempre qualcosa di nuovo quando passo in Corso Acqui.', author: 'Esempio di recensione', rating: 5, source: 'Google', sample: true },
  { text: 'Ho trovato il regalo perfetto per mio marito: mi hanno aiutata a scegliere taglia e colore.', author: 'Esempio di recensione', rating: 5, source: 'Google', sample: true },
  { text: 'Negozio curato, capi di qualità e un servizio che non trovi nei grandi centri commerciali.', author: 'Esempio di recensione', rating: 5, source: 'Google', sample: true },
  { text: 'Ottimo assortimento anche di scarpe. Gentilissimi nel trovare il numero giusto.', author: 'Esempio di recensione', rating: 5, source: 'Google', sample: true },
  { text: 'Ci torno a ogni cambio di stagione: idee nuove e consigli sinceri.', author: 'Esempio di recensione', rating: 5, source: 'Google', sample: true },
]
