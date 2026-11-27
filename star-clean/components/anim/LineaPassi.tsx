"use client";

import { useRef } from "react";
import { CONDIZIONI, useAnimazione } from "@/lib/gsap";

/**
 * "Come lavoriamo": la linea che unisce i passi si disegna scorrendo (scrub).
 * Struttura attesa nei figli: [data-riempimento] (la linea) e [data-passo] (i passi, con il punto [data-punto]).
 * Senza JavaScript o con "riduci movimento" la linea è già piena e i passi accesi.
 */
export function LineaPassi({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useAnimazione(ref, ["ScrollTrigger"], (mm, { gsap, ScrollTrigger }) => {
      mm.add(CONDIZIONI, (ctx) => {
        const { movimento, mobile } = ctx.conditions as Record<string, boolean>;
        if (!movimento) return;
        const radice = ref.current!;
        const riempimento = radice.querySelector("[data-riempimento]");
        const passi = gsap.utils.toArray<HTMLElement>("[data-passo]", radice);
        radice.classList.add("in-attesa");

        gsap.fromTo(
          riempimento,
          mobile ? { scaleY: 0 } : { scaleX: 0 },
          {
            scaleX: 1,
            scaleY: 1,
            ease: "none",
            scrollTrigger: { trigger: radice, start: "top 75%", end: "bottom 55%", scrub: 0.6 },
          },
        );
        // una volta acceso, il passo resta acceso
        passi.forEach((p) =>
          ScrollTrigger.create({
            trigger: p,
            start: mobile ? "top 60%" : "top 70%",
            once: true,
            onEnter: () => p.classList.add("acceso"),
          }),
        );
        return () => {
          radice.classList.remove("in-attesa");
          passi.forEach((p) => p.classList.remove("acceso"));
        };
      });
  });

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
