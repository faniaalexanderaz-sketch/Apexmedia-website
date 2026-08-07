"use client";

import { useState, type FormEvent } from "react";
import { IconArrowRight, IconCheck } from "./icons";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-[15px] text-white placeholder:text-white/30 outline-none transition-colors focus:border-yellow/70 focus:bg-white/[0.06]";
const labelClass = "mb-1.5 block text-[13px] font-semibold text-white/60";
const selectClass = `${inputClass} appearance-none bg-[right_1rem_center] bg-no-repeat pr-10`;

const CHEVRON =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ffffff88' stroke-width='2'><path d='M6 9l6 6 6-6'/></svg>";

const CAMPI_INIZIALI = {
  nome: "",
  telefono: "",
  email: "",
  nomeAttivita: "",
  haSito: "",
  settore: "",
  budget: "",
  sito_web: "", // honeypot: se compilato, la richiesta viene ignorata come spam
};

type Stato = "idle" | "invio" | "successo" | "errore";

export function LeadForm() {
  const [campi, setCampi] = useState(CAMPI_INIZIALI);
  const [stato, setStato] = useState<Stato>("idle");
  const [messaggioErrore, setMessaggioErrore] = useState("");

  function aggiorna<K extends keyof typeof CAMPI_INIZIALI>(campo: K, valore: string) {
    setCampi((prev) => ({ ...prev, [campo]: valore }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStato("invio");
    setMessaggioErrore("");

    try {
      const risposta = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(campi),
      });
      const dati = await risposta.json();

      if (!risposta.ok || !dati.ok) {
        setStato("errore");
        setMessaggioErrore(dati.errore || "Qualcosa è andato storto. Riprova.");
        return;
      }

      setStato("successo");
    } catch {
      setStato("errore");
      setMessaggioErrore("Connessione non riuscita. Controlla la rete e riprova.");
    }
  }

  if (stato === "successo") {
    return (
      <div className="glass-card mx-auto max-w-[560px] rounded-2xl p-8 text-center sm:p-10">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-yellow/15">
          <IconCheck className="h-6 w-6 text-yellow" />
        </span>
        <h3 className="mt-5 font-display text-xl font-bold text-white sm:text-2xl">
          Richiesta ricevuta.
        </h3>
        <p className="mt-2 text-[15px] text-white/60">
          Ti ricontattiamo entro 24 ore all&apos;email o al numero che ci hai lasciato.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card mx-auto max-w-[560px] rounded-2xl p-6 sm:p-9" noValidate>
      <input
        type="text"
        name="sito_web"
        value={campi.sito_web}
        onChange={(e) => aggiorna("sito_web", e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="pointer-events-none absolute h-0 w-0 opacity-0"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="nome">
            Nome
          </label>
          <input
            id="nome"
            required
            className={inputClass}
            placeholder="Mario Rossi"
            value={campi.nome}
            onChange={(e) => aggiorna("nome", e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="telefono">
            Telefono
          </label>
          <input
            id="telefono"
            type="tel"
            required
            className={inputClass}
            placeholder="333 1234567"
            value={campi.telefono}
            onChange={(e) => aggiorna("telefono", e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            className={inputClass}
            placeholder="mario@attivita.it"
            value={campi.email}
            onChange={(e) => aggiorna("email", e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="nomeAttivita">
            Nome attività
          </label>
          <input
            id="nomeAttivita"
            required
            className={inputClass}
            placeholder="Es. Ristorante da Mario"
            value={campi.nomeAttivita}
            onChange={(e) => aggiorna("nomeAttivita", e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="haSito">
            Hai già un sito web?
          </label>
          <select
            id="haSito"
            required
            className={selectClass}
            style={{ backgroundImage: `url("${CHEVRON}")` }}
            value={campi.haSito}
            onChange={(e) => aggiorna("haSito", e.target.value)}
          >
            <option value="" disabled>
              Seleziona
            </option>
            <option value="si">Sì, ho già un sito</option>
            <option value="non_funziona">Sì, ma non funziona bene</option>
            <option value="no">No, non ho un sito</option>
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="settore">
            Che tipo di attività?
          </label>
          <select
            id="settore"
            required
            className={selectClass}
            style={{ backgroundImage: `url("${CHEVRON}")` }}
            value={campi.settore}
            onChange={(e) => aggiorna("settore", e.target.value)}
          >
            <option value="" disabled>
              Seleziona
            </option>
            <option value="ristorazione">Ristorazione</option>
            <option value="retail">Retail / negozio</option>
            <option value="servizi">Servizi</option>
            <option value="benessere">Benessere</option>
            <option value="altro">Altro</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="budget">
            Budget mensile indicativo per il marketing
          </label>
          <select
            id="budget"
            required
            className={selectClass}
            style={{ backgroundImage: `url("${CHEVRON}")` }}
            value={campi.budget}
            onChange={(e) => aggiorna("budget", e.target.value)}
          >
            <option value="" disabled>
              Seleziona
            </option>
            <option value="under300">Meno di 300€</option>
            <option value="300-800">300€ – 800€</option>
            <option value="800-1500">800€ – 1.500€</option>
            <option value="over1500">Più di 1.500€</option>
            <option value="non_so">Non so</option>
          </select>
        </div>
      </div>

      {stato === "errore" && (
        <p role="alert" className="mt-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {messaggioErrore}
        </p>
      )}

      <button
        type="submit"
        disabled={stato === "invio"}
        className="cta-yellow group mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-base font-bold tracking-tight transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {stato === "invio" ? "Invio in corso…" : "Richiedi il mio audit gratuito"}
        {stato !== "invio" && (
          <IconArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        )}
      </button>

      <p className="mt-4 text-center text-xs text-white/35">
        I tuoi dati servono solo per ricontattarti. Nessuno spam.
      </p>
    </form>
  );
}
