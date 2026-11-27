import Link from "next/link";
import { servizi } from "@/content/servizi";
import { sito } from "@/content/sito";
import { Icona } from "./Icona";
import { Logo } from "./Logo";
import { MenuMobile } from "./MenuMobile";

export function Header() {
  return (
    <header className="border-linea sticky top-0 z-40 border-b bg-white">
      <div className="contenitore flex h-16 items-center justify-between gap-6 lg:h-20">
        <Link href="/" aria-label="Star Clean, pagina iniziale" className="shrink-0">
          <Logo />
        </Link>

        <nav aria-label="Servizi" className="hidden items-center gap-1 xl:flex">
          {servizi.map((s) => (
            <Link
              key={s.slug}
              href={`/${s.slug}`}
              className="text-inchiostro hover:bg-cielo rounded-full px-4 py-2 text-[0.9375rem] font-medium transition-colors"
            >
              {s.nomeBreve}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 lg:gap-3">
          <a href={sito.telefono.href} className="text-blu-notte hidden items-center gap-2 rounded-full px-3 py-2 font-semibold whitespace-nowrap sm:inline-flex">
            <span className="bg-accento flex h-8 w-8 items-center justify-center rounded-full">
              <Icona nome="telefono" className="h-4 w-4" />
            </span>
            {sito.telefono.mostrato}
          </a>
          <Link href="/preventivo" className="btn btn-accento hidden min-h-[44px] px-5 text-[0.9375rem] md:inline-flex">
            Richiedi preventivo
          </Link>
          <MenuMobile />
        </div>
      </div>
    </header>
  );
}
