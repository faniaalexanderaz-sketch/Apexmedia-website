import Image from "next/image";
import Link from "next/link";
import { euro } from "@/lib/format";
import { getProduct, productHref } from "@/lib/products";

// Posizioni sulla foto (in % del ritaglio 5:4). Su mobile la foto è 3:2 ancorata in basso: la verticale si ricalcola.
const IN_VETRINA = [
  { n: "01", slug: "giacca-field-camo", label: "Giacca field camo", x: 34, y: 37 },
  { n: "02", slug: "jeans-denim-grezzo", label: "Jeans in denim grezzo", x: 47, y: 90 },
  { n: "03", slug: "felpa-canvas-ruggine", label: "Felpa in canvas ruggine", x: 88, y: 87 },
];

const mobileY = (y: number) => (y - 100 / 6) / (5 / 6);

export function Hero() {
  const items = IN_VETRINA.map((item) => ({ ...item, product: getProduct(item.slug)! }));

  return (
    <section className="border-b border-linea" aria-labelledby="hero-titolo">
      <div className="mx-auto grid w-full max-w-[90rem] lg:grid-cols-12 lg:px-8 xl:px-10">
        {/* foto vera della vetrina, due terzi della pagina */}
        <figure className="lg:col-span-8 lg:border-x lg:border-linea">
          <div className="relative aspect-[3/2] bg-ombra sm:aspect-[5/4]">
            <Image
              src="/brand/hero-vetrina.jpg"
              alt="La vetrina di CORNER in via Modena: un manichino con la giacca field camo foderata in arancione e i jeans in denim grezzo, accanto la felpa in canvas ruggine, sullo sfondo la carta da parati anni Settanta"
              fill
              preload
              sizes="(min-width: 1440px) 907px, (min-width: 1024px) 64vw, (min-width: 640px) 100vw, 70vw"
              className="object-cover object-bottom"
            />
            <ul aria-label="Capi in vetrina">
              {items.map((item) => (
                <li key={item.n}>
                  <Link
                    href={productHref(item.product)}
                    aria-label={`${item.label}, ${euro(item.product.price)}`}
                    style={{ "--x": `${item.x}%`, "--y": `${item.y}%`, "--ym": `${mobileY(item.y)}%` } as React.CSSProperties}
                    className="cifre absolute left-[var(--x)] top-[var(--ym)] flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-verde/30 bg-crema text-[0.6875rem] font-bold text-verde transition-colors duration-150 before:absolute before:-inset-2.5 before:content-[''] hover:bg-verde hover:text-crema sm:top-[var(--y)]"
                  >
                    {item.n}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* il listino della vetrina: in negozio è scritto a mano, qui è composto */}
          <figcaption className="hidden border-t border-linea lg:block">
            <ul className="grid xl:grid-cols-3 xl:divide-x xl:divide-linea">
              {items.map((item) => (
                <li key={item.n} className="border-b border-linea last:border-b-0 xl:border-b-0">
                  <Link href={productHref(item.product)} className="group flex min-h-12 items-baseline gap-2.5 px-4 py-3 text-[0.8125rem]">
                    <span className="cifre shrink-0 text-xs font-semibold text-ruggine">{item.n}</span>
                    <span className="font-medium group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
                      {item.label}
                    </span>
                    <span aria-hidden="true" className="min-w-3 flex-1 -translate-y-1 border-b border-dotted border-linea-forte" />
                    <span className="cifre font-semibold">{euro(item.product.price)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </figcaption>
        </figure>

        <div className="flex flex-col lg:col-span-4 lg:border-r lg:border-linea">
          <div className="flex flex-1 flex-col px-4 pb-8 pt-5 md:px-8 lg:justify-between lg:px-7 lg:py-9 xl:px-9 xl:py-10">
            <div>
              <p className="occhiello text-marrone">Concept store · Alessandria</p>
              <h1
                id="hero-titolo"
                className="titolo mt-3 text-[1.875rem] leading-[1.04] [text-wrap:balance] xs:text-[2rem] md:text-5xl lg:mt-4 lg:text-[2rem] xl:text-[2.625rem]"
              >
                Dal 2017, CORNER è un mix unico di ricerca, passione e stile.
              </h1>
              <p className="mt-3 max-w-[46ch] text-[0.9375rem] leading-normal text-marrone lg:mt-5 lg:leading-relaxed">
                Il nostro concept store è un luogo in cui l&apos;arte e la cultura si fondono con il fashion; ogni capo ha
                una storia e noi saremo felici di raccontarvela.
              </p>
            </div>
            <div className="mt-5 flex flex-col items-start gap-3 lg:mt-8">
              <p className="order-last mt-2 text-[0.9375rem] font-bold leading-snug lg:order-none lg:mb-3 lg:mt-0">
                CORNER
                <br />
                for modern gentlemen &amp; not ordinary women.
              </p>
              <Link href="/shop?ordina=novita" className="bottone bottone-pieno w-full sm:w-auto">
                Vedi i nuovi arrivi
                <span aria-hidden="true">→</span>
              </Link>
              <p className="pillola border-linea-forte text-verde">
                <span aria-hidden="true" className="h-3 w-1 rounded-full bg-oliva" />
                Spedizione in tutta Italia in 24/48h
              </p>
            </div>
          </div>

          {/* su mobile il listino resta sotto al testo */}
          <div className="border-t border-linea px-4 py-5 md:px-8 lg:hidden">
            <h2 className="occhiello text-marrone">In vetrina adesso</h2>
            <ul className="mt-3">
              {items.map((item) => (
                <li key={item.n}>
                  <Link href={productHref(item.product)} className="group flex min-h-11 items-baseline gap-2.5 py-1.5 text-[0.875rem]">
                    <span className="cifre w-5 shrink-0 text-xs font-semibold text-ruggine">{item.n}</span>
                    <span className="font-medium">{item.label}</span>
                    <span aria-hidden="true" className="min-w-4 flex-1 -translate-y-1 border-b border-dotted border-linea-forte" />
                    <span className="cifre font-semibold">{euro(item.product.price)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
