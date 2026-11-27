"use client";

import { useRef } from "react";
import { CONDIZIONI, useAnimazione } from "@/lib/gsap";

/** Numero che conta fino al valore quando entra nello schermo. Senza JavaScript mostra già il valore finale. */
export function Contatore({ valore }: { valore: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useAnimazione(ref, ["ScrollTrigger"], (mm, { gsap }) => {
      const el = ref.current!;
      mm.add(CONDIZIONI, (ctx) => {
        const { movimento, mobile } = ctx.conditions as Record<string, boolean>;
        if (!movimento) return;
        const o = { v: 0 };
        gsap.to(o, {
          v: valore,
          duration: mobile ? 1 : 1.4,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = String(Math.round(o.v));
          },
          scrollTrigger: { trigger: el, start: "top 92%", once: true },
          immediateRender: false,
        });
        return () => {
          el.textContent = String(valore);
        };
      });
  });

  // larghezza fissa in "ch": il numero che cambia non sposta il testo intorno
  return (
    <span ref={ref} className="inline-block text-right tabular-nums" style={{ minWidth: `${String(valore).length}ch` }}>
      {valore}
    </span>
  );
}
