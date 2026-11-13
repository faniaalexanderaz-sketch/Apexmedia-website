"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";

const GA = process.env.NEXT_PUBLIC_GA_ID;

/**
 * Google Analytics / Ads con Consent Mode: parte tutto negato e si attiva solo dopo "Accetta".
 * Se NEXT_PUBLIC_GA_ID non è impostato non carica nulla e non mostra nessun banner.
 */
export function Tracciamento() {
  const [scelta, setScelta] = useState<"attesa" | "si" | "no" | "da-chiedere">("attesa");

  useEffect(() => {
    let salvata: string | null = null;
    try {
      salvata = localStorage.getItem("sc_cookie");
    } catch {}
    // eslint-disable-next-line react-hooks/set-state-in-effect -- la scelta sta in localStorage, leggibile solo nel browser
    setScelta(salvata === "si" || salvata === "no" ? salvata : "da-chiedere");
  }, []);

  if (!GA) return null;

  const decidi = (v: "si" | "no") => {
    try {
      localStorage.setItem("sc_cookie", v);
    } catch {}
    setScelta(v);
    if (v === "si") {
      window.gtag?.("consent", "update", {
        analytics_storage: "granted", ad_storage: "granted", ad_user_data: "granted", ad_personalization: "granted",
      });
    }
  };

  return (
    <>
      <Script id="consenso" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;
var c=null;try{c=localStorage.getItem('sc_cookie')}catch(e){}
var s=c==='si'?'granted':'denied';
gtag('consent','default',{analytics_storage:s,ad_storage:s,ad_user_data:s,ad_personalization:s});
gtag('js',new Date());gtag('config','${GA}');`}
      </Script>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA}`} strategy="afterInteractive" />

      {scelta === "da-chiedere" && (
        <div role="dialog" aria-label="Cookie" className="border-linea rounded-ui fixed inset-x-2 bottom-[84px] z-50 border bg-white p-4 md:inset-x-auto md:right-6 md:bottom-6 md:max-w-[420px] md:p-6">
          <p className="text-[0.9375rem] leading-snug">
            Usiamo cookie di misurazione per capire quali pagine portano richieste. Li attiviamo solo se accetti.{" "}
            <Link href="/cookie" className="underline underline-offset-4">Cookie policy</Link>
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => decidi("no")} className="btn btn-linea min-h-[44px]">Rifiuta</button>
            <button type="button" onClick={() => decidi("si")} className="btn btn-linea min-h-[44px]">Accetta</button>
          </div>
        </div>
      )}
    </>
  );
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}
