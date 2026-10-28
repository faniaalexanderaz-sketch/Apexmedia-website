import { Container } from "@/components/ui/Container";
import { GridLines } from "@/components/ui/GridLines";
import { Button } from "@/components/ui/Button";
import { BrowserFrame } from "@/components/ui/BrowserFrame";
import { PhoneFrame } from "@/components/ui/PhoneFrame";
import { portfolio } from "@/data/portfolio";
import { site } from "@/data/site";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden" data-hero>
      <GridLines />
      <Container className="relative">
        <div className="grid min-h-[calc(100svh-var(--nav-h)-4px)] grid-cols-1 items-center gap-10 py-12 lg:grid-cols-12 lg:gap-8 lg:py-16">
          <div className="lg:col-span-7">
            <p className="label-mono text-ink/60" data-hero-label>
              Agenzia di marketing — Alessandria
            </p>
            <h1
              className="h-display mt-6 text-[clamp(2.75rem,1rem+7vw,6.5rem)] text-ink"
              data-hero-title
            >
              Il marketing che fa <span className="hl">squillare il telefono</span>.
            </h1>
            <p className="text-body mt-7 max-w-[34rem] text-[17px] text-ink/80 md:text-lg" data-hero-sub>
              Social, video, pubblicità e siti web per attività locali. Un solo team,
              dal primo contenuto al cliente che ti chiama.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4" data-hero-cta>
              <Button href="#contatti">Prenota la call gratuita</Button>
              <Button href="#lavori" variant="link">
                Guarda i lavori
              </Button>
            </div>
            <p className="label-mono mt-8 flex items-center gap-2 text-ink/60">
              <span className="size-2 rounded-full bg-verde" aria-hidden="true" />
              {site.responseTime}
            </p>
          </div>

          <div className="relative lg:col-span-5" data-hero-shots>
            <div className="relative pb-[26%] pl-6 sm:pl-10 lg:pb-[22%] lg:pl-0">
              {portfolio.map((item, i) => (
                <div
                  key={item.slug}
                  data-hero-shot={i}
                  hidden={i !== 0}
                  className={i === 0 ? "" : "absolute inset-0"}
                >
                  <BrowserFrame
                    url={item.domain}
                    shot={item.shots.desktop}
                    fullShot={item.shots.full}
                    alt={`Home page del sito ${item.name} su desktop`}
                    priority={i === 0}
                    sizes="(min-width: 1024px) 42vw, 92vw"
                  />
                  <PhoneFrame
                    shot={item.shots.mobile}
                    alt={`Home page del sito ${item.name} su smartphone`}
                    priority={i === 0}
                    sizes="(min-width: 1024px) 10vw, 24vw"
                    className="absolute bottom-0 left-0 w-[28%] lg:-left-8 lg:w-[24%]"
                  />
                  <figcaption className="label-mono absolute bottom-0 left-[34%] text-ink/60 lg:left-auto lg:right-0 lg:text-right">
                    {item.caption}
                  </figcaption>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
