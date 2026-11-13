import Link from "next/link";
import { Logo } from "@/components/Logo";
import { sito } from "@/content/sito";

export default function NonTrovata() {
  return (
    <main className="contenitore flex min-h-svh flex-col justify-center py-16">
      <Logo />
      <h1 className="titolo-1 mt-10 max-w-[14ch]">Questa pagina non esiste.</h1>
      <p className="testo-2 misura mt-6">
        Se cercavi un preventivo, sei a un passo. Altrimenti torna alla pagina iniziale.
      </p>
      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <Link href="/preventivo" className="btn btn-giallo">Richiedi preventivo</Link>
        <Link href="/" className="btn btn-linea">Torna alla home</Link>
      </div>
      <p className="mt-10">
        Oppure chiama <a className="collegamento" href={sito.telefono.href}>{sito.telefono.mostrato}</a>
      </p>
    </main>
  );
}
