"use client";

import { useRef } from "react";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { BrowserFrame } from "@/components/ui/BrowserFrame";
import { PhoneFrame } from "@/components/ui/PhoneFrame";
import { Button } from "@/components/ui/Button";
import { ExternalIcon } from "@/components/ui/Icons";
import { portfolio } from "@/data/portfolio";
import {
  deferSetup,
  gsap,
  useGSAP,
  SplitText,
  MEDIA,
  EASE,
  enterAt,
  CLIP_HIDDEN_BOTTOM,
  CLIP_VISIBLE,
} from "@/lib/gsap";

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      data-row
      className="relative grid grid-cols-[96px_1fr] gap-4 py-4 sm:grid-cols-[150px_1fr]"
    >
      <dt className="label-mono pt-1 text-ink/60">{label}</dt>
      <dd className="min-w-0 text-[16px] leading-snug [overflow-wrap:anywhere]">
        {children}
      </dd>
      <span
        data-line
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px bg-ink/10"
      />
    </div>
  );
}

export function PortfolioCases({ as: Heading = "h2" }: { as?: "h1" | "h2" }) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    (_, contextSafe) =>
      deferSetup(
        contextSafe,
        () => {
          const root = ref.current;
          if (!root) return;
          const cases = gsap.utils.toArray<HTMLElement>("[data-case]", root);
          const mm = gsap.matchMedia();

          mm.add([MEDIA.desktop, MEDIA.mobile], () => {
            const splits: SplitText[] = [];
            gsap.from("[data-work-head] > *", {
              opacity: 0,
              y: 16,
              duration: 0.7,
              stagger: 0.08,
              scrollTrigger: enterAt(root),
            });

            cases.forEach((c) => {
              const frame = c.querySelector<HTMLElement>(
                "[data-browser-frame]",
              );
              const viewport = c.querySelector<HTMLElement>(
                "[data-browser-viewport]",
              );
              const fullImg =
                c.querySelector<HTMLImageElement>("[data-full-img]");
              const phone = c.querySelector<HTMLElement>("[data-phone-frame]");
              const name = c.querySelector<HTMLElement>("[data-case-name]");
              const rows = gsap.utils.toArray<HTMLElement>("[data-row]", c);
              const lines = gsap.utils.toArray<HTMLElement>("[data-line]", c);
              if (!frame || !viewport || !phone || !name) return;

              // 1. La cornice si rivela dal basso
              gsap.fromTo(
                frame,
                { clipPath: CLIP_HIDDEN_BOTTOM },
                {
                  clipPath: CLIP_VISIBLE,
                  duration: 0.9,
                  ease: EASE.reveal,
                  clearProps: "clipPath",
                  scrollTrigger: enterAt(frame, "top 80%"),
                },
              );

              // 2. Dentro la cornice scorre la pagina intera del cliente (scrub, anche su touch)
              if (fullImg) {
                // Tailwind rende [hidden] !important: va tolto l’attributo, non basta display
                fullImg.removeAttribute("hidden");
                gsap.fromTo(
                  fullImg,
                  { y: 0 },
                  {
                    y: () =>
                      -Math.max(
                        0,
                        fullImg.offsetHeight - viewport.offsetHeight,
                      ),
                    ease: EASE.scrub,
                    scrollTrigger: {
                      trigger: c,
                      start: "top 85%",
                      end: "bottom 15%",
                      scrub: 0.6,
                      invalidateOnRefresh: true,
                    },
                  },
                );
              }

              // 3. Il telefono sale con un leggero ritardo (parallasse)
              gsap.fromTo(
                phone,
                { yPercent: 10 },
                {
                  yPercent: -10,
                  ease: EASE.scrub,
                  scrollTrigger: {
                    trigger: c,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true,
                  },
                },
              );

              // 4. Scheda tecnica: righe una dopo l’altra, linee che si disegnano
              const sheet = gsap.timeline({
                scrollTrigger: enterAt(
                  c.querySelector("[data-sheet]") ?? c,
                  "top 85%",
                ),
              });
              sheet.from(
                lines,
                {
                  scaleX: 0,
                  transformOrigin: "left center",
                  duration: 0.7,
                  ease: EASE.enter,
                  stagger: 0.12,
                },
                0,
              );
              sheet.from(
                rows,
                {
                  opacity: 0,
                  y: 10,
                  duration: 0.6,
                  ease: EASE.enter,
                  stagger: 0.12,
                },
                0.1,
              );

              // 5. Nome del cliente: parole che salgono da una maschera
              splits.push(
                SplitText.create(name, {
                  type: "words",
                  mask: "words",
                  autoSplit: true,
                  onSplit: (self) =>
                    gsap.from(self.words, {
                      yPercent: 100,
                      duration: 0.8,
                      ease: EASE.reveal,
                      stagger: 0.05,
                      scrollTrigger: enterAt(name, "top 88%"),
                    }),
                }),
              );
            });

            gsap.from("[data-work-cta]", {
              opacity: 0,
              y: 12,
              duration: 0.6,
              scrollTrigger: enterAt(
                root.querySelector("[data-work-cta]")!,
                "top 92%",
              ),
            });
            return () => {
              splits.forEach((s) => s.revert());
              root
                .querySelectorAll("[data-full-img]")
                .forEach((img) => img.setAttribute("hidden", ""));
            };
          });
        },
        120,
      ),
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      id="casi"
      className="py-20 lg:py-28"
      data-section="portfolio"
    >
      <Container>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <SectionLabel numero="01" testo="Portfolio" />
          </div>
          <div className="lg:col-span-9" data-work-head>
            <Heading className="h-display text-[clamp(2rem,1rem+3.6vw,4.25rem)]">
              Portfolio: siti web, e-commerce e campagne per attività locali.
            </Heading>
            <p className="text-body mt-5 text-ink/75 md:text-lg">
              Progetti realizzati per attività di Alessandria e del Piemonte, in
              settori diversi. Ogni sito lo puoi aprire e provare.
            </p>
          </div>
        </div>

        <ol className="mt-12 lg:mt-16">
          {portfolio.map((item, i) => {
            const flip = i % 2 === 1;
            return (
              <li
                key={item.slug}
                id={item.slug}
                className="scroll-mt-24 border-t border-ink/10 py-10 lg:py-16"
                data-case={item.slug}
              >
                <article className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
                  <div
                    className={`relative lg:col-span-7 ${flip ? "lg:order-2 lg:col-start-6" : "lg:col-start-1"}`}
                    data-case-media
                  >
                    <div
                      className={`relative pb-[26%] lg:pb-[22%] ${flip ? "pr-6 sm:pr-10 lg:pr-0" : "pl-6 sm:pl-10 lg:pl-0"}`}
                    >
                      <BrowserFrame
                        url={item.domain}
                        href={item.url}
                        shot={item.shots.desktop}
                        fullShot={item.shots.full}
                        alt={`Home page del sito ${item.name} su desktop`}
                        sizes="(min-width: 1024px) 55vw, 92vw"
                        trackClient={item.name}
                      />
                      <PhoneFrame
                        shot={item.shots.mobile}
                        alt={`Home page del sito ${item.name} su smartphone`}
                        sizes="(min-width: 1024px) 12vw, 24vw"
                        className={`absolute bottom-0 w-[28%] lg:w-[24%] ${flip ? "right-0 lg:-right-8" : "left-0 lg:-left-8"}`}
                      />
                    </div>
                  </div>

                  <div
                    className={`lg:col-span-5 ${flip ? "lg:order-1 lg:col-start-1" : "lg:col-start-8"}`}
                    data-case-text
                  >
                    <p className="font-mono text-[11px] tracking-label text-blu-deep">
                      {String(i + 1).padStart(2, "0")}/
                      {String(portfolio.length).padStart(2, "0")}
                    </p>
                    <h3
                      className="h-display mt-3 text-[clamp(2rem,1rem+3vw,3.5rem)]"
                      data-case-name
                    >
                      {item.name}
                    </h3>
                    <dl className="mt-8 border-t border-ink/10" data-sheet>
                      <Row label="Settore">{item.sector}</Row>
                      <Row label="Cosa abbiamo fatto">{item.work}</Row>
                      <Row label="Sito">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="u-link inline-flex items-center gap-1.5 font-mono text-[14px] text-ink hover:text-viola"
                          data-track="click_portfolio"
                          data-track-cliente={item.name}
                        >
                          {item.domain}
                          <ExternalIcon />
                        </a>
                      </Row>
                    </dl>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>

        <div className="border-t border-ink/10 pt-8" data-work-cta>
          <Button
            href="/#contatti"
            variant="link"
            className="text-[17px] md:text-lg"
            data-track="click_cta"
            data-track-posizione="portfolio"
          >
            Vuoi un lavoro così per la tua attività? Prenota la call
          </Button>
        </div>
      </Container>
    </section>
  );
}
