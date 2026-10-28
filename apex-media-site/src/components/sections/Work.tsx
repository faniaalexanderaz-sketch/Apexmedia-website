import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { BrowserFrame } from "@/components/ui/BrowserFrame";
import { PhoneFrame } from "@/components/ui/PhoneFrame";
import { Button } from "@/components/ui/Button";
import { ExternalIcon } from "@/components/ui/Icons";
import { portfolio } from "@/data/portfolio";

export function Work() {
  return (
    <section id="lavori" className="py-20 lg:py-28" data-section="lavori">
      <Container>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <SectionLabel numero="01" testo="Lavori" />
          </div>
          <div className="lg:col-span-9">
            <h2 className="h-display text-[clamp(2rem,1rem+3.6vw,4.25rem)]">
              Settori diversi. Stesso obiettivo: più clienti.
            </h2>
            <p className="text-body mt-5 text-ink/75 md:text-lg">
              Una parte delle attività che seguiamo ogni giorno, ad Alessandria e non solo.
            </p>
          </div>
        </div>

        <ol className="mt-12 lg:mt-16">
          {portfolio.map((item, i) => {
            const flip = i % 2 === 1;
            return (
              <li
                key={item.slug}
                className="border-t border-ink/10 py-10 lg:py-16"
                data-case={item.slug}
              >
                <article className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
                  <div
                    className={`relative lg:col-span-7 ${flip ? "lg:order-2 lg:col-start-6" : "lg:col-start-1"}`}
                  >
                    <div
                      className={`relative pb-[26%] lg:pb-[22%] ${flip ? "pr-6 sm:pr-10 lg:pr-0" : "pl-6 sm:pl-10 lg:pl-0"}`}
                    >
                      <BrowserFrame
                        url={item.domain}
                        shot={item.shots.desktop}
                        fullShot={item.shots.full}
                        alt={`Home page del sito ${item.name} su desktop`}
                        sizes="(min-width: 1024px) 55vw, 92vw"
                      />
                      <PhoneFrame
                        shot={item.shots.mobile}
                        alt={`Home page del sito ${item.name} su smartphone`}
                        sizes="(min-width: 1024px) 12vw, 24vw"
                        className={`absolute bottom-0 w-[28%] lg:w-[24%] ${flip ? "right-0 lg:-right-8" : "left-0 lg:-left-8"}`}
                      />
                    </div>
                  </div>

                  <div className={`lg:col-span-5 ${flip ? "lg:order-1 lg:col-start-1" : "lg:col-start-8"}`}>
                    <p className="font-mono text-[11px] tracking-label text-blu">
                      {String(i + 1).padStart(2, "0")}/{String(portfolio.length).padStart(2, "0")}
                    </p>
                    <h3 className="h-display mt-3 text-[clamp(2rem,1rem+3vw,3.5rem)]">{item.name}</h3>
                    <dl className="mt-8 border-t border-ink/10">
                      <div className="grid grid-cols-[112px_1fr] gap-4 border-b border-ink/10 py-4 sm:grid-cols-[150px_1fr]">
                        <dt className="label-mono pt-1 text-ink/60">Settore</dt>
                        <dd className="text-[16px] leading-snug">{item.sector}</dd>
                      </div>
                      <div className="grid grid-cols-[112px_1fr] gap-4 border-b border-ink/10 py-4 sm:grid-cols-[150px_1fr]">
                        <dt className="label-mono pt-1 text-ink/60">Cosa abbiamo fatto</dt>
                        <dd className="text-[16px] leading-snug">{item.work}</dd>
                      </div>
                      <div className="grid grid-cols-[112px_1fr] gap-4 border-b border-ink/10 py-4 sm:grid-cols-[150px_1fr]">
                        <dt className="label-mono pt-1 text-ink/60">Sito</dt>
                        <dd>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 font-mono text-[14px] text-ink underline decoration-1 underline-offset-4 hover:text-viola"
                          >
                            {item.domain}
                            <ExternalIcon />
                          </a>
                        </dd>
                      </div>
                    </dl>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>

        <div className="border-t border-ink/10 pt-8">
          <Button href="#contatti" variant="link" className="text-[17px] md:text-lg">
            Vuoi un lavoro così per la tua attività? Prenota la call
          </Button>
        </div>
      </Container>
    </section>
  );
}
