"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { isUnsplash, unsplashLoader } from "@/lib/unsplash";

type Props = {
  src?: string | null;
  alt: string;
  /** Nome del capo: se la foto manca o non risponde, lo mostriamo al suo posto. Mai immagini rotte. */
  name: string;
  sizes: string;
  eager?: boolean;
  preload?: boolean;
  className?: string;
};

export function ProductImage({ src, alt, name, sizes, eager = false, preload = false, className = "" }: Props) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // l'errore può arrivare prima che React agganci onError: lo si recupera qui
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, [src]);

  if (!src || failed) {
    return (
      <div className="absolute inset-0 flex flex-col justify-between bg-ombra p-4" role="img" aria-label={alt || name}>
        <span className="occhiello text-marrone">Corner</span>
        <span className="titolo text-[clamp(1.125rem,5cqw,1.75rem)] text-verde">{name}</span>
        <span className="text-[0.6875rem] text-marrone">Foto in arrivo</span>
      </div>
    );
  }

  // Foto Unsplash: di norma arrivano dirette dal loro CDN, già ritagliate e ridimensionate.
  // Fa eccezione la foto principale della pagina (preload): passa dall'ottimizzatore di Next,
  // così arriva dallo stesso dominio del sito e non paga una connessione in più.
  const remote = isUnsplash(src);
  const viaOptimizer = remote && preload;

  return (
    <Image
      ref={ref}
      src={viaOptimizer ? `${src}&w=1600&q=80` : src}
      alt={alt}
      fill
      sizes={sizes}
      loader={remote && !viaOptimizer ? unsplashLoader : undefined}
      preload={preload}
      loading={preload ? undefined : eager ? "eager" : "lazy"}
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}
