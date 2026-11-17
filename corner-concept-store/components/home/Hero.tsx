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
          <figcaption className="hidden border-t border-linea px-4 py-2.5 text-xs text-marrone lg:block">
            La vetrina di via Modena 15. I numeri rimandano al listino qui a fianco.
          </figcaption>
        </figure>

        <div className="flex flex-col lg:col-span-4 lg:border-r lg:border-linea">
          <div className="px-4 pb-8 pt-5 md:px-8 lg:px-7 lg:pb-10 lg:pt-10 xl:px-9">
            <p className="occhiello text-marrone">Concept store · Alessandria</p>
            <h1
              id="hero-titolo"
              className="titolo mt-3 text-[2.5rem] [text-wrap:balance] xs:text-[2.75rem] md:text-6xl lg:mt-5 lg:text-[3.25rem] xl:text-[4.25rem]"
            >
              Vestiti che reggono la <span className="corsivo">nebbia.</span>
            </h1>
            <p className="mt-3 max-w-[46ch] text-[0.9375rem] leading-normal text-marrone lg:mt-6 lg:leading-relaxed">
              Giacche da campo, denim grezzo, Barbour di seconda mano, tute anni Settanta. Scelti uno per uno in via
              Modena 15, spediti in tutta Italia.
            </p>
            <div className="mt-5 flex flex-col items-start gap-3 lg:mt-8">
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

          {/* il listino della vetrina: in negozio è scritto a mano, qui è composto */}
          <div className="mt-auto border-t border-linea px-4 py-5 md:px-8 lg:px-7 xl:px-9">
            <h2 className="occhiello text-marrone">In vetrina adesso</h2>
            <ul className="mt-3">
              {items.map((item) => (
                <li key={item.n}>
                  <Link
                    href={productHref(item.product)}
                    className="group flex min-h-11 items-baseline gap-2.5 py-1.5 text-[0.875rem]"
                  >
                    <span className="cifre w-5 shrink-0 text-xs font-semibold text-ruggine">{item.n}</span>
                    <span className="font-medium group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
                      {item.label}
                    </span>
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
