"use client";

import { useRef } from "react";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { team, teamIntro, showTeam } from "@/data/team";
import { deferSetup, gsap, useGSAP, MEDIA, EASE, enterAt, CLIP_HIDDEN_BOTTOM, CLIP_VISIBLE } from "@/lib/gsap";

/** Si mostra solo quando in team.ts ci sono le foto di entrambi. */
export function Team() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    (_, contextSafe) =>
      deferSetup(contextSafe, () => {
      const root = ref.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add(MEDIA.desktop, () => {
        gsap.from("[data-team-head] > *", { opacity: 0, y: 16, duration: 0.7, stagger: 0.08, scrollTrigger: enterAt(root) });
        gsap.utils.toArray<HTMLElement>("[data-photo]", root).forEach((wrap) => {
          const img = wrap.querySelector("img");
          gsap.fromTo(wrap, { clipPath: CLIP_HIDDEN_BOTTOM }, { clipPath: CLIP_VISIBLE, duration: 0.9, ease: EASE.reveal, clearProps: "clipPath", scrollTrigger: enterAt(wrap, "top 85%") });
          if (img)
            gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: EASE.scrub, scrollTrigger: { trigger: wrap, start: "top bottom", end: "bottom top", scrub: true } });
        });
      });
      mm.add(MEDIA.mobile, () => {
        gsap.from("[data-team-head] > *", { opacity: 0, y: 12, duration: 0.6, stagger: 0.08, scrollTrigger: enterAt(root) });
        gsap.from("[data-photo]", { opacity: 0, y: 16, duration: 0.6, stagger: 0.1, scrollTrigger: enterAt(root, "top 70%") });
      });
      }, 340),
    { scope: ref },
  );

  if (!showTeam) return null;

  return (
    <section ref={ref} id="chi-siamo" className="border-t border-ink/10 py-20 lg:py-28" data-section="chi-siamo">
      <Container>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5" data-team-head>
            <SectionLabel numero="05" testo="Chi siamo" />
            <h2 className="h-display mt-6 text-[clamp(2rem,1rem+3.6vw,4.25rem)]">Dietro Apex ci siamo noi.</h2>
            <p className="text-body mt-6 text-ink/80 md:text-lg">{teamIntro}</p>
          </div>
          <ul className="grid grid-cols-2 gap-4 lg:col-span-7 lg:gap-6">
            {team.map((m) => (
              <li key={m.name}>
                {m.photo ? (
                  <div className="aspect-[3/4] overflow-hidden" data-photo>
                    <Image
                      src={m.photo.src}
                      width={m.photo.width}
                      height={m.photo.height}
                      alt={`${m.name}, ${m.role}`}
                      sizes="(min-width: 1024px) 28vw, 45vw"
                      className="h-full w-full scale-[1.12] object-cover"
                    />
                  </div>
                ) : null}
                <p className="mt-4 font-display text-[20px] font-bold leading-none tracking-tightest">{m.name}</p>
                <p className="label-mono mt-2 text-ink/60">{m.role}</p>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
