import Link from "next/link";
import { sito } from "@/content/sito";
import { linkWhatsApp } from "@/lib/whatsapp";
import { Magnetico } from "./anim/Magnetico";
import { Icona, IconaWhatsApp } from "./Icona";

/** Pulsante preventivo: arancio, freccia nel cerchio, effetto magnetico su desktop. */
export function PulsantePreventivo({ href = "/preventivo", testo = "Richiedi preventivo", className = "" }: { href?: string; testo?: string; className?: string }) {
  return (
    <Magnetico className={className}>
      <Link href={href} className="btn btn-accento btn-freccia w-full">
        {testo}
        <span className="cerchio">
          <Icona nome="freccia" className="h-5 w-5" />
        </span>
      </Link>
    </Magnetico>
  );
}

export function PulsanteChiama({ className = "", chiaro = false }: { className?: string; chiaro?: boolean }) {
  return (
    <a href={sito.telefono.href} className={`btn ${chiaro ? "btn-linea-chiara" : "btn-linea"} gap-3 px-6 ${className}`}>
      <span className="bg-accento text-blu-notte flex h-8 w-8 items-center justify-center rounded-full">
        <Icona nome="telefono" className="h-4 w-4" />
      </span>
      {sito.telefono.mostrato}
    </a>
  );
}

export function PulsanteWhatsApp({ messaggio, className = "" }: { messaggio?: string; className?: string }) {
  return (
    <a href={linkWhatsApp(messaggio)} target="_blank" rel="noopener" className={`collegamento inline-flex min-h-[44px] items-center gap-2 ${className}`}>
      <IconaWhatsApp className="text-whatsapp h-5 w-5" />
      Scrivici su WhatsApp
    </a>
  );
}

/** Riga di chiusura delle sezioni lunghe: preventivo + chiamata. */
export function ChiusuraSezione({ href, testo = "Richiedi preventivo", chiaro = false }: { href?: string; testo?: string; chiaro?: boolean }) {
  return (
    <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:mt-16">
      <PulsantePreventivo href={href} testo={testo} />
      <PulsanteChiama chiaro={chiaro} />
    </div>
  );
}
