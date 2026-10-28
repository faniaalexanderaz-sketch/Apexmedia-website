"use client";

import { useEffect } from "react";
import { track, type EventName } from "@/lib/track";

/**
 * Ascolta i click su qualsiasi elemento con data-track="nome_evento".
 * Gli altri attributi data-track-* diventano proprietà dell’evento (es. data-track-posizione="hero").
 */
export function TrackingListener() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-track]");
      const name = el?.dataset.track as EventName | undefined;
      if (!el || !name) return;
      const props: Record<string, string> = {};
      for (const [k, v] of Object.entries(el.dataset)) {
        if (k.startsWith("track") && k !== "track" && v) props[k.slice(5).toLowerCase()] = v;
      }
      track(name, props);
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);
  return null;
}
