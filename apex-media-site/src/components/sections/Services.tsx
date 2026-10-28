"use client";

import { useRef, useState } from "react";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { AccordionItem } from "@/components/ui/Accordion";
import { services } from "@/data/services";
import { useMediaQuery } from "@/lib/useMediaQuery";
import {
  deferSetup,
  gsap,
  useGSAP,
  ScrollTrigger,
  MEDIA,
  EASE,
  enterAt,
} from "@/lib/gsap";

export function Services() {
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const panelsRef = useRef<HTMLDivElement>(null);
  // Una sola versione per viewport: il CSS nasconde l’altra e, dopo l’idratazione, viene tolta anche dal DOM accessibile
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // Desktop: il servizio al centro dello schermo diventa attivo mentre si scorre
  useGSAP(
    (_, contextSafe) =>
      deferSetup(
        contextSafe,
        () => {
          const root = ref.current;
          if (!root) return;
          const mm = gsap.matchMedia();
          mm.add(MEDIA.desktop, () => {
            gsap.from("[data-services-head] > *", {
              opacity: 0,
              y: 16,
              duration: 0.7,
              stagger: 0.08,
              scrollTrigger: enterAt(root),
            });
            gsap.from("[data-service-item]", {
              opacity: 0,
              y: 14,
              duration: 0.6,
              stagger: 0.07,
              scrollTrigger: enterAt(root, "top 70%"),
            });
            gsap.utils
              .toArray<HTMLElement>("[data-service-item]", root)
              .forEach((li, i) => {
                ScrollTrigger.create({
                  trigger: li,
                  start: "top 55%",
                  end: "bottom 45%",
                  onToggle: (self) => self.isActive && setActive(i),
                });
              });
          });
          mm.add(MEDIA.mobile, () => {
            gsap.from("[data-services-head] > *", {
              opacity: 0,
              y: 16,
              duration: 0.7,
              stagger: 0.08,
              scrollTrigger: enterAt(root),
            });
            gsap.from("[data-services-mobile] > *", {
              opacity: 0,
              y: 14,
              duration: 0.6,
              stagger: 0.07,
              scrollTrigger: enterAt(root, "top 75%"),
            });
          });
        },
        180,
      ),
    { scope: ref },
  );

  // Il pannello cambia contenuto con un clip-path verticale
  useGSAP(
    () => {
      const panel = panelsRef.current?.querySelector<HTMLElement>(
        `[data-service-panel="${services[active].id}"]`,
      );
      if (!panel || !window.matchMedia(MEDIA.desktop).matches) return;
      gsap.fromTo(
        panel,
        { clipPath: "inset(0% 0% 100% 0%)", y: -6 },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          y: 0,
          duration: 0.55,
          ease: EASE.enter,
          clearProps: "clipPath,y",
        },
      );
    },
    { dependencies: [active], scope: panelsRef },
  );

  return (
    <section
      ref={ref}
      id="servizi"
      className="border-t border-ink/10 py-20 lg:py-28"
      data-section="servizi"
    >
      <Container>
        <div data-services-head>
          <SectionLabel numero="02" testo="Servizi" />
          <h2 className="h-display mt-6 text-[clamp(2rem,1rem+3.6vw,4.25rem)]">
            Cosa facciamo.
          </h2>
        </div>

        {/* Desktop: nomi a sinistra, pannello a destra */}
        <div
          className="mt-12 hidden grid-cols-12 gap-8 lg:grid"
          data-services-desktop
          hidden={isDesktop === false}
        >
          <ul className="col-span-6 border-t border-ink/10" role="list">
            {services.map((s, i) => {
              const isActive = i === active;
              return (
                <li
                  key={s.id}
                  className="border-b border-ink/10"
                  data-service-item
                >
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onClick={() => setActive(i)}
                    aria-pressed={isActive}
                    aria-controls={`servizio-${s.id}`}
                    className={`flex w-full items-baseline gap-6 py-6 text-left font-display text-[clamp(2.25rem,1rem+2.6vw,3.75rem)] font-bold leading-none tracking-tightest transition-colors duration-300 ${isActive ? "text-ink" : "text-ink/30 hover:text-ink/60"}`}
                  >
                    <span
                      className={`font-mono text-[12px] tracking-label transition-colors duration-300 ${isActive ? "text-blu-deep" : "text-ink/40"}`}
                    >
                      0{i + 1}
                    </span>
                    {s.name}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="col-span-5 col-start-8">
            <div
              ref={panelsRef}
              className="sticky top-[calc(var(--nav-h)+32px)] border border-ink/15 bg-surface p-8"
            >
              {services.map((s, i) => (
                <div
                  key={s.id}
                  id={`servizio-${s.id}`}
                  hidden={i !== active}
                  data-service-panel={s.id}
                >
                  <p className="label-mono text-ink/60">
                    0{i + 1} — {s.name}
                  </p>
                  <p className="mt-5 text-[19px] leading-snug text-ink">
                    {s.description}
                  </p>
                  <p className="label-mono mt-8 text-ink/60">Include</p>
                  <ul className="mt-2 divide-y divide-ink/10 border-y border-ink/10">
                    {s.includes.map((inc) => (
                      <li key={inc} className="py-3 text-[16px]">
                        {inc}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: fisarmonica nativa con apertura animata, funziona anche senza JS */}
        <div
          className="mt-10 border-t border-ink/10 lg:hidden"
          data-services-mobile
          hidden={isDesktop === true}
        >
          {services.map((s, i) => (
            <AccordionItem
              key={s.id}
              defaultOpen={i === 0}
              className="border-b border-ink/10"
              summaryClassName="min-h-14 items-center py-4"
              summary={
                <span className="flex items-baseline gap-4 font-display text-[28px] font-bold leading-none tracking-tightest">
                  <span className="font-mono text-[11px] tracking-label text-blu-deep">
                    0{i + 1}
                  </span>
                  {s.name}
                </span>
              }
            >
              <div className="pb-6 pl-9">
                <p className="text-[17px] leading-relaxed text-ink/85">
                  {s.description}
                </p>
                <p className="label-mono mt-5 text-ink/60">Include</p>
                <ul className="mt-2 divide-y divide-ink/10 border-y border-ink/10">
                  {s.includes.map((inc) => (
                    <li key={inc} className="py-2.5 text-[15px]">
                      {inc}
                    </li>
                  ))}
                </ul>
              </div>
            </AccordionItem>
          ))}
        </div>
      </Container>
    </section>
  );
}
