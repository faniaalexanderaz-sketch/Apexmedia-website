"use client";

import { useRef, type ReactNode } from "react";
import { deferSetup, gsap, useGSAP, MEDIA, enterAt } from "@/lib/gsap";

type Props = { children: ReactNode; className?: string; stagger?: boolean; start?: string };

/** Ingresso semplice (dissolvenza + 16px) quando entra in vista. Con `stagger` anima i figli uno dopo l’altro. */
export function Reveal({ children, className = "", stagger = false, start = "top 85%" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    (_, contextSafe) =>
      deferSetup(contextSafe, () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add([MEDIA.desktop, MEDIA.mobile], () => {
        const targets = stagger ? Array.from(el.children) : el;
        gsap.from(targets, { opacity: 0, y: 16, duration: 0.7, stagger: stagger ? 0.07 : 0, scrollTrigger: enterAt(el, start) });
      });
      }, 380),
    { scope: ref },
  );
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
