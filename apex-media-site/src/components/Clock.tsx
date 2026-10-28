"use client";

import { useEffect, useState } from "react";

const fmt = new Intl.DateTimeFormat("it-IT", {
  timeZone: "Europe/Rome",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** Orario locale di Alessandria (Europe/Rome). Senza JS mostra solo la città. */
export function Clock({ className = "" }: { className?: string }) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className={`label-mono text-ink/60 ${className}`} suppressHydrationWarning>
      ALESSANDRIA{" "}
      <span className="text-ink tabular-nums" aria-live="off">
        {time ?? "--:--"}
      </span>
    </span>
  );
}
