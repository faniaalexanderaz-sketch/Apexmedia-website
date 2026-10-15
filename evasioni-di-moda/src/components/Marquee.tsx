import { useRef } from 'react'
import { marqueeWords } from '../data/collections'
import { gsap, MEDIA, ScrollTrigger, useGSAP } from '../lib/gsap'

/**
 * Nastro tipografico: le categorie scorrono e accelerano con la velocità dello scroll.
 * Ripete in grande ciò che si trova in negozio, senza chiedere attenzione al testo.
 */
export function Marquee() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MEDIA.motion, () => {
        const loop = gsap.to('.marquee__track', { xPercent: -50, duration: 38, ease: 'none', repeat: -1 })
        let settle: gsap.core.Tween | null = null
        const st = ScrollTrigger.create({
          trigger: root.current,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: (self) => {
            const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 220, 6)
            settle?.kill()
            loop.timeScale(boost)
            settle = gsap.to(loop, { timeScale: 1, duration: 1.2, ease: 'power2.out' })
          },
        })
        gsap.from('.marquee__track', { xPercent: -8, opacity: 0, duration: 1.4, scrollTrigger: { trigger: root.current, start: 'top 92%', once: true } })
        return () => st.kill()
      })
    },
    { scope: root },
  )

  const words = (hidden: boolean) =>
    marqueeWords.map((w, i) => (
      <span key={`${hidden}-${w}`} className="marquee__item" aria-hidden={hidden || undefined}>
        <span className={i % 2 ? 'marquee__word marquee__word--italic' : 'marquee__word'}>{w}</span>
        <span className="marquee__star" aria-hidden="true">✦</span>
      </span>
    ))

  return (
    <div ref={root} className="marquee" data-header="light">
      <p className="visually-hidden">In boutique: {marqueeWords.join(', ')}.</p>
      <div className="marquee__track" aria-hidden="true">
        {words(true)}
        {words(true)}
      </div>
    </div>
  )
}
