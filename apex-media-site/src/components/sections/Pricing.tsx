import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Button } from "@/components/ui/Button";
import { TricolorStripe } from "@/components/ui/TricolorStripe";
import { plans, customPlanNote, formatPrice } from "@/data/pricing";

export function Pricing() {
  return (
    <section id="pacchetti" className="py-20 lg:py-28" data-section="pacchetti">
      <Container>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <SectionLabel numero="04" testo="Pacchetti" />
          </div>
          <div className="lg:col-span-9">
            <h2 className="h-display text-[clamp(2rem,1rem+3.6vw,4.25rem)]">Prezzi chiari.</h2>
            <p className="text-body mt-5 text-ink/75 md:text-lg">
              Scegli da dove partire. Lo adattiamo alla tua attività.
            </p>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3 md:items-end md:gap-0 lg:mt-20" data-plans>
          {plans.map((p) => (
            <article
              key={p.id}
              data-plan={p.id}
              className={`relative flex flex-col border border-ink/15 bg-surface ${
                p.highlight ? "md:z-10 md:-mx-px md:pb-4" : ""
              }`}
            >
              {p.highlight ? <TricolorStripe /> : <div className="h-[3px] w-full" aria-hidden="true" />}
              <div className="flex flex-1 flex-col p-6 md:p-7 lg:p-8">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-[26px] font-bold leading-none tracking-tightest">{p.name}</h3>
                  {p.badge ? (
                    <span className="label-mono bg-ink px-2 py-1.5 text-paper">{p.badge}</span>
                  ) : null}
                </div>
                <p className="mt-6 flex items-baseline gap-1.5">
                  <span className="font-display text-[clamp(2.75rem,2rem+2vw,3.75rem)] font-bold leading-none tracking-tightest">
                    {formatPrice(p.price)}
                  </span>
                  <span className="font-mono text-[12px] text-ink/60">/mese</span>
                </p>
                <ul className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
                  {p.features.map((f) => (
                    <li key={f} className="py-3 text-[15px] leading-snug">
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 pt-2">
                  <Button
                    href="#contatti"
                    variant={p.highlight ? "primary" : "secondary"}
                    className="w-full"
                    data-preselect={p.formValue}
                  >
                    {p.cta}
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-10 text-[17px] text-ink/75">
          {customPlanNote}{" "}
          <a href="#contatti" className="font-semibold text-ink underline decoration-1 underline-offset-[5px] hover:text-viola" data-preselect="Non lo so ancora">
            Parliamone
          </a>
        </p>
      </Container>
    </section>
  );
}
