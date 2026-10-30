import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

/** Registrazione unica dei plugin (solo nel browser). */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
  gsap.defaults({ ease: "power3.out", duration: 0.7 });
}

/** Le tre condizioni di gsap.matchMedia usate in tutto il sito. */
export const MEDIA = {
  desktop: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
  mobile: "(max-width: 1023px) and (prefers-reduced-motion: no-preference)",
  reduce: "(prefers-reduced-motion: reduce)",
} as const;

/** Easing di casa. */
export const EASE = {
  enter: "power3.out",
  reveal: "expo.out",
  scrub: "none",
} as const;

/** ScrollTrigger standard per gli ingressi: parte quando l’elemento è all’85% della finestra, una sola volta. */
export const enterAt = (trigger: Element, start = "top 85%") => ({
  trigger,
  start,
  once: true,
});

export const CLIP_HIDDEN_BOTTOM = "inset(100% 0% 0% 0%)";
export const CLIP_VISIBLE = "inset(0% 0% 0% 0%)";

export { gsap, ScrollTrigger, SplitText, useGSAP };

type ContextSafe = <T extends (...args: unknown[]) => unknown>(fn: T) => T;

/**
 * Rimanda l’impostazione delle animazioni sotto la piega a dopo il primo paint: parte al primo scroll,
 * oppure a caricamento completato (in un momento di idle), oppure comunque entro 2,5 s.
 * Così il task di idratazione resta corto e l’immagine dell’hero viene dipinta prima (LCP).
 * Da usare dentro useGSAP:
 *   useGSAP((_, contextSafe) => deferSetup(contextSafe, () => { ... }), { scope })
 * Il ritorno è la funzione di pulizia.
 */
export function deferSetup(
  contextSafe: ContextSafe | undefined,
  fn: () => void,
  delay = 0,
) {
  if (typeof window === "undefined") return;
  const run = contextSafe ? contextSafe(fn) : fn;
  let done = false;
  let timer: number | undefined;
  let idle: number | undefined;
  const fire = () => {
    if (done) return;
    done = true;
    cleanup();
    timer = window.setTimeout(run, delay);
  };
  const onLoad = () => {
    if ("requestIdleCallback" in window)
      idle = window.requestIdleCallback(fire, { timeout: 600 });
    else fire();
  };
  const cleanup = () => {
    window.removeEventListener("scroll", fire);
    window.removeEventListener("load", onLoad);
    if (idle !== undefined && "cancelIdleCallback" in window)
      window.cancelIdleCallback(idle);
  };
  window.addEventListener("scroll", fire, { passive: true, once: true });
  if (document.readyState === "complete") onLoad();
  else window.addEventListener("load", onLoad, { once: true });
  const limit = window.setTimeout(fire, 2500);
  return () => {
    done = true;
    cleanup();
    window.clearTimeout(limit);
    if (timer !== undefined) window.clearTimeout(timer);
  };
}

/** Titolo che sale da una maschera, parola per parola, quando entra in vista. Restituisce lo SplitText da revertire. */
export function splitWordsIn(
  el: Element,
  trigger: Element = el,
  stagger = 0.05,
  start = "top 85%",
) {
  return SplitText.create(el, {
    type: "words",
    mask: "words",
    autoSplit: true,
    onSplit: (self) =>
      gsap.from(self.words, {
        yPercent: 100,
        duration: 0.8,
        ease: EASE.reveal,
        stagger,
        scrollTrigger: enterAt(trigger, start),
      }),
  });
}
