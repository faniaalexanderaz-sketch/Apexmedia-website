import type { Metadata } from "next";
import { FormPreventivo } from "@/components/FormPreventivo";
import { sito } from "@/content/sito";

export const metadata: Metadata = {
  title: "Richiedi un preventivo di pulizia ad Alessandria",
  description: "Tre domande, un minuto. Star Clean ti manda il prezzo scritto entro 24 ore.",
  alternates: { canonical: "/preventivo" },
};

export default function Preventivo() {
  return (
    <div className="contenitore griglia gap-y-6 py-10 lg:py-16">
      <div className="col-span-12 lg:col-span-5">
        <h1 className="text-[1.875rem] lg:text-[2.75rem]">Preventivo in {sito.oreRisposta} ore.</h1>
        <p className="testo-2 misura mt-4">Tre domande, un minuto. Poi ti richiamiamo noi con il prezzo.</p>
        <p className="mt-6 hidden lg:block">
          <span className="testo-2 block text-[0.9375rem]">Preferisci parlarne a voce?</span>
          <a href={sito.telefono.href} className="text-[1.75rem] font-extrabold">{sito.telefono.mostrato}</a>
        </p>
      </div>
      <div className="col-span-12 lg:col-span-6 lg:col-start-7">
        <FormPreventivo leggiServizioDaUrl />
        <p className="mt-6 lg:hidden">
          <span className="testo-2">Preferisci parlarne a voce? </span>
          <a href={sito.telefono.href} className="collegamento whitespace-nowrap">{sito.telefono.mostrato}</a>
        </p>
      </div>
    </div>
  );
}
