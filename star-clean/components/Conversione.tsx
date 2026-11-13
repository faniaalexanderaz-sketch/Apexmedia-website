"use client";

import { useEffect } from "react";

const ADS = process.env.NEXT_PUBLIC_ADS_CONVERSIONE;

/**
 * Evento di conversione della pagina /grazie.
 * Scatta una volta sola e solo se si arriva dal modulo (segno lasciato in sessionStorage):
 * ricaricare la pagina o aprirla a mano non genera conversioni finte.
 */
export function Conversione() {
  useEffect(() => {
    let servizio: string | null = null;
    try {
      servizio = sessionStorage.getItem("sc_lead");
      sessionStorage.removeItem("sc_lead");
    } catch {}
    if (!servizio) return;

    window.dataLayer = window.dataLayer ?? [];
    if (window.gtag) {
      window.gtag("event", "generate_lead", { servizio });
      if (ADS) window.gtag("event", "conversion", { send_to: ADS });
    } else {
      // senza gtag (es. solo Tag Manager) l'evento resta comunque disponibile nel dataLayer
      window.dataLayer.push({ event: "generate_lead", servizio });
    }
  }, []);
  return null;
}
