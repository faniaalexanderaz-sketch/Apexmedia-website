import type { RefObject } from 'react'
import { gsap, MEDIA, ScrollTrigger, SplitText, useGSAP, EASE_EDITORIAL } from '../lib/gsap'

/**
 * Sistema di reveal condiviso: ogni sezione dichiara nel markup cosa animare
 * e questo hook orchestra le animazioni allo scroll.
 *
 *  data-reveal="title"   titolo che sale riga per riga da una maschera
 *  data-reveal="fade"    dissolvenza con leggero movimento verso l'alto
 *  data-reveal="image"   la foto si scopre dal basso, l'interno si posa (scale)
 *  data-reveal="stagger" i figli diretti entrano in sequenza
 *  data-count            numerazione editoriale che scorre fino al valore
 *  data-parallax="12"    parallax leggero in yPercent (solo desktop)
 *
 * Tutto vive dentro gsap.matchMedia: con prefers-reduced-motion nulla si muove
 * e il contenuto resta semplicemente visibile. useGSAP fa il cleanup.
 */
export function useReveal(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const root = scope.current
      if (!root) return
      const mm = gsap.matchMedia()

      mm.add(MEDIA.motion, () => {
        const q = (sel: string) => Array.from(root.querySelectorAll<HTMLElement>(sel))
        const onEnter = (trigger: Element, start = 'top 86%') => ({ trigger, start, once: true })

        q('[data-reveal="title"]').forEach((el) => {
          SplitText.create(el, {
            type: 'lines',
            mask: 'lines',
            linesClass: 'split-line',
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.lines, {
                yPercent: 108,
                duration: 1.25,
                stagger: 0.09,
                ease: EASE_EDITORIAL,
                scrollTrigger: onEnter(el),
              }),
          })
        })

        q('[data-reveal="fade"]').forEach((el) => {
          // solo opacity (non autoAlpha): gli elementi restano raggiungibili da tastiera
          // anche prima di essere rivelati; il focus li porta in vista e li fa comparire
          gsap.from(el, {
            opacity: 0,
            y: 28,
            duration: 1.1,
            delay: Number(el.dataset.delay ?? 0),
            scrollTrigger: onEnter(el),
          })
        })

        q('[data-reveal="stagger"]').forEach((el) => {
          gsap.from(el.children, {
            opacity: 0,
            y: 24,
            duration: 0.9,
            stagger: 0.08,
            scrollTrigger: onEnter(el, 'top 90%'),
          })
        })

        q('[data-reveal="image"]').forEach((el) => {
          const inner = el.querySelector('[data-reveal-inner]')
          const tl = gsap.timeline({ scrollTrigger: onEnter(el, 'top 88%') })
          tl.fromTo(
            el,
            { clipPath: 'inset(100% 0% 0% 0%)' },
            { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.35, ease: 'expo.inOut', clearProps: 'clipPath' },
          )
          if (inner) tl.from(inner, { scale: 1.22, duration: 1.8, ease: EASE_EDITORIAL }, 0.1)
        })

        q('[data-count]').forEach((el) => {
          const target = Number(el.dataset.count)
          const counter = { value: 0 }
          gsap.to(counter, {
            value: target,
            duration: 1.4,
            ease: 'power2.out',
            snap: { value: 1 },
            scrollTrigger: onEnter(el, 'top 92%'),
            onUpdate: () => {
              el.textContent = String(Math.round(counter.value)).padStart(2, '0')
            },
          })
        })
      })

      mm.add(MEDIA.desktop, () => {
        Array.from(root.querySelectorAll<HTMLElement>('[data-parallax]')).forEach((el) => {
          const amount = Number(el.dataset.parallax) || 10
          gsap.fromTo(
            el,
            { yPercent: -amount / 2 },
            {
              yPercent: amount / 2,
              ease: 'none',
              scrollTrigger: { trigger: el.parentElement ?? el, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
            },
          )
        })
      })

      // le immagini lazy cambiano l'altezza della pagina solo se mancano width/height:
      // qui le hanno, ma un refresh dopo il caricamento dei font riallinea i trigger
      document.fonts?.ready.then(() => ScrollTrigger.refresh())
    },
    { scope },
  )
}
