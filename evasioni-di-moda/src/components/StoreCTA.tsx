import { useRef } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { images } from '../data/images'
import { store } from '../data/store'
import { gsap, MEDIA, useGSAP } from '../lib/gsap'
import { useReveal } from '../hooks/useReveal'
import { ResponsiveImage } from './ResponsiveImage'

/**
 * CTA finale legata alla visita in negozio. Entrando nella sezione la foto
 * si apre dal centro verso i bordi: è il "sipario" che porta in boutique.
 */
export function StoreCTA() {
  const root = useRef<HTMLElement>(null)
  useReveal(root)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MEDIA.motion, () => {
        gsap.fromTo(
          '.store-cta__frame',
          { clipPath: 'inset(8% 6% 8% 6%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            ease: 'none',
            scrollTrigger: { trigger: root.current, start: 'top 85%', end: 'top 15%', scrub: 0.6 },
          },
        )
        gsap.fromTo(
          '.store-cta__image',
          { scale: 1.14 },
          { scale: 1, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 0.6 } },
        )
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} className="store-cta" data-header="dark" aria-labelledby="cta-title">
      <div className="store-cta__frame">
        <div className="store-cta__image">
          <ResponsiveImage image={images.ctaBoutique} sizes="100vw" alt="" />
        </div>
      </div>
      <div className="store-cta__content container">
        <p className="eyebrow" data-reveal="fade">
          La boutique ti aspetta
        </p>
        <h2 id="cta-title" className="store-cta__title" data-reveal="chars">
          Il prossimo look <em>ti aspetta.</em>
        </h2>
        <p className="store-cta__text" data-reveal="fade" data-delay="0.15">
          Scopri la boutique, lasciati ispirare dai nuovi arrivi e trova i dettagli che parlano di te.
        </p>
        <div className="store-cta__actions" data-reveal="stagger">
          <a className="btn btn--light" href={store.directionsUrl} target="_blank" rel="noopener noreferrer" data-magnetic>
            Vieni a trovarci <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.5} />
            <span className="visually-hidden"> (indicazioni su Google Maps, si apre in una nuova scheda)</span>
          </a>
          <a className="btn btn--ghost-light" href="#contatti" data-magnetic>
            Contattaci
          </a>
        </div>
      </div>
    </section>
  )
}
