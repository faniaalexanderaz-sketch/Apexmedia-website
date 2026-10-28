"use client";

import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { TricolorStripe } from "@/components/ui/TricolorStripe";
import { MenuIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { Clock } from "@/components/Clock";
import { navLinks, site } from "@/data/site";
import { gsap, useGSAP, ScrollTrigger, MEDIA } from "@/lib/gsap";

export function Nav() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const openRef = useRef(false);
  const hideTween = useRef<gsap.core.Tween | null>(null);
  useEffect(() => {
    openRef.current = open;
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (open) hideTween.current?.reverse();
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useGSAP(
    () => {
      const header = ref.current;
      if (!header) return;
      const mm = gsap.matchMedia();
      mm.add([MEDIA.desktop, MEDIA.mobile], () => {
        // Si nasconde scendendo, riappare salendo
        hideTween.current = gsap.to(header, { yPercent: -100, duration: 0.45, ease: "power3.out", paused: true });
        ScrollTrigger.create({
          start: 0,
          end: "max",
          onUpdate: (self) => {
            if (openRef.current) return;
            if (self.direction === 1 && self.scroll() > 120) hideTween.current?.play();
            else hideTween.current?.reverse();
          },
        });
        // La striscia tricolore è la barra di avanzamento della pagina
        gsap.fromTo(
          "[data-progress]",
          { scaleX: 0, transformOrigin: "left center" },
          { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } },
        );
        return () => {
          hideTween.current = null;
        };
      });
    },
    { scope: ref },
  );

  return (
    <header ref={ref} className="fixed inset-x-0 top-0 z-50 bg-paper" data-nav>
      <div className="mx-auto flex h-nav w-full max-w-[1480px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
        <Logo />

        <nav aria-label="Sezioni del sito" className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="u-draw text-[15px] font-medium text-ink/75 hover:text-ink">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2 sm:gap-5">
          <Clock className="hidden lg:inline" />
          <Button href="/#contatti" size="sm">
            Prenota la call
          </Button>
          <button
            type="button"
            className="-mr-2 inline-flex size-11 items-center justify-center text-ink lg:hidden"
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? "Chiudi il menu" : "Apri il menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <MenuIcon open={open} />
          </button>
        </div>
      </div>
      <div className="h-px w-full bg-ink/10" />
      <TricolorStripe data-progress="page" />

      {/* Pannello mobile a tutta pagina */}
      <div
        id="menu-mobile"
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-[calc(var(--nav-h)+4px)] z-40 flex flex-col bg-paper lg:hidden"
      >
        <nav aria-label="Sezioni del sito (mobile)" className="px-5 pt-6 sm:px-8">
          <ul className="divide-y divide-ink/10 border-y border-ink/10">
            {navLinks.map((l, i) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex items-baseline gap-4 py-4 font-display text-[40px] font-bold leading-none tracking-tightest text-ink"
                >
                  <span className="font-mono text-[11px] tracking-label text-blu-deep">0{i + 1}</span>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto space-y-4 px-5 pb-8 sm:px-8">
          <a href={site.whatsappUrl} className="inline-flex items-center gap-2 text-[17px] font-medium text-ink">
            <WhatsAppIcon /> {site.whatsappDisplay}
          </a>
          <p className="label-mono text-ink/60">
            <span className="mr-2 inline-block size-2 rounded-full bg-verde align-middle" />
            {site.responseTime}
          </p>
        </div>
      </div>
    </header>
  );
}
