import { useRef } from 'react'
import { ArrowUpRight, MapPin, Phone } from 'lucide-react'
import { collections, type Collection } from '../data/collections'
import { store } from '../data/store'
import { useReveal } from '../hooks/useReveal'
import { ResponsiveImage } from './ResponsiveImage'
import { SectionHeading } from './SectionHeading'
import { useInquiry } from './Inquiry'

/**
 * Collezioni: mosaico fotografico su fondo inchiostro (desktop),
 * carosello a scorrimento orizzontale con aggancio (mobile).
 */
export function Collections() {
  const root = useRef<HTMLElement>(null)
  useReveal(root)

  return (
    <section ref={root} id="collezioni" className="section collections" data-header="dark" aria-labelledby="collections-title">
      <div className="container">
        <div className="collections__head">
          <SectionHeading
            index={2}
            label="Collezioni"
            id="collections-title"
            title={
              <>
                Trova il tuo <em>stile.</em>
              </>
            }
            intro="Dal capo quotidiano al dettaglio speciale: ogni categoria è un punto di partenza da esplorare con noi in boutique."
          />
          <p className="collections__hint" aria-hidden="true">
            Scorri <span>→</span>
          </p>
        </div>

        <ul className="collections__grid" aria-label="Categorie">
          {collections.map((c, i) => (
            <CollectionBlock key={c.id} collection={c} index={i} />
          ))}
          <li className="collection collection--advice">
            <div className="advice" data-reveal="fade">
              <p className="eyebrow advice__eyebrow">Consiglio di stile</p>
              <p className="advice__title">
                Non sai da dove <em>iniziare?</em>
              </p>
              <p className="advice__text">
                Raccontaci cosa cerchi e per quale occasione: ti aiutiamo a trovare i capi giusti da provare in boutique.
              </p>
              <div className="advice__actions">
                <a className="btn btn--light btn--small" href={store.phone.href}>
                  <Phone aria-hidden="true" size={15} strokeWidth={1.6} /> Chiamaci
                </a>
                <a className="text-link text-link--light" href={store.directionsUrl} target="_blank" rel="noopener noreferrer">
                  <MapPin aria-hidden="true" size={15} strokeWidth={1.6} /> Come arrivare
                  <span className="visually-hidden"> (Google Maps, si apre in una nuova scheda)</span>
                </a>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </section>
  )
}

const SIZES = [
  '(min-width: 900px) 42vw, 84vw',
  '(min-width: 900px) 58vw, 84vw',
  '(min-width: 900px) 25vw, 84vw',
  '(min-width: 900px) 34vw, 84vw',
  '(min-width: 900px) 34vw, 84vw',
  '(min-width: 900px) 66vw, 84vw',
]

function CollectionBlock({ collection, index }: { collection: Collection; index: number }) {
  const openInquiry = useInquiry()
  const fullTitle = collection.accent ? `${collection.title} ${collection.accent}` : collection.title

  const open = () =>
    openInquiry({
      kicker: 'Collezioni',
      title: fullTitle,
      image: collection.image,
      paragraphs: [
        collection.text,
        'La selezione cambia spesso: il modo migliore per scoprirla è passare in boutique o chiamarci per sapere cosa è appena arrivato.',
      ],
      topic: `la selezione ${fullTitle.toLowerCase()}`,
    })

  return (
    <li className={`collection collection--${collection.id}`}>
      <button type="button" className="collection__button" onClick={open} aria-label={`${fullTitle}: esplora la selezione`}>
        <span className="collection__media" data-reveal="image">
          <span className="collection__media-inner" data-reveal-inner>
            <ResponsiveImage image={collection.image} sizes={SIZES[index % SIZES.length]} alt="" />
          </span>
        </span>
        <span className="collection__index" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="collection__body">
          <span className="collection__title">
            {collection.title} {collection.accent && <em>{collection.accent}</em>}
          </span>
          <span className="collection__text">{collection.text}</span>
          <span className="collection__cta" aria-hidden="true">
            Esplora la selezione <ArrowUpRight size={15} strokeWidth={1.5} />
          </span>
        </span>
      </button>
    </li>
  )
}
