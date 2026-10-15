import { useRef } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { newArrivals, type NewArrival } from '../data/newArrivals'
import { useReveal } from '../hooks/useReveal'
import { ResponsiveImage } from './ResponsiveImage'
import { SectionHeading } from './SectionHeading'
import { paths } from '../router'

/**
 * Nuovi arrivi come un servizio di moda: griglia asimmetrica che ripete
 * un ritmo di sei posizioni (grande · sfalsato · terzetto · copertina).
 */
export function NewArrivals() {
  const root = useRef<HTMLElement>(null)
  useReveal(root)

  return (
    <section ref={root} id="nuovi-arrivi" className="section arrivals" data-header="light" aria-labelledby="arrivals-title">
      <div className="container">
        <div className="arrivals__head">
          <SectionHeading
            index={1}
            label="Nuovi arrivi"
            id="arrivals-title"
            title={
              <>
                Appena <em>arrivati.</em>
              </>
            }
            intro="Nuove ispirazioni, nuovi dettagli, nuove possibilità di esprimere il tuo stile."
          />
          <p className="arrivals__note" data-reveal="fade" data-delay="0.3">
            <span className="arrivals__note-rule" data-reveal="line" aria-hidden="true" />
            Una selezione da scoprire dal vivo: taglie e disponibilità cambiano ogni settimana, chiedici cosa è appena
            entrato in boutique.
          </p>
        </div>

        <ol className="arrivals__grid">
          {newArrivals.map((item, i) => (
            <ArrivalCard key={item.id} item={item} index={i} />
          ))}
        </ol>
      </div>
    </section>
  )
}

// velocità leggermente diverse per ogni posizione: la griglia "respira" scorrendo (solo desktop)
const SPEEDS = [1, 1.1, 0.94, 1.06, 0.96, 1]

function ArrivalCard({ item, index }: { item: NewArrival; index: number }) {
  const number = String(index + 1).padStart(2, '0')
  const isFeature = index % 6 === 5

  const href = paths.product(item.product)

  return (
    <li className={`arrival arrival--${index % 6}`} data-speed={SPEEDS[index % 6]}>
      {/* la foto è cliccabile col mouse; da tastiera e lettore di schermo si usa il pulsante "Scopri il look" */}
      <a className="arrival__media" href={href} data-reveal="image" data-cursor="Prenota" tabIndex={-1} aria-hidden="true">
        <span className="arrival__media-inner" data-reveal-inner>
          <ResponsiveImage
            image={item.image}
            sizes={isFeature ? '(min-width: 900px) 40vw, 100vw' : '(min-width: 900px) 34vw, (min-width: 600px) 50vw, 92vw'}
          />
        </span>
        {item.isNew && <span className="tag arrival__tag">Nuovo arrivo</span>}
      </a>
      <div className="arrival__caption" data-reveal="fade">
        <span className="arrival__number" aria-hidden="true">
          {number}
        </span>
        <div className="arrival__text">
          <p className="arrival__category">{item.category}</p>
          <h3 className="arrival__title">{item.title}</h3>
          {isFeature && <p className="arrival__description">{item.description}</p>}
          {item.price && <p className="arrival__price">{item.price}</p>}
          <a className="text-link" href={href} aria-label={`Scopri e prenota: ${item.title}`}>
            Scopri e prenota <ArrowUpRight aria-hidden="true" size={15} strokeWidth={1.5} />
          </a>
        </div>
      </div>
    </li>
  )
}
