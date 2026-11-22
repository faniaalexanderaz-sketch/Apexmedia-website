"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ApexMark } from "@/components/ui/Logo";
import { AGENTE } from "@/lib/studio/agenti";
import { euro, nomeCliente, scaduta } from "@/lib/studio/calcoli";
import type { Campagna, Cliente, Dati, Fattura, Risposta, Servizio } from "@/lib/studio/tipi";
import { Conti } from "./Conti";
import { Lavori } from "./Lavori";
import { Moduli } from "./Moduli";
import { Ufficio } from "./Ufficio";

/* =============================================================
   Guscio dello Studio: stato dei dati, schede, moduli e avvisi.
   Ogni modifica passa da `azione`, che salva e riceve i dati aggiornati.
   ============================================================= */

export type Scheda = "ufficio" | "conti" | "lavori";
export type Modale =
  | { tipo: "cliente"; cliente?: Cliente }
  | { tipo: "servizio"; clienteId?: number; servizio?: Servizio }
  | { tipo: "fattura"; clienteId?: number; fattura?: Fattura }
  | { tipo: "campagna"; clienteId?: number; campagna?: Campagna }
  | { tipo: "lavoro"; agente?: string; clienteId?: number }
  | { tipo: "risultato"; lavoroId: number }
  | { tipo: "obiettivo" };

type Avviso = { testo: string; tono: "ok" | "errore" | "soldi" };

type Contesto = {
  dati: Dati;
  scheda: Scheda;
  vai: (s: Scheda) => void;
  azione: (tipo: string, campi?: Record<string, unknown>) => Promise<Risposta>;
  /** crea un lavoro e, se gli agenti sono collegati, lo fa partire */
  nuovoLavoro: (campi: { agente?: string; clienteId?: number | null; brief: string; titolo?: string }) => Promise<boolean>;
  faiLavorare: (id: number) => Promise<void>;
  incassa: (f: Fattura) => Promise<void>;
  apri: (m: Modale | null) => void;
  avvisa: (testo: string, tono?: Avviso["tono"]) => void;
};

const Ctx = createContext<Contesto | null>(null);
export function useStudio(): Contesto {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStudio fuori dallo Studio");
  return c;
}

const SCHEDE: { id: Scheda; nome: string }[] = [{ id: "ufficio", nome: "Ufficio" }, { id: "conti", nome: "Conti" }, { id: "lavori", nome: "Lavori" }];

