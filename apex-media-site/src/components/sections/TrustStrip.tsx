import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Badge ufficiali, usati così come sono: nessun ritaglio, filtro o ricolorazione.
 * Le due altezze sono diverse perché i file hanno margini interni diversi:
 * così i due marchi risultano alti uguali a occhio.
 */
const badges = [
  {
    src: "/badges/google-partner.png",
    alt: "Google Partner",
    width: 900,
    height: 900,
    className: "h-14 lg:h-[72px]",
    sizes: "(min-width: 1024px) 72px, 56px",
  },
  {
    src: "/badges/meta-business-partner-badge.webp",
    alt: "Meta Business Partner",
    width: 1200,
    height: 900,
    // Il file ha molto margine trasparente sopra e sotto: il margine negativo lo riassorbe, senza ritagliare l’immagine
    className: "-my-7 h-[124px] lg:-my-11 lg:h-44",
    sizes: "(min-width: 1024px) 235px, 166px",
  },
] as const;

/** Striscia di fiducia sotto l’hero: fondo bianco a tutta larghezza, così i badge si leggono puliti. */
export function TrustStrip() {
  return (
    <section
      aria-label="Certificazioni"
      className="border-y border-ink/10 bg-surface"
      data-section="certificazioni"
    >
      <Container className="py-9 lg:py-10">
        <Reveal stagger start="top 95%" className="flex flex-col items-center">
          <p className="label-mono text-center leading-[1.7] text-ink/60">
            <span className="inline-block whitespace-nowrap">
              Agenzia certificata Google Partner
            </span>{" "}
            <span className="inline-block whitespace-nowrap">
              e Meta Business Partner
            </span>
          </p>
          <ul
            className="mt-5 flex flex-wrap items-center justify-center gap-x-12 gap-y-4 sm:gap-x-20 lg:gap-x-28"
            role="list"
          >
            {badges.map((b) => (
              <li key={b.src} className="shrink-0">
                <Image
                  src={b.src}
                  alt={b.alt}
                  width={b.width}
                  height={b.height}
                  sizes={b.sizes}
                  className={`block w-auto ${b.className}`}
                />
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
