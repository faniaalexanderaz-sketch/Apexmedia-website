import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { AccordionItem } from "@/components/ui/Accordion";
import { Reveal } from "@/components/ui/Reveal";
import { faq } from "@/data/faq";

export function Faq({ numero = "06" }: { numero?: string }) {
  return (
    <section
      id="faq"
      className="border-t border-ink/10 py-20 lg:py-28"
      data-section="faq"
    >
      <Container>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            {/* Il titolo resta fisso con position: sticky (CSS), non con pin */}
            <Reveal className="lg:sticky lg:top-[calc(var(--nav-h)+40px)]">
              <SectionLabel numero={numero} testo="FAQ" />
              <h2 className="h-display mt-6 text-[clamp(2rem,1rem+3.6vw,4.25rem)]">
                Domande frequenti.
              </h2>
            </Reveal>
          </div>
          <div className="lg:col-span-7">
            <Reveal stagger className="border-t border-ink/10">
              {faq.map((item) => (
                <AccordionItem
                  key={item.q}
                  className="border-b border-ink/10"
                  summaryClassName="min-h-14 py-5"
                  summary={
                    <span className="font-display text-[20px] font-medium leading-tight tracking-tight md:text-[24px]">
                      {item.q}
                    </span>
                  }
                >
                  <p className="max-w-[56ch] pb-6 text-[17px] text-ink/80">
                    {item.a}
                  </p>
                </AccordionItem>
              ))}
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
