import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'

/**
 * Due microinterazioni solo per mouse e trackpad (mai su touch, mai con movimento ridotto):
 *  - cursore-etichetta: sulle foto compare un cerchio bordeaux con l'azione ("Scopri", "Esplora")
 *  - pulsanti magnetici: [data-magnetic] si sposta leggermente verso il puntatore
 */
export function PointerEffects() {
  const cursor = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)')
    if (!fine.matches || !cursor.current) return
    const el = cursor.current
    const xTo = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3.out' })
    let current: Element | null = null
    let magnet: HTMLElement | null = null

    const onMove = (e: PointerEvent) => {
      xTo(e.clientX)
      yTo(e.clientY)
      const target = (e.target as Element | null)?.closest?.('[data-cursor]') ?? null
      if (target !== current) {
        current = target
        if (target) {
          if (label.current) label.current.textContent = target.getAttribute('data-cursor')
          gsap.to(el, { scale: 1, opacity: 1, duration: 0.45, ease: 'expo.out' })
        } else {
          gsap.to(el, { scale: 0, opacity: 0, duration: 0.35, ease: 'power2.in' })
        }
      }

      const m = (e.target as Element | null)?.closest?.<HTMLElement>('[data-magnetic]') ?? null
      if (magnet && magnet !== m) {
        gsap.to(magnet, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' })
      }
      magnet = m
      if (m) {
        const r = m.getBoundingClientRect()
        gsap.to(m, {
          x: (e.clientX - (r.left + r.width / 2)) * 0.22,
          y: (e.clientY - (r.top + r.height / 2)) * 0.3,
          duration: 0.5,
          ease: 'power3.out',
        })
      }
    }
    const onLeave = () => {
      current = null
      gsap.to(el, { scale: 0, opacity: 0, duration: 0.3 })
    }

    gsap.set(el, { xPercent: -50, yPercent: -50, scale: 0, opacity: 0 })
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <div ref={cursor} className="cursor-label" aria-hidden="true">
      <span ref={label}>Scopri</span>
    </div>
  )
}
