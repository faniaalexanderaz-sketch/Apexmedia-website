"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { ApexMark } from "@/components/ui/Logo";
import { AGENTE } from "@/lib/studio/agenti";
import { euro, nomeCliente } from "@/lib/studio/calcoli";
import type { Campagna, Cliente, Dati, Fattura, Risposta, Servizio } from "@/lib/studio/tipi";
import { Conti } from "./Conti";
import { Lavori } from "./Lavori";
import { Moduli } from "./Moduli";
import { Ufficio } from "./Ufficio";
import { Notifiche } from "./Notifiche";
import { briefSollecito, promemoria as calcolaPromemoria, type Promemoria } from "@/lib/studio/promemoria";

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
  | { tipo: "obiettivo" }
  | { tipo: "svuota" };

type Avviso = { testo: string; tono: "ok" | "errore" | "soldi" };

type Contesto = {
  dati: Dati;
  scheda: Scheda;
  vai: (s: Scheda) => void;
  azione: (tipo: string, campi?: Record<string, unknown>) => Promise<Risposta>;
  /** crea un lavoro e, se gli agenti sono collegati, lo fa partire */
  nuovoLavoro: (campi: { agente?: string; clienteId?: number | null; brief: string; titolo?: string; scadenza?: string | null }) => Promise<boolean>;
  faiLavorare: (id: number) => Promise<void>;
  incassa: (f: Fattura) => Promise<void>;
  apri: (m: Modale | null) => void;
  avvisa: (testo: string, tono?: Avviso["tono"]) => void;
  /** le cose che il team deve ricordarti, già senza quelle rimandate */
  promemoria: Promemoria[];
  esegui: (p: Promemoria) => Promise<void>;
  rimanda: (p: Promemoria) => void;
};

