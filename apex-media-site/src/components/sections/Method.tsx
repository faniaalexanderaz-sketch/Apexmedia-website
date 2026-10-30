"use client";

import { useRef } from "react";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { TricolorStripe } from "@/components/ui/TricolorStripe";
import { methodSteps, methodNumbers } from "@/data/services";
import {
  deferSetup,
  gsap,
  useGSAP,
  ScrollTrigger,
  MEDIA,
  EASE,
  enterAt,
  splitWordsIn,
} from "@/lib/gsap";

/** Conta da 0 al valore, una sola volta, quando entra in vista. */
function countUp(el: HTMLElement, trigger: Element) {
  const target = Number(el.dataset.number ?? el.textContent ?? 0);
  const obj = { v: 0 };
  return gsap.to(obj, {
    v: target,
    duration: 0.9,
    ease: "power2.out",
    onUpdate: () => {
      el.textContent = String(Math.round(obj.v));
    },
    scrollTrigger: enterAt(trigger, "top 80%"),
  });
}

export function Method({ numero = "03" }: { numero?: string }) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    (_, contextSafe) =>
      deferSetup(
        contextSafe,
        () => {
          const root = ref.current;
          if (!root) return;
          const steps = gsap.utils.toArray<HTMLElement>(
            "[data-method-step]",
            root,
          );
          const dots = gsap.utils.toArray<HTMLElement>("[data-dot-on]", root);
          const numbers = gsap.utils.toArray<HTMLElement>(
            "[data-number]",
            root,
          );
          const fillH = root.querySelector<HTMLElement>("[data-fill='h']");
          const fillV = root.querySelector<HTMLElement>("[data-fill='v']");
          const lightDots = (progress: number) => {
            dots.forEach((d, i) => {
              const on = progress >= i / (dots.length - 1) - 0.01;
              gsap.to(d, {
                opacity: on ? 1 : 0,
                scale: on ? 1 : 0.6,
                duration: 0.3,
                overwrite: true,
              });
            });
          };
          const mm = gsap.matchMedia();

          mm.add(MEDIA.desktop, () => {
            if (!fillH) return;
            gsap.set(dots, { opacity: 0, scale: 0.6 });
            const mt = root.querySelector<HTMLElement>("[data-method-head] h2");
            if (mt) splitWordsIn(mt);
            gsap.from("[data-method-head] p", {
              opacity: 0,
              y: 16,
              duration: 0.7,
              stagger: 0.08,
              scrollTrigger: enterAt(root),
            });
            gsap.from(steps, {
              opacity: 0,
              y: 16,
              duration: 0.6,
              stagger: 0.08,
              scrollTrigger: enterAt(root, "top 60%"),
            });
            // L’unico pin del sito: la sezione resta ferma finché la striscia non è piena
            gsap.fromTo(
              fillH,
              { scaleX: 0, transformOrigin: "left center" },
              {
                scaleX: 1,
                ease: EASE.scrub,
                scrollTrigger: {
                  trigger: root,
                  start: "top top+=68",
                  end: "+=90%",
                  pin: true,
                  scrub: 0.4,
                  onUpdate: (self) => lightDots(self.progress),
                },
              },
            );
            numbers.forEach((n) =>
              countUp(n, root.querySelector("[data-method-numbers]") ?? root),
            );
          });

          mm.add(MEDIA.mobile, () => {
            if (!fillV) return;
            gsap.set(dots, { opacity: 0, scale: 0.6 });
            const mt2 = root.querySelector<HTMLElement>(
              "[data-method-head] h2",
            );
            if (mt2) splitWordsIn(mt2);
            gsap.from("[data-method-head] p", {
              opacity: 0,
              y: 12,
              duration: 0.6,
              stagger: 0.08,
              scrollTrigger: enterAt(root),
            });
            steps.forEach((s) =>
              gsap.from(s, {
                opacity: 0,
                y: 14,
                duration: 0.55,
                scrollTrigger: enterAt(s, "top 85%"),
              }),
            );
            gsap.fromTo(
              fillV,
              { scaleY: 0, transformOrigin: "top center" },
              {
                scaleY: 1,
                ease: EASE.scrub,
                scrollTrigger: {
                  trigger: "[data-method-steps]",
                  start: "top 70%",
                  end: "bottom 60%",
                  scrub: 0.4,
                  onUpdate: (self) => lightDots(self.progress),
                },
              },
            );
            numbers.forEach((n) => countUp(n, n));
          });

          mm.add(MEDIA.reduce, () => {
            ScrollTrigger.refresh();
          });
        },
        240,
      ),
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      id="metodo"
      className="bg-ink py-20 text-paper lg:py-28"
      data-section="metodo"
    >
      <Container>
        <div
          className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
          data-method-head
        >
          <div>
            <SectionLabel numero={numero} testo="Metodo" onDark />
            <h2 className="h-display mt-6 text-[clamp(2rem,1rem+3.6vw,4.25rem)] text-paper">
              Come lavoriamo.
            </h2>
          </div>
          <p className="max-w-[30ch] text-[16px] leading-relaxed text-paper/70 md:text-right">
            Quattro passaggi, sempre gli stessi. Nessuna sorpresa in corso
            d’opera.
          </p>
        </div>

        <ol
          className="relative mt-16 grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-6 lg:mt-24"
          data-method-steps
        >
          {/* Linea: traccia grigia + striscia tricolore che si riempie con lo scroll */}
          <span
            aria-hidden="true"
            className="absolute left-[4px] top-0 h-full w-[3px] bg-paper/15 md:hidden"
          />
          <span
            aria-hidden="true"
            className="absolute left-[4px] top-0 h-full md:hidden"
          >
            <TricolorStripe vertical data-fill="v" />
          </span>
          <span
            aria-hidden="true"
            className="absolute left-0 top-[4px] hidden h-[3px] w-full bg-paper/15 md:block"
          />
          <span
            aria-hidden="true"
            className="absolute left-0 top-[4px] hidden w-full md:block"
          >
            <TricolorStripe data-fill="h" />
          </span>

          {methodSteps.map((s) => (
            <li
              key={s.n}
              className="relative pl-8 md:pl-0 md:pt-8"
              data-method-step
            >
              <span
                aria-hidden="true"
                className="absolute left-0 top-[7px] size-[11px] bg-paper/30 md:left-0 md:top-0"
              >
                <span data-dot-on className="absolute inset-0 bg-giallo" />
              </span>
              <p className="font-mono text-[12px] tracking-label text-paper/70">
                {s.n}
              </p>
              <h3 className="mt-3 font-display text-[26px] font-bold leading-none tracking-tightest">
                {s.title}
              </h3>
              <p className="mt-3 max-w-[26ch] text-[16px] leading-relaxed text-paper/75">
                {s.text}
              </p>
            </li>
          ))}
        </ol>

        <dl
          className="mt-20 grid grid-cols-1 gap-8 border-t border-paper/20 pt-10 sm:grid-cols-3 lg:mt-28"
          data-method-numbers
        >
          {methodNumbers.map((n) => (
            <div key={n.label} className="flex items-baseline gap-5 sm:block">
              <dd
                className="font-display text-[clamp(4rem,2rem+5vw,7rem)] font-bold leading-none tracking-tightest tabular-nums"
                data-number={n.value}
              >
                {n.value}
              </dd>
              <dt className="max-w-[22ch] text-[15px] leading-snug text-paper/70 sm:mt-3">
                {n.label}
              </dt>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
