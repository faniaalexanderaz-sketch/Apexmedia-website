import type { Metadata } from "next";
import Link from "next/link";
import { Conversione } from "@/components/Conversione";
import { sito } from "@/content/sito";

export const metadata: Metadata = {
  title: "Richiesta ricevuta",
  robots: { index: false, follow: false },
};

export default function Grazie() {
  return (
    <div className="contenitore py-16 lg:py-24">
      <Conversione />
      <p className="occhiello">Richiesta ricevuta</p>
      <h1 className="titolo-1 mt-6 max-w-[14ch]">Ti rispondiamo entro {sito.oreRisposta} ore.</h1>
      <p className="testo-2 misura mt-6 text-[1.125rem]">
        {sito.titolare} ha ricevuto i tuoi dati. Ti chiama al numero che hai lasciato per darti il prezzo o
        fissare un sopralluogo.
      </p>
      <div className="border-linea mt-10 max-w-[34em] border-t pt-6">
        <p className="testo-2">Hai fretta? Chiama adesso.</p>
        <p className="mt-2 text-[2rem] leading-tight font-extrabold">
          <a href={sito.telefono.href}>{sito.telefono.mostrato}</a>
        </p>
      </div>
      <p className="mt-10">
        <Link href="/" className="collegamento">Torna al sito</Link>
      </p>
    </div>
  );
}
