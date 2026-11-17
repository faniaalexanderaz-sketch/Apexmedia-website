import Link from "next/link";
import { Logo } from "@/components/Logo";
import { CATEGORIES } from "@/lib/products";
import { PAYMENT_METHODS, SITE, whatsappLink } from "@/lib/site";

const HELP = [
  { href: "/spedizioni-e-resi", label: "Spedizioni e resi" },
  { href: "/contatti", label: "Contatti" },
  { href: "/chi-siamo", label: "Chi siamo" },
  { href: "/privacy", label: "Privacy" },
];

export function Footer() {
  return (
    <footer className="su-verde bg-verde text-crema">
      <div className="pagina grid gap-x-8 gap-y-10 py-12 md:grid-cols-12 md:py-16">
        <div className="md:col-span-5">
          <Logo className="h-auto w-56 text-crema md:w-72" />
          <p className="mt-6 max-w-[34ch] text-sm leading-relaxed text-crema/80">
            Concept store di abbigliamento ad Alessandria. Dal vivo in via Modena, online in tutta Italia.
          </p>
        </div>

        <div className="md:col-span-3">
          <h2 className="occhiello text-ocra">Il negozio</h2>
          <address className="mt-4 text-sm not-italic leading-relaxed">
            {SITE.address.street}
            <br />
            {SITE.address.zip} {SITE.address.city} ({SITE.address.province})
          </address>
          <dl className="mt-4 space-y-1 text-sm leading-relaxed">
            {SITE.hours.map((h) => (
              <div key={h.days}>
                <dt className="inline text-crema/70">{h.days}: </dt>
                <dd className="cifre inline">{h.slots.join(" e ")}</dd>
              </div>
            ))}
          </dl>
          <ul className="mt-4 space-y-1 text-sm">
            <li>
              <a className="link-riga inline-flex min-h-9 items-center" href={SITE.phoneHref}>
                {SITE.phone}
              </a>
            </li>
            <li>
              <a
                className="link-riga inline-flex min-h-9 items-center"
                href={whatsappLink("Ciao Corner, ho una domanda.")}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
            </li>
            <li>
              <a
                className="link-riga inline-flex min-h-9 items-center"
                href={SITE.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram @{SITE.instagram}
              </a>
            </li>
          </ul>
        </div>

        <nav aria-label="Catalogo" className="md:col-span-2">
          <h2 className="occhiello text-ocra">Catalogo</h2>
          <ul className="mt-4 space-y-1 text-sm">
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <Link className="inline-flex min-h-9 items-center hover:underline hover:decoration-1 hover:underline-offset-4" href={`/shop?categoria=${c.id}`}>
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Aiuto" className="md:col-span-2">
          <h2 className="occhiello text-ocra">Aiuto</h2>
          <ul className="mt-4 space-y-1 text-sm">
            {HELP.map((l) => (
              <li key={l.href}>
                <Link className="inline-flex min-h-9 items-center hover:underline hover:decoration-1 hover:underline-offset-4" href={l.href}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-linea-chiara">
        <div className="pagina flex flex-col gap-4 py-5 text-xs text-crema/70 md:flex-row md:items-center md:justify-between">
          <ul className="flex flex-wrap gap-2" aria-label="Pagamenti accettati">
            {PAYMENT_METHODS.map((m) => (
              <li key={m} className="pillola-piccola border-linea-chiara text-crema/90">
                {m}
              </li>
            ))}
          </ul>
          <p className="leading-relaxed">
            © 2026 {SITE.name}, {SITE.address.street}, {SITE.address.zip} {SITE.address.city}. Sito dimostrativo: ordini e
            pagamenti non sono reali. Realizzato da Apex Media.
          </p>
        </div>
      </div>
    </footer>
  );
}
