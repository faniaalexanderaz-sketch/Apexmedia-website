"use client";

import { useRef } from "react";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Button } from "@/components/ui/Button";
import { TricolorStripe } from "@/components/ui/TricolorStripe";
import { plans, customPlanNote, formatPrice, brandPlan } from "@/data/pricing";
import { TricolorStripe as Stripe } from "@/components/ui/TricolorStripe";
import {
  deferSetup,
  gsap,
  useGSAP,
  MEDIA,
  EASE,
  enterAt,
  splitWordsIn,
  CLIP_HIDDEN_BOTTOM,
  CLIP_VISIBLE,
  SplitText,
} from "@/lib/gsap";

export function Pricing({ numero = "04" }: { numero?: string }) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    (_, contextSafe) =>
      deferSetup(
        contextSafe,
        () => {
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
          mm.add([MEDIA.desktop, MEDIA.mobile], () => {
            const splits: SplitText[] = [];
            const title = root.querySelector<HTMLElement>(
              "[data-pricing-title]",
            );
            if (title) splits.push(splitWordsIn(title));
            gsap.from("[data-pricing-head] p", {
              opacity: 0,
              y: 16,
              duration: 0.7,
              scrollTrigger: enterAt(root),
            });

            // Colonne: si rivelano dal basso in sequenza (Growth per ultima, più in alto), poi dentro ogni colonna
            // nome, prezzo, voci e bottone entrano uno dopo l’altro
            const tl = gsap.timeline({
              scrollTrigger: enterAt(grid, "top 78%"),
            });
            const order = [...others, ...(growth ? [growth] : [])];
            order.forEach((card, i) => {
              const at = i * 0.12;
              tl.fromTo(
                card,
                { clipPath: CLIP_HIDDEN_BOTTOM, y: card === growth ? 52 : 40 },
                {
                  clipPath: CLIP_VISIBLE,
                  y: 0,
                  duration: 0.9,
                  ease: EASE.reveal,
                  clearProps: "clipPath",
                },
                at,
              );
              const stripe = card.querySelector("[data-plan-stripe]");
              if (stripe)
                tl.from(
                  stripe,
                  {
                    scaleX: 0,
                    transformOrigin: "left center",
                    duration: 0.7,
                    ease: EASE.enter,
                  },
                  at + 0.3,
                );
              tl.from(
                card.querySelectorAll("[data-plan-fade]"),
                {
                  opacity: 0,
                  y: 12,
                  duration: 0.5,
                  ease: EASE.enter,
                  stagger: 0.05,
                },
                at + 0.25,
              );
              tl.from(
                card.querySelectorAll("[data-plan-line]"),
                {
                  scaleX: 0,
                  transformOrigin: "left center",
                  duration: 0.6,
                  ease: EASE.enter,
                  stagger: 0.05,
                },
                at + 0.3,
              );
              const badge = card.querySelector("[data-plan-badge]");
              if (badge)
                tl.from(
                  badge,
                  {
                    scale: 0,
                    rotation: -6,
                    transformOrigin: "center",
                    duration: 0.5,
                    ease: "back.out(2)",
                  },
                  at + 0.5,
                );
            });
            countPrices();

            // Brand da zero: riquadro largo che si rivela, titolo a parole, voci in due colonne
            const brand = root.querySelector<HTMLElement>("[data-brand-plan]");
            if (brand) {
              gsap.fromTo(
                brand,
                { clipPath: "inset(0% 100% 0% 0%)" },
                {
                  clipPath: "inset(0% 0% 0% 0%)",
                  duration: 0.9,
                  ease: EASE.reveal,
                  clearProps: "clipPath",
                  scrollTrigger: enterAt(brand, "top 82%"),
                },
              );
              const bt = brand.querySelector<HTMLElement>("h3");
              if (bt) splits.push(splitWordsIn(bt, brand, 0.04, "top 80%"));
              gsap.from(brand.querySelectorAll("[data-brand-fade]"), {
                opacity: 0,
                y: 12,
                duration: 0.6,
                stagger: 0.06,
                delay: 0.3,
                scrollTrigger: enterAt(brand, "top 82%"),
              });
            }
            return () => splits.forEach((sp) => sp.revert());
          });
        },
        300,
      ),
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      id="pacchetti"
      className="py-20 lg:py-28"
      data-section="pacchetti"
    >
      <Container>
        <div
          className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end"
          data-pricing-head
        >
          <div className="lg:col-span-6">
            <SectionLabel numero={numero} testo="Pacchetti" />
            <h2 className="h-display mt-6 text-[clamp(2rem,1rem+3.6vw,4.25rem)]">
              Pacchetti di social media marketing con prezzi chiari.
            </h2>
          </div>
          <p className="text-body text-ink/75 md:text-lg lg:col-span-4 lg:col-start-9 lg:pb-2">
            Gestione social, contenuti, campagne e sito: scegli da dove partire,
            lo adattiamo alla tua attività.
          </p>
        </div>

        <div
          className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3 md:items-end md:gap-0 lg:mt-20"
          data-plans
        >
          {plans.map((p) => (
            <article
              key={p.id}
              data-plan={p.id}
              data-tone={p.tone}
              className={`relative flex flex-col border ${
                p.tone === "ink"
                  ? "border-ink bg-ink text-paper"
                  : p.tone === "paper"
                    ? "border-ink/15 bg-paper"
                    : "border-ink/15 bg-surface"
              } ${p.highlight ? "md:z-10 md:-mx-px md:pb-4" : ""}`}
            >
              {p.highlight ? (
                <TricolorStripe />
              ) : (
                <div className="h-[3px] w-full" aria-hidden="true" />
              )}
              <div className="flex flex-1 flex-col p-6 md:p-7 lg:p-8">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-[26px] font-bold leading-none tracking-tightest">
                    {p.name}
                  </h3>
                  {p.badge ? (
                    <span
                      className={`label-mono px-2 py-1.5 ${p.tone === "ink" ? "bg-giallo text-ink" : "bg-ink text-paper"}`}
                    >
                      {p.badge}
                    </span>
                  ) : null}
                </div>
                <p className="mt-6 flex items-baseline gap-1.5" data-plan-fade>
                  <span
                    className="font-display text-[clamp(2.75rem,2rem+2vw,3.75rem)] font-bold leading-none tracking-tightest tabular-nums"
                    data-price={p.price}
                  >
                    {formatPrice(p.price)}
                  </span>
                  <span className="font-mono text-[12px] text-ink/60">
                    /mese
                  </span>
                </p>
                <ul
                  className={`mt-8 divide-y border-y ${p.tone === "ink" ? "divide-paper/15 border-paper/15" : "divide-ink/10 border-ink/10"}`}
                >
                  {p.features.map((f) => (
                    <li
                      key={f}
                      className="relative py-3 text-[15px] leading-snug"
                      data-plan-fade
                    >
                      {f}
                      <span
                        data-plan-line
                        aria-hidden="true"
                        className={`absolute inset-x-0 bottom-0 h-px ${p.tone === "ink" ? "bg-paper/15" : "bg-ink/10"}`}
                      />
                    </li>
                  ))}
                </ul>
                <div className="mt-8 pt-2" data-plan-fade>
                  <Button
                    href="#contatti"
                    variant={
                      p.highlight || p.tone === "ink" ? "primary" : "secondary"
                    }
                    className="w-full"
                    data-preselect={p.formValue}
                    data-track="click_pacchetto"
                    data-track-pacchetto={p.name}
                  >
                    {p.cta}
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <article
          data-brand-plan
          className="relative mt-8 grid grid-cols-1 gap-8 border border-ink/15 bg-surface p-6 md:grid-cols-12 md:p-8 lg:mt-10 lg:p-10"
        >
          <Stripe className="absolute inset-x-0 top-0" />
          <div className="md:col-span-5">
            <p className="label-mono text-blu-deep" data-brand-fade>
              {brandPlan.kicker} — {brandPlan.name}
            </p>
            <h3 className="h-display mt-4 text-[clamp(1.6rem,1rem+2vw,2.6rem)]">
              {brandPlan.title}
            </h3>
            <p
              className="text-body mt-4 text-[16px] text-ink/75"
              data-brand-fade
            >
              {brandPlan.text}
            </p>
            <div className="mt-6" data-brand-fade>
              <Button
                href="#contatti"
                data-preselect={brandPlan.formValue}
                data-track="click_pacchetto"
                data-track-pacchetto="Brand da zero"
              >
                {brandPlan.cta}
              </Button>
            </div>
          </div>
          <ul
            className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 md:col-span-7 md:col-start-6"
            aria-label="Cosa comprende"
          >
            {brandPlan.features.map((f) => (
              <li
                key={f}
                className="relative py-3 pl-5 text-[15px] leading-snug"
                data-brand-fade
              >
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-[16px] size-[7px] bg-viola"
                />
                {f}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-px bg-ink/10"
                />
              </li>
            ))}
          </ul>
        </article>

        <p className="mt-10 text-[17px] text-ink/75">
          {customPlanNote}{" "}
          <a
            href="#contatti"
            className="u-link font-semibold text-ink hover:text-viola"
            data-preselect="Non lo so ancora"
            data-track="click_pacchetto"
            data-track-pacchetto="Su misura"
          >
            Parliamone
          </a>
        </p>
      </Container>
    </section>
  );
}
