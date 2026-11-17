import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageIntro } from "@/components/PageIntro";
import { BRANDS } from "@/lib/products";

export const metadata: Metadata = {
  title: "Chi siamo",
  description:
    "CORNER è un concept store di abbigliamento in via Modena 15 ad Alessandria: workwear, militare, vintage e sportswear retrò, scelti uno per uno.",
  alternates: { canonical: "/chi-siamo" },
};

export default function ChiSiamoPage() {
  return (
    <>
      <PageIntro eyebrow="Chi siamo" title="Una bottega, non una boutique.">
        <p>
          CORNER è un negozio di abbigliamento in via Modena 15, nel centro di Alessandria. Teniamo poca roba e la
          scegliamo con un criterio solo: deve durare.
        </p>
      </PageIntro>

      <div className="pagina grid gap-x-8 gap-y-10 py-12 md:py-20 lg:grid-cols-12">
        <figure className="lg:col-span-5">
          <div className="relative aspect-[4/5] bg-ombra">
            <Image
              src="/brand/vetrina-camo.jpg"
              alt="L'interno di CORNER: un manichino con giacca camo e denim grezzo davanti alla carta da parati anni Settanta"
              fill
              preload
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
          <figcaption className="mt-2 text-xs text-marrone">Il negozio, con la carta da parati che non passa inosservata.</figcaption>
        </figure>

        <div className="lg:col-span-6 lg:col-start-7">
          <div className="space-y-5 text-base leading-relaxed md:text-[1.0625rem]">
            <p>
              Giacche da lavoro e militari, denim grezzo, maglieria di lana vera, tute Sergio Tacchini con il taglio degli
              anni Settanta. Ogni tanto arriva qualche Barbour di seconda mano: lo laviamo, lo riceriamo e lo rimettiamo in
              giro.
            </p>
            <p>
              In vetrina, tra un maglione e un berretto, ci sono le foto d&apos;epoca della città, i cimeli dei Grigi e i
              ritratti in bianco e nero di chi entra. Li chiamiamo <span className="corsivo text-[1.15em]">Gnute da Corner</span>.
            </p>
            <p>
              Il listino lo scriviamo ancora a mano. Il sito no, ma l&apos;idea è la stessa: poche cose, spiegate bene, al
              prezzo giusto. Adesso le spediamo in tutta Italia.
            </p>
          </div>

          <h2 className="occhiello mt-10 text-marrone">I marchi che trovi</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {BRANDS.map((brand) => (
              <li key={brand} className="pillola text-verde">
                {brand === "Barbour" ? "Barbour vintage" : brand}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/shop" className="bottone bottone-pieno">
              Vedi il catalogo
            </Link>
            <Link href="/#negozio" className="bottone bottone-contorno">
              Vieni a trovarci
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-linea">
        <div className="pagina grid gap-6 py-12 sm:grid-cols-3 md:py-16">
          {[
            { src: "/brand/cassa-tacchini.jpg", alt: "Tute Sergio Tacchini su una cassa di legno, con i cimeli dell'U.S. Alessandria", caption: "Le tute sulla cassa, tra i cimeli dei Grigi." },
            { src: "/brand/listino-a-mano.jpg", alt: "Il listino della vetrina scritto a mano", caption: "Il listino della vetrina, scritto a mano." },
            { src: "/brand/negozio-tavolo.jpg", alt: "Il tavolo in vetrina con felpe, berretti e una foto d'epoca della città", caption: "Il tavolo della vetrina, sopra una foto d'epoca." },
          ].map((item) => (
            <figure key={item.src}>
              <div className="relative aspect-[4/3] bg-ombra">
                <Image src={item.src} alt={item.alt} fill sizes="(min-width: 640px) 31vw, 100vw" className="object-cover" />
              </div>
              <figcaption className="mt-2 text-xs text-marrone">{item.caption}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </>
  );
}
