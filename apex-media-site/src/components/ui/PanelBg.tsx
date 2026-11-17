"use client";

import { useRef } from "react";
import { deferSetup, gsap, useGSAP, MEDIA, EASE } from "@/lib/gsap";

/**
 * Fondo delle sezioni scure: entra un po’ più stretto della pagina e si allarga a tutta larghezza
 * mentre la sezione sale. È la transizione tra le sezioni chiare e quelle scure, uguale ovunque.
 * La sezione che lo contiene deve avere `relative isolate`.
 */
export function PanelBg({ className = "bg-ink" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    (_, contextSafe) =>
      deferSetup(
        contextSafe,
        () => {
          const el = ref.current;
          const section = el?.parentElement;
          if (!el || !section) return;
          const mm = gsap.matchMedia();
          mm.add([MEDIA.desktop, MEDIA.mobile], () => {
            gsap.fromTo(
              el,
              { scaleX: 0.94 },
              {
                scaleX: 1,
                ease: EASE.scrub,
                scrollTrigger: {
                  trigger: section,
                  start: "top bottom",
                  end: "top 30%",
                  scrub: true,
                },
              },
            );
          });
        },
        40,
      ),
    { scope: ref },
  );

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`absolute inset-0 -z-10 rounded-t-[20px] will-change-transform lg:rounded-t-[32px] ${className}`}
    />
  );
}
