import Link from "next/link";
import { Comparsa } from "@/components/anim/Comparsa";
import { IngressoHero } from "@/components/anim/IngressoHero";
import { BloccoPreventivo } from "@/components/BloccoPreventivo";
import { Casi } from "@/components/Casi";
import { ComeLavoriamo } from "@/components/ComeLavoriamo";
import { FasciaFiducia } from "@/components/FasciaFiducia";
import { Faq } from "@/components/Faq";
import { Foto, FotoHero } from "@/components/Foto";
import { Icona } from "@/components/Icona";
import { ChiusuraSezione, PulsanteChiama, PulsantePreventivo, PulsanteWhatsApp } from "@/components/Pulsanti";
import { ZoneServite } from "@/components/ZoneServite";
import { casi } from "@/content/casi";
import { faq } from "@/content/faq";
import { recensioni } from "@/content/recensioni";
import { servizi } from "@/content/servizi";
import { sito } from "@/content/sito";
import { JsonLd, azienda, domande, grafo, servizio } from "@/lib/datiStrutturati";

export default function Home() {
  // Online vanno solo recensioni vere. Quelle di esempio si vedono soltanto in demo.
  const visibili = recensioni.filter((r) => sito.demo || !r.esempio);
  const soloEsempi = visibili.length > 0 && visibili.every((r) => r.esempio);
  // Stessa regola per i prima/dopo: le coppie dimostrative si vedono solo in demo.
  const casiVisibili = casi.filter((c) => sito.demo || !c.esempio);

  return (
    <>
      <JsonLd dati={grafo(azienda(), ...servizi.map(servizio), domande(faq))} />

      {/* HERO */}
      <section className="from-cielo bg-linear-to-b to-white">
        <div className="contenitore griglia gap-y-10 pt-8 pb-16 lg:pt-16 lg:pb-24">
          <IngressoHero className="col-span-12 self-center lg:col-span-7">
            <p className="occhiello bg-white" data-dopo>Ad Alessandria da {sito.anniAttivita} anni</p>
            <h1 className="titolo-1 mt-6 max-w-[14ch]">Impresa di pulizie ad Alessandria. Preventivo scritto in 24&nbsp;ore.</h1>
            <p className="sottotitolo misura mt-6" data-dopo>
              Case, aziende, pavimenti, vetri e tapparelle. Ci dici cosa c&apos;è da pulire e quanti metri sono: entro{" "}
              {sito.oreRisposta} ore hai il prezzo scritto, senza impegno.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center" data-dopo>
              <PulsantePreventivo />
              <PulsanteChiama />
            </div>
            <div className="mt-4" data-dopo>
              <PulsanteWhatsApp />
            </div>
          </IngressoHero>
          <div className="col-span-12 lg:col-span-5">
            {sito.fotoHero ? (
              <FotoHero
                {...sito.fotoHero}
                alt="Lucidatura di un pavimento in marmo con la monospazzola"
                className="aspect-[3/2] lg:aspect-[4/5]"
              />
            ) : (
              <Foto alt="" richiesta="Jonathan Germanò al lavoro, inquadratura verticale" className="aspect-[3/2] lg:aspect-[4/5]" subito />
            )}
          </div>
        </div>
      </section>

      <div className="-mt-8 lg:-mt-12">
        <FasciaFiducia />
      </div>

      {/* SERVIZI */}
      <section className="sezione">
        <div className="contenitore">
          <div className="griglia items-end gap-y-6">
            <div className="col-span-12 lg:col-span-7">
              <p className="occhiello">Servizi</p>
              <h2 className="titolo-2 mt-6 max-w-[16ch]">Cosa possiamo pulire per te.</h2>
            </div>
            <p className="sottotitolo col-span-12 lg:col-span-4 lg:col-start-9">
              Cinque servizi, un solo numero. Scegli il tuo e chiedi il prezzo.
            </p>
          </div>

          <Comparsa className="mt-12 lg:mt-16">
            <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
              {servizi.map((s, i) => (
                <li key={s.slug} data-comparsa className={i < 2 ? "lg:col-span-3" : "lg:col-span-2"}>
                  <Link href={`/${s.slug}`} className="scheda scheda-viva group flex h-full flex-col p-6 lg:p-8">
                    <span className="bollo group-hover:bg-blu transition-colors duration-300 group-hover:text-white">
                      <Icona nome={s.icona} className="h-7 w-7" />
                    </span>
                    <h3 className={`mt-8 ${i < 2 ? "titolo-2 text-[clamp(1.75rem,1.4rem+1.4vw,2.5rem)]" : "titolo-3"}`}>{s.nome}</h3>
                    <p className="testo-2 mt-3 max-w-[30em]">{s.riassunto}</p>
                    <span className="text-blu mt-auto inline-flex items-center gap-2 pt-8 font-semibold">
                      Vedi il servizio
                      <Icona nome="freccia" className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Comparsa>
          <ChiusuraSezione />
        </div>
      </section>

      {/* PRIMA E DOPO */}
      {casiVisibili.length > 0 && (
        <section className="sezione bg-blu-notte text-white">
          <div className="contenitore">
            <p className="occhiello occhiello-chiaro">Prima e dopo</p>
            <h2 className="titolo-2 mt-6 mb-10 max-w-[18ch] text-white lg:mb-16">Trascina la linea e guarda cosa cambia.</h2>
            <Casi casi={casiVisibili} />
            <ChiusuraSezione chiaro />
          </div>
        </section>
      )}

      <ComeLavoriamo />

      <ZoneServite />

      {/* RECENSIONI: la sezione esiste solo se ci sono recensioni da mostrare */}
      {visibili.length > 0 && (
        <section className="sezione bg-cielo">
          <div className="contenitore">
            <p className="occhiello bg-white">Recensioni</p>
            <h2 className="titolo-2 mt-6 max-w-[16ch]">Cosa dice chi ci ha chiamato.</h2>
            {soloEsempi && (
              <p className="border-riflesso testo-2 mt-6 max-w-[38em] border-l-2 pl-4 text-[0.9375rem]">
                Testi di esempio per la demo. Online compaiono solo le recensioni Google reali, con nome e data.
              </p>
            )}
            <div className="griglia mt-10 gap-y-4 lg:mt-16">
              <figure className="scheda col-span-12 p-8 lg:col-span-7 lg:p-12">
                <blockquote className="font-titoli text-blu-notte text-[1.5rem] leading-[1.3] font-semibold tracking-[-0.015em] lg:text-[2rem]">
                  «{visibili[0].testo}»
                </blockquote>
                <figcaption className="testo-2 mt-6 text-[0.9375rem]">
                  <strong className="text-blu-notte">{visibili[0].nome}</strong>, {visibili[0].luogo}. {visibili[0].data}
                </figcaption>
              </figure>
              <div className="col-span-12 grid gap-4 lg:col-span-5">
                {visibili.slice(1).map((r) => (
                  <figure key={r.nome} className="scheda p-6">
                    <blockquote>«{r.testo}»</blockquote>
                    <figcaption className="testo-2 mt-4 text-[0.9375rem]">
                      <strong className="text-blu-notte">{r.nome}</strong>, {r.luogo}. {r.data}
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
            <Faq domande={faq} />
          </div>
        </div>
      </section>
    </>
  );
}
