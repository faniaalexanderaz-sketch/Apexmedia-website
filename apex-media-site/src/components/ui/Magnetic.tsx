"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/** Solo con mouse vero: niente touch, niente reduced-motion. */
export const FINE_POINTER =
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

/** Il contenuto si sposta appena verso il cursore quando ci passi sopra, e torna al centro quando esci. */
export function Magnetic({
  children,
  strength = 0.32,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const area = ref.current;
      const inner = area?.firstElementChild as HTMLElement | null;
      if (!area || !inner) return;
      const mm = gsap.matchMedia();
      mm.add(FINE_POINTER, () => {
        const xTo = gsap.quickTo(inner, "x", { duration: 0.5, ease: "power3" });
        const yTo = gsap.quickTo(inner, "y", { duration: 0.5, ease: "power3" });
        const onMove = (e: MouseEvent) => {
          const r = area.getBoundingClientRect();
          xTo((e.clientX - (r.left + r.width / 2)) * strength);
          yTo((e.clientY - (r.top + r.height / 2)) * strength);
        };
        const onLeave = () => {
          xTo(0);
          yTo(0);
        };
        area.addEventListener("mousemove", onMove);
        area.addEventListener("mouseleave", onLeave);
        return () => {
          area.removeEventListener("mousemove", onMove);
          area.removeEventListener("mouseleave", onLeave);
        };
      });
    },
    { scope: ref },
  );

  return (
    <span ref={ref} className={`inline-block ${className}`} data-magnetic>
      <span className="inline-block will-change-transform">{children}</span>
    </span>
  );
}
