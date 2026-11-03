"use client";

import dynamic from "next/dynamic";

/* Pezzi pesanti caricati dopo il primo render: grafici e scena 3D.
   Il server manda subito testo e numeri; questi arrivano dopo. */

function sk(h: number) {
  const Skeleton = () => <div className="p-skeleton" style={{ height: h }} aria-hidden="true" />;
  Skeleton.displayName = "Skeleton";
  return Skeleton;
}

export const GraficoPrenotazioniLazy = dynamic(() => import("./Grafici").then((m) => m.GraficoPrenotazioni), { ssr: false, loading: sk(260) });
export const GraficoContattiLazy = dynamic(() => import("./Grafici").then((m) => m.GraficoContatti), { ssr: false, loading: sk(260) });
export const GraficoSorgentiLazy = dynamic(() => import("./Grafici").then((m) => m.GraficoSorgenti), { ssr: false, loading: sk(260) });
export const GraficoTreatwellLazy = dynamic(() => import("./Grafici").then((m) => m.GraficoTreatwell), { ssr: false, loading: sk(180) });
const ScenaVuota = () => <div className="p-scena" />;
ScenaVuota.displayName = "ScenaVuota";
export const Scena3DLazy = dynamic(() => import("./Scena3D").then((m) => m.Scena3D), { ssr: false, loading: ScenaVuota });
