"use client";

import { useRef } from "react";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { GridLines } from "@/components/ui/GridLines";
import { Button } from "@/components/ui/Button";
import {
  performanceIntro,
  adsBlock,
  funnelBlock,
  socialBlock,
} from "@/data/performance";
import {
  deferSetup,
  gsap,
  useGSAP,
  SplitText,
  MEDIA,
  EASE,
  enterAt,
} from "@/lib/gsap";

/** Forma dell’imbuto: 5 fasce, dalla più larga alla più stretta (viewBox 100 x 100) */
const FUNNEL_BANDS = [
  { top: 0, wTop: 100, wBot: 88 },
  { top: 20, wTop: 88, wBot: 74 },
  { top: 40, wTop: 74, wBot: 58 },
  { top: 60, wTop: 58, wBot: 44 },
  { top: 80, wTop: 44, wBot: 34 },
];
const bandPath = (b: (typeof FUNNEL_BANDS)[number]) => {
  const l1 = (100 - b.wTop) / 2;
  const l2 = (100 - b.wBot) / 2;
  return `M${l1} ${b.top} H${l1 + b.wTop} L${l2 + b.wBot} ${b.top + 19} H${l2} Z`;
};
const BAND_FILL = ["#0B0D14", "#1a1d2a", "#2F6BFF", "#5B2EFF", "#FFD84D"];

