"use client";

import { useState } from "react";
import type { Caso } from "@/content/casi";
import { PrimaDopo } from "./PrimaDopo";

/** Elenco dei casi a sinistra, slider grande a destra. Su mobile l'elenco scorre in orizzontale sopra lo slider. */
export function Casi({ casi }: { casi: Caso[] }) {
  const [attivo, setAttivo] = useState(0);
  const caso = casi[attivo];

  return (
    <div className="griglia gap-y-6">
      {casi.length > 1 && (
        <ul className="border-linea-chiara col-span-12 -mx-4 flex snap-x scroll-px-4 overflow-x-auto px-4 lg:col-span-4 lg:mx-0 lg:block lg:overflow-visible lg:border-t lg:px-0">
          {casi.map((c, i) => (
            <li key={c.id} className="border-linea-chiara shrink-0 snap-start lg:border-b">
              <button
                type="button"
                aria-pressed={i === attivo}
                onClick={() => setAttivo(i)}
                className={`group flex w-[240px] flex-col border-t-2 py-4 pr-6 text-left transition-colors lg:w-full lg:border-t-0 lg:border-l-2 lg:py-6 lg:pl-6 ${i === attivo ? "border-turchese" : "border-linea-chiara lg:border-transparent"}`}
              >
                <span className={`leading-snug font-bold ${i === attivo ? "text-white" : "text-white/60 group-hover:text-white"}`}>
                  {c.ambiente}
                </span>
                <span className="mt-1 text-[0.875rem] leading-snug text-white/60">{c.servizio}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className={`col-span-12 ${casi.length > 1 ? "lg:col-span-8" : "lg:col-span-9"}`}>
        <PrimaDopo key={caso.id} caso={caso} />
        <p className="mt-4 text-[0.9375rem] text-white/75">
          <strong className="text-white">{caso.ambiente}.</strong> {caso.servizio}.
        </p>
      </div>
    </div>
  );
}
