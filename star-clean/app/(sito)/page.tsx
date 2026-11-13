import Link from "next/link";
import { BloccoPreventivo } from "@/components/BloccoPreventivo";
import { Casi } from "@/components/Casi";
import { Faq } from "@/components/Faq";
import { Foto } from "@/components/Foto";
import { casi } from "@/content/casi";
import { faq } from "@/content/faq";
import { recensioni } from "@/content/recensioni";
import { servizi } from "@/content/servizi";
import { sito, urlSito } from "@/content/sito";

const passi = [
  {
    titolo: "Ci scrivi o ci chiami",
    testo: "Compili il modulo in un minuto oppure telefoni. Bastano il comune e i metri quadri.",
  },
  {
    titolo: "Ricevi il prezzo in 24 ore",
    testo: "Se il lavoro è chiaro ti mandiamo subito il preventivo. Se serve vedere gli spazi, fissiamo un sopralluogo.",
  },
  {
    titolo: "Veniamo nel giorno concordato",
    testo: "Arriviamo con macchinari e prodotti. A fine lavoro controlli il risultato insieme a noi.",
  },
];

export default function Home() {
  // Online vanno solo recensioni vere. Quelle di esempio si vedono soltanto in demo.
  const visibili = recensioni.filter((r) => sito.demo || !r.esempio);
  const soloEsempi = visibili.length > 0 && visibili.every((r) => r.esempio);

  const datiStrutturati = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        name: sito.nome,
        url: urlSito(),
        areaServed: sito.zone.map((z) => ({ "@type": "City", name: z })),
        ...(sito.telefono.segnaposto ? {} : { telephone: sito.telefono.href.replace("tel:", "") }),
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.map((f) => ({
          "@type": "Question",
          name: f.domanda,
          acceptedAnswer: { "@type": "Answer", text: f.risposta },
        })),
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datiStrutturati) }} />

      {/* HERO: testo a sinistra, foto reale a lato che scende sulla fascia successiva */}
      <section className="bg-carta">
        <div className="contenitore griglia gap-y-10 pt-10 lg:pt-24">
          <div className="col-span-12 lg:col-span-7 lg:pb-24">
            <h1 className="titolo-1 max-w-[15ch]">
              Pulizie civili e industriali ad Alessandria. Preventivo in 24 ore.
            </h1>
            <p className="testo-2 misura mt-6 text-[1.125rem] lg:text-[1.25rem]">
              Ci dici cosa c&apos;è da pulire e quanti metri sono. Entro 24 ore hai il prezzo scritto, senza impegno.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
              <Link href="/preventivo" className="btn btn-giallo">Richiedi preventivo</Link>
              <p>
                <span className="testo-2">oppure chiama </span>
                <a href={sito.telefono.href} className="collegamento whitespace-nowrap">{sito.telefono.mostrato}</a>
              </p>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-5">
            <Foto
              alt="Jonathan Germanò e la squadra Star Clean al lavoro"
              richiesta="Jonathan Germanò al lavoro con la lavasciuga, inquadratura verticale"
              className="aspect-[4/3] lg:-mb-16 lg:aspect-auto lg:h-[calc(100%+64px)] lg:min-h-[520px]"
              sizes="(min-width: 1024px) 480px, 100vw"
              priority
            />
          </div>
        </div>
      </section>

      {/* FIDUCIA: chi siamo in due righe e tre dati veri */}
      <section className="border-linea border-b py-10 lg:py-16">
        <div className="contenitore griglia gap-y-10">
          <p className="col-span-12 max-w-[24em] text-[1.25rem] leading-snug font-bold lg:col-span-6 lg:text-[1.5rem]">
            Star Clean è il nuovo nome di un&apos;impresa di famiglia che pulisce ad Alessandria da 30 anni. Oggi la
            guida {sito.titolare}.
          </p>
          <dl className="col-span-12 grid grid-cols-1 sm:grid-cols-3 lg:mt-6">
            {[
              ["30 anni", "di pulizie nella stessa famiglia"],
              ["24 ore", "per avere il preventivo scritto"],
              ["5 città", "e tutta la provincia di Alessandria"],
            ].map(([cifra, etichetta], i) => (
              <div key={cifra} className={`border-linea flex flex-col-reverse border-t py-6 sm:pr-6 ${i > 0 ? "sm:border-l sm:pl-6" : ""}`}>
                <dt className="testo-2 mt-2 text-[0.9375rem] leading-snug">{etichetta}</dt>
                <dd className="text-[2.5rem] leading-none font-extrabold tracking-[-0.03em] lg:text-[3.25rem]">{cifra}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* PRIMA E DOPO */}
      <section className="sezione bg-petrolio text-white">
        <div className="contenitore">
          <p className="occhiello">Prima e dopo</p>
          <h2 className="titolo-2 mt-6 mb-10 max-w-[18ch] lg:mb-16">Trascina la linea e guarda cosa cambia.</h2>
          <Casi casi={casi} />
        </div>
      </section>

      {/* SERVIZI: tre blocchi alternati, proporzioni diverse */}
      <section className="sezione">
        <div className="contenitore">
          <p className="occhiello">Servizi</p>
          <h2 className="titolo-2 mt-6 max-w-[16ch]">Cosa possiamo pulire per te.</h2>

          <div className="mt-10 space-y-16 lg:mt-16 lg:space-y-24">
            {servizi.map((s, i) => {
              const pari = i % 2 === 0;
              return (
                <article key={s.slug} className="griglia items-center gap-y-6">
                  <Foto
                    alt={s.nome}
                    richiesta={s.fotoRichiesta}
                    className={`col-span-12 aspect-[4/3] ${pari ? "lg:col-span-7" : "lg:col-span-6 lg:col-start-7 lg:row-start-1"} ${i === 1 ? "lg:aspect-[5/4]" : "lg:aspect-[16/10]"}`}
                    sizes="(min-width: 1024px) 700px, 100vw"
                  />
                  <div className={`col-span-12 ${pari ? "lg:col-span-4 lg:col-start-9" : "lg:col-span-5 lg:col-start-1 lg:row-start-1"}`}>
                    <p className="text-turchese text-[0.9375rem] font-extrabold tabular-nums" aria-hidden>0{i + 1}</p>
                    <h3 className="mt-2 text-[1.75rem] lg:text-[2.125rem]">{s.nome}</h3>
                    <p className="testo-2 mt-4">{s.riassunto}</p>
                    <p className="mt-6">
                      <Link href={`/${s.slug}`} className="collegamento">Vedi {s.nome.toLowerCase()}</Link>
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* COME FUNZIONA */}
      <section className="sezione bg-carta">
        <div className="contenitore">
          <p className="occhiello">Come funziona</p>
          <h2 className="titolo-2 mt-6 max-w-[18ch]">Dal primo messaggio al lavoro finito, in tre passi.</h2>
          <ol className="griglia mt-10 gap-y-0 lg:mt-16">
            {passi.map((p, i) => (
              <li key={p.titolo} className="border-petrolio col-span-12 border-t-2 py-6 lg:col-span-4 lg:pr-10">
                <p className="text-[3.25rem] leading-none font-extrabold tracking-[-0.03em]" aria-hidden>{i + 1}</p>
                <h3 className="titolo-3 mt-6">{p.titolo}</h3>
                <p className="testo-2 mt-2">{p.testo}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10">
            <Link href="/preventivo" className="btn btn-giallo">Inizia dal passo 1</Link>
          </div>
        </div>
      </section>

      {/* RECENSIONI: la sezione esiste solo se ci sono recensioni da mostrare */}
      {visibili.length > 0 && (
        <section className="sezione">
          <div className="contenitore">
            <p className="occhiello">Recensioni</p>
            <h2 className="titolo-2 mt-6 max-w-[16ch]">Cosa dice chi ci ha chiamato.</h2>
            {soloEsempi && (
              <p className="border-turchese testo-2 mt-6 max-w-[38em] border-l-2 pl-4 text-[0.9375rem]">
                Testi di esempio per la demo. Online compaiono solo le recensioni Google reali, con nome e data.
              </p>
            )}
            <div className="griglia mt-10 gap-y-10 lg:mt-16">
              <figure className="col-span-12 lg:col-span-7">
                <blockquote className="text-[1.5rem] leading-[1.3] font-bold tracking-[-0.015em] lg:text-[2rem]">
                  «{visibili[0].testo}»
                </blockquote>
                <figcaption className="testo-2 mt-6 text-[0.9375rem]">
                  <strong className="text-petrolio">{visibili[0].nome}</strong>, {visibili[0].luogo}. {visibili[0].data}
                </figcaption>
              </figure>
              <div className="col-span-12 lg:col-span-4 lg:col-start-9">
                {visibili.slice(1).map((r) => (
                  <figure key={r.nome} className="border-linea border-t py-6">
                    <blockquote>«{r.testo}»</blockquote>
                    <figcaption className="testo-2 mt-4 text-[0.9375rem]">
                      <strong className="text-petrolio">{r.nome}</strong>, {r.luogo}. {r.data}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <BloccoPreventivo titolo="Chiedi il tuo preventivo." />

      {/* FAQ */}
      <section className="sezione">
        <div className="contenitore griglia gap-y-10">
          <div className="col-span-12 lg:col-span-4">
            <p className="occhiello">Domande</p>
            <h2 className="titolo-2 mt-6 max-w-[12ch]">Prima di chiedere il prezzo.</h2>
            <p className="testo-2 mt-6">
              Non trovi la risposta? Chiama{" "}
              <a href={sito.telefono.href} className="collegamento whitespace-nowrap">{sito.telefono.mostrato}</a>
            </p>
          </div>
          <div className="col-span-12 lg:col-span-7 lg:col-start-6">
            <Faq />
          </div>
        </div>
      </section>
    </>
  );
}
