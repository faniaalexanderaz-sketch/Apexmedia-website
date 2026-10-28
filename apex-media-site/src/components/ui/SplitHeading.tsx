"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import {
  deferSetup,
  gsap,
  useGSAP,
  SplitText,
  MEDIA,
  EASE,
  enterAt,
} from "@/lib/gsap";

type Props = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  type?: "words" | "lines";
  stagger?: number;
};

/** Titolo che entra da una maschera, parola per parola o riga per riga. Senza JS resta un titolo normale. */
export function SplitHeading({
  as: Tag = "h2",
  children,
  className = "",
  type = "words",
  stagger = 0.04,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    (_, contextSafe) =>
      deferSetup(
        contextSafe,
        () => {
          const el = ref.current;
          if (!el) return;
          const mm = gsap.matchMedia();
          mm.add([MEDIA.desktop, MEDIA.mobile], () => {
            SplitText.create(el, {
              type,
              mask: type,
              autoSplit: true,
              onSplit: (self) =>
                gsap.from(type === "words" ? self.words : self.lines, {
                  yPercent: 100,
                  duration: 0.8,
                  ease: EASE.reveal,
                  stagger,
                  scrollTrigger: enterAt(el),
                }),
            });
          });
        },
        360,
      ),
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
