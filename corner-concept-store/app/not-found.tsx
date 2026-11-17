import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col">
      <div className="pagina flex flex-1 flex-col justify-center py-16">
        <Link href="/" aria-label="CORNER Concept Store, vai alla home" className="mb-12 self-start">
          <Logo variant="compatto" label={null} className="h-10 w-auto" />
        </Link>
        <p className="occhiello text-marrone">Errore 404</p>
        <h1 className="titolo mt-3 max-w-[14ch] text-[2.75rem] md:text-[4.5rem]">
          Qui non c&apos;è niente. Nemmeno la <span className="corsivo">nebbia.</span>
        </h1>
        <p className="mt-5 max-w-[44ch] text-[0.9375rem] leading-relaxed text-marrone">
          La pagina che cercavi non esiste più, oppure il capo è stato venduto. Il resto del negozio è al suo posto.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/shop" className="bottone bottone-pieno">
            Vai al catalogo
          </Link>
          <Link href="/" className="bottone bottone-contorno">
            Torna alla home
          </Link>
        </div>
      </div>
    </main>
  );
}
