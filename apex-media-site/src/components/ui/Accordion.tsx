"use client";

import { useRef, type MouseEvent, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { PlusIcon } from "./Icons";

type Props = {
  summary: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  summaryClassName?: string;
};

/**
 * <details> nativo (funziona senza JS) con apertura animata in altezza da GSAP.
 * Con prefers-reduced-motion si usa il comportamento nativo, istantaneo.
 */
export function AccordionItem({ summary, children, defaultOpen = false, className = "", summaryClassName = "" }: Props) {
  const ref = useRef<HTMLDetailsElement>(null);
  const body = useRef<HTMLDivElement>(null);

  const onClick = (e: MouseEvent<HTMLElement>) => {
    const d = ref.current;
    const c = body.current;
    if (!d || !c) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    e.preventDefault();
    gsap.killTweensOf(c);
    if (d.open) {
      gsap.to(c, {
        height: 0,
        opacity: 0,
        duration: 0.4,
        ease: "power3.out",
        onComplete: () => {
          d.open = false;
          gsap.set(c, { clearProps: "height,opacity" });
        },
      });
    } else {
      d.open = true;
      gsap.from(c, { height: 0, opacity: 0, duration: 0.5, ease: "power3.out", clearProps: "height,opacity" });
    }
  };

  return (
    <details ref={ref} open={defaultOpen} className={`group ${className}`}>
      <summary onClick={onClick} className={`flex items-start justify-between gap-6 ${summaryClassName}`}>
        {summary}
        <PlusIcon className="plus-icon mt-1 shrink-0" />
      </summary>
      <div ref={body} className="overflow-hidden">
        {children}
      </div>
    </details>
  );
}
