import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { Reveal } from "@/components/ui/Reveal";
import { ContactForm } from "./ContactForm";
import { site } from "@/data/site";

export function Contact() {
  return (
    <section id="contatti" className="border-t border-ink/10 py-20 lg:py-28" data-section="contatti">
      <Container>
        <SectionLabel numero="07" testo="Contatti" />
        <SplitHeading as="h2" type="words" stagger={0.04} className="h-display mt-6 max-w-[14ch] text-[clamp(2.5rem,1rem+5vw,6rem)]">
          Parliamo della tua attività.
        </SplitHeading>

        <div className="mt-14 grid grid-cols-1 gap-14 lg:mt-20 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <ContactForm />
          </div>

          <Reveal stagger className="lg:col-span-4 lg:col-start-9">
            <div className="border-t border-ink/10 pt-6">
              <p className="label-mono text-ink/60">WhatsApp</p>
              <a
                href={site.whatsappUrl}
                data-track="click_whatsapp"
                data-track-posizione="contatti"
                className="mt-3 block font-display text-[clamp(1.75rem,1rem+2.4vw,2.75rem)] font-bold leading-none tracking-tightest text-ink hover:text-viola"
              >
                {site.whatsappDisplay}
              </a>
            </div>
            <div className="mt-8 border-t border-ink/10 pt-6">
              <p className="label-mono text-ink/60">Email</p>
              <a
                href={`mailto:${site.email}`}
                data-track="click_email"
                data-track-posizione="contatti"
                className="mt-3 block break-all font-display text-[22px] font-medium tracking-tight text-ink hover:text-viola"
              >
                {site.email}
              </a>
            </div>
            <div className="mt-8 border-t border-ink/10 pt-6">
              <p className="label-mono flex items-center gap-2 text-ink/60">
                <span className="size-2 rounded-full bg-verde" aria-hidden="true" />
                {site.responseTime}
              </p>
              <p className="label-mono mt-3 text-ink/60">Alessandria · Piemonte</p>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
