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
        <ul className="col-span-12 -mx-4 flex snap-x scroll-px-4 gap-2 overflow-x-auto px-4 pb-1 lg:col-span-4 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
          {casi.map((c, i) => (
            <li key={c.id} className="shrink-0 snap-start">
              <button
                type="button"
                aria-pressed={i === attivo}
                onClick={() => setAttivo(i)}
                className={`flex w-[230px] flex-col rounded-[20px] border px-5 py-4 text-left transition-colors duration-300 lg:w-full lg:px-6 lg:py-5 ${i === attivo ? "border-white/25 bg-white/10" : "border-transparent hover:bg-white/5"}`}
              >
                <span className={`leading-snug font-semibold ${i === attivo ? "text-white" : "text-white/70"}`}>{c.ambiente}</span>
                <span className="mt-1 text-[0.875rem] leading-snug text-white/60">{c.servizio}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className={`col-span-12 ${casi.length > 1 ? "lg:col-span-7 lg:col-start-6" : "lg:col-span-7"}`}>
        <PrimaDopo key={caso.id} caso={caso} />
        <p className="mt-4 text-[0.9375rem] text-white/75">
          <strong className="text-white">{caso.ambiente}.</strong> {caso.servizio}.
        </p>
        {caso.esempio && (
          <p className="border-riflesso mt-4 border-l-2 pl-4 text-[0.875rem] text-white/60">
            Immagini dimostrative per la demo. Online vanno le foto dei lavori fatti da Star Clean.
          </p>
        )}
      </div>
    </div>
  );
}
