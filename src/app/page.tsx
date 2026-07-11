import Image from "next/image";
import Link from "next/link";
import Button from "@/components/Button";
import Eyebrow from "@/components/Eyebrow";
import GlowCard from "@/components/GlowCard";
import ServiceCard from "@/components/ServiceCard";
import MethodStep from "@/components/MethodStep";
import PricingCard from "@/components/PricingCard";
import PortfolioCard from "@/components/PortfolioCard";
import FaqItem from "@/components/FaqItem";
import ConsultationForm from "@/components/ConsultationForm";

const heroFeatures = [
  { number: "01", label: "Strategia", text: "text-violet-bright", border: "border-violet/30" },
  { number: "02", label: "Contenuti", text: "text-blue-bright", border: "border-blue/30" },
  { number: "03", label: "Conversione", text: "text-orange-bright", border: "border-orange/30" },
];

const notAgencyCards = [
  {
    color: "violet" as const,
    number: "01",
    struck: "Non pubblichiamo contenuti.",
    result: "Creiamo attenzione.",
    resultClass: "text-violet-bright",
  },
  {
    color: "orange" as const,
    number: "02",
    struck: "Non rincorriamo vanity metrics.",
    result: "Costruiamo crescita reale.",
    resultClass: "text-orange-bright",
  },
  {
    color: "blue" as const,
    number: "03",
    struck: "Non gestiamo profili a caso.",
    result: "Progettiamo sistemi che convertono.",
    resultClass: "text-blue-bright",
  },
];

const contentRows = [
  { index: "01", title: "Hook", copy: "Ganci pensati per catturare subito l'attenzione." },
  { index: "02", title: "Editing", copy: "Montaggio rapido, pulito e coerente con il brand." },
  { index: "03", title: "Conversione", copy: "Ogni contenuto avvicina l'utente alla richiesta." },
];

const services = [
  { category: "Strategy", title: "Strategia Social", copy: "Piani editoriali data-driven." },
  { category: "Creative", title: "Contenuti Virali", copy: "Reel e TikTok ad alta ritenzione." },
  { category: "Paid Media", title: "Gestione ADV", copy: "Meta & TikTok Ads ottimizzate per ROI." },
  { category: "Identity", title: "Branding", copy: "Direzione creativa premium." },
  { category: "Growth", title: "Acquisizione Clienti", copy: "Funnel che convertono follower in clienti." },
  { category: "Local", title: "Crescita Locale", copy: "Strategie territoriali ad alto impatto." },
  { category: "Analytics", title: "Analisi Dati", copy: "Reportistica chiara, decisioni misurabili." },
  { category: "Community", title: "Fidelizzazione", copy: "Community che diventano ambasciatori." },
  { category: "Web", title: "Siti & Landing", copy: "Presenze digitali pensate per convertire." },
];

const webFeatures = [
  { index: "01", title: "Design premium", copy: "Layout pulito, coerente con il brand." },
  { index: "02", title: "Struttura strategica", copy: "Ogni sezione guida verso la conversione." },
  { index: "03", title: "Copy che vende", copy: "Testi pensati per generare richieste." },
  { index: "04", title: "Mobile first", copy: "Esperienza fluida su ogni device." },
];

const methodSteps = [
  {
    number: "01",
    color: "violet" as const,
    title: "Analisi",
    copy: "Studiamo brand, target, competitor e punti deboli della comunicazione.",
  },
  {
    number: "02",
    color: "blue" as const,
    title: "Strategia",
    copy: "Creiamo una direzione chiara: cosa dire, come dirlo e a chi arrivare.",
  },
  {
    number: "03",
    color: "orange" as const,
    title: "Produzione",
    copy: "Realizziamo contenuti, visual e video pensati per fermare lo scroll.",
  },
  {
    number: "04",
    color: "foreground" as const,
    title: "Conversione",
    copy: "Colleghiamo social, advertising e sito per generare richieste reali.",
  },
];

