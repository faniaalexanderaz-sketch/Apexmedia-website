import { CtaButton } from "./CtaButton";
import { SectionHeading } from "./SectionHeading";
import { IconCheck } from "./icons";

const PUNTI = [
  "Analisi tecnica del tuo sito: velocità, mobile, presenza su Google.",
  "I 3 problemi principali che ti fanno perdere clienti, in ordine di priorità.",
  "Correzioni pratiche, da applicare subito — anche da solo.",
  "Una chiamata di 15 minuti per spiegarti tutto, senza slide né tecnicismi.",
];

export function OfferSection() {
  return (
    <section id="offerta" className="relative py-section">
      <div aria-hidden="true" className="absolute inset-0 bg-radial-blue opacity-60" />
      <div className="relative mx-auto max-w-content px-5 sm:px-8">
        <SectionHeading eyebrow="L'audit gratuito" title="Cosa ricevi, in concreto." />

        <div className="glass-card mx-auto mt-12 max-w-[640px] rounded-2xl p-6 sm:mt-14 sm:p-8">
          <ul className="space-y-4">
            {PUNTI.map((punto) => (
              <li key={punto} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-yellow/15">
                  <IconCheck className="h-3.5 w-3.5 text-yellow" />
                </span>
                <span className="text-[15px] leading-snug text-white/85 sm:text-base">{punto}</span>
              </li>
            ))}
          </ul>

          <p className="mt-6 border-t border-white/10 pt-5 text-sm font-semibold text-white/60">
            Gratuito. Senza impegno. Nessuna carta di credito.
          </p>
        </div>

        <div className="mt-10 flex justify-center sm:mt-12">
          <CtaButton />
        </div>
      </div>
    </section>
  );
}
