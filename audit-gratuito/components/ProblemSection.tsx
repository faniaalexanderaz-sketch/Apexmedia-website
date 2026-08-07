import { CtaButton } from "./CtaButton";
import { SectionHeading } from "./SectionHeading";
import { IconInvisible, IconNoConvert, IconSpeed } from "./icons";

const PROBLEMI = [
  {
    icon: IconSpeed,
    testo: "Lento. Il visitatore se ne va prima ancora che il sito carichi.",
  },
  {
    icon: IconNoConvert,
    testo: "Non converte. Tanti click, zero telefonate o prenotazioni.",
  },
  {
    icon: IconInvisible,
    testo: "Invisibile su Google. Se non ti trovano, per loro non esisti.",
  },
];

export function ProblemSection() {
  return (
    <section id="problema" className="relative py-section">
      <div className="mx-auto max-w-content px-5 sm:px-8">
        <SectionHeading eyebrow="Perché perdi clienti" title="Tre motivi per cui il telefono non squilla." />

        <div className="mt-12 grid gap-4 sm:mt-14 sm:grid-cols-3 sm:gap-5">
          {PROBLEMI.map(({ icon: Icon, testo }) => (
            <div key={testo} className="glass-card rounded-2xl p-6">
              <Icon className="h-7 w-7 text-yellow" />
              <p className="mt-4 text-[15px] font-medium leading-snug text-white/85">{testo}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center sm:mt-14">
          <CtaButton />
        </div>
      </div>
    </section>
  );
}