const faqs = [
  {
    q: "Quanto tempo serve per vedere risultati?",
    a: "Primi miglioramenti immediati. Risultati solidi in 60-90 giorni.",
    defaultOpen: true,
  },
  {
    q: "Lavorate anche con attività locali?",
    a: "Sì, è il nostro core business: aiutiamo attività e brand locali a costruire una presenza digitale professionale.",
  },
  {
    q: "Realizzate anche siti web e landing page?",
    a: "Sì, progettiamo e sviluppiamo siti e landing page pensati per convertire, integrati con la strategia social.",
  },
  {
    q: "Gestite anche campagne ADV?",
    a: "Sì, gestiamo campagne Meta e TikTok Ads ottimizzate per il ritorno sull'investimento.",
  },
  {
    q: "Posso richiedere un pacchetto personalizzato?",
    a: "Certo, ogni piano può essere adattato alle esigenze specifiche del tuo brand.",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-mesh px-6 pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/images/studio-desk.png"
            alt="Studio Apex Media di notte con vista sullo skyline"
            fill
            className="object-cover opacity-25"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        </div>

        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <span className="eyebrow inline-flex items-center gap-2 rounded-full border border-hairline px-3 py-1.5 text-[11px] uppercase text-foreground/80">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Live · 12 campagne attive
          </span>

          <h1 className="mt-8 text-balance font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl md:text-7xl">
            Trasformiamo brand <em className="text-violet-bright">locali</em>{" "}
            <em className="text-orange-bright">in</em>{" "}
            autorità.
          </h1>

          <p className="accent mt-6 max-w-xl text-pretty text-lg italic leading-relaxed text-muted md:text-xl">
            Strategia, contenuti e advertising per{" "}
            <span className="font-sans not-italic font-bold text-foreground">
              costruire brand inattaccabili.
            </span>
          </p>

          <div className="mt-10">
            <Button href="/#contatti" variant="cream">
              Richiedi consulenza
            </Button>
          </div>

          <p className="accent mt-8 text-sm italic text-muted">
            Non post casuali. Sistemi che portano richieste.
          </p>

          <div className="mt-10 grid w-full max-w-lg grid-cols-3 gap-3">
            {heroFeatures.map((f) => (
              <div key={f.number} className={`rounded-2xl border px-4 py-4 text-left ${f.border}`}>
                <p className={`eyebrow text-xs ${f.text}`}>{f.number}</p>
                <p className="mt-2 text-sm font-semibold">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Non siamo un'altra agenzia */}
      <section className="px-6 py-24 md:py-32">
        <div className="mx-auto max-w-5xl text-center">
          <Eyebrow color="violet">Perché ApexMedia</Eyebrow>
          <h2 className="mt-5 text-balance font-display text-3xl font-extrabold leading-tight sm:text-5xl">
            Non siamo <span className="accent italic text-orange-bright">un&apos;altra</span> social
            media agency.
          </h2>

          <div className="mt-14 grid grid-cols-1 gap-5 text-left md:grid-cols-3">
            {notAgencyCards.map((card) => (
              <GlowCard key={card.number} color={card.color}>
                <p className={`eyebrow text-sm ${card.resultClass}`}>{card.number}</p>
                <div className="mt-4 h-px w-10 bg-hairline" />
                <p className="accent mt-6 italic text-muted line-through decoration-1">
                  {card.struck}
                </p>
                <p className={`mt-2 font-display text-2xl font-bold ${card.resultClass}`}>
                  {card.result}
                </p>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* Contenuti che fermano lo scroll */}
      <section className="relative overflow-hidden px-6 py-24 md:py-32">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/images/lounge-view.png"
            alt="Lounge dello studio Apex Media con vista sullo skyline notturno"
            fill
            className="object-cover opacity-20"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/85 to-background" />
        </div>

        <div className="mx-auto max-w-4xl">
          <span className="eyebrow flex flex-wrap items-center gap-2 text-xs uppercase text-muted">
            <span className="h-1 w-1 rounded-full bg-orange-bright" /> Contenuti · Hook · Conversione
          </span>
          <h2 className="mt-5 text-balance font-display text-3xl font-extrabold leading-tight sm:text-5xl">
            Contenuti che <span className="text-gradient-vb accent italic">fermano</span> lo scroll.
          </h2>
          <p className="mt-5 max-w-lg text-pretty text-lg text-muted">
            Script, editing e strategia per trasformare attenzione in richieste.
          </p>

          <div className="mt-14 divide-y divide-hairline rounded-3xl border border-hairline bg-white/[0.02]">
            {contentRows.map((row) => (
              <div key={row.index} className="flex items-center justify-between gap-6 px-6 py-6 sm:px-8">
                <div>
                  <p className="font-display text-xl font-bold">{row.title}</p>
                  <p className="mt-1 text-sm text-muted">{row.copy}</p>
                </div>
                <span className="eyebrow shrink-0 text-xs text-muted">/ {row.index}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Servizi carousel */}
      <section id="servizi" className="scroll-mt-24 px-6 py-24 md:py-32">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-display text-4xl font-extrabold leading-tight sm:text-6xl">
            <span className="text-foreground">Social</span>{" "}
            <span className="accent italic text-muted">Media</span>
            <br />
            Manager <span className="text-muted">—</span>
          </h2>
          <Eyebrow color="violet">Powered by performance</Eyebrow>
          <p className="mt-6 max-w-lg text-pretty text-lg text-muted">
            Un sistema per costruire autorità e trasformare l&apos;attenzione in{" "}
            <span className="accent italic text-orange-bright">fatturato</span>.
          </p>

          <div className="mt-14">
            {services.map((service, i) => (
              <ServiceCard
                key={service.title}
                index={i + 1}
                total={services.length}
                category={service.category}
                title={service.title}
                description={service.copy}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Siti web che convertono */}
      <section className="px-6 py-24 md:py-32">
        <div className="mx-auto max-w-4xl">
          <span className="eyebrow flex items-center gap-2 text-xs uppercase text-blue-bright">
            <span className="h-1 w-1 rounded-full bg-blue-bright" /> Web · Landing · Conversion
          </span>
          <h2 className="mt-5 text-balance font-display text-4xl font-extrabold leading-tight sm:text-6xl">
            Siti web che <span className="accent italic text-orange-bright">convertono.</span>
          </h2>
          <p className="accent mt-5 max-w-lg text-pretty text-lg italic text-muted">
            Una presenza digitale che trasmette fiducia e genera richieste.
          </p>

          <div className="mt-14 overflow-hidden rounded-3xl border border-hairline bg-surface">
            <div className="flex items-center gap-2 border-b border-hairline px-5 py-4">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
              <span className="eyebrow mx-auto text-[11px] text-muted">apexmedia.it / clienti</span>
            </div>
            <div className="space-y-4 p-6 sm:p-10">
              <div className="h-4 w-2/3 rounded-full bg-white/10" />
              <div className="h-4 w-1/3 rounded-full bg-gradient-to-r from-orange to-violet" />
              <div className="space-y-2 pt-2">
                <div className="h-2.5 w-4/5 rounded-full bg-white/[0.06]" />
                <div className="h-2.5 w-3/5 rounded-full bg-white/[0.06]" />
                <div className="h-2.5 w-2/5 rounded-full bg-white/[0.06]" />
              </div>
              <div className="pt-2">
                <span className="eyebrow inline-block rounded-full bg-gradient-to-r from-orange to-orange-bright px-5 py-2.5 text-[11px] uppercase text-[#170c02]">
                  Richiedi consulenza →
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="rounded-xl border border-hairline p-3">
                    <span className="block h-3 w-3 rounded-full bg-violet" />
                    <span className="mt-3 block h-2 w-3/4 rounded-full bg-white/10" />
                    <span className="mt-2 block h-2 w-1/2 rounded-full bg-white/10" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {webFeatures.map((f) => (
              <div key={f.index} className="rounded-2xl border border-hairline bg-white/[0.02] p-6">
                <div className="flex items-center justify-between">
                  <span className="eyebrow text-xs text-muted">/ {f.index}</span>
                  <span className="eyebrow rounded-full border border-blue/40 px-3 py-1 text-[10px] uppercase text-blue-bright">
                    Web
                  </span>
                </div>
                <p className="mt-4 font-display text-xl font-bold">{f.title}</p>
                <p className="mt-1 text-sm text-muted">{f.copy}</p>
              </div>
            ))}
          </div>

          <Link
            href="/#contatti"
            className="eyebrow mt-6 flex flex-col gap-3 rounded-3xl bg-gradient-to-r from-orange to-orange-bright px-8 py-8 text-lg uppercase text-[#170c02] transition-transform duration-500 hover:scale-[1.01] sm:flex-row sm:items-center sm:justify-between"
          >
            Progettiamo la tua presenza digitale
            <span aria-hidden="true" className="text-2xl">→</span>
          </Link>
        </div>
      </section>

      {/* Manifesto */}
      <section className="bg-mesh px-6 py-24 text-center md:py-32">
        <p className="accent mx-auto max-w-3xl text-balance text-2xl italic leading-relaxed text-foreground sm:text-4xl">
          Il sito non deve solo esistere. Deve{" "}
          <span className="font-sans not-italic font-extrabold text-orange-bright">lavorare</span>{" "}
          per il tuo brand.
        </p>
      </section>

      {/* Pricing */}
      <section id="prezzi" className="scroll-mt-24 px-6 py-24 md:py-32">
        <div className="mx-auto max-w-6xl text-center">
          <Eyebrow color="orange" lines>
            Investi nel tuo dominio
          </Eyebrow>
          <h2 className="mt-6 text-balance font-display text-4xl font-extrabold sm:text-6xl">
            Piani di <span className="accent italic text-orange-bright">dominio.</span>
          </h2>
          <p className="mt-4 text-lg text-muted">
            Tre livelli. Un solo obiettivo: <span className="accent italic">dominare</span>.
          </p>

          <div className="mt-16 grid grid-cols-1 gap-8 text-left lg:grid-cols-3">
            <PricingCard
              tier="Starter"
              badge="Brand emergenti"
              tagline="Basi solide. Presenza finalmente professionale."
              price={300}
              tone="plain"
              ctaLabel="Inizia ora"
              features={[
                "3 piattaforme gestite",
                "8 contenuti / mese",
                "Strategia base",
                "Ottimizzazione profilo",
                "Supporto WhatsApp",
                "Report mensile",
              ]}
            />
            <PricingCard
              tier="Growth"
              badge="Business in scale-up"
              tagline="Il sistema per trasformare i social in un asset reale."
              price={500}
              tone="orange"
              featured
              ctaLabel="Domina il mercato"
              features={[
                "3 piattaforme gestite",
                "14 contenuti / mese",
                "Strategia personalizzata",
                "Reel & TikTok studiati",
                "Supporto prioritario",
                "Report quindicinale",
              ]}
            />
            <PricingCard
              tier="Domination"
              badge="Brand high-ticket"
              tagline="Sistema completo. Posizionamento dominante."
              price={700}
              tone="blueviolet"
              ctaLabel="Power up"
              features={[
                "Tutte le piattaforme gestite",
                "Contenuti illimitati",
                "Sito web incluso",
                "Campagne ADV incluse",
                "Account manager dedicato",
                "Report settimanale",
              ]}
            />
          </div>
        </div>
      </section>

      {/* Il metodo Apex */}
      <section className="px-6 py-24 md:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <Eyebrow color="orange">Il metodo Apex</Eyebrow>
            <h2 className="mt-5 text-balance font-display text-3xl font-extrabold leading-tight sm:text-5xl">
              Dal contenuto alla <span className="accent italic text-orange-bright">richiesta.</span>
            </h2>
            <p className="mt-5 text-pretty text-lg text-muted">
              Ogni contenuto ha un ruolo: attirare attenzione, costruire fiducia e trasformare
              interesse in contatto.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {methodSteps.map((step) => (
              <MethodStep
                key={step.number}
                number={step.number}
                color={step.color}
                title={step.title}
                description={step.copy}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Selected works */}
      <section id="lavori" className="scroll-mt-24 px-6 py-24 md:py-32">
        <div className="mx-auto max-w-6xl">
          <span className="eyebrow flex items-center gap-2 text-xs uppercase text-violet-bright">
            <span className="h-1 w-1 rounded-full bg-violet-bright" /> Selected works · Apex studio
          </span>
          <h2 className="mt-5 text-balance font-display text-3xl font-extrabold leading-tight sm:text-5xl">
            Brand <span className="accent italic text-blue-bright">curati</span> nel dettaglio.
          </h2>
          <p className="mt-5 max-w-lg text-pretty text-lg text-muted">
            Una selezione di progetti dove metodo, visual e contenuti diventano percezione premium.
          </p>

          <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2">
            <PortfolioCard
              image="/images/showcase-shelf.png"
              imageAlt="Contenuti social prodotti da Apex Media per Essenza d'Oriente"
              client="Essenza d'Oriente"
              handle="@essenzadoriente"
              category="Centro olistico locale"
              work="Contenuti · Visual identity · Strategia social"
              quote="Presenza più chiara, ordinata, professionale."
              objective="Costruire fiducia locale e portare nuove richieste di prenotazione."
            />
            <PortfolioCard
              image="/images/lounge-tablet.png"
              imageAlt="Reel di authority prodotto da Apex Media per Aurea Clinic"
              client="Aurea Clinic"
              handle="@aurea.clinic"
              category="Clinica estetica"
              work="Reel · Authority"
              quote="Finalmente un canale che rispecchia il livello della clinica."
              objective="Posizionare il brand come punto di riferimento nel settore."
            />
          </div>
        </div>
      </section>

      {/* Chi siamo */}
      <section id="chi-siamo" className="scroll-mt-24 px-6 py-24 md:py-32">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 lg:grid-cols-2">
          <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-[2.5rem] border border-hairline">
            <Image
              src="/images/logo-mark.jpeg"
              alt="Logo Apex Media, social authority studio, est. 2021"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 400px, 80vw"
            />
            <span className="eyebrow absolute left-4 top-4 text-[10px] uppercase text-muted">
              Est. 2021
            </span>
            <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-orange-bright" />
          </div>

          <div>
            <span className="eyebrow flex items-center gap-2 text-xs uppercase text-violet-bright">
              <span className="h-1 w-1 rounded-full bg-violet-bright" /> Chi siamo · Alessandria
            </span>
            <h2 className="mt-5 text-balance font-display text-3xl font-extrabold leading-tight sm:text-5xl">
              Un&apos;agenzia nata per far crescere{" "}
              <span className="accent italic text-blue-bright">brand locali.</span>
            </h2>
            <p className="mt-6 text-pretty leading-relaxed text-muted">
              Apex Media nasce ad Alessandria con un obiettivo semplice: aiutare attività locali e
              brand emergenti a smettere di pubblicare a caso e iniziare a comunicare con una
              direzione precisa.
            </p>
            <p className="mt-4 text-pretty leading-relaxed text-muted">
              Uniamo strategia social, contenuti video, branding, advertising e siti web per
              costruire una presenza digitale più forte, più riconoscibile e più capace di
              generare richieste reali.
            </p>

            <div className="mt-8 space-y-5">
              <div className="border-l-2 border-violet pl-4">
                <p className="text-sm font-bold uppercase tracking-wide">Strategia</p>
                <p className="mt-1 text-sm text-muted">
                  Studiamo target, mercato e posizionamento prima di creare contenuti.
                </p>
              </div>
              <div className="border-l-2 border-blue pl-4">
                <p className="text-sm font-bold uppercase tracking-wide">Produzione</p>
                <p className="mt-1 text-sm text-muted">
                  Reel, visual e video pensati per alzare la percezione del brand.
                </p>
              </div>
              <div className="border-l-2 border-orange pl-4">
                <p className="text-sm font-bold uppercase tracking-wide">Crescita</p>
                <p className="mt-1 text-sm text-muted">
                  Social, advertising e sito uniti per trasformare attenzione in contatti.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-24 px-6 py-24 md:py-32">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-balance text-center font-display text-4xl font-extrabold leading-tight sm:text-6xl">
            Hai dubbi? <span className="text-gradient-vb accent italic">Rispondiamo.</span>
          </h2>

          <div className="mt-14 space-y-4">
            {faqs.map((faq) => (
              <FaqItem key={faq.q} question={faq.q} answer={faq.a} defaultOpen={faq.defaultOpen} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA finale */}
      <section id="contatti" className="scroll-mt-24 bg-mesh px-6 py-24 md:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow color="orange">Iniziamo da qui</Eyebrow>
          <h2 className="mt-6 text-balance font-display text-4xl font-extrabold leading-tight sm:text-6xl">
            Trasforma il tuo brand in{" "}
            <span className="accent italic text-orange-bright">un&apos;autorità.</span>
          </h2>
          <p className="accent mt-4 text-lg italic text-muted">
            Una consulenza strategica per capire come crescere davvero.
          </p>

          <a
            href="https://wa.me/393515940685"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 flex items-center gap-4 rounded-3xl border border-hairline bg-white/[0.02] p-5 text-left transition-colors duration-500 hover:border-emerald-400/40"
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-400 text-[#062617]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.36 2 11.74c0 2.06.66 3.97 1.8 5.55L2.5 22l4.87-1.28a10.1 10.1 0 0 0 4.63 1.13c5.52 0 10-4.36 10-9.74S17.52 2 12 2Zm0 17.6a8 8 0 0 1-4.08-1.12l-.29-.17-2.9.76.78-2.79-.19-.29a7.72 7.72 0 0 1-1.24-4.25c0-4.28 3.55-7.75 7.92-7.75s7.92 3.47 7.92 7.75-3.55 7.86-7.92 7.86Zm4.34-5.83c-.24-.12-1.4-.68-1.62-.76-.22-.08-.37-.12-.53.12-.16.24-.6.76-.74.92-.14.16-.27.18-.5.06-.24-.12-1-.36-1.9-1.16-.7-.62-1.18-1.38-1.31-1.62-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.53-1.28-.73-1.75-.19-.46-.39-.4-.53-.4h-.45c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.12 3.64.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.4-.57 1.6-1.12.2-.55.2-1.02.14-1.12-.06-.1-.22-.16-.46-.28Z" />
              </svg>
            </span>
            <span>
              <span className="eyebrow flex items-center gap-2 text-[11px] uppercase text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Scrivimi su WhatsApp
              </span>
              <span className="mt-1 block font-display text-xl font-bold">+39 351 594 0685</span>
              <span className="accent mt-0.5 block text-sm italic text-muted">
                Risposta entro un&apos;ora
              </span>
            </span>
          </a>

          <div className="mt-6 divide-y divide-hairline rounded-3xl border border-hairline bg-white/[0.02] text-left">
            {[
              { label: "Risposta", value: "entro 24h" },
              { label: "Consulenza", value: "Prima call gratuita" },
              { label: "Vincoli", value: "Nessuno" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between px-6 py-4">
                <span className="eyebrow text-xs uppercase text-muted">{row.label}</span>
                <span className="text-sm font-semibold">{row.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-3xl border border-hairline bg-white/[0.02] p-6 text-left sm:p-10">
            <span className="eyebrow flex items-center gap-2 text-xs uppercase text-orange-bright">
              <span className="h-1 w-1 rounded-full bg-orange-bright" /> Richiedi consulenza
            </span>
            <div className="mt-6">
              <ConsultationForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
