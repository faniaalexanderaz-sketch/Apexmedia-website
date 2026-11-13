import Link from "next/link";
import { servizi } from "@/content/servizi";
import { sito } from "@/content/sito";
import { Logo } from "./Logo";

export function Header() {
  return (
    <header className="border-linea sticky top-0 z-40 border-b bg-white">
      <div className="contenitore flex h-16 items-center justify-between gap-6 lg:h-[72px]">
        <Link href="/" aria-label="Star Clean, pagina iniziale" className="shrink-0">
          <Logo />
        </Link>

        <nav aria-label="Servizi" className="hidden items-center gap-10 lg:flex">
          {servizi.map((s) => (
            <Link
              key={s.slug}
              href={`/${s.slug}`}
              className="decoration-turchese text-[0.9375rem] font-bold underline-offset-[6px] hover:underline hover:decoration-2"
            >
              {s.nomeBreve}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-6">
          <a href={sito.telefono.href} className="text-[1rem] font-extrabold whitespace-nowrap">
            <span className="testo-2 mr-2 hidden text-[0.8125rem] font-bold xl:inline">Chiama</span>
            {sito.telefono.mostrato}
          </a>
          <Link href="/preventivo" className="btn btn-giallo hidden min-h-[44px] px-4 md:inline-flex">
            Richiedi preventivo
          </Link>
        </div>
      </div>
    </header>
  );
}
