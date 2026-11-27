"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { servizi } from "@/content/servizi";
import { sito } from "@/content/sito";
import { Icona } from "./Icona";

/** Menu sotto i 1280px: hamburger che diventa X, pannello a tutto schermo con i servizi e le due azioni. */
export function MenuMobile() {
  const [aperto, setAperto] = useState(false);

  useEffect(() => {
    if (!aperto) return;
    const chiudi = (e: KeyboardEvent) => e.key === "Escape" && setAperto(false);
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", chiudi);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", chiudi);
    };
  }, [aperto]);

  return (
    <div className="xl:hidden">
      <button
        type="button"
        aria-expanded={aperto}
        aria-controls="menu-mobile"
        aria-label={aperto ? "Chiudi il menu" : "Apri il menu dei servizi"}
        onClick={() => setAperto((a) => !a)}
        className="bg-cielo text-blu-notte relative flex h-11 w-11 items-center justify-center rounded-full"
      >
        <span className={`absolute h-[1.5px] w-5 bg-current transition-transform duration-300 ease-[var(--ease-morbido)] ${aperto ? "rotate-45" : "-translate-y-[4px]"}`} />
        <span className={`absolute h-[1.5px] w-5 bg-current transition-transform duration-300 ease-[var(--ease-morbido)] ${aperto ? "-rotate-45" : "translate-y-[4px]"}`} />
      </button>

      <div
        id="menu-mobile"
        hidden={!aperto}
        className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto bg-white lg:top-20"
      >
        <nav aria-label="Servizi" className="contenitore py-6">
          <ul className="grid gap-2 sm:grid-cols-2">
            {servizi.map((s, i) => (
              <li key={s.slug} className="motion-safe:animate-[passo-entra_0.4s_var(--ease-morbido)_both]" style={{ animationDelay: `${i * 40}ms` }}>
                <Link
                  href={`/${s.slug}`}
                  onClick={() => setAperto(false)}
                  className="hover:bg-cielo flex items-center gap-4 rounded-[20px] p-3 transition-colors"
                >
                  <span className="bollo h-12 w-12">
                    <Icona nome={s.icona} />
                  </span>
                  <span>
                    <span className="text-blu-notte block font-semibold">{s.nome}</span>
                    <span className="testo-2 block text-[0.875rem] leading-snug">{s.riassunto}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="border-linea mt-6 grid gap-3 border-t pt-6 sm:grid-cols-2">
            <Link href="/preventivo" onClick={() => setAperto(false)} className="btn btn-accento">
              Richiedi preventivo
            </Link>
            <a href={sito.telefono.href} className="btn btn-linea">
              Chiama {sito.telefono.mostrato}
            </a>
          </div>
          <p className="testo-2 mt-4 text-[0.9375rem]">Risponde {sito.titolare}. Preventivo scritto in {sito.oreRisposta} ore.</p>
        </nav>
      </div>
    </div>
  );
}
