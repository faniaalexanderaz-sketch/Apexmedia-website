import Image from "next/image";
import { SITE, whatsappLink } from "@/lib/site";

// posizione di via Modena 15 sulla mappa, in percentuale (da verificare sul posto)
const PIN = { x: 39.1, y: 47.5 };

export function StaticMap({ className = "" }: { className?: string }) {
  return (
    <figure className={className}>
      <a
        href={SITE.mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block aspect-[4/3] overflow-hidden border border-linea bg-ombra"
        aria-label="Apri via Modena 15 in Google Maps"
      >
        <Image
          src="/brand/mappa-via-modena.jpg"
          alt="Mappa del centro di Alessandria: via Modena, tra via Trotti e via San Lorenzo, a pochi isolati da piazza della Libertà"
          fill
          sizes="(min-width: 1024px) 34vw, 100vw"
          className="object-cover"
        />
        <span
          aria-hidden="true"
          className="absolute flex -translate-x-1/2 -translate-y-full flex-col items-center"
          style={{ left: `${PIN.x}%`, top: `${PIN.y}%` }}
        >
          <span className="whitespace-nowrap bg-verde px-2.5 py-1.5 text-[0.6875rem] font-semibold tracking-wide text-crema">
            CORNER · via Modena 15
          </span>
          <span className="h-3 w-px bg-verde" />
          <span className="h-3.5 w-1.5 rounded-full bg-terracotta" />
        </span>
      </a>
      <figcaption className="mt-2 flex justify-between gap-4 text-xs text-marrone">
        <span>A cinque minuti a piedi da piazza della Libertà.</span>
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="link-riga shrink-0">
          © OpenStreetMap
        </a>
      </figcaption>
    </figure>
  );
}

export function StoreHours({ className = "" }: { className?: string }) {
  return (
    <dl className={`border-t border-linea text-sm ${className}`}>
      {SITE.hours.map((h) => (
        <div key={h.days} className="flex justify-between gap-6 border-b border-linea py-2.5">
          <dt>{h.days}</dt>
          <dd className="cifre text-right font-medium">
            {h.slots.map((slot) => (
              <span key={slot} className="block">
                {slot}
              </span>
            ))}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function Negozio() {
  return (
    <section id="negozio" aria-labelledby="negozio-titolo" className="scroll-mt-24">
      <div className="pagina grid gap-x-8 gap-y-10 py-12 md:py-20 lg:grid-cols-12">
        <figure className="lg:col-span-5">
          <div className="relative aspect-[4/5] bg-ombra">
            <Image
              src="/brand/negozio-tavolo.jpg"
              alt="Il tavolo in vetrina da CORNER: felpe, berretti a coste, un giubbino in denim e una polo in maglia sopra una foto d'epoca di Alessandria, con il listino scritto a mano"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
          <figcaption className="mt-2 text-xs text-marrone">
            Il tavolo della vetrina. In basso a sinistra, il listino: lo scriviamo ancora a mano.
          </figcaption>
        </figure>

        <div className="lg:col-span-3">
          <p className="occhiello text-marrone">Dal vivo</p>
          <h2 id="negozio-titolo" className="titolo mt-3 text-[2.25rem] md:text-5xl">
            Il negozio
          </h2>
          <address className="mt-5 text-[0.9375rem] not-italic leading-relaxed">
            <strong className="font-semibold">{SITE.name}</strong>
            <br />
            {SITE.address.street}
            <br />
            {SITE.address.zip} {SITE.address.city}
          </address>

          <h3 className="occhiello mt-7 text-marrone">Orari</h3>
          <StoreHours className="mt-3" />

          <div className="mt-7 flex flex-col gap-3">
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
          <p className="mt-4 text-sm text-marrone">
            Oppure chiama:{" "}
            <a href={SITE.phoneHref} className="link-riga cifre font-semibold text-verde">
              {SITE.phone}
            </a>
          </p>
        </div>

        <StaticMap className="lg:col-span-4" />
      </div>
    </section>
  );
}
