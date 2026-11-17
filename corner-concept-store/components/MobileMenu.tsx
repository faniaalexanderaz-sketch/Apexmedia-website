"use client";

import Link from "next/link";
import { useState } from "react";
import { ChiudiPannello, Pannello } from "@/components/ui/Pannello";
import { CATEGORIES } from "@/lib/products";
import { SITE, whatsappLink } from "@/lib/site";

const LINKS = [
  { href: "/shop?ordina=novita", label: "Nuovi arrivi" },
  { href: "/shop", label: "Tutto il catalogo" },
  { href: "/#negozio", label: "Il negozio" },
  { href: "/chi-siamo", label: "Chi siamo" },
  { href: "/spedizioni-e-resi", label: "Spedizioni e resi" },
  { href: "/contatti", label: "Contatti" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="-ml-1 inline-flex min-h-11 items-center gap-2 px-1 text-[0.8125rem] font-semibold tracking-wide"
      >
        <span aria-hidden="true" className="flex w-4 flex-col gap-[5px]">
          <span className="h-px w-full bg-verde" />
          <span className="h-px w-full bg-verde" />
        </span>
        Menu
      </button>

      <Pannello open={open} onClose={close} side="sinistra" labelledBy="menu-titolo">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-linea px-5 py-2.5">
            <h2 id="menu-titolo" className="occhiello text-marrone">
              Menu
            </h2>
            <ChiudiPannello onClose={close} />
          </div>

          <nav aria-label="Categorie" className="overflow-y-auto overscroll-contain">
            <ul>
              {CATEGORIES.map((c) => (
                <li key={c.id} className="border-b border-linea">
                  <Link
                    href={`/shop?categoria=${c.id}`}
                    onClick={close}
                    className="flex min-h-[3.5rem] items-baseline gap-4 px-5 py-3"
                  >
                    <span className="cifre w-6 text-xs font-semibold text-ruggine">{c.number}</span>
                    <span className="titolo text-[1.625rem]">{c.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="px-5 py-4">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} onClick={close} className="flex min-h-11 items-center text-sm font-medium">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-auto border-t border-linea px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 text-xs leading-relaxed text-marrone">
            <p className="font-semibold text-verde">
              {SITE.address.street}, {SITE.address.city}
            </p>
            <p>Lun 9:30–19:30 · Mar–Sab 9:30–12:30, 15:30–19:30</p>
            <a
              href={whatsappLink("Ciao Corner, ho una domanda.")}
              className="link-riga mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-verde"
              target="_blank"
              rel="noopener noreferrer"
            >
              Scrivici su WhatsApp
            </a>
          </div>
        </div>
      </Pannello>
    </>
  );
}
