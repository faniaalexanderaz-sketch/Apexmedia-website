import Image from "next/image";
import type { Metadata } from "next";
import Button from "@/components/Button";
import Card from "@/components/Card";
import Eyebrow from "@/components/Eyebrow";

export const metadata: Metadata = {
  title: "Portfolio — Apex Media",
  description:
    "Case study reali di crescita social gestiti da Apex Media: engagement, reach e ROI misurati campagna per campagna.",
};

const caseStudies = [
  {
    brand: "Norte Atelier",
    category: "Fashion & lifestyle",
    summary:
      "Rilancio del canale Instagram con un nuovo linguaggio visivo e un piano editoriale settimanale, dopo mesi di crescita piatta.",
    metrics: [
      { value: "+214%", label: "crescita follower in 6 mesi" },
      { value: "6.8%", label: "engagement rate medio" },
      { value: "3.1x", label: "ROAS su campagne prodotto" },
    ],
    image: "/images/showcase-shelf.png",
    alt: "Mockup di contenuti social per il brand fashion Norte Atelier",
  },
  {
    brand: "Salvia Wellness",
    category: "Health & wellness",
    summary:
      "Strategia TikTok da zero per un centro benessere con tre sedi: contenuti educativi e format ricorrenti per costruire fiducia.",
    metrics: [
      { value: "1.9M", label: "visualizzazioni in 90 giorni" },
      { value: "412", label: "prenotazioni tracciate da TikTok" },
      { value: "47.2%", label: "tasso di completamento video" },
    ],
    image: "/images/lounge-tablet.png",
    alt: "Dashboard di performance TikTok per il brand wellness Salvia",
  },
  {
    brand: "Rocca Immobiliare",
    category: "Real estate",
    summary:
      "Campagne LinkedIn e Meta per generare lead qualificati su immobili di fascia alta, con reportistica settimanale sul CPL.",
    metrics: [
      { value: "8.74x", label: "ROI sulle campagne lead" },
      { value: "€38", label: "costo per lead qualificato" },
      { value: "126", label: "lead generati nel trimestre" },
    ],
    image: "/images/analytics-wall.png",
    alt: "Dashboard di lead generation per il brand immobiliare Rocca",
  },
];

export default function Portfolio() {
  return (
    <>
      <section className="bg-mesh px-6 pt-20 pb-16 md:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Portfolio</Eyebrow>
          <h1 className="mt-6 text-balance font-display text-4xl leading-tight md:text-6xl">
            Risultati, non promesse.
          </h1>
          <p className="mt-6 text-pretty leading-relaxed text-muted md:text-lg">
            Una selezione di progetti seguiti da Apex Media, con i numeri reali
            dietro ogni campagna.
          </p>
        </div>
      </section>

      <section className="px-6 pb-28">
        <div className="mx-auto flex max-w-6xl flex-col gap-8">
          {caseStudies.map((study) => (
            <Card key={study.brand} className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-5">
                <div className="relative h-64 md:col-span-2 md:h-full">
                  <Image
                    src={study.image}
                    alt={study.alt}
                    fill
                    className="rounded-t-[calc(2rem-0.5rem)] object-cover md:rounded-l-[calc(2rem-0.5rem)] md:rounded-tr-none"
                    sizes="(min-width: 768px) 40vw, 100vw"
                  />
                </div>
                <div className="flex flex-col justify-center px-6 py-8 md:col-span-3 md:px-10">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-gold-bright">
                    {study.category}
                  </span>
                  <h2 className="mt-2 font-display text-2xl md:text-3xl">
                    {study.brand}
                  </h2>
                  <p className="mt-3 max-w-lg text-pretty text-sm leading-relaxed text-muted">
                    {study.summary}
                  </p>
                  <div className="mt-6 grid grid-cols-3 gap-4 border-t border-hairline pt-6">
                    {study.metrics.map((metric) => (
                      <div key={metric.label}>
                        <p className="font-display text-xl text-gold-bright md:text-2xl">
                          {metric.value}
                        </p>
                        <p className="mt-1 text-xs leading-snug text-muted">
                          {metric.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="px-6 pb-28">
        <div className="mx-auto max-w-6xl">
          <Card className="p-0">
            <div className="flex flex-col items-center gap-6 px-6 py-20 text-center">
              <h2 className="text-balance font-display text-3xl md:text-4xl">
                Il prossimo case study può essere il tuo.
              </h2>
              <p className="max-w-md text-pretty text-muted">
                Raccontaci obiettivi e budget: ti diciamo con onestà se e come
                possiamo aiutarti a crescere.
              </p>
              <Button href="/contatti">Prenota una call</Button>
            </div>
          </Card>
        </div>
      </section>
    </>
  );
}
