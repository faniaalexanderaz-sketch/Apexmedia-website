import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/sections/Nav";
import { Footer } from "@/components/sections/Footer";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Informativa sulla privacy del sito infoapex.eu di Apex Media.",
  alternates: { canonical: "/privacy" },
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="pt-[calc(var(--nav-h)+4px)]">
        <Container className="py-20 lg:py-28">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <SectionLabel numero="00" testo="Privacy" />
            </div>
            <article className="lg:col-span-7">
              <h1 className="h-display text-[clamp(2rem,1rem+3.6vw,4.25rem)]">Informativa sulla privacy.</h1>
              <p className="label-mono mt-6 text-ink/60">Aggiornata il 28 ottobre 2026</p>

              <div className="mt-10 space-y-8 text-[17px] text-ink/85">
                <section>
                  <h2 className="font-display text-[22px] font-bold tracking-tight text-ink">Chi siamo</h2>
                  <p className="mt-2">
                    Il titolare del trattamento è Apex Media, Alessandria (Piemonte). Puoi scriverci a{" "}
                    <a href={`mailto:${site.email}`} className="underline">
                      {site.email}
                    </a>
                    .
                  </p>
                  <p className="mt-2 border-l-2 border-giallo pl-3 text-ink/70">
                    [SEGNAPOSTO: ragione sociale, indirizzo e partita IVA]
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-[22px] font-bold tracking-tight text-ink">Quali dati raccogliamo</h2>
                  <p className="mt-2">
                    Questo sito non ha un database e non salva i dati che inserisci nel form. Il form compone
                    un messaggio e lo apre nella tua app WhatsApp: da lì in poi vale l’informativa di WhatsApp.
                  </p>
                  <p className="mt-2">
                    Se ci scrivi su WhatsApp o via email, usiamo nome, contatto e contenuto del messaggio solo per
                    risponderti e preparare una proposta. Li conserviamo per il tempo necessario a gestire la
                    richiesta e, se diventi cliente, per la durata del rapporto.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-[22px] font-bold tracking-tight text-ink">Cookie e statistiche</h2>
                  <p className="mt-2">
                    Il sito non usa cookie di profilazione e non carica script pubblicitari. L’hosting (Vercel) può
                    registrare log tecnici anonimi necessari al funzionamento del servizio.
                  </p>
                  <p className="mt-2 border-l-2 border-giallo pl-3 text-ink/70">
                    [SEGNAPOSTO: da aggiornare se in fase 3 aggiungiamo strumenti di analytics o pixel pubblicitari]
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-[22px] font-bold tracking-tight text-ink">I tuoi diritti</h2>
                  <p className="mt-2">
                    Puoi chiederci in ogni momento di vedere, correggere o cancellare i tuoi dati, scrivendo a{" "}
                    <a href={`mailto:${site.email}`} className="underline">
                      {site.email}
                    </a>
                    . Hai anche il diritto di presentare reclamo al Garante per la protezione dei dati personali.
                  </p>
                </section>
              </div>

              <p className="mt-12">
                <Link href="/" className="font-semibold underline decoration-1 underline-offset-[5px] hover:text-viola">
                  Torna alla home
                </Link>
              </p>
            </article>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
