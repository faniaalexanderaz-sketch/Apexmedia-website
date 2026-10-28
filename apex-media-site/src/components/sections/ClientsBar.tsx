import { Container } from "@/components/ui/Container";
import { portfolio } from "@/data/portfolio";

/** Loghi monocromi non disponibili: nomi in Space Grotesk (vedi segnaposto). */
export function ClientsBar() {
  return (
    <section aria-label="Alcune attività che seguiamo" className="border-y border-ink/10">
      <Container className="flex flex-col gap-4 py-5 md:flex-row md:items-center md:gap-10">
        <p className="label-mono shrink-0 text-ink/60">Alcune attività che seguiamo</p>
        <ul className="no-scrollbar -mx-5 flex gap-8 overflow-x-auto px-5 sm:-mx-8 sm:px-8 md:mx-0 md:flex-1 md:justify-between md:px-0 lg:gap-12">
          {portfolio.map((c) => (
            <li
              key={c.slug}
              className="shrink-0 whitespace-nowrap font-display text-[20px] font-bold leading-none tracking-tightest text-ink/50"
              data-client-logo={c.slug}
            >
              {c.name}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
