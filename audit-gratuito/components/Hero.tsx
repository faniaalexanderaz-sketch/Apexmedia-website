import { CtaButton } from "./CtaButton";
import { ScanMock } from "./ScanMock";

export function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden pb-4 pt-14 sm:pb-0 sm:pt-20">
      <div aria-hidden="true" className="absolute inset-0 bg-radial-purple" />
      <div aria-hidden="true" className="absolute inset-0 bg-radial-blue" />

      <div className="relative mx-auto max-w-content px-5 sm:px-8">
        <div className="mx-auto max-w-[720px] text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-pulse-glow rounded-full bg-yellow" />
            </span>
            Audit gratuito · risposta in 24 ore
          </span>

          <h1 className="mt-6 font-display text-[2.3rem] font-bold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-[3.4rem]">
            Il tuo sito ti sta facendo
            <br className="hidden sm:block" /> perdere clienti.
            <span className="block text-yellow">Scoprilo gratis, in 24 ore.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-[480px] text-base text-white/60 sm:text-lg">
            Un audit vero del tuo sito: cosa non funziona e cosa sistemare per primo.
            Zero costi, zero impegno.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3">
            <CtaButton />
            <p className="text-xs text-white/40">
              Gratuito · nessuna carta richiesta · risposta entro 24 ore
            </p>
          </div>
        </div>

        <div className="mt-14 sm:mt-16">
          <ScanMock />
        </div>
      </div>
    </section>
  );
}
