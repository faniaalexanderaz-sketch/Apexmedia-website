import type { Metadata } from "next";
import { DatoLegale } from "@/components/DatoLegale";

export const metadata: Metadata = { title: "Privacy policy", alternates: { canonical: "/privacy" } };

/* Testo base da far rileggere al consulente privacy del cliente prima di andare online. */
export default function Privacy() {
  return (
    <div className="contenitore legale py-16 lg:py-24">
      <h1 className="titolo-2">Privacy policy</h1>
      <p className="testo-2 mt-6">Informativa ai sensi dell&apos;art. 13 del Regolamento UE 2016/679 (GDPR).</p>

      <h2>Titolare del trattamento</h2>
      <p>
        <DatoLegale campo="ragioneSociale" />, P.IVA <DatoLegale campo="piva" />, con sede in <DatoLegale campo="sede" />.
        Email <DatoLegale campo="email" />, PEC <DatoLegale campo="pec" />.
      </p>

      <h2>Quali dati raccogliamo</h2>
      <p>Quando chiedi un preventivo dal modulo raccogliamo i dati che inserisci tu.</p>
      <ul>
        <li>Nome e numero di telefono</li>
        <li>Indirizzo email, se lo indichi</li>
        <li>Servizio richiesto, comune e metri quadri indicativi</li>
        <li>Pagina di provenienza ed eventuali parametri della campagna (UTM)</li>
      </ul>

      <h2>Perché li usiamo</h2>
      <p>
        Usiamo i dati solo per rispondere alla tua richiesta e prepararti il preventivo. La base giuridica è
        l&apos;esecuzione di misure precontrattuali richieste da te (art. 6, par. 1, lett. b del GDPR). Non li usiamo
        per inviarti pubblicità e non li cediamo ad altri.
      </p>

      <h2>Chi li tratta</h2>
      <p>
        I dati sono trattati dal titolare e dai fornitori tecnici che fanno funzionare il sito, nominati responsabili
        del trattamento. Sono Vercel Inc. per hosting e database e Resend per l&apos;invio delle email di notifica. Se
        i dati escono dallo Spazio Economico Europeo, il trasferimento avviene con le garanzie previste dal GDPR.
      </p>

      <h2>Per quanto tempo li conserviamo</h2>
      <p>
        Conserviamo le richieste di preventivo per 24 mesi. Se diventi cliente, i dati restano per il tempo richiesto
        dagli obblighi fiscali e contabili.
      </p>

      <h2>I tuoi diritti</h2>
      <p>
        Puoi chiedere in ogni momento di vedere, correggere o cancellare i tuoi dati, di limitarne l&apos;uso o di
        opporti al trattamento. Scrivi a <DatoLegale campo="email" />. Puoi anche presentare un reclamo al Garante per
        la protezione dei dati personali.
      </p>
    </div>
  );
}
