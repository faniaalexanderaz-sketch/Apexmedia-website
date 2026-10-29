import { track as vercelTrack } from "@vercel/analytics";

type Props = Record<string, string | number | boolean>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/** Nomi degli eventi di conversione tracciati nel sito. */
export type EventName =
  | "click_whatsapp"
  | "form_submit"
  | "click_email"
  | "click_portfolio"
  | "click_pacchetto"
  | "click_cta";

/**
 * Un solo punto d’ingresso: Vercel Analytics sempre (senza cookie);
 * GA4 e Meta Pixel solo se sono stati caricati dopo il consenso.
 */
export function track(name: EventName, props: Props = {}) {
  try {
    vercelTrack(name, props);
  } catch {}
  if (typeof window === "undefined") return;
  window.gtag?.("event", name, props);
  if (window.fbq) {
    if (name === "form_submit") window.fbq("track", "Lead", props);
    else if (name === "click_whatsapp") window.fbq("track", "Contact", props);
    else window.fbq("trackCustom", name, props);
  }
}
