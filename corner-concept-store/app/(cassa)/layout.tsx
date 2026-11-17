import Link from "next/link";
import { Logo } from "@/components/Logo";
import { SITE, whatsappLink } from "@/lib/site";

// Cassa: niente menu, niente distrazioni. Solo logo, via d'uscita e un contatto.
export default function CassaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-linea">
        <div className="pagina grid h-16 grid-cols-[1fr_auto_1fr] items-center md:h-[5.25rem]">
          <Link href="/shop" className="link-riga inline-flex min-h-11 items-center justify-self-start text-[0.8125rem] font-medium">
            <span aria-hidden="true" className="mr-1.5">
              ←
            </span>
            <span className="sm:hidden">Negozio</span>
            <span className="hidden sm:inline">Torna al negozio</span>
          </Link>
          <Link href="/" aria-label="CORNER Concept Store, vai alla home">
            <Logo variant="testata" label={null} className="h-[2.875rem] w-auto md:h-[3.75rem]" />
          </Link>
          <a
            href={whatsappLink("Ciao Corner, ho una domanda su un ordine.")}
            target="_blank"
            rel="noopener noreferrer"
            className="link-riga inline-flex min-h-11 items-center justify-self-end text-[0.8125rem] font-medium"
          >
            <span className="hidden sm:inline">Serve aiuto?&nbsp;</span>WhatsApp
          </a>
        </div>
      </header>
      <main id="contenuto" className="flex-1">
        {children}
      </main>
      <footer className="border-t border-linea">
        <div className="pagina flex flex-col gap-2 py-5 text-xs text-marrone sm:flex-row sm:items-center sm:justify-between">
          <p>
            {SITE.name}, {SITE.address.street}, {SITE.address.zip} {SITE.address.city}
          </p>
          <ul className="flex gap-5">
            <li>
              <Link href="/spedizioni-e-resi" className="link-riga">
                Spedizioni e resi
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="link-riga">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/contatti" className="link-riga">
                Contatti
              </Link>
            </li>
          </ul>
        </div>
      </footer>
    </>
  );
}
