import Link from "next/link";
import type { Metadata } from "next";
import { casi } from "@/content/casi";
import { servizioDaSlug, type Servizio, type SlugServizio } from "@/content/servizi";
import { sito } from "@/content/sito";
import { JsonLd, azienda, domande, grafo, servizio as servizioLd } from "@/lib/datiStrutturati";
import { IngressoHero } from "./anim/IngressoHero";
import { Passata } from "./anim/Passata";
import { BloccoPreventivo } from "./BloccoPreventivo";
import { Casi } from "./Casi";
import { FasciaFiducia } from "./FasciaFiducia";
import { Faq } from "./Faq";
import { Foto } from "./Foto";
import { Icona } from "./Icona";
import { ChiusuraSezione, PulsanteChiama, PulsantePreventivo, PulsanteWhatsApp } from "./Pulsanti";
import { SchedeMateriali } from "./SchedeMateriali";
import { ZoneServite } from "./ZoneServite";

export function metadataServizio(slug: SlugServizio): Metadata {
  const s = servizioDaSlug(slug);
  return {
    title: s.metaTitolo,
    description: s.metaDescrizione,
    alternates: { canonical: `/${s.slug}` },
    openGraph: { title: s.metaTitolo, description: s.metaDescrizione, url: `/${s.slug}` },
  };
}

/** Vetrine grandi: pannello disegnato (una lastra di vetro con riflessi) con la passata luminosa. */
function Vetrina({ s }: { s: Servizio }) {
  const e = s.evidenza!;
  return (
    <section className="sezione">
      <div className="contenitore griglia items-center gap-y-12">
        <div className="col-span-12 lg:col-span-6">
          <div className="relative aspect-[5/4] overflow-hidden rounded-[var(--radius-foto)] bg-[linear-gradient(160deg,#d7e9f6_0%,#f4f9fd_45%,#cfe3f2_100%)] ring-1 ring-[rgb(11_52_90/0.1)]">
            <div aria-hidden className="absolute inset-0 bg-[linear-gradient(115deg,transparent_20%,rgb(255_255_255/0.7)_24%,transparent_30%,transparent_55%,rgb(255_255_255/0.5)_58%,transparent_62%)]" />
            <div aria-hidden className="absolute inset-x-[8%] top-[10%] bottom-0 rounded-t-[20px] border-[10px] border-b-0 border-[rgb(11_52_90/0.85)]" />
            <div aria-hidden className="absolute inset-x-[8%] top-[10%] bottom-0 flex justify-center">
              <span className="w-[10px] bg-[rgb(11_52_90/0.85)]" />
            </div>
            <div className="absolute top-6 left-6 rounded-full bg-white/90 px-4 py-2 text-[0.875rem] font-semibold text-blu-notte backdrop-blur">
              Negozi · Showroom · Ingressi
            </div>
            <Passata />
          </div>
        </div>
        <div className="col-span-12 lg:col-span-5 lg:col-start-8">
          <p className="occhiello">{e.occhiello}</p>
          <h2 className="titolo-2 mt-6">{e.titolo}</h2>
          <p className="sottotitolo mt-6">{e.testo}</p>
          <ul className="mt-8 grid gap-3">
            {e.punti.map((p) => (
              <li key={p} className="flex items-start gap-3">
                <span className="bg-blu mt-[2px] flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white">
                  <Icona nome="spunta" className="h-4 w-4" spessore={2} />
                </span>
                <span className="text-blu-notte font-medium">{p}</span>
              </li>
            ))}
          </ul>
          <ChiusuraSezione href={`/preventivo?servizio=${s.chiave}`} testo="Preventivo per la tua vetrina" />
        </div>
      </div>
    </section>
  );
}

