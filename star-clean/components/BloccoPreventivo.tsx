import { sito } from "@/content/sito";
import type { ChiaveServizio } from "@/content/servizi";
import { FormPreventivo } from "./FormPreventivo";
import { Icona } from "./Icona";
import { PulsanteWhatsApp } from "./Pulsanti";

/** Sezione con il modulo: testo e contatti a sinistra, modulo a destra. Usata in home e nelle pagine servizio. */
export function BloccoPreventivo({ titolo, servizio, whatsapp }: { titolo: string; servizio?: ChiaveServizio; whatsapp?: string }) {
  return (
    <section id="preventivo" className="sezione bg-blu-notte relative scroll-mt-16 overflow-hidden text-white">
      <div aria-hidden className="pointer-events-none absolute -top-40 -right-40 h-[520px] w-[520px] rounded-full bg-[radial-gradient(closest-side,rgb(124_196_238/0.22),transparent)]" />
      <div className="contenitore griglia relative gap-y-12">
        <div className="col-span-12 lg:col-span-5">
          <p className="occhiello occhiello-chiaro">Preventivo</p>
          <h2 className="titolo-2 mt-6 max-w-[14ch] text-white">{titolo}</h2>
          <p className="misura mt-6 text-[1.125rem] text-white/75">
            Tre domande, un minuto. Entro {sito.oreRisposta} ore ti mandiamo il prezzo scritto, senza impegno.
          </p>
          <div className="mt-10 rounded-[var(--radius-scheda)] border border-white/10 bg-white/5 p-6">
            <p className="text-[0.9375rem] text-white/70">Preferisci parlarne a voce?</p>
            <a href={sito.telefono.href} className="font-titoli mt-2 flex items-center gap-3 text-[1.75rem] leading-tight font-bold text-white">
              <span className="bg-accento text-blu-notte flex h-11 w-11 items-center justify-center rounded-full">
                <Icona nome="telefono" className="h-5 w-5" />
              </span>
              {sito.telefono.mostrato}
            </a>
            <p className="mt-2 text-[0.9375rem] text-white/70">Risponde {sito.titolare}.</p>
            <PulsanteWhatsApp messaggio={whatsapp} className="mt-2 text-white" />
          </div>
        </div>
        <div className="text-inchiostro col-span-12 lg:col-span-6 lg:col-start-7">
          <FormPreventivo servizioIniziale={servizio} />
        </div>
      </div>
    </section>
  );
}
