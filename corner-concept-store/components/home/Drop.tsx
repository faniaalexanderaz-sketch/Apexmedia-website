import Link from "next/link";
import { DropCountdown } from "@/components/home/DropCountdown";
import { ProductImage } from "@/components/ProductImage";
import { due, euro } from "@/lib/format";
import { dropPieces, isSoldOut, productHref } from "@/lib/products";
import { whatsappLink } from "@/lib/site";

export function Drop() {
  const pieces = dropPieces();
  const available = pieces.filter((p) => !isSoldOut(p)).length;

  return (
    <section id="drop" aria-labelledby="drop-titolo" className="su-verde scroll-mt-24 bg-verde text-crema">
      {/* la carta da parati del negozio: una fascia, non uno sfondo */}
      <div aria-hidden="true" className="carta-da-parati h-16 md:h-24" />

      <div className="pagina grid gap-x-8 gap-y-10 py-12 md:py-20 lg:grid-cols-12">
        <div className="self-start lg:sticky lg:top-32 lg:col-span-5">
          <p className="occhiello text-ocra">Il drop · pezzi unici numerati</p>
          <h2 id="drop-titolo" className="mt-4 leading-[0.92]">
            <span className="titolo block text-[3.25rem] uppercase tracking-[0.01em] text-terracotta xs:text-[3.75rem] md:text-[5.25rem]">
              Vintage
            </span>
            <span className="block font-sans text-[3.5rem] font-extrabold tracking-[-0.03em] xs:text-[4rem] md:text-[5.75rem]">
              Barbour
            </span>
            <span className="titolo block text-[3.25rem] uppercase tracking-[0.01em] text-terracotta xs:text-[3.75rem] md:text-[5.25rem]">
              Days
            </span>
          </h2>

          <p className="mt-6 max-w-[42ch] text-[0.9375rem] leading-relaxed text-crema/85">
            Cerate Barbour di seconda mano, lavate e ricerate a mano. Ogni giacca è un pezzo unico: quando è venduta, è
            venduta.
          </p>

          <div className="mt-8">
            <p className="mb-3 text-sm font-medium">Il drop chiude sabato alle 19:30</p>
            <DropCountdown />
          </div>

          <p className="mt-6 text-sm font-extrabold uppercase tracking-[0.08em] text-ocra">
            Quantità limitate
            <span className="mt-1 block text-[0.8125rem] font-medium normal-case tracking-normal text-crema/85">
              {pieces.length} giacche in tutto, {available} ancora disponibili.
            </span>
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <Link href="/shop?categoria=vintage" className="bottone bottone-crema">
              Vedi i pezzi del drop
              <span aria-hidden="true">→</span>
            </Link>
            <a
              href={whatsappLink("Ciao Corner, avvisatemi quando esce il prossimo drop.")}
              target="_blank"
              rel="noopener noreferrer"
              className="link-riga inline-flex min-h-11 items-center text-sm font-semibold"
            >
              Avvisami del prossimo drop
            </a>
          </div>
        </div>

        <ol className="grid grid-cols-2 self-start border-l border-t border-linea-chiara lg:col-span-7">
          {pieces.map((p) => {
            const sold = isSoldOut(p);
            return (
              <li key={p.slug} className="border-b border-r border-linea-chiara">
                <Link href={productHref(p)} className="group flex h-full flex-col focus-visible:outline-offset-[-2px]">
                  <div className="relative aspect-[4/5] overflow-hidden bg-notte [container-type:inline-size]">
                    <ProductImage
                      src={p.images[0]?.src}
                      alt={p.images[0]?.alt ?? p.name}
                      name={p.name}
                      sizes="(min-width: 1024px) 26vw, 32vw"
                      className={sold ? "opacity-45 grayscale" : ""}
                    />
                    <span className="cifre absolute left-0 top-0 bg-verde px-2.5 py-1.5 text-xs font-semibold tracking-wide text-crema">
                      N° {due(p.dropNumber ?? 0)}
                      <span className="text-crema/60"> / {due(pieces.length)}</span>
                    </span>
                    {sold ? (
                      <span className="pillola-piccola absolute bottom-2 left-2 border-crema bg-crema text-verde">Venduto</span>
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col px-3 pb-4 pt-3">
                    <h3 className="text-[0.875rem] font-medium leading-snug group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
                      {p.name}
                    </h3>
                    <p className="mt-auto flex items-baseline justify-between gap-2 pt-2 text-xs text-crema/75">
                      <span>Taglia {p.sizes[0]?.label}</span>
                      <span className={`cifre text-[0.875rem] font-semibold text-crema ${sold ? "line-through decoration-1" : ""}`}>
                        {euro(p.price)}
                      </span>
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
