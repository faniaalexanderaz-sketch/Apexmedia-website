"use client";

import { useRef } from "react";
import { Container } from "@/components/ui/Container";
import { portfolio } from "@/data/portfolio";
import {
  deferSetup,
  gsap,
  useGSAP,
  ScrollTrigger,
  MEDIA,
  enterAt,
} from "@/lib/gsap";

/** Loghi monocromi non disponibili: nomi in Space Grotesk (vedi segnaposto). */
export function ClientsBar() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    (_, contextSafe) =>
      deferSetup(
        contextSafe,
        () => {
          const root = ref.current;
          const track = root?.querySelector<HTMLUListElement>("[data-track]");
          if (!root || !track) return;
          const items = () => gsap.utils.toArray<HTMLElement>("li", track);
          const mm = gsap.matchMedia();

          mm.add(MEDIA.desktop, () => {
            gsap.from(items(), {
              opacity: 0,
              y: 10,
              duration: 0.6,
              stagger: 0.05,
              scrollTrigger: enterAt(root, "top 95%"),
            });
          });

          mm.add(MEDIA.mobile, () => {
            // Loop lento e continuo: duplico le voci e traslo la lista di metà larghezza
            const originals = items();
            gsap.from(originals, {
              opacity: 0,
              y: 8,
              duration: 0.5,
              stagger: 0.05,
              scrollTrigger: enterAt(root, "top 95%"),
            });
            const clones = originals.map((li) => {
              const c = li.cloneNode(true) as HTMLElement;
              c.setAttribute("aria-hidden", "true");
              track.appendChild(c);
              return c;
            });
            const wrap = track.parentElement as HTMLElement;
            gsap.set(wrap, { overflowX: "hidden" });
            const loop = gsap.to(track, {
              xPercent: -50,
              ease: "none",
              duration: 28,
              repeat: -1,
              paused: true,
            });
            ScrollTrigger.create({
              trigger: root,
              start: "top bottom",
              end: "bottom top",
              onToggle: (self) => (self.isActive ? loop.play() : loop.pause()),
            });
            return () => {
              clones.forEach((c) => c.remove());
              gsap.set(wrap, { clearProps: "overflowX" });
            };
          });
        },
        60,
      ),
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      aria-label="Alcune attività che seguiamo"
      className="border-y border-ink/10"
    >
      <Container className="flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:gap-10">
        <p className="label-mono shrink-0 text-ink/60">
          Alcune attività che seguiamo
        </p>
        <div className="no-scrollbar -mx-5 overflow-x-auto px-5 sm:-mx-8 sm:px-8 lg:mx-0 lg:flex-1 lg:px-0">
          <ul data-track className="flex w-max lg:w-full lg:justify-between">
            {portfolio.map((c) => (
              <li
                key={c.slug}
                className="shrink-0 whitespace-nowrap pr-10 font-display text-[20px] font-bold leading-none tracking-tightest text-ink/50 lg:pr-0"
                data-client-logo={c.slug}
              >
                {c.name}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
