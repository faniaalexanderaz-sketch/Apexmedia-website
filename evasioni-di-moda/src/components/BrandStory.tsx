import { useRef } from 'react'
import { images } from '../data/images'
import { store } from '../data/store'
import { useReveal } from '../hooks/useReveal'
import { ResponsiveImage } from './ResponsiveImage'

/**
 * Il negozio: manifesto che si "accende" parola per parola mentre si scorre,
 * poi foto lifestyle + dettaglio e i tre fatti che descrivono la boutique.
 */
export function BrandStory() {
  const root = useRef<HTMLElement>(null)
  useReveal(root)

  return (
    <section ref={root} id="negozio" className="section story" data-header="light" aria-labelledby="story-title">
      <div className="container">
        <p className="eyebrow story__eyebrow" data-reveal="fade">
          <span data-count="3">03</span> — Il negozio
        </p>
        <h2 id="story-title" className="story__title" data-reveal="title">
          Il bello di sentirsi <em>sé stessi.</em>
        </h2>
        <p className="story__manifesto" data-reveal="scrub">
          Ogni capo racconta qualcosa. Un dettaglio che cattura lo sguardo, una linea che valorizza la personalità, un look
          che diventa parte della quotidianità.
        </p>

        <div className="story__grid">
          <div className="story__visual">
            <figure className="story__main" data-reveal="image">
              <span className="story__main-inner" data-reveal-inner>
                <span className="story__parallax" data-parallax="12">
                  <ResponsiveImage image={images.storiaStender} sizes="(min-width: 900px) 38vw, 86vw" />
                </span>
              </span>
            </figure>
            <figure className="story__detail" data-reveal="image" data-speed="1.15">
              <span className="story__detail-inner" data-reveal-inner>
                <ResponsiveImage image={images.storiaDettaglio} sizes="(min-width: 900px) 18vw, 44vw" />
              </span>
            </figure>
          </div>

          <div className="story__text">
            <p className="story__lead" data-reveal="fade">
              Evasioni di Moda è uno spazio dedicato alla ricerca del proprio stile, tra nuovi arrivi e ispirazioni da
              scoprire. Entri per curiosità, esci con un'idea in più su come vestirti.
            </p>

            <dl className="story__facts" data-reveal="stagger">
              <div>
                <dt>Per chi</dt>
                <dd>{store.offer.audience}</dd>
              </div>
              <div>
                <dt>Cosa trovi</dt>
                <dd>{store.offer.categories}</dd>
              </div>
              <div>
                <dt>Gli stili</dt>
                <dd>{store.offer.styles}</dd>
              </div>
            </dl>

            <ul className="story__points" data-reveal="stagger">
              <li>
                <span className="story__point-index">i.</span>
                <span>
                  <strong>Consiglio dal vivo</strong> Raccontaci l'occasione, ti aiutiamo a costruire il look.
                </span>
              </li>
              <li>
                <span className="story__point-index">ii.</span>
                <span>
                  <strong>Nuovi arrivi</strong> La selezione si rinnova durante la stagione.
                </span>
              </li>
              <li>
                <span className="story__point-index">iii.</span>
                <span>
                  <strong>In Corso Acqui</strong> Ti aspettiamo al civico 94, ad Alessandria.
                </span>
              </li>
            </ul>
            <a className="text-link text-link--large" href="#contatti" data-reveal="fade">
              Vieni a conoscerci
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
