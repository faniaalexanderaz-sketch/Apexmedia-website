"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { site } from "@/data/site";

/** Barra fissa in basso su mobile: appare dopo l’hero, sparisce su contatti e footer. */
export function MobileCtaBar() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hero = document.querySelector("[data-hero]");
    const hide = [document.getElementById("contatti"), document.querySelector("[data-footer]")].filter(
      Boolean,
    ) as Element[];
    if (!hero) return;
    const state = { heroVisible: true, hiddenZone: 0 };
    const update = () => setShow(!state.heroVisible && state.hiddenZone === 0);
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.target === hero) state.heroVisible = en.isIntersecting;
          else state.hiddenZone += en.isIntersecting ? 1 : -1;
        }
        state.hiddenZone = Math.max(0, state.hiddenZone);
        update();
      },
      { threshold: 0.05 },
    );
    io.observe(hero);
    hide.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div
      data-mobile-cta
      data-show={show ? "true" : "false"}
      inert={!show}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-paper px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 lg:hidden"
    >
      <div className="flex items-center gap-3">
        <Button href="#contatti" className="flex-1">
          Prenota la call
        </Button>
        <a
          href={site.whatsappUrl}
          aria-label="Scrivici su WhatsApp"
          className="inline-flex size-12 shrink-0 items-center justify-center rounded-sm border border-ink text-ink"
        >
          <WhatsAppIcon size={22} />
        </a>
      </div>
    </div>
  );
}
