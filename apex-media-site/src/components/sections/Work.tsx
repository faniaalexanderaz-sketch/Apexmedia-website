"use client";

import { useRef } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { BrowserFrame } from "@/components/ui/BrowserFrame";
import { Button } from "@/components/ui/Button";
import { ArrowIcon } from "@/components/ui/Icons";
import { portfolio } from "@/data/portfolio";
import {
  deferSetup,
  gsap,
  useGSAP,
  MEDIA,
  enterAt,
  splitLinesIn,
  revealImage,
} from "@/lib/gsap";

/** Versione compatta per la home: solo 3 lavori, tutti gli altri e il dettaglio sono in /portfolio. */
const inHome = portfolio.slice(0, 3);
export function Work() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    (_, contextSafe) =>
      deferSetup(
        contextSafe,
        () => {
          const root = ref.current;
          if (!root) return;
          const cards = gsap.utils.toArray<HTMLElement>(
            "[data-work-card]",
            root,
          );
          const mm = gsap.matchMedia();
          mm.add([MEDIA.desktop, MEDIA.mobile], () => {
            const title = root.querySelector<HTMLElement>("[data-work-head] h2");
            const split = title ? splitLinesIn(title) : null;
            gsap.from("[data-work-head] > p", {
              opacity: 0,
              y: 16,
              duration: 0.7,
              delay: 0.15,
              scrollTrigger: enterAt(root),
            });
            cards.forEach((card) => {
              const frame = card.querySelector("[data-browser-frame]");
              const text = card.querySelector("[data-work-text]");
              // Maschera dal basso + lo screenshot si muove appena più lento della cornice
              if (frame)
                revealImage(
                  frame,
                  card.querySelector("[data-browser-viewport] img"),
                  card,
                  "top 82%",
                );
              if (text)
                gsap.from(text, {
                  opacity: 0,
                  y: 12,
                  duration: 0.6,
                  delay: 0.2,
                  scrollTrigger: enterAt(card, "top 82%"),
                });
            });
            gsap.from("[data-work-cta] > *", {
              opacity: 0,
              y: 12,
              duration: 0.6,
              stagger: 0.08,
              scrollTrigger: enterAt(
                root.querySelector("[data-work-cta]")!,
                "top 92%",
              ),
            });
            return () => {
              split?.revert();
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
      id="lavori"
      className="py-20 lg:py-28"
      data-section="lavori"
    >
      <Container>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <SectionLabel numero="01" testo="Lavori" />
          </div>
          <div className="lg:col-span-9" data-work-head>
            <h2 className="h-display text-[clamp(2rem,1rem+3.6vw,4.25rem)]">
              Siti web, social e campagne per attività locali.
            </h2>
            <p className="text-body mt-5 text-ink/75 md:text-lg">
              Una selezione dei progetti che seguiamo ogni giorno: coworking,
              centro olistico, fioreria.
            </p>
          </div>
        </div>

        <ul
          className="mt-12 grid grid-cols-1 gap-x-6 gap-y-12 md:grid-cols-3 lg:mt-16 lg:gap-x-10"
          role="list"
        >
          {inHome.map((item, i) => (
            <li
              key={item.slug}
              data-work-card
              className={i % 2 === 1 ? "md:mt-12" : ""}
            >
              <Link
                href={`/portfolio#${item.slug}`}
                className="group block"
                data-track="click_portfolio"
                data-track-cliente={item.name}
                aria-label={`${item.name}: vedi il caso nel portfolio`}
              >
                <BrowserFrame
                  url={item.domain}
                  shot={item.shots.desktop}
                  alt={`Home page del sito ${item.name} su desktop`}
                  sizes="(min-width: 768px) 31vw, 92vw"
                />
                <div
                  className="mt-5 flex items-baseline justify-between gap-4"
                  data-work-text
                >
                  <div>
                    <h3 className="font-display text-[clamp(1.375rem,1rem+0.9vw,1.75rem)] font-bold leading-none tracking-tightest group-hover:text-viola">
                      {item.name}
                    </h3>
                    <p className="mt-2 text-[15px] text-ink/70">
                      {item.sector}
                    </p>
                  </div>
                  <span className="label-mono shrink-0 text-blu-deep">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <div
          className="mt-14 flex flex-col gap-5 border-t border-ink/10 pt-8 sm:flex-row sm:items-center sm:justify-between lg:mt-20"
          data-work-cta
        >
          <Button
            href="/portfolio"
            variant="secondary"
            data-track="click_portfolio"
            data-track-cliente="tutti"
          >
            Vedi tutti i lavori
            <ArrowIcon />
          </Button>
          <Button
            href="#contatti"
            variant="link"
            className="text-[17px] md:text-lg"
            data-track="click_cta"
            data-track-posizione="lavori"
          >
            Vuoi un lavoro così per la tua attività? Prenota la call
          </Button>
        </div>
      </Container>
    </section>
  );
}
