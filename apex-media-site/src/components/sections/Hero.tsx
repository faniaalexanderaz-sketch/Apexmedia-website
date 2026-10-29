"use client";

import { useRef } from "react";
import { Container } from "@/components/ui/Container";
import { GridLines } from "@/components/ui/GridLines";
import { Button } from "@/components/ui/Button";
import { BrowserFrame } from "@/components/ui/BrowserFrame";
import { PhoneFrame } from "@/components/ui/PhoneFrame";
import { portfolio } from "@/data/portfolio";
import { site } from "@/data/site";
import {
  gsap,
  useGSAP,
  SplitText,
  ScrollTrigger,
  MEDIA,
  EASE,
  CLIP_HIDDEN_BOTTOM,
  CLIP_VISIBLE,
} from "@/lib/gsap";

const ROTATE_EVERY = 4;
const FADE = 0.6;

const PRE_HIDDEN =
  '[data-hero-label], [data-hero-title], [data-hero-sub], [data-hero-cta] > *, [data-hero-24h], [data-hero-shot="0"] [data-phone-frame], [data-hero-shot="0"] figcaption';

/**
 * Tutto il movimento dell’hero, uguale su desktop e mobile. Solo su desktop: i clienti cambiano anche
 * con lo scroll (hero sticky alto due schermate) e cornice e telefono seguono il mouse.
 * Viene chiamato un frame dopo l’idratazione.
 */
