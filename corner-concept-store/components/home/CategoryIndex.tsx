import Image from "next/image";
import Link from "next/link";
import { pezzi } from "@/lib/format";
import { CATEGORIES, inCategory } from "@/lib/products";

export function CategoryIndex() {
  return (
    <section className="border-b border-linea" aria-labelledby="reparti-titolo">
      <div className="pagina grid gap-x-8 py-12 md:py-20 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="occhiello text-marrone">Il catalogo</p>
          <h2 id="reparti-titolo" className="titolo mt-3 text-[2.25rem] [text-wrap:balance] md:text-5xl">
            Sette reparti. Un bancone solo.
          </h2>
          <p className="mt-4 max-w-[38ch] text-[0.9375rem] leading-relaxed text-marrone">
            Il negozio è piccolo e si gira in due minuti. Qui è uguale: scegli il reparto, il resto viene da sé.
          </p>
          <figure className="mt-8 hidden lg:block">
            <div className="relative aspect-[4/5] w-full max-w-[19rem] bg-ombra">
              <Image
                src="/brand/cassa-tacchini.jpg"
                alt="Le tute Sergio Tacchini piegate su una cassa di legno, tra un trucker cap e i cimeli dell'U.S. Alessandria"
                fill
                sizes="304px"
                className="object-cover object-[30%_50%]"
              />
            </div>
            <figcaption className="mt-2 text-xs text-marrone">Reparto felpe: le tute sulla cassa, tra i cimeli dei Grigi.</figcaption>
          </figure>
        </div>

        <ol className="mt-8 border-t border-linea lg:col-span-8 lg:mt-0">
          {CATEGORIES.map((c) => {
            const count = inCategory(c.id).length;
            return (
              <li key={c.id} className="border-b border-linea">
                <Link
                  href={`/shop?categoria=${c.id}`}
                  className="group grid grid-cols-[2.25rem_1fr_auto] items-baseline gap-x-3 py-4 transition-colors duration-150 hover:bg-carta md:grid-cols-[3.5rem_minmax(0,1.4fr)_minmax(0,1fr)_auto] md:gap-x-6 md:px-3 md:py-5"
                >
                  <span className="cifre text-xs font-semibold text-ruggine md:text-sm">{c.number}</span>
                  <span className="titolo text-[1.75rem] md:text-[2.5rem]">{c.name}</span>
                  <span className="col-start-2 text-[0.8125rem] text-marrone md:col-start-auto">{c.note}</span>
                  <span className="cifre col-start-3 row-start-1 flex items-baseline gap-3 text-xs font-medium text-marrone md:col-start-auto md:row-start-auto md:text-[0.8125rem]">
                    {pezzi(count)}
                    <span aria-hidden="true" className="text-verde transition-transform duration-150 group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
