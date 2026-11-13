import Link from "next/link";
import { servizi } from "@/content/servizi";
import { sito } from "@/content/sito";
import { Logo } from "./Logo";

/** In demo i dati mancanti si vedono come "da inserire". Online una riga vuota non compare. */
function Dato({ etichetta, valore, href }: { etichetta: string; valore: string; href?: string }) {
  if (!valore && !sito.demo) return null;
  return (
    <div className="flex gap-2">
      <dt className="text-white/60">{etichetta}</dt>
      <dd>
        {valore ? (
          href ? <a href={href} className="underline underline-offset-4">{valore}</a> : valore
        ) : (
          <span className="text-white/60">da inserire</span>
        )}
      </dd>
    </div>
  );
}

export function Footer() {
  const l = sito.legale;
  return (
    <footer className="bg-petrolio-scuro text-[0.9375rem] text-white">
      <div className="contenitore griglia gap-y-10 py-16">
        <div className="col-span-12 lg:col-span-5">
          <Logo chiaro />
          <p className="mt-6 max-w-[26em] text-white/75">
            Impresa di pulizie di famiglia, ad Alessandria da {sito.anniAttivita} anni. Oggi la guida {sito.titolare}.
          </p>
          <p className="mt-6 text-[1.5rem] font-extrabold">
            <a href={sito.telefono.href}>{sito.telefono.mostrato}</a>
          </p>
        </div>

        <div className="col-span-6 lg:col-span-2">
          <h2 className="text-[0.8125rem] font-bold tracking-[0.12em] text-white/60 uppercase">Servizi</h2>
          <ul className="mt-4 space-y-2">
            {servizi.map((s) => (
              <li key={s.slug}><Link href={`/${s.slug}`} className="hover:underline">{s.nome}</Link></li>
            ))}
            <li><Link href="/preventivo" className="hover:underline">Preventivo</Link></li>
          </ul>
        </div>

        <div className="col-span-6 lg:col-span-2">
          <h2 className="text-[0.8125rem] font-bold tracking-[0.12em] text-white/60 uppercase">Zone servite</h2>
          <ul className="mt-4 space-y-2">
            {sito.zone.map((z) => <li key={z}>{z}</li>)}
            <li className="text-white/75">e tutta la provincia</li>
          </ul>
        </div>

        <div className="col-span-12 lg:col-span-3">
          <h2 className="text-[0.8125rem] font-bold tracking-[0.12em] text-white/60 uppercase">Dati aziendali</h2>
          <dl className="mt-4 space-y-2">
            <Dato etichetta="Ragione sociale" valore={l.ragioneSociale} />
            <Dato etichetta="P.IVA" valore={l.piva} />
            <Dato etichetta="Sede" valore={l.sede} />
            <Dato etichetta="PEC" valore={l.pec} />
            <Dato etichetta="Email" valore={l.email} href={l.email ? `mailto:${l.email}` : undefined} />
          </dl>
        </div>
      </div>

      <div className="border-linea-chiara border-t">
        <div className="contenitore flex flex-col gap-2 py-6 text-[0.875rem] text-white/75 sm:flex-row sm:justify-between">
          <p>© {sito.nome}</p>
          <p className="flex gap-6">
            <Link href="/privacy" className="hover:underline">Privacy policy</Link>
            <Link href="/cookie" className="hover:underline">Cookie policy</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
