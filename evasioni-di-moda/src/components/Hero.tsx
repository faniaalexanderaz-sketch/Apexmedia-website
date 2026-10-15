import { useRef } from 'react'
import { ArrowDown, ArrowRight } from 'lucide-react'
import { images } from '../data/images'
import { store } from '../data/store'
import { gsap, MEDIA, SplitText, useGSAP, EASE_EDITORIAL } from '../lib/gsap'
import { ResponsiveImage } from './ResponsiveImage'
import { OpenStatusBadge } from './OpenStatus'

/**
 * Hero su fondo avorio: titolo in Bodoni Moda che entra lettera per lettera,
 * foto incorniciata in un arco (rimando alle vetrine e ai portici del centro),
 * dettaglio in sovrapposizione e sigillo circolare che ruota con lo scroll.
 */
export function Hero() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const html = document.documentElement
      const mm = gsap.matchMedia()

      mm.add(MEDIA.motion, () => {
        // se il fallback dell'head ha già mostrato l'hero (rete lenta) non la si nasconde di nuovo
        if (!html.classList.contains('intro')) return

        const title = root.current!.querySelector('.hero__title')!
        const split = SplitText.create(title, { type: 'lines,chars', mask: 'lines', linesClass: 'split-line' })

        const tl = gsap.timeline({ defaults: { ease: EASE_EDITORIAL } })
        tl.fromTo(
          '.hero__arch',
          { clipPath: 'inset(100% 0% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut', clearProps: 'clipPath' },
          0,
        )
          .from('.hero__arch-inner', { scale: 1.35, duration: 2.4 }, 0)
          .from('.hero__eyebrow', { opacity: 0, y: 14, duration: 0.9 }, 0.35)
          .from(split.chars, { yPercent: 115, rotate: 6, duration: 1.15, stagger: 0.022 }, 0.45)
          .from('.hero__lead', { opacity: 0, y: 18, duration: 1 }, 1.05)
          .from('.hero__ctas > *', { opacity: 0, y: 18, duration: 0.9, stagger: 0.1 }, 1.15)
          .from('.hero__detail', { opacity: 0, y: 60, rotate: -4, duration: 1.4 }, 0.95)
          .from('.hero__seal', { opacity: 0, scale: 0.6, rotate: -90, duration: 1.6 }, 1.1)
          .from('.hero__meta > *, .scroll-cue', { opacity: 0, duration: 1, stagger: 0.08 }, 1.35)
          .from(document.querySelector('.site-header'), { autoAlpha: 0, duration: 1.2 }, 0.8)

        html.classList.remove('intro')
      })

      // scroll: il sigillo ruota, la foto scorre più lenta, il dettaglio più veloce (profondità)
      mm.add(MEDIA.motion, () => {
        const st = { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.6 }
        gsap.to('.hero__seal-text', { rotate: 220, ease: 'none', scrollTrigger: st })
        gsap.to('.hero__arch-parallax', { yPercent: 8, ease: 'none', scrollTrigger: st })
        gsap.to('.hero__detail', { yPercent: -35, ease: 'none', scrollTrigger: st })
      })

      html.classList.remove('intro')
    },
    { scope: root },
  )

  return (
    <section ref={root} id="top" className="hero" data-header="light" aria-labelledby="hero-title">
      <div className="hero__inner">
        <div className="hero__content">
          <p className="eyebrow hero__eyebrow" data-intro>
            Boutique multimarca <span aria-hidden="true">·</span> Alessandria
          </p>
          <h1 id="hero-title" className="hero__title" data-intro>
            Lo stile è<br /> il tuo modo<br /> di <em>evadere.</em>
          </h1>
          <p className="hero__lead" data-intro>
            Abbigliamento, calzature e accessori uomo e donna: nuovi arrivi e consigli su misura, in Corso Acqui 94.
          </p>
          <div className="hero__ctas" data-intro>
            <a className="btn btn--primary" href="#nuovi-arrivi" data-magnetic>
              Scopri i nuovi arrivi <ArrowRight aria-hidden="true" size={16} strokeWidth={1.5} />
            </a>
            <a className="btn btn--outline" href="#contatti" data-magnetic>
              Visita la boutique
            </a>
          </div>
          <div className="hero__meta" data-intro>
            <OpenStatusBadge />
            <a className="hero__phone link-underline" href={store.phone.href}>
              Tel. {store.phone.display}
            </a>
          </div>
        </div>

        <div className="hero__visual" data-intro>
          <div className="hero__arch">
            <div className="hero__arch-parallax">
              <div className="hero__arch-inner">
                <ResponsiveImage image={images.heroCappottoCammello} sizes="(min-width: 900px) 40vw, 88vw" priority />
              </div>
            </div>
          </div>

          <figure className="hero__detail">
            <ResponsiveImage image={images.heroDettaglio} sizes="(min-width: 900px) 14vw, 30vw" priority />
          </figure>

          <div className="hero__seal" aria-hidden="true">
            <svg className="hero__seal-text" viewBox="0 0 200 200">
              <defs>
                <path id="seal-circle" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
              </defs>
              <text>
                <textPath href="#seal-circle">Nuovi arrivi · Autunno Inverno · Corso Acqui ·</textPath>
              </text>
            </svg>
            <span className="hero__seal-center">E</span>
          </div>
        </div>
      </div>

      <a className="scroll-cue" href="#nuovi-arrivi" aria-label="Scorri ai nuovi arrivi" data-intro>
        <span aria-hidden="true">Scorri</span>
        <span className="scroll-cue__line" aria-hidden="true" />
        <ArrowDown className="scroll-cue__arrow" aria-hidden="true" size={14} strokeWidth={1.5} />
      </a>
    </section>
  )
}
