"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Logomark from "./Logomark";

const links = [
  { href: "/", label: "Home" },
  { href: "/servizi", label: "Servizi" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/contatti", label: "Contatti" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 mt-6 flex justify-center px-4">
      <nav className="flex w-full max-w-3xl items-center justify-between gap-6 rounded-full border border-hairline bg-black/60 px-4 py-2.5 backdrop-blur-2xl">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <Logomark className="h-7 w-7" />
          <span className="font-display text-sm tracking-[0.12em] text-foreground">
            APEX MEDIA
          </span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`rounded-full px-4 py-2 text-sm transition-colors duration-500 ${
                    active
                      ? "bg-white/[0.06] text-gold-bright"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <Link
          href="/contatti"
          className="hidden rounded-full bg-gold px-5 py-2 text-sm font-medium text-[#0a0805] transition-colors duration-500 hover:bg-gold-bright md:inline-flex"
        >
          Parliamone
        </Link>

        <button
          type="button"
          aria-label={open ? "Chiudi il menu" : "Apri il menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-hairline md:hidden"
        >
          <span
            className={`absolute h-[1.5px] w-4 bg-foreground transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              open ? "rotate-45" : "-translate-y-[5px]"
            }`}
          />
          <span
            className={`absolute h-[1.5px] w-4 bg-foreground transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              open ? "-rotate-45" : "translate-y-[5px]"
            }`}
          />
        </button>
      </nav>

      <div
        className={`fixed inset-0 z-40 flex flex-col items-center justify-center gap-2 bg-black/85 backdrop-blur-3xl transition-opacity duration-500 md:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {links.map((link, i) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            style={{ transitionDelay: open ? `${100 + i * 60}ms` : "0ms" }}
            className={`font-display text-3xl transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              open ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
            } ${pathname === link.href ? "text-gold-bright" : "text-foreground"}`}
          >
            {link.label}
          </Link>
        ))}
        <Link
          href="/contatti"
          onClick={() => setOpen(false)}
          style={{ transitionDelay: open ? `${100 + links.length * 60}ms` : "0ms" }}
          className={`mt-6 rounded-full bg-gold px-6 py-2.5 text-sm font-medium text-[#0a0805] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            open ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
          }`}
        >
          Parliamone
        </Link>
      </div>
    </header>
  );
}
