import { sito } from "@/content/sito";
import { FormPreventivo } from "./FormPreventivo";

type Chiave = "civili" | "industriali" | "pavimenti";

/** Sezione con il modulo: testo e telefono a sinistra, modulo a destra. Usata in home e nelle pagine servizio. */
export function BloccoPreventivo({ titolo, servizio }: { titolo: string; servizio?: Chiave }) {
  return (
    <section id="preventivo" className="sezione bg-carta scroll-mt-16">
      <div className="contenitore griglia gap-y-10">
        <div className="col-span-12 lg:col-span-5">
          <p className="occhiello">Preventivo</p>
          <h2 className="titolo-2 mt-6 max-w-[14ch]">{titolo}</h2>
          <p className="testo-2 misura mt-6">
            Tre domande, un minuto. Entro {sito.oreRisposta} ore ti mandiamo il prezzo scritto.
          </p>
          <div className="border-linea mt-10 border-t pt-6">
            <p className="testo-2 text-[0.9375rem]">Preferisci parlarne a voce?</p>
            <p className="mt-1 text-[1.75rem] leading-tight font-extrabold">
              <a href={sito.telefono.href}>{sito.telefono.mostrato}</a>
            </p>
            <p className="testo-2 mt-1 text-[0.9375rem]">Risponde {sito.titolare}.</p>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-6 lg:col-start-7">
          <FormPreventivo servizioIniziale={servizio} />
        </div>
      </div>
    </section>
  );
}
