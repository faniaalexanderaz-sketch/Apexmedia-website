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
 * Rimanda l’impostazione delle animazioni sotto la piega a un task separato, dopo il primo paint
 * (meno lavoro nel task di idratazione, quindi meno TBT su mobile). Da usare dentro useGSAP:
 *   useGSAP((_, contextSafe) => deferSetup(contextSafe, () => { ... }), { scope })
 * Il ritorno è la funzione di pulizia.
 */
export function deferSetup(contextSafe: ContextSafe | undefined, fn: () => void, delay = 0) {
  if (typeof window === "undefined") return;
  const run = contextSafe ? contextSafe(fn) : fn;
  let idle: number | undefined;
  const timer = window.setTimeout(() => {
    if ("requestIdleCallback" in window) idle = window.requestIdleCallback(run, { timeout: 900 });
    else run();
  }, delay);
  return () => {
    window.clearTimeout(timer);
    if (idle !== undefined && "cancelIdleCallback" in window) window.cancelIdleCallback(idle);
  };
}
