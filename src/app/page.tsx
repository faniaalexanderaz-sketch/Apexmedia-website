import Image from "next/image";
import Link from "next/link";
import Button from "@/components/Button";
import Card from "@/components/Card";
import Eyebrow from "@/components/Eyebrow";

const stats = [
  { value: "24.8M", label: "Impression generate" },
  { value: "18.7M", label: "Reach mensile medio" },
  { value: "8.74x", label: "ROI medio campagne" },
  { value: "7.3%", label: "Engagement rate" },
];

const services = [
  {
    title: "Strategia social",
    copy: "Piani editoriali e posizionamento costruiti sui dati, non sull'istinto.",
  },
  {
    title: "Content creation",
    copy: "Video, fotografia e grafica prodotti in studio, pensati per fermare lo scroll.",
  },
  {
    title: "Paid advertising",
    copy: "Campagne Meta, TikTok e LinkedIn ottimizzate per il risultato che conta.",
  },
];

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden bg-mesh px-6 pt-20 pb-28 md:pt-28 md:pb-36">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <Eyebrow>Social Media Agency</Eyebrow>
          <h1 className="mt-8 text-balance font-display text-5xl leading-[1.05] tracking-tight md:text-7xl">
            Ideas create <span className="text-gold-bright">impact.</span>
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted md:text-lg">
            Apex Media trasforma la presenza social del tuo brand in crescita
            misurabile: strategia, contenuti e advertising in un unico studio.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button href="/contatti">Prenota una call</Button>
            <Button href="/portfolio" variant="ghost">
              Guarda i risultati
            </Button>
          </div>
        </div>
      </section>

      <section className="border-y border-hairline px-6 py-14">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center md:text-left">
              <p className="font-display text-3xl text-gold-bright md:text-4xl">
                {stat.value}
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.15em] text-muted">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-24 md:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <Eyebrow>Cosa facciamo</Eyebrow>
              <h2 className="mt-4 max-w-lg text-balance font-display text-3xl md:text-4xl">
                Un solo studio, ogni leva della crescita social.
              </h2>
            </div>
            <Link
              href="/servizi"
              className="text-sm text-muted underline decoration-hairline underline-offset-4 hover:text-gold-bright"
            >
              Tutti i servizi →
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card className="md:col-span-2 md:row-span-2">
              <div className="relative h-full min-h-80 overflow-hidden rounded-[calc(2rem-0.5rem)]">
                <Image
                  src="/images/studio-desk.png"
                  alt="Postazione di editing video dello studio Apex Media, di notte, con vista sullo skyline"
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 50vw, 100vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute bottom-0 p-6">
                  <p className="font-display text-xl text-foreground">Content creation</p>
                  <p className="mt-1 max-w-xs text-sm text-muted">
                    Studio interno per video, foto e grafica su misura.
                  </p>
                </div>
              </div>
            </Card>

            {services.map((service) => (
              <Card key={service.title} className="p-0">
                <div className="p-6">
                  <p className="font-display text-lg">{service.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{service.copy}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 md:py-32">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 md:grid-cols-2">
          <div>
            <Eyebrow>Risultati</Eyebrow>
            <h2 className="mt-4 text-balance font-display text-3xl md:text-4xl">
              Ogni campagna misurata come un investimento.
            </h2>
            <p className="mt-4 max-w-md text-pretty leading-relaxed text-muted">
              Dashboard dedicate e report settimanali: sai sempre dove va il
              budget e cosa sta funzionando, senza dover chiedere.
            </p>
            <div className="mt-8">
              <Button href="/portfolio" variant="ghost">
                Vedi i case study
              </Button>
            </div>
          </div>
          <Card>
            <div className="relative h-80 overflow-hidden rounded-[calc(2rem-0.5rem)] md:h-96">
              <Image
                src="/images/analytics-wall.png"
                alt="Parete di dashboard con metriche di crescita audience ed engagement social di Apex Media"
                fill
                className="object-cover"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            </div>
          </Card>
        </div>
      </section>

      <section className="px-6 pb-28">
        <div className="mx-auto max-w-6xl">
          <Card className="p-0">
            <div className="relative flex flex-col items-center gap-6 overflow-hidden rounded-[calc(2rem-0.5rem)] px-6 py-20 text-center">
              <Image
                src="/images/reception.png"
                alt="Reception con logo Apex Media illuminato"
                fill
                className="object-cover opacity-25"
                sizes="100vw"
              />
              <div className="relative">
                <h2 className="text-balance font-display text-3xl md:text-4xl">
                  Pronto a far contare i tuoi social?
                </h2>
                <p className="mx-auto mt-4 max-w-md text-pretty text-muted">
                  Raccontaci il tuo brand: torniamo con una proposta entro 48 ore.
                </p>
                <div className="mt-8 flex justify-center">
                  <Button href="/contatti">Parliamone</Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </>
  );
}
