import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { methodSteps, methodNumbers } from "@/data/services";

export function Method() {
  return (
    <section id="metodo" className="bg-ink py-20 text-paper lg:py-28" data-section="metodo">
      <Container>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <SectionLabel numero="03" testo="Metodo" onDark />
          </div>
          <div className="lg:col-span-9">
            <h2 className="h-display text-[clamp(2rem,1rem+3.6vw,4.25rem)] text-paper">Come lavoriamo.</h2>
          </div>
        </div>

        <ol className="relative mt-16 grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-6 lg:mt-24" data-method-steps>
          <span aria-hidden="true" className="absolute left-[5px] top-0 h-full w-px bg-paper/20 md:left-0 md:top-[5px] md:h-px md:w-full" />
          {methodSteps.map((s) => (
            <li key={s.n} className="relative pl-8 md:pl-0 md:pt-8" data-method-step>
              <span aria-hidden="true" className="absolute left-0 top-[7px] size-[11px] bg-blu md:left-0 md:top-0" />
              <p className="font-mono text-[12px] tracking-label text-paper/70">{s.n}</p>
              <h3 className="mt-3 font-display text-[26px] font-bold leading-none tracking-tightest">{s.title}</h3>
              <p className="mt-3 max-w-[26ch] text-[16px] leading-relaxed text-paper/75">{s.text}</p>
            </li>
          ))}
        </ol>

        <dl className="mt-20 grid grid-cols-1 gap-8 border-t border-paper/20 pt-10 sm:grid-cols-3 lg:mt-28" data-method-numbers>
          {methodNumbers.map((n) => (
            <div key={n.label} className="flex items-baseline gap-5 sm:block">
              <dd className="font-display text-[clamp(4rem,2rem+5vw,7rem)] font-bold leading-none tracking-tightest" data-number={n.value}>
                {n.value}
              </dd>
              <dt className="max-w-[22ch] text-[15px] leading-snug text-paper/70 sm:mt-3">{n.label}</dt>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