export function Performance({ numero = "03" }: { numero?: string }) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    (_, contextSafe) =>
      deferSetup(
        contextSafe,
        () => {
          const root = ref.current;
          if (!root) return;
          const mm = gsap.matchMedia();
          mm.add([MEDIA.desktop, MEDIA.mobile], () => {
            const splits: SplitText[] = [];
            const head = root.querySelector<HTMLElement>("[data-perf-head]");
            const title = root.querySelector<HTMLElement>("[data-perf-title]");

            // Intro: titolo a parole da maschera, testo in dissolvenza
            if (title)
              splits.push(
                SplitText.create(title, {
                  type: "words",
                  mask: "words",
                  autoSplit: true,
                  onSplit: (self) =>
                    gsap.from(self.words, {
                      yPercent: 100,
                      duration: 0.8,
                      ease: EASE.reveal,
                      stagger: 0.04,
                      scrollTrigger: enterAt(head ?? title),
                    }),
                }),
              );
            gsap.from("[data-perf-head] p", {
              opacity: 0,
              y: 16,
              duration: 0.7,
              stagger: 0.08,
              scrollTrigger: enterAt(head ?? root),
            });

            // Blocchi: titoli a righe da maschera, testi in dissolvenza
            root
              .querySelectorAll<HTMLElement>("[data-block]")
              .forEach((block) => {
                const h = block.querySelector<HTMLElement>("h3");
                if (h)
                  splits.push(
                    SplitText.create(h, {
                      type: "lines",
                      mask: "lines",
                      autoSplit: true,
                      onSplit: (self) =>
                        gsap.from(self.lines, {
                          yPercent: 100,
                          duration: 0.8,
                          ease: EASE.reveal,
                          stagger: 0.08,
                          scrollTrigger: enterAt(block, "top 80%"),
                        }),
                    }),
                  );
                gsap.from(block.querySelectorAll("[data-block-fade]"), {
                  opacity: 0,
                  y: 14,
                  duration: 0.6,
                  stagger: 0.08,
                  scrollTrigger: enterAt(block, "top 80%"),
                });
              });

            // 1. Pubblicità: la checklist si spunta una voce alla volta, la linea si disegna, il segno appare
            const checks = gsap.utils.toArray<HTMLElement>(
              "[data-check]",
              root,
            );
            const checkTl = gsap.timeline({
              scrollTrigger: enterAt(
                root.querySelector("[data-checklist]") ?? root,
                "top 80%",
              ),
            });
            checks.forEach((row, i) => {
              const line = row.querySelector("[data-line]");
              const mark = row.querySelector("[data-mark]");
              const text = row.querySelector("[data-check-text]");
              const at = i * 0.14;
              if (line)
                checkTl.from(
                  line,
                  {
                    scaleX: 0,
                    transformOrigin: "left center",
                    duration: 0.6,
                    ease: EASE.enter,
                  },
                  at,
                );
              if (text)
                checkTl.from(
                  text,
                  { opacity: 0, x: -8, duration: 0.5, ease: EASE.enter },
                  at + 0.05,
                );
              if (mark)
                checkTl.from(
                  mark,
                  {
                    scale: 0,
                    rotation: -45,
                    transformOrigin: "center",
                    duration: 0.45,
                    ease: "back.out(2)",
                  },
                  at + 0.2,
                );
            });
            // etichette delle piattaforme: entrano scalando
            gsap.from("[data-platform]", {
              opacity: 0,
              scale: 0.9,
              y: 8,
              duration: 0.5,
              stagger: 0.08,
              ease: "back.out(1.6)",
              scrollTrigger: enterAt(
                root.querySelector("[data-platforms]") ?? root,
                "top 85%",
              ),
            });

            // 2. Funnel: le fasce si riempiono dall’alto con lo scroll (clip-path, scrub); ogni passo si accende quando tocca
            const funnel = root.querySelector<HTMLElement>("[data-funnel]");
            const bands = gsap.utils.toArray<HTMLElement>("[data-band]", root);
            const steps = gsap.utils.toArray<HTMLElement>(
              "[data-funnel-step]",
              root,
            );
            if (funnel && bands.length) {
              const wrap =
                root.querySelector<HTMLElement>("[data-funnel-wrap]") ?? funnel;
              const scrubTl = gsap.timeline({
                scrollTrigger: {
                  trigger: wrap,
                  start: "top 75%",
                  end: "bottom 45%",
                  scrub: 0.5,
                },
              });
              bands.forEach((b, i) => {
                scrubTl.fromTo(
                  b,
                  { clipPath: "inset(0% 0% 100% 0%)" },
                  { clipPath: "inset(0% 0% 0% 0%)", ease: "none", duration: 1 },
                  i,
                );
                const step = steps[i];
                if (step) {
                  const dot = step.querySelector("[data-step-dot]");
                  scrubTl.fromTo(
                    step,
                    { opacity: 0.35, x: 12 },
                    { opacity: 1, x: 0, ease: "none", duration: 0.6 },
                    i + 0.2,
                  );
                  if (dot)
                    scrubTl.fromTo(
                      dot,
                      { scale: 0 },
                      { scale: 1, ease: "none", duration: 0.4 },
                      i + 0.3,
                    );
                }
              });
              // la pallina che percorre il funnel: scende con lo scroll
              const ball = root.querySelector("[data-funnel-ball]");
              if (ball)
                gsap.fromTo(
                  ball,
                  { y: 0 },
                  {
                    y: () => funnel.offsetHeight * 0.86,
                    ease: "none",
                    scrollTrigger: {
                      trigger: wrap,
                      start: "top 75%",
                      end: "bottom 45%",
                      scrub: 0.5,
                      invalidateOnRefresh: true,
                    },
                  },
                );
            }

            // 3. Social: il calendario della settimana si riempie giorno per giorno, poi i punti del servizio
            const days = gsap.utils.toArray<HTMLElement>("[data-day]", root);
            const calTl = gsap.timeline({
              scrollTrigger: enterAt(
                root.querySelector("[data-week]") ?? root,
                "top 80%",
              ),
            });
            calTl.from(
              days,
              {
                opacity: 0,
                y: 10,
                duration: 0.4,
                stagger: 0.06,
                ease: EASE.enter,
              },
              0,
            );
            calTl.from(
              "[data-slot]",
              {
                scaleY: 0,
                transformOrigin: "bottom center",
                duration: 0.5,
                stagger: 0.08,
                ease: EASE.enter,
              },
              0.25,
            );
            calTl.from(
              "[data-slot-label]",
              { opacity: 0, duration: 0.3, stagger: 0.08 },
              0.5,
            );
            gsap.from("[data-point]", {
              opacity: 0,
              y: 14,
              duration: 0.6,
              stagger: 0.1,
              scrollTrigger: enterAt(
                root.querySelector("[data-points]") ?? root,
                "top 82%",
              ),
            });
            gsap.from("[data-point] [data-line]", {
              scaleX: 0,
              transformOrigin: "left center",
              duration: 0.7,
              stagger: 0.1,
              scrollTrigger: enterAt(
                root.querySelector("[data-points]") ?? root,
                "top 82%",
              ),
            });

            return () => splits.forEach((s) => s.revert());
          });
        },
        160,
      ),
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      id="performance"
      className="relative border-t border-ink/10 py-20 lg:py-28"
      data-section="performance"
    >
      <GridLines className="opacity-60" />
      <Container className="relative">
        {/* Intro */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12" data-perf-head>
          <div className="lg:col-span-3">
            <SectionLabel numero={numero} testo="Performance" />
          </div>
          <div className="lg:col-span-8">
            <h2
              className="h-display text-[clamp(2rem,1rem+3.8vw,4.5rem)]"
              data-perf-title
            >
              {performanceIntro.title}
            </h2>
            <p className="text-body mt-6 text-[17px] text-ink/80 md:text-lg">
              {performanceIntro.text}
            </p>
          </div>
        </div>

        {/* 1. Pubblicità */}
        <article
          className="mt-20 grid grid-cols-1 gap-10 border-t border-ink/10 pt-12 lg:mt-28 lg:grid-cols-12 lg:gap-8 lg:pt-16"
          data-block="ads"
        >
          <div className="lg:col-span-5">
            <p className="label-mono text-blu-deep" data-block-fade>
              {adsBlock.kicker}
            </p>
            <h3 className="h-display mt-5 text-[clamp(1.75rem,1rem+2.6vw,3.25rem)]">
              {adsBlock.title}
            </h3>
            <p
              className="text-body mt-5 text-[17px] text-ink/80"
              data-block-fade
            >
              {adsBlock.text}
            </p>
            <ul
              className="mt-7 flex flex-wrap gap-2"
              data-platforms
              aria-label="Piattaforme pubblicitarie"
            >
              {adsBlock.platforms.map((p) => (
                <li
                  key={p}
                  data-platform
                  className="border border-ink px-3 py-1.5 font-mono text-[12px] tracking-wide text-ink"
                >
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="label-mono text-ink/60" data-block-fade>
              Cosa ottimizziamo ogni settimana
            </p>
            <ol className="mt-4" data-checklist>
              {adsBlock.checklist.map((c) => (
                <li
                  key={c.what}
                  data-check
                  className="relative grid grid-cols-[28px_1fr] gap-4 py-4"
                >
                  <span
                    data-mark
                    aria-hidden="true"
                    className="mt-1 inline-flex size-5 items-center justify-center bg-giallo"
                  >
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                      <path
                        d="M1 5l3.5 3.5L11 1"
                        stroke="#0B0D14"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span data-check-text>
                    <span className="block font-display text-[19px] font-bold leading-tight tracking-tight">
                      {c.what}
                    </span>
                    <span className="mt-1 block text-[15px] leading-snug text-ink/70">
                      {c.how}
                    </span>
                  </span>
                  <span
                    data-line
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-px bg-ink/12"
                  />
                </li>
              ))}
            </ol>
          </div>
        </article>

        {/* 2. Funnel */}
        <article
          className="mt-20 grid grid-cols-1 gap-10 border-t border-ink/10 pt-12 lg:mt-28 lg:grid-cols-12 lg:gap-8 lg:pt-16"
          data-block="funnel"
        >
          <div className="lg:col-span-5 lg:col-start-8 lg:row-start-1">
            <p className="label-mono text-blu-deep" data-block-fade>
              {funnelBlock.kicker}
            </p>
            <h3 className="h-display mt-5 text-[clamp(1.75rem,1rem+2.6vw,3.25rem)]">
              {funnelBlock.title}
            </h3>
            <p
              className="text-body mt-5 text-[17px] text-ink/80"
              data-block-fade
            >
              {funnelBlock.text}
            </p>
          </div>
          <div
            className="lg:col-span-7 lg:col-start-1 lg:row-start-1"
            data-funnel-wrap
          >
            <div className="grid grid-cols-[minmax(120px,38%)_1fr] gap-6 sm:gap-10">
              <div className="relative" data-funnel>
                <svg
                  viewBox="0 0 100 100"
                  className="block h-auto w-full"
                  aria-hidden="true"
                  preserveAspectRatio="none"
                >
                  {FUNNEL_BANDS.map((b, i) => (
                    <path
                      key={i}
                      d={bandPath(b)}
                      fill="#0B0D14"
                      opacity="0.08"
                    />
                  ))}
                  {FUNNEL_BANDS.map((b, i) => (
                    <path
                      key={`f${i}`}
                      d={bandPath(b)}
                      fill={BAND_FILL[i]}
                      data-band
                    />
                  ))}
                </svg>
                <span
                  data-funnel-ball
                  aria-hidden="true"
                  className="absolute left-1/2 top-[2%] size-[6%] -translate-x-1/2 rounded-full border-2 border-paper bg-giallo"
                />
              </div>
              <ol className="flex flex-col justify-between py-1">
                {funnelBlock.steps.map((s) => (
                  <li key={s.n} data-funnel-step className="relative py-2 pl-6">
                    <span
                      data-step-dot
                      aria-hidden="true"
                      className="absolute left-0 top-[14px] size-[9px] bg-viola"
                    />
                    <p className="flex items-baseline gap-3">
                      <span className="font-mono text-[11px] tracking-label text-ink/50">
                        {s.n}
                      </span>
                      <span className="font-display text-[20px] font-bold leading-none tracking-tight sm:text-[24px]">
                        {s.name}
                      </span>
                    </p>
                    <p className="mt-1.5 max-w-[34ch] text-[14px] leading-snug text-ink/70 sm:text-[15px]">
                      {s.text}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </article>

        {/* 3. Social */}
        <article
          className="mt-20 grid grid-cols-1 gap-10 border-t border-ink/10 pt-12 lg:mt-28 lg:grid-cols-12 lg:gap-8 lg:pt-16"
          data-block="social"
        >
          <div className="lg:col-span-5">
            <p className="label-mono text-blu-deep" data-block-fade>
              {socialBlock.kicker}
            </p>
            <h3 className="h-display mt-5 text-[clamp(1.75rem,1rem+2.6vw,3.25rem)]">
              {socialBlock.title}
            </h3>
            <p
              className="text-body mt-5 text-[17px] text-ink/80"
              data-block-fade
            >
              {socialBlock.text}
            </p>

            <div className="mt-8" data-week>
              <p className="label-mono text-ink/60">
                Settimana tipo del piano editoriale
              </p>
              <ul
                className="mt-3 grid grid-cols-7 gap-1.5"
                aria-label="Esempio di settimana"
              >
                {socialBlock.week.map((d) => (
                  <li
                    key={d.day}
                    data-day
                    className="flex flex-col items-stretch gap-2"
                  >
                    <span className="font-mono text-[10px] tracking-label text-ink/60">
                      {d.day}
                    </span>
                    <span className="relative flex h-16 items-end border border-ink/15 bg-surface">
                      {d.slot ? (
                        <span
                          data-slot
                          className={`block w-full ${d.slot === "Reel" || d.slot === "TikTok" ? "h-full bg-ink" : d.slot === "Post" ? "h-2/3 bg-viola" : "h-1/3 bg-blu"}`}
                        />
                      ) : null}
                    </span>
                    <span
                      data-slot-label
                      className="truncate font-mono text-[10px] text-ink/70"
                    >
                      {d.slot || "—"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <dl data-points>
              {socialBlock.points.map((p) => (
                <div
                  key={p.what}
                  data-point
                  className="relative grid grid-cols-[112px_1fr] gap-4 py-5 sm:grid-cols-[150px_1fr]"
                >
                  <dt className="font-display text-[19px] font-bold leading-tight tracking-tight">
                    {p.what}
                  </dt>
                  <dd className="text-[15px] leading-snug text-ink/75">
                    {p.how}
                  </dd>
                  <span
                    data-line
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-px bg-ink/12"
                  />
                </div>
              ))}
            </dl>
            <div className="mt-8">
              <Button
                href="#contatti"
                data-track="click_cta"
                data-track-posizione="performance"
              >
                Prenota la call gratuita
              </Button>
            </div>
          </div>
        </article>
      </Container>
    </section>
  );
}
