"use client";

import { useRef } from "react";
import { CONDIZIONI, useAnimazione } from "@/lib/gsap";

/** Gli elementi [data-comparsa] entrano uno dopo l'altro quando arrivano nello schermo. */
export function Comparsa({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useAnimazione(ref, ["ScrollTrigger"], (mm, { gsap, ScrollTrigger }) => {
      mm.add(CONDIZIONI, (ctx) => {
        const { movimento, mobile } = ctx.conditions as Record<string, boolean>;
        if (!movimento) return;
        const elementi = gsap.utils.toArray<HTMLElement>("[data-comparsa]", ref.current);
        // solo quelli ancora sotto lo schermo: ciò che si vede già non deve sparire e ricomparire
        const sotto = elementi.filter((e) => e.getBoundingClientRect().top > window.innerHeight);
        gsap.set(sotto, { autoAlpha: 0, y: mobile ? 24 : 40 });
        ScrollTrigger.batch(sotto, {
          start: "top 90%",
          once: true,
          onEnter: (lotto) =>
            gsap.to(lotto, {
              autoAlpha: 1,
              y: 0,
              duration: mobile ? 0.5 : 0.8,
              stagger: mobile ? 0.06 : 0.1,
              ease: "power3.out",
              overwrite: true,
              clearProps: "transform",
            }),
        });
      });
  });

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
