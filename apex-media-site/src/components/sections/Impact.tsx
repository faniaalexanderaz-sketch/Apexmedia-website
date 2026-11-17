"use client";

import { useRef } from "react";
import { Container } from "@/components/ui/Container";
import { PanelBg } from "@/components/ui/PanelBg";
import {
  deferSetup,
  gsap,
  useGSAP,
  MEDIA,
  enterAt,
  splitLinesIn,
} from "@/lib/gsap";

const steps = [
  {
    n: "01",
    title: "Analisi",
    text: "Capiamo dove la tua attività perde clienti oggi: sito, social, campagne.",
  },
  {
    n: "02",
    title: "Strategia",
    text: "Costruiamo sito, contenuti e campagne con un solo obiettivo: farti contattare.",
  },
  {
    n: "03",
    title: "Misurazione",
    text: "Ti mostriamo quanto costa ogni contatto e quanto rende ogni euro speso.",
  },
];

/** Sezione di impatto tra la striscia di fiducia e i lavori: promessa + tre passaggi. */
export function Impact() {
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
            const h2 = root.querySelector<HTMLElement>("h2");
            if (h2) splitLinesIn(h2);
            gsap.from("[data-impact-sub]", {
              opacity: 0,
              y: 16,
              duration: 0.7,
              delay: 0.15,
              scrollTrigger: enterAt(root),
            });
            gsap.utils
              .toArray<HTMLElement>("[data-impact-step]", root)
              .forEach((s, i) =>
                gsap.from(s, {
                  opacity: 0,
                  y: 16,
                  duration: 0.6,
                  delay: i * 0.08,
                  scrollTrigger: enterAt(s, "top 88%"),
                }),
              );
          });
        },
        90,
      ),
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      id="approccio"
      className="relative isolate py-20 text-paper lg:py-32"
      data-section="approccio"
    >
      <PanelBg />
      <Container>
        <div className="grid grid-cols-1 gap-7 lg:grid-cols-12 lg:items-end lg:gap-8">
          <h2 className="h-display text-[clamp(2.25rem,0.9rem+5.6vw,6rem)] text-paper lg:col-span-8">
            Non vendiamo visibilità.{" "}
            <span className="text-giallo sm:block">Vendiamo clienti.</span>
          </h2>
          <p
            className="max-w-[36ch] text-[17px] leading-relaxed text-paper/75 md:text-lg lg:col-span-4 lg:pb-2"
            data-impact-sub
          >
            Ogni euro che investi in marketing deve tornare indietro. Per questo
            partiamo dai numeri, non dai like.
          </p>
        </div>

        <ol className="mt-14 grid grid-cols-1 md:grid-cols-3 md:gap-x-8 lg:mt-20 lg:gap-x-12">
          {steps.map((s) => (
            <li
              key={s.n}
              className="grid grid-cols-[4.25rem_1fr] items-start gap-x-4 border-t border-paper/20 py-7 md:block md:py-0 md:pt-7"
              data-impact-step
            >
              <p
                className="font-display text-[3rem] font-bold leading-[0.9] tracking-tightest tabular-nums text-paper md:text-[clamp(4rem,2rem+4.4vw,6.5rem)]"
                aria-hidden="true"
              >
                {s.n}
              </p>
              <div className="md:mt-6">
                <h3 className="font-display text-[26px] font-bold leading-none tracking-tightest">
                  {s.title}
                </h3>
                <p className="mt-3 max-w-[30ch] text-[16px] leading-relaxed text-paper/75">
                  {s.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
