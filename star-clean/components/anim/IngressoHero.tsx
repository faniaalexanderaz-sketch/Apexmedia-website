"use client";

import { useRef } from "react";
import { CONDIZIONI, useAnimazione } from "@/lib/gsap";

/**
 * Entrata dell'hero: il titolo sale riga per riga, poi sottotitolo e pulsanti ([data-dopo]).
 * Anima SOLO trasformazioni: il testo è leggibile già prima che parta JavaScript (conta per l'LCP).
 * Se JavaScript arriva tardi (>2,5 s) non anima: chi visita sta già leggendo.
 */
export function IngressoHero({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useAnimazione(ref, ["SplitText"], (mm, { gsap, SplitText }) => {
      if (performance.now() > 2500) return;
      mm.add(CONDIZIONI, (ctx) => {
        const { movimento, mobile } = ctx.conditions as Record<string, boolean>;
        if (!movimento) return;
        const k = mobile ? 0.7 : 1;
        const titolo = ref.current!.querySelector("h1");
        if (titolo) {
          SplitText.create(titolo, {
            type: "lines",
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.lines, { yPercent: 45, duration: 0.6 * k, stagger: 0.07 * k, ease: "power3.out" }),
          });
        }
        gsap.from(ref.current!.querySelectorAll("[data-dopo]"), {
          y: 18,
          duration: 0.5 * k,
          stagger: 0.06,
          delay: 0.25 * k,
          ease: "power3.out",
        });
      });
  });

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
