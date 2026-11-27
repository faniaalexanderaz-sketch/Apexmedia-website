"use client";

import { useRef } from "react";
import { CONDIZIONI, useAnimazione } from "@/lib/gsap";

/**
 * Effetto "pulizia": una striscia luminosa passa sopra la foto quando entra nello schermo,
 * come un vetro appena passato col tergivetro. Va dentro un contenitore relative con overflow hidden.
 */
export function Passata({ ritardo = 0 }: { ritardo?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useAnimazione(ref, ["ScrollTrigger"], (mm, { gsap }) => {
      mm.add(CONDIZIONI, (ctx) => {
        const { movimento, mobile } = ctx.conditions as Record<string, boolean>;
        if (!movimento) return;
        gsap.fromTo(
          ref.current!.firstElementChild,
          { x: 0, xPercent: -110, skewX: -14 },
          {
            xPercent: 110,
            duration: mobile ? 0.9 : 1.3,
            delay: ritardo,
            ease: "power2.inOut",
            scrollTrigger: { trigger: ref.current!.parentElement, start: "top 85%", once: true },
          },
        );
      });
  });

  return (
    <span ref={ref} className="passata" aria-hidden>
      <span />
    </span>
  );
}
