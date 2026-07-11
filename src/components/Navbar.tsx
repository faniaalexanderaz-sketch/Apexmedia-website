"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logomark from "./Logomark";

const links = [
  { href: "/#servizi", label: "Servizi" },
  { href: "/#lavori", label: "Portfolio" },
  { href: "/#prezzi", label: "Prezzi" },
  { href: "/#chi-siamo", label: "Chi siamo" },
  { href: "/#faq", label: "FAQ" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;
    function update() {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      setProgress(scrollable > 0 ? Math.min(1, doc.scrollTop / scrollable) : 0);
      ticking = false;
    }
    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 flex flex-col items-center">
      <div className="h-[2px] w-full" aria-hidden="true">
        <div
          className="h-full bg-gradient-to-r from-violet via-blue to-orange transition-[width] duration-150"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div className="mt-6 flex w-full justify-center px-4">
        <nav className="flex w-full max-w-3xl items-center justify-between gap-6 rounded-full border border-hairline bg-black/60 px-4 py-2.5 backdrop-blur-2xl">
          <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <Logomark className="h-7 w-7" />
            <span className="font-display text-lg font-extrabold tracking-tight">
              <span className="text-foreground">APEX</span>
              <span className="text-violet-bright">MEDIA</span>
            </span>
          </Link>

          <ul className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-full px-4 py-2 text-sm text-muted transition-colors duration-500 hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href="/#contatti"
            className="hidden rounded-full bg-gradient-to-r from-orange to-orange-bright px-5 py-2 text-sm font-semibold text-[#170c02] transition-transform duration-500 hover:scale-[1.03] md:inline-flex"
          >
            Richiedi consulenza
          </Link>

          <button
            type="button"
            aria-label={open ? "Chiudi il menu" : "Apri il menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-hairline"
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
      </div>

      <div
        className={`fixed inset-0 z-40 flex flex-col items-center justify-center gap-2 bg-black/85 backdrop-blur-3xl transition-opacity duration-500 ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {links.map((link, i) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            style={{ transitionDelay: open ? `${100 + i * 60}ms` : "0ms" }}
            className={`font-display text-3xl font-bold transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              open ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
            } ${pathname === link.href ? "text-violet-bright" : "text-foreground"}`}
          >
            {link.label}
          </Link>
        ))}
        <Link
          href="/#contatti"
          onClick={() => setOpen(false)}
          style={{ transitionDelay: open ? `${100 + links.length * 60}ms` : "0ms" }}
          className={`mt-6 rounded-full bg-gradient-to-r from-orange to-orange-bright px-6 py-2.5 text-sm font-semibold text-[#170c02] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            open ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
          }`}
        >
          Richiedi consulenza
        </Link>
      </div>
    </header>
  );
}
