import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { PlusIcon } from "@/components/ui/Icons";
import { faq } from "@/data/faq";

export function Faq() {
  return (
    <section id="faq" className="border-t border-ink/10 py-20 lg:py-28" data-section="faq">
      <Container>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-[calc(var(--nav-h)+40px)]">
              <SectionLabel numero="06" testo="FAQ" />
              <h2 className="h-display mt-6 text-[clamp(2rem,1rem+3.6vw,4.25rem)]">Domande.</h2>
            </div>
          </div>
          <div className="lg:col-span-7">
            <div className="border-t border-ink/10">
              {faq.map((item) => (
                <details key={item.q} className="group border-b border-ink/10">
                  <summary className="flex min-h-14 items-start justify-between gap-6 py-5">
                    <span className="font-display text-[20px] font-medium leading-tight tracking-tight md:text-[24px]">
                      {item.q}
                    </span>
                    <PlusIcon className="mt-1 shrink-0" />
                  </summary>
                  <p className="max-w-[56ch] pb-6 text-[17px] text-ink/80">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
