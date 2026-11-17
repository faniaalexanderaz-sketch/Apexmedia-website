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
  /** Titoli che salgono da una maschera, riga per riga */
  title: "power4.out",
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

/** Titolo di sezione: righe che salgono da una maschera, una dopo l’altra. Restituisce lo SplitText da revertire. */
export function splitLinesIn(
  el: Element,
  trigger: Element = el,
  stagger = 0.1,
  start = "top 85%",
) {
  return SplitText.create(el, {
    type: "lines",
    mask: "lines",
    linesClass: "split-line",
    autoSplit: true,
    onSplit: (self) =>
      gsap.from(self.lines, {
        yPercent: 110,
        duration: 1.1,
        ease: EASE.title,
        stagger,
        scrollTrigger: enterAt(trigger, start),
      }),
  });
}

/**
 * Immagine che entra da una maschera (clip-path dal basso) e poi si muove appena più lenta della pagina.
 * `wrap` è il contenitore con overflow nascosto, `img` l’immagine al suo interno.
 */
export function revealImage(
  wrap: Element,
  img: Element | null,
  trigger: Element = wrap,
  start = "top 85%",
) {
  gsap.fromTo(
    wrap,
    { clipPath: CLIP_HIDDEN_BOTTOM },
    {
      clipPath: CLIP_VISIBLE,
      duration: 1.1,
      ease: EASE.reveal,
      clearProps: "clipPath",
      scrollTrigger: enterAt(trigger, start),
    },
  );
  if (img)
    gsap.fromTo(
      img,
      { yPercent: -3, scale: 1.08 },
      {
        yPercent: 3,
        scale: 1.08,
        ease: EASE.scrub,
        scrollTrigger: {
          trigger: wrap,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      },
    );
}

/** Contatore: da 0 al valore di data-number (data-decimals per i decimali), una volta sola, quando entra in vista. */
export function countUp(
  el: HTMLElement,
  trigger: Element = el,
  start = "top 85%",
) {
  const target = Number(el.dataset.number ?? el.textContent ?? 0);
  const decimals = Number(el.dataset.decimals ?? 0);
  const fmt = new Intl.NumberFormat("it-IT", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const obj = { v: 0 };
  el.textContent = fmt.format(0);
  return gsap.to(obj, {
    v: target,
    duration: 1.3,
    ease: "power2.out",
    onUpdate: () => {
      el.textContent = fmt.format(obj.v);
    },
    scrollTrigger: enterAt(trigger, start),
  });
}

let refreshTimer: number | undefined;
/** Dopo aver creato un pin: riordina e ricalcola tutti gli ScrollTrigger, una volta sola anche se chiamato più volte. */
export function refreshSoon(delay = 600) {
  if (typeof window === "undefined") return;
  window.clearTimeout(refreshTimer);
  refreshTimer = window.setTimeout(() => {
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  }, delay);
}
