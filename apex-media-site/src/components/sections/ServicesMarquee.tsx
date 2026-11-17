"use client";

import { useRef } from "react";
import { deferSetup, gsap, useGSAP, ScrollTrigger, MEDIA } from "@/lib/gsap";

const items = [
  "Siti web",
  "Google Ads",
  "Meta Ads",
  "Contenuti video",
  "Lead generation",
];

/** Quante volte ripetere l’elenco in ognuna delle due metà: deve riempire anche gli schermi larghi. */
const REPEAT = 2;

function Half({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul
      className="flex shrink-0 items-center"
      aria-hidden={hidden || undefined}
      role="list"
    >
      {Array.from({ length: REPEAT }).flatMap((_, r) =>
        items.map((label) => (
          <li
            key={`${r}-${label}`}
            aria-hidden={r > 0 || undefined}
            className="flex items-center whitespace-nowrap font-display text-[clamp(2.25rem,1rem+5.2vw,6rem)] font-bold leading-none tracking-tightest text-ink"
          >
            {label}
            <span
              aria-hidden="true"
              className="mx-[0.45em] block h-[2px] w-[0.7em] bg-ink/25"
            />
          </li>
        )),
      )}
    </ul>
  );
}

/** Fascia dei servizi che scorre all’infinito e accelera un po’ quando scorri la pagina. */
export function ServicesMarquee() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    (_, contextSafe) =>
      deferSetup(
        contextSafe,
        () => {
          const root = ref.current;
          const track = root?.querySelector<HTMLElement>("[data-marquee-track]");
          if (!root || !track) return;
          const mm = gsap.matchMedia();
          mm.add(
            { desktop: MEDIA.desktop, mobile: MEDIA.mobile },
            (ctx) => {
              const desktop = Boolean(ctx.conditions?.desktop);
              const loop = gsap.to(track, {
                xPercent: -50,
                ease: "none",
                duration: desktop ? 34 : 26,
                repeat: -1,
                paused: true,
              });
              const calm = () =>
                gsap.to(loop, { timeScale: 1, duration: 1.1, overwrite: true });
              ScrollTrigger.create({
                trigger: root,
                start: "top bottom",
                end: "bottom top",
                onToggle: (self) => (self.isActive ? loop.play() : loop.pause()),
                onUpdate: (self) => {
                  // Più scorri veloce, più la fascia accelera (fino a 5×), poi torna alla sua andatura
                  const boost = gsap.utils.clamp(
                    0,
                    desktop ? 4 : 2.5,
                    Math.abs(self.getVelocity()) / 420,
                  );
                  gsap.to(loop, {
                    timeScale: 1 + boost,
                    duration: 0.25,
                    overwrite: true,
                    onComplete: calm,
                  });
                },
              });
            },
          );
        },
        70,
      ),
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      aria-label="Cosa facciamo"
      className="overflow-hidden py-10 lg:py-16"
      data-section="servizi-fascia"
    >
      <div
        data-marquee-track
        className="flex w-max will-change-transform"
      >
        <Half />
        <Half hidden />
      </div>
    </section>
  );
}
