import Link from "next/link";
import type { Metadata } from "next";
import { casi } from "@/content/casi";
import { servizioDaSlug, type SlugServizio } from "@/content/servizi";
import { sito } from "@/content/sito";
import { BloccoPreventivo } from "./BloccoPreventivo";
import { Casi } from "./Casi";
import { Foto } from "./Foto";

export function metadataServizio(slug: SlugServizio): Metadata {
  const s = servizioDaSlug(slug);
  return { title: s.metaTitolo, description: s.metaDescrizione, alternates: { canonical: `/${s.slug}` } };
}

/** Struttura unica delle tre pagine servizio: problema, cosa facciamo, prima/dopo, cosa è incluso, modulo. */
export function PaginaServizio({ slug }: { slug: SlugServizio }) {
  const s = servizioDaSlug(slug);
  const casiServizio = casi.filter((c) => c.chiavi.includes(s.chiave) && (sito.demo || !c.esempio));

  return (
    <>
      <section className="bg-carta">
        <div className="contenitore griglia gap-y-10 py-10 lg:py-24">
          <div className="col-span-12 lg:col-span-7">
            <h1 className="titolo-1 max-w-[14ch]">{s.h1}</h1>
            <p className="testo-2 misura mt-6 text-[1.125rem] lg:text-[1.25rem]">{s.intro}</p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
              <Link href={`/preventivo?servizio=${s.chiave}`} className="btn btn-giallo">Richiedi preventivo</Link>
              <p>
                <span className="testo-2">oppure chiama </span>
                <a href={sito.telefono.href} className="collegamento whitespace-nowrap">{sito.telefono.mostrato}</a>
              </p>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-5">
            <Foto src={s.foto} alt={s.fotoAlt} richiesta={s.fotoRichiesta} className={`aspect-square ${s.fotoFormato === "verticale" ? "lg:aspect-[4/5]" : ""}`} sizes="(min-width: 1024px) 480px, 100vw" subito />
          </div>
        </div>
      </section>

      {/* problema e risposta, affiancati con pesi diversi */}
      <section className="sezione">
        <div className="contenitore griglia gap-y-16">
          <div className="col-span-12 lg:col-span-5">
            <p className="occhiello">Il problema</p>
            <h2 className="mt-6 text-[1.5rem] leading-[1.2] lg:text-[1.875rem]">{s.problema.titolo}</h2>
            {s.problema.testo.map((t) => <p key={t} className="testo-2 mt-4">{t}</p>)}
          </div>
          <div className="border-turchese col-span-12 border-l-2 pl-6 lg:col-span-6 lg:col-start-7 lg:pl-10">
            <p className="text-[0.8125rem] font-bold tracking-[0.12em] uppercase">Cosa fa Star Clean</p>
            <h2 className="titolo-2 mt-6">{s.soluzione.titolo}</h2>
            {s.soluzione.testo.map((t) => <p key={t} className="mt-4">{t}</p>)}
          </div>
        </div>
      </section>

      {/* senza un caso di questo servizio la sezione non compare */}
      {casiServizio.length > 0 && (
        <section className="sezione bg-petrolio text-white">
          <div className="contenitore">
            <p className="occhiello">Prima e dopo</p>
            <h2 className="titolo-2 mt-6 mb-10 max-w-[18ch] lg:mb-16">Trascina la linea e guarda cosa cambia.</h2>
            <Casi casi={casiServizio} />
          </div>
        </section>
      )}

      <section className="sezione">
        <div className="contenitore griglia gap-y-10">
          <div className="col-span-12 lg:col-span-4">
            <p className="occhiello">Cosa è incluso</p>
            <h2 className="titolo-2 mt-6 max-w-[12ch]">Quello che trovi nel preventivo.</h2>
            <p className="testo-2 mt-6">Ti serve altro? Scrivilo o dillo al telefono, lo aggiungiamo.</p>
          </div>
          <ul className="border-linea col-span-12 border-t lg:col-span-7 lg:col-start-6">
            {s.incluso.map((v) => (
              <li key={v.voce} className="border-linea grid gap-x-6 gap-y-1 border-b py-6 sm:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
                <span className="text-[1.125rem] leading-snug font-bold">{v.voce}</span>
                <span className="testo-2">{v.dettaglio}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <BloccoPreventivo titolo={`Preventivo per ${s.nome.toLowerCase()}.`} servizio={s.chiave} />
    </>
  );
}
