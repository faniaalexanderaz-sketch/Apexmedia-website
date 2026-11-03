"use client";

import { useEffect, useRef, useState } from "react";

export type Formato = "intero" | "euro" | "euro2";
export function formattaNumero(n: number, formato: Formato, lingua: "it" | "zh"): string {
  const loc = lingua === "zh" ? "zh-CN" : "it-IT";
  if (formato === "intero") return new Intl.NumberFormat(loc).format(Math.round(n));
  const d = formato === "euro2" ? 2 : 0;
  return new Intl.NumberFormat(loc, { style: "currency", currency: "EUR", minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
}

/** Numero che conta da 0 al valore in 800 ms all'apertura. Con reduced-motion mostra subito il valore.
   (Riceve solo dati, non funzioni: è un componente client usato da un server component.) */
export function CountUp({ valore, formato, lingua }: { valore: number; formato: Formato; lingua: "it" | "zh" }) {
  const formatta = (n: number) => formattaNumero(n, formato, lingua);
  const [n, setN] = useState(0);
  const avviato = useRef(false);
  useEffect(() => {
    if (avviato.current) return;
    avviato.current = true;
    const ridotto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    if (ridotto || valore === 0) { raf = requestAnimationFrame(() => setN(valore)); return () => cancelAnimationFrame(raf); }
    const t0 = performance.now();
    const passo = (t: number) => {
      const p = Math.min(1, (t - t0) / 800);
      const e = 1 - Math.pow(1 - p, 3);
      setN(valore * e);
      if (p < 1) raf = requestAnimationFrame(passo);
      else setN(valore);
    };
    raf = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(raf);
  }, [valore]);
  return <span className="num" suppressHydrationWarning>{formatta(n)}</span>;
}
