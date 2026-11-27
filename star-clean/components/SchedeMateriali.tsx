"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { caricaGsap, type Motore } from "@/lib/gsap";
import { materiali, type IdMateriale } from "@/content/materiali";
import { Icona } from "./Icona";

const eUnMateriale = (id: string): id is IdMateriale => materiali.some((m) => m.id === id);

/**
 * "Che pavimento hai?": cinque schede, quella scelta si allarga e mostra il dettaglio (cambio animato con Flip).
 * Ogni scheda ha un'ancora (#marmo, #cotto…) per gli annunci Google: aprendo la pagina con l'ancora
 * la scheda è già scelta. Tutti i testi sono nell'HTML anche senza JavaScript.
 */
export function SchedeMateriali() {
  const [attivo, setAttivo] = useState<IdMateriale>("marmo");
  const griglia = useRef<HTMLDivElement>(null);
  const stato = useRef<Flip.FlipState | null>(null);
  // GSAP e Flip si scaricano dopo il primo disegno; se non sono ancora pronti il cambio avviene senza animazione
  const motore = useRef<Motore | null>(null);
  useEffect(() => {
    caricaGsap("Flip").then((m) => (motore.current = m));
  }, []);

  useLayoutEffect(() => {
    const s = stato.current;
    const m = motore.current;
    if (!s || !m || !griglia.current) return;
    stato.current = null;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const ctx = m.gsap.context(() => {
      m.Flip.from(s, { duration: mobile ? 0.4 : 0.6, ease: "power3.inOut", nested: true, prune: true });
      m.gsap.from(`[data-id="${attivo}"] [data-dettaglio]`, { autoAlpha: 0, y: 12, duration: 0.4, delay: mobile ? 0.15 : 0.25, ease: "power3.out" });
    }, griglia.current);
    return () => ctx.revert();
  }, [attivo]);

  // Fotografa le posizioni prima del cambio: dopo il nuovo render Flip anima dal vecchio al nuovo layout.
  const scegli = (id: IdMateriale) => {
    const g = griglia.current;
    if (!g || g.querySelector(`#${id} [aria-expanded="true"]`)) return;
    stato.current = motore.current?.Flip.getState(g.querySelectorAll("[data-scheda]")) ?? null;
    setAttivo(id);
  };

  // apertura da annuncio (#cotto) o da link interno
  useEffect(() => {
    const iniziale = window.location.hash.slice(1);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- l'ancora si legge solo nel browser
    if (eUnMateriale(iniziale)) setAttivo(iniziale);
    const cambio = () => {
      const h = window.location.hash.slice(1);
      const g = griglia.current;
      if (!eUnMateriale(h) || !g || g.querySelector(`#${h} [aria-expanded="true"]`)) return;
      stato.current = motore.current?.Flip.getState(g.querySelectorAll("[data-scheda]")) ?? null;
      setAttivo(h);
    };
    window.addEventListener("hashchange", cambio);
    return () => window.removeEventListener("hashchange", cambio);
  }, []);

  return (
    <div ref={griglia} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-[repeat(2,minmax(260px,auto))]">
      {materiali.map((m) => {
        const si = m.id === attivo;
        return (
          <article
            key={m.id}
            id={m.id}
            data-scheda
            data-flip-id={m.id}
            data-id={m.id}
            className={`relative flex scroll-mt-28 flex-col overflow-hidden rounded-[var(--radius-scheda)] border p-6 md:p-8 ${
              si
                ? "bg-blu border-blu text-white shadow-[var(--shadow-2)] md:order-first md:col-span-2 lg:row-span-2"
                : "scheda scheda-viva"
            }`}
          >
            {si && (
              <Icona nome={m.icona} spessore={0.75} className="pointer-events-none absolute -right-10 -bottom-10 h-72 w-72 text-white/[0.06]" />
            )}
            <div className="flex items-start justify-between gap-4">
              <span className={`bollo ${si ? "bg-white/10 text-white" : ""}`}>
                <Icona nome={m.icona} className="h-7 w-7" />
              </span>
              {!si && (
                <span className="testo-2 text-[0.8125rem] font-medium" aria-hidden>
                  Dettagli
                </span>
              )}
            </div>

            <h3 className={`mt-6 ${si ? "titolo-2 text-white" : "titolo-3"}`}>
              <button
                type="button"
                aria-expanded={si}
                aria-controls={`dettaglio-${m.id}`}
                onClick={() => scegli(m.id)}
                className="text-left after:absolute after:inset-0 after:content-['']"
              >
                {m.nome}
              </button>
            </h3>

            <p className={`mt-4 text-[0.8125rem] font-semibold tracking-[0.12em] uppercase ${si ? "text-riflesso" : "text-blu-chiaro"}`}>
              Trattamento
            </p>
            <p className={`mt-1 font-semibold ${si ? "text-[1.25rem] text-white lg:text-[1.5rem]" : "text-blu-notte"}`}>{m.trattamento}</p>
            <p className={`mt-2 ${si ? "text-white/80" : "testo-2 text-[0.9375rem]"}`}>{m.risultato}</p>

            <p id={`dettaglio-${m.id}`} data-dettaglio hidden={!si} className="mt-6 max-w-[34em] text-white/80">
              {m.descrizione}
            </p>

            <div className="relative z-10 mt-auto pt-6">
              <Link
                href={`/preventivo?servizio=pavimenti&materiale=${m.id}`}
                className={si ? "btn btn-accento btn-freccia max-w-full justify-between text-left whitespace-normal" : "collegamento inline-flex min-h-[44px] items-center text-[0.9375rem]"}
              >
                Preventivo per questo pavimento
                {si && (
                  <span className="cerchio">
                    <Icona nome="freccia" className="h-5 w-5" />
                  </span>
                )}
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
