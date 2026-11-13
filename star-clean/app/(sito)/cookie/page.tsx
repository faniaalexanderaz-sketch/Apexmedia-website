import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cookie policy", alternates: { canonical: "/cookie" } };

export default function Cookie() {
  return (
    <div className="contenitore legale py-16 lg:py-24">
      <h1 className="titolo-2">Cookie policy</h1>

      <h2>Cookie tecnici</h2>
      <p>
        Il sito funziona senza cookie di profilazione. Usiamo solo la memoria del browser per ricordare la tua scelta
        sui cookie e la provenienza della visita durante la compilazione del modulo. Per questi non serve il consenso.
      </p>

      <h2>Cookie di misurazione</h2>
      <p>
        Se accetti dal banner, attiviamo Google Analytics e la misurazione delle conversioni di Google Ads. Servono a
        capire quali pagine e quali annunci portano richieste di preventivo. Se rifiuti non vengono attivati.
      </p>

      <h2>Come cambiare idea</h2>
      <p>
        Puoi cancellare i dati del sito dalle impostazioni del browser. Alla visita successiva il banner ricompare e
        puoi scegliere di nuovo.
      </p>
    </div>
  );
}
