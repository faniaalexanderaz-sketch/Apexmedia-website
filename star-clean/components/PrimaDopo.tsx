"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useAnimazione } from "@/lib/gsap";
import type { Caso } from "@/content/casi";

/** Un lato dello slider: la foto reale se c'è, altrimenti un segnaposto dichiarato. */
function Lato({ src, tipo, alt, carica }: { src: string | null; tipo: "prima" | "dopo"; alt: string; carica: boolean }) {
  if (src && !carica) return <div className={`absolute inset-0 ${tipo === "prima" ? "bg-[#6f7f86]" : "bg-[#c9d6dc]"}`} />;
  if (src) {
    return <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 760px, 100vw" className="object-cover" draggable={false} />;
  }
  return (
    <div className={`absolute inset-0 flex items-center ${tipo === "prima" ? "justify-start bg-[#93a5aa] pl-6 md:pl-10" : "justify-end bg-[#e6f1f3] pr-6 md:pr-10"}`}>
      <p className="text-blu max-w-[9em] text-[0.875rem] leading-snug font-semibold">
        Foto da inserire, {tipo === "prima" ? "prima del lavoro" : "a lavoro finito"}
      </p>
    </div>
  );
}

/**
 * Slider prima/dopo con Draggable: si trascina la maniglia (o qualsiasi punto della foto) col dito o col mouse,
 * un tocco sposta la linea lì, le frecce da tastiera la muovono del 5%. Lo scorrimento verticale resta libero.
 */
export function PrimaDopo({ caso }: { caso: Caso }) {
  const riquadro = useRef<HTMLDivElement>(null);
  const maniglia = useRef<HTMLDivElement>(null);
  const cursore = useRef<HTMLButtonElement>(null);
  const pos = useRef(50);

  // Le foto (2 × ~55 kB) si scaricano solo quando lo slider si avvicina allo schermo: non pesano sul primo caricamento.
  const [carica, setCarica] = useState(false);
  useEffect(() => {
    const el = riquadro.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setCarica(true);
        io.disconnect();
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Draggable arriva dopo il primo disegno: finché non c'è, la linea resta al 50% e le frecce non servono
  useAnimazione(riquadro, ["Draggable"], (mm, { gsap, Draggable }) => {
    mm.add("all", () => {
      const box = riquadro.current!;
      const h = maniglia.current!;
      const segna = (x: number) => {
        const p = Math.min(100, Math.max(0, (x / box.offsetWidth) * 100));
        pos.current = p;
        box.style.setProperty("--pos", `${p}%`);
        cursore.current?.setAttribute("aria-valuenow", String(Math.round(p)));
        cursore.current?.setAttribute("aria-valuetext", `${Math.round(p)}% prima`);
      };

      gsap.set(h, { left: 0, x: box.offsetWidth * (pos.current / 100) });
      const [d] = Draggable.create(h, {
        type: "x",
        trigger: box,
        bounds: { minX: 0, maxX: box.offsetWidth },
        cursor: "ew-resize",
        zIndexBoost: false,
        dragClickables: true,
        onDrag() {
          segna(this.x);
        },
        onClick(e: PointerEvent | MouseEvent | TouchEvent) {
          const r = box.getBoundingClientRect();
          const clientX = "changedTouches" in e ? e.changedTouches[0].clientX : e.clientX;
          const x = Math.min(r.width, Math.max(0, clientX - r.left));
          gsap.to(h, { x, duration: 0.35, ease: "power3.out", onUpdate: () => { segna(gsap.getProperty(h, "x") as number); d.update(); } });
        },
      });

      // al cambio di larghezza la linea resta alla stessa percentuale
      const ro = new ResizeObserver(() => {
        d.applyBounds({ minX: 0, maxX: box.offsetWidth });
        gsap.set(h, { x: box.offsetWidth * (pos.current / 100) });
        d.update();
      });
      ro.observe(box);

      // frecce da tastiera: 5% a ogni pressione
      const btn = cursore.current!;
      const tasto = (e: KeyboardEvent) => {
        const passo = e.key === "ArrowLeft" ? -5 : e.key === "ArrowRight" ? 5 : 0;
        if (!passo) return;
        e.preventDefault();
        const p = Math.min(100, Math.max(0, pos.current + passo));
        gsap.set(h, { x: box.offsetWidth * (p / 100) });
        segna(box.offsetWidth * (p / 100));
        d.update();
      };
      btn.addEventListener("keydown", tasto);
      return () => {
        ro.disconnect();
        btn.removeEventListener("keydown", tasto);
      };
    });
  });


  return (
    <div
      ref={riquadro}
      className="relative aspect-square overflow-hidden rounded-[var(--radius-foto)] select-none"
      style={{ "--pos": "50%" } as React.CSSProperties}
    >
      <Lato src={caso.dopo} tipo="dopo" alt={`${caso.ambiente} dopo: ${caso.servizio}`} carica={carica} />
      <div className="absolute inset-0" style={{ clipPath: "inset(0 calc(100% - var(--pos)) 0 0)" }}>
        <Lato src={caso.prima} tipo="prima" alt={`${caso.ambiente} prima dell'intervento`} carica={carica} />
      </div>

      <span className="bg-blu-notte/80 absolute top-4 left-4 rounded-full px-3 py-1 text-[0.75rem] font-semibold tracking-[0.1em] text-white uppercase backdrop-blur">
        Prima
      </span>
      <span className="text-blu-notte absolute top-4 right-4 rounded-full bg-white/90 px-3 py-1 text-[0.75rem] font-semibold tracking-[0.1em] uppercase backdrop-blur">
        Dopo
      </span>

      <div ref={maniglia} className="absolute inset-y-0 w-0" style={{ left: "50%" }}>
        <div className="absolute inset-y-0 -left-px w-[2px] bg-white shadow-[0_0_16px_rgb(255_255_255/0.8)]" />
        <button
          ref={cursore}
          type="button"
          role="slider"
          aria-label="Confronto prima e dopo: trascina o usa le frecce"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={50}
          aria-valuetext="50% prima"
          className="text-blu absolute top-1/2 left-0 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full bg-white shadow-[var(--shadow-2)]"
        >
          <svg aria-hidden width="22" height="12" viewBox="0 0 22 12" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 1 1 6l5 5M16 1l5 5-5 5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
