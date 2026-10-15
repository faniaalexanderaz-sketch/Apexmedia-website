import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'

// Registrazione unica dei plugin. Durante il prerender (Node) non c'è DOM:
// i plugin si registrano solo nel browser.
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP)
  gsap.defaults({ ease: 'power3.out', duration: 1 })
}

/** Condizioni condivise da tutte le animazioni (gsap.matchMedia). */
export const MEDIA = {
  motion: '(prefers-reduced-motion: no-preference)',
  desktop: '(min-width: 900px) and (prefers-reduced-motion: no-preference)',
} as const

/** Easing editoriale: parte deciso, si posa morbido. */
export const EASE_EDITORIAL = 'expo.out'

export { gsap, ScrollTrigger, SplitText, useGSAP }
