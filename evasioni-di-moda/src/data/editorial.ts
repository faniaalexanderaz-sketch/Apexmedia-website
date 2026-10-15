import { images, type ImageAsset } from './images'

// Ispirazioni di stagione: contenuti di stile, non annunci di disponibilità.
// Il primo articolo è quello principale (foto grande), gli altri due affiancati.

export type EditorialStory = {
  id: string
  kicker: string
  title: string
  excerpt: string
  image: ImageAsset
  /** Testo completo mostrato all'apertura */
  body: string[]
  tips: string[]
}

export const editorialStories: EditorialStory[] = [
  {
    id: 'nero-e-volume',
    kicker: 'Silhouette',
    title: 'Il nero che non è mai uguale a sé stesso',
    excerpt:
      "Volumi, texture e un accessorio importante: come rendere il nero il punto di partenza più versatile dell'armadio.",
    image: images.editorialeCappelloNero,
    body: [
      'Il nero funziona quando smette di essere una scelta prudente. Basta giocare con le superfici: una lana compatta accanto a un dettaglio lucido, una rouche, una cucitura a vista.',
      'Il segreto è scegliere un solo protagonista per volta. Se il cappotto ha carattere, tutto il resto può restare essenziale.',
    ],
    tips: [
      'Un elemento scultoreo per look: colletto, maniche o cappello.',
      'Alterna tessuti opachi e lucidi per dare profondità al total black.',
      'Un accento di colore, anche solo nel rossetto, accende tutto il resto.',
    ],
  },
  {
    id: 'dettagli',
    kicker: 'Dettagli',
    title: 'Un gioiello cambia tutto',
    excerpt: 'Collane sovrapposte, metallo caldo e un collo alto: piccoli gesti che trasformano un look quotidiano.',
    image: images.editorialeDolcevita,
    body: [
      'Il dolcevita è la tela perfetta: pulito, essenziale, pronto a ricevere un dettaglio che lo renda tuo.',
      'Una collana importante sul nero, due catene sottili sul bianco: il gioiello disegna il viso e guida lo sguardo.',
    ],
    tips: [
      'Sul collo alto scegli una collana che arrivi sotto la clavicola.',
      'Oro caldo su panna e cammello, argento su grigi e neri.',
      "Un solo punto luce se l'outfit ha già una stampa.",
    ],
  },
  {
    id: 'quadri',
    kicker: 'Colori',
    title: 'Quadri e verdi profondi',
    excerpt: 'Il cappotto a quadri come capo di carattere: abbinarlo al quotidiano senza esagerare.',
    image: images.editorialeQuadri,
    body: [
      'I verdi bosco, i blu notte e i toni tabacco tornano ogni autunno perché stanno bene a quasi tutti e si accostano con naturalezza.',
      'Un capospalla a quadri lavora da solo: sotto bastano tinte unite e una scarpa pulita.',
    ],
    tips: [
      'Riprendi uno dei colori del quadro in una maglia o in una sciarpa.',
      'Con le fantasie importanti, accessori in pelle liscia e tonalità neutre.',
      'Un jeans scuro rende il cappotto a quadri adatto a tutti i giorni.',
    ],
  },
]
