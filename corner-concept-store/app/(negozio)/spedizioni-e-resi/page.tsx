import type { Metadata } from "next";
import { PageIntro, Voce } from "@/components/PageIntro";
import { euro } from "@/lib/format";
import { CARRIER, FREE_SHIPPING_FROM, RETURN_DAYS, SHIPPING_COST } from "@/lib/shipping";
import { PAYMENT_METHODS, SITE, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Spedizioni e resi",
  description: `Spedizione ${CARRIER} in tutta Italia in 24/48h, gratuita sopra i ${FREE_SHIPPING_FROM} €. Ritiro gratuito in negozio e resi entro ${RETURN_DAYS} giorni.`,
  alternates: { canonical: "/spedizioni-e-resi" },
};

export default function SpedizioniResiPage() {
  return (
    <>
      <PageIntro eyebrow="Spedizioni e resi" title="Arriva in due giorni. Se non va, torna indietro.">
        <p>Le regole sono poche e stanno tutte in questa pagina.</p>
      </PageIntro>

      <div className="pagina pb-16 md:pb-24">
        <Voce label="Spedizione">
          <p>
            Spediamo in tutta Italia con {CARRIER}, in 24/48 ore lavorative. Gli ordini confermati entro le 13 dal lunedì al
            venerdì partono in giornata.
          </p>
          <p>
            Costa <strong className="cifre font-semibold">{euro(SHIPPING_COST, { decimals: true })}</strong>. Sopra i{" "}
            <strong className="cifre font-semibold">{FREE_SHIPPING_FROM} €</strong> è gratuita.
          </p>
          <p>Quando il pacco parte ricevi il link per seguirlo.</p>
        </Voce>

        <Voce label="Ritiro in negozio">
          <p>
            Puoi ritirare gratis in {SITE.address.street}, {SITE.address.city}. Lo scegli al checkout: mettiamo i capi da parte
            e ti scriviamo quando sono pronti.
          </p>
          <p className="cifre">Lunedì 9:30–19:30. Da martedì a sabato 9:30–12:30 e 15:30–19:30.</p>
        </Voce>

        <Voce label="Resi">
          <p>
            Hai {RETURN_DAYS} giorni dalla consegna per restituire un capo, senza dover spiegare perché. Vale anche per i
            pezzi unici e il vintage.
          </p>
          <p>Il capo deve tornare come è partito: non indossato, non lavato, con il cartellino.</p>
          <p>
            Per avviare un reso{" "}
            <a
              href={whatsappLink("Ciao Corner, vorrei fare un reso. Numero d'ordine: ")}
              target="_blank"
              rel="noopener noreferrer"
              className="link-riga font-semibold"
            >
              scrivici su WhatsApp
            </a>{" "}
            con il numero d&apos;ordine: ti diciamo come spedirlo. Il rimborso arriva sullo stesso metodo di pagamento entro{" "}
            {RETURN_DAYS} giorni dal rientro del capo.
          </p>
        </Voce>

        <Voce label="Cambio taglia">
          <p>
            Se la taglia è sbagliata, scrivici prima di rispedire: controlliamo se quella giusta c&apos;è e te la teniamo da
            parte.
          </p>
        </Voce>

        <Voce label="Pagamenti">
          <ul className="flex flex-wrap gap-2">
            {PAYMENT_METHODS.map((method) => (
              <li key={method} className="pillola text-verde">
                {method}
              </li>
            ))}
          </ul>
          <p>I prezzi sono in euro, IVA inclusa.</p>
        </Voce>
      </div>
    </>
  );
}
