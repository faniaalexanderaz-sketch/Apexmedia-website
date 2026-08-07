"use client";

import { useEffect, useState } from "react";

export function StickyCta() {
  const [visibile, setVisibile] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero");
    const form = document.getElementById("form");
    if (!hero || !form) return;

    const osservatoreHero = new IntersectionObserver(
      ([entry]) => setVisibile(!entry.isIntersecting),
      { rootMargin: "-10% 0px 0px 0px" }
    );
    const osservatoreForm = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisibile(false);
      },
      { threshold: 0.3 }
    );

    osservatoreHero.observe(hero);
    osservatoreForm.observe(form);

    return () => {
      osservatoreHero.disconnect();
      osservatoreForm.disconnect();
    };
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#070A12]/95 px-4 py-3 backdrop-blur transition-transform duration-300 sm:hidden ${
        visibile ? "translate-y-0" : "translate-y-full"
      }`}
      aria-hidden={!visibile}
    >
      <a
        href="#form"
        className="cta-yellow flex w-full items-center justify-center rounded-xl px-5 py-3.5 text-[15px] font-bold tracking-tight"
      >
        Richiedi il mio audit gratuito
      </a>
    </div>
  );
}
