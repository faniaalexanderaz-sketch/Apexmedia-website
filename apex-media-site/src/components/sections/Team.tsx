import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { team, teamIntro, showTeam } from "@/data/team";

/** Si mostra solo quando in team.ts ci sono le foto di entrambi. */
export function Team() {
  if (!showTeam) return null;

  return (
    <section id="chi-siamo" className="border-t border-ink/10 py-20 lg:py-28" data-section="chi-siamo">
      <Container>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <SectionLabel numero="05" testo="Chi siamo" />
            <h2 className="h-display mt-6 text-[clamp(2rem,1rem+3.6vw,4.25rem)]">Dietro Apex ci siamo noi.</h2>
            <p className="text-body mt-6 text-ink/80 md:text-lg">{teamIntro}</p>
          </div>
          <ul className="grid grid-cols-2 gap-4 lg:col-span-7 lg:gap-6">
            {team.map((m) => (
              <li key={m.name}>
                {m.photo ? (
                  <Image
                    src={m.photo.src}
                    width={m.photo.width}
                    height={m.photo.height}
                    alt={`${m.name}, ${m.role}`}
                    sizes="(min-width: 1024px) 28vw, 45vw"
                    className="aspect-[3/4] w-full object-cover"
                  />
                ) : null}
                <p className="mt-4 font-display text-[20px] font-bold leading-none tracking-tightest">{m.name}</p>
                <p className="label-mono mt-2 text-ink/60">{m.role}</p>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
