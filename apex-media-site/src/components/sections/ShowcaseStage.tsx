"use client";

import { useRef } from "react";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { MacBook } from "@/components/ui/MacBook";
import { ExternalIcon } from "@/components/ui/Icons";
import type { Shot } from "@/data/portfolio";
import {
  deferSetup,
  gsap,
  useGSAP,
  ScrollTrigger,
  MEDIA,
  enterAt,
  splitLinesIn,
  refreshSoon,
} from "@/lib/gsap";

export type StageItem = {
  name: string;
  work: string;
  url: string;
  domain: string;
  shot: Shot;
};

/** Quanto scorre ogni sito dentro lo schermo, al massimo, in altezze di schermo. */
const MAX_SCREENS = 4.2;

const two = (n: number) => String(n).padStart(2, "0");

export function ShowcaseStage({ items }: { items: StageItem[] }) {
  const ref = useRef<HTMLElement>(null);
  const n = items.length;

  useGSAP(
    (_, contextSafe) =>
      deferSetup(
        contextSafe,
        () => {
          const root = ref.current;
          if (!root) return;
          const q = gsap.utils.selector(root);
          const pin = q("[data-showcase-pin]")[0] as HTMLElement | undefined;
          const mac = q("[data-mac]")[0] as HTMLElement | undefined;
          const lid = q("[data-mac-lid]")[0] as HTMLElement | undefined;
          const screen = q("[data-mac-screen]")[0] as HTMLElement | undefined;
          const veil = q("[data-mac-veil]")[0] as HTMLElement | undefined;
          const slides = q("[data-slide]") as HTMLElement[];
          const tracks = q("[data-slide-track]") as HTMLElement[];
          const infos = q("[data-showcase-item]") as HTMLElement[];
          const count = q("[data-showcase-count]")[0] as HTMLElement | undefined;
          const bar = q("[data-showcase-bar]")[0] as HTMLElement | undefined;
          if (!pin || !mac || !lid || !screen || !veil || slides.length === 0)
            return;

          /** Di quanto può salire lo screenshot i-esimo dentro lo schermo. */
          const travel = (i: number) => {
            const h = screen.clientHeight;
            return -Math.max(
              0,
              Math.min(tracks[i].offsetHeight - h, h * MAX_SCREENS),
            );
          };
          const mark = (i: number, progress: number) => {
            if (count) count.textContent = two(i + 1);
            if (bar) gsap.set(bar, { scaleX: progress });
          };

          /**
           * Stessa sequenza per desktop (legata allo scroll) e mobile (in loop):
           * il sito scorre in verticale, poi il successivo sale da sotto e lo copre, e la scheda di testo cambia.
           * Con `wrap` l’ultimo sito torna al primo, così il loop non ha salti.
           */
          const build = (
            tl: gsap.core.Timeline,
            scroll: number,
            swap: number,
            wrap: boolean,
          ) => {
            tl.set(slides, { autoAlpha: 1 }, 0)
              .set(slides.slice(1), { yPercent: 100, zIndex: 0 }, 0)
              .set(slides[0], { yPercent: 0, zIndex: 1 }, 0)
              .set(infos.slice(1), { autoAlpha: 0 }, 0)
              .set(infos[0], { autoAlpha: 1, y: 0 }, 0);
            let t = 0;
            slides.forEach((slide, i) => {
              tl.fromTo(
                tracks[i],
                { y: 0 },
                {
                  y: () => travel(i),
                  duration: scroll,
                  ease: wrap ? "sine.inOut" : "none",
                  immediateRender: false,
                },
                t,
              );
              t += scroll;
              if (i === slides.length - 1 && !wrap) return;
              const nx = (i + 1) % slides.length;
              tl.set(tracks[nx], { y: 0 }, t)
                .set(slide, { zIndex: 1 }, t)
                .set(slides[nx], { zIndex: 2 }, t)
                .fromTo(
                  slides[nx],
                  { yPercent: 100 },
                  {
                    yPercent: 0,
                    duration: swap,
                    ease: "power3.inOut",
                    immediateRender: false,
                  },
                  t,
                )
                .to(
                  infos[i],
                  {
                    autoAlpha: 0,
                    y: -14,
                    duration: swap * 0.4,
                    ease: "power2.in",
                  },
                  t,
                )
                .fromTo(
                  infos[nx],
                  { autoAlpha: 0, y: 14 },
                  {
                    autoAlpha: 1,
                    y: 0,
                    duration: swap * 0.5,
                    ease: "power2.out",
                    immediateRender: false,
                  },
                  t + swap * 0.5,
                )
                .set(slide, { yPercent: 100, zIndex: 0 }, t + swap);
              t += swap;
            });
            return (time: number) =>
              Math.floor((time + swap / 2) / (scroll + swap)) % slides.length;
          };

          const mm = gsap.matchMedia();
          mm.add(
            { desktop: MEDIA.desktop, mobile: MEDIA.mobile },
            (ctx) => {
              const desktop = Boolean(ctx.conditions?.desktop);

              const title = q("h2")[0];
              const split = title ? splitLinesIn(title, root) : null;
              gsap.from(q("[data-showcase-fade]"), {
                opacity: 0,
                y: 16,
                duration: 0.7,
                stagger: 0.08,
                scrollTrigger: enterAt(root),
              });

              // Il coperchio si apre mentre la sezione sale: da chiuso (ripiegato in avanti) ad aperto
              gsap
                .timeline({
                  defaults: { ease: "none" },
                  scrollTrigger: {
                    // Parte quando il portatile spunta dal basso e finisce poco prima che la sezione si fermi
                    trigger: mac,
                    start: "top 98%",
                    end: "top 38%",
                    scrub: 0.5,
                  },
                })
                .fromTo(lid, { rotateX: -84 }, { rotateX: 0, duration: 1 }, 0)
                .fromTo(
                  veil,
                  { opacity: 1 },
                  { opacity: 0, duration: 0.45 },
                  0.55,
                );

              if (desktop) {
                // Sezione fissata: lo scroll fa avanzare i siti dentro lo schermo
                const tl = gsap.timeline({ defaults: { ease: "none" } });
                const indexAt = build(tl, 1, 0.32, false);
                ScrollTrigger.create({
                  animation: tl,
                  trigger: pin,
                  start: "top top",
                  end: () => "+=" + Math.round(window.innerHeight * 0.95 * n),
                  pin: true,
                  scrub: 0.5,
                  anticipatePin: 1,
                  invalidateOnRefresh: true,
                  onUpdate: (self) => mark(indexAt(tl.time()), self.progress),
                });
                mark(0, 0);
                refreshSoon();
              } else {
                // Mobile e tablet: niente pin, i siti scorrono da soli in loop finché il portatile è in vista
                const loop = gsap.timeline({
                  repeat: -1,
                  paused: true,
                  defaults: { ease: "none" },
                });
                const indexAt = build(loop, 6.5, 0.9, true);
                loop.eventCallback("onUpdate", () =>
                  mark(indexAt(loop.time()), loop.progress()),
                );
                mark(0, 0);
                ScrollTrigger.create({
                  trigger: mac,
                  start: "top bottom",
                  end: "bottom top",
                  onToggle: (self) =>
                    self.isActive ? loop.play() : loop.pause(),
                });
              }

              return () => {
                split?.revert();
              };
            },
          );
        },
        100,
      ),
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      id="showcase"
      className="relative"
      data-section="showcase"
      aria-labelledby="showcase-title"
    >
      <div
        data-showcase-pin
        className="flex flex-col justify-center py-20 lg:min-h-svh lg:pb-12 lg:pt-[calc(var(--nav-h)+40px)]"
      >
        <Container>
          {/* Mobile: titolo, portatile, scheda. Desktop: titolo e scheda a sinistra, portatile a destra su due righe */}
          <div className="grid grid-cols-1 gap-y-10 lg:grid-cols-12 lg:grid-rows-[auto_auto] lg:items-center lg:gap-x-8 lg:gap-y-12">
            <div className="lg:col-span-4 lg:row-start-1 lg:self-end">
              <p className="label-mono text-ink/60" data-showcase-fade>
                Siti in evidenza
              </p>
              <h2
                id="showcase-title"
                className="h-display mt-6 text-[clamp(2rem,1rem+2.6vw,3.5rem)]"
              >
                I nostri siti, visti da vicino.
              </h2>
            </div>

            <div
              className="lg:col-span-8 lg:col-start-5 lg:row-span-2 lg:row-start-1 lg:pl-6"
              data-showcase-fade
            >
              <MacBook className="mx-auto lg:max-w-[min(100%,calc((100svh-200px)/0.6))]">
                {items.map((item, i) => (
                  <div
                    key={item.url}
                    data-slide
                    className="absolute inset-0 overflow-hidden"
                  >
                    <div data-slide-track className="will-change-transform">
                      <Image
                        src={item.shot.src}
                        width={item.shot.width}
                        height={item.shot.height}
                        alt={
                          i === 0 ? `Il sito ${item.name}, a pagina intera` : ""
                        }
                        aria-hidden={i === 0 ? undefined : true}
                        loading="lazy"
                        sizes="(min-width: 1024px) 50vw, 45vw"
                        className="block h-auto w-full"
                        onLoad={() => refreshSoon(250)}
                      />
                    </div>
                  </div>
                ))}
              </MacBook>
            </div>

            <div className="lg:col-span-4 lg:row-start-2 lg:self-start">
              <ul data-showcase-info role="list">
                {items.map((item) => (
                  <li key={item.url} data-showcase-item>
                    <h3 className="font-display text-[clamp(1.625rem,1rem+1.6vw,2.5rem)] font-bold leading-[1.02] tracking-tightest">
                      {item.name}
                    </h3>
                    <p className="mt-3 max-w-[34ch] text-[16px] leading-relaxed text-ink/75 md:text-[17px]">
                      {item.work}
                    </p>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="u-link mt-6 inline-flex min-h-11 items-center gap-2 text-[16px] font-semibold text-ink hover:text-viola"
                      data-track="click_portfolio"
                      data-track-cliente={item.name}
                      aria-label={`Vedi il sito di ${item.name} (si apre in una nuova scheda)`}
                    >
                      Vedi il sito
                      <ExternalIcon />
                    </a>
                  </li>
                ))}
              </ul>

              <div
                data-showcase-progress
                className="mt-10 items-center gap-4"
                aria-hidden="true"
              >
                <p className="label-mono shrink-0 text-ink/60">
                  <span data-showcase-count className="text-ink">
                    01
                  </span>{" "}
                  / {two(n)}
                </p>
                <span className="relative block h-px flex-1 bg-ink/15">
                  <span
                    data-showcase-bar
                    className="absolute inset-0 origin-left scale-x-0 bg-ink"
                  />
                </span>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
