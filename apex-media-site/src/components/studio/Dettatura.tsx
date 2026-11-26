"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/* =============================================================
   Dettatura: parli e il testo si scrive da solo nel campo.
   Usa il riconoscimento vocale del browser (Chrome, Edge, Safari
   su iPhone e Mac), in italiano. Dove non c'è, il bottone non
   compare e resta il microfono della tastiera del telefono.
   ============================================================= */

type Risultato = { isFinal: boolean; 0: { transcript: string } };
type EventoVoce = { resultIndex: number; results: ArrayLike<Risultato> };
type Riconoscimento = {
  lang: string; continuous: boolean; interimResults: boolean;
  onresult: ((e: EventoVoce) => void) | null; onend: (() => void) | null; onerror: ((e: { error: string }) => void) | null;
  start: () => void; stop: () => void; abort: () => void;
};
type Costruttore = new () => Riconoscimento;

function costruttore(): Costruttore | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: Costruttore; webkitSpeechRecognition?: Costruttore };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}
const iscrivi = () => () => {};
/** true se il browser sa trascrivere la voce. */
export function useVoceDisponibile(): boolean {
  return useSyncExternalStore(iscrivi, () => costruttore() !== null, () => false);
}

/** Bottone col microfono: tocchi, parli, il testo si aggiunge a quello che c'è già. Ritocchi per fermare. */
export function Microfono({ testo, setTesto, onErrore, grande }: { testo: string; setTesto: (t: string) => void; onErrore?: (m: string) => void; grande?: boolean }) {
  const disponibile = useVoceDisponibile();
  const [attivo, setAttivo] = useState(false);
  const rec = useRef<Riconoscimento | null>(null);
  const base = useRef("");
  const ultimo = useRef({ testo, setTesto, onErrore });
  useEffect(() => { ultimo.current = { testo, setTesto, onErrore }; });
  useEffect(() => () => rec.current?.abort(), []);
  if (!disponibile) return null;

  const ferma = () => { rec.current?.stop(); };
  const parti = () => {
    const C = costruttore();
    if (!C) return;
    const r = new C();
    r.lang = "it-IT"; r.continuous = true; r.interimResults = true;
    const prima = ultimo.current.testo.trim();
    base.current = prima ? `${prima} ` : "";
    let fermo = "";
    r.onresult = (e) => {
      let provvisorio = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) fermo += t.trim() ? `${t.trim()} ` : ""; else provvisorio += t;
      }
      const tutto = `${base.current}${fermo}${provvisorio}`.replace(/\s+/g, " ");
      // prima lettera maiuscola, come quando scrivi tu
      ultimo.current.setTesto(tutto.charAt(0).toUpperCase() + tutto.slice(1));
    };
    r.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") ultimo.current.onErrore?.("Il browser non mi lascia usare il microfono: consentilo nelle impostazioni del sito e riprova.");
      else if (e.error !== "no-speech" && e.error !== "aborted") ultimo.current.onErrore?.("Non ti ho sentito bene: riprova o scrivi.");
    };
    r.onend = () => { setAttivo(false); rec.current = null; ultimo.current.setTesto(ultimo.current.testo.trim()); };
    try { r.start(); rec.current = r; setAttivo(true); } catch { setAttivo(false); }
  };

  return (
    <button type="button" className={`st-mic${grande ? " st-mic-grande" : ""}`} data-attivo={attivo || undefined} onClick={attivo ? ferma : parti}
      aria-pressed={attivo} aria-label={attivo ? "Ferma la dettatura" : "Detta con la voce"} title={attivo ? "Sto ascoltando: tocca per fermare" : "Parla: lo scrivo io"}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15a3.5 3.5 0 0 0 3.5-3.5v-5a3.5 3.5 0 1 0-7 0v5A3.5 3.5 0 0 0 12 15z" fill="currentColor" /><path d="M6 11.5a6 6 0 0 0 12 0M12 17.5V21M8.5 21h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" /></svg>
      {grande ? <span>{attivo ? "Ti ascolto… tocca per fermare" : "Parla"}</span> : null}
    </button>
  );
}
