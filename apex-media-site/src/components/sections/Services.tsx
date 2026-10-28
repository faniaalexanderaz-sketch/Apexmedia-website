"use client";

import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { PlusIcon } from "@/components/ui/Icons";
import { services } from "@/data/services";

export function Services() {
  const [active, setActive] = useState(0);

  return (
    <section id="servizi" className="border-t border-ink/10 py-20 lg:py-28" data-section="servizi">
      <Container>
        <SectionLabel numero="02" testo="Servizi" />
        <h2 className="h-display mt-6 text-[clamp(2rem,1rem+3.6vw,4.25rem)]">Cosa facciamo.</h2>

        {/* Desktop: nomi a sinistra, pannello a destra */}
        <div className="mt-12 hidden grid-cols-12 gap-8 lg:grid" data-services-desktop>
          <ul className="col-span-6 border-t border-ink/10" role="list">
            {services.map((s, i) => {
              const isActive = i === active;
              return (
                <li key={s.id} className="border-b border-ink/10">
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onClick={() => setActive(i)}
                    aria-pressed={isActive}
                    aria-controls={`servizio-${s.id}`}
                    className={`flex w-full items-baseline gap-6 py-6 text-left font-display text-[clamp(2.25rem,1rem+2.6vw,3.75rem)] font-bold leading-none tracking-tightest transition-colors ${isActive ? "text-ink" : "text-ink/30 hover:text-ink/60"}`}
                  >
                    <span className={`font-mono text-[12px] tracking-label ${isActive ? "text-blu-deep" : "text-ink/40"}`}>
                      0{i + 1}
                    </span>
                    {s.name}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="col-span-5 col-start-8">
            <div className="sticky top-[calc(var(--nav-h)+32px)] border border-ink/15 bg-surface p-8">
              {services.map((s, i) => (
                <div
                  key={s.id}
                  id={`servizio-${s.id}`}
                  hidden={i !== active}
                  data-service-panel={s.id}
                >
                  <p className="label-mono text-ink/60">0{i + 1} — {s.name}</p>
                  <p className="mt-5 text-[19px] leading-snug text-ink">{s.description}</p>
                  <p className="label-mono mt-8 text-ink/60">Include</p>
                  <ul className="mt-2 divide-y divide-ink/10 border-y border-ink/10">
                    {s.includes.map((inc) => (
                      <li key={inc} className="py-3 text-[16px]">
                        {inc}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: fisarmonica nativa, funziona anche senza JS */}
        <div className="mt-10 border-t border-ink/10 lg:hidden" data-services-mobile>
          {services.map((s, i) => (
            <details key={s.id} className="group border-b border-ink/10" open={i === 0}>
              <summary className="flex min-h-14 items-center justify-between gap-4 py-4">
                <span className="flex items-baseline gap-4 font-display text-[28px] font-bold leading-none tracking-tightest">
                  <span className="font-mono text-[11px] tracking-label text-blu-deep">0{i + 1}</span>
                  {s.name}
                </span>
                <PlusIcon className="shrink-0 text-ink" />
              </summary>
              <div className="pb-6 pl-9">
                <p className="text-[17px] leading-relaxed text-ink/85">{s.description}</p>
                <p className="label-mono mt-5 text-ink/60">Include</p>
                <ul className="mt-2 divide-y divide-ink/10 border-y border-ink/10">
                  {s.includes.map((inc) => (
                    <li key={inc} className="py-2.5 text-[15px]">
                      {inc}
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
