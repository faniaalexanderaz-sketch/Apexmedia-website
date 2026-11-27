/**
 * GSAP per i componenti client che animano. Importarlo SOLO da componenti "use client".
 *
 * Prestazioni (Lighthouse mobile ≥ 90, LCP < 2,5 s): GSAP e i suoi plugin NON stanno nel primo
 * caricamento. Si scaricano con un import dinamico dopo il primo disegno della pagina, una volta sola,
 * e solo nelle pagine che hanno componenti animati. Il testo e le foto sono già visibili prima.
 *
 * Pulizia: ogni componente lavora dentro un gsap.matchMedia() legato al suo contenitore (scope);
 * quando il componente sparisce tutto viene annullato (animazioni, ScrollTrigger, SplitText, Draggable,
 * ascoltatori restituiti). È lo stesso schema di useGSAP() di @gsap/react, che però porterebbe GSAP
 * nel primo caricamento (+0,7 s di LCP misurati).
 */
import { useEffect } from "react";
import type { gsap as TipoGsap } from "gsap";
import type { ScrollTrigger } from "gsap/ScrollTrigger";
import type { SplitText } from "gsap/SplitText";
import type { Draggable } from "gsap/Draggable";
import type { Flip } from "gsap/Flip";

export type Motore = {
  gsap: typeof TipoGsap;
  ScrollTrigger: typeof ScrollTrigger;
  SplitText: typeof SplitText;
  Draggable: typeof Draggable;
  Flip: typeof Flip;
};

/** Condizioni per gsap.matchMedia(): con "riduci movimento" non si anima nulla, su mobile tutto più breve. */
export const CONDIZIONI = {
  movimento: "(prefers-reduced-motion: no-preference)",
  mobile: "(max-width: 767px)",
};

type NomePlugin = "ScrollTrigger" | "SplitText" | "Draggable" | "Flip";

const importa: Record<NomePlugin, () => Promise<unknown>> = {
  ScrollTrigger: () => import("gsap/ScrollTrigger").then((m) => m.ScrollTrigger),
  SplitText: () => import("gsap/SplitText").then((m) => m.SplitText),
  Draggable: () => import("gsap/Draggable").then((m) => m.Draggable),
  Flip: () => import("gsap/Flip").then((m) => m.Flip),
};
const inCorso = new Map<string, Promise<unknown>>();
const unaVolta = (chiave: string, carica: () => Promise<unknown>) => {
  if (!inCorso.has(chiave)) inCorso.set(chiave, carica());
  return inCorso.get(chiave)!;
};

/** Aspetta che il browser sia libero (dopo il primo disegno e l'avvio della pagina). */
const quandoLibero = () =>
  new Promise<void>((ok) => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(() => ok(), { timeout: 600 });
    else setTimeout(ok, 120);
  });

/**
 * Scarica il nucleo di GSAP e SOLO i plugin chiesti, ognuno nel suo file e una volta sola,
 * quando il browser è libero. Ogni pagina scarica solo quello che usa.
 */
export async function caricaGsap(...plugin: NomePlugin[]): Promise<Motore> {
  await unaVolta("libero", quandoLibero);
  const { gsap } = (await unaVolta("gsap", () => import("gsap"))) as typeof import("gsap");
  const caricati = await Promise.all(plugin.map((n) => unaVolta(n, importa[n])));
  gsap.registerPlugin(...(caricati as object[]));
  const m = { gsap } as Motore;
  plugin.forEach((n, i) => Object.assign(m, { [n]: caricati[i] }));
  return m;
}

/**
 * Quando GSAP (con i plugin elencati) è pronto esegue `imposta` dentro un gsap.matchMedia() limitato a `scope`.
 * Al cambio pagina o allo smontaggio annulla tutto con mm.revert().
 */
export function useAnimazione(
  scope: React.RefObject<HTMLElement | null>,
  plugin: NomePlugin[],
  imposta: (mm: gsap.MatchMedia, m: Motore) => void,
) {
  useEffect(() => {
    let vivo = true;
    let mm: gsap.MatchMedia | undefined;
    caricaGsap(...plugin).then((m) => {
      if (!vivo || !scope.current) return;
      mm = m.gsap.matchMedia(scope.current);
      imposta(mm, m);
    });
    return () => {
      vivo = false;
      mm?.revert();
    };
    // l'impostazione gira una volta per componente montato, come useGSAP() senza dipendenze
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
