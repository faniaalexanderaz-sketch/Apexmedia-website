import { gsap, ScrollTrigger } from "@/lib/gsap";

/** Abbastanza in vista: una parte del blocco (`part`), o una parte dello schermo se il blocco è più alto. */
export function seen(r: DOMRect, part = 0.6, screen = 0.5) {
  const h = window.innerHeight;
  const visible = Math.min(r.bottom, h) - Math.max(r.top, 0);
  return visible >= Math.min(r.height * part, h * screen);
}

type Options = {
  /** Durata totale in secondi (la timeline viene accelerata o rallentata per durare tanto) */
  seconds?: number;
  part?: number;
  screen?: number;
  /** Prima di armare: porta la scena allo stato di partenza */
  onArm?: () => void;
  /** Il blocco è già passato sopra: resta nello stato finale */
  onSkip?: () => void;
};

/**
 * Fa partire una timeline quando il blocco entra in vista, e la lascia finire da sola.
 * Due inneschi indipendenti, vince il primo: ScrollTrigger, e un IntersectionObserver che misura
 * il browser stesso. Il secondo non dipende da posizioni calcolate prima che la pagina finisse di
 * caricarsi: è quello che salva le animazioni nel browser interno di Instagram su iPhone.
 * Restituisce la funzione di pulizia.
 */
export function playWhenSeen(
  tl: gsap.core.Timeline,
  el: HTMLElement,
  { seconds, part = 0.6, screen = 0.5, onArm, onSkip }: Options = {},
) {
  if (seconds) tl.timeScale(tl.duration() / seconds);
  const r = el.getBoundingClientRect();
  if (r.bottom < 0) {
    tl.progress(1);
    onSkip?.();
    return () => {};
  }
  onArm?.();
  const play = () => {
    if (tl.progress() === 0 && !tl.isActive()) tl.play(0);
  };
  if (seen(r, part, screen)) {
    play();
    return () => {};
  }
  const st = ScrollTrigger.create({
    trigger: el,
    start: () =>
      el.offsetHeight * part > window.innerHeight * screen
        ? `top ${Math.round(100 - screen * 100)}%`
        : `top ${Math.round(100 - (el.offsetHeight * part * 100) / window.innerHeight)}%`,
    onEnter: play,
  });
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => seen(e.boundingClientRect, part, screen))) {
        play();
        io.disconnect();
      }
    },
    { threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] },
  );
  io.observe(el);
  return () => {
    st.kill();
    io.disconnect();
  };
}

/**
 * Ingresso dei dispositivi del portfolio: salgono con una leggera inclinazione in prospettiva
 * che si raddrizza, poi lo schermo si accende. Restituisce una timeline in pausa.
 */
export function deviceEntrance(scope: Element) {
  const bodies = scope.querySelectorAll<HTMLElement>("[data-device-body]");
  const offs = scope.querySelectorAll<HTMLElement>("[data-device-off]");
  const tl = gsap.timeline({ paused: true });
  tl.fromTo(
    bodies,
    { y: 48, rotateX: 18, transformPerspective: 1200, autoAlpha: 0 },
    {
      y: 0,
      rotateX: 0,
      autoAlpha: 1,
      duration: 1.15,
      ease: "power3.out",
      stagger: 0.14,
      clearProps: "transform",
    },
    0,
  ).fromTo(
    offs,
    { opacity: 1 },
    { opacity: 0, duration: 0.9, ease: "power2.out", stagger: 0.14 },
    0.45,
  );
  return tl;
}

/**
 * Solo con il mouse: passando sopra al dispositivo, il sito scorre dentro lo schermo
 * (screenshot a pagina intera); uscendo torna in cima. Restituisce la funzione di pulizia.
 */
export function hoverScroll(area: HTMLElement) {
  const viewport = area.querySelector<HTMLElement>("[data-browser-viewport]");
  const full = area.querySelector<HTMLImageElement>("[data-full-img]");
  if (!viewport || !full) return () => {};
  // Tailwind rende [hidden] !important: va tolto l’attributo. L’immagine pesante arriva solo adesso.
  full.removeAttribute("hidden");
  gsap.set(full, { autoAlpha: 0 });
  const travel = () => Math.max(0, full.offsetHeight - viewport.offsetHeight);
  let tween: gsap.core.Tween | null = null;
  const enter = () => {
    tween?.kill();
    gsap.to(full, { autoAlpha: 1, duration: 0.3 });
    tween = gsap.to(full, {
      y: -travel(),
      duration: Math.max(3, travel() / 260),
      ease: "power1.inOut",
    });
  };
  const leave = () => {
    tween?.kill();
    tween = gsap.to(full, {
      y: 0,
      duration: 0.9,
      ease: "power3.inOut",
      onComplete: () => {
        gsap.to(full, { autoAlpha: 0, duration: 0.25 });
      },
    });
  };
  area.addEventListener("mouseenter", enter);
  area.addEventListener("mouseleave", leave);
  return () => {
    area.removeEventListener("mouseenter", enter);
    area.removeEventListener("mouseleave", leave);
    tween?.kill();
  };
}
