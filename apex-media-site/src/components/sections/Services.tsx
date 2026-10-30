"use client";

import { useRef, useState } from "react";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { AccordionItem } from "@/components/ui/Accordion";
import { TricolorStripe } from "@/components/ui/TricolorStripe";
import { Button } from "@/components/ui/Button";
import { services, type Accent } from "@/data/services";
import { useMediaQuery } from "@/lib/useMediaQuery";
import {
  deferSetup,
  gsap,
  useGSAP,
  ScrollTrigger,
  SplitText,
  MEDIA,
  EASE,
  enterAt,
  splitWordsIn,
} from "@/lib/gsap";

/** Colore del nome attivo e dei dettagli. Il giallo non si usa mai come testo: diventa un evidenziatore. */
const accentText: Record<Accent, string> = {
  blu: "text-blu-deep",
  giallo: "text-ink",
  viola: "text-viola",
  ink: "text-ink",
  tricolor: "text-ink",
};
const accentBg: Record<Accent, string> = {
  blu: "bg-blu",
  giallo: "bg-giallo",
  viola: "bg-viola",
  ink: "bg-ink",
  tricolor: "bg-ink",
};

function ServiceName({
  name,
  accent,
  active,
}: {
  name: string;
  accent: Accent;
  active: boolean;
}) {
  if (accent === "giallo" && active) return <span className="hl">{name}</span>;
  return <span className={active ? accentText[accent] : ""}>{name}</span>;
}

