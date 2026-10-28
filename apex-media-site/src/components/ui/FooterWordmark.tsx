"use client";

import { useRef } from "react";
import { deferSetup, gsap, useGSAP, MEDIA, EASE, enterAt } from "@/lib/gsap";

/** Wordmark APEX MEDIA a tutta larghezza che sale da sotto una maschera. */
export function FooterWordmark() {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    (_, contextSafe) =>
      deferSetup(contextSafe, () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MEDIA.desktop, () => {
        gsap.from(el.firstElementChild, { yPercent: 100, duration: 0.9, ease: EASE.reveal, scrollTrigger: enterAt(el, "top 95%") });
      });
      mm.add(MEDIA.mobile, () => {
        gsap.from(el.firstElementChild, { yPercent: 30, opacity: 0, duration: 0.7, ease: EASE.enter, scrollTrigger: enterAt(el, "top 95%") });
      });
      }, 420),
    { scope: ref },
  );
  return (
    <div ref={ref} className="overflow-hidden" data-footer-wordmark>
      <svg viewBox="0 0 1000 150" className="block w-full" aria-hidden="true">
        <text
          x="0"
          y="138"
          textLength="1000"
          lengthAdjust="spacingAndGlyphs"
          fontFamily="var(--font-space-grotesk), 'Space Grotesk', sans-serif"
          fontWeight="700"
          fontSize="168"
          letterSpacing="-5"
          fill="currentColor"
          className="text-ink"
        >
          APEX MEDIA
        </text>
      </svg>
    </div>
  );
}
