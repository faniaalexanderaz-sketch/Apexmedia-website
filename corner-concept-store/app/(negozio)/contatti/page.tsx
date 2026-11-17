import type { Metadata } from "next";
import Image from "next/image";
import { StaticMap, StoreHours } from "@/components/home/Negozio";
import { PageIntro } from "@/components/PageIntro";
import { SITE, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contatti",
  description: `CORNER Concept Store, ${SITE.address.street}, ${SITE.address.zip} ${SITE.address.city}. Telefono e WhatsApp ${SITE.phone}.`,
  alternates: { canonical: "/contatti" },
};

export default function ContattiPage() {
  return (
    <>
      <PageIntro eyebrow="Contatti" title="Scrivici, chiamaci o passa.">
        <p>Su WhatsApp rispondiamo in orario di negozio, di solito in pochi minuti.</p>
      </PageIntro>

      <div className="pagina grid gap-x-8 gap-y-10 py-12 md:py-20 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <dl className="border-t border-linea text-[0.9375rem]">
            <div className="grid grid-cols-[7rem_1fr] gap-x-4 border-b border-linea py-4">
              <dt className="occhiello pt-1 text-marrone">WhatsApp</dt>
              <dd>
                <a
                  href={whatsappLink("Ciao Corner, vi scrivo dal sito.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-riga cifre font-semibold"
                >
                  {SITE.phone}
                </a>
              </dd>
            </div>
            <div className="grid grid-cols-[7rem_1fr] gap-x-4 border-b border-linea py-4">
              <dt className="occhiello pt-1 text-marrone">Telefono</dt>
              <dd>
                <a href={SITE.phoneHref} className="link-riga cifre font-semibold">
                  {SITE.phone}
                </a>
              </dd>
            </div>
            <div className="grid grid-cols-[7rem_1fr] gap-x-4 border-b border-linea py-4">
              <dt className="occhiello pt-1 text-marrone">Instagram</dt>
              <dd>
                <a href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer" className="link-riga font-semibold">
                  @{SITE.instagram}
                </a>
              </dd>
            </div>
            <div className="grid grid-cols-[7rem_1fr] gap-x-4 border-b border-linea py-4">
              <dt className="occhiello pt-1 text-marrone">Indirizzo</dt>
              <dd>
                <address className="not-italic leading-relaxed">
                  {SITE.name}
                  <br />
                  {SITE.address.street}
                  <br />
                  {SITE.address.zip} {SITE.address.city} ({SITE.address.province})
                </address>
              </dd>
            </div>
          </dl>

          <h2 className="occhiello mt-8 text-marrone">Orari</h2>
          <StoreHours className="mt-3" />
          <figure className="mt-5">
            <div className="relative aspect-[5/3] bg-ombra">
              <Image
                src="/brand/orario-vetrina.jpg"
                alt="Gli orari del negozio scritti in lettere dorate sulla vetrina"
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-2 text-xs text-marrone">Gli stessi orari, come sono scritti sulla vetrina.</figcaption>
          </figure>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={whatsappLink("Ciao Corner, vi scrivo dal sito.")}
              target="_blank"
              rel="noopener noreferrer"
              className="bottone bottone-pieno"
            >
              Scrivici su WhatsApp
            </a>
            <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className="bottone bottone-contorno">
              Indicazioni per via Modena
            </a>
          </div>
        </div>

        <StaticMap className="lg:col-span-6 lg:col-start-7" />
      </div>
    </>
  );
}