export function Services() {
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  useGSAP(
    (_, contextSafe) =>
      deferSetup(
        contextSafe,
        () => {
          const root = ref.current;
          if (!root) return;
          const mm = gsap.matchMedia();
          mm.add([MEDIA.desktop, MEDIA.mobile], (ctx) => {
            const desktop = Boolean(
              ctx.conditions?.[0] ?? window.matchMedia(MEDIA.desktop).matches,
            );
            const splits: SplitText[] = [];
            const title = root.querySelector<HTMLElement>(
              "[data-services-title]",
            );
            if (title) splits.push(splitWordsIn(title));
            gsap.from("[data-services-head] p", {
              opacity: 0,
              y: 16,
              duration: 0.7,
              scrollTrigger: enterAt(root),
            });

            if (desktop) {
              // Nomi: entrano in sequenza. Pannelli: ognuno si rivela quando entra e attiva il suo nome
              gsap.from("[data-service-item]", {
                opacity: 0,
                x: -16,
                duration: 0.6,
                stagger: 0.07,
                scrollTrigger: enterAt(root, "top 70%"),
              });
              gsap.utils
                .toArray<HTMLElement>("[data-service-panel]", root)
                .forEach((panel, i) => {
                  ScrollTrigger.create({
                    trigger: panel,
                    start: "top 55%",
                    end: "bottom 55%",
                    onToggle: (self) => self.isActive && setActive(i),
                  });
                  const h = panel.querySelector("h3");
                  if (h) splits.push(splitWordsIn(h, panel, 0.04, "top 80%"));
                  gsap.from(panel.querySelectorAll("[data-fade]"), {
                    opacity: 0,
                    y: 14,
                    duration: 0.6,
                    stagger: 0.06,
                    scrollTrigger: enterAt(panel, "top 80%"),
                  });
                  gsap.from(panel.querySelectorAll("[data-line]"), {
                    scaleX: 0,
                    transformOrigin: "left center",
                    duration: 0.7,
                    stagger: 0.06,
                    scrollTrigger: enterAt(panel, "top 80%"),
                  });
                  gsap.from(panel.querySelectorAll("[data-chip]"), {
                    opacity: 0,
                    scale: 0.85,
                    duration: 0.45,
                    stagger: 0.05,
                    ease: "back.out(1.7)",
                    scrollTrigger: enterAt(panel, "top 70%"),
                  });
                  const bar = panel.querySelector("[data-accent-bar]");
                  if (bar)
                    gsap.from(bar, {
                      scaleY: 0,
                      transformOrigin: "top center",
                      duration: 0.8,
                      ease: EASE.reveal,
                      scrollTrigger: enterAt(panel, "top 80%"),
                    });
                });
            } else {
              gsap.from("[data-services-mobile] > *", {
                opacity: 0,
                y: 14,
                duration: 0.6,
                stagger: 0.07,
                scrollTrigger: enterAt(root, "top 75%"),
              });
            }
            return () => splits.forEach((s) => s.revert());
          });
        },
        180,
      ),
    { scope: ref },
  );

  const Detail = ({
    s,
    index,
  }: {
    s: (typeof services)[number];
    index: number;
  }) => (
    <>
      <p className="text-[18px] leading-snug text-ink lg:text-[20px]" data-fade>
        {s.description}
      </p>
      <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div>
          <p className="label-mono text-ink/60" data-fade>
            Cosa facciamo
          </p>
          <ul className="mt-3">
            {s.includes.map((inc) => (
              <li
                key={inc}
                className="relative py-2.5 pl-5 text-[15px] leading-snug"
                data-fade
              >
                <span
                  aria-hidden="true"
                  className={`absolute left-0 top-[13px] size-[7px] ${accentBg[s.accent]}`}
                />
                {inc}
                <span
                  data-line
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-px bg-ink/10"
                />
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="label-mono text-ink/60" data-fade>
            Cosa ricevi
          </p>
          <ul className="mt-3">
            {s.deliverables.map((d) => (
              <li
                key={d}
                className="relative py-2.5 text-[15px] font-medium leading-snug"
                data-fade
              >
                {d}
                <span
                  data-line
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-px bg-ink/10"
                />
              </li>
            ))}
          </ul>
          <p className="label-mono mt-7 text-ink/60" data-fade>
            Strumenti
          </p>
          <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Strumenti">
            {s.tools.map((t) => (
              <li
                key={t}
                data-chip
                className="border border-ink/25 px-2.5 py-1 font-mono text-[11px] tracking-wide text-ink"
              >
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-7" data-fade>
            <Button
              href="#contatti"
              variant="link"
              data-preselect={s.formValue}
              data-track="click_cta"
              data-track-posizione={`servizi-${s.id}`}
            >
              Parliamone nella call gratuita
            </Button>
          </div>
        </div>
      </div>
      <span className="sr-only">{String(index + 1).padStart(2, "0")}</span>
    </>
  );

  return (
    <section
      ref={ref}
      id="servizi"
      className="border-t border-ink/10 py-20 lg:py-28"
      data-section="servizi"
    >
      <Container>
        <div
          className="grid grid-cols-1 gap-6 lg:grid-cols-12"
          data-services-head
        >
          <div className="lg:col-span-3">
            <SectionLabel numero="02" testo="Servizi" />
          </div>
          <div className="lg:col-span-8">
            <h2
              className="h-display text-[clamp(2rem,1rem+3.8vw,4.5rem)]"
              data-services-title
            >
              Cosa facciamo. Tutto, in casa.
            </h2>
            <p className="text-body mt-6 text-[17px] text-ink/80 md:text-lg">
              Strategia, grafica, video, campagne, sito, stampe e analisi: un
              solo team, nessun fornitore in mezzo. Scorri per vedere ogni
              servizio da vicino.
            </p>
          </div>
        </div>

        {/* Desktop: nomi fissi a sinistra, pannelli alti a destra che si attraversano scorrendo */}
        <div
          className="mt-14 hidden grid-cols-12 gap-8 lg:grid"
          data-services-desktop
          hidden={isDesktop === false}
        >
          <div className="col-span-5">
            <ol
              className="sticky top-[calc(var(--nav-h)+40px)] border-t border-ink/10"
              role="list"
            >
              {services.map((s, i) => {
                const isActive = i === active;
                return (
                  <li
                    key={s.id}
                    className="border-b border-ink/10"
                    data-service-item
                  >
                    <a
                      href={`#servizio-${s.id}`}
                      aria-current={isActive ? "true" : undefined}
                      className={`flex w-full items-baseline gap-5 py-4 text-left font-display text-[clamp(1.75rem,1rem+2vw,3rem)] font-bold leading-none tracking-tightest transition-colors duration-300 ${isActive ? "" : "text-ink/30 hover:text-ink/60"}`}
                    >
                      <span
                        className={`font-mono text-[12px] tracking-label ${isActive ? accentText[s.accent] : "text-ink/40"}`}
                      >
                        0{i + 1}
                      </span>
                      <ServiceName
                        name={s.name}
                        accent={s.accent}
                        active={isActive}
                      />
                    </a>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="col-span-7">
            {services.map((s, i) => (
              <article
                key={s.id}
                id={`servizio-${s.id}`}
                data-service-panel={s.id}
                className="relative min-h-[70vh] scroll-mt-24 border-t border-ink/10 py-10 pl-8 first:border-t-0 first:pt-0"
              >
                <span
                  aria-hidden="true"
                  data-accent-bar
                  className="absolute left-0 top-10 bottom-10 w-[3px] first:top-0"
                >
                  {s.accent === "tricolor" ? (
                    <TricolorStripe vertical />
                  ) : (
                    <span
                      className={`block h-full w-full ${accentBg[s.accent]}`}
                    />
                  )}
                </span>
                <p className="label-mono text-ink/60" data-fade>
                  0{i + 1} — {s.name}
                </p>
                <h3 className="h-display mt-4 text-[clamp(1.6rem,1rem+1.6vw,2.4rem)]">
                  {s.tagline}
                </h3>
                <div className="mt-6">
                  <Detail s={s} index={i} />
                </div>
              </article>
            ))}
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
                <span className="flex items-baseline gap-4 font-display text-[26px] font-bold leading-none tracking-tightest">
                  <span
                    className={`font-mono text-[11px] tracking-label ${accentText[s.accent]}`}
                  >
                    0{i + 1}
                  </span>
                  <ServiceName name={s.name} accent={s.accent} active />
                </span>
              }
            >
              <div className="relative pb-7 pl-5">
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-1 bottom-7 w-[3px]"
                >
                  {s.accent === "tricolor" ? (
                    <TricolorStripe vertical />
                  ) : (
                    <span
                      className={`block h-full w-full ${accentBg[s.accent]}`}
                    />
                  )}
                </span>
                <p className="font-display text-[19px] font-bold leading-tight tracking-tight">
                  {s.tagline}
                </p>
                <div className="mt-4">
                  <Detail s={s} index={i} />
                </div>
              </div>
            </AccordionItem>
          ))}
        </div>
      </Container>
    </section>
  );
}