/** Struttura unica delle cinque pagine servizio. */
export function PaginaServizio({ slug }: { slug: SlugServizio }) {
  const s = servizioDaSlug(slug);
  const casiServizio = casi.filter((c) => c.chiavi.includes(s.chiave) && (sito.demo || !c.esempio));
  const preventivo = `/preventivo?servizio=${s.chiave}`;

  return (
    <>
      <JsonLd dati={grafo(azienda(), servizioLd(s), domande(s.faq))} />

      {/* HERO */}
      <section className="from-cielo bg-linear-to-b to-white">
        <div className="contenitore griglia gap-y-10 pt-8 pb-16 lg:pt-16 lg:pb-24">
          <IngressoHero className="col-span-12 self-center lg:col-span-7">
            <nav aria-label="Percorso" className="testo-2 text-[0.875rem]" data-dopo>
              <Link href="/" className="hover:underline">Star Clean</Link>
              <span aria-hidden className="mx-2">/</span>
              <span className="text-blu-notte font-medium">{s.nome}</span>
            </nav>
            <h1 className="titolo-1 mt-6 max-w-[15ch]">{s.h1}</h1>
            <p className="sottotitolo misura mt-6" data-dopo>{s.intro}</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center" data-dopo>
              <PulsantePreventivo href={preventivo} />
              <PulsanteChiama />
            </div>
            <div className="mt-4" data-dopo>
              <PulsanteWhatsApp messaggio={s.whatsapp} />
            </div>
          </IngressoHero>
          <div className="col-span-12 lg:col-span-5">
            <Foto
              src={s.foto}
              alt={s.fotoAlt}
              richiesta={s.fotoRichiesta}
              icona={s.icona}
              className="aspect-[4/3] lg:aspect-[4/5]"
              sizes="(min-width: 1024px) 480px, 100vw"
              subito
            />
          </div>
        </div>
      </section>

      <div className="-mt-8 lg:-mt-12">
        <FasciaFiducia />
      </div>

      {s.evidenza && <Vetrina s={s} />}

      {/* PROBLEMA E RISPOSTA */}
      <section className="sezione">
        <div className="contenitore griglia gap-y-10">
          <div className="col-span-12 lg:col-span-5">
            <p className="occhiello">Il problema</p>
            <h2 className="mt-6 text-[1.625rem] leading-[1.15] lg:text-[2rem]">{s.problema.titolo}</h2>
            {s.problema.testo.map((t) => (
              <p key={t} className="testo-2 mt-4">{t}</p>
            ))}
          </div>
          <div className="scheda col-span-12 p-6 sm:p-10 lg:col-span-6 lg:col-start-7">
            <p className="text-blu-chiaro text-[0.8125rem] font-semibold tracking-[0.12em] uppercase">Cosa fa Star Clean</p>
            <h2 className="titolo-2 mt-4">{s.soluzione.titolo}</h2>
            {s.soluzione.testo.map((t) => (
              <p key={t} className="mt-4">{t}</p>
            ))}
          </div>
        </div>
      </section>

      {/* PAVIMENTI: che pavimento hai? */}
      {s.chiave === "pavimenti" && (
        <section id="materiali" className="sezione bg-cielo scroll-mt-20">
          <div className="contenitore">
            <p className="occhiello bg-white">Scegli il materiale</p>
            <h2 className="titolo-2 mt-6 max-w-[16ch]">Che pavimento hai?</h2>
            <p className="sottotitolo misura mt-6">
              Tocca il tuo materiale: vedi il trattamento e chiedi il preventivo con il pavimento già scelto.
            </p>
            <div className="mt-10 lg:mt-14">
              <SchedeMateriali />
            </div>
            <p className="testo-2 mt-8">
              Non sai che pavimento hai? <PulsanteWhatsApp messaggio="Ciao, vi mando una foto del pavimento: che trattamento serve?" />
            </p>
          </div>
        </section>
      )}

      {/* PRIMA E DOPO: senza un caso di questo servizio la sezione non compare */}
      {casiServizio.length > 0 && (
        <section className="sezione bg-blu-notte text-white">
          <div className="contenitore">
            <p className="occhiello occhiello-chiaro">Prima e dopo</p>
            <h2 className="titolo-2 mt-6 mb-10 max-w-[18ch] text-white lg:mb-16">Trascina la linea e guarda cosa cambia.</h2>
            <Casi casi={casiServizio} />
            <ChiusuraSezione href={preventivo} chiaro />
          </div>
        </section>
      )}

      {/* COSA È INCLUSO */}
      <section className="sezione">
        <div className="contenitore griglia gap-y-10">
          <div className="col-span-12 lg:col-span-4">
            <p className="occhiello">Cosa è incluso</p>
            <h2 className="titolo-2 mt-6 max-w-[12ch]">Quello che trovi nel preventivo.</h2>
            <p className="testo-2 mt-6">Ti serve altro? Scrivilo o dillo al telefono: se lo facciamo, lo aggiungiamo.</p>
          </div>
          <ul className="col-span-12 grid gap-3 sm:grid-cols-2 lg:col-span-8">
            {s.incluso.map((v) => (
              <li key={v.voce} className="scheda flex gap-4 p-5 lg:p-6">
                <span className="bg-cielo text-blu flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                  <Icona nome="spunta" className="h-5 w-5" spessore={1.75} />
                </span>
                <span>
                  <span className="text-blu-notte block font-semibold">{v.voce}</span>
                  <span className="testo-2 mt-1 block text-[0.9375rem] leading-snug">{v.dettaglio}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="col-span-12 lg:col-span-8 lg:col-start-5">
            <ChiusuraSezione href={preventivo} />
          </div>
        </div>
      </section>

      {/* DOMANDE DEL SERVIZIO (da confermare con il titolare, vedi content/servizi.ts) */}
      <section className="sezione bg-cielo">
        <div className="contenitore griglia gap-y-10">
          <div className="col-span-12 lg:col-span-4">
            <p className="occhiello bg-white">Domande</p>
            <h2 className="titolo-2 mt-6 max-w-[12ch]">Prima di chiedere il prezzo.</h2>
            <p className="testo-2 mt-6">
              Non trovi la risposta? Chiama{" "}
              <a href={sito.telefono.href} className="collegamento whitespace-nowrap">{sito.telefono.mostrato}</a>
            </p>
          </div>
          <div className="col-span-12 lg:col-span-7 lg:col-start-6">
            <Faq domande={s.faq} />
          </div>
        </div>
      </section>

      <ZoneServite preventivo={preventivo} />

      <BloccoPreventivo titolo={`Preventivo per ${s.nome.toLowerCase()}.`} servizio={s.chiave} whatsapp={s.whatsapp} />
    </>
  );
}
