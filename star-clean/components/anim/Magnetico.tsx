"use client";

import { useRef } from "react";
import { useAnimazione } from "@/lib/gsap";

/** Leggero effetto magnetico sul pulsante, solo con mouse vero (niente su mobile né con "riduci movimento"). */
export function Magnetico({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useAnimazione(ref, [], (mm, { gsap }) => {
      mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
        const el = ref.current!;
        const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
        const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });
        const limita = gsap.utils.clamp(-8, 8);
        const muovi = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          xTo(limita((e.clientX - (r.left + r.width / 2)) * 0.2));
          yTo(limita((e.clientY - (r.top + r.height / 2)) * 0.3));
        };
        const lascia = () => {
          xTo(0);
          yTo(0);
        };
        el.addEventListener("pointermove", muovi);
        el.addEventListener("pointerleave", lascia);
        return () => {
          el.removeEventListener("pointermove", muovi);
          el.removeEventListener("pointerleave", lascia);
        };
      });
  });

  return (
    <span ref={ref} className={`inline-flex ${className}`}>
      {children}
    </span>
  );
}
