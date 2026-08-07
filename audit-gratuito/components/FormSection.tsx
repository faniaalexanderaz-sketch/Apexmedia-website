import { LeadForm } from "./LeadForm";
import { SectionHeading } from "./SectionHeading";

export function FormSection() {
  return (
    <section id="form" className="relative py-section-lg">
      <div aria-hidden="true" className="absolute inset-0 bg-radial-purple opacity-70" />
      <div className="relative mx-auto max-w-content px-5 sm:px-8">
        <SectionHeading eyebrow="Ultimo passo" title="Richiedi il tuo audit gratuito." />
        <div className="mt-12 sm:mt-14">
          <LeadForm />
        </div>
      </div>
    </section>
  );
}