function setup(root: HTMLElement) {
  const h1 = root.querySelector<HTMLHeadingElement>("h1");
  const shots = gsap.utils.toArray<HTMLElement>("[data-hero-shot]", root);
  const firstFrame = shots[0]?.querySelector("[data-browser-frame]");
  const firstPhone = shots[0]?.querySelector("[data-phone-frame]");
  const caption = shots[0]?.querySelector("figcaption");
  if (!h1 || !firstFrame || !firstPhone) return;

  /** Rende visibili (ma trasparenti) gli altri screenshot dopo l’ingresso, così si precaricano. */
  const prepShots = () =>
    gsap.delayedCall(2.4, () => {
      shots.forEach((s, i) => {
        if (i === 0) return;
        s.removeAttribute("hidden");
        gsap.set(s, { autoAlpha: 0 });
      });
    });

  /** Cambio cliente: ogni 4 s da fermo; su desktop anche lo scroll nell’hero porta al cliente successivo. */
  const rotator = (scrollDriven: boolean) => {
    let idx = 0;
    const show = (i: number) => {
      if (i === idx) return;
      const cur = shots[idx];
      idx = i;
      const nxt = shots[idx];
      gsap.to(cur, {
        autoAlpha: 0,
        duration: FADE,
        ease: "power2.inOut",
        overwrite: true,
      });
      gsap.fromTo(
        nxt,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: FADE, ease: "power2.inOut", overwrite: true },
      );
      loop.restart();
    };
    const loop = gsap.timeline({ repeat: -1, paused: true });
    loop
      .to({}, { duration: ROTATE_EVERY })
      .call(() => show((idx + 1) % shots.length));
    ScrollTrigger.create({
      trigger: root,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) =>
        self.isActive && !document.hidden ? loop.play() : loop.pause(),
    });
    if (scrollDriven) {
      ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) =>
          show(
            Math.min(
              shots.length - 1,
              Math.floor(self.progress * shots.length),
            ),
          ),
      });
    }
    const onVis = () => (document.hidden ? loop.pause() : loop.play());
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  };

  /** Titolo: righe che salgono da una maschera + evidenziatore che si disegna da sinistra. */
  const splitTitle = () =>
    SplitText.create(h1, {
      type: "lines",
      mask: "lines",
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
        const tl = gsap.timeline();
        tl.from(self.lines, {
          yPercent: 100,
          duration: 0.8,
          ease: EASE.reveal,
          stagger: 0.08,
        });
        tl.from(
          inks,
          { scaleX: 0, duration: 0.55, ease: EASE.enter, stagger: 0.12 },
          "-=0.45",
        );
        return tl;
      },
    });

  const mm = gsap.matchMedia();

  mm.add({ desktop: MEDIA.desktop, mobile: MEDIA.mobile }, (ctx) => {
    const desktop = Boolean(ctx.conditions?.desktop);

    // Il CSS li tiene nascosti fino a qui: l’opacità inline torna a 1 e i tween partono da 0 nello stesso tick
    gsap.set(root.querySelectorAll(PRE_HIDDEN), {
      opacity: 1,
      clearProps: "animation",
    });
    prepShots();

    // Timeline d’ingresso, 1,2 s in tutto
    const tl = gsap.timeline({ defaults: { ease: EASE.enter } });
    tl.from("[data-hero-label]", { opacity: 0, duration: 0.5 }, 0);
    const split = splitTitle();
    tl.from(
      ["[data-hero-sub]", "[data-hero-cta] > *", "[data-hero-24h]"],
      { y: 16, opacity: 0, duration: 0.6, stagger: 0.06 },
      0.35,
    );
    tl.fromTo(
      firstFrame,
      { clipPath: CLIP_HIDDEN_BOTTOM },
      {
        clipPath: CLIP_VISIBLE,
        duration: 0.9,
        ease: EASE.reveal,
        clearProps: "clipPath",
      },
      0.25,
    );
    tl.fromTo(
      firstPhone,
      {
        clipPath: CLIP_HIDDEN_BOTTOM,
        rotation: 4,
        transformOrigin: "bottom left",
      },
      {
        clipPath: CLIP_VISIBLE,
        rotation: 0,
        duration: 0.8,
        ease: EASE.reveal,
        clearProps: "clipPath",
      },
      0.4,
    );
    if (caption) tl.from(caption, { opacity: 0, duration: 0.5 }, 0.7);

    if (desktop) {
      root.dataset.scrollHero = "true";
      ScrollTrigger.refresh();
    }
    const stopRotator = rotator(desktop);

    // Solo desktop: cornice e telefono seguono il mouse di pochissimo (profondità)
    let stopMouse: (() => void) | undefined;
    if (desktop) {
      const frames = gsap.utils.toArray<HTMLElement>(
        "[data-browser-frame]",
        root,
      );
      const phones = gsap.utils.toArray<HTMLElement>(
        "[data-phone-frame]",
        root,
      );
      const fx = gsap.quickTo(frames, "x", { duration: 0.6, ease: "power3" });
      const fy = gsap.quickTo(frames, "y", { duration: 0.6, ease: "power3" });
      const px = gsap.quickTo(phones, "x", { duration: 0.8, ease: "power3" });
      const py = gsap.quickTo(phones, "y", { duration: 0.8, ease: "power3" });
      const onMove = (e: MouseEvent) => {
        const r = root.getBoundingClientRect();
        const nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        const ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
        fx(nx * 4);
        fy(ny * 4);
        px(nx * 8);
        py(ny * 8);
      };
      const onLeave = () => {
        fx(0);
        fy(0);
        px(0);
        py(0);
      };
      root.addEventListener("mousemove", onMove);
      root.addEventListener("mouseleave", onLeave);
      stopMouse = () => {
        root.removeEventListener("mousemove", onMove);
        root.removeEventListener("mouseleave", onLeave);
      };
    }

    return () => {
      stopMouse?.();
      stopRotator();
      split.revert();
      h1.classList.remove("is-split");
      delete root.dataset.scrollHero;
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
    <section ref={ref} id="top" className="relative" data-hero>
      <div className="relative overflow-hidden lg:sticky lg:top-[calc(var(--nav-h)+4px)]">
        <GridLines />
        <Container className="relative">
          <div className="grid min-h-[calc(100svh-var(--nav-h)-4px)] grid-cols-1 items-center gap-10 py-12 lg:grid-cols-12 lg:gap-8 lg:py-16">
            <div className="lg:col-span-7">
              <p className="label-mono text-ink/60" data-hero-label>
                Agenzia di marketing — Alessandria
              </p>
              <h1
                className="h-display mt-6 text-[clamp(2.75rem,1rem+7vw,6.5rem)] text-ink"
                data-hero-title
              >
                Il marketing che fa{" "}
                <span className="hl">squillare il telefono.</span>
              </h1>
              <p
                className="text-body mt-7 max-w-[34rem] text-[17px] text-ink/80 md:text-lg"
                data-hero-sub
              >
                Social, video, pubblicità e siti web per attività locali. Un
                solo team, dal primo contenuto al cliente che ti chiama.
              </p>
              <div
                className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4"
                data-hero-cta
              >
                <Button
                  href="#contatti"
                  data-track="click_cta"
                  data-track-posizione="hero"
                >
                  Prenota la call gratuita
                </Button>
                <Button
                  href="#lavori"
                  variant="link"
                  data-track="click_portfolio"
                  data-track-cliente="hero"
                >
                  Guarda i lavori
                </Button>
              </div>
              <p
                className="label-mono mt-8 flex items-center gap-2 text-ink/60"
                data-hero-24h
              >
                <span
                  className="size-2 rounded-full bg-verde"
                  aria-hidden="true"
                />
                {site.responseTime}
              </p>
            </div>

            <div className="relative lg:col-span-5" data-hero-shots>
              {/* Ogni blocco (cornice + telefono + didascalia) ha la stessa geometria: il primo è in flusso,
                  gli altri sono sovrapposti. Il padding in basso lascia spazio al telefono che sporge. */}
              <div className="pl-6 sm:pl-10 lg:pl-0">
                <div className="relative">
                  {portfolio.map((item, i) => (
                    <div
                      key={item.slug}
                      data-hero-shot={i}
                      hidden={i !== 0}
                      className={`pb-[28%] lg:pb-[23%] ${i === 0 ? "relative" : "absolute inset-x-0 top-0"}`}
                    >
                      <BrowserFrame
                        url={item.domain}
                        shot={item.shots.desktop}
                        alt={`Home page del sito ${item.name} su desktop`}
                        priority={i === 0}
                        sizes="(min-width: 1024px) 42vw, 92vw"
                      />
                      <PhoneFrame
                        shot={item.shots.mobile}
                        alt={`Home page del sito ${item.name} su smartphone`}
                        sizes="(min-width: 1024px) 10vw, 24vw"
                        className="absolute bottom-0 left-0 w-[28%] lg:-left-8 lg:w-[24%]"
                      />
                      <figcaption className="label-mono absolute bottom-0 left-[34%] text-ink/60 lg:left-auto lg:right-0 lg:text-right">
                        {item.caption}
                      </figcaption>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
