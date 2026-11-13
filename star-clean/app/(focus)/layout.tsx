import { Logo } from "@/components/Logo";
import { sito } from "@/content/sito";

/** Pagine di conversione: niente menu e niente link in uscita. Solo marchio e telefono. */
export default function LayoutFocus({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-carta flex min-h-svh flex-col">
      <header className="border-linea border-b bg-white">
        <div className="contenitore flex h-16 items-center justify-between">
          <Logo />
          <a href={sito.telefono.href} className="font-extrabold whitespace-nowrap">{sito.telefono.mostrato}</a>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