const CHIAVE_RIMANDATI = "apex-studio-rimandati", EVENTO_RIMANDATI = "apex-studio-rimandati";
function leggiRimandatiGrezzi(): string {
  try { return localStorage.getItem(CHIAVE_RIMANDATI) ?? "{}"; } catch { return "{}"; }
}
function ascoltaRimandati(avvisa: () => void): () => void {
  window.addEventListener(EVENTO_RIMANDATI, avvisa);
  window.addEventListener("storage", avvisa);
  return () => { window.removeEventListener(EVENTO_RIMANDATI, avvisa); window.removeEventListener("storage", avvisa); };
}

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

  // su iPhone Safari ignora il blocco dello zoom: fermiamo noi il pizzico sulla pagina.
  // Dentro la scena 3D le dita restano libere (zoom e giro le gestisce la telecamera).
  useEffect(() => {
    const ferma = (e: Event) => e.preventDefault();
    const dita = (e: TouchEvent) => { if (e.touches.length > 1 && !(e.target as Element | null)?.closest?.("canvas")) e.preventDefault(); };
    let ultimo = 0;
    const doppio = (e: TouchEvent) => { const ora = Date.now(); if (ora - ultimo < 320 && !(e.target as Element | null)?.closest?.("input, textarea, select")) e.preventDefault(); ultimo = ora; };
    document.addEventListener("gesturestart", ferma);
    document.addEventListener("gesturechange", ferma);
    document.addEventListener("touchmove", dita, { passive: false });
    document.addEventListener("touchend", doppio, { passive: false });
    return () => {
      document.removeEventListener("gesturestart", ferma);
      document.removeEventListener("gesturechange", ferma);
      document.removeEventListener("touchmove", dita);
      document.removeEventListener("touchend", doppio);
    };
  }, []);

  // aggiornamento silenzioso: ogni 45 secondi e quando si torna sulla scheda del browser
  useEffect(() => {
    const aggiorna = () => { if (document.visibilityState === "visible") void chiama("/api/studio/azione", { tipo: "aggiorna" }); };
    const t = setInterval(aggiorna, 45_000);
    document.addEventListener("visibilitychange", aggiorna);
    return () => { clearInterval(t); document.removeEventListener("visibilitychange", aggiorna); };
  }, [chiama]);

  // promemoria: "Più tardi" li nasconde fino a domani, solo su questo dispositivo
  const rimandatiGrezzi = useSyncExternalStore(ascoltaRimandati, leggiRimandatiGrezzi, () => "{}");
  const rimandati = useMemo(() => { try { return JSON.parse(rimandatiGrezzi) as Record<string, string>; } catch { return {}; } }, [rimandatiGrezzi]);
  const rimanda = useCallback((p: Promemoria) => {
    const r: Record<string, string> = {};
    for (const [k, v] of Object.entries(rimandati)) if (v >= dati.oggi) r[k] = v;
    r[p.id] = dati.oggi;
    try { localStorage.setItem(CHIAVE_RIMANDATI, JSON.stringify(r)); } catch { /* memoria del browser non disponibile */ }
    window.dispatchEvent(new Event(EVENTO_RIMANDATI));
  }, [rimandati, dati.oggi]);
  // nascosto finché la data salvata è oggi: domani torna
  const lista = useMemo(() => calcolaPromemoria(dati).filter((p) => !(rimandati[p.id] && rimandati[p.id] >= dati.oggi)), [dati, rimandati]);

  const esegui = useCallback(async (p: Promemoria) => {
    const a = p.azione;
    if (a.tipo === "risultato") setModale({ tipo: "risultato", lavoroId: a.lavoroId });
    else if (a.tipo === "campagna") setModale({ tipo: "campagna", clienteId: a.clienteId });
    else if (a.tipo === "incassa") { const f = dati.fatture.find((x) => x.id === a.fatturaId); if (f) await incassa(f); }
    else if (a.tipo === "fatture") { const r = await azione("fatture.genera", { mese: dati.oggi.slice(0, 7) }); if (r.ok) avvisa("Fatture del mese create: le trovi in Conti, da incassare."); }
    else if (a.tipo === "sollecito") { const b = briefSollecito(dati, a.fatturaId); if (b) await nuovoLavoro({ agente: "sara", ...b }); }
    else if (a.tipo === "prepara") {
      const r = await azione("mese.prepara", { clienteId: a.clienteId });
      if (r.ok) avvisa(r.nuovoId ? `Mese preparato: ${r.nuovoId} lavori affidati al team.` : "Il mese era già preparato.");
    }
  }, [dati, azione, avvisa, incassa, nuovoLavoro]);

  const valore = useMemo<Contesto>(() => ({ dati, scheda, vai, azione, nuovoLavoro, faiLavorare, incassa, apri: setModale, avvisa, promemoria: lista, esegui, rimanda }), [dati, scheda, vai, azione, nuovoLavoro, faiLavorare, incassa, avvisa, lista, esegui, rimanda]);
  const [campanella, setCampanella] = useState(false);

  return (
    <Ctx.Provider value={valore}>
      <div className="st-app" data-scheda={scheda}>
        <header className="st-barra">
          <a className="st-marchio" href="/studio" aria-label="Apex Studio"><ApexMark size={22} /><b>APEX<i> STUDIO</i></b></a>
          <nav className="st-schede" aria-label="Sezioni">
            {SCHEDE.map((s) => (
              <button key={s.id} type="button" aria-current={scheda === s.id ? "page" : undefined} onClick={() => vai(s.id)}>
                {s.nome}{s.id === "lavori" && dati.lavori.some((l) => l.stato === "da_guardare") ? <span className="st-conta">{dati.lavori.filter((l) => l.stato === "da_guardare").length}</span> : null}
              </button>
            ))}
          </nav>
          <div className="st-barra-azioni">
            <button type="button" className="st-campanella" aria-expanded={campanella} aria-label={`Promemoria: ${lista.length}`} onClick={() => setCampanella((v) => !v)}>
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 3a6 6 0 0 0-6 6v3.6l-1.6 2.7A1 1 0 0 0 5.3 17h13.4a1 1 0 0 0 .9-1.7L18 12.6V9a6 6 0 0 0-6-6Zm-2.5 15.5a2.5 2.5 0 0 0 5 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              {lista.length ? <span className="st-conta">{lista.length > 9 ? "9+" : lista.length}</span> : null}
            </button>
            <button type="button" className="st-btn st-btn-pieno" onClick={() => setModale({ tipo: "lavoro" })}><span aria-hidden="true">+</span> Nuovo lavoro</button>
            <form method="post" action="/api/studio/logout"><button className="st-btn st-btn-testo" title="Esci dallo studio">Esci</button></form>
          </div>
        </header>

        {dati.demo ? <p className="st-demo" role="note"><b>Modalità demo.</b> Nessun database collegato: clienti e importi sono di esempio e le modifiche spariscono al riavvio. <button type="button" className="st-link" onClick={() => setModale({ tipo: "svuota" })}>Cancella i dati di esempio</button></p> : null}
        {campanella ? <Notifiche chiudi={() => setCampanella(false)} /> : null}

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
