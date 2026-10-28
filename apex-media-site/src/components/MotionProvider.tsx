"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const NAV_OFFSET = -72;

/**
 * Lenis solo su desktop (puntatore preciso, niente reduced-motion), agganciato al ticker di GSAP.
 * ScrollTrigger viene aggiornato a ogni scroll di Lenis e rinfrescato dopo font e immagini.
 */
export function MotionProvider() {
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh);

    const mq = window.matchMedia(
      "(min-width: 1024px) and (hover: hover) and (prefers-reduced-motion: no-preference)",
    );
    let lenis: Lenis | null = null;
    let tick: ((time: number) => void) | null = null;

    const onClick = (event: MouseEvent) => {
      if (!lenis) return;
      const a = (event.target as HTMLElement | null)?.closest<HTMLAnchorElement>("a[href]");
      if (!a) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || !url.hash) return;
      const target = document.querySelector(decodeURIComponent(url.hash));
      if (!target) return;
      event.preventDefault();
      history.pushState(null, "", url.hash);
      lenis.scrollTo(target as HTMLElement, { offset: NAV_OFFSET });
    };

    const start = () => {
      if (lenis) return;
      lenis = new Lenis({ autoRaf: false, lerp: 0.1, wheelMultiplier: 1 });
      lenis.on("scroll", ScrollTrigger.update);
      tick = (time: number) => lenis?.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      document.documentElement.classList.add("lenis-on");
      document.addEventListener("click", onClick);
    };
    const stop = () => {
      if (!lenis) return;
      if (tick) gsap.ticker.remove(tick);
      lenis.destroy();
      lenis = null;
      document.documentElement.classList.remove("lenis-on");
      document.removeEventListener("click", onClick);
    };
    const apply = () => (mq.matches ? start() : stop());
    apply();
    mq.addEventListener("change", apply);

    return () => {
      stop();
      mq.removeEventListener("change", apply);
      window.removeEventListener("load", refresh);
    };
  }, []);

  return null;
}
