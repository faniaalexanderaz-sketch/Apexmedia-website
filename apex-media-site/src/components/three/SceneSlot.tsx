"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";

type Fallback = { src: string; width: number; height: number };

type Props = {
  /** La scena vera: viene montata solo quando lo spazio si avvicina allo schermo e solo se c’è WebGL */
  children: (onReady: () => void) => ReactNode;
  /** Immagine statica della scena nella posa finale: si vede senza WebGL, o se la scena non parte */
  fallback: Fallback;
  alt: string;
  className?: string;
  /** true: l’immagine statica compare solo senza WebGL (per l’hero, dove non deve pesare sul primo caricamento) */
  quietFallback?: boolean;
  /** Millisecondi di attesa prima di montare la scena (l’hero aspetta che il titolo abbia finito di entrare) */
  mountDelay?: number;
};

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Spazio di una scena 3D. Sotto c’è sempre l’immagine statica, così la sezione non è mai vuota:
 * il canvas la copre solo quando ha davvero disegnato il primo frame.
 */
export function SceneSlot({
  children,
  fallback,
  alt,
  className = "",
  quietFallback = false,
  mountDelay = 0,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [webgl, setWebgl] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Si carica circa una schermata e mezza prima di arrivarci; una volta montata resta montata.
    // Senza WebGL resta l’immagine statica.
    let timer: number | undefined;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          if (!hasWebGL()) setWebgl(false);
          else if (mountDelay > 0) timer = window.setTimeout(() => setNear(true), mountDelay);
          else setNear(true);
        }
      },
      { rootMargin: "150% 0px 150% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, [mountDelay]);

  // Se il contesto WebGL si perde (succede sui telefoni con poca memoria) torna l’immagine
  useEffect(() => {
    const el = ref.current;
    if (!el || !near) return;
    const lost = () => setReady(false);
    el.addEventListener("webglcontextlost", lost, true);
    return () => el.removeEventListener("webglcontextlost", lost, true);
  }, [near]);

  return (
    <div ref={ref} className={`relative ${className}`} data-scene-slot>
      {quietFallback && webgl ? null : (
      <Image
        src={fallback.src}
        width={fallback.width}
        height={fallback.height}
        alt={alt}
        sizes="(min-width: 1024px) 60vw, 100vw"
        className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-500 ${
          ready ? "opacity-0" : "opacity-100"
        }`}
        data-scene-fallback
      />
      )}
      {near && webgl ? (
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            ready ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
        >
          {children(() => setReady(true))}
        </div>
      ) : null}
    </div>
  );
}
