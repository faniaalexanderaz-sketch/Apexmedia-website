import Image from "next/image";
import gnute from "@/data/gnute.json";
import { ProductImage } from "@/components/ProductImage";
import { SITE } from "@/lib/site";

export function Gnute() {
  return (
    <section aria-labelledby="gnute-titolo" className="border-b border-linea">
      <div className="pagina grid gap-x-8 gap-y-10 py-12 md:py-20 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="occhiello text-marrone">Facce di Alessandria</p>
          <h2 id="gnute-titolo" className="titolo mt-3 text-[2.75rem] md:text-6xl">
            Gnute <span className="corsivo">da</span> Corner
          </h2>
          <p className="mt-5 max-w-[42ch] text-[0.9375rem] leading-relaxed text-marrone">
            Chi passa da via Modena, prima o poi finisce sul cartellone. Clienti, amici, facce che in città conoscono
            tutti: li fotografiamo in bianco e nero e li appendiamo in vetrina, accanto ai maglioni.
          </p>
          <a
            href={SITE.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="link-riga mt-5 inline-flex min-h-11 items-center text-sm font-semibold"
          >
            Gli altri ritratti sono su Instagram, @{SITE.instagram}
          </a>

          <figure className="mt-8 max-w-[26rem]">
            <div className="relative aspect-[4/5] bg-ombra">
              <Image
                src="/brand/vetrina-gnute.jpg"
                alt="La vetrina di CORNER con il cartellone Gnute da Corner: ritratti in bianco e nero appesi a una scala di legno, accanto al manichino con il parka"
                fill
                sizes="(min-width: 1024px) 416px, 100vw"
                className="object-cover object-[50%_32%]"
              />
            </div>
            <figcaption className="mt-2 text-xs text-marrone">Il cartellone vero, in vetrina in via Modena 15.</figcaption>
          </figure>
        </div>

        <div className="lg:col-span-7">
          <ul className="grid grid-cols-2 border-l border-t border-linea sm:grid-cols-4">
            {gnute.map((person) => (
              <li key={person.name} className="border-b border-r border-linea">
                <figure>
                  <div className="relative aspect-[4/5] bg-ombra [container-type:inline-size]">
                    <ProductImage
                      src={person.src}
                      alt={`Ritratto in bianco e nero di ${person.name}`}
                      name={person.name}
                      sizes="(min-width: 1024px) 14vw, (min-width: 640px) 24vw, 32vw"
                    />
                  </div>
                  <figcaption className="px-3 py-2.5">
                    <span className="titolo block text-xl">{person.name}</span>
                    <span className="occhiello mt-1 block text-marrone">{person.quartiere}</span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-marrone">
            Ritratti di esempio: qui vanno le foto del cartellone, con il consenso di chi è ritratto.
          </p>
        </div>
      </div>
    </section>
  );
}
