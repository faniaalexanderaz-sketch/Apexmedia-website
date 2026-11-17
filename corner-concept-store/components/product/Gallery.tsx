"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ProductImage } from "@/components/ProductImage";
import type { Product } from "@/lib/products";

/**
 * Su mobile le foto scorrono col dito, con le pillole a fare da indicatore.
 * Su desktop diventano una griglia a due colonne: se le foto sono dispari, l'ultima casella ospita la scheda.
 */
export function Gallery({ product, details }: { product: Product; details: ReactNode }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const images = product.images;
  const odd = images.length % 2 === 1;

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const slides = Array.from(track.querySelectorAll<HTMLElement>("[data-slide]"));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.slide));
        }
      },
      { root: track, threshold: 0.6 },
    );
    slides.forEach((slide) => observer.observe(slide));
    return () => observer.disconnect();
  }, [images.length]);

  const goTo = (index: number) => {
    const track = trackRef.current;
    const slide = track?.querySelector<HTMLElement>(`[data-slide="${index}"]`);
    if (track && slide) track.scrollTo({ left: slide.offsetLeft - track.offsetLeft, behavior: "smooth" });
  };

  return (
    <div>
      <ul
        ref={trackRef}
        aria-label={`Foto: ${product.name}`}
        className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain border-linea [scrollbar-width:none] lg:grid lg:snap-none lg:grid-cols-2 lg:overflow-visible lg:border-l lg:border-t [&::-webkit-scrollbar]:hidden"
      >
        {images.map((image, index) => (
          <li
            key={image.src}
            data-slide={index}
            className="relative aspect-[4/5] w-full shrink-0 snap-start bg-ombra [container-type:inline-size] lg:w-auto lg:border-b lg:border-r lg:border-linea"
          >
            <ProductImage
              src={image.src}
              alt={image.alt}
              name={product.name}
              sizes="(min-width: 1024px) 29vw, (min-width: 640px) 100vw, 70vw"
              preload={index === 0}
              eager={index === 1}
            />
          </li>
        ))}
        {odd ? (
          <li className="hidden border-b border-r border-linea bg-carta p-7 lg:flex lg:flex-col lg:justify-between xl:p-9">
            {details}
          </li>
        ) : null}
      </ul>

      {images.length > 1 ? (
        <div className="flex items-center justify-center gap-1.5 py-3 lg:hidden" role="tablist" aria-label="Scegli la foto">
          {images.map((image, index) => (
            <button
              key={image.src}
              type="button"
              role="tab"
              aria-selected={active === index}
              aria-label={`Foto ${index + 1} di ${images.length}`}
              onClick={() => goTo(index)}
              className="flex h-8 items-center px-1"
            >
              <span
                className={`block h-1.5 rounded-full transition-[width,background-color] duration-200 ease-out ${
                  active === index ? "w-7 bg-verde" : "w-2.5 bg-linea-forte"
                }`}
              />
            </button>
          ))}
        </div>
      ) : null}

      {!odd ? <div className="hidden border-b border-l border-r border-linea bg-carta p-7 lg:block xl:p-9">{details}</div> : null}
    </div>
  );
}
