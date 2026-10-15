import { useRef } from 'react'
import { ArrowDown, ArrowRight } from 'lucide-react'
import { images } from '../data/images'
import { gsap, MEDIA, SplitText, useGSAP, EASE_EDITORIAL } from '../lib/gsap'
import { ResponsiveImage } from './ResponsiveImage'

/**
 * Hero a tutta altezza, composizione asimmetrica:
 * desktop → titolo editoriale a sinistra che sconfina sulla foto verticale a destra;
 * mobile  → foto a pieno schermo con ritaglio dedicato e testo ancorato in basso.
 */
export function Hero() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const html = document.documentElement
      const mm = gsap.matchMedia()

      mm.add(MEDIA.motion, () => {
        // L'intro parte solo se la pagina è ancora "in attesa": se la rete è stata lenta
        // e il fallback dell'head ha già mostrato l'hero, non la si nasconde di nuovo.
        if (!html.classList.contains('intro')) return

        const title = root.current!.querySelector('.hero__title')!
        const split = SplitText.create(title, { type: 'lines', mask: 'lines', linesClass: 'split-line' })

        const tl = gsap.timeline({ defaults: { ease: EASE_EDITORIAL } })
        tl.fromTo(
          '.hero__media',
          { clipPath: 'inset(0% 0% 100% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut', clearProps: 'clipPath' },
          0,
        )
          .from('.hero__media-inner', { scale: 1.28, duration: 2.4 }, 0)
          .from('.hero__eyebrow', { autoAlpha: 0, y: 12, duration: 0.9 }, 0.45)
          .from(split.lines, { yPercent: 110, duration: 1.3, stagger: 0.1 }, 0.55)
          .from('.hero__lead', { autoAlpha: 0, y: 18, duration: 1 }, 1.0)
          .from('.hero__ctas > *', { autoAlpha: 0, y: 16, duration: 0.9, stagger: 0.1 }, 1.12)
          .from('.hero__meta > *, .scroll-cue', { autoAlpha: 0, duration: 1, stagger: 0.08 }, 1.3)
          // l'header ha già una transizione CSS su transform (nascondi/mostra): qui solo opacità
          .from(document.querySelector('.site-header'), { autoAlpha: 0, duration: 1.2 }, 0.9)

        html.classList.remove('intro')
      })

      // scorrendo, la foto scivola appena più lenta del testo: profondità senza effetti vistosi
      mm.add(MEDIA.desktop, () => {
        gsap.to('.hero__media-parallax', {
          yPercent: 10,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.5 },
        })
        gsap.to('.hero__content', {
          yPercent: -12,
          autoAlpha: 0.2,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.5 },
        })
      })

      // senza GSAP/animazioni: la pagina non resta mai in attesa
      html.classList.remove('intro')
    },
    { scope: root },
  )

  return (
    <section ref={root} id="top" className="hero" data-header="dark" aria-labelledby="hero-title">
      <div className="hero__media" data-intro>
        <div className="hero__media-parallax">
          <div className="hero__media-inner">
            <ResponsiveImage
              image={images.heroCappottoCammello}
              sizes="(min-width: 900px) 48vw, 100vw"
              priority
            />
          </div>
        </div>
      </div>

      <div className="hero__content">
        <p className="eyebrow hero__eyebrow" data-intro>
          Boutique di abbigliamento <span aria-hidden="true">·</span> Alessandria
        </p>
        <h1 id="hero-title" className="hero__title" data-intro>
          Lo stile è<br /> il tuo modo<br /> di <em>evadere.</em>
        </h1>
        <p className="hero__lead" data-intro>
          Nuovi arrivi, capi scelti con cura e dettagli che parlano di te. Ti aspettiamo in Corso Acqui.
        </p>
        <div className="hero__ctas" data-intro>
          <a className="btn btn--light" href="#nuovi-arrivi">
            Scopri i nuovi arrivi <ArrowRight aria-hidden="true" size={16} strokeWidth={1.5} />
          </a>
          <a className="btn btn--ghost-light" href="#contatti">
            Visita la boutique
          </a>
        </div>
      </div>

      <div className="hero__meta" aria-hidden="true" data-intro>
        <span>N° 01 — Nuova stagione</span>
        <span>Corso Acqui 94</span>
      </div>

      <a className="scroll-cue" href="#nuovi-arrivi" aria-label="Scorri ai nuovi arrivi" data-intro>
        <span aria-hidden="true">Scorri</span>
        <span className="scroll-cue__line" aria-hidden="true" />
        <ArrowDown className="scroll-cue__arrow" aria-hidden="true" size={14} strokeWidth={1.5} />
      </a>
    </section>
  )
}
