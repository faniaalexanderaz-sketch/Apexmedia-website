import { sito } from "@/content/sito";
import { Contatore } from "./anim/Contatore";
import { Icona, type NomeIcona } from "./Icona";

/** Fascia di fiducia sotto l'hero: solo fatti veri e confermati. */
export function FasciaFiducia() {
  const voci: { icona: NomeIcona; titolo: React.ReactNode; testo: string }[] = [
    { icona: "famiglia", titolo: "Impresa di famiglia", testo: `Oggi la guida ${sito.titolare}` },
    {
      icona: "posizione",
      titolo: (
        <>
          <Contatore valore={sito.anniAttivita} /> anni ad Alessandria
        </>
      ),
      testo: "Stessa famiglia, stesso territorio",
    },
    {
      icona: "documento",
      titolo: (
        <>
          Preventivo in <Contatore valore={sito.oreRisposta} /> ore
        </>
      ),
      testo: "Scritto e senza impegno",
    },
    { icona: "persona", titolo: "Risponde il titolare", testo: "Al telefono e su WhatsApp" },
  ];

  return (
    <section aria-label="Perché sceglierci" className="contenitore relative z-10">
      <ul className="scheda grid gap-px overflow-hidden bg-[rgb(11_52_90/0.08)] sm:grid-cols-2 lg:grid-cols-4">
        {voci.map((v) => (
          <li key={v.testo} className="flex items-center gap-4 bg-white p-5 lg:p-6">
            <span className="bollo h-12 w-12 rounded-[14px]">
              <Icona nome={v.icona} />
            </span>
            <span>
              <span className="font-titoli text-blu-notte block text-[1.125rem] leading-tight font-bold">{v.titolo}</span>
              <span className="testo-2 block text-[0.875rem] leading-snug">{v.testo}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