export function StudioApp({ iniziali }: { iniziali: Dati }) {
  const [dati, setDati] = useState(iniziali);
  const [scheda, setScheda] = useState<Scheda>("ufficio");
  const [modale, setModale] = useState<Modale | null>(null);
  const [avviso, setAvviso] = useState<Avviso | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const avvisa = useCallback((testo: string, tono: Avviso["tono"] = "ok") => {
    setAvviso({ testo, tono });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAvviso(null), tono === "errore" ? 6500 : 3800);
  }, []);

  const chiama = useCallback(async (url: string, corpo: Record<string, unknown>): Promise<Risposta> => {
    try {
      const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(corpo) });
      if (r.status === 401) { window.location.reload(); return { ok: false, errore: "Sessione scaduta." }; }
      const j = (await r.json()) as Risposta;
      if (j.ok) setDati(j.dati);
      return j;
    } catch {
      return { ok: false, errore: "Connessione assente. Riprova." };
    }
  }, []);

  const azione = useCallback(async (tipo: string, campi: Record<string, unknown> = {}) => {
    const j = await chiama("/api/studio/azione", { tipo, ...campi });
    if (!j.ok && tipo !== "aggiorna") avvisa(j.errore, "errore");
    return j;
  }, [chiama, avvisa]);

  const faiLavorare = useCallback(async (id: number) => {
    // l'agente si mette al lavoro subito sullo schermo, la consegna arriva quando ha finito
    setDati((d) => ({ ...d, lavori: d.lavori.map((l) => (l.id === id ? { ...l, stato: "in_lavorazione", aggiornatoIl: new Date().toISOString() } : l)) }));
    const j = await chiama("/api/studio/agente", { id });
    if (j.ok) {
      const l = j.dati.lavori.find((x) => x.id === id);
      if (l?.stato === "da_guardare") avvisa(`${AGENTE[l.agente]?.nome ?? "L'agente"} ha consegnato: ${l.titolo}`);
    } else {
      avvisa(j.errore, "errore");
      void chiama("/api/studio/azione", { tipo: "aggiorna" });
    }
  }, [chiama, avvisa]);

  const nuovoLavoro = useCallback<Contesto["nuovoLavoro"]>(async (campi) => {
    const j = await azione("lavoro.crea", campi);
    if (!j.ok) return false;
    const l = j.dati.lavori.find((x) => x.id === j.nuovoId);
    const nome = l ? AGENTE[l.agente]?.nome : null;
    if (j.dati.ai && j.nuovoId) { avvisa(`${nome ?? "L'agente"} si è messo al lavoro.`); void faiLavorare(j.nuovoId); }
    else avvisa(`Lavoro affidato a ${nome ?? "un agente"}: è in coda.`);
    return true;
  }, [azione, avvisa, faiLavorare]);

  const incassa = useCallback(async (f: Fattura) => {
    const j = await azione("fattura.paga", { id: f.id, pagata: true });
    if (j.ok) avvisa(`+ ${euro(f.importo)} incassati da ${nomeCliente(j.dati.clienti, f.clienteId)}`, "soldi");
  }, [azione, avvisa]);

  // scheda nell'indirizzo (#conti) così il ricarica non riporta all'ufficio
  useEffect(() => {
    const leggi = () => { const h = window.location.hash.slice(1) as Scheda; if (SCHEDE.some((s) => s.id === h)) setScheda(h); };
    leggi();
    window.addEventListener("hashchange", leggi);
    return () => window.removeEventListener("hashchange", leggi);
  }, []);
  const vai = useCallback((s: Scheda) => { setScheda(s); window.history.replaceState(null, "", s === "ufficio" ? window.location.pathname : `#${s}`); }, []);

  // aggiornamento silenzioso: ogni 45 secondi e quando si torna sulla scheda del browser
  useEffect(() => {
    const aggiorna = () => { if (document.visibilityState === "visible") void chiama("/api/studio/azione", { tipo: "aggiorna" }); };
    const t = setInterval(aggiorna, 45_000);
    document.addEventListener("visibilitychange", aggiorna);
    return () => { clearInterval(t); document.removeEventListener("visibilitychange", aggiorna); };
  }, [chiama]);

  const toccaATe = useMemo(() => dati.lavori.filter((l) => l.stato === "da_guardare").length + dati.fatture.filter((f) => scaduta(f, dati.oggi)).length, [dati]);
  const valore = useMemo<Contesto>(() => ({ dati, scheda, vai, azione, nuovoLavoro, faiLavorare, incassa, apri: setModale, avvisa }), [dati, scheda, vai, azione, nuovoLavoro, faiLavorare, incassa, avvisa]);

  return (
    <Ctx.Provider value={valore}>
      <div className="st-app" data-scheda={scheda}>
        <header className="st-barra">
          <a className="st-marchio" href="/studio" aria-label="Apex Studio"><ApexMark size={22} /><b>APEX<i> STUDIO</i></b></a>
          <nav className="st-schede" aria-label="Sezioni">
            {SCHEDE.map((s) => (
              <button key={s.id} type="button" aria-current={scheda === s.id ? "page" : undefined} onClick={() => vai(s.id)}>
                {s.nome}{s.id === "ufficio" && toccaATe > 0 ? <span className="st-conta" aria-label={`${toccaATe} cose ti aspettano`}>{toccaATe}</span> : null}
              </button>
            ))}
          </nav>
          <div className="st-barra-azioni">
            <button type="button" className="st-btn st-btn-pieno" onClick={() => setModale({ tipo: "lavoro" })}><span aria-hidden="true">+</span> Nuovo lavoro</button>
            <form method="post" action="/api/studio/logout"><button className="st-btn st-btn-testo" title="Esci dallo studio">Esci</button></form>
          </div>
        </header>

        {dati.demo ? <p className="st-demo" role="note"><b>Modalità demo.</b> Nessun database collegato: clienti e importi sono di esempio e le modifiche spariscono al riavvio.</p> : null}

        <main className="st-corpo">
          {/* l'ufficio resta montato anche nelle altre schede: la scena non si ricarica e la telecamera resta dov'era */}
          <div className="st-strato" data-nascosto={scheda !== "ufficio" || undefined} aria-hidden={scheda !== "ufficio"}><Ufficio attivo={scheda === "ufficio"} /></div>
          {scheda === "conti" ? <Conti /> : scheda === "lavori" ? <Lavori /> : null}
        </main>

        {modale ? <Moduli modale={modale} chiudi={() => setModale(null)} /> : null}
        <div className="st-avvisi" aria-live="polite">{avviso ? <p className={`st-avviso st-avviso-${avviso.tono}`}>{avviso.testo}</p> : null}</div>
      </div>
    </Ctx.Provider>
  );
}
