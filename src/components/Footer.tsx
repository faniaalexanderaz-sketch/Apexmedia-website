import Link from "next/link";
import Logomark from "./Logomark";

export default function Footer() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs">
          <div className="flex items-center gap-2">
            <Logomark className="h-6 w-6" />
            <span className="font-display text-lg font-extrabold tracking-tight">
              <span className="text-foreground">APEX</span>
              <span className="text-violet-bright">MEDIA</span>
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Strategia, contenuti e advertising per trasformare brand locali in autorità.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3">
          <div>
            <p className="eyebrow text-xs uppercase text-muted">Naviga</p>
            <ul className="mt-4 space-y-2">
              <li><Link href="/#servizi" className="text-foreground/80 hover:text-orange-bright">Servizi</Link></li>
              <li><Link href="/#lavori" className="text-foreground/80 hover:text-orange-bright">Portfolio</Link></li>
              <li><Link href="/#prezzi" className="text-foreground/80 hover:text-orange-bright">Prezzi</Link></li>
              <li><Link href="/#chi-siamo" className="text-foreground/80 hover:text-orange-bright">Chi siamo</Link></li>
              <li><Link href="/#contatti" className="text-foreground/80 hover:text-orange-bright">Contatti</Link></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow text-xs uppercase text-muted">Studio</p>
            <ul className="mt-4 space-y-2 text-foreground/80">
              <li>Alessandria, IT</li>
              <li>hello@infoapex.eu</li>
              <li>+39 351 594 0685</li>
            </ul>
          </div>
          <div>
            <p className="eyebrow text-xs uppercase text-muted">Social</p>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="text-foreground/80 hover:text-orange-bright">Instagram</a></li>
              <li><a href="#" className="text-foreground/80 hover:text-orange-bright">LinkedIn</a></li>
              <li><a href="#" className="text-foreground/80 hover:text-orange-bright">TikTok</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-hairline px-6 py-6 text-xs text-muted">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Apex Media. Tutti i diritti riservati.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground">Privacy Policy</a>
            <a href="#" className="hover:text-foreground">Termini di servizio</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
