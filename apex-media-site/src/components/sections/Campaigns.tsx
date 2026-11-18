"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Container } from "@/components/ui/Container";
import { SceneSlot } from "@/components/three/SceneSlot";
import { createDriver } from "@/components/three/driver";
import { campaign } from "@/data/campaign";
import { playWhenSeen } from "@/lib/inView";
import {
  deferSetup,
  gsap,
  useGSAP,
  ScrollTrigger,
  enterAt,
  splitLinesIn,
  refreshSoon,
} from "@/lib/gsap";

/* Le due scene arrivano solo nel browser e solo quando servono (vedi SceneSlot) */
const CampaignChart = dynamic(() => import("@/components/three/CampaignChart"), {
  ssr: false,
});
const ChannelStack = dynamic(() => import("@/components/three/ChannelStack"), {
  ssr: false,
});

const DESKTOP = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";
const MOBILE = "(max-width: 1023px) and (prefers-reduced-motion: no-preference)";
const REDUCE = "(prefers-reduced-motion: reduce)";

/** Durate su mobile: l’animazione parte quando la scena entra in vista e finisce da sola */
const MOBILE_CHART_S = 2.8;
const MOBILE_STACK_S = 2.2;

/**
 * Valori condivisi tra GSAP e le scene 3D. Partono dalla posa finale: se per qualsiasi motivo
 * l’animazione non parte, si vede il grafico completo, mai una scena vuota.
 */
const FINAL = { grow: 1, arrow: 1, camera: 1, stack: 1 };
const driver = createDriver({ ...FINAL });

