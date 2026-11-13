"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { Caso } from "@/content/casi";

/** Un lato dello slider: la foto reale se c'è, altrimenti un segnaposto dichiarato. */
function Lato({ src, tipo, alt }: { src: string | null; tipo: "prima" | "dopo"; alt: string }) {
  if (src) {
    return (
      <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 760px, 100vw" className="object-cover" draggable={false} />
    );
  }
  return (
    <div
      className={`absolute inset-0 flex items-center ${tipo === "prima" ? "justify-start bg-[#93a5aa] pl-6 md:pl-10" : "justify-end bg-[#e6f1f3] pr-6 md:pr-10"}`}
    >
      <p className="text-petrolio max-w-[9em] text-[0.8125rem] leading-snug font-bold md:text-[0.9375rem]">
        Foto reale da inserire, {tipo === "prima" ? "prima del lavoro" : "a lavoro finito"}
      </p>
    </div>
  );
}

/** Slider prima/dopo: si trascina col dito o col mouse, si muove con le frecce da tastiera. */
export function PrimaDopo({ caso }: { caso: Caso }) {
  const [pos, setPos] = useState(50);
  const riquadro = useRef<HTMLDivElement>(null);
  const trascina = useRef(false);

  const sposta = (clientX: number) => {
    const r = riquadro.current?.getBoundingClientRect();
    if (!r) return;
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  };

  return (
    <div
      ref={riquadro}
      className="rounded-ui relative aspect-[4/3] cursor-ew-resize touch-pan-y overflow-hidden select-none lg:aspect-[16/10]"
      onPointerDown={(e) => {
        trascina.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        sposta(e.clientX);
      }}
      onPointerMove={(e) => trascina.current && sposta(e.clientX)}
      onPointerUp={() => (trascina.current = false)}
      onPointerCancel={() => (trascina.current = false)}
    >
      <Lato src={caso.dopo} tipo="dopo" alt={`${caso.ambiente} dopo: ${caso.servizio}`} />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <Lato src={caso.prima} tipo="prima" alt={`${caso.ambiente} prima dell'intervento`} />
      </div>

      <span className="bg-petrolio absolute top-4 left-4 px-2 py-1 text-[0.75rem] font-bold tracking-[0.1em] text-white uppercase">Prima</span>
      <span className="text-petrolio absolute top-4 right-4 bg-white px-2 py-1 text-[0.75rem] font-bold tracking-[0.1em] uppercase">Dopo</span>

      <div className="absolute inset-y-0 w-0" style={{ left: `${pos}%` }}>
        <div className="absolute inset-y-0 -left-px w-[2px] bg-white" />
        <button
          type="button"
          role="slider"
          aria-label="Confronto prima e dopo"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos)}
          aria-valuetext={`${Math.round(pos)}% prima`}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - 5));
            if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + 5));
          }}
          className="bg-turchese rounded-ui absolute top-1/2 left-0 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center border-2 border-white"
        >
          <svg aria-hidden width="22" height="12" viewBox="0 0 22 12" fill="none" stroke="#fff" strokeWidth="2">
            <path d="M6 1 1 6l5 5M16 1l5 5-5 5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
