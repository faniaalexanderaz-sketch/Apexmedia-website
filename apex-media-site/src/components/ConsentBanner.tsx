"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID ?? "";
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";
const KEY = "apex-consent";

type Choice = "granted" | "denied" | null;

const readChoice = (): Choice => {
  try {
    const v = localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
};

function loadScript(src: string) {
  const s = document.createElement("script");
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

/** Carica GA4 e Meta Pixel solo dopo il consenso. */
function loadTrackers() {
  if (GA4_ID && !window.gtag) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };
    window.gtag("js", new Date());
    window.gtag("config", GA4_ID, { anonymize_ip: true });
    loadScript(
      `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA4_ID)}`,
    );
  }
  if (PIXEL_ID && !window.fbq) {
    type Fbq = ((...args: unknown[]) => void) & {
      queue?: unknown[][];
      loaded?: boolean;
      version?: string;
    };
    const queue: unknown[][] = [];
    const fbq: Fbq = (...args: unknown[]) => {
      queue.push(args);
    };
    fbq.queue = queue;
    fbq.loaded = true;
    fbq.version = "2.0";
    window.fbq = fbq;
    window.fbq("init", PIXEL_ID);
    window.fbq("track", "PageView");
    loadScript("https://connect.facebook.net/en_US/fbevents.js");
  }
}

/**
 * Banner cookie minimale: compare solo se c’è almeno un ID configurato e l’utente non ha ancora scelto.
 * Accetta e Rifiuta hanno la stessa evidenza. La scelta si cambia dalla pagina privacy.
 */
export function ConsentBanner() {
  const enabled = Boolean(GA4_ID || PIXEL_ID);
  const [choice, setChoice] = useState<Choice | "unknown">("unknown");

  useEffect(() => {
    if (!enabled) return;
    const c = readChoice();
    // La scelta vive in localStorage: va letta dopo l’idratazione per non creare differenze col server
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChoice(c);
    if (c === "granted") loadTrackers();
    const onReset = () => setChoice(null);
    window.addEventListener("apex-consent-reset", onReset);
    return () => window.removeEventListener("apex-consent-reset", onReset);
  }, [enabled]);

  if (!enabled || choice !== null) return null;

  const decide = (c: Exclude<Choice, null>) => {
    try {
      localStorage.setItem(KEY, c);
    } catch {}
    setChoice(c);
    if (c === "granted") loadTrackers();
  };

  return (
    <div
      role="dialog"
      aria-labelledby="consent-title"
      className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-[560px] border border-ink/15 bg-surface p-5 sm:inset-x-6 sm:bottom-6 sm:ml-auto sm:mr-0 lg:right-12"
    >
      <p id="consent-title" className="label-mono text-ink/60">
        Cookie
      </p>
      <p className="mt-2 text-[15px] leading-relaxed text-ink/85">
        Usiamo statistiche senza cookie. Se accetti, attiviamo anche Google
        Analytics e il pixel di Meta per misurare le campagne. Puoi cambiare
        idea dalla pagina{" "}
        <a href="/privacy" className="u-link font-medium text-ink">
          privacy
        </a>
        .
      </p>
      <div className="mt-4 flex gap-3">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={() => decide("granted")}
        >
          Accetta
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={() => decide("denied")}
        >
          Rifiuta
        </Button>
      </div>
    </div>
  );
}

/** Link "Gestisci il consenso" da usare nella pagina privacy. */
export function ConsentReset({ className = "" }: { className?: string }) {
  const [enabled] = useState(() => Boolean(GA4_ID || PIXEL_ID));
  if (!enabled) return null;
  return (
    <button
      type="button"
      className={`u-link font-semibold text-ink hover:text-viola ${className}`}
      onClick={() => {
        try {
          localStorage.removeItem(KEY);
        } catch {}
        window.dispatchEvent(new Event("apex-consent-reset"));
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
      }}
    >
      Gestisci il consenso ai cookie
    </button>
  );
}
