import { useRef } from 'react'
import { ArrowUpRight, MapPin, Phone } from 'lucide-react'
import { collections, type Collection } from '../data/collections'
import { store } from '../data/store'
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap'
import { useReveal } from '../hooks/useReveal'
import { ResponsiveImage } from './ResponsiveImage'
import { SectionHeading } from './SectionHeading'
import { paths } from '../router'
import { productsIn } from '../data/products'

/**
 * Collezioni come una galleria da sfogliare.
 * Desktop: la sezione si ferma e le categorie scorrono in orizzontale con lo scroll
 * (unico "pin" del sito), le foto scivolano dentro le cornici.
 * Mobile/tablet o movimento ridotto: carosello nativo a scorrimento con aggancio.
 */
export function Collections() {
  const root = useRef<HTMLElement>(null)
  useReveal(root)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
        const section = root.current!
        const viewport = section.querySelector<HTMLElement>('.collections__viewport')!
        const track = section.querySelector<HTMLElement>('.collections__track')!
        section.classList.add('is-pinned')
        const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth)

        const scroll = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })

        gsap.fromTo(
          '.collections__progress-bar',
          { scaleX: 0 },
          { scaleX: 1, ease: 'none', scrollTrigger: { trigger: section, start: 'top top', end: () => `+=${distance()}`, scrub: true, invalidateOnRefresh: true } },
        )

        gsap.utils.toArray<HTMLElement>('.collection__media-inner', section).forEach((img) => {
          gsap.fromTo(
            img,
            { xPercent: -6 },
            {
              xPercent: 6,
              ease: 'none',
              scrollTrigger: { trigger: img, containerAnimation: scroll, start: 'left right', end: 'right left', scrub: true },
            },
          )
        })

        gsap.utils.toArray<HTMLElement>('.collection__title', section).forEach((title) => {
          gsap.from(title, {
            yPercent: 40,
            opacity: 0,
            duration: 1,
            ease: 'expo.out',
            scrollTrigger: { trigger: title, containerAnimation: scroll, start: 'left 85%', toggleActions: 'play none none none' },
          })
        })

        ScrollTrigger.refresh()
        return () => section.classList.remove('is-pinned')
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="collezioni" className="collections" data-header="light" aria-labelledby="collections-title">
      <div className="collections__viewport">
        <ul className="collections__track" aria-label="Categorie">
          <li className="collections__intro">
            <SectionHeading
              index={2}
              label="Collezioni"
              id="collections-title"
              title={
                <>
                  Trova il tuo <em>stile.</em>
                </>
              }
              intro="Uomo e donna, dal capo quotidiano al dettaglio speciale: ogni categoria è un punto di partenza da esplorare con noi in boutique."
            />
            <p className="collections__hint" aria-hidden="true">
              <span className="collections__hint-line" /> Scorri per sfogliare
            </p>
          </li>
          {collections.map((c, i) => (
            <CollectionCard key={c.id} collection={c} index={i} />
          ))}
          <li className="collection collection--advice">
            <div className="advice">
              <p className="eyebrow advice__eyebrow">Consiglio di stile</p>
              <p className="advice__title">
                Non sai da dove <em>iniziare?</em>
              </p>
              <p className="advice__text">
                Raccontaci cosa cerchi e per quale occasione: ti aiutiamo a trovare i capi giusti da provare in boutique.
              </p>
              <div className="advice__actions">
                <a className="btn btn--light btn--small" href={store.phone.href} data-magnetic>
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
      <div className="collections__progress" aria-hidden="true">
        <span className="collections__progress-bar" />
      </div>
    </section>
  )
}

function CollectionCard({ collection, index }: { collection: Collection; index: number }) {
  const fullTitle = collection.accent ? `${collection.title} ${collection.accent}` : collection.title
  const count = productsIn(collection.id).length

  return (
    <li className={`collection collection--${collection.shape}`}>
      <a className="collection__button" href={paths.shop(collection.id)} data-cursor="Esplora" aria-label={`${fullTitle}: ${count} ${count === 1 ? "capo" : "capi"} da prenotare`}>
        <span className="collection__media">
          <span className="collection__media-inner">
            <ResponsiveImage
              image={collection.image}
              sizes={collection.shape === 'landscape' ? '(min-width: 900px) 52vw, 84vw' : '(min-width: 900px) 30vw, 84vw'}
              alt=""
            />
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
            Scopri {count} {count === 1 ? "capo" : "capi"} <ArrowUpRight size={15} strokeWidth={1.5} />
          </span>
        </span>
      </a>
    </li>
  )
}
