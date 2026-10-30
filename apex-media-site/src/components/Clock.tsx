"use client";

import { useEffect, useState } from "react";

const fmt = new Intl.DateTimeFormat("it-IT", {
  timeZone: "Europe/Rome",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const now = () => fmt.format(new Date());

/** Orario locale di Alessandria (Europe/Rome), aggiornato lato client allo scatto di ogni minuto. */
export function Clock({ className = "" }: { className?: string }) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    let interval: number | undefined;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- l’orario esiste solo nel browser
    setTime(now());
    // primo aggiornamento allo scatto del minuto, poi ogni 60 s
    const toNextMinute = 60_000 - (Date.now() % 60_000);
    const timeout = window.setTimeout(() => {
      setTime(now());
      interval = window.setInterval(() => setTime(now()), 60_000);
    }, toNextMinute);
    const onVisible = () => !document.hidden && setTime(now());
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearTimeout(timeout);
      if (interval) window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return (
    <span
      className={`label-mono text-ink/60 ${className}`}
      suppressHydrationWarning
    >
      ALESSANDRIA{" "}
      <time className="text-ink tabular-nums" suppressHydrationWarning>
        {time ?? "--:--"}
      </time>
    </span>
  );
}
