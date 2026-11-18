"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Button } from "@/components/ui/Button";
import { SceneSlot } from "@/components/three/SceneSlot";
import { createDriver } from "@/components/three/driver";
import { stackProgress } from "@/components/three/PlanStacks";
import { plans, customPlanNote, formatPrice, brandPlan } from "@/data/pricing";
import { playWhenSeen } from "@/lib/inView";
import {
  deferSetup,
  gsap,
  useGSAP,
  ScrollTrigger,
  enterAt,
  splitLinesIn,
} from "@/lib/gsap";

const PlanStacks = dynamic(() => import("@/components/three/PlanStacks"), {
  ssr: false,
});

const DESKTOP = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";
const MOBILE = "(max-width: 1023px) and (prefers-reduced-motion: no-preference)";
const REDUCE = "(prefers-reduced-motion: reduce)";
const MOBILE_S = 2.4;

/** Valore condiviso con la scena 3D. Parte completo: se l’animazione non parte, le pile sono già piene. */
const driver = createDriver({ plans: 1 });

/** La voce "N contenuti al mese" ha già il suo posto grande: nell’elenco non si ripete */
const isContents = (f: string) => /contenuti al mese/i.test(f);

/** Pacchetti: tre pile 3D di contenuti del mese, con prezzo e contenuti che contano mentre crescono. */
export function Pricing({ numero = "04" }: { numero?: string }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    driver.light = window.matchMedia("(max-width: 1023px)").matches;
  }, []);

  useGSAP(
    (_, contextSafe) =>
      deferSetup(
        contextSafe,
        () => {
          const root = ref.current;
          if (!root) return;
          const q = gsap.utils.selector(root);
          const v = driver.values;
          const stage = q("[data-plans-stage]")[0] as HTMLElement;
          const scene = q("[data-plans-scene]")[0] as HTMLElement;
          const prices = q("[data-price]") as HTMLElement[];
          const counts = q("[data-contents]") as HTMLElement[];

          /** Prezzi e contenuti seguono i tasselli già atterrati della loro pila */
          const write = () => {
            plans.forEach((p, s) => {
              const f = Math.min(1, stackProgress(v.plans, s) / 0.98);
              if (prices[s]) prices[s].textContent = formatPrice(Math.round((p.price * f) / 10) * 10);
              if (counts[s]) counts[s].textContent = String(Math.round(p.contents * f));
            });
            driver.notify();
          };

          const mm = gsap.matchMedia();
          mm.add({ desktop: DESKTOP, mobile: MOBILE, reduce: REDUCE }, (ctx) => {
            const { desktop, reduce } = ctx.conditions ?? {};
            if (reduce) {
              v.plans = 1;
              write();
              return;
            }
            const cleanups: (() => void)[] = [];
            const title = q("h2")[0];
            const split = title ? splitLinesIn(title) : null;
            gsap.from(q("[data-pricing-head] p"), {
              opacity: 0,
              y: 16,
              duration: 0.7,
              delay: 0.2,
              scrollTrigger: enterAt(root),
            });

            const tl = gsap.timeline({
              paused: true,
              defaults: { ease: "none" },
              onUpdate: write,
            });
            tl.fromTo(v, { plans: 0 }, { plans: 1, duration: 1, immediateRender: false });

            if (desktop) {
              // I tasselli cadono mentre la sezione sale nello schermo
              v.plans = 0;
              write();
              ScrollTrigger.create({
                animation: tl,
                trigger: scene,
                start: "top 90%",
                end: "bottom 72%",
                scrub: 0.8,
              });
            } else {
              cleanups.push(
                playWhenSeen(tl, stage, {
                  seconds: MOBILE_S,
                  part: 0.55,
                  onArm: () => {
                    v.plans = 0;
                    write();
                  },
                  onSkip: write,
                }),
              );
            }

            // Brand da zero: titolo a righe, voci una dopo l’altra
            const brand = q("[data-brand-plan]")[0];
            const bt = brand?.querySelector("h3");
            const bsplit = bt ? splitLinesIn(bt, brand) : null;
            if (brand)
              gsap.from(brand.querySelectorAll("[data-brand-fade]"), {
                opacity: 0,
                y: 14,
                duration: 0.6,
                stagger: 0.05,
                delay: 0.2,
                scrollTrigger: enterAt(brand, "top 82%"),
              });

            return () => {
              cleanups.forEach((fn) => fn());
              split?.revert();
              bsplit?.revert();
              v.plans = 1;
              write();
            };
          });
        },
        200,
      ),
    { scope: ref },
  );

  return (
    <section ref={ref} id="pacchetti" className="py-20 lg:py-28" data-section="pacchetti">
      <Container>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end" data-pricing-head>
          <div className="lg:col-span-7">
            <SectionLabel numero={numero} testo="Pacchetti" />
            <h2 className="h-display mt-6 text-[clamp(2.25rem,1rem+4.4vw,5.25rem)]">
              Gestione social: pacchetti e prezzi chiari.
            </h2>
          </div>
          <p className="text-body text-ink/75 md:text-lg lg:col-span-4 lg:col-start-9 lg:pb-2">
            Ogni tassello è un contenuto che ricevi ogni mese. Scegli quanto
            vuoi crescere, lo adattiamo alla tua attività.
          </p>
        </div>

        <div className="mt-10 lg:mt-16" data-plans-stage>
          {/* Le tre pile: su tablet e desktop stanno sopra le tre colonne di testo */}
          <div
            className="-mx-5 h-[250px] sm:-mx-8 sm:h-[300px] md:mx-0 md:h-[340px] lg:h-[400px]"
            data-plans-scene
          >
            <SceneSlot
              className="h-full w-full"
              fallback={{ src: "/pacchetti/pile.webp", width: 1613, height: 480 }}
              alt="Tre pile di tasselli: 8 contenuti al mese per Starter, 14 per Growth, 18 per Domination"
            >
              {(onReady) => (
                <PlanStacks
                  driver={driver}
                  plans={plans.map((p) => ({ id: p.id, contents: p.contents, highlight: p.highlight }))}
                  onReady={onReady}
                />
              )}
            </SceneSlot>
          </div>

          {/* Su telefono le colonne sono una sotto l’altra: il nome va sotto la sua pila */}
          <ul className="-mx-5 grid grid-cols-3 text-center sm:-mx-8 md:hidden" aria-hidden="true">
            {plans.map((p) => (
              <li key={p.id}>
                <p className="font-display text-[17px] font-bold leading-tight tracking-tight">{p.name}</p>
                <p className="text-[14px] text-ink/60">{p.contents} contenuti</p>
              </li>
            ))}
          </ul>

          <div className="mt-12 grid grid-cols-1 gap-y-14 md:mt-4 md:grid-cols-3 md:gap-x-8" data-plans>
            {plans.map((p) => (
              <article key={p.id} data-plan={p.id} className="flex flex-col md:items-center md:text-center">
                <div className="flex items-baseline gap-3">
                  <h3 className="font-display text-[28px] font-bold leading-none tracking-tightest">
                    {p.name}
                  </h3>
                  {p.badge ? (
                    <span className="hl text-[14px] font-semibold leading-none">{p.badge}</span>
                  ) : null}
                </div>
                <p className="mt-5 flex items-baseline gap-2">
                  <span
                    className="font-display text-[clamp(3.25rem,2rem+3vw,5rem)] font-bold leading-none tracking-tightest tabular-nums"
                    data-price
                  >
                    {formatPrice(p.price)}
                  </span>
                  <span className="text-[16px] text-ink/60">al mese</span>
                </p>
                <p className="mt-3 text-[17px] text-ink/80">
                  <strong className="font-display text-[22px] font-bold tabular-nums tracking-tight text-ink" data-contents>
                    {p.contents}
                  </strong>{" "}
                  contenuti al mese
                </p>
                <ul className="mt-7 w-full space-y-2.5 text-[16px] leading-snug text-ink/75">
                  {p.features.filter((f) => !isContents(f)).map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <div className="mt-8 w-full">
                  <Button
                    href="#contatti"
                    variant={p.highlight ? "primary" : "secondary"}
                    className="w-full md:w-auto md:min-w-[220px]"
                    data-preselect={p.formValue}
                    data-track="click_pacchetto"
                    data-track-pacchetto={p.name}
                  >
                    {p.cta}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Brand da zero: un blocco tipografico a tutta larghezza, nessuna card */}
        <article
          data-brand-plan
          className="mt-24 grid grid-cols-1 gap-10 border-t border-ink/15 pt-12 lg:mt-32 lg:grid-cols-12 lg:gap-8 lg:pt-16"
        >
          <div className="lg:col-span-6">
            <p className="text-[16px] font-semibold text-ink/60" data-brand-fade>
              {brandPlan.kicker} · {brandPlan.name}
            </p>
            <h3 className="h-display mt-4 text-[clamp(1.9rem,1rem+2.6vw,3.25rem)]">
              {brandPlan.title}
            </h3>
            <p className="text-body mt-5 text-[17px] text-ink/75" data-brand-fade>
              {brandPlan.text}
            </p>
            <div className="mt-8" data-brand-fade>
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
            className="grid grid-cols-1 gap-x-10 self-end sm:grid-cols-2 lg:col-span-5 lg:col-start-8"
            aria-label="Cosa comprende"
          >
            {brandPlan.features.map((f) => (
              <li
                key={f}
                className="border-b border-ink/10 py-3.5 text-[16px] leading-snug"
                data-brand-fade
              >
                {f}
              </li>
            ))}
          </ul>
        </article>

        <p className="mt-12 text-[17px] text-ink/75">
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