const fmt = (v: number, decimals: number) =>
  new Intl.NumberFormat("it-IT", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(v);

const countEase = gsap.parseEase("power2.out");

/** "Ogni euro investito, misurato.": grafico 3D che cresce, tre numeri che contano, canali impilati. */
export function Campaigns() {
  const ref = useRef<HTMLElement>(null);

  // Geometrie e ombre più leggere sotto 1024px: si decide prima che le scene vengano montate
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
          const pin = q("[data-camp-pin]")[0] as HTMLElement;
          const unitEl = q("[data-camp-unit]")[0] as HTMLElement;
          const stackEl = q("[data-camp-stack]")[0] as HTMLElement;
          const numbers = q("[data-kpi]") as HTMLElement[];
          const title = q("h2")[0] as HTMLElement;

          /** I numeri seguono la crescita delle colonne; poi si avvisano le scene di ridisegnare */
          const write = () => {
            const g = countEase(Math.min(1, v.grow));
            numbers.forEach((el, i) => {
              const k = campaign.kpis[i];
              el.textContent = fmt(k.value * g, k.decimals);
            });
            driver.notify();
          };

          const mm = gsap.matchMedia();
          mm.add(
            { desktop: DESKTOP, mobile: MOBILE, reduce: REDUCE },
            (ctx) => {
              const { desktop, reduce } = ctx.conditions ?? {};
              const cleanups: (() => void)[] = [];

              if (reduce) {
                // Niente movimento: scena ferma nella posa finale, numeri già completi
                Object.assign(v, FINAL);
                write();
                return;
              }

              const split = splitLinesIn(title, title, 0.1, "top 85%");
              gsap.from(q("[data-camp-fade]"), {
                opacity: 0,
                y: 16,
                duration: 0.7,
                stagger: 0.08,
                delay: 0.2,
                scrollTrigger: enterAt(title, "top 85%"),
              });

              // ---- Grafico: 10 unità di timeline
              // 0 → 7,5   colonne una dopo l’altra (il rimbalzo è nella scena) e numeri che contano
              // 4 → 8,2   la freccia si disegna salendo (quando la camera si è già allontanata)
              // 0 → 9     la camera sale e si allontana
              // 9 → 10    pausa sulla posa finale
              const chartTl = gsap.timeline({
                paused: true,
                defaults: { ease: "none" },
                onUpdate: write,
              });
              chartTl
                .fromTo(v, { grow: 0 }, { grow: 1, duration: 7.5, immediateRender: false }, 0)
                .fromTo(
                  v,
                  { arrow: 0 },
                  { arrow: 1, duration: 4.2, ease: "power1.inOut", immediateRender: false },
                  4,
                )
                .fromTo(v, { camera: 0 }, { camera: 1, duration: 9, immediateRender: false }, 0)
                .to({}, { duration: 1 }, 9);

              // ---- Canali: i blocchi salgono uno dopo l’altro (gli scaglioni sono nella scena)
              const stackTl = gsap.timeline({
                paused: true,
                defaults: { ease: "none" },
                onUpdate: () => driver.notify(),
              });
              stackTl.fromTo(v, { stack: 0 }, { stack: 1, duration: 1, immediateRender: false });

              if (desktop) {
                // Si parte dalla scena vuota: è lo scroll a stabilire da dove riprendere
                Object.assign(v, { grow: 0, arrow: 0, camera: 0, stack: 0 });
                write();
                // Sezione fissata per 2,5 schermate: lo scroll fa crescere il grafico
                ScrollTrigger.create({
                  animation: chartTl,
                  trigger: pin,
                  start: "top top",
                  end: "+=250%",
                  pin: true,
                  scrub: 0.8,
                  anticipatePin: 1,
                  invalidateOnRefresh: true,
                });
                ScrollTrigger.create({
                  animation: stackTl,
                  trigger: stackEl,
                  start: "top 85%",
                  end: "top 30%",
                  scrub: 0.8,
                });
                refreshSoon();
              } else {
                // Mobile: parte quando il blocco è in vista e finisce da solo (doppio innesco, vedi lib/inView)
                const arm = (keys: string[]) => () => {
                  keys.forEach((k) => (v[k] = 0));
                  write();
                };
                cleanups.push(
                  playWhenSeen(chartTl, unitEl, {
                    seconds: MOBILE_CHART_S,
                    onArm: arm(["grow", "arrow", "camera"]),
                    onSkip: write,
                  }),
                  playWhenSeen(stackTl, stackEl, {
                    seconds: MOBILE_STACK_S,
                    onArm: arm(["stack"]),
                    onSkip: write,
                  }),
                );
              }

              return () => {
                cleanups.forEach((fn) => fn());
                split.revert();
                Object.assign(v, FINAL);
                write();
              };
            },
          );

        },
        150,
      ),
    { scope: ref },
  );

  const status = campaign.isRealData
    ? campaign.realLabel
    : campaign.placeholderLabel;

  return (
    <section
      ref={ref}
      id="campagne"
      className="relative bg-[#efebe4] text-ink"
      data-section="campagne"
      aria-labelledby="camp-title"
    >
      <div
        data-camp-pin
        className="pb-4 pt-20 lg:flex lg:h-svh lg:flex-col lg:pb-8 lg:pt-[calc(var(--nav-h)+32px)]"
      >
        <Container className="lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end lg:gap-8">
            <h2
              id="camp-title"
              className="h-display text-[clamp(2.6rem,1rem+5vw,6rem)] lg:col-span-8"
              aria-label="Ogni euro investito, misurato."
            >
              Ogni euro investito, misurato.
            </h2>
            <p
              className="max-w-[34ch] text-[17px] leading-relaxed text-ink/70 md:text-lg lg:col-span-4 lg:pb-2"
              data-camp-fade
            >
              Ogni mese ti mostriamo quanti contatti sono arrivati, da dove, e
              quanto è costato ognuno.
            </p>
          </div>

          {/* Numeri e grafico sono un blocco solo: su telefono i numeri stanno sopra la parte vuota del canvas,
              così si vedono contare mentre le colonne crescono */}
          <div
            className="mt-10 grid grid-cols-1 lg:mt-4 lg:min-h-0 lg:flex-1 lg:grid-cols-12 lg:gap-8"
            data-camp-unit
          >
            <dl className="relative z-10 grid gap-y-5 lg:order-2 lg:col-span-3 lg:flex lg:flex-col lg:justify-center lg:gap-y-9">
              {campaign.kpis.map((k) => (
                <div
                  key={k.label}
                  className="flex flex-row-reverse items-baseline justify-between gap-4 lg:flex-col-reverse lg:items-start lg:justify-start lg:gap-1.5"
                  data-camp-fade
                >
                  <dt className="text-right text-[16px] leading-snug text-ink/65 lg:text-left lg:text-[17px]">
                    {k.label}
                  </dt>
                  <dd className="font-display text-[clamp(2.6rem,1.6rem+3.2vw,5rem)] font-bold leading-[0.95] tracking-tightest tabular-nums">
                    <span data-kpi>{fmt(k.value, k.decimals)}</span>
                    {k.suffix}
                  </dd>
                </div>
              ))}
            </dl>

            {/* Grafico 3D: a tutta larghezza su telefono */}
            <div
              className="-mx-5 -mt-16 aspect-square sm:-mx-8 sm:-mt-24 sm:aspect-[4/3] lg:order-1 lg:col-span-9 lg:mx-0 lg:mt-0 lg:aspect-auto lg:h-full lg:min-h-[420px]"
              data-camp-chart
            >
              <SceneSlot
                className="h-full w-full"
                fallback={{ src: "/campagne/grafico.webp", width: 1600, height: 1000 }}
                alt="Grafico a colonne: i contatti crescono settimana dopo settimana, da 4 a 19"
              >
                {(onReady) => (
                  <CampaignChart driver={driver} weeks={campaign.weeks} onReady={onReady} />
                )}
              </SceneSlot>
            </div>
          </div>

          <p className="sr-only">
            {campaign.weeksLabel}: {campaign.weeks.join(", ")}.
          </p>
        </Container>
      </div>

      <Container className="pb-16 pt-10 lg:pb-24 lg:pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:items-center lg:gap-8">
          <div className="lg:col-span-4">
            <h3 className="font-display text-[clamp(1.75rem,1.2rem+1.8vw,2.75rem)] font-bold leading-[1.02] tracking-tightest">
              {campaign.channelsLabel}
            </h3>
            <p className="mt-4 max-w-[32ch] text-[17px] leading-relaxed text-ink/70">
              Da dove arriva chi ti contatta. Così sappiamo dove spostare il
              budget.
            </p>
            <dl className="sr-only">
              {campaign.channels.map((c) => (
                <div key={c.label}>
                  <dt>{c.label}</dt>
                  <dd>{c.value} contatti</dd>
                </div>
              ))}
            </dl>
          </div>
          <div
            className="-mx-5 mt-8 aspect-square sm:-mx-8 sm:aspect-[4/3] lg:col-span-8 lg:mx-0 lg:mt-0 lg:aspect-auto lg:h-[min(560px,62svh)]"
            data-camp-stack
          >
            <SceneSlot
              className="h-full w-full"
              fallback={{ src: "/campagne/canali.webp", width: 1400, height: 1000 }}
              alt="Blocchi impilati per canale: Google Ads 52, Meta Ads 41, Sito web 18, WhatsApp 9"
            >
              {(onReady) => (
                <ChannelStack
                  driver={driver}
                  channels={campaign.channels}
                  onReady={onReady}
                />
              )}
            </SceneSlot>
          </div>
        </div>

        <p className="mt-10 text-[13px] text-ink/45 lg:mt-14">
          {status} · {campaign.period}
        </p>
      </Container>
    </section>
  );
}
