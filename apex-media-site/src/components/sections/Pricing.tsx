"use client";

import { useRef } from "react";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Button } from "@/components/ui/Button";
import { TricolorStripe } from "@/components/ui/TricolorStripe";
import { plans, customPlanNote, formatPrice } from "@/data/pricing";
import { deferSetup, gsap, useGSAP, MEDIA, EASE, enterAt } from "@/lib/gsap";

export function Pricing() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    (_, contextSafe) =>
      deferSetup(contextSafe, () => {
      const root = ref.current;
      if (!root) return;
      const cards = gsap.utils.toArray<HTMLElement>("[data-plan]", root);
      const growth = cards.find((c) => c.dataset.plan === "growth");
      const others = cards.filter((c) => c !== growth);
      const prices = gsap.utils.toArray<HTMLElement>("[data-price]", root);
      const grid = root.querySelector("[data-plans]") ?? root;

      const countPrices = () =>
        prices.forEach((el) => {
          const target = Number(el.dataset.price);
          const obj = { v: 0 };
          gsap.to(obj, {
            v: target,
            duration: 0.8,
            ease: "power2.out",
            onUpdate: () => {
              el.textContent = formatPrice(Math.round(obj.v));
            },
            scrollTrigger: enterAt(grid, "top 75%"),
          });
        });

      const mm = gsap.matchMedia();
      mm.add(MEDIA.desktop, () => {
        gsap.from("[data-pricing-head] > *", { opacity: 0, y: 16, duration: 0.7, stagger: 0.08, scrollTrigger: enterAt(root) });
        const tl = gsap.timeline({ scrollTrigger: enterAt(grid, "top 75%") });
        tl.from(others, { y: 40, opacity: 0, duration: 0.8, ease: EASE.enter, stagger: 0.1 }, 0);
        if (growth) tl.from(growth, { y: 52, opacity: 0, duration: 0.9, ease: EASE.enter }, 0.2);
        countPrices();
      });
      mm.add(MEDIA.mobile, () => {
        gsap.from("[data-pricing-head] > *", { opacity: 0, y: 12, duration: 0.6, stagger: 0.08, scrollTrigger: enterAt(root) });
        cards.forEach((c) => gsap.from(c, { y: 20, opacity: 0, duration: 0.6, scrollTrigger: enterAt(c, "top 88%") }));
        countPrices();
      });
      }, 300),
    { scope: ref },
  );

  return (
    <section ref={ref} id="pacchetti" className="py-20 lg:py-28" data-section="pacchetti">
      <Container>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end" data-pricing-head>
          <div className="lg:col-span-6">
            <SectionLabel numero="04" testo="Pacchetti" />
            <h2 className="h-display mt-6 text-[clamp(2rem,1rem+3.6vw,4.25rem)]">Prezzi chiari.</h2>
          </div>
          <p className="text-body text-ink/75 md:text-lg lg:col-span-4 lg:col-start-9 lg:pb-2">
            Scegli da dove partire. Lo adattiamo alla tua attività.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3 md:items-end md:gap-0 lg:mt-20" data-plans>
          {plans.map((p) => (
            <article
              key={p.id}
              data-plan={p.id}
              className={`relative flex flex-col border border-ink/15 bg-surface ${p.highlight ? "md:z-10 md:-mx-px md:pb-4" : ""}`}
            >
              {p.highlight ? <TricolorStripe /> : <div className="h-[3px] w-full" aria-hidden="true" />}
              <div className="flex flex-1 flex-col p-6 md:p-7 lg:p-8">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-[26px] font-bold leading-none tracking-tightest">{p.name}</h3>
                  {p.badge ? <span className="label-mono bg-ink px-2 py-1.5 text-paper">{p.badge}</span> : null}
                </div>
                <p className="mt-6 flex items-baseline gap-1.5">
                  <span
                    className="font-display text-[clamp(2.75rem,2rem+2vw,3.75rem)] font-bold leading-none tracking-tightest tabular-nums"
                    data-price={p.price}
                  >
                    {formatPrice(p.price)}
                  </span>
                  <span className="font-mono text-[12px] text-ink/60">/mese</span>
                </p>
                <ul className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
                  {p.features.map((f) => (
                    <li key={f} className="py-3 text-[15px] leading-snug">
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 pt-2">
                  <Button href="#contatti" variant={p.highlight ? "primary" : "secondary"} className="w-full" data-preselect={p.formValue} data-track="click_pacchetto" data-track-pacchetto={p.name}>
                    {p.cta}
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-10 text-[17px] text-ink/75">
          {customPlanNote}{" "}
          <a href="#contatti" className="u-link font-semibold text-ink hover:text-viola" data-preselect="Non lo so ancora" data-track="click_pacchetto" data-track-pacchetto="Su misura">
            Parliamone
          </a>
        </p>
      </Container>
    </section>
  );
}
