"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { sito } from "@/content/sito";
import { CHIAVI_UTM, COMUNI_FORM, FASCE_MQ, SERVIZI_FORM, emailValida, telefonoValido } from "@/lib/lead";

type Chiave = (typeof SERVIZI_FORM)[number]["valore"];
const PASSI = ["Servizio", "Luogo e metri", "Contatti"];

/** Legge gli UTM dall'indirizzo e li tiene per tutta la visita (es. QR del biglietto da visita). */
function leggiUtm(): Record<string, string> {
  const utm: Record<string, string> = {};
  try {
    const p = new URLSearchParams(window.location.search);
    for (const k of CHIAVI_UTM) {
      const v = p.get(k);
      if (v) utm[k] = v;
    }
    if (Object.keys(utm).length) sessionStorage.setItem("sc_utm", JSON.stringify(utm));
    else return JSON.parse(sessionStorage.getItem("sc_utm") ?? "{}");
  } catch {}
  return utm;
}

export function FormPreventivo({ servizioIniziale, leggiServizioDaUrl = false }: { servizioIniziale?: Chiave; leggiServizioDaUrl?: boolean }) {
  const router = useRouter();
  const [passo, setPasso] = useState(servizioIniziale ? 2 : 1);
  const [servizio, setServizio] = useState<Chiave | "">(servizioIniziale ?? "");
  const [comune, setComune] = useState("");
  const [altroComune, setAltroComune] = useState("");
  const [mq, setMq] = useState("");
  const [nome, setNome] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [consenso, setConsenso] = useState(false);
  const [trappola, setTrappola] = useState("");
  const [errori, setErrori] = useState<Record<string, string>>({});
  const [invio, setInvio] = useState(false);
  const [erroreInvio, setErroreInvio] = useState("");
  const utm = useRef<Record<string, string>>({});
  const titolo = useRef<HTMLHeadingElement>(null);
  const primoRender = useRef(true);

  useEffect(() => {
    utm.current = leggiUtm();
    // /preventivo?servizio=civili arriva dai bottoni delle pagine servizio
    if (leggiServizioDaUrl) {
      const s = new URLSearchParams(window.location.search).get("servizio");
      const trovato = SERVIZI_FORM.find((x) => x.valore === s)?.valore;
      if (trovato) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- il parametro si legge solo nel browser
        setServizio(trovato);
        setPasso(2);
      }
    }
  }, [leggiServizioDaUrl]);

  // A ogni cambio passo il fuoco va sul titolo: chi usa tastiera o lettore di schermo non si perde.
  useEffect(() => {
    if (primoRender.current) {
      primoRender.current = false;
      return;
    }
    titolo.current?.focus({ preventScroll: true });
    titolo.current?.closest("[data-form]")?.scrollIntoView({ block: "nearest" });
  }, [passo]);

  const comuneFinale = comune === "Altro comune" ? altroComune.trim() : comune;
  const passo2Ok = Boolean(comuneFinale.length >= 2 && mq);

  async function invia(e: React.FormEvent) {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (nome.trim().length < 2) err.nome = "Scrivi il tuo nome.";
    if (!telefonoValido(telefono)) err.telefono = "Controlla il numero, servono almeno 8 cifre.";
    if (email.trim() && !emailValida(email.trim())) err.email = "Questo indirizzo non sembra corretto.";
    if (!consenso) err.consenso = "Senza consenso non possiamo richiamarti.";
    setErrori(err);
    if (Object.keys(err).length) return;

    setInvio(true);
    setErroreInvio("");
    try {
      const r = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          servizio, comune: comuneFinale, mq, nome, telefono, email, consenso,
          pagina: window.location.pathname, utm: utm.current, sito_web: trappola,
        }),
      });
      if (!r.ok) throw new Error((await r.json().catch(() => null))?.errore ?? "");
      // /grazie fa scattare la conversione solo se trova questo segno: un ricaricamento non conta doppio.
      sessionStorage.setItem("sc_lead", servizio);
      router.push("/grazie");
    } catch (e) {
      setErroreInvio((e as Error).message || "Invio non riuscito. Riprova oppure chiamaci.");
      setInvio(false);
    }
  }

  return (
    <div data-form className="border-linea rounded-ui scroll-mt-24 border bg-white p-4 sm:p-6 md:p-10">
      {/* avanzamento */}
      <div className="mb-6 md:mb-10">
        <p className="text-[0.8125rem] font-bold tracking-[0.12em] uppercase" aria-live="polite">
          Passo {passo} di 3 <span className="testo-2 ml-2 tracking-normal normal-case">{PASSI[passo - 1]}</span>
        </p>
        <div className="mt-2 grid grid-cols-3 gap-2" aria-hidden>
          {[1, 2, 3].map((n) => (
            <span key={n} className={`h-[4px] ${n <= passo ? "bg-turchese" : "bg-petrolio/15"}`} />
          ))}
        </div>
      </div>

      <form onSubmit={invia} noValidate>
        {passo === 1 && (
          <div className="passo">
            <h3 ref={titolo} tabIndex={-1} className="titolo-3 outline-none">Cosa c&apos;è da pulire?</h3>
            <div className="mt-6 grid gap-2">
              {SERVIZI_FORM.map((s) => (
                <button
                  key={s.valore}
                  type="button"
                  aria-pressed={servizio === s.valore}
                  onClick={() => {
                    setServizio(s.valore);
                    setPasso(2);
                  }}
                  className="scelta min-h-[76px] justify-between gap-4"
                >
                  <span>
                    <span className="block text-[1.0625rem]">{s.nome}</span>
                    <span className="mt-1 block text-[0.875rem] font-medium opacity-75">{s.riga}</span>
                  </span>
                  <svg aria-hidden width="18" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M0 7h16M10 1l6 6-6 6" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}

        {passo === 2 && (
          <div className="passo">
            <h3 ref={titolo} tabIndex={-1} className="titolo-3 outline-none">Dove e quanto è grande?</h3>

            <fieldset className="mt-6">
              <legend className="mb-2 text-[0.9375rem] font-bold">Comune</legend>
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Comune">
                {COMUNI_FORM.map((c) => (
                  <button key={c} type="button" role="radio" aria-checked={comune === c} onClick={() => setComune(c)} className="scelta text-[0.9375rem]">
                    {c}
                  </button>
                ))}
              </div>
              {comune === "Altro comune" && (
                <div className="mt-2">
                  <label htmlFor="altro-comune" className="sr-only">Quale comune</label>
                  <input
                    id="altro-comune"
                    className="campo"
                    placeholder="Scrivi il comune"
                    autoComplete="address-level2"
                    value={altroComune}
                    onChange={(e) => setAltroComune(e.target.value)}
                    autoFocus
                  />
                </div>
              )}
            </fieldset>

            <fieldset className="mt-6">
              <legend className="mb-2 text-[0.9375rem] font-bold">Metri quadri, a occhio</legend>
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Metri quadri">
                {FASCE_MQ.map((f) => (
                  <button key={f} type="button" role="radio" aria-checked={mq === f} onClick={() => setMq(f)} className="scelta text-[0.9375rem]">
                    {f}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="mt-10 flex items-center justify-between gap-4">
              <button type="button" onClick={() => setPasso(1)} className="collegamento min-h-[44px]">Indietro</button>
              <button type="button" disabled={!passo2Ok} onClick={() => setPasso(3)} className="btn btn-giallo min-w-[160px]">Avanti</button>
            </div>
          </div>
        )}

        {passo === 3 && (
          <div className="passo">
            <h3 ref={titolo} tabIndex={-1} className="titolo-3 outline-none">A chi mandiamo il preventivo?</h3>

            <div className="mt-6 grid gap-4">
              <div>
                <label htmlFor="nome" className="mb-2 block text-[0.9375rem] font-bold">Nome</label>
                <input id="nome" className="campo" autoComplete="name" value={nome} onChange={(e) => setNome(e.target.value)}
                  aria-invalid={Boolean(errori.nome)} aria-describedby={errori.nome ? "err-nome" : undefined} />
                {errori.nome && <p id="err-nome" className="text-errore mt-1 text-[0.875rem] font-bold">{errori.nome}</p>}
              </div>
              <div>
                <label htmlFor="telefono" className="mb-2 block text-[0.9375rem] font-bold">Telefono</label>
                <input id="telefono" type="tel" inputMode="tel" className="campo" autoComplete="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)}
                  aria-invalid={Boolean(errori.telefono)} aria-describedby={errori.telefono ? "err-telefono" : undefined} />
                {errori.telefono && <p id="err-telefono" className="text-errore mt-1 text-[0.875rem] font-bold">{errori.telefono}</p>}
              </div>
              <div>
                <label htmlFor="email" className="mb-2 block text-[0.9375rem] font-bold">
                  Email <span className="testo-2 font-medium">(facoltativa)</span>
                </label>
                <input id="email" type="email" inputMode="email" className="campo" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={Boolean(errori.email)} aria-describedby={errori.email ? "err-email" : undefined} />
                {errori.email && <p id="err-email" className="text-errore mt-1 text-[0.875rem] font-bold">{errori.email}</p>}
              </div>

              {/* campo trappola per i bot: invisibile e fuori dalla tabulazione */}
              <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label>Sito web<input tabIndex={-1} autoComplete="off" value={trappola} onChange={(e) => setTrappola(e.target.value)} /></label>
              </div>

              <div>
                <label className="flex cursor-pointer items-start gap-4 text-[0.9375rem] leading-snug">
                  <input type="checkbox" checked={consenso} onChange={(e) => setConsenso(e.target.checked)}
                    className="accent-petrolio mt-[2px] h-6 w-6 shrink-0" aria-invalid={Boolean(errori.consenso)} />
                  <span>
                    Acconsento al trattamento dei dati per ricevere il preventivo, come descritto nella{" "}
                    <Link href="/privacy" target="_blank" className="underline underline-offset-4">privacy policy</Link>.
                  </span>
                </label>
                {errori.consenso && <p className="text-errore mt-1 text-[0.875rem] font-bold">{errori.consenso}</p>}
              </div>
            </div>

            {erroreInvio && (
              <p role="alert" className="border-errore text-errore mt-6 border-l-2 pl-4 text-[0.9375rem] font-bold">
                {erroreInvio} <a href={sito.telefono.href} className="underline">{sito.telefono.mostrato}</a>
              </p>
            )}

            <div className="mt-10 flex items-center justify-between gap-4">
              <button type="button" onClick={() => setPasso(2)} className="collegamento min-h-[44px]">Indietro</button>
              <button type="submit" disabled={invio} className="btn btn-giallo min-w-[160px]">
                {invio ? "Invio in corso" : "Invia richiesta"}
              </button>
            </div>
            <p className="testo-2 mt-4 text-[0.875rem]">Ti rispondiamo entro {sito.oreRisposta} ore. Nessun impegno.</p>
          </div>
        )}
      </form>
    </div>
  );
}
