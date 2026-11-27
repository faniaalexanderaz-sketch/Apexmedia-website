import { sito } from "@/content/sito";
import { LineaPassi } from "./anim/LineaPassi";
import { Icona, type NomeIcona } from "./Icona";
import { ChiusuraSezione } from "./Pulsanti";

const passi: { icona: NomeIcona; titolo: string; testo: string }[] = [
  {
    icona: "documento",
    titolo: "Richiesta",
    testo: "Compili il modulo in un minuto, chiami o scrivi su WhatsApp. Bastano il comune e i metri quadri.",
  },
  {
    icona: "sopralluogo",
    titolo: `Sopralluogo e preventivo in ${sito.oreRisposta} ore`,
    testo: "Se il lavoro è chiaro ricevi subito il prezzo scritto. Se serve vedere gli spazi, fissiamo un sopralluogo.",
  },
  {
    icona: "spazzola",
    titolo: "Lavoro",
    testo: "Veniamo nel giorno concordato, con macchine e prodotti. A fine lavoro controlli il risultato con noi.",
  },
];

/** I tre passi uniti da una linea che si disegna mentre si scorre. */
export function ComeLavoriamo({ preventivo = "/preventivo" }: { preventivo?: string }) {
  return (
    <section className="sezione bg-cielo">
      <div className="contenitore">
        <p className="occhiello bg-white">Come lavoriamo</p>
        <h2 className="titolo-2 mt-6 max-w-[18ch]">Dalla richiesta al lavoro finito, in tre passi.</h2>

        <LineaPassi className="relative mt-12 lg:mt-20">
          {/* binario e linea che si riempie: verticale su mobile, orizzontale da tablet */}
          <div aria-hidden className="absolute top-7 bottom-7 left-7 w-[2px] bg-[rgb(11_52_90/0.12)] md:top-7 md:right-[16%] md:bottom-auto md:left-7 md:h-[2px] md:w-auto">
            <div data-riempimento className="bg-blu h-full w-full origin-top md:origin-left" />
          </div>
          <ol className="relative grid gap-10 md:grid-cols-3 md:gap-8">
            {passi.map((p, i) => (
              <li key={p.titolo} data-passo className="flex gap-6 md:block">
                <span
                  data-punto
                  className="bg-blu border-blu flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 text-white"
                >
                  <Icona nome={p.icona} />
                </span>
                <div className="testo-passo md:mt-8">
                  <p className="text-blu-chiaro text-[0.8125rem] font-semibold tracking-[0.12em] uppercase">Passo {i + 1}</p>
                  <h3 className="titolo-3 mt-2 max-w-[16ch]">{p.titolo}</h3>
                  <p className="testo-2 mt-3 max-w-[26em]">{p.testo}</p>
                </div>
              </li>
            ))}
          </ol>
        </LineaPassi>

        <ChiusuraSezione href={preventivo} testo="Inizia dal passo 1" />
      </div>
    </section>
  );
}
