"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { FINE_POINTER } from "@/components/ui/Magnetic";

const INTERACTIVE = "a, button, summary, label, [role='button']";
const FIELDS = "input, select, textarea";

/**
 * Cursore discreto: un punto che segue il mouse e si allarga su link e bottoni.
 * Solo con mouse vero: su touch e con reduced-motion non esiste proprio.
 */
export function CustomCursor() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      const dot = el?.firstElementChild as HTMLElement | null;
      if (!el || !dot) return;
      const mm = gsap.matchMedia();
      mm.add(FINE_POINTER, () => {
        gsap.set(el, { xPercent: -50, yPercent: -50, autoAlpha: 0 });
        const xTo = gsap.quickTo(el, "x", { duration: 0.32, ease: "power3" });
        const yTo = gsap.quickTo(el, "y", { duration: 0.32, ease: "power3" });
        let shown = false;
        let big = false;
        const onMove = (e: PointerEvent) => {
          if (e.pointerType !== "mouse") return;
          if (!shown) {
            shown = true;
            gsap.set(el, { x: e.clientX, y: e.clientY });
            gsap.to(el, { autoAlpha: 1, duration: 0.3 });
          }
          xTo(e.clientX);
          yTo(e.clientY);
        };
        const onOver = (e: PointerEvent) => {
          const t = e.target as Element | null;
          const field = Boolean(t?.closest?.(FIELDS));
          const next = !field && Boolean(t?.closest?.(INTERACTIVE));
          if (next !== big) {
            big = next;
            gsap.to(dot, {
              scale: big ? 4.2 : 1,
              duration: 0.4,
              ease: "power3.out",
              overwrite: true,
            });
          }
          // Sui campi del form resta il cursore di testo del browser
          gsap.to(dot, { opacity: field ? 0 : 1, duration: 0.2 });
        };
        const onOut = () => {
          shown = false;
          gsap.to(el, { autoAlpha: 0, duration: 0.25 });
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        document.addEventListener("pointerover", onOver, { passive: true });
        document.documentElement.addEventListener("mouseleave", onOut);
        return () => {
          window.removeEventListener("pointermove", onMove);
          document.removeEventListener("pointerover", onOver);
          document.documentElement.removeEventListener("mouseleave", onOut);
        };
      });
    },
    { scope: ref },
  );

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-cursor
      className="pointer-events-none invisible fixed left-0 top-0 z-[100] mix-blend-difference"
    >
      <span className="block size-3 rounded-full bg-surface will-change-transform" />
    </div>
  );
}
