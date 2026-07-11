import Image from "next/image";
import type { Metadata } from "next";
import Button from "@/components/Button";
import Card from "@/components/Card";
import Eyebrow from "@/components/Eyebrow";

export const metadata: Metadata = {
  title: "Servizi — Apex Media",
  description:
    "Strategia social, content creation, paid advertising e analytics: i servizi di Apex Media per far crescere il tuo brand sui social.",
};

const services = [
  {
    title: "Strategia social",
    copy: "Analizziamo posizionamento, competitor e audience per costruire un piano editoriale che parla la lingua del tuo brand e del tuo mercato.",
    bullets: [
      "Audit dei canali esistenti",
      "Piano editoriale trimestrale",
      "Tone of voice e linee guida",
    ],
    image: "/images/analytics-wall.png",
    alt: "Dashboard di strategia e crescita audience sulla parete dello studio Apex Media",
  },
  {
    title: "Content creation",
    copy: "Video, fotografia e grafica prodotti nel nostro studio: contenuti pensati per fermare lo scroll e raccontare il brand senza compromessi.",
    bullets: [
      "Riprese video e fotografiche in studio",
      "Montaggio e color grading",
      "Grafica e template per ogni formato",
    ],
    image: "/images/studio-desk.png",
    alt: "Postazione di editing video dello studio Apex Media",
  },
  {
    title: "Paid advertising",
    copy: "Campagne Meta, TikTok e LinkedIn gestite end-to-end, con budget allocato dove genera davvero risultato, non dove è più comodo.",
    bullets: [
      "Setup e struttura campagne",
      "Test creativi e A/B testing continuo",
      "Ottimizzazione settimanale del budget",
    ],
    image: "/images/lounge-tablet.png",
    alt: "Tablet con dashboard di performance advertising su un tavolo dello studio",
  },
  {
    title: "Community & reporting",
    copy: "Community gestita con tono coerente e report trasparenti: sai sempre cosa sta funzionando e perché, senza doverlo chiedere.",
    bullets: [
      "Gestione community e messaggi",
      "Report settimanali su metriche chiave",
      "Call di revisione mensile",
    ],
    image: "/images/showcase-shelf.png",
    alt: "Parete con mockup di contenuti social prodotti da Apex Media",
  },
];

export default function Servizi() {
  return (
    <>
      <section className="bg-mesh px-6 pt-20 pb-16 md:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Servizi</Eyebrow>
          <h1 className="mt-6 text-balance font-display text-4xl leading-tight md:text-6xl">
            Ogni leva della crescita social, sotto un solo tetto.
          </h1>
          <p className="mt-6 text-pretty leading-relaxed text-muted md:text-lg">
            Dalla strategia alla produzione, dall&apos;advertising alla community:
            costruiamo il sistema social del tuo brand senza passare da cinque
            fornitori diversi.
          </p>
        </div>
      </section>

      <section className="px-6 pb-28">
        <div className="mx-auto flex max-w-6xl flex-col gap-20 md:gap-28">
          {services.map((service, i) => (
            <div
              key={service.title}
              className={`grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16 ${
                i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
              }`}
            >
              <div>
                <span className="font-display text-sm text-gold-bright">
                  0{i + 1}
                </span>
                <h2 className="mt-3 text-balance font-display text-3xl md:text-4xl">
                  {service.title}
                </h2>
                <p className="mt-4 max-w-md text-pretty leading-relaxed text-muted">
                  {service.copy}
                </p>
                <ul className="mt-6 space-y-3">
                  {service.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3 text-sm">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold-bright" />
                      <span className="text-foreground/85">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Card>
                <div className="relative h-72 overflow-hidden rounded-[calc(2rem-0.5rem)] md:h-96">
                  <Image
                    src={service.image}
                    alt={service.alt}
                    fill
                    className="object-cover"
                    sizes="(min-width: 768px) 50vw, 100vw"
                  />
                </div>
              </Card>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-28">
        <div className="mx-auto max-w-6xl">
          <Card className="p-0">
            <div className="flex flex-col items-center gap-6 px-6 py-20 text-center">
              <h2 className="text-balance font-display text-3xl md:text-4xl">
                Non sai da dove iniziare?
              </h2>
              <p className="max-w-md text-pretty text-muted">
                Parliamo del tuo brand in una call gratuita di 30 minuti:
                usciamo con una direzione chiara, non con uno slide deck.
              </p>
              <Button href="/contatti">Prenota una call</Button>
            </div>
          </Card>
        </div>
      </section>
    </>
  );
}
