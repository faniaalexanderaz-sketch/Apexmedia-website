"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { servizi } from "@/content/servizi";
import { sito } from "@/content/sito";
import { linkWhatsApp } from "@/lib/whatsapp";
import { Icona, IconaWhatsApp } from "./Icona";

/**
 * Azioni sempre a portata: su mobile barra fissa in basso (Chiama, WhatsApp, Preventivo),
 * su desktop un pulsante WhatsApp tondo. Nelle pagine servizio messaggio e preventivo sono già sul servizio.
 */
export function BarraMobile() {
  const percorso = usePathname();
  const servizio = servizi.find((s) => percorso === `/${s.slug}`);
  const wa = linkWhatsApp(servizio?.whatsapp);
  const preventivo = servizio ? `/preventivo?servizio=${servizio.chiave}` : "/preventivo";

  return (
    <>
      <div
        className="border-linea fixed inset-x-0 bottom-0 z-40 grid grid-cols-[1fr_auto_1.35fr] gap-2 border-t bg-white/95 p-2 backdrop-blur-xl md:hidden"
        style={{ paddingBottom: "calc(8px + env(safe-area-inset-bottom))" }}
      >
        <a href={sito.telefono.href} className="btn btn-linea min-h-[52px] gap-2 px-3">
          <Icona nome="telefono" className="h-5 w-5" />
          Chiama
        </a>
        <a href={wa} target="_blank" rel="noopener" aria-label="Scrivici su WhatsApp" className="btn btn-linea min-h-[52px] w-[52px] px-0">
          <IconaWhatsApp className="text-whatsapp h-6 w-6" />
        </a>
        <Link href={preventivo} className="btn btn-accento min-h-[52px] px-3">
          Preventivo
        </Link>
      </div>

      <a
        href={wa}
        target="_blank"
        rel="noopener"
        aria-label="Scrivici su WhatsApp"
        className="text-whatsapp fixed right-6 bottom-6 z-30 hidden h-14 w-14 items-center justify-center rounded-full bg-white shadow-[var(--shadow-2)] ring-1 ring-black/5 transition-transform duration-300 hover:scale-105 md:flex"
      >
        <IconaWhatsApp className="h-7 w-7" />
      </a>
    </>
  );
}
