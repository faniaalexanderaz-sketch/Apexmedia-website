"use client";

import { useRef } from "react";
import { Container } from "@/components/ui/Container";
import { GridLines } from "@/components/ui/GridLines";
import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { site } from "@/data/site";
import { heroPhone } from "@/data/hero";
import dynamic from "next/dynamic";
import { SceneSlot } from "@/components/three/SceneSlot";

/* Il telefono 3D arriva dopo il titolo: non pesa sul primo caricamento */
const HeroPhone = dynamic(() => import("@/components/three/HeroPhone"), {
  ssr: false,
});
import { gsap, useGSAP, SplitText, MEDIA, EASE } from "@/lib/gsap";

const PRE_HIDDEN =
  "[data-hero-label], [data-hero-title], [data-hero-sub], [data-hero-cta] > *, [data-hero-foot]";

/**
 * Ingresso dell’hero, in ordine: etichette, titolo riga per riga da una maschera, sottotitolo,
 * pulsante, link, piede. Poi, scorrendo, il titolo sale appena più lento della pagina.
 * Viene chiamato un frame dopo l’idratazione.
 */
function setup(root: HTMLElement) {
  const h1 = root.querySelector<HTMLHeadingElement>("h1");
  if (!h1) return;

  const mm = gsap.matchMedia();
  mm.add([MEDIA.desktop, MEDIA.mobile], () => {
    // Il CSS li tiene nascosti fino a qui: l’opacità inline torna a 1 e i tween partono da 0 nello stesso tick
    gsap.set(root.querySelectorAll(PRE_HIDDEN), {
      opacity: 1,
      clearProps: "animation",
    });

    const tl = gsap.timeline({ defaults: { ease: EASE.enter } });
    tl.from(
      "[data-hero-label]",
      { opacity: 0, duration: 0.6, stagger: 0.1 },
      0,
    );

    // Titolo: righe che salgono da una maschera + evidenziatore che si disegna da sinistra
    const split = SplitText.create(h1, {
      type: "lines",
      mask: "lines",
      linesClass: "split-line",
      autoSplit: true,
      onSplit: (self) => {
        h1.classList.add("is-split");
        const inks: HTMLElement[] = [];
        h1.querySelectorAll<HTMLElement>(".hl").forEach((hl) => {
          let ink = hl.querySelector<HTMLElement>(".hl-ink");
          if (!ink) {
            ink = document.createElement("i");
            ink.className = "hl-ink";
            ink.setAttribute("aria-hidden", "true");
            hl.prepend(ink);
          }
          inks.push(ink);
        });
        const t = gsap.timeline();
        t.from(
          self.lines,
          { yPercent: 110, duration: 1.15, ease: EASE.title, stagger: 0.11 },
          0.1,
        );
        t.from(
          inks,
          { scaleX: 0, duration: 0.6, ease: EASE.enter, stagger: 0.12 },
          "-=0.6",
        );
        return t;
      },
    });

    tl.from("[data-hero-sub]", { y: 20, opacity: 0, duration: 0.7 }, 0.8);
    tl.from(
      "[data-hero-cta] > *",
      { y: 20, opacity: 0, duration: 0.7, stagger: 0.12 },
      0.95,
    );
    tl.from("[data-hero-foot]", { opacity: 0, duration: 0.7 }, 1.3);
    tl.from("[data-hero-note]", { opacity: 0, duration: 0.7 }, 1.4);

    // Uscita: solo il titolo scorre un po’ più lento, così l’hero “resta” un attimo.
    // (Non tutto il blocco: con il telefono dentro finirebbe sopra la riga in fondo.)
    gsap.to("[data-hero-title]", {
      yPercent: 4,
      ease: EASE.scrub,
      scrollTrigger: {
        trigger: root,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    return () => {
      split.revert();
      h1.classList.remove("is-split");
    };
  });
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const root = ref.current;
      if (!root || !contextSafe) return;
      // Dopo il primo paint successivo all’idratazione (rAF = prima del paint, il timeout = dopo)
      let timer: number | undefined;
      const raf = requestAnimationFrame(() => {
        timer = window.setTimeout(
          contextSafe(() => setup(root)),
          0,
        );
      });
      return () => {
        cancelAnimationFrame(raf);
        if (timer !== undefined) window.clearTimeout(timer);
      };
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id="top" className="relative overflow-hidden" data-hero>
      <GridLines />
      <div className="grain" aria-hidden="true" />
      <Container className="relative flex min-h-[calc(100svh-var(--nav-h)-4px)] flex-col pb-6 pt-8 lg:pb-8 lg:pt-10">
        <div className="flex items-center justify-between gap-6">
          <p className="label-mono text-ink/60" data-hero-label>
            Agenzia di marketing — Alessandria
          </p>
          <p className="label-mono hidden text-ink/60 md:block" data-hero-label>
            Siti web · Campagne · Social · Video
          </p>
        </div>

        <div
          className="my-auto grid grid-cols-1 items-center gap-6 py-8 lg:grid-cols-12 lg:gap-8 lg:py-10"
          data-hero-body
        >
          <div className="lg:col-span-7">
            <h1
              className="h-display text-[clamp(2.6rem,0.4rem+7.4vw,8rem)] leading-[0.94] text-ink"
              data-hero-title
            >
              Il marketing che fa{" "}
              <span className="hl">squillare il telefono.</span>
            </h1>

            <div className="mt-8 grid grid-cols-1 gap-8 lg:mt-10">
              <p
                className="text-body max-w-[34rem] text-[17px] text-ink/80 md:text-xl"
                data-hero-sub
              >
                Social, video, pubblicità e siti web per attività locali. Un
                solo team, dal primo contenuto al cliente che ti chiama.
              </p>
              <div
                className="flex flex-wrap items-center gap-x-8 gap-y-4"
                data-hero-cta
              >
                <Magnetic>
                  <Button
                    href="#contatti"
                    className="min-h-14 px-8 text-[17px]"
                    data-track="click_cta"
                    data-track-posizione="hero"
                  >
                    Prenota la call gratuita
                  </Button>
                </Magnetic>
                <Button
                  href="#showcase"
                  variant="link"
                  data-track="click_portfolio"
                  data-track-cliente="hero"
                >
                  Guarda i lavori
                </Button>
              </div>
            </div>
          </div>

          {/* Il telefono che riceve richieste: una simulazione, e lo dice */}
          <figure className="relative lg:col-span-5" data-hero-phone>
            <div className="-mx-5 h-[400px] sm:-mx-8 sm:h-[460px] lg:mx-0 lg:h-[min(70svh,640px)]">
              <SceneSlot
                className="h-full w-full"
                quietFallback
                mountDelay={350}
                fallback={{
                  src: "/hero/telefono.webp",
                  width: 900,
                  height: 1100,
                }}
                alt="Un telefono riceve richieste di preventivo, prenotazioni e chiamate"
              >
                {(onReady) => <HeroPhone onReady={onReady} />}
              </SceneSlot>
            </div>
            <figcaption
              className="mx-auto mt-1 max-w-[34ch] text-center text-[13px] leading-snug text-ink/50"
              data-hero-note
            >
              {heroPhone.note}
            </figcaption>
          </figure>
        </div>

        <div
          className="flex items-end justify-between gap-6 border-t border-ink/10 pt-5"
          data-hero-foot
        >
          <p className="label-mono flex items-center gap-2 text-ink/60">
            <span className="size-2 rounded-full bg-verde" aria-hidden="true" />
            {site.responseTime}
          </p>
          <a
            href="#certificazioni"
            className="label-mono group flex items-center gap-3 text-ink/60 hover:text-ink"
            aria-label="Scorri alla sezione successiva"
          >
            Scorri
            <span className="scroll-hint" aria-hidden="true" />
          </a>
        </div>
      </Container>
    </section>
  );
}
