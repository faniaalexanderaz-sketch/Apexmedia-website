import type { Metadata } from "next";
import { PageIntro, Voce } from "@/components/PageIntro";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  robots: { index: false, follow: true },
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <PageIntro eyebrow="Privacy" title="Informativa sulla privacy">
        <p>
          Questa pagina è un segnaposto. Prima della messa online va sostituita con l&apos;informativa completa, scritta
          insieme al consulente del negozio.
        </p>
      </PageIntro>

      <div className="pagina pb-16 md:pb-24">
        <Voce label="Titolare">
          <p>
            {SITE.name}, {SITE.address.street}, {SITE.address.zip} {SITE.address.city} ({SITE.address.province}).
          </p>
          <p className="text-marrone">Da completare: ragione sociale, partita IVA, email per le richieste sui dati.</p>
        </Voce>
        <Voce label="Cosa andrà scritto qui">
          <ul className="list-disc space-y-2 pl-5">
            <li>Quali dati raccogliamo con un ordine (nome, contatti, indirizzo) e perché.</li>
            <li>Con chi li condividiamo: corriere e servizi di pagamento.</li>
            <li>Per quanto tempo li conserviamo.</li>
            <li>Cookie e strumenti di misurazione usati dal sito.</li>
            <li>Come chiedere accesso, correzione o cancellazione dei propri dati.</li>
          </ul>
        </Voce>
        <Voce label="In questa demo">
          <p>
            Il carrello e gli ordini di prova restano solo nel tuo browser. Non vengono salvati su un server e non vengono
            inviati a terzi.
          </p>
        </Voce>
      </div>
    </>
  );
}
