import type { RefObject } from 'react'
import { gsap, MEDIA, ScrollTrigger, SplitText, useGSAP, EASE_EDITORIAL } from '../lib/gsap'

/**
 * Sistema di reveal condiviso: ogni sezione dichiara nel markup cosa animare
 * e questo hook orchestra le animazioni allo scroll.
 *
 *  data-reveal="title"   titolo: le parole salgono da una maschera, con una leggera rotazione
 *  data-reveal="chars"   testo breve: lettera per lettera
 *  data-reveal="scrub"   manifesto: le parole si "accendono" mentre si scorre
 *  data-reveal="fade"    dissolvenza con movimento verso l'alto
 *  data-reveal="block"   blocco che si posa (scala + salita)
 *  data-reveal="image"   la foto si scopre dal basso, l'interno si posa
 *  data-reveal="stagger" i figli diretti entrano in sequenza
 *  data-reveal="line"    filetto che si disegna da sinistra
 *  data-count            numerazione editoriale che scorre fino al valore
 *  data-parallax="12"    parallax dell'immagine dentro la cornice (solo desktop)
 *  data-speed="0.8"      il blocco scorre a velocità diversa dalla pagina (solo desktop)
 *
 * Tutto vive dentro gsap.matchMedia: con prefers-reduced-motion nulla si muove
 * e il contenuto resta visibile. Solo opacity (mai visibility): gli elementi
 * restano raggiungibili da tastiera anche prima di comparire. useGSAP fa il cleanup.
 */
export function useReveal(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const root = scope.current
      if (!root) return
      const mm = gsap.matchMedia()
      const q = (sel: string) => Array.from(root.querySelectorAll<HTMLElement>(sel))
      const onEnter = (trigger: Element, start = 'top 86%') => ({ trigger, start, once: true })

      mm.add(MEDIA.motion, () => {
        q('[data-reveal="title"]').forEach((el) => {
          SplitText.create(el, {
            type: 'lines,words',
            mask: 'lines',
            linesClass: 'split-line',
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.words, {
                yPercent: 115,
                rotate: 5,
                duration: 1.2,
                stagger: 0.06,
                ease: EASE_EDITORIAL,
                scrollTrigger: onEnter(el),
              }),
          })
        })

        q('[data-reveal="chars"]').forEach((el) => {
          SplitText.create(el, {
            type: 'lines,chars',
            mask: 'lines',
            linesClass: 'split-line',
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.chars, {
                yPercent: 110,
                duration: 1,
                stagger: 0.025,
                ease: EASE_EDITORIAL,
                scrollTrigger: onEnter(el, 'top 92%'),
              }),
          })
        })

        q('[data-reveal="scrub"]').forEach((el) => {
          SplitText.create(el, {
            type: 'words',
            autoSplit: true,
            onSplit: (self) =>
              gsap.fromTo(
                self.words,
                { opacity: 0.14 },
                {
                  opacity: 1,
                  ease: 'none',
                  stagger: 0.1,
                  scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 50%', scrub: 0.6 },
                },
              ),
          })
        })

        q('[data-reveal="fade"]').forEach((el) => {
          gsap.from(el, {
            opacity: 0,
            y: 30,
            duration: 1.1,
            delay: Number(el.dataset.delay ?? 0),
            scrollTrigger: onEnter(el),
          })
        })

        q('[data-reveal="block"]').forEach((el) => {
          gsap.from(el, {
            opacity: 0,
            y: 60,
            scale: 0.94,
            duration: 1.3,
            ease: EASE_EDITORIAL,
            delay: Number(el.dataset.delay ?? 0),
            scrollTrigger: onEnter(el, 'top 92%'),
          })
        })

        q('[data-reveal="stagger"]').forEach((el) => {
          gsap.from(el.children, {
            opacity: 0,
            y: 26,
            duration: 0.9,
            stagger: 0.09,
            scrollTrigger: onEnter(el, 'top 90%'),
          })
        })

        q('[data-reveal="line"]').forEach((el) => {
          gsap.from(el, { scaleX: 0, transformOrigin: 'left center', duration: 1.4, ease: 'expo.inOut', scrollTrigger: onEnter(el, 'top 94%') })
        })

        q('[data-reveal="image"]').forEach((el) => {
          const inner = el.querySelector('[data-reveal-inner]')
          const tl = gsap.timeline({ scrollTrigger: onEnter(el, 'top 88%') })
          tl.fromTo(
            el,
            { clipPath: 'inset(100% 0% 0% 0%)' },
            { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.35, ease: 'expo.inOut', clearProps: 'clipPath' },
          )
          if (inner) tl.from(inner, { scale: 1.25, duration: 1.9, ease: EASE_EDITORIAL }, 0.1)
        })

        q('[data-count]').forEach((el) => {
          const target = Number(el.dataset.count)
          const counter = { value: 0 }
          gsap.to(counter, {
            value: target,
            duration: 1.4,
            ease: 'power2.out',
            scrollTrigger: onEnter(el, 'top 92%'),
            onUpdate: () => {
              el.textContent = String(Math.round(counter.value)).padStart(2, '0')
            },
          })
        })
      })

      mm.add(MEDIA.desktop, () => {
        q('[data-parallax]').forEach((el) => {
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

        q('[data-speed]').forEach((el) => {
          const speed = Number(el.dataset.speed) || 1
          gsap.to(el, {
            y: () => (1 - speed) * window.innerHeight * 0.35,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.8, invalidateOnRefresh: true },
          })
        })
      })

      document.fonts?.ready.then(() => ScrollTrigger.refresh())
    },
    { scope },
  )
}
