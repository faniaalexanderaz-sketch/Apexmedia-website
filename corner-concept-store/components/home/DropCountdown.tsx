"use client";

import { useEffect, useState } from "react";
import { countdownParts, dropClosesAt } from "@/lib/drop";
import { due } from "@/lib/format";

const UNITS = [
  { key: "days", label: "giorni" },
  { key: "hours", label: "ore" },
  { key: "minutes", label: "min" },
  { key: "seconds", label: "sec" },
] as const;

/** Conto alla rovescia: parte solo nel browser, così l'HTML del server resta uguale per tutti. */
export function DropCountdown() {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setLeft(dropClosesAt(Date.now()) - Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const parts = left === null ? null : countdownParts(left);
  const spoken = parts
    ? `Il drop chiude tra ${parts.days} giorni, ${parts.hours} ore e ${parts.minutes} minuti`
    : "Il drop chiude sabato alle 19:30";

  return (
    <div role="timer" aria-label={spoken} className="grid max-w-sm grid-cols-4 border border-linea-chiara">
      {UNITS.map((unit, index) => (
        <div
          key={unit.key}
          aria-hidden="true"
          className={`px-2 py-3 text-center ${index > 0 ? "border-l border-linea-chiara" : ""}`}
        >
          <div className="cifre text-[1.75rem] font-semibold leading-none text-crema md:text-[2rem]">
            {parts ? due(parts[unit.key]) : "––"}
          </div>
          <div className="occhiello mt-2 text-crema/70">{unit.label}</div>
        </div>
      ))}
    </div>
  );
}
