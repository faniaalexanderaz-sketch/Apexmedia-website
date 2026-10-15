import { useRef } from 'react'
import { ArrowRight } from 'lucide-react'
import { paths } from '../../router'
import { useReveal } from '../../hooks/useReveal'
import { HowItWorks } from './HowItWorks'

/** Fascia "prenota online, ritira in negozio": spiega il servizio e porta al catalogo. */
export function ReserveBand() {
  const root = useRef<HTMLElement>(null)
  useReveal(root)
  return (
    <section ref={root} className="section reserve" data-header="light" aria-labelledby="reserve-title">
      <div className="container reserve__inner">
        <div className="reserve__head">
          <p className="eyebrow reserve__eyebrow" data-reveal="fade">
            Novità · Prenota e ritira
          </p>
          <h2 id="reserve-title" className="reserve__title" data-reveal="title">
            Lo scegli online, <em>lo provi in boutique.</em>
          </h2>
          <p className="reserve__text" data-reveal="fade" data-delay="0.15">
            Nessuna spedizione e nessun pagamento online: prenoti capo e taglia, noi li teniamo da parte, tu passi quando
            vuoi.
          </p>
          <a className="btn btn--primary" href={paths.shop()} data-magnetic data-reveal="fade" data-delay="0.25">
            Vai alle collezioni <ArrowRight aria-hidden="true" size={16} strokeWidth={1.5} />
          </a>
        </div>
        <HowItWorks />
      </div>
    </section>
  )
}
